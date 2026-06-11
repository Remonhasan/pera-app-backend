<?php

namespace App\Services;

use App\Repositories\Contracts\RoleRepositoryInterface;
use Spatie\Permission\Models\Role;

class RoleService
{
  public function __construct(private readonly RoleRepositoryInterface $roles) {}

  public function listRolesAndPermissions(): array
  {
    return [
      'roles' => $this->roles->allWithPermissions(),
      'permission' => $this->roles->getGroupedPermissionOptions(),
    ];
  }

  public function createRole(array $attributes, ?array $permissions = null): ?Role
  {
    $role = $this->roles->create($attributes);
    if (!$role) {
      return null;
    }
    if ($permissions) {
      $this->roles->givePermissions($role, $permissions);
    }
    return $role;
  }

  public function updateRole(Role $role, array $attributes, ?array $permissions = null): bool
  {
    $updated = $this->roles->update($role, $attributes);
    if ($permissions !== null) {
      $this->roles->syncPermissions($role, $permissions);
    }
    return $updated;
  }

  public function deleteRole(Role $role): bool
  {
    return $this->roles->delete($role);
  }
}










