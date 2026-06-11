<?php

namespace App\Repositories;

use App\Models\Notice;
use App\Repositories\Contracts\NoticeRepositoryInterface;
use Illuminate\Support\Collection;

class EloquentNoticeRepository implements NoticeRepositoryInterface
{
    public function all(): Collection
    {
        return Notice::query()
            ->orderByDesc('id')
            ->get();
    }

    public function create(array $attributes): Notice
    {
        return Notice::create($attributes);
    }

    public function update(Notice $notice, array $attributes): bool
    {
        return $notice->update($attributes);
    }

    public function delete(Notice $notice): bool
    {
        return (bool) $notice->delete();
    }
}
