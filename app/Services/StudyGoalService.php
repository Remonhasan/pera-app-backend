<?php

namespace App\Services;

use App\Models\StudyGoal;
use App\Models\User;
use App\Repositories\Contracts\StudyGoalRepositoryInterface;
use Carbon\Carbon;
use Illuminate\Support\Collection;

class StudyGoalService
{
    public function __construct(private readonly StudyGoalRepositoryInterface $studyGoals) {}

    public function listStudyGoals(): Collection
    {
        return $this->studyGoals->allWithRelations();
    }

    /** @param  array<string, mixed>  $filters */
    public function buildListExport(array $filters): array
    {
        $rows = $this->filterStudyGoals($this->listStudyGoals(), $filters)
            ->map(fn (StudyGoal $goal) => [
                'member_name' => $goal->user?->name ?? '—',
                'subject_name' => $goal->subject?->name ?? '—',
                'topic_name' => $goal->topic?->topic ?? '—',
                'job_type_name' => $goal->jobType?->name ?? '—',
                'date_from' => $goal->date_from?->format('Y-m-d') ?? '—',
                'date_to' => $goal->date_to?->format('Y-m-d') ?? '—',
                'extended_date' => $goal->extended_date?->format('Y-m-d') ?? '—',
                'study_goal_status' => $goal->study_goal_status,
                'status' => $goal->status,
            ])
            ->values()
            ->all();

        return [
            'filters' => $filters,
            'rows' => $rows,
            'total_records' => count($rows),
        ];
    }

    /** @param  array<string, mixed>  $filters */
    public function filterStudyGoals(Collection $studyGoals, array $filters): Collection
    {
        return $studyGoals->filter(function (StudyGoal $goal) use ($filters) {
            if (! empty($filters['user_id']) && (int) $goal->user_id !== (int) $filters['user_id']) {
                return false;
            }

            if (! empty($filters['subject_id']) && (int) $goal->subject_id !== (int) $filters['subject_id']) {
                return false;
            }

            if (! empty($filters['topic_id']) && (int) $goal->topic_id !== (int) $filters['topic_id']) {
                return false;
            }

            if (! empty($filters['job_id']) && (int) $goal->job_id !== (int) $filters['job_id']) {
                return false;
            }

            if (! empty($filters['study_goal_status']) && $goal->study_goal_status !== $filters['study_goal_status']) {
                return false;
            }

            if (! $this->matchesDateFilter($goal, $filters['date_from'] ?? null, $filters['date_to'] ?? null)) {
                return false;
            }

            return true;
        })->values();
    }

    private function matchesDateFilter(StudyGoal $goal, ?string $dateFrom, ?string $dateTo): bool
    {
        if ($dateFrom === null && $dateTo === null) {
            return true;
        }

        $dates = array_values(array_filter([
            $goal->date_from?->format('Y-m-d'),
            $goal->date_to?->format('Y-m-d'),
            $goal->extended_date?->format('Y-m-d'),
        ]));

        if ($dates === []) {
            return false;
        }

        foreach ($dates as $date) {
            if ($dateFrom !== null && $date < $dateFrom) {
                continue;
            }

            if ($dateTo !== null && $date > $dateTo) {
                continue;
            }

            return true;
        }

        return false;
    }

    /** @return list<array{id: int, name: string, phone: string|null}> */
    public function memberOptions(): array
    {
        return User::query()
            ->memberRole()
            ->orderBy('name')
            ->get(['id', 'name', 'phone'])
            ->map(fn (User $user) => [
                'id' => $user->id,
                'name' => $user->name,
                'phone' => $user->phone,
            ])
            ->all();
    }

    /** @param  array<string, mixed>  $validated */
    public function createStudyGoal(array $validated, ?int $actorId): ?StudyGoal
    {
        $payload = [
            'user_id' => isset($validated['user_id']) ? (int) $validated['user_id'] : null,
            'subject_id' => (int) $validated['subject_id'],
            'topic_id' => isset($validated['topic_id']) ? (int) $validated['topic_id'] : null,
            'job_id' => isset($validated['job_id']) ? (int) $validated['job_id'] : null,
            'date_from' => $this->normalizeDate($validated['date_from'] ?? null),
            'date_to' => $this->normalizeDate($validated['date_to'] ?? null),
            'extended_date' => $this->normalizeDate($validated['extended_date'] ?? null),
            'status' => $validated['status'] ?? true,
            'study_goal_status' => $validated['study_goal_status'] ?? StudyGoal::STATUS_PENDING,
        ];

        if ($actorId !== null) {
            $payload['created_by'] = $actorId;
            $payload['updated_by'] = $actorId;
        }

        return $this->studyGoals->create($payload);
    }

    /** @param  array<string, mixed>  $validated */
    public function updateStudyGoal(StudyGoal $studyGoal, array $validated, ?int $actorId): bool
    {
        $payload = [];

        if (array_key_exists('user_id', $validated)) {
            $payload['user_id'] = $validated['user_id'] !== null
                ? (int) $validated['user_id']
                : null;
        }
        if (array_key_exists('subject_id', $validated)) {
            $payload['subject_id'] = (int) $validated['subject_id'];
        }
        if (array_key_exists('topic_id', $validated)) {
            $payload['topic_id'] = $validated['topic_id'] !== null
                ? (int) $validated['topic_id']
                : null;
        }
        if (array_key_exists('job_id', $validated)) {
            $payload['job_id'] = $validated['job_id'] !== null
                ? (int) $validated['job_id']
                : null;
        }
        if (array_key_exists('date_from', $validated)) {
            $payload['date_from'] = $this->normalizeDate($validated['date_from']);
        }
        if (array_key_exists('date_to', $validated)) {
            $payload['date_to'] = $this->normalizeDate($validated['date_to']);
        }
        if (array_key_exists('extended_date', $validated)) {
            $payload['extended_date'] = $this->normalizeDate($validated['extended_date']);
        }
        if (array_key_exists('status', $validated)) {
            $payload['status'] = (bool) $validated['status'];
        }
        if (array_key_exists('study_goal_status', $validated)) {
            $payload['study_goal_status'] = $validated['study_goal_status'];
        }

        if ($actorId !== null) {
            $payload['updated_by'] = $actorId;
        }

        return $this->studyGoals->update($studyGoal, $payload);
    }

    public function deleteStudyGoal(StudyGoal $studyGoal): bool
    {
        return $this->studyGoals->delete($studyGoal);
    }

    private function normalizeDate(mixed $value): ?string
    {
        if ($value === null || $value === '') {
            return null;
        }

        return Carbon::parse($value)->toDateString();
    }
}
