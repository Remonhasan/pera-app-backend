<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Api\Concerns\AuthorizesApiAccess;
use App\Http\Controllers\Api\Concerns\NormalizesUploadedFiles;
use App\Http\Controllers\Controller;
use App\Http\Requests\StoreExamRequest;
use App\Http\Requests\UpdateExamRequest;
use App\Http\Traits\ApiResponseTrait;
use App\Models\Exam;
use App\Services\ExamService;
use App\Services\JobTypeService;
use App\Support\ApiUserContext;
use App\Support\ReportFormatter;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ExamController extends Controller
{
    use ApiResponseTrait;
    use AuthorizesApiAccess;
    use NormalizesUploadedFiles;

    public function __construct(
        private readonly ExamService $examService,
        private readonly JobTypeService $jobTypeService,
    ) {}

    public function index(): JsonResponse
    {
        $this->authorizeApiPermission('exam_list');

        return $this->successResponse([
            'exams' => $this->examService->listExams(),
            'jobTypes' => $this->jobTypeService->jobTypeOptions(),
        ], 'Exam list retrieved successfully.');
    }

    public function store(StoreExamRequest $request): JsonResponse
    {
        $this->authorizeApiPermission('exam_create');

        $validated = $request->validated();
        unset($validated['application_file'], $validated['admit_card_file'], $validated['images']);

        $exam = $this->examService->createExam(
            $validated,
            $this->normalizeUploadedFile($request->file('application_file')),
            $this->normalizeUploadedFile($request->file('admit_card_file')),
            $this->normalizeUploadedFiles($request->file('images')),
            ApiUserContext::actorId(),
        );

        if (! $exam) {
            return $this->errorResponse('Failed to create exam.', 422);
        }

        return $this->successResponse($exam, 'Exam created successfully.', 201);
    }

    public function update(UpdateExamRequest $request, Exam $exam): JsonResponse
    {
        $this->authorizeApiPermission('exam_edit');

        $validated = $request->validated();
        unset($validated['application_file'], $validated['admit_card_file'], $validated['images']);

        $this->examService->updateExam(
            $exam,
            $validated,
            $this->normalizeUploadedFile($request->file('application_file')),
            $this->normalizeUploadedFile($request->file('admit_card_file')),
            $this->normalizeUploadedFiles($request->file('images')),
            ApiUserContext::actorId(),
        );

        return $this->successResponse($exam->fresh(), 'Exam updated successfully.');
    }

    public function destroy(Exam $exam): JsonResponse
    {
        $this->authorizeApiPermission('exam_delete');

        $this->examService->deleteExam($exam);

        return $this->successResponse(null, 'Exam deleted successfully.');
    }

    public function file(Request $request, Exam $exam): StreamedResponse
    {
        $this->authorizeApiPermission('exam_list');

        $path = $request->query('path');
        $paths = array_merge(
            array_filter([$exam->application_file, $exam->admit_card_file]),
            $exam->images ?? [],
        );

        if (! is_string($path) || ! in_array($path, $paths, true)) {
            abort(404);
        }

        if (! Storage::disk('public_dir')->exists($path)) {
            abort(404);
        }

        return Storage::disk('public_dir')->response($path, basename($path), [
            'Content-Disposition' => 'inline',
        ]);
    }

    public function exportPdf(Request $request): Response
    {
        $this->authorizeApiPermission('exam_list');

        $validated = $this->validateListFilters($request);
        $report = $this->examService->buildListExport($validated);

        app()->setLocale('en');

        return Pdf::loadView('reports.exam-list', [
            ...$report,
            'formatter' => new ReportFormatter('en'),
        ])
            ->setPaper('a4', 'landscape')
            ->download($this->listExportFilename('exam_list', $validated));
    }

    /** @return array<string, mixed> */
    private function validateListFilters(Request $request): array
    {
        $validated = $request->validate([
            'date_from' => ['nullable', 'date'],
            'date_to' => ['nullable', 'date'],
            'job_type_id' => ['nullable', 'integer', 'exists:job_types,id'],
            'exam_status' => ['nullable', 'string', Rule::in(Exam::EXAM_STATUSES)],
        ]);

        foreach (['job_type_id'] as $key) {
            if (array_key_exists($key, $validated) && $validated[$key] === '') {
                $validated[$key] = null;
            }
        }

        return $validated;
    }

    /** @param  array<string, mixed>  $filters */
    private function listExportFilename(string $prefix, array $filters): string
    {
        return sprintf(
            '%s_%s_%s.pdf',
            $prefix,
            $filters['date_from'] ?? 'all',
            $filters['date_to'] ?? 'all',
        );
    }
}
