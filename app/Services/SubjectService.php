<?php

namespace App\Services;

use App\Models\Subject;
use App\Repositories\Contracts\SubjectRepositoryInterface;
use Illuminate\Support\Collection;

class SubjectService
{
    public function __construct(private readonly SubjectRepositoryInterface $subjects) {}

    public function listSubjects(): Collection
    {
        return $this->subjects->all();
    }

    /** @return list<array{id: int, name: string}> */
    public function subjectOptions(): array
    {
        return Subject::query()
            ->where('status', true)
            ->orderBy('name')
            ->get(['id', 'name'])
            ->map(fn (Subject $subject) => [
                'id' => $subject->id,
                'name' => $subject->name,
            ])
            ->all();
    }

    /** @param  array<string, mixed>  $validated */
    public function createSubject(array $validated): ?Subject
    {
        return $this->subjects->create([
            'name' => $validated['name'],
            'status' => $validated['status'] ?? true,
        ]);
    }

    /** @param  array<string, mixed>  $validated */
    public function updateSubject(Subject $subject, array $validated): bool
    {
        $payload = [];

        if (array_key_exists('name', $validated)) {
            $payload['name'] = $validated['name'];
        }
        if (array_key_exists('status', $validated)) {
            $payload['status'] = (bool) $validated['status'];
        }

        return $this->subjects->update($subject, $payload);
    }

    public function deleteSubject(Subject $subject): bool
    {
        return $this->subjects->delete($subject);
    }
}
