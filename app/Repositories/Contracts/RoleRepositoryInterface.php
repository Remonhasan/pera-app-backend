<?php

namespace App\Repositories\Contracts;

use Spatie\Permission\Models\Role;

interface RoleRepositoryInterface
{
  public function allWithPermissions(): object;

  public function getGroupedPermissionOptions(): array;

  public function create(array $attributes): Role;

  public function update(Role $role, array $attributes): bool;

  public function delete(Role $role): bool;

  public function givePermissions(Role $role, array $permissions): void;

  public function syncPermissions(Role $role, array $permissions): void;
}


















