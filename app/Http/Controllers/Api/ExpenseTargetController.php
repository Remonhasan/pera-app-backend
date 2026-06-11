<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Api\Concerns\AuthorizesApiAccess;
use App\Http\Controllers\Controller;
use App\Http\Requests\StoreExpenseTargetRequest;
use App\Http\Requests\UpdateExpenseTargetRequest;
use App\Http\Traits\ApiResponseTrait;
use App\Models\ExpenseTarget;
use App\Services\BudgetTypeService;
use App\Services\ExpenseTargetService;
use Illuminate\Http\JsonResponse;

class ExpenseTargetController extends Controller
{
    use ApiResponseTrait;
    use AuthorizesApiAccess;

    public function __construct(
        private readonly ExpenseTargetService $expenseTargetService,
        private readonly BudgetTypeService $budgetTypeService,
    ) {}

    public function index(): JsonResponse
    {
        $this->authorizeApiPermission('expense_target_list');

        return $this->successResponse([
            'expenseTargets' => $this->expenseTargetService->listExpenseTargets(),
            'budgetTypes' => $this->budgetTypeService->budgetTypeOptions(),
            'members' => $this->expenseTargetService->memberOptions(),
        ], 'Expense target list retrieved successfully.');
    }

    public function store(StoreExpenseTargetRequest $request): JsonResponse
    {
        $this->authorizeApiPermission('expense_target_create');

        $expenseTarget = $this->expenseTargetService->createExpenseTarget($request->validated());
        if (! $expenseTarget) {
            return $this->errorResponse('Failed to create expense target.', 422);
        }

        return $this->successResponse($expenseTarget, 'Expense target created successfully.', 201);
    }

    public function update(UpdateExpenseTargetRequest $request, ExpenseTarget $expenseTarget): JsonResponse
    {
        $this->authorizeApiPermission('expense_target_edit');

        $this->expenseTargetService->updateExpenseTarget($expenseTarget, $request->validated());

        return $this->successResponse($expenseTarget->fresh(), 'Expense target updated successfully.');
    }

    public function destroy(ExpenseTarget $expenseTarget): JsonResponse
    {
        $this->authorizeApiPermission('expense_target_delete');

        $this->expenseTargetService->deleteExpenseTarget($expenseTarget);

        return $this->successResponse(null, 'Expense target deleted successfully.');
    }
}
