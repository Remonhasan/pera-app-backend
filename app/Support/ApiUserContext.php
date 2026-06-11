<?php

namespace App\Support;

use App\Models\User;
use Illuminate\Support\Collection;

class ApiUserContext
{
    public const ACCOUNT_ADMIN = 'admin';

    public const ACCOUNT_MEMBER = 'member';

    public static function isMember(User $user): bool
    {
        return $user->hasRole(User::MEMBER_ROLE, User::MEMBER_GUARD);
    }

    public static function isAdmin(User $user): bool
    {
        if (self::isMember($user)) {
            return false;
        }

        return $user->roles()
            ->where('guard_name', User::ADMIN_GUARD)
            ->exists();
    }

    public static function accountType(User $user): string
    {
        return self::isMember($user)
            ? self::ACCOUNT_MEMBER
            : self::ACCOUNT_ADMIN;
    }

    /** @return list<string> */
    public static function permissions(User $user): array
    {
        if (! self::isAdmin($user)) {
            return [];
        }

        return $user->getPermissionsViaRoles()
            ->where('guard_name', User::ADMIN_GUARD)
            ->pluck('name')
            ->values()
            ->all();
    }

    /** @return list<array{name: string, guard_name: string, label: string|null}> */
    public static function roles(User $user): array
    {
        return $user->roles
            ->map(fn ($role) => [
                'name' => $role->name,
                'guard_name' => $role->guard_name,
                'label' => $role->label,
            ])
            ->values()
            ->all();
    }

    public static function can(User $user, string $permission): bool
    {
        if (! self::isAdmin($user)) {
            return false;
        }

        return $user->hasPermissionTo($permission, User::ADMIN_GUARD);
    }

    public static function actorId(): ?int
    {
        return auth('api')->id();
    }
}
