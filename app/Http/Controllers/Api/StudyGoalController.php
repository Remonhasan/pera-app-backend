<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Api\Concerns\AuthorizesApiAccess;
use App\Http\Controllers\Controller;
use App\Http\Requests\StoreStudyGoalRequest;
use App\Http\Requests\UpdateStudyGoalRequest;
use App\Http\Traits\ApiResponseTrait;
use App\Models\StudyGoal;
use App\Services\JobTypeService;
use App\Services\StudyGoalService;
use App\Services\SubjectService;
use App\Services\TopicService;
use App\Support\ApiUserContext;
use App\Support\ReportFormatter;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Symfony\Component\HttpFoundation\Response;

class StudyGoalController extends Controller
{
    use ApiResponseTrait;
    use AuthorizesApiAccess;

    public function __construct(
        private readonly StudyGoalService $studyGoalService,
        private readonly SubjectService $subjectService,
        private readonly TopicService $topicService,
        private readonly JobTypeService $jobTypeService,
    ) {}

    public function index(): JsonResponse
    {
        $this->authorizeApiPermission('study_goal_list');

        return $this->successResponse([
            'studyGoals' => $this->studyGoalService->listStudyGoals(),
            'members' => $this->studyGoalService->memberOptions(),
            'subjects' => $this->subjectService->subjectOptions(),
            'topics' => $this->topicService->topicOptions(),
            'jobTypes' => $this->jobTypeService->jobTypeOptions(),
        ], 'Study goal list retrieved successfully.');
    }

    public function store(StoreStudyGoalRequest $request): JsonResponse
    {
        $this->authorizeApiPermission('study_goal_create');

        $studyGoal = $this->studyGoalService->createStudyGoal(
            $request->validated(),
            ApiUserContext::actorId(),
        );

        if (! $studyGoal) {
            return $this->errorResponse('Failed to create study goal.', 422);
        }

        return $this->successResponse($studyGoal, 'Study goal created successfully.', 201);
    }

    public function update(UpdateStudyGoalRequest $request, StudyGoal $studyGoal): JsonResponse
    {
        $this->authorizeApiPermission('study_goal_edit');

        $this->studyGoalService->updateStudyGoal(
            $studyGoal,
            $request->validated(),
            ApiUserContext::actorId(),
        );

        return $this->successResponse($studyGoal->fresh(), 'Study goal updated successfully.');
    }

    public function destroy(StudyGoal $studyGoal): JsonResponse
    {
        $this->authorizeApiPermission('study_goal_delete');

        $this->studyGoalService->deleteStudyGoal($studyGoal);

        return $this->successResponse(null, 'Study goal deleted successfully.');
    }

    public function exportPdf(Request $request): Response
    {
        $this->authorizeApiPermission('study_goal_list');

        $validated = $this->validateListFilters($request);
        $report = $this->studyGoalService->buildListExport($validated);

        app()->setLocale('en');

        return Pdf::loadView('reports.study-goal-list', [
            ...$report,
            'formatter' => new ReportFormatter('en'),
        ])
            ->setPaper('a4', 'landscape')
            ->download($this->listExportFilename('study_goal_list', $validated));
    }

    /** @return array<string, mixed> */
    private function validateListFilters(Request $request): array
    {
        $validated = $request->validate([
            'date_from' => ['nullable', 'date'],
            'date_to' => ['nullable', 'date'],
            'user_id' => ['nullable', 'integer', 'exists:users,id'],
            'subject_id' => ['nullable', 'integer', 'exists:subjects,id'],
            'topic_id' => ['nullable', 'integer', 'exists:topics,id'],
            'job_id' => ['nullable', 'integer', 'exists:job_types,id'],
            'goal_status' => ['nullable', 'string', Rule::in(StudyGoal::STUDY_GOAL_STATUSES)],
        ]);

        foreach (['user_id', 'subject_id', 'topic_id', 'job_id'] as $key) {
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
