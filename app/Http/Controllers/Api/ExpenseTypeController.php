<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Api\Concerns\AuthorizesApiAccess;
use App\Http\Controllers\Controller;
use App\Http\Requests\StoreExpenseTypeRequest;
use App\Http\Requests\UpdateExpenseTypeRequest;
use App\Http\Traits\ApiResponseTrait;
use App\Models\ExpenseType;
use App\Services\ExpenseTypeService;
use Illuminate\Http\JsonResponse;

class ExpenseTypeController extends Controller
{
    use ApiResponseTrait;
    use AuthorizesApiAccess;

    public function __construct(private readonly ExpenseTypeService $expenseTypeService) {}

    public function index(): JsonResponse
    {
        $this->authorizeApiPermission('expense_type_list');

        return $this->successResponse(
            $this->expenseTypeService->listExpenseTypes(),
            'expense type list retrieved successfully.',
        );
    }

    public function store(StoreExpenseTypeRequest $request): JsonResponse
    {
        $this->authorizeApiPermission('expense_type_create');

        $item = $this->expenseTypeService->createExpenseType($request->validated());
        if (! $item) {
            return $this->errorResponse('Failed to create expense type.', 422);
        }

        return $this->successResponse($item, 'expense type created successfully.', 201);
    }

    public function update(UpdateExpenseTypeRequest $request, ExpenseType $expenseType): JsonResponse
    {
        $this->authorizeApiPermission('expense_type_edit');

        $this->expenseTypeService->updateExpenseType($expenseType, $request->validated());

        return $this->successResponse($expenseType->fresh(), 'expense type updated successfully.');
    }

    public function destroy(ExpenseType $expenseType): JsonResponse
    {
        $this->authorizeApiPermission('expense_type_delete');

        $this->expenseTypeService->deleteExpenseType($expenseType);

        return $this->successResponse(null, 'expense type deleted successfully.');
    }
}
