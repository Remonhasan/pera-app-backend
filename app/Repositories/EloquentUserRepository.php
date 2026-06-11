<?php

namespace App\Repositories;

use App\Models\User;
use App\Repositories\Contracts\UserRepositoryInterface;
use Spatie\Permission\Models\Role;

class EloquentUserRepository implements UserRepositoryInterface
{
  public function allWithRoles(): object
  {
    return User::with(['roles'])->get();
  }

  public function selectRoleOptions(): object
  {
    return Role::query()
      ->where(function ($query) {
        $query->where('guard_name', User::ADMIN_GUARD)
          ->orWhere(fn ($q) => $q
            ->where('name', User::MEMBER_ROLE)
            ->where('guard_name', User::MEMBER_GUARD));
      })
      ->orderBy('label')
      ->get(['name', 'label', 'guard_name'])
      ->map(fn (Role $role) => [
        'value' => $role->name,
        'label' => $role->label ?: $role->name,
      ])
      ->values();
  }

  public function create(array $attributes): User
  {
    return User::create($attributes);
  }

  public function update(User $user, array $attributes): bool
  {
    return $user->update($attributes);
  }

  public function delete(User $user): bool
  {
    return (bool) $user->delete();
  }

  public function findRoleById(int $roleId): ?Role
  {
    return Role::find($roleId);
  }

  public function assignRole(User $user, string $roleName): void
  {
    $role = User::findRoleByName($roleName);
    if ($role) {
      $user->assignRole($role);
    }
  }

  public function syncRoles(User $user, string $roleName): void
  {
    $role = User::findRoleByName($roleName);
    if ($role) {
      $user->syncRoles($role);
    }
  }

  public function getUsersByRoleName(string $roleName): object
  {
    return User::role($roleName)->get();
  }

  public function getAllowedRolesForUser(User $user): array
  {
    return $user->roles->pluck('name')->toArray();
  }

  public function findById(int $id): ?User
  {
    return User::find($id);
  }
}
