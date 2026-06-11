<?php

namespace App\Repositories;

use App\Models\TaskType;
use App\Repositories\Contracts\TaskTypeRepositoryInterface;
use Illuminate\Support\Collection;

class EloquentTaskTypeRepository implements TaskTypeRepositoryInterface
{
    public function all(): Collection
    {
        return TaskType::query()->orderBy('name')->get();
    }

    public function create(array $attributes): TaskType
    {
        return TaskType::create($attributes);
    }

    public function update(TaskType $taskType, array $attributes): bool
    {
        return $taskType->update($attributes);
    }

    public function delete(TaskType $taskType): bool
    {
        return (bool) $taskType->delete();
    }
}
