<?php

namespace App\Services;

use App\Models\Notice;
use App\Repositories\Contracts\NoticeRepositoryInterface;
use Illuminate\Support\Collection;

class NoticeService
{
    public function __construct(private readonly NoticeRepositoryInterface $notices) {}

    public function listNotices(): Collection
    {
        return $this->notices->all();
    }

    /** @param  array<string, mixed>  $validated */
    public function createNotice(array $validated): ?Notice
    {
        return $this->notices->create([
            'title' => $validated['title'],
            'description' => $validated['description'] ?? null,
            'status' => $validated['status'] ?? true,
        ]);
    }

    /** @param  array<string, mixed>  $validated */
    public function updateNotice(Notice $notice, array $validated): bool
    {
        $payload = [];

        if (array_key_exists('title', $validated)) {
            $payload['title'] = $validated['title'];
        }
        if (array_key_exists('description', $validated)) {
            $payload['description'] = $validated['description'];
        }
        if (array_key_exists('status', $validated)) {
            $payload['status'] = (bool) $validated['status'];
        }

        return $this->notices->update($notice, $payload);
    }

    public function deleteNotice(Notice $notice): bool
    {
        return $this->notices->delete($notice);
    }
}
