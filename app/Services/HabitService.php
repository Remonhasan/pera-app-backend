<?php

namespace App\Services;

use App\Models\Habit;
use App\Models\User;
use App\Repositories\Contracts\HabitRepositoryInterface;
use Illuminate\Support\Collection;

class HabitService
{
    public function __construct(private readonly HabitRepositoryInterface $habits) {}

    public function listHabits(): Collection
    {
        $habits = $this->habits->allWithRelations();
        $userMap = User::query()
            ->memberRole()
            ->get(['id', 'name'])
            ->keyBy('id');

        return $habits->map(function (Habit $habit) use ($userMap) {
            $memberNames = collect($habit->user_ids ?? [])
                ->map(fn ($id) => $userMap->get((int) $id)?->name)
                ->filter()
                ->values()
                ->all();

            $habit->setAttribute('member_names', $memberNames);

            return $habit;
        });
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
    public function createHabit(array $validated, ?int $actorId): ?Habit
    {
        $payload = [
            'user_ids' => $this->normalizeUserIds($validated['user_ids'] ?? []),
            'name' => $validated['name'],
            'description' => $validated['description'] ?? null,
            'status' => $validated['status'] ?? true,
            'habit_status' => $validated['habit_status'] ?? Habit::STATUS_PENDING,
        ];

        if ($actorId !== null) {
            $payload['created_by'] = $actorId;
            $payload['updated_by'] = $actorId;
        }

        return $this->habits->create($payload);
    }

    /** @param  array<string, mixed>  $validated */
    public function updateHabit(Habit $habit, array $validated, ?int $actorId): bool
    {
        $payload = [];

        if (array_key_exists('user_ids', $validated)) {
            $payload['user_ids'] = $this->normalizeUserIds($validated['user_ids'] ?? []);
        }
        if (array_key_exists('name', $validated)) {
            $payload['name'] = $validated['name'];
        }
        if (array_key_exists('description', $validated)) {
            $payload['description'] = $validated['description'];
        }
        if (array_key_exists('status', $validated)) {
            $payload['status'] = (bool) $validated['status'];
        }
        if (array_key_exists('habit_status', $validated)) {
            $payload['habit_status'] = $validated['habit_status'];
        }

        if ($actorId !== null) {
            $payload['updated_by'] = $actorId;
        }

        return $this->habits->update($habit, $payload);
    }

    public function deleteHabit(Habit $habit): bool
    {
        return $this->habits->delete($habit);
    }

    /** @param  mixed  $userIds */
    private function normalizeUserIds(mixed $userIds): array
    {
        if (! is_array($userIds)) {
            return [];
        }

        return array_values(array_unique(array_map('intval', $userIds)));
    }
}
