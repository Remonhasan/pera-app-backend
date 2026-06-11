<?php

namespace App\Repositories\Contracts;

use App\Models\User;
use Spatie\Permission\Models\Role;

interface UserRepositoryInterface
{
  public function allWithRoles(): object;

  public function selectRoleOptions(): object;

  public function create(array $attributes): User;

  public function update(User $user, array $attributes): bool;

  public function delete(User $user): bool;

  public function findRoleById(int $roleId): ?Role;

  public function assignRole(User $user, string $roleName): void;

  public function syncRoles(User $user, string $roleName): void;

  public function getUsersByRoleName(string $roleName): object;

  public function findById(int $id): ?User;

  public function getAllowedRolesForUser(User $user): array;
}
