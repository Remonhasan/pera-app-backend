<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Api\Concerns\AuthorizesApiAccess;
use App\Http\Controllers\Api\Concerns\ValidatesReportFilters;
use App\Http\Controllers\Controller;
use App\Http\Traits\ApiResponseTrait;
use App\Services\ReportService;
use App\Support\ReportFormatter;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class ReportController extends Controller
{
    use ApiResponseTrait;
    use AuthorizesApiAccess;
    use ValidatesReportFilters;

    public function __construct(private readonly ReportService $reportService) {}

    public function dailyExpense(Request $request): JsonResponse
    {
        $this->authorizeApiPermission('report_list');

        $validated = $this->validateDailyExpenseFilters($request);
        $report = $this->reportService->buildDailyExpenseReport($validated);

        return $this->successResponse([
            ...$report,
            'members' => $this->reportService->memberFilterOptions(),
            'expenseTypes' => $this->reportService->expenseTypeFilterOptions(),
        ], 'Daily expense report retrieved successfully.');
    }

    public function dailyExpenseExportPdf(Request $request): Response
    {
        $this->authorizeApiPermission('report_list');

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

    public function expenseTrack(Request $request): JsonResponse
    {
        $this->authorizeApiPermission('report_list');

        $validated = $this->validateExpenseTrackFilters($request);
        $report = $this->reportService->buildExpenseTrackReport($validated);

        return $this->successResponse([
            ...$report,
            'members' => $this->reportService->memberFilterOptions(),
            'budgets' => $this->reportService->budgetFilterOptions(),
            'expenseTypes' => $this->reportService->expenseTypeFilterOptions(),
        ], 'Expense track report retrieved successfully.');
    }

    public function expenseTrackExportPdf(Request $request): Response
    {
        $this->authorizeApiPermission('report_list');

        $validated = $this->validateExpenseTrackFilters($request);
        $report = $this->reportService->buildExpenseTrackReport($validated);

        return Pdf::loadView('reports.expense-track', $this->exportViewData($report))
            ->setPaper('a4', 'landscape')
            ->download($this->expenseTrackExportFilename($report['filters']));
    }

    public function expenseTarget(Request $request): JsonResponse
    {
        $this->authorizeApiPermission('report_list');

        $validated = $this->validateExpenseTargetFilters($request);
        $report = $this->reportService->buildExpenseTargetReport($validated);

        return $this->successResponse([
            ...$report,
            'members' => $this->reportService->memberFilterOptions(),
            'expenseTargets' => $this->reportService->expenseTargetFilterOptions(),
            'expenseTypes' => $this->reportService->expenseTypeFilterOptions(),
        ], 'Expense target report retrieved successfully.');
    }

    public function expenseTargetExportPdf(Request $request): Response
    {
        $this->authorizeApiPermission('report_list');

        $validated = $this->validateExpenseTargetFilters($request);
        $report = $this->reportService->buildExpenseTargetReport($validated);

        return Pdf::loadView('reports.expense-target', $this->exportViewData($report))
            ->setPaper('a4', 'landscape')
            ->download($this->expenseTargetExportFilename($report['filters']));
    }

    public function savings(Request $request): JsonResponse
    {
        $this->authorizeApiPermission('report_list');

        $validated = $this->validateSavingsFilters($request);
        $report = $this->reportService->buildSavingsReport($validated);

        return $this->successResponse([
            ...$report,
            'members' => $this->reportService->memberFilterOptions(),
            'savingTypes' => $this->reportService->savingTypeFilterOptions(),
            'banks' => $this->reportService->bankFilterOptions(),
        ], 'Savings report retrieved successfully.');
    }

    public function savingsExportPdf(Request $request): Response
    {
        $this->authorizeApiPermission('report_list');

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

    public function study(Request $request): JsonResponse
    {
        $this->authorizeApiPermission('report_list');

        $validated = $this->validateStudyFilters($request);
        $report = $this->reportService->buildStudyReport($validated);

        return $this->successResponse([
            ...$report,
            'members' => $this->reportService->memberFilterOptions(),
            'subjects' => $this->reportService->subjectFilterOptions(),
            'topics' => $this->reportService->topicFilterOptions(),
            'jobTypes' => $this->reportService->jobTypeFilterOptions(),
        ], 'Study report retrieved successfully.');
    }

    public function studyExportPdf(Request $request): Response
    {
        $this->authorizeApiPermission('report_list');

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

    public function topicwiseStudyGoal(Request $request): JsonResponse
    {
        $this->authorizeApiPermission('report_list');

        $validated = $this->validateTopicwiseStudyGoalFilters($request);
        $report = $this->reportService->buildTopicwiseStudyGoalReport($validated);

        return $this->successResponse([
            ...$report,
            'members' => $this->reportService->memberFilterOptions(),
            'subjects' => $this->reportService->subjectFilterOptions(),
            'topics' => $this->reportService->topicFilterOptions(),
            'jobTypes' => $this->reportService->jobTypeFilterOptions(),
        ], 'Topicwise study goal report retrieved successfully.');
    }

    public function topicwiseStudyGoalExportPdf(Request $request): Response
    {
        $this->authorizeApiPermission('report_list');

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
