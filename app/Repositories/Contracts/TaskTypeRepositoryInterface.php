<?php

namespace App\Repositories\Contracts;

use App\Models\TaskType;
use Illuminate\Support\Collection;

interface TaskTypeRepositoryInterface
{
    public function all(): Collection;

    public function create(array $attributes): TaskType;

    public function update(TaskType $taskType, array $attributes): bool;

    public function delete(TaskType $taskType): bool;
}
