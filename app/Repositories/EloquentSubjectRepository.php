<?php

namespace App\Repositories;

use App\Models\Subject;
use App\Repositories\Contracts\SubjectRepositoryInterface;
use Illuminate\Support\Collection;

class EloquentSubjectRepository implements SubjectRepositoryInterface
{
    public function all(): Collection
    {
        return Subject::query()->orderBy('name')->get();
    }

    public function create(array $attributes): Subject
    {
        return Subject::create($attributes);
    }

    public function update(Subject $subject, array $attributes): bool
    {
        return $subject->update($attributes);
    }

    public function delete(Subject $subject): bool
    {
        return (bool) $subject->delete();
    }
}
