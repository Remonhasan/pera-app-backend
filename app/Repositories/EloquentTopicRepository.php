<?php

namespace App\Repositories;

use App\Models\Topic;
use App\Repositories\Contracts\TopicRepositoryInterface;
use Illuminate\Support\Collection;

class EloquentTopicRepository implements TopicRepositoryInterface
{
    public function allWithRelations(): Collection
    {
        return Topic::query()
            ->with(['subject:id,name'])
            ->orderBy('topic')
            ->get();
    }

    public function create(array $attributes): Topic
    {
        return Topic::create($attributes);
    }

    public function update(Topic $topic, array $attributes): bool
    {
        return $topic->update($attributes);
    }

    public function delete(Topic $topic): bool
    {
        return (bool) $topic->delete();
    }
}
