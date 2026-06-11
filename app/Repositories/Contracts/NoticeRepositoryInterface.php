<?php

namespace App\Repositories\Contracts;

use App\Models\Notice;
use Illuminate\Support\Collection;

interface NoticeRepositoryInterface
{
    public function all(): Collection;

    public function create(array $attributes): Notice;

    public function update(Notice $notice, array $attributes): bool;

    public function delete(Notice $notice): bool;
}
