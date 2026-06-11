<?php

namespace App\Repositories\Contracts;

use App\Models\StudyGoal;
use Illuminate\Support\Collection;

interface StudyGoalRepositoryInterface
{
    public function allWithRelations(): Collection;

    public function create(array $attributes): StudyGoal;

    public function update(StudyGoal $studyGoal, array $attributes): bool;

    public function delete(StudyGoal $studyGoal): bool;
}
