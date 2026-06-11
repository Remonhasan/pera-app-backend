<?php

namespace App\Services;

use App\Models\Saving;
use App\Models\User;
use App\Repositories\Contracts\SavingRepositoryInterface;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Storage;

class SavingService
{
    public function __construct(private readonly SavingRepositoryInterface $savings) {}

    public function listSavings(): Collection
    {
        return $this->savings->allWithRelations();
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
    public function createSaving(array $validated, ?UploadedFile $imageFile, ?int $actorId): ?Saving
    {
        $payload = [
            'user_id' => (int) $validated['user_id'],
            'bank_id' => (int) $validated['bank_id'],
            'saving_type_id' => (int) $validated['saving_type_id'],
            'month' => (int) $validated['month'],
            'year' => (int) $validated['year'],
            'date' => $validated['date'] ?? null,
            'amount' => $validated['amount'],
            'description' => $validated['description'] ?? null,
            'drive_link' => $validated['drive_link'] ?? null,
            'image' => $imageFile ? $imageFile->store('uploads', 'public_dir') : null,
            'status' => $validated['status'] ?? true,
        ];

        if ($actorId !== null) {
            $payload['created_by'] = $actorId;
            $payload['updated_by'] = $actorId;
        }

        return $this->savings->create($payload);
    }

    /** @param  array<string, mixed>  $validated */
    public function updateSaving(
        Saving $saving,
        array $validated,
        ?UploadedFile $imageFile,
        bool $clearImage,
        ?int $actorId,
    ): bool {
        $payload = [];

        if (array_key_exists('user_id', $validated)) {
            $payload['user_id'] = (int) $validated['user_id'];
        }
        if (array_key_exists('bank_id', $validated)) {
            $payload['bank_id'] = (int) $validated['bank_id'];
        }
        if (array_key_exists('saving_type_id', $validated)) {
            $payload['saving_type_id'] = (int) $validated['saving_type_id'];
        }
        if (array_key_exists('month', $validated)) {
            $payload['month'] = (int) $validated['month'];
        }
        if (array_key_exists('year', $validated)) {
            $payload['year'] = (int) $validated['year'];
        }
        if (array_key_exists('date', $validated)) {
            $payload['date'] = $validated['date'];
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
        if ($actorId !== null) {
            $payload['updated_by'] = $actorId;
        }

        if ($imageFile) {
            if ($saving->image) {
                Storage::disk('public_dir')->delete($saving->image);
            }
            $payload['image'] = $imageFile->store('uploads', 'public_dir');
        } elseif ($clearImage && $saving->image) {
            Storage::disk('public_dir')->delete($saving->image);
            $payload['image'] = null;
        }

        return $this->savings->update($saving, $payload);
    }

    public function deleteSaving(Saving $saving): bool
    {
        if ($saving->image) {
            Storage::disk('public_dir')->delete($saving->image);
        }

        return $this->savings->delete($saving);
    }
}
