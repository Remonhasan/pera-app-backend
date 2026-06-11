<?php

namespace App\Repositories;

use App\Models\JobType;
use App\Repositories\Contracts\JobTypeRepositoryInterface;
use Illuminate\Support\Collection;

class EloquentJobTypeRepository implements JobTypeRepositoryInterface
{
    public function all(): Collection
    {
        return JobType::query()->orderBy('name')->get();
    }

    public function create(array $attributes): JobType
    {
        return JobType::create($attributes);
    }

    public function update(JobType $jobType, array $attributes): bool
    {
        return $jobType->update($attributes);
    }

    public function delete(JobType $jobType): bool
    {
        return (bool) $jobType->delete();
    }
}
