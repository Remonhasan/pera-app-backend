<?php

namespace App\Repositories\Contracts;

use App\Models\Topic;
use Illuminate\Support\Collection;

interface TopicRepositoryInterface
{
    public function allWithRelations(): Collection;

    public function create(array $attributes): Topic;

    public function update(Topic $topic, array $attributes): bool;

    public function delete(Topic $topic): bool;
}
