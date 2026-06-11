<?php

namespace App\Repositories\Contracts;

use App\Models\Task;
use Illuminate\Support\Collection;

interface TaskRepositoryInterface
{
    public function allWithRelations(): Collection;

    public function create(array $attributes): Task;

    public function update(Task $task, array $attributes): bool;

    public function delete(Task $task): bool;
}
