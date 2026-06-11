<?php

namespace App\Repositories;

use App\Repositories\Contracts\PermissionRepositoryInterface;
use Spatie\Permission\Models\Permission;

class EloquentPermissionRepository implements PermissionRepositoryInterface
{
  public function all(): object
  {
    return Permission::all();
  }

  public function create(array $attributes): Permission
  {
    return Permission::create($attributes);
  }

  public function update(Permission $permission, array $attributes): bool
  {
    return $permission->update($attributes);
  }

  public function delete(Permission $permission): bool
  {
    return (bool) $permission->delete();
  }
}










