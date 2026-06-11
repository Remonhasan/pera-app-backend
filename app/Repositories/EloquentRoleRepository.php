<?php

namespace App\Repositories;

use App\Repositories\Contracts\RoleRepositoryInterface;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class EloquentRoleRepository implements RoleRepositoryInterface
{
  public function allWithPermissions(): object
  {
    return Role::with('permissions')->get();
  }

  public function getGroupedPermissionOptions(): array
  {
    $permission = Permission::select('label')->groupBy('label')->get();
    $permissionList = array_map(function ($data) {
      $option = Permission::where('label', $data['label'])->get(['id as value', 'name as label']);
      $option = $option->map(function ($item) {
        $item->label = ucfirst(str_replace('_', ' ', $item->label));
        return $item;
      });
      return [
        'label' => $data['label'],
        'options' => $option,
      ];
    }, $permission->toArray());

    return $permissionList;
  }

  public function create(array $attributes): Role
  {
    return Role::create($attributes);
  }

  public function update(Role $role, array $attributes): bool
  {
    return $role->update($attributes);
  }

  public function delete(Role $role): bool
  {
    return (bool) $role->delete();
  }

  public function givePermissions(Role $role, array $permissions): void
  {
    $role->givePermissionTo($permissions);
  }

  public function syncPermissions(Role $role, array $permissions): void
  {
    $role->syncPermissions($permissions);
  }
}










