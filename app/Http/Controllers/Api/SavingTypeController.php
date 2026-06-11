<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Api\Concerns\AuthorizesApiAccess;
use App\Http\Controllers\Controller;
use App\Http\Requests\StoreSavingTypeRequest;
use App\Http\Requests\UpdateSavingTypeRequest;
use App\Http\Traits\ApiResponseTrait;
use App\Models\SavingType;
use App\Services\SavingTypeService;
use Illuminate\Http\JsonResponse;

class SavingTypeController extends Controller
{
    use ApiResponseTrait;
    use AuthorizesApiAccess;

    public function __construct(private readonly SavingTypeService $savingTypeService) {}

    public function index(): JsonResponse
    {
        $this->authorizeApiPermission('saving_type_list');

        return $this->successResponse(
            $this->savingTypeService->listSavingTypes(),
            'saving type list retrieved successfully.',
        );
    }

    public function store(StoreSavingTypeRequest $request): JsonResponse
    {
        $this->authorizeApiPermission('saving_type_create');

        $item = $this->savingTypeService->createSavingType($request->validated());
        if (! $item) {
            return $this->errorResponse('Failed to create saving type.', 422);
        }

        return $this->successResponse($item, 'saving type created successfully.', 201);
    }

    public function update(UpdateSavingTypeRequest $request, SavingType $savingType): JsonResponse
    {
        $this->authorizeApiPermission('saving_type_edit');

        $this->savingTypeService->updateSavingType($savingType, $request->validated());

        return $this->successResponse($savingType->fresh(), 'saving type updated successfully.');
    }

    public function destroy(SavingType $savingType): JsonResponse
    {
        $this->authorizeApiPermission('saving_type_delete');

        $this->savingTypeService->deleteSavingType($savingType);

        return $this->successResponse(null, 'saving type deleted successfully.');
    }
}
