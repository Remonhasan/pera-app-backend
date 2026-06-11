<?php

namespace App\Http\Controllers\Administrative;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreExamRequest;
use App\Http\Requests\UpdateExamRequest;
use App\Models\Exam;
use App\Services\ExamService;
use App\Services\JobTypeService;
use App\Support\ReportFormatter;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class ExamController extends Controller
{
    public function __construct(
        private readonly ExamService $examService,
        private readonly JobTypeService $jobTypeService,
    ) {}

    public function index()
    {
        try {
            return Inertia::render('Administrative/Exam/Index', [
                'exams' => $this->examService->listExams(),
                'jobTypes' => $this->jobTypeService->jobTypeOptions(),
            ]);
        } catch (\Throwable $th) {
            return redirect()->back()->with('error', 'Something Wrong,Please Try Again');
        }
    }

    public function create() {}

    public function examFile(Request $request, Exam $exam)
    {
        abort_unless($request->user()->can('exam_list'), 403);

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

    public function store(StoreExamRequest $request)
    {
        try {
            $validated = $request->validated();
            unset($validated['application_file'], $validated['admit_card_file'], $validated['images']);

            $exam = $this->examService->createExam(
                $validated,
                $this->normalizeUploadedFile($request->file('application_file')),
                $this->normalizeUploadedFile($request->file('admit_card_file')),
                $this->normalizeUploadedFiles($request->file('images')),
                auth()->id(),
            );
            if (! $exam) {
                return redirect()->back()->with('error', 'Exam created failed.');
            }

            return redirect()->route('administrative.exam.index')->with('success', 'Exam created successfully.');
        } catch (\Throwable $th) {
            return redirect()->back()->with('error', 'Something Wrong,Please Try Again');
        }
    }

    public function edit(Exam $exam)
    {
        return redirect()->route('administrative.exam.index');
    }

    public function update(UpdateExamRequest $request, Exam $exam)
    {
        try {
            $validated = $request->validated();
            unset($validated['application_file'], $validated['admit_card_file'], $validated['images']);

            $this->examService->updateExam(
                $exam,
                $validated,
                $this->normalizeUploadedFile($request->file('application_file')),
                $this->normalizeUploadedFile($request->file('admit_card_file')),
                $this->normalizeUploadedFiles($request->file('images')),
                auth()->id(),
            );

            return redirect()->route('administrative.exam.index')->with('success', 'Exam updated successfully.');
        } catch (\Throwable $th) {
            return redirect()->back()->with('error', 'Something Wrong,Please Try Again');
        }
    }

    public function destroy(Exam $exam)
    {
        $this->examService->deleteExam($exam);

        return redirect()->route('administrative.exam.index')->with('success', 'Exam deleted successfully.');
    }

    public function exportPdf(Request $request)
    {
        abort_unless($request->user()->can('exam_list'), 403);

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

    private function normalizeUploadedFile(mixed $file): ?UploadedFile
    {
        return $file instanceof UploadedFile ? $file : null;
    }

    /** @return list<UploadedFile> */
    private function normalizeUploadedFiles(mixed $files): array
    {
        if ($files === null) {
            return [];
        }

        if ($files instanceof UploadedFile) {
            return [$files];
        }

        if (is_array($files)) {
            return array_values(array_filter(
                $files,
                fn ($file) => $file instanceof UploadedFile,
            ));
        }

        return [];
    }
}
