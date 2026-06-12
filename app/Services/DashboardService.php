<?php

namespace App\Services;

use App\Models\Budget;
use App\Models\Expense;
use App\Models\Goal;
use App\Models\Habit;
use App\Models\Note;
use App\Models\Saving;
use App\Models\StudyGoal;
use App\Models\Task;
use App\Models\User;
use App\Models\Withdraw;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Builder;

class DashboardService
{
    /**
     * @return array<string, mixed>
     */
    public function build(User $user, string $dateFrom, string $dateTo): array
    {
        $data = [];

        if ($this->userCan($user, 'budget_list')) {
            $data['budget'] = [
                'amount' => $this->sumInDateRange(Budget::query(), 'date', $dateFrom, $dateTo, 'amount'),
            ];
        }

        if ($this->userCan($user, 'expense_list')) {
            $data['expense'] = [
                'amount' => $this->sumInDateRange(Expense::query(), 'date', $dateFrom, $dateTo, 'amount'),
                'trend' => $this->dailyAmountTrend(
                    Expense::query(),
                    'date',
                    'amount',
                    $dateFrom,
                    $dateTo,
                ),
            ];
        }

        $savings = [];
        if ($this->userCan($user, 'saving_list')) {
            $savings['saved'] = $this->sumInDateRange(Saving::query(), 'date', $dateFrom, $dateTo, 'amount');
        }
        if ($this->userCan($user, 'withdraw_list')) {
            $savings['withdrawn'] = $this->sumInDateRange(Withdraw::query(), 'date', $dateFrom, $dateTo, 'amount');
        }
        if ($savings !== []) {
            $data['savings'] = $savings;
        }

        if ($this->userCan($user, 'goal_list')) {
            $goalsQuery = Goal::query()->where(function (Builder $query) use ($dateFrom, $dateTo) {
                $query->whereBetween('start_date', [$dateFrom, $dateTo])
                    ->orWhereBetween('end_date', [$dateFrom, $dateTo])
                    ->orWhere(function (Builder $overlap) use ($dateFrom, $dateTo) {
                        $overlap->whereNotNull('start_date')
                            ->whereNotNull('end_date')
                            ->whereDate('start_date', '<=', $dateTo)
                            ->whereDate('end_date', '>=', $dateFrom);
                    });
            });

            $data['goals'] = [
                'active' => (clone $goalsQuery)
                    ->whereIn('goal_status', [Goal::STATUS_PENDING, Goal::STATUS_DOING])
                    ->count(),
                'achieved' => (clone $goalsQuery)
                    ->where('goal_status', Goal::STATUS_ACHIEVED)
                    ->count(),
            ];
        }

        $study = [];
        if ($this->userCan($user, 'note_list')) {
            $study['notes'] = Note::query()
                ->whereDate('created_at', '>=', $dateFrom)
                ->whereDate('created_at', '<=', $dateTo)
                ->count();
        }
        if ($this->userCan($user, 'study_goal_list')) {
            $study['studyGoals'] = StudyGoal::query()
                ->where(function (Builder $query) use ($dateFrom, $dateTo) {
                    $query->whereBetween('date_from', [$dateFrom, $dateTo])
                        ->orWhereBetween('date_to', [$dateFrom, $dateTo])
                        ->orWhereBetween('extended_date', [$dateFrom, $dateTo])
                        ->orWhere(function (Builder $overlap) use ($dateFrom, $dateTo) {
                            $overlap->whereNotNull('date_from')
                                ->whereNotNull('date_to')
                                ->whereDate('date_from', '<=', $dateTo)
                                ->whereDate('date_to', '>=', $dateFrom);
                        });
                })
                ->count();
        }
        if ($study !== []) {
            $data['study'] = $study;
        }

        if ($this->userCan($user, 'task_list')) {
            $tasksQuery = Task::query()
                ->whereDate('created_at', '>=', $dateFrom)
                ->whereDate('created_at', '<=', $dateTo);

            $data['tasks'] = [
                'pending' => (clone $tasksQuery)->where('task_status', Task::STATUS_PENDING)->count(),
                'doing' => (clone $tasksQuery)->where('task_status', Task::STATUS_DOING)->count(),
                'completed' => (clone $tasksQuery)->where('task_status', Task::STATUS_COMPLETED)->count(),
            ];
        }

        if ($this->userCan($user, 'habit_list')) {
            $data['habits'] = [
                'total' => Habit::query()
                    ->whereDate('created_at', '>=', $dateFrom)
                    ->whereDate('created_at', '<=', $dateTo)
                    ->count(),
            ];
        }

        return $data;
    }

    private function userCan(User $user, string $permission): bool
    {
        return $user->hasPermissionTo($permission, User::ADMIN_GUARD);
    }

    private function sumInDateRange(
        Builder $query,
        string $dateColumn,
        string $dateFrom,
        string $dateTo,
        string $amountColumn,
    ): float {
        return round((float) (clone $query)
            ->whereNotNull($dateColumn)
            ->whereDate($dateColumn, '>=', $dateFrom)
            ->whereDate($dateColumn, '<=', $dateTo)
            ->sum($amountColumn), 2);
    }

    /**
     * @return list<array{date: string, amount: float}>
     */
    private function dailyAmountTrend(
        Builder $query,
        string $dateColumn,
        string $amountColumn,
        string $dateFrom,
        string $dateTo,
    ): array {
        $byDay = (clone $query)
            ->whereNotNull($dateColumn)
            ->whereDate($dateColumn, '>=', $dateFrom)
            ->whereDate($dateColumn, '<=', $dateTo)
            ->selectRaw("DATE({$dateColumn}) as day, COALESCE(SUM({$amountColumn}), 0) as total")
            ->groupBy('day')
            ->pluck('total', 'day');

        $start = Carbon::parse($dateFrom)->startOfDay();
        $end = Carbon::parse($dateTo)->startOfDay();
        $series = [];

        for ($cursor = $start->copy(); $cursor->lte($end); $cursor->addDay()) {
            $date = $cursor->format('Y-m-d');
            $series[] = [
                'date' => $date,
                'amount' => round((float) ($byDay[$date] ?? 0), 2),
            ];
        }

        return $series;
    }
}
