<?php

namespace App\Services;

use App\Models\User;
use App\Repositories\Contracts\UserRepositoryInterface;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;

class UserService
{
    private const ADMIN_ROLE = 'administrator';

    public function __construct(private readonly UserRepositoryInterface $users) {}

    public function listUsersAndRoleOptions(?User $currentUser = null): array
    {
        return [
            'users' => $this->users->allWithRoles(),
            'roles' => $this->users->selectRoleOptions(),
            'countries' => [],
            'schools' => [],
            'office_supervisors' => [],
            'supervisor_administrators' => [],
        ];
    }

    public function createUser(array $attributes, string $roleName): ?User
    {
        unset($attributes['role']);

        if (!empty($attributes['password'])) {
            $attributes['password'] = Hash::make($attributes['password']);
        }

        $user = $this->users->create($attributes);

        if (User::findRoleByName($roleName)) {
            $this->users->assignRole($user, $roleName);
        }

        return $user;
    }

    public function updateUser(
        User $user,
        array $attributes,
        string $roleName,
        ?UploadedFile $imageFile = null,
        ?UploadedFile $signatureFile = null,
        bool $clearImage = false,
        bool $clearSignature = false,
    ): bool {
        unset($attributes['role']);

        if (empty($attributes['password'])) {
            unset($attributes['password']);
        } else {
            $attributes['password'] = Hash::make($attributes['password']);
        }

        if ($imageFile) {
            if ($user->image) {
                Storage::disk('public_dir')->delete($user->image);
            }
            $attributes['image'] = $imageFile->store('uploads', 'public_dir');
        } elseif ($clearImage && $user->image) {
            Storage::disk('public_dir')->delete($user->image);
            $attributes['image'] = null;
        }

        if ($signatureFile) {
            if ($user->signature) {
                Storage::disk('public_dir')->delete($user->signature);
            }
            $attributes['signature'] = $signatureFile->store('uploads', 'public_dir');
        } elseif ($clearSignature && $user->signature) {
            Storage::disk('public_dir')->delete($user->signature);
            $attributes['signature'] = null;
        }

        if (User::findRoleByName($roleName)) {
            $this->users->syncRoles($user, $roleName);
        }

        return $this->users->update($user, $attributes);
    }

    public function updateUserStatus(User $user, int $status): bool
    {
        return $this->users->update($user, ['status' => $status]);
    }

    public function deleteUser(User $user): bool
    {
        if ($user->is_protected) {
            return false;
        }

        return $this->users->delete($user);
    }

    public function canCreateRole(?User $currentUser, string $targetRoleName): bool
    {
        if (!$currentUser) {
            return false;
        }

        $roleName = strtolower($currentUser->roles->first()?->name ?? '');
        if ($roleName === self::ADMIN_ROLE) {
            return true;
        }

        // Starter template: restrict role assignment to admins only.
        return false;
    }
}

