<?php

namespace App\Repositories\Contracts;

use App\Models\Subject;
use Illuminate\Support\Collection;

interface SubjectRepositoryInterface
{
    public function all(): Collection;

    public function create(array $attributes): Subject;

    public function update(Subject $subject, array $attributes): bool;

    public function delete(Subject $subject): bool;
}
