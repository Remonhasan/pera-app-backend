<?php

namespace App\Repositories;

use App\Models\StudyGoal;
use App\Repositories\Contracts\StudyGoalRepositoryInterface;
use Illuminate\Support\Collection;

class EloquentStudyGoalRepository implements StudyGoalRepositoryInterface
{
    public function allWithRelations(): Collection
    {
        return StudyGoal::query()
            ->with([
                'user:id,name,phone',
                'subject:id,name',
                'topic:id,topic,subject_id',
                'jobType:id,name',
                'creator:id,name',
                'updater:id,name',
            ])
            ->orderByDesc('id')
            ->get();
    }

    public function create(array $attributes): StudyGoal
    {
        return StudyGoal::create($attributes);
    }

    public function update(StudyGoal $studyGoal, array $attributes): bool
    {
        return $studyGoal->update($attributes);
    }

    public function delete(StudyGoal $studyGoal): bool
    {
        return (bool) $studyGoal->delete();
    }
}
