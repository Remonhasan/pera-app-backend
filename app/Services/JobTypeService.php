<?php

namespace App\Services;

use App\Models\JobType;
use App\Repositories\Contracts\JobTypeRepositoryInterface;
use Illuminate\Support\Collection;

class JobTypeService
{
    public function __construct(private readonly JobTypeRepositoryInterface $jobTypes) {}

    public function listJobTypes(): Collection
    {
        return $this->jobTypes->all();
    }

    /** @return list<array{id: int, name: string}> */
    public function jobTypeOptions(): array
    {
        return JobType::query()
            ->where('status', true)
            ->orderBy('name')
            ->get(['id', 'name'])
            ->map(fn (JobType $type) => [
                'id' => $type->id,
                'name' => $type->name,
            ])
            ->all();
    }

    /** @param  array<string, mixed>  $validated */
    public function createJobType(array $validated): ?JobType
    {
        return $this->jobTypes->create([
            'name' => $validated['name'],
            'status' => $validated['status'] ?? true,
        ]);
    }

    /** @param  array<string, mixed>  $validated */
    public function updateJobType(JobType $jobType, array $validated): bool
    {
        $payload = [];

        if (array_key_exists('name', $validated)) {
            $payload['name'] = $validated['name'];
        }
        if (array_key_exists('status', $validated)) {
            $payload['status'] = (bool) $validated['status'];
        }

        return $this->jobTypes->update($jobType, $payload);
    }

    public function deleteJobType(JobType $jobType): bool
    {
        return $this->jobTypes->delete($jobType);
    }
}
