<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Api\Concerns\AuthorizesApiAccess;
use App\Http\Controllers\Controller;
use App\Http\Requests\StoreTaskRequest;
use App\Http\Requests\UpdateTaskRequest;
use App\Http\Traits\ApiResponseTrait;
use App\Models\Task;
use App\Services\TaskService;
use App\Support\ApiUserContext;
use Illuminate\Http\JsonResponse;

class TaskController extends Controller
{
    use ApiResponseTrait;
    use AuthorizesApiAccess;

    public function __construct(private readonly TaskService $taskService) {}

    public function index(): JsonResponse
    {
        $this->authorizeApiPermission('task_list');

        return $this->successResponse([
            'tasks' => $this->taskService->listTasks(),
            'members' => $this->taskService->memberOptions(),
        ], 'Task list retrieved successfully.');
    }

    public function store(StoreTaskRequest $request): JsonResponse
    {
        $this->authorizeApiPermission('task_create');

        $task = $this->taskService->createTask(
            $request->validated(),
            ApiUserContext::actorId(),
        );

        if (! $task) {
            return $this->errorResponse('Failed to create task.', 422);
        }

        return $this->successResponse($task, 'Task created successfully.', 201);
    }

    public function update(UpdateTaskRequest $request, Task $task): JsonResponse
    {
        $this->authorizeApiPermission('task_edit');

        $this->taskService->updateTask(
            $task,
            $request->validated(),
            ApiUserContext::actorId(),
        );

        return $this->successResponse($task->fresh(), 'Task updated successfully.');
    }

    public function destroy(Task $task): JsonResponse
    {
        $this->authorizeApiPermission('task_delete');

        $this->taskService->deleteTask($task);

        return $this->successResponse(null, 'Task deleted successfully.');
    }
}
