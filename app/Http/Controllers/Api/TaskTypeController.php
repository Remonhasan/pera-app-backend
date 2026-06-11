<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Api\Concerns\AuthorizesApiAccess;
use App\Http\Controllers\Controller;
use App\Http\Requests\StoreTaskTypeRequest;
use App\Http\Requests\UpdateTaskTypeRequest;
use App\Http\Traits\ApiResponseTrait;
use App\Models\TaskType;
use App\Services\TaskTypeService;
use Illuminate\Http\JsonResponse;

class TaskTypeController extends Controller
{
    use ApiResponseTrait;
    use AuthorizesApiAccess;

    public function __construct(private readonly TaskTypeService $taskTypeService) {}

    public function index(): JsonResponse
    {
        $this->authorizeApiPermission('task_type_list');

        return $this->successResponse(
            $this->taskTypeService->listTaskTypes(),
            'task type list retrieved successfully.',
        );
    }

    public function store(StoreTaskTypeRequest $request): JsonResponse
    {
        $this->authorizeApiPermission('task_type_create');

        $item = $this->taskTypeService->createTaskType($request->validated());
        if (! $item) {
            return $this->errorResponse('Failed to create task type.', 422);
        }

        return $this->successResponse($item, 'task type created successfully.', 201);
    }

    public function update(UpdateTaskTypeRequest $request, TaskType $taskType): JsonResponse
    {
        $this->authorizeApiPermission('task_type_edit');

        $this->taskTypeService->updateTaskType($taskType, $request->validated());

        return $this->successResponse($taskType->fresh(), 'task type updated successfully.');
    }

    public function destroy(TaskType $taskType): JsonResponse
    {
        $this->authorizeApiPermission('task_type_delete');

        $this->taskTypeService->deleteTaskType($taskType);

        return $this->successResponse(null, 'task type deleted successfully.');
    }
}
