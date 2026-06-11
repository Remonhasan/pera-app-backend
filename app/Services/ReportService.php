<?php

namespace App\Services;

use App\Models\Bank;
use App\Models\Budget;
use App\Models\Expense;
use App\Models\ExpenseTarget;
use App\Models\ExpenseType;
use App\Models\JobType;
use App\Models\Note;
use App\Models\Notice;
use App\Models\Saving;
use App\Models\SavingType;
use App\Models\StudyGoal;
use App\Models\Subject;
use App\Models\Topic;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use App\Support\PublicStorageUrl;
use Carbon\Carbon;

class ReportService
{
    private function expenseTargetMonthlyBudget(float $amount): float
    {
        return round($amount * 30, 2);
    }

    private function daysInMonth(int $month, int $year): int
    {
        return Carbon::create($year, $month, 1)->daysInMonth;
    }

    private function expenseTargetAmountPerDay(float $amount, int $month, int $year): float
    {
        $days = $this->daysInMonth($month, $year);

        return $days > 0
            ? round($this->expenseTargetMonthlyBudget($amount) / $days, 2)
            : 0.0;
    }

    /**
     * @return array{0: string, 1: string}
     */
    public function resolveDateRange(?string $dateFrom, ?string $dateTo): array
    {
        $from = $dateFrom ?? now()->subDays(29)->toDateString();
        $to = $dateTo ?? now()->toDateString();

        if ($from > $to) {
            [$from, $to] = [$to, $from];
        }

        return [$from, $to];
    }

    /** @return array{0: string, 1: string} */
    public function resolveCurrentMonthDateRange(?string $dateFrom, ?string $dateTo): array
    {
        $from = $dateFrom ?? now()->startOfMonth()->toDateString();
        $to = $dateTo ?? now()->endOfMonth()->toDateString();

        if ($from > $to) {
            [$from, $to] = [$to, $from];
        }

        return [$from, $to];
    }

    /**
     * @return array{filters: array{date_from: string, date_to: string}}
     */
    public function buildMemberDashboard(int $userId, ?string $dateFrom, ?string $dateTo): array
    {
        [$dateFrom, $dateTo] = $this->resolveCurrentMonthDateRange($dateFrom, $dateTo);

        return [
            'filters' => [
                'date_from' => $dateFrom,
                'date_to' => $dateTo,
            ],
        ];
    }

    /**
     * @return array{
     *     total_notices: int,
     *     notices: list<array{
     *         id: int,
     *         title: string,
     *         description: string|null,
     *         created_at: string|null
     *     }>
     * }
     */
    public function listNotices(): array
    {
        $notices = Notice::query()
            ->where('status', true)
            ->orderByDesc('id')
            ->get(['id', 'title', 'description', 'created_at'])
            ->map(fn (Notice $notice) => [
                'id' => $notice->id,
                'title' => $notice->title,
                'description' => $notice->description,
                'created_at' => $notice->created_at?->toIso8601String(),
            ])
            ->values()
            ->all();

        return [
            'total_notices' => count($notices),
            'notices' => $notices,
        ];
    }

    /**
     * @return array{
     *     members: list<array{id: int, name: string, phone: string|null, image: string|null}>
     * }
     */
    public function listMembers(): array
    {
        $members = User::query()
            ->memberRole()
            ->orderBy('name')
            ->get(['id', 'name', 'phone', 'image'])
            ->map(fn (User $user) => [
                'id' => $user->id,
                'name' => $user->name,
                'phone' => $user->phone,
                'image' => PublicStorageUrl::fromPath($user->image),
            ])
            ->values()
            ->all();

        return [
            'members' => $members,
        ];
    }

    /** @return list<array{id: int, name: string, phone: string|null}> */
    public function memberFilterOptions(): array
    {
        return User::query()
            ->memberRole()
            ->orderBy('name')
            ->get(['id', 'name', 'phone'])
            ->map(fn (User $user) => [
                'id' => $user->id,
                'name' => $user->name,
                'phone' => $user->phone,
            ])
            ->all();
    }

    /** @return list<array{id: int, name: string}> */
    public function expenseTypeFilterOptions(): array
    {
        return ExpenseType::query()
            ->where('status', true)
            ->orderBy('name')
            ->get(['id', 'name'])
            ->map(fn (ExpenseType $type) => [
                'id' => $type->id,
                'name' => $type->name,
            ])
            ->all();
    }

    /** @return list<array{id: int, name: string}> */
    public function bankFilterOptions(): array
    {
        return Bank::query()
            ->where('status', true)
            ->orderBy('name')
            ->get(['id', 'name'])
            ->map(fn (Bank $bank) => [
                'id' => $bank->id,
                'name' => $bank->name,
            ])
            ->all();
    }

    /** @return list<array{id: int, name: string}> */
    public function savingTypeFilterOptions(): array
    {
        return SavingType::query()
            ->where('status', true)
            ->orderBy('name')
            ->get(['id', 'name'])
            ->map(fn (SavingType $type) => [
                'id' => $type->id,
                'name' => $type->name,
            ])
            ->all();
    }

    /** @return list<array{id: int, name: string}> */
    public function subjectFilterOptions(): array
    {
        return Subject::query()
            ->where('status', true)
            ->orderBy('name')
            ->get(['id', 'name'])
            ->map(fn (Subject $subject) => [
                'id' => $subject->id,
                'name' => $subject->name,
            ])
            ->all();
    }

    /** @return list<array{id: int, topic: string, subject_id: int}> */
    public function topicFilterOptions(): array
    {
        return Topic::query()
            ->where('status', true)
            ->orderBy('topic')
            ->get(['id', 'topic', 'subject_id'])
            ->map(fn (Topic $topic) => [
                'id' => $topic->id,
                'topic' => $topic->topic,
                'subject_id' => $topic->subject_id,
            ])
            ->all();
    }

    /** @return list<array{id: int, name: string}> */
    public function jobTypeFilterOptions(): array
    {
        return JobType::query()
            ->where('status', true)
            ->orderBy('name')
            ->get(['id', 'name'])
            ->map(fn (JobType $type) => [
                'id' => $type->id,
                'name' => $type->name,
            ])
            ->all();
    }

    /**
     * @param  array<string, mixed>  $filters
     * @return array{
     *     filters: array<string, mixed>,
     *     total_amount: float,
     *     rows: list<array<string, mixed>>
     * }
     */
    public function buildDailyExpenseReport(array $filters): array
    {
        $dateFrom = $filters['date_from'] ?? null;
        $dateTo = $filters['date_to'] ?? null;

        if ($dateFrom !== null && $dateTo !== null) {
            [$dateFrom, $dateTo] = $this->resolveDateRange($dateFrom, $dateTo);
        } elseif ($dateFrom !== null || $dateTo !== null) {
            $dateFrom = $dateFrom ?? $dateTo;
            $dateTo = $dateTo ?? $dateFrom;
        }

        $query = Expense::query()
            ->with(['user:id,name', 'expenseType:id,name'])
            ->when($dateFrom && $dateTo, function (Builder $builder) use ($dateFrom, $dateTo) {
                $builder->whereNotNull('date')
                    ->whereDate('date', '>=', $dateFrom)
                    ->whereDate('date', '<=', $dateTo);
            })
            ->when(
                isset($filters['expense_type_id']) && $filters['expense_type_id'] !== null,
                fn (Builder $builder) => $builder->where('expense_type_id', (int) $filters['expense_type_id']),
            )
            ->when(
                isset($filters['user_id']) && $filters['user_id'] !== null,
                fn (Builder $builder) => $builder->where('user_id', (int) $filters['user_id']),
            )
            ->orderByDesc('date')
            ->orderByDesc('id');

        $expenses = $query->get([
            'id',
            'user_id',
            'expense_type_id',
            'name',
            'date',
            'amount',
            'description',
        ]);

        $rows = $expenses->map(fn (Expense $expense) => [
            'id' => $expense->id,
            'member_name' => $expense->user?->name ?? '—',
            'expense_type_name' => $expense->expenseType?->name ?? '—',
            'name' => $expense->name,
            'date' => $expense->date?->format('Y-m-d'),
            'amount' => round((float) $expense->amount, 2),
            'description' => $expense->description,
        ])->values()->all();

        $totalAmount = round(array_sum(array_column($rows, 'amount')), 2);

        return [
            'filters' => [
                'date_from' => $dateFrom,
                'date_to' => $dateTo,
                'expense_type_id' => isset($filters['expense_type_id'])
                    ? ($filters['expense_type_id'] !== null ? (int) $filters['expense_type_id'] : null)
                    : null,
                'user_id' => isset($filters['user_id'])
                    ? ($filters['user_id'] !== null ? (int) $filters['user_id'] : null)
                    : null,
            ],
            'total_amount' => $totalAmount,
            'rows' => $rows,
        ];
    }

    /**
     * @param  array<string, mixed>  $filters
     * @return array{
     *     filters: array<string, mixed>,
     *     total_amount: float,
     *     rows: list<array<string, mixed>>
     * }
     */
    public function buildSavingsReport(array $filters): array
    {
        $dateFrom = $filters['date_from'] ?? null;
        $dateTo = $filters['date_to'] ?? null;

        if ($dateFrom !== null && $dateTo !== null) {
            [$dateFrom, $dateTo] = $this->resolveDateRange($dateFrom, $dateTo);
        } elseif ($dateFrom !== null || $dateTo !== null) {
            $dateFrom = $dateFrom ?? $dateTo;
            $dateTo = $dateTo ?? $dateFrom;
        }

        $query = Saving::query()
            ->with(['user:id,name', 'bank:id,name', 'savingType:id,name'])
            ->when($dateFrom && $dateTo, function (Builder $builder) use ($dateFrom, $dateTo) {
                $builder->whereNotNull('date')
                    ->whereDate('date', '>=', $dateFrom)
                    ->whereDate('date', '<=', $dateTo);
            })
            ->when(
                isset($filters['month_from']) && $filters['month_from'] !== null,
                fn (Builder $builder) => $builder->where('month', '>=', (int) $filters['month_from']),
            )
            ->when(
                isset($filters['month_to']) && $filters['month_to'] !== null,
                fn (Builder $builder) => $builder->where('month', '<=', (int) $filters['month_to']),
            )
            ->when(
                isset($filters['year_from']) && $filters['year_from'] !== null,
                fn (Builder $builder) => $builder->where('year', '>=', (int) $filters['year_from']),
            )
            ->when(
                isset($filters['year_to']) && $filters['year_to'] !== null,
                fn (Builder $builder) => $builder->where('year', '<=', (int) $filters['year_to']),
            )
            ->when(
                isset($filters['saving_type_id']) && $filters['saving_type_id'] !== null,
                fn (Builder $builder) => $builder->where('saving_type_id', (int) $filters['saving_type_id']),
            )
            ->when(
                isset($filters['bank_id']) && $filters['bank_id'] !== null,
                fn (Builder $builder) => $builder->where('bank_id', (int) $filters['bank_id']),
            )
            ->when(
                isset($filters['user_id']) && $filters['user_id'] !== null,
                fn (Builder $builder) => $builder->where('user_id', (int) $filters['user_id']),
            )
            ->orderByDesc('date')
            ->orderByDesc('id');

        $savings = $query->get([
            'id',
            'user_id',
            'bank_id',
            'saving_type_id',
            'month',
            'year',
            'date',
            'amount',
            'description',
        ]);

        $rows = $savings->map(fn (Saving $saving) => [
            'id' => $saving->id,
            'member_name' => $saving->user?->name ?? '—',
            'bank_name' => $saving->bank?->name ?? '—',
            'saving_type_name' => $saving->savingType?->name ?? '—',
            'month' => $saving->month,
            'year' => $saving->year,
            'date' => $saving->date?->format('Y-m-d'),
            'amount' => round((float) $saving->amount, 2),
            'description' => $saving->description,
        ])->values()->all();

        $totalAmount = round(array_sum(array_column($rows, 'amount')), 2);

        return [
            'filters' => [
                'date_from' => $dateFrom,
                'date_to' => $dateTo,
                'month_from' => isset($filters['month_from']) && $filters['month_from'] !== null
                    ? (int) $filters['month_from']
                    : null,
                'month_to' => isset($filters['month_to']) && $filters['month_to'] !== null
                    ? (int) $filters['month_to']
                    : null,
                'year_from' => isset($filters['year_from']) && $filters['year_from'] !== null
                    ? (int) $filters['year_from']
                    : null,
                'year_to' => isset($filters['year_to']) && $filters['year_to'] !== null
                    ? (int) $filters['year_to']
                    : null,
                'saving_type_id' => isset($filters['saving_type_id']) && $filters['saving_type_id'] !== null
                    ? (int) $filters['saving_type_id']
                    : null,
                'bank_id' => isset($filters['bank_id']) && $filters['bank_id'] !== null
                    ? (int) $filters['bank_id']
                    : null,
                'user_id' => isset($filters['user_id']) && $filters['user_id'] !== null
                    ? (int) $filters['user_id']
                    : null,
            ],
            'total_amount' => $totalAmount,
            'rows' => $rows,
        ];
    }

    /**
     * @param  array<string, mixed>  $filters
     * @return array{
     *     filters: array<string, mixed>,
     *     total_records: int,
     *     rows: list<array<string, mixed>>
     * }
     */
    public function buildStudyReport(array $filters): array
    {
        $dateFrom = $filters['date_from'] ?? null;
        $dateTo = $filters['date_to'] ?? null;

        if ($dateFrom !== null && $dateTo !== null) {
            [$dateFrom, $dateTo] = $this->resolveDateRange($dateFrom, $dateTo);
        } elseif ($dateFrom !== null || $dateTo !== null) {
            $dateFrom = $dateFrom ?? $dateTo;
            $dateTo = $dateTo ?? $dateFrom;
        }

        $jobTypeMap = JobType::query()->pluck('name', 'id');

        $notes = Note::query()
            ->with(['user:id,name', 'subject:id,name', 'topic:id,topic'])
            ->when($dateFrom && $dateTo, function (Builder $builder) use ($dateFrom, $dateTo) {
                $builder->whereDate('created_at', '>=', $dateFrom)
                    ->whereDate('created_at', '<=', $dateTo);
            })
            ->when(
                isset($filters['user_id']) && $filters['user_id'] !== null,
                fn (Builder $builder) => $builder->where('user_id', (int) $filters['user_id']),
            )
            ->when(
                isset($filters['subject_id']) && $filters['subject_id'] !== null,
                fn (Builder $builder) => $builder->where('subject_id', (int) $filters['subject_id']),
            )
            ->when(
                isset($filters['topic_id']) && $filters['topic_id'] !== null,
                fn (Builder $builder) => $builder->where('topic_id', (int) $filters['topic_id']),
            )
            ->when(
                isset($filters['job_id']) && $filters['job_id'] !== null,
                fn (Builder $builder) => $builder->whereJsonContains('job_ids', (int) $filters['job_id']),
            )
            ->orderByDesc('created_at')
            ->orderByDesc('id')
            ->get();

        $rows = $notes->map(function (Note $note) use ($jobTypeMap) {
            $jobNames = collect($note->job_ids ?? [])
                ->map(fn ($id) => $jobTypeMap->get((int) $id))
                ->filter()
                ->values()
                ->all();

            return [
                'id' => $note->id,
                'member_name' => $note->user?->name ?? '—',
                'subject_name' => $note->subject?->name ?? '—',
                'topic_name' => $note->topic?->topic ?? '—',
                'job_type_names' => $jobNames !== [] ? implode(', ', $jobNames) : '—',
                'date' => $note->created_at?->format('Y-m-d'),
                'drive_link' => $note->drive_link,
            ];
        })->values()->all();

        return [
            'filters' => [
                'date_from' => $dateFrom,
                'date_to' => $dateTo,
                'user_id' => isset($filters['user_id']) && $filters['user_id'] !== null
                    ? (int) $filters['user_id']
                    : null,
                'subject_id' => isset($filters['subject_id']) && $filters['subject_id'] !== null
                    ? (int) $filters['subject_id']
                    : null,
                'topic_id' => isset($filters['topic_id']) && $filters['topic_id'] !== null
                    ? (int) $filters['topic_id']
                    : null,
                'job_id' => isset($filters['job_id']) && $filters['job_id'] !== null
                    ? (int) $filters['job_id']
                    : null,
            ],
            'total_records' => count($rows),
            'rows' => $rows,
        ];
    }

    /**
     * @param  array<string, mixed>  $filters
     * @return array{
     *     filters: array<string, mixed>,
     *     total_records: int,
     *     rows: list<array<string, mixed>>
     * }
     */
    public function buildTopicwiseStudyGoalReport(array $filters): array
    {
        $dateFrom = $filters['date_from'] ?? null;
        $dateTo = $filters['date_to'] ?? null;

        if ($dateFrom !== null && $dateTo !== null) {
            [$dateFrom, $dateTo] = $this->resolveDateRange($dateFrom, $dateTo);
        } elseif ($dateFrom !== null || $dateTo !== null) {
            $dateFrom = $dateFrom ?? $dateTo;
            $dateTo = $dateTo ?? $dateFrom;
        }

        $query = StudyGoal::query()
            ->with(['user:id,name', 'subject:id,name', 'topic:id,topic', 'jobType:id,name'])
            ->when($dateFrom && $dateTo, fn (Builder $builder) => $this->applyStudyGoalDateFilter($builder, $dateFrom, $dateTo))
            ->when(
                isset($filters['user_id']) && $filters['user_id'] !== null,
                fn (Builder $builder) => $builder->where('user_id', (int) $filters['user_id']),
            )
            ->when(
                isset($filters['subject_id']) && $filters['subject_id'] !== null,
                fn (Builder $builder) => $builder->where('subject_id', (int) $filters['subject_id']),
            )
            ->when(
                isset($filters['topic_id']) && $filters['topic_id'] !== null,
                fn (Builder $builder) => $builder->where('topic_id', (int) $filters['topic_id']),
            )
            ->when(
                isset($filters['job_id']) && $filters['job_id'] !== null,
                fn (Builder $builder) => $builder->where('job_id', (int) $filters['job_id']),
            )
            ->when(
                isset($filters['goal_status']) && $filters['goal_status'] !== null && $filters['goal_status'] !== '',
                fn (Builder $builder) => $builder->where('study_goal_status', $filters['goal_status']),
            )
            ->orderBy('subject_id')
            ->orderBy('topic_id')
            ->orderByDesc('id');

        $studyGoals = $query->get();

        $grouped = $studyGoals->groupBy(fn (StudyGoal $goal) => $goal->topic_id ?? 0);

        $rows = [];
        foreach ($grouped as $topicId => $goals) {
            /** @var StudyGoal $first */
            $first = $goals->first();
            $goalRows = $goals->map(fn (StudyGoal $goal) => [
                'id' => $goal->id,
                'member_name' => $goal->user?->name ?? '—',
                'subject_name' => $goal->subject?->name ?? '—',
                'topic_name' => $goal->topic?->topic ?? '—',
                'job_type_name' => $goal->jobType?->name ?? '—',
                'date_from' => $goal->date_from?->format('Y-m-d'),
                'date_to' => $goal->date_to?->format('Y-m-d'),
                'extended_date' => $goal->extended_date?->format('Y-m-d'),
                'study_goal_status' => $goal->study_goal_status,
            ])->values()->all();

            $rows[] = [
                'topic_id' => $topicId !== 0 ? (int) $topicId : null,
                'topic_name' => $first->topic?->topic ?? '—',
                'subject_name' => $first->subject?->name ?? '—',
                'total' => count($goalRows),
                'pending' => $goals->where('study_goal_status', StudyGoal::STATUS_PENDING)->count(),
                'doing' => $goals->where('study_goal_status', StudyGoal::STATUS_DOING)->count(),
                'completed' => $goals->where('study_goal_status', StudyGoal::STATUS_COMPLETED)->count(),
                'goals' => $goalRows,
            ];
        }

        return [
            'filters' => [
                'date_from' => $dateFrom,
                'date_to' => $dateTo,
                'user_id' => isset($filters['user_id']) && $filters['user_id'] !== null
                    ? (int) $filters['user_id']
                    : null,
                'subject_id' => isset($filters['subject_id']) && $filters['subject_id'] !== null
                    ? (int) $filters['subject_id']
                    : null,
                'topic_id' => isset($filters['topic_id']) && $filters['topic_id'] !== null
                    ? (int) $filters['topic_id']
                    : null,
                'job_id' => isset($filters['job_id']) && $filters['job_id'] !== null
                    ? (int) $filters['job_id']
                    : null,
                'goal_status' => isset($filters['goal_status']) && $filters['goal_status'] !== ''
                    ? $filters['goal_status']
                    : null,
            ],
            'total_records' => $studyGoals->count(),
            'rows' => $rows,
        ];
    }

    private function applyStudyGoalDateFilter(Builder $query, string $dateFrom, string $dateTo): void
    {
        $query->where(function (Builder $sub) use ($dateFrom, $dateTo) {
            $sub->whereBetween('date_from', [$dateFrom, $dateTo])
                ->orWhereBetween('date_to', [$dateFrom, $dateTo])
                ->orWhereBetween('extended_date', [$dateFrom, $dateTo])
                ->orWhere(function (Builder $overlap) use ($dateFrom, $dateTo) {
                    $overlap->whereNotNull('date_from')
                        ->whereNotNull('date_to')
                        ->whereDate('date_from', '<=', $dateTo)
                        ->whereDate('date_to', '>=', $dateFrom);
                });
        });
    }

    /** @return list<array{id: int, label: string}> */
    public function budgetFilterOptions(): array
    {
        return Budget::query()
            ->with(['user:id,name', 'budgetType:id,name'])
            ->orderByDesc('year')
            ->orderByDesc('month')
            ->orderByDesc('id')
            ->get(['id', 'user_id', 'budget_type_id', 'month', 'year', 'amount'])
            ->map(function (Budget $budget) {
                $member = $budget->user?->name ?? '—';
                $type = $budget->budgetType?->name ?? '—';
                $amount = number_format((float) $budget->amount, 2);

                return [
                    'id' => $budget->id,
                    'label' => "{$member} — {$type} — {$budget->month}/{$budget->year} — {$amount}",
                ];
            })
            ->all();
    }

    /**
     * @param  array<string, mixed>  $filters
     * @return array{
     *     filters: array<string, mixed>,
     *     summary: array{
     *         total_budget: float,
     *         total_expense: float,
     *         total_extra_cost: float,
     *         total_remaining_to_spend: float
     *     },
     *     rows: list<array<string, mixed>>
     * }
     */
    public function buildExpenseTrackReport(array $filters): array
    {
        $expenseTypeId = isset($filters['expense_id']) && $filters['expense_id'] !== null
            ? (int) $filters['expense_id']
            : null;

        $budgets = Budget::query()
            ->with(['user:id,name,phone', 'budgetType:id,name'])
            ->when(
                isset($filters['user_id']) && $filters['user_id'] !== null,
                fn (Builder $builder) => $builder->where('user_id', (int) $filters['user_id']),
            )
            ->when(
                isset($filters['budget_id']) && $filters['budget_id'] !== null,
                fn (Builder $builder) => $builder->whereKey((int) $filters['budget_id']),
            )
            ->when(
                isset($filters['month']) && $filters['month'] !== null,
                fn (Builder $builder) => $builder->where('month', (int) $filters['month']),
            )
            ->when(
                isset($filters['year']) && $filters['year'] !== null,
                fn (Builder $builder) => $builder->where('year', (int) $filters['year']),
            )
            ->when(
                isset($filters['month_from']) && $filters['month_from'] !== null,
                fn (Builder $builder) => $builder->where('month', '>=', (int) $filters['month_from']),
            )
            ->when(
                isset($filters['month_to']) && $filters['month_to'] !== null,
                fn (Builder $builder) => $builder->where('month', '<=', (int) $filters['month_to']),
            )
            ->when(
                isset($filters['year_from']) && $filters['year_from'] !== null,
                fn (Builder $builder) => $builder->where('year', '>=', (int) $filters['year_from']),
            )
            ->when(
                isset($filters['year_to']) && $filters['year_to'] !== null,
                fn (Builder $builder) => $builder->where('year', '<=', (int) $filters['year_to']),
            )
            ->orderByDesc('year')
            ->orderByDesc('month')
            ->orderByDesc('id')
            ->get();

        $rows = [];
        $totalBudget = 0.0;
        $totalExpense = 0.0;
        $totalExtra = 0.0;
        $totalRemaining = 0.0;

        foreach ($budgets as $budget) {
            $expenseQuery = Expense::query()
                ->where(function (Builder $query) use ($budget) {
                    $query->where('budget_id', $budget->id)
                        ->orWhere(function (Builder $fallback) use ($budget) {
                            $fallback->whereNull('budget_id')
                                ->where('user_id', $budget->user_id)
                                ->where('budget_type_id', $budget->budget_type_id)
                                ->where('month', $budget->month)
                                ->where('year', $budget->year);
                        });
                });

            if ($expenseTypeId !== null) {
                $expenseQuery->where('expense_type_id', $expenseTypeId);
            }

            $spent = round((float) $expenseQuery->sum('amount'), 2);
            $budgetAmount = round((float) $budget->amount, 2);
            $completed = $spent >= $budgetAmount;
            $extraCost = $completed ? round($spent - $budgetAmount, 2) : 0.0;
            $remaining = $completed ? 0.0 : round($budgetAmount - $spent, 2);

            $totalBudget += $budgetAmount;
            $totalExpense += $spent;
            $totalExtra += $extraCost;
            $totalRemaining += $remaining;

            $rows[] = [
                'id' => $budget->id,
                'member_name' => $budget->user?->name ?? '—',
                'budget_type_name' => $budget->budgetType?->name ?? '—',
                'month' => $budget->month,
                'year' => $budget->year,
                'budget_amount' => $budgetAmount,
                'total_expense' => $spent,
                'mission_completed' => $completed,
                'extra_cost' => $extraCost,
                'remaining_to_spend' => $remaining,
            ];
        }

        return [
            'filters' => [
                'user_id' => isset($filters['user_id']) && $filters['user_id'] !== null
                    ? (int) $filters['user_id']
                    : null,
                'budget_id' => isset($filters['budget_id']) && $filters['budget_id'] !== null
                    ? (int) $filters['budget_id']
                    : null,
                'expense_id' => $expenseTypeId,
                'month' => isset($filters['month']) && $filters['month'] !== null
                    ? (int) $filters['month']
                    : null,
                'year' => isset($filters['year']) && $filters['year'] !== null
                    ? (int) $filters['year']
                    : null,
                'month_from' => isset($filters['month_from']) && $filters['month_from'] !== null
                    ? (int) $filters['month_from']
                    : null,
                'month_to' => isset($filters['month_to']) && $filters['month_to'] !== null
                    ? (int) $filters['month_to']
                    : null,
                'year_from' => isset($filters['year_from']) && $filters['year_from'] !== null
                    ? (int) $filters['year_from']
                    : null,
                'year_to' => isset($filters['year_to']) && $filters['year_to'] !== null
                    ? (int) $filters['year_to']
                    : null,
            ],
            'summary' => [
                'total_budget' => round($totalBudget, 2),
                'total_expense' => round($totalExpense, 2),
                'total_extra_cost' => round($totalExtra, 2),
                'total_remaining_to_spend' => round($totalRemaining, 2),
            ],
            'rows' => $rows,
        ];
    }

    /** @return list<array{id: int, label: string}> */
    public function expenseTargetFilterOptions(): array
    {
        return ExpenseTarget::query()
            ->with(['user:id,name', 'budgetType:id,name'])
            ->where('status', true)
            ->orderByDesc('year')
            ->orderByDesc('month')
            ->orderByDesc('id')
            ->get(['id', 'user_id', 'budget_type_id', 'month', 'year', 'amount'])
            ->map(function (ExpenseTarget $target) {
                $member = $target->user?->name ?? 'All';
                $type = $target->budgetType?->name ?? '—';
                $monthly = $this->expenseTargetMonthlyBudget((float) $target->amount);
                $daily = number_format(
                    $this->expenseTargetAmountPerDay(
                        (float) $target->amount,
                        (int) $target->month,
                        (int) $target->year,
                    ),
                    2,
                );
                $monthlyFormatted = number_format($monthly, 2);

                return [
                    'id' => $target->id,
                    'label' => "{$member} — {$type} — {$target->month}/{$target->year} — {$daily}/day — {$monthlyFormatted}",
                ];
            })
            ->all();
    }

    /**
     * @param  array<string, mixed>  $filters
     * @return array{
     *     filters: array<string, mixed>,
     *     summary: array{
     *         total_budget: float,
     *         total_expense: float,
     *         total_extra_cost: float,
     *         total_remaining_to_spend: float
     *     },
     *     rows: list<array<string, mixed>>
     * }
     */
    public function buildExpenseTargetReport(array $filters): array
    {
        $expenseTypeId = isset($filters['expense_id']) && $filters['expense_id'] !== null
            ? (int) $filters['expense_id']
            : null;

        $dateFrom = $filters['date_from'] ?? null;
        $dateTo = $filters['date_to'] ?? null;

        if ($dateFrom !== null && $dateTo !== null) {
            [$dateFrom, $dateTo] = $this->resolveDateRange($dateFrom, $dateTo);
        } elseif ($dateFrom !== null || $dateTo !== null) {
            $dateFrom = $dateFrom ?? $dateTo;
            $dateTo = $dateTo ?? $dateFrom;
        }

        $targets = ExpenseTarget::query()
            ->with(['user:id,name,phone', 'budgetType:id,name'])
            ->where('status', true)
            ->when(
                isset($filters['user_id']) && $filters['user_id'] !== null,
                fn (Builder $builder) => $builder->where(function (Builder $query) use ($filters) {
                    $query->whereNull('user_id')
                        ->orWhere('user_id', (int) $filters['user_id']);
                }),
            )
            ->when(
                isset($filters['expense_target_id']) && $filters['expense_target_id'] !== null,
                fn (Builder $builder) => $builder->whereKey((int) $filters['expense_target_id']),
            )
            ->when(
                $dateFrom && $dateTo,
                fn (Builder $builder) => $builder
                    ->whereRaw(
                        "DATE(CONCAT(year, '-', LPAD(month, 2, '0'), '-01')) <= ?",
                        [$dateTo],
                    )
                    ->whereRaw(
                        "LAST_DAY(DATE(CONCAT(year, '-', LPAD(month, 2, '0'), '-01'))) >= ?",
                        [$dateFrom],
                    ),
            )
            ->when(
                isset($filters['month']) && $filters['month'] !== null,
                fn (Builder $builder) => $builder->where('month', (int) $filters['month']),
            )
            ->when(
                isset($filters['year']) && $filters['year'] !== null,
                fn (Builder $builder) => $builder->where('year', (int) $filters['year']),
            )
            ->when(
                isset($filters['month_from']) && $filters['month_from'] !== null,
                fn (Builder $builder) => $builder->where('month', '>=', (int) $filters['month_from']),
            )
            ->when(
                isset($filters['month_to']) && $filters['month_to'] !== null,
                fn (Builder $builder) => $builder->where('month', '<=', (int) $filters['month_to']),
            )
            ->when(
                isset($filters['year_from']) && $filters['year_from'] !== null,
                fn (Builder $builder) => $builder->where('year', '>=', (int) $filters['year_from']),
            )
            ->when(
                isset($filters['year_to']) && $filters['year_to'] !== null,
                fn (Builder $builder) => $builder->where('year', '<=', (int) $filters['year_to']),
            )
            ->orderByDesc('year')
            ->orderByDesc('month')
            ->orderByDesc('id')
            ->get();

        $rows = [];
        $totalBudget = 0.0;
        $totalExpense = 0.0;
        $totalExtra = 0.0;
        $totalRemaining = 0.0;
        $totalRemainingPerDay = 0.0;

        foreach ($targets as $target) {
            $expenseQuery = Expense::query()
                ->where('budget_type_id', $target->budget_type_id)
                ->where('month', $target->month)
                ->where('year', $target->year);

            if ($target->user_id !== null) {
                $expenseQuery->where('user_id', $target->user_id);
            } elseif (isset($filters['user_id']) && $filters['user_id'] !== null) {
                $expenseQuery->where('user_id', (int) $filters['user_id']);
            }

            if ($expenseTypeId !== null) {
                $expenseQuery->where('expense_type_id', $expenseTypeId);
            }

            if ($dateFrom && $dateTo) {
                $expenseQuery->whereNotNull('date')
                    ->whereDate('date', '>=', $dateFrom)
                    ->whereDate('date', '<=', $dateTo);
            }

            $spent = round((float) $expenseQuery->sum('amount'), 2);
            $month = (int) $target->month;
            $year = (int) $target->year;
            $daysInMonth = $this->daysInMonth($month, $year);
            $targetBudget = $this->expenseTargetMonthlyBudget((float) $target->amount);
            $amountPerDay = $this->expenseTargetAmountPerDay((float) $target->amount, $month, $year);
            $extraCost = $spent > $targetBudget ? round($spent - $targetBudget, 2) : 0.0;
            $remaining = $spent < $targetBudget ? round($targetBudget - $spent, 2) : 0.0;
            $remainingPerDay = $spent < $targetBudget
                ? max(0.0, round($amountPerDay - $spent, 2))
                : 0.0;
            $completed = $remainingPerDay <= 0.0 && $extraCost <= 0.0;

            $totalBudget += $targetBudget;
            $totalExpense += $spent;
            $totalExtra += $extraCost;
            $totalRemaining += $remaining;
            $totalRemainingPerDay += $remainingPerDay;

            $rows[] = [
                'id' => $target->id,
                'member_name' => $target->user?->name ?? '—',
                'budget_type_name' => $target->budgetType?->name ?? '—',
                'month' => $target->month,
                'year' => $target->year,
                'amount_per_day' => $amountPerDay,
                'days_in_month' => $daysInMonth,
                'budget_amount' => $targetBudget,
                'total_expense' => $spent,
                'mission_completed' => $completed,
                'extra_cost' => $extraCost,
                'remaining_to_spend' => $remaining,
                'remaining_per_day' => $remainingPerDay,
            ];
        }

        return [
            'filters' => [
                'date_from' => $dateFrom,
                'date_to' => $dateTo,
                'user_id' => isset($filters['user_id']) && $filters['user_id'] !== null
                    ? (int) $filters['user_id']
                    : null,
                'expense_target_id' => isset($filters['expense_target_id']) && $filters['expense_target_id'] !== null
                    ? (int) $filters['expense_target_id']
                    : null,
                'expense_id' => $expenseTypeId,
                'month' => isset($filters['month']) && $filters['month'] !== null
                    ? (int) $filters['month']
                    : null,
                'year' => isset($filters['year']) && $filters['year'] !== null
                    ? (int) $filters['year']
                    : null,
                'month_from' => isset($filters['month_from']) && $filters['month_from'] !== null
                    ? (int) $filters['month_from']
                    : null,
                'month_to' => isset($filters['month_to']) && $filters['month_to'] !== null
                    ? (int) $filters['month_to']
                    : null,
                'year_from' => isset($filters['year_from']) && $filters['year_from'] !== null
                    ? (int) $filters['year_from']
                    : null,
                'year_to' => isset($filters['year_to']) && $filters['year_to'] !== null
                    ? (int) $filters['year_to']
                    : null,
            ],
            'summary' => [
                'total_budget' => round($totalBudget, 2),
                'total_expense' => round($totalExpense, 2),
                'total_extra_cost' => round($totalExtra, 2),
                'total_remaining_to_spend' => round($totalRemaining, 2),
                'total_remaining_per_day' => round($totalRemainingPerDay, 2),
            ],
            'rows' => $rows,
        ];
    }
}
