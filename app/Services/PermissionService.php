<?php

namespace App\Services;

use App\Repositories\Contracts\PermissionRepositoryInterface;
use Spatie\Permission\Models\Permission;

class PermissionService
{
    public function __construct(private readonly PermissionRepositoryInterface $permissions)
    {
    }

    public function listPermissions(): object
    {
        return $this->permissions->all();
    }

    public function createPermission(array $attributes): ?Permission
    {
        return $this->permissions->create($attributes);
    }

    public function updatePermission(Permission $permission, array $attributes): bool
    {
        return $this->permissions->update($permission, $attributes);
    }

    public function deletePermission(Permission $permission): bool
    {
        return $this->permissions->delete($permission);
    }
}












