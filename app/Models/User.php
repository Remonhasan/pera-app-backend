<?php

namespace App\Models;

use App\Support\PhoneNormalizer;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Spatie\Permission\Models\Role;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use PHPOpenSourceSaver\JWTAuth\Contracts\JWTSubject;
use Spatie\Permission\Traits\HasRoles;

class User extends Authenticatable implements JWTSubject
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, HasRoles, HasApiTokens, Notifiable;

    public const MEMBER_ROLE = 'member';

    public const MEMBER_GUARD = 'api';

    public const ADMIN_GUARD = 'web';

    protected $guarded = ['id'];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'is_verified' => 'boolean',
            'status' => 'boolean',
            'isEmailVerified' => 'boolean',
            'isPhoneVerified' => 'boolean',
            'phone_verified_at' => 'datetime',
            'last_login_at' => 'datetime',
            'is_protected' => 'boolean',
        ];
    }

    public static function guardForRoleName(string $roleName): string
    {
        return $roleName === self::MEMBER_ROLE ? self::MEMBER_GUARD : self::ADMIN_GUARD;
    }

    public static function findRoleByName(string $roleName): ?Role
    {
        return Role::findByName($roleName, self::guardForRoleName($roleName));
    }

    /** @param  Builder<User>  $query */
    public function scopeMemberRole(Builder $query): Builder
    {
        return $query->whereHas('roles', fn ($q) => $q
            ->where('name', self::MEMBER_ROLE)
            ->where('guard_name', self::MEMBER_GUARD));
    }

    /** @param  Builder<User>  $query */
    public function scopeWherePhone(Builder $query, string $phone): Builder
    {
        $variants = PhoneNormalizer::variants($phone);

        if ($variants === []) {
            return $query->whereRaw('1 = 0');
        }

        return $query->whereIn('phone', $variants);
    }

    public function getJWTIdentifier(): mixed
    {
        return $this->getKey();
    }

    /** @return array<string, mixed> */
    public function getJWTCustomClaims(): array
    {
        return [];
    }
}
