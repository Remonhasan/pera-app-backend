<?php

namespace App\Repositories\Contracts;

use Spatie\Permission\Models\Permission;

interface PermissionRepositoryInterface
{
  public function all(): object;

  public function create(array $attributes): Permission;

  public function update(Permission $permission, array $attributes): bool;

  public function delete(Permission $permission): bool;
}


















