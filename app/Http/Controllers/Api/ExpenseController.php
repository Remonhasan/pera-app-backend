<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Api\Concerns\AuthorizesApiAccess;
use App\Http\Controllers\Controller;
use App\Http\Requests\StoreExpenseRequest;
use App\Http\Requests\UpdateExpenseRequest;
use App\Http\Traits\ApiResponseTrait;
use App\Models\Expense;
use App\Services\BudgetTypeService;
use App\Services\ExpenseService;
use App\Services\ExpenseTypeService;
use App\Support\ApiUserContext;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ExpenseController extends Controller
{
    use ApiResponseTrait;
    use AuthorizesApiAccess;

    public function __construct(
        private readonly ExpenseService $expenseService,
        private readonly ExpenseTypeService $expenseTypeService,
        private readonly BudgetTypeService $budgetTypeService,
    ) {}

    public function index(): JsonResponse
    {
        $this->authorizeApiPermission('expense_list');

        return $this->successResponse([
            'expenses' => $this->expenseService->listExpenses(),
            'members' => $this->expenseService->memberOptions(),
            'expenseTypes' => $this->expenseTypeService->expenseTypeOptions(),
            'budgetTypes' => $this->budgetTypeService->budgetTypeOptions(),
        ], 'Expense list retrieved successfully.');
    }

    public function store(StoreExpenseRequest $request): JsonResponse
    {
        $this->authorizeApiPermission('expense_create');

        $validated = $request->validated();
        $file = $request->file('image');
        unset($validated['image']);

        $expense = $this->expenseService->createExpense(
            $validated,
            $file,
            ApiUserContext::actorId(),
        );

        if (! $expense) {
            return $this->errorResponse('Failed to create expense.', 422);
        }

        return $this->successResponse($expense, 'Expense created successfully.', 201);
    }

    public function update(UpdateExpenseRequest $request, Expense $expense): JsonResponse
    {
        $this->authorizeApiPermission('expense_edit');

        $validated = $request->validated();
        $file = $request->file('image');
        $clearImage = (bool) ($validated['clear_expense_image'] ?? false);
        unset($validated['image'], $validated['clear_expense_image']);

        $this->expenseService->updateExpense(
            $expense,
            $validated,
            $file,
            $clearImage,
            ApiUserContext::actorId(),
        );

        return $this->successResponse($expense->fresh(), 'Expense updated successfully.');
    }

    public function destroy(Expense $expense): JsonResponse
    {
        $this->authorizeApiPermission('expense_delete');

        $this->expenseService->deleteExpense($expense);

        return $this->successResponse(null, 'Expense deleted successfully.');
    }

    public function image(Request $request, Expense $expense): StreamedResponse
    {
        $this->authorizeApiPermission('expense_list');

        $path = $expense->image;
        if (! $path || ! Storage::disk('public_dir')->exists($path)) {
            abort(404);
        }

        return Storage::disk('public_dir')->response($path, basename($path), [
            'Content-Disposition' => 'inline',
        ]);
    }
}
