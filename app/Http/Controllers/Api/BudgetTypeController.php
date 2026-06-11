<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Api\Concerns\AuthorizesApiAccess;
use App\Http\Controllers\Controller;
use App\Http\Requests\StoreBudgetTypeRequest;
use App\Http\Requests\UpdateBudgetTypeRequest;
use App\Http\Traits\ApiResponseTrait;
use App\Models\BudgetType;
use App\Services\BudgetTypeService;
use Illuminate\Http\JsonResponse;

class BudgetTypeController extends Controller
{
    use ApiResponseTrait;
    use AuthorizesApiAccess;

    public function __construct(private readonly BudgetTypeService $budgetTypeService) {}

    public function index(): JsonResponse
    {
        $this->authorizeApiPermission('budget_type_list');

        return $this->successResponse(
            $this->budgetTypeService->listBudgetTypes(),
            'budget type list retrieved successfully.',
        );
    }

    public function store(StoreBudgetTypeRequest $request): JsonResponse
    {
        $this->authorizeApiPermission('budget_type_create');

        $item = $this->budgetTypeService->createBudgetType($request->validated());
        if (! $item) {
            return $this->errorResponse('Failed to create budget type.', 422);
        }

        return $this->successResponse($item, 'budget type created successfully.', 201);
    }

    public function update(UpdateBudgetTypeRequest $request, BudgetType $budgetType): JsonResponse
    {
        $this->authorizeApiPermission('budget_type_edit');

        $this->budgetTypeService->updateBudgetType($budgetType, $request->validated());

        return $this->successResponse($budgetType->fresh(), 'budget type updated successfully.');
    }

    public function destroy(BudgetType $budgetType): JsonResponse
    {
        $this->authorizeApiPermission('budget_type_delete');

        $this->budgetTypeService->deleteBudgetType($budgetType);

        return $this->successResponse(null, 'budget type deleted successfully.');
    }
}
