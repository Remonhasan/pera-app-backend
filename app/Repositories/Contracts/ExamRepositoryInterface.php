<?php

namespace App\Repositories\Contracts;

use App\Models\Exam;
use Illuminate\Support\Collection;

interface ExamRepositoryInterface
{
    public function allWithRelations(): Collection;

    public function findWithRelations(Exam $exam): Exam;

    public function create(array $attributes): Exam;

    public function update(Exam $exam, array $attributes): bool;

    public function delete(Exam $exam): bool;
}
