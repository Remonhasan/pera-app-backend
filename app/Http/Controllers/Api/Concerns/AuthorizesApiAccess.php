<?php

namespace App\Http\Controllers\Api\Concerns;

use App\Models\User;
use App\Support\ApiUserContext;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;

trait AuthorizesApiAccess
{
    protected function apiUser(): User
    {
        /** @var User $user */
        $user = auth('api')->user();

        return $user;
    }

    protected function authorizeApiAdmin(): void
    {
        if (! ApiUserContext::isAdmin($this->apiUser())) {
            throw new AccessDeniedHttpException('You do not have permission to access this resource.');
        }
    }

    protected function authorizeApiMember(): void
    {
        if (! ApiUserContext::isMember($this->apiUser())) {
            throw new AccessDeniedHttpException('You do not have permission to access this resource.');
        }
    }

    protected function authorizeApiPermission(string $permission): void
    {
        $this->authorizeApiAdmin();

        if (! ApiUserContext::can($this->apiUser(), $permission)) {
            throw new AccessDeniedHttpException('You do not have permission to perform this action.');
        }
    }
}
