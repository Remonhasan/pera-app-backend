<?php

namespace App\Repositories\Contracts;

use App\Models\JobType;
use Illuminate\Support\Collection;

interface JobTypeRepositoryInterface
{
    public function all(): Collection;

    public function create(array $attributes): JobType;

    public function update(JobType $jobType, array $attributes): bool;

    public function delete(JobType $jobType): bool;
}
