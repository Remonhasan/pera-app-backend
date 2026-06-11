<?php

namespace App\Http\Controllers\Administrative;

use App\Http\Controllers\Controller;
use App\Models\StudyGoal;
use App\Services\ReportService;
use App\Support\ReportFormatter;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class ReportController extends Controller
{
    public function __construct(private readonly ReportService $reportService) {}

    public function dailyExpense(Request $request)
    {
        abort_unless($request->user()->can('report_list'), 403);

        $validated = $this->validateDailyExpenseFilters($request);
        $report = $this->reportService->buildDailyExpenseReport($validated);

        return Inertia::render('Administrative/Report/DailyExpense/Index', [
            ...$report,
            'members' => $this->reportService->memberFilterOptions(),
            'expenseTypes' => $this->reportService->expenseTypeFilterOptions(),
        ]);
    }

    public function dailyExpenseExportPdf(Request $request)
    {
        abort_unless($request->user()->can('report_list'), 403);

        $validated = $this->validateDailyExpenseFilters($request);
        $report = $this->reportService->buildDailyExpenseReport($validated);

        return Pdf::loadView('reports.daily-expense', $this->exportViewData($report))
            ->setPaper('a4', 'landscape')
            ->download($this->exportFilename(
                'daily_expense_report',
                $report['filters']['date_from'] ?? null,
                $report['filters']['date_to'] ?? null,
            ));
    }

    public function expenseTrack(Request $request)
    {
        abort_unless($request->user()->can('report_list'), 403);

        $validated = $this->validateExpenseTrackFilters($request);
        $report = $this->reportService->buildExpenseTrackReport($validated);

        return Inertia::render('Administrative/Report/ExpenseTrack/Index', [
            ...$report,
            'members' => $this->reportService->memberFilterOptions(),
            'budgets' => $this->reportService->budgetFilterOptions(),
            'expenseTypes' => $this->reportService->expenseTypeFilterOptions(),
        ]);
    }

    public function expenseTrackExportPdf(Request $request)
    {
        abort_unless($request->user()->can('report_list'), 403);

        $validated = $this->validateExpenseTrackFilters($request);
        $report = $this->reportService->buildExpenseTrackReport($validated);

        return Pdf::loadView('reports.expense-track', $this->exportViewData($report))
            ->setPaper('a4', 'landscape')
            ->download($this->expenseTrackExportFilename($report['filters']));
    }

    public function expenseTarget(Request $request)
    {
        abort_unless($request->user()->can('report_list'), 403);

        $validated = $this->validateExpenseTargetFilters($request);
        $report = $this->reportService->buildExpenseTargetReport($validated);

        return Inertia::render('Administrative/Report/ExpenseTarget/Index', [
            ...$report,
            'members' => $this->reportService->memberFilterOptions(),
            'expenseTargets' => $this->reportService->expenseTargetFilterOptions(),
            'expenseTypes' => $this->reportService->expenseTypeFilterOptions(),
        ]);
    }

    public function expenseTargetExportPdf(Request $request)
    {
        abort_unless($request->user()->can('report_list'), 403);

        $validated = $this->validateExpenseTargetFilters($request);
        $report = $this->reportService->buildExpenseTargetReport($validated);

        return Pdf::loadView('reports.expense-target', $this->exportViewData($report))
            ->setPaper('a4', 'landscape')
            ->download($this->expenseTargetExportFilename($report['filters']));
    }

    public function savings(Request $request)
    {
        abort_unless($request->user()->can('report_list'), 403);

        $validated = $this->validateSavingsFilters($request);
        $report = $this->reportService->buildSavingsReport($validated);

        return Inertia::render('Administrative/Report/Savings/Index', [
            ...$report,
            'members' => $this->reportService->memberFilterOptions(),
            'banks' => $this->reportService->bankFilterOptions(),
            'savingTypes' => $this->reportService->savingTypeFilterOptions(),
        ]);
    }

    public function savingsExportPdf(Request $request)
    {
        abort_unless($request->user()->can('report_list'), 403);

        $validated = $this->validateSavingsFilters($request);
        $report = $this->reportService->buildSavingsReport($validated);

        return Pdf::loadView('reports.savings', $this->exportViewData($report))
            ->setPaper('a4', 'landscape')
            ->download($this->exportFilename(
                'savings_report',
                $report['filters']['date_from'] ?? null,
                $report['filters']['date_to'] ?? null,
            ));
    }

    public function study(Request $request)
    {
        abort_unless($request->user()->can('report_list'), 403);

        $validated = $this->validateStudyFilters($request);
        $report = $this->reportService->buildStudyReport($validated);

        return Inertia::render('Administrative/Report/Study/Index', [
            ...$report,
            'members' => $this->reportService->memberFilterOptions(),
            'subjects' => $this->reportService->subjectFilterOptions(),
            'topics' => $this->reportService->topicFilterOptions(),
            'jobTypes' => $this->reportService->jobTypeFilterOptions(),
        ]);
    }

    public function studyExportPdf(Request $request)
    {
        abort_unless($request->user()->can('report_list'), 403);

        $validated = $this->validateStudyFilters($request);
        $report = $this->reportService->buildStudyReport($validated);

        return Pdf::loadView('reports.study', $this->exportViewData($report))
            ->setPaper('a4', 'landscape')
            ->download($this->exportFilename(
                'study_report',
                $report['filters']['date_from'] ?? null,
                $report['filters']['date_to'] ?? null,
            ));
    }

    public function topicwiseStudyGoal(Request $request)
    {
        abort_unless($request->user()->can('report_list'), 403);

        $validated = $this->validateTopicwiseStudyGoalFilters($request);
        $report = $this->reportService->buildTopicwiseStudyGoalReport($validated);

        return Inertia::render('Administrative/Report/TopicwiseStudyGoal/Index', [
            ...$report,
            'members' => $this->reportService->memberFilterOptions(),
            'subjects' => $this->reportService->subjectFilterOptions(),
            'topics' => $this->reportService->topicFilterOptions(),
            'jobTypes' => $this->reportService->jobTypeFilterOptions(),
        ]);
    }

    public function topicwiseStudyGoalExportPdf(Request $request)
    {
        abort_unless($request->user()->can('report_list'), 403);

        $validated = $this->validateTopicwiseStudyGoalFilters($request);
        $report = $this->reportService->buildTopicwiseStudyGoalReport($validated);

        return Pdf::loadView('reports.topicwise-study-goal', $this->exportViewData($report))
            ->setPaper('a4', 'landscape')
            ->download($this->exportFilename(
                'topicwise_study_goal_report',
                $report['filters']['date_from'] ?? null,
                $report['filters']['date_to'] ?? null,
            ));
    }

    /** @return array<string, mixed> */
    private function validateDailyExpenseFilters(Request $request): array
    {
        $validated = $request->validate([
            'date_from' => ['nullable', 'date'],
            'date_to' => ['nullable', 'date'],
            'expense_type_id' => ['nullable', 'integer', 'exists:expense_types,id'],
            'user_id' => ['nullable', 'integer', 'exists:users,id'],
        ]);

        return $this->normalizeNullableIntFilters($validated, ['expense_type_id', 'user_id']);
    }

    /** @return array<string, mixed> */
    private function validateExpenseTrackFilters(Request $request): array
    {
        $validated = $request->validate([
            'user_id' => ['nullable', 'integer', 'exists:users,id'],
            'budget_id' => ['nullable', 'integer', 'exists:budgets,id'],
            'expense_id' => ['nullable', 'integer', 'exists:expense_types,id'],
            'month' => ['nullable', 'integer', 'min:1', 'max:12'],
            'year' => ['nullable', 'integer', 'min:1900', 'max:2100'],
            'month_from' => ['nullable', 'integer', 'min:1', 'max:12'],
            'month_to' => ['nullable', 'integer', 'min:1', 'max:12'],
            'year_from' => ['nullable', 'integer', 'min:1900', 'max:2100'],
            'year_to' => ['nullable', 'integer', 'min:1900', 'max:2100'],
        ]);

        return $this->normalizeNullableIntFilters(
            $validated,
            ['user_id', 'budget_id', 'expense_id', 'month', 'year', 'month_from', 'month_to', 'year_from', 'year_to'],
        );
    }

    /** @return array<string, mixed> */
    private function validateExpenseTargetFilters(Request $request): array
    {
        $validated = $request->validate([
            'date_from' => ['nullable', 'date'],
            'date_to' => ['nullable', 'date'],
            'user_id' => ['nullable', 'integer', 'exists:users,id'],
            'expense_target_id' => ['nullable', 'integer', 'exists:expense_targets,id'],
            'expense_id' => ['nullable', 'integer', 'exists:expense_types,id'],
            'month' => ['nullable', 'integer', 'min:1', 'max:12'],
            'year' => ['nullable', 'integer', 'min:1900', 'max:2100'],
            'month_from' => ['nullable', 'integer', 'min:1', 'max:12'],
            'month_to' => ['nullable', 'integer', 'min:1', 'max:12'],
            'year_from' => ['nullable', 'integer', 'min:1900', 'max:2100'],
            'year_to' => ['nullable', 'integer', 'min:1900', 'max:2100'],
        ]);

        return $this->normalizeNullableIntFilters(
            $validated,
            ['user_id', 'expense_target_id', 'expense_id', 'month', 'year', 'month_from', 'month_to', 'year_from', 'year_to'],
        );
    }

    /** @return array<string, mixed> */
    private function validateSavingsFilters(Request $request): array
    {
        $validated = $request->validate([
            'date_from' => ['nullable', 'date'],
            'date_to' => ['nullable', 'date'],
            'month_from' => ['nullable', 'integer', 'min:1', 'max:12'],
            'month_to' => ['nullable', 'integer', 'min:1', 'max:12'],
            'year_from' => ['nullable', 'integer', 'min:1900', 'max:2100'],
            'year_to' => ['nullable', 'integer', 'min:1900', 'max:2100'],
            'saving_type_id' => ['nullable', 'integer', 'exists:saving_types,id'],
            'bank_id' => ['nullable', 'integer', 'exists:banks,id'],
            'user_id' => ['nullable', 'integer', 'exists:users,id'],
        ]);

        return $this->normalizeNullableIntFilters(
            $validated,
            ['month_from', 'month_to', 'year_from', 'year_to', 'saving_type_id', 'bank_id', 'user_id'],
        );
    }

    /** @return array<string, mixed> */
    private function validateStudyFilters(Request $request): array
    {
        $validated = $request->validate([
            'date_from' => ['nullable', 'date'],
            'date_to' => ['nullable', 'date'],
            'user_id' => ['nullable', 'integer', 'exists:users,id'],
            'subject_id' => ['nullable', 'integer', 'exists:subjects,id'],
            'topic_id' => ['nullable', 'integer', 'exists:topics,id'],
            'job_id' => ['nullable', 'integer', 'exists:job_types,id'],
        ]);

        return $this->normalizeNullableIntFilters($validated, ['user_id', 'subject_id', 'topic_id', 'job_id']);
    }

    /** @return array<string, mixed> */
    private function validateTopicwiseStudyGoalFilters(Request $request): array
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

        $normalized = $this->normalizeNullableIntFilters($validated, ['user_id', 'subject_id', 'topic_id', 'job_id']);

        if (array_key_exists('goal_status', $normalized) && $normalized['goal_status'] === '') {
            $normalized['goal_status'] = null;
        }

        return $normalized;
    }

    /**
     * @param  array<string, mixed>  $validated
     * @param  list<string>  $keys
     * @return array<string, mixed>
     */
    private function normalizeNullableIntFilters(array $validated, array $keys): array
    {
        foreach ($keys as $key) {
            if (array_key_exists($key, $validated) && $validated[$key] === '') {
                $validated[$key] = null;
            }
        }

        return $validated;
    }

    private function exportFilename(string $prefix, ?string $dateFrom, ?string $dateTo): string
    {
        return sprintf(
            '%s_%s_%s.pdf',
            $prefix,
            $dateFrom ?? 'all',
            $dateTo ?? 'all',
        );
    }

    /** @param  array<string, mixed>  $filters */
    private function expenseTrackExportFilename(array $filters): string
    {
        if (! empty($filters['month']) && ! empty($filters['year'])) {
            return sprintf(
                'expense_track_report_%s_%s.pdf',
                $filters['month'],
                $filters['year'],
            );
        }

        if (
            ! empty($filters['month_from'])
            || ! empty($filters['month_to'])
            || ! empty($filters['year_from'])
            || ! empty($filters['year_to'])
        ) {
            return sprintf(
                'expense_track_report_%s_%s_%s_%s.pdf',
                $filters['month_from'] ?? 'all',
                $filters['year_from'] ?? 'all',
                $filters['month_to'] ?? 'all',
                $filters['year_to'] ?? 'all',
            );
        }

        return 'expense_track_report_all.pdf';
    }

    /** @param  array<string, mixed>  $filters */
    private function expenseTargetExportFilename(array $filters): string
    {
        if (! empty($filters['date_from']) || ! empty($filters['date_to'])) {
            return $this->exportFilename(
                'expense_target_report',
                $filters['date_from'] ?? null,
                $filters['date_to'] ?? null,
            );
        }

        if (! empty($filters['month']) && ! empty($filters['year'])) {
            return sprintf(
                'expense_target_report_%s_%s.pdf',
                $filters['month'],
                $filters['year'],
            );
        }

        if (
            ! empty($filters['month_from'])
            || ! empty($filters['month_to'])
            || ! empty($filters['year_from'])
            || ! empty($filters['year_to'])
        ) {
            return sprintf(
                'expense_target_report_%s_%s_%s_%s.pdf',
                $filters['month_from'] ?? 'all',
                $filters['year_from'] ?? 'all',
                $filters['month_to'] ?? 'all',
                $filters['year_to'] ?? 'all',
            );
        }

        return 'expense_target_report_all.pdf';
    }

    /**
     * @param  array<string, mixed>  $report
     * @return array<string, mixed>
     */
    private function exportViewData(array $report, bool $forImage = false): array
    {
        app()->setLocale('en');

        return [
            ...$report,
            'forImage' => $forImage,
            'formatter' => new ReportFormatter('en'),
        ];
    }
}
