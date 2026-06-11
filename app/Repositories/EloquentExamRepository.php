<?php

namespace App\Repositories;

use App\Models\Exam;
use App\Repositories\Contracts\ExamRepositoryInterface;
use Illuminate\Support\Collection;

class EloquentExamRepository implements ExamRepositoryInterface
{
    public function allWithRelations(): Collection
    {
        return Exam::query()
            ->with([
                'jobType:id,name',
                'creator:id,name',
                'updater:id,name',
            ])
            ->orderByDesc('id')
            ->get();
    }

    public function create(array $attributes): Exam
    {
        return Exam::create($attributes);
    }

    public function update(Exam $exam, array $attributes): bool
    {
        return $exam->update($attributes);
    }

    public function delete(Exam $exam): bool
    {
        return (bool) $exam->delete();
    }
}
