<?php

use App\Http\Controllers\Administrative\AuthController;
use App\Http\Controllers\Administrative\BudgetController;
use App\Http\Controllers\Administrative\BudgetTypeController;
use App\Http\Controllers\Administrative\BankController;
use App\Http\Controllers\Administrative\ExpenseController;
use App\Http\Controllers\Administrative\ExpenseTargetController;
use App\Http\Controllers\Administrative\ExpenseTypeController;
use App\Http\Controllers\Administrative\SavingController;
use App\Http\Controllers\Administrative\SavingTypeController;
use App\Http\Controllers\Administrative\WithdrawController;
use App\Http\Controllers\Administrative\JobTypeController;
use App\Http\Controllers\Administrative\SubjectController;
use App\Http\Controllers\Administrative\TopicController;
use App\Http\Controllers\Administrative\NoteController;
use App\Http\Controllers\Administrative\TaskTypeController;
use App\Http\Controllers\Administrative\TaskController;
use App\Http\Controllers\Administrative\HabitTypeController;
use App\Http\Controllers\Administrative\HabitController;
use App\Http\Controllers\Administrative\GoalController;
use App\Http\Controllers\Administrative\StudyGoalController;
use App\Http\Controllers\Administrative\ExamController;
use App\Http\Controllers\Administrative\FileUploadController;
use App\Http\Controllers\Administrative\HomeController;
use App\Http\Controllers\Administrative\NoticeController;
use App\Http\Controllers\Administrative\ReportController;
use App\Http\Controllers\Administrative\NotificationController;
use App\Http\Controllers\Administrative\PermissionController;
use App\Http\Controllers\Administrative\RoleController;
use App\Http\Controllers\Administrative\UserController;
use App\Http\Controllers\LocaleController;
use Illuminate\Support\Facades\Route;

Route::redirect('/', '/administrative/dashboard');

Route::get('login', [AuthController::class, 'create'])->name('login');
Route::post('admin/login', [AuthController::class, 'store'])->name('login.store');

Route::post('locale', [LocaleController::class, 'update'])->name('locale.update');

Route::middleware('auth')->prefix('administrative')->name('administrative.')->group(function () {
    Route::get('/dashboard', [HomeController::class, 'index'])->name('dashboard');

    Route::get('logout', [AuthController::class, 'destroy'])->name('logout');

    Route::prefix('file')->group(function () {
        Route::post('upload', [FileUploadController::class, 'upload'])->name('file.upload');
        Route::post('delete', [FileUploadController::class, 'delete'])->name('file.delete');
    });

    Route::get('/user', [UserController::class, 'index'])->name('user.index');
    Route::post('/user', [UserController::class, 'store'])->name('user.store');
    Route::get('/user/{user}/edit', [UserController::class, 'edit'])->name('user.edit');
    Route::post('/user/{user}', [UserController::class, 'update'])->name('user.update');
    Route::post('/user/{user}/status', [UserController::class, 'updateStatus'])->name('user.status');
    Route::delete('/user/{user}', [UserController::class, 'destroy'])->name('user.destroy');
    Route::get('/user/export', [UserController::class, 'export'])->name('user.export');

    Route::resource('/permission', PermissionController::class)->except(['show', 'create', 'edit']);
    Route::resource('/role', RoleController::class)->except(['show', 'create', 'edit']);
    Route::resource('/budget-type', BudgetTypeController::class)->except(['show', 'create', 'edit']);
    Route::resource('/budget', BudgetController::class)->except(['show', 'create', 'edit']);
    Route::resource('/expense-target', ExpenseTargetController::class)->except(['show', 'create', 'edit']);
    Route::resource('/expense-type', ExpenseTypeController::class)->except(['show', 'create', 'edit']);
    Route::get('/expense/{expense}/image', [ExpenseController::class, 'expenseImage'])
        ->name('expense.image');
    Route::resource('/expense', ExpenseController::class)->except(['show', 'create', 'edit']);
    Route::resource('/bank', BankController::class)->except(['show', 'create', 'edit']);
    Route::resource('/saving-type', SavingTypeController::class)->except(['show', 'create', 'edit']);
    Route::get('/saving/{saving}/image', [SavingController::class, 'savingImage'])
        ->name('saving.image');
    Route::resource('/saving', SavingController::class)->except(['show', 'create', 'edit']);
    Route::get('/withdraw/{withdraw}/image', [WithdrawController::class, 'withdrawImage'])
        ->name('withdraw.image');
    Route::resource('/withdraw', WithdrawController::class)->except(['show', 'create', 'edit']);
    Route::resource('/goal', GoalController::class)->except(['show', 'create', 'edit']);
    Route::resource('/job-type', JobTypeController::class)->except(['show', 'create', 'edit']);
    Route::resource('/subject', SubjectController::class)->except(['show', 'create', 'edit']);
    Route::resource('/topic', TopicController::class)->except(['show', 'create', 'edit']);
    Route::get('/note/{note}/file', [NoteController::class, 'noteFile'])
        ->name('note.file');
    Route::resource('/note', NoteController::class)->except(['show', 'create', 'edit']);
    Route::get('/study-goal/export-pdf', [StudyGoalController::class, 'exportPdf'])
        ->name('study-goal.export-pdf');
    Route::resource('/study-goal', StudyGoalController::class)->except(['show', 'create', 'edit']);
    Route::get('/exam/export-pdf', [ExamController::class, 'exportPdf'])
        ->name('exam.export-pdf');
    Route::get('/exam/{exam}/file', [ExamController::class, 'examFile'])
        ->name('exam.file');
    Route::resource('/exam', ExamController::class)->except(['show', 'create', 'edit']);
    Route::resource('/task-type', TaskTypeController::class)->except(['show', 'create', 'edit']);
    Route::resource('/task', TaskController::class)->except(['show', 'create', 'edit']);
    Route::resource('/habit-type', HabitTypeController::class)->except(['show', 'create', 'edit']);
    Route::resource('/habit', HabitController::class)->except(['show', 'create', 'edit']);
    Route::resource('/notice', NoticeController::class)->except(['show', 'create', 'edit']);

    Route::prefix('report')->name('report.')->group(function () {
        Route::get('/daily-expense', [ReportController::class, 'dailyExpense'])->name('daily-expense.index');
        Route::get('/daily-expense/export-pdf', [ReportController::class, 'dailyExpenseExportPdf'])->name('daily-expense.export-pdf');
        Route::get('/expense-track', [ReportController::class, 'expenseTrack'])->name('expense-track.index');
        Route::get('/expense-track/export-pdf', [ReportController::class, 'expenseTrackExportPdf'])->name('expense-track.export-pdf');
        Route::get('/expense-target', [ReportController::class, 'expenseTarget'])->name('expense-target.index');
        Route::get('/expense-target/export-pdf', [ReportController::class, 'expenseTargetExportPdf'])->name('expense-target.export-pdf');
        Route::get('/savings', [ReportController::class, 'savings'])->name('savings.index');
        Route::get('/savings/export-pdf', [ReportController::class, 'savingsExportPdf'])->name('savings.export-pdf');
        Route::get('/study', [ReportController::class, 'study'])->name('study.index');
        Route::get('/study/export-pdf', [ReportController::class, 'studyExportPdf'])->name('study.export-pdf');
        Route::get('/topicwise-study-goal', [ReportController::class, 'topicwiseStudyGoal'])->name('topicwise-study-goal.index');
        Route::get('/topicwise-study-goal/export-pdf', [ReportController::class, 'topicwiseStudyGoalExportPdf'])->name('topicwise-study-goal.export-pdf');
    });

    Route::prefix('notifications')->group(function () {
        Route::get('/', [NotificationController::class, 'index'])->name('notifications.index');
        Route::get('/page', [NotificationController::class, 'page'])->name('notifications.page');
        Route::post('/mark-as-read/{notification}', [NotificationController::class, 'markAsRead'])->name('notifications.mark-as-read');
        Route::post('/mark-all-as-read', [NotificationController::class, 'markAllAsRead'])->name('notifications.mark-all-as-read');
        Route::get('/unread-count', [NotificationController::class, 'unreadCount'])->name('notifications.unread-count');
    });
});
