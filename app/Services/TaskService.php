<?php

namespace App\Services;

use App\Models\Task;
use App\Models\User;
use App\Repositories\Contracts\TaskRepositoryInterface;
use Illuminate\Support\Collection;

class TaskService
{
    public function __construct(private readonly TaskRepositoryInterface $tasks) {}

    public function listTasks(): Collection
    {
        return $this->tasks->allWithRelations();
    }

    /** @return list<array{id: int, name: string, phone: string|null}> */
    public function memberOptions(): array
    {
        return User::query()
            ->memberRole()
            ->orderBy('name')
            ->get(['id', 'name', 'phone'])
            ->map(fn (User $user) => [
                'id' => $user->id,
                'name' => $user->name,
                'phone' => $user->phone,
            ])
            ->all();
    }

    /** @param  array<string, mixed>  $validated */
    public function createTask(array $validated, ?int $actorId): ?Task
    {
        $payload = [
            'user_id' => (int) $validated['user_id'],
            'name' => $validated['name'],
            'description' => $validated['description'] ?? null,
            'status' => $validated['status'] ?? true,
            'task_status' => $validated['task_status'] ?? Task::STATUS_PENDING,
        ];

        if ($actorId !== null) {
            $payload['created_by'] = $actorId;
            $payload['updated_by'] = $actorId;
        }

        return $this->tasks->create($payload);
    }

    /** @param  array<string, mixed>  $validated */
    public function updateTask(Task $task, array $validated, ?int $actorId): bool
    {
        $payload = [];

        if (array_key_exists('user_id', $validated)) {
            $payload['user_id'] = (int) $validated['user_id'];
        }
        if (array_key_exists('name', $validated)) {
            $payload['name'] = $validated['name'];
        }
        if (array_key_exists('description', $validated)) {
            $payload['description'] = $validated['description'];
        }
        if (array_key_exists('status', $validated)) {
            $payload['status'] = (bool) $validated['status'];
        }
        if (array_key_exists('task_status', $validated)) {
            $payload['task_status'] = $validated['task_status'];
        }

        if ($actorId !== null) {
            $payload['updated_by'] = $actorId;
        }

        return $this->tasks->update($task, $payload);
    }

    public function deleteTask(Task $task): bool
    {
        return $this->tasks->delete($task);
    }
}
