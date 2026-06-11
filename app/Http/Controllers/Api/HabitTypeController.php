<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Api\Concerns\AuthorizesApiAccess;
use App\Http\Controllers\Controller;
use App\Http\Requests\StoreHabitTypeRequest;
use App\Http\Requests\UpdateHabitTypeRequest;
use App\Http\Traits\ApiResponseTrait;
use App\Models\HabitType;
use App\Services\HabitTypeService;
use Illuminate\Http\JsonResponse;

class HabitTypeController extends Controller
{
    use ApiResponseTrait;
    use AuthorizesApiAccess;

    public function __construct(private readonly HabitTypeService $habitTypeService) {}

    public function index(): JsonResponse
    {
        $this->authorizeApiPermission('habit_type_list');

        return $this->successResponse(
            $this->habitTypeService->listHabitTypes(),
            'habit type list retrieved successfully.',
        );
    }

    public function store(StoreHabitTypeRequest $request): JsonResponse
    {
        $this->authorizeApiPermission('habit_type_create');

        $item = $this->habitTypeService->createHabitType($request->validated());
        if (! $item) {
            return $this->errorResponse('Failed to create habit type.', 422);
        }

        return $this->successResponse($item, 'habit type created successfully.', 201);
    }

    public function update(UpdateHabitTypeRequest $request, HabitType $habitType): JsonResponse
    {
        $this->authorizeApiPermission('habit_type_edit');

        $this->habitTypeService->updateHabitType($habitType, $request->validated());

        return $this->successResponse($habitType->fresh(), 'habit type updated successfully.');
    }

    public function destroy(HabitType $habitType): JsonResponse
    {
        $this->authorizeApiPermission('habit_type_delete');

        $this->habitTypeService->deleteHabitType($habitType);

        return $this->successResponse(null, 'habit type deleted successfully.');
    }
}
