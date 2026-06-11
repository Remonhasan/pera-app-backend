<?php

namespace App\Services;

use App\Models\TaskType;
use App\Repositories\Contracts\TaskTypeRepositoryInterface;
use Illuminate\Support\Collection;

class TaskTypeService
{
    public function __construct(private readonly TaskTypeRepositoryInterface $taskTypes) {}

    public function listTaskTypes(): Collection
    {
        return $this->taskTypes->all();
    }

    /** @param  array<string, mixed>  $validated */
    public function createTaskType(array $validated): ?TaskType
    {
        return $this->taskTypes->create([
            'name' => $validated['name'],
            'status' => $validated['status'] ?? true,
        ]);
    }

    /** @param  array<string, mixed>  $validated */
    public function updateTaskType(TaskType $taskType, array $validated): bool
    {
        $payload = [];

        if (array_key_exists('name', $validated)) {
            $payload['name'] = $validated['name'];
        }
        if (array_key_exists('status', $validated)) {
            $payload['status'] = (bool) $validated['status'];
        }

        return $this->taskTypes->update($taskType, $payload);
    }

    public function deleteTaskType(TaskType $taskType): bool
    {
        return $this->taskTypes->delete($taskType);
    }
}
