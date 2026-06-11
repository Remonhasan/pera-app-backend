<?php

namespace App\Providers;

use App\Repositories\Contracts\BudgetRepositoryInterface;
use App\Repositories\Contracts\BudgetTypeRepositoryInterface;
use App\Repositories\Contracts\BankRepositoryInterface;
use App\Repositories\Contracts\ExpenseRepositoryInterface;
use App\Repositories\Contracts\ExpenseTargetRepositoryInterface;
use App\Repositories\Contracts\ExpenseTypeRepositoryInterface;
use App\Repositories\Contracts\SavingRepositoryInterface;
use App\Repositories\Contracts\SavingTypeRepositoryInterface;
use App\Repositories\Contracts\WithdrawRepositoryInterface;
use App\Repositories\Contracts\JobTypeRepositoryInterface;
use App\Repositories\Contracts\SubjectRepositoryInterface;
use App\Repositories\Contracts\TopicRepositoryInterface;
use App\Repositories\Contracts\NoteRepositoryInterface;
use App\Repositories\Contracts\TaskTypeRepositoryInterface;
use App\Repositories\Contracts\TaskRepositoryInterface;
use App\Repositories\Contracts\HabitTypeRepositoryInterface;
use App\Repositories\Contracts\HabitRepositoryInterface;
use App\Repositories\Contracts\GoalRepositoryInterface;
use App\Repositories\Contracts\StudyGoalRepositoryInterface;
use App\Repositories\Contracts\ExamRepositoryInterface;
use App\Repositories\Contracts\NoticeRepositoryInterface;
use App\Repositories\Contracts\PermissionRepositoryInterface;
use App\Repositories\Contracts\RoleRepositoryInterface;
use App\Repositories\Contracts\UserRepositoryInterface;
use App\Repositories\EloquentBudgetRepository;
use App\Repositories\EloquentBudgetTypeRepository;
use App\Repositories\EloquentBankRepository;
use App\Repositories\EloquentExpenseRepository;
use App\Repositories\EloquentExpenseTargetRepository;
use App\Repositories\EloquentExpenseTypeRepository;
use App\Repositories\EloquentSavingRepository;
use App\Repositories\EloquentSavingTypeRepository;
use App\Repositories\EloquentWithdrawRepository;
use App\Repositories\EloquentJobTypeRepository;
use App\Repositories\EloquentSubjectRepository;
use App\Repositories\EloquentTopicRepository;
use App\Repositories\EloquentNoteRepository;
use App\Repositories\EloquentTaskTypeRepository;
use App\Repositories\EloquentTaskRepository;
use App\Repositories\EloquentHabitTypeRepository;
use App\Repositories\EloquentHabitRepository;
use App\Repositories\EloquentGoalRepository;
use App\Repositories\EloquentStudyGoalRepository;
use App\Repositories\EloquentExamRepository;
use App\Repositories\EloquentNoticeRepository;
use App\Repositories\EloquentPermissionRepository;
use App\Repositories\EloquentRoleRepository;
use App\Repositories\EloquentUserRepository;
use Illuminate\Support\Facades\Vite;
use Illuminate\Support\ServiceProvider;
use Inertia\Inertia;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->bind(UserRepositoryInterface::class, EloquentUserRepository::class);
        $this->app->bind(RoleRepositoryInterface::class, EloquentRoleRepository::class);
        $this->app->bind(PermissionRepositoryInterface::class, EloquentPermissionRepository::class);
        $this->app->bind(NoticeRepositoryInterface::class, EloquentNoticeRepository::class);
        $this->app->bind(BudgetTypeRepositoryInterface::class, EloquentBudgetTypeRepository::class);
        $this->app->bind(BudgetRepositoryInterface::class, EloquentBudgetRepository::class);
        $this->app->bind(ExpenseTargetRepositoryInterface::class, EloquentExpenseTargetRepository::class);
        $this->app->bind(ExpenseTypeRepositoryInterface::class, EloquentExpenseTypeRepository::class);
        $this->app->bind(ExpenseRepositoryInterface::class, EloquentExpenseRepository::class);
        $this->app->bind(BankRepositoryInterface::class, EloquentBankRepository::class);
        $this->app->bind(SavingTypeRepositoryInterface::class, EloquentSavingTypeRepository::class);
        $this->app->bind(SavingRepositoryInterface::class, EloquentSavingRepository::class);
        $this->app->bind(WithdrawRepositoryInterface::class, EloquentWithdrawRepository::class);
        $this->app->bind(JobTypeRepositoryInterface::class, EloquentJobTypeRepository::class);
        $this->app->bind(SubjectRepositoryInterface::class, EloquentSubjectRepository::class);
        $this->app->bind(TopicRepositoryInterface::class, EloquentTopicRepository::class);
        $this->app->bind(NoteRepositoryInterface::class, EloquentNoteRepository::class);
        $this->app->bind(TaskTypeRepositoryInterface::class, EloquentTaskTypeRepository::class);
        $this->app->bind(TaskRepositoryInterface::class, EloquentTaskRepository::class);
        $this->app->bind(HabitTypeRepositoryInterface::class, EloquentHabitTypeRepository::class);
        $this->app->bind(HabitRepositoryInterface::class, EloquentHabitRepository::class);
        $this->app->bind(GoalRepositoryInterface::class, EloquentGoalRepository::class);
        $this->app->bind(StudyGoalRepositoryInterface::class, EloquentStudyGoalRepository::class);
        $this->app->bind(ExamRepositoryInterface::class, EloquentExamRepository::class);
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Vite::prefetch(concurrency: 3);

        // Share translatable locales with Inertia
        Inertia::share([
            'locales' => config('translatable.locales'),
        ]);
    }
}
