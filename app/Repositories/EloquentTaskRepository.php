<?php

namespace App\Repositories;

use App\Models\Task;
use App\Repositories\Contracts\TaskRepositoryInterface;
use Illuminate\Support\Collection;

class EloquentTaskRepository implements TaskRepositoryInterface
{
    public function allWithRelations(): Collection
    {
        return Task::query()
            ->with([
                'user:id,name,phone',
                'creator:id,name',
                'updater:id,name',
            ])
            ->orderByDesc('id')
            ->get();
    }

    public function create(array $attributes): Task
    {
        return Task::create($attributes);
    }

    public function update(Task $task, array $attributes): bool
    {
        return $task->update($attributes);
    }

    public function delete(Task $task): bool
    {
        return (bool) $task->delete();
    }
}
