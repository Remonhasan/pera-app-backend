<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Api\Concerns\AuthorizesApiAccess;
use App\Http\Controllers\Controller;
use App\Http\Requests\RoleEditRequest;
use App\Http\Requests\RoleStoreRequest;
use App\Http\Traits\ApiResponseTrait;
use App\Services\RoleService;
use Illuminate\Http\JsonResponse;
use Spatie\Permission\Models\Role;

class RoleController extends Controller
{
    use ApiResponseTrait;
    use AuthorizesApiAccess;

    public function __construct(private readonly RoleService $roleService) {}

    public function index(): JsonResponse
    {
        $this->authorizeApiPermission('role_list');

        return $this->successResponse(
            $this->roleService->listRolesAndPermissions(),
            'Role list retrieved successfully.',
        );
    }

    public function store(RoleStoreRequest $request): JsonResponse
    {
        $this->authorizeApiPermission('role_create');

        $role = $this->roleService->createRole($request->all(), $request->permissions ?? []);
        if (! $role) {
            return $this->errorResponse('Failed to create role.', 422);
        }

        return $this->successResponse($role, 'Role created successfully.', 201);
    }

    public function update(RoleEditRequest $request, Role $role): JsonResponse
    {
        $this->authorizeApiPermission('role_edit');

        $this->roleService->updateRole($role, ['name' => $request['name']], $request['permissions'] ?? null);

        return $this->successResponse($role->fresh(), 'Role updated successfully.');
    }

    public function destroy(Role $role): JsonResponse
    {
        $this->authorizeApiPermission('role_delete');

        $this->roleService->deleteRole($role);

        return $this->successResponse(null, 'Role deleted successfully.');
    }
}
