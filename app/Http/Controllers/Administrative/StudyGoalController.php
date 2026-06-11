<?php

namespace App\Http\Controllers\Administrative;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreStudyGoalRequest;
use App\Http\Requests\UpdateStudyGoalRequest;
use App\Models\StudyGoal;
use App\Services\JobTypeService;
use App\Services\StudyGoalService;
use App\Services\SubjectService;
use App\Services\TopicService;
use App\Support\ReportFormatter;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class StudyGoalController extends Controller
{
    public function __construct(
        private readonly StudyGoalService $studyGoalService,
        private readonly SubjectService $subjectService,
        private readonly TopicService $topicService,
        private readonly JobTypeService $jobTypeService,
    ) {}

    public function index()
    {
        try {
            return Inertia::render('Administrative/StudyGoal/Index', [
                'studyGoals' => $this->studyGoalService->listStudyGoals(),
                'members' => $this->studyGoalService->memberOptions(),
                'subjects' => $this->subjectService->subjectOptions(),
                'topics' => $this->topicService->topicOptions(),
                'jobTypes' => $this->jobTypeService->jobTypeOptions(),
            ]);
        } catch (\Throwable $th) {
            return redirect()->back()->with('error', 'Something Wrong,Please Try Again');
        }
    }

    public function create() {}

    public function store(StoreStudyGoalRequest $request)
    {
        try {
            $studyGoal = $this->studyGoalService->createStudyGoal(
                $request->validated(),
                auth()->id(),
            );
            if (! $studyGoal) {
                return redirect()->back()->with('error', 'Study goal created failed.');
            }

            return redirect()->route('administrative.study-goal.index')->with('success', 'Study goal created successfully.');
        } catch (\Throwable $th) {
            return redirect()->back()->with('error', 'Something Wrong,Please Try Again');
        }
    }

    public function edit(StudyGoal $studyGoal)
    {
        return redirect()->route('administrative.study-goal.index');
    }

    public function update(UpdateStudyGoalRequest $request, StudyGoal $studyGoal)
    {
        try {
            $this->studyGoalService->updateStudyGoal(
                $studyGoal,
                $request->validated(),
                auth()->id(),
            );

            return redirect()->route('administrative.study-goal.index')->with('success', 'Study goal updated successfully.');
        } catch (\Throwable $th) {
            return redirect()->back()->with('error', 'Something Wrong,Please Try Again');
        }
    }

    public function destroy(StudyGoal $studyGoal)
    {
        $this->studyGoalService->deleteStudyGoal($studyGoal);

        return redirect()->route('administrative.study-goal.index')->with('success', 'Study goal deleted successfully.');
    }

    public function exportPdf(Request $request)
    {
        abort_unless($request->user()->can('study_goal_list'), 403);

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
            'study_goal_status' => ['nullable', 'string', Rule::in(StudyGoal::STUDY_GOAL_STATUSES)],
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
