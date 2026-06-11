<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Api\Concerns\AuthorizesApiAccess;
use App\Http\Controllers\Controller;
use App\Http\Requests\StoreBudgetRequest;
use App\Http\Requests\UpdateBudgetRequest;
use App\Http\Traits\ApiResponseTrait;
use App\Models\Budget;
use App\Services\BudgetService;
use App\Services\BudgetTypeService;
use App\Support\ApiUserContext;
use Illuminate\Http\JsonResponse;

class BudgetController extends Controller
{
    use ApiResponseTrait;
    use AuthorizesApiAccess;

    public function __construct(
        private readonly BudgetService $budgetService,
        private readonly BudgetTypeService $budgetTypeService,
    ) {}

    public function index(): JsonResponse
    {
        $this->authorizeApiPermission('budget_list');

        return $this->successResponse([
            'budgets' => $this->budgetService->listBudgets(),
            'budgetTypes' => $this->budgetTypeService->budgetTypeOptions(),
            'members' => $this->budgetService->memberOptions(),
        ], 'Budget list retrieved successfully.');
    }

    public function store(StoreBudgetRequest $request): JsonResponse
    {
        $this->authorizeApiPermission('budget_create');

        $budget = $this->budgetService->createBudget(
            $request->validated(),
            ApiUserContext::actorId(),
        );

        if (! $budget) {
            return $this->errorResponse('Failed to create budget.', 422);
        }

        return $this->successResponse($budget, 'Budget created successfully.', 201);
    }

    public function update(UpdateBudgetRequest $request, Budget $budget): JsonResponse
    {
        $this->authorizeApiPermission('budget_edit');

        $this->budgetService->updateBudget(
            $budget,
            $request->validated(),
            ApiUserContext::actorId(),
        );

        return $this->successResponse($budget->fresh(), 'Budget updated successfully.');
    }

    public function destroy(Budget $budget): JsonResponse
    {
        $this->authorizeApiPermission('budget_delete');

        $this->budgetService->deleteBudget($budget);

        return $this->successResponse(null, 'Budget deleted successfully.');
    }
}
