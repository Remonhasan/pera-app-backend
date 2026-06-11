<?php

namespace App\Services;

use App\Models\Goal;
use App\Models\User;
use App\Repositories\Contracts\GoalRepositoryInterface;
use Illuminate\Support\Collection;

class GoalService
{
    public function __construct(private readonly GoalRepositoryInterface $goals) {}

    public function listGoals(): Collection
    {
        return $this->goals->allWithRelations();
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
    public function createGoal(array $validated, ?int $actorId): ?Goal
    {
        $payload = [
            'user_id' => isset($validated['user_id']) ? (int) $validated['user_id'] : null,
            'bank_id' => isset($validated['bank_id']) ? (int) $validated['bank_id'] : null,
            'saving_type_id' => isset($validated['saving_type_id']) ? (int) $validated['saving_type_id'] : null,
            'start_date' => $validated['start_date'],
            'end_date' => $validated['end_date'],
            'amount' => $validated['amount'],
            'description' => $validated['description'] ?? null,
            'drive_link' => $validated['drive_link'] ?? null,
            'status' => $validated['status'] ?? true,
            'goal_status' => $validated['goal_status'] ?? Goal::STATUS_PENDING,
        ];

        if ($actorId !== null) {
            $payload['created_by'] = $actorId;
            $payload['updated_by'] = $actorId;
        }

        return $this->goals->create($payload);
    }

    /** @param  array<string, mixed>  $validated */
    public function updateGoal(Goal $goal, array $validated, ?int $actorId): bool
    {
        $payload = [];

        if (array_key_exists('user_id', $validated)) {
            $payload['user_id'] = $validated['user_id'] !== null
                ? (int) $validated['user_id']
                : null;
        }
        if (array_key_exists('bank_id', $validated)) {
            $payload['bank_id'] = $validated['bank_id'] !== null
                ? (int) $validated['bank_id']
                : null;
        }
        if (array_key_exists('saving_type_id', $validated)) {
            $payload['saving_type_id'] = $validated['saving_type_id'] !== null
                ? (int) $validated['saving_type_id']
                : null;
        }
        if (array_key_exists('start_date', $validated)) {
            $payload['start_date'] = $validated['start_date'];
        }
        if (array_key_exists('end_date', $validated)) {
            $payload['end_date'] = $validated['end_date'];
        }
        if (array_key_exists('amount', $validated)) {
            $payload['amount'] = $validated['amount'];
        }
        if (array_key_exists('description', $validated)) {
            $payload['description'] = $validated['description'];
        }
        if (array_key_exists('drive_link', $validated)) {
            $payload['drive_link'] = $validated['drive_link'];
        }
        if (array_key_exists('status', $validated)) {
            $payload['status'] = (bool) $validated['status'];
        }
        if (array_key_exists('goal_status', $validated)) {
            $payload['goal_status'] = $validated['goal_status'];
        }

        if ($actorId !== null) {
            $payload['updated_by'] = $actorId;
        }

        return $this->goals->update($goal, $payload);
    }

    public function deleteGoal(Goal $goal): bool
    {
        return $this->goals->delete($goal);
    }
}
