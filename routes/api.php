<?php

use App\Http\Controllers\Api\AdminAuthController;
use App\Http\Controllers\Api\AdminDashboardController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\BankController;
use App\Http\Controllers\Api\BudgetController;
use App\Http\Controllers\Api\BudgetTypeController;
use App\Http\Controllers\Api\ExamController;
use App\Http\Controllers\Api\ExpenseController;
use App\Http\Controllers\Api\ExpenseTargetController;
use App\Http\Controllers\Api\ExpenseTypeController;
use App\Http\Controllers\Api\FileUploadController;
use App\Http\Controllers\Api\GoalController;
use App\Http\Controllers\Api\HabitController;
use App\Http\Controllers\Api\HabitTypeController;
use App\Http\Controllers\Api\JobTypeController;
use App\Http\Controllers\Api\MemberAuthController;
use App\Http\Controllers\Api\MemberDashboardController;
use App\Http\Controllers\Api\MemberNoticeController;
use App\Http\Controllers\Api\MembersController;
use App\Http\Controllers\Api\NoteController;
use App\Http\Controllers\Api\NoticeController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Api\PermissionController;
use App\Http\Controllers\Api\ReportController;
use App\Http\Controllers\Api\RoleController;
use App\Http\Controllers\Api\SavingController;
use App\Http\Controllers\Api\SavingTypeController;
use App\Http\Controllers\Api\StudyGoalController;
use App\Http\Controllers\Api\SubjectController;
use App\Http\Controllers\Api\TaskController;
use App\Http\Controllers\Api\TaskTypeController;
use App\Http\Controllers\Api\TopicController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\WithdrawController;
use Illuminate\Support\Facades\Route;

Route::post('login', [MemberAuthController::class, 'login'])->name('api.login');
Route::post('admin/login', [AdminAuthController::class, 'login'])->name('api.admin.login');

Route::middleware('auth:api')->group(function () {
    Route::get('me', [AuthController::class, 'me'])->name('api.me');
    Route::post('logout', [MemberAuthController::class, 'logout'])->name('api.logout');

    Route::get('dashboard', [MemberDashboardController::class, 'index'])->name('api.dashboard');
    Route::get('admin/dashboard', [AdminDashboardController::class, 'index'])->name('api.admin.dashboard');

    Route::get('members', [MembersController::class, 'index'])->name('api.members');
    Route::get('notices', [MemberNoticeController::class, 'index'])->name('api.notices');

    Route::post('files/upload', [FileUploadController::class, 'upload'])->name('api.files.upload');
    Route::post('files/delete', [FileUploadController::class, 'delete'])->name('api.files.delete');

    Route::get('users', [UserController::class, 'index'])->name('api.users.index');
    Route::post('users', [UserController::class, 'store'])->name('api.users.store');
    Route::get('users/{user}', [UserController::class, 'show'])->name('api.users.show');
    Route::match(['put', 'patch', 'post'], 'users/{user}', [UserController::class, 'update'])->name('api.users.update');
    Route::post('users/{user}/status', [UserController::class, 'updateStatus'])->name('api.users.status');
    Route::delete('users/{user}', [UserController::class, 'destroy'])->name('api.users.destroy');

    Route::apiResource('permissions', PermissionController::class)->except(['show']);
    Route::apiResource('roles', RoleController::class)->except(['show']);

    Route::apiResource('budget-types', BudgetTypeController::class)->except(['show']);
    Route::apiResource('budgets', BudgetController::class)->except(['show']);
    Route::apiResource('expense-targets', ExpenseTargetController::class)->except(['show']);
    Route::apiResource('expense-types', ExpenseTypeController::class)->except(['show']);
    Route::get('expenses/{expense}/image', [ExpenseController::class, 'image'])->name('api.expenses.image');
    Route::apiResource('expenses', ExpenseController::class)->except(['show']);
    Route::apiResource('banks', BankController::class)->except(['show']);
    Route::apiResource('saving-types', SavingTypeController::class)->except(['show']);
    Route::get('savings/{saving}/image', [SavingController::class, 'image'])->name('api.savings.image');
    Route::apiResource('savings', SavingController::class)->except(['show']);
    Route::get('withdraws/{withdraw}/image', [WithdrawController::class, 'image'])->name('api.withdraws.image');
    Route::apiResource('withdraws', WithdrawController::class)->except(['show']);
    Route::apiResource('goals', GoalController::class)->except(['show']);
    Route::apiResource('job-types', JobTypeController::class)->except(['show']);
    Route::apiResource('subjects', SubjectController::class)->except(['show']);
    Route::apiResource('topics', TopicController::class)->except(['show']);
    Route::get('notes/{note}/file', [NoteController::class, 'file'])->name('api.notes.file');
    Route::apiResource('notes', NoteController::class)->except(['show']);
    Route::get('study-goals/export-pdf', [StudyGoalController::class, 'exportPdf'])->name('api.study-goals.export-pdf');
    Route::apiResource('study-goals', StudyGoalController::class)->except(['show']);
    Route::get('exams/export-pdf', [ExamController::class, 'exportPdf'])->name('api.exams.export-pdf');
    Route::get('exams/{exam}/file', [ExamController::class, 'file'])->name('api.exams.file');
    Route::apiResource('exams', ExamController::class)->except(['show']);
    Route::apiResource('task-types', TaskTypeController::class)->except(['show']);
    Route::apiResource('tasks', TaskController::class)->except(['show']);
    Route::apiResource('habit-types', HabitTypeController::class)->except(['show']);
    Route::apiResource('habits', HabitController::class)->except(['show']);
    Route::apiResource('admin-notices', NoticeController::class)->except(['show']);

    Route::prefix('reports')->name('api.reports.')->group(function () {
        Route::get('daily-expense', [ReportController::class, 'dailyExpense'])->name('daily-expense');
        Route::get('daily-expense/export-pdf', [ReportController::class, 'dailyExpenseExportPdf'])->name('daily-expense.export-pdf');
        Route::get('expense-track', [ReportController::class, 'expenseTrack'])->name('expense-track');
        Route::get('expense-track/export-pdf', [ReportController::class, 'expenseTrackExportPdf'])->name('expense-track.export-pdf');
        Route::get('expense-target', [ReportController::class, 'expenseTarget'])->name('expense-target');
        Route::get('expense-target/export-pdf', [ReportController::class, 'expenseTargetExportPdf'])->name('expense-target.export-pdf');
        Route::get('savings', [ReportController::class, 'savings'])->name('savings');
        Route::get('savings/export-pdf', [ReportController::class, 'savingsExportPdf'])->name('savings.export-pdf');
        Route::get('study', [ReportController::class, 'study'])->name('study');
        Route::get('study/export-pdf', [ReportController::class, 'studyExportPdf'])->name('study.export-pdf');
        Route::get('topicwise-study-goal', [ReportController::class, 'topicwiseStudyGoal'])->name('topicwise-study-goal');
        Route::get('topicwise-study-goal/export-pdf', [ReportController::class, 'topicwiseStudyGoalExportPdf'])->name('topicwise-study-goal.export-pdf');
    });

    Route::prefix('notifications')->name('api.notifications.')->group(function () {
        Route::get('/', [NotificationController::class, 'index'])->name('index');
        Route::get('/page', [NotificationController::class, 'page'])->name('page');
        Route::post('/mark-as-read/{notification}', [NotificationController::class, 'markAsRead'])->name('mark-as-read');
        Route::post('/mark-all-as-read', [NotificationController::class, 'markAllAsRead'])->name('mark-all-as-read');
        Route::get('/unread-count', [NotificationController::class, 'unreadCount'])->name('unread-count');
    });
});
