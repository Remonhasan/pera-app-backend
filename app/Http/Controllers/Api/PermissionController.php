<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Api\Concerns\AuthorizesApiAccess;
use App\Http\Controllers\Controller;
use App\Http\Requests\PermissionEditRequest;
use App\Http\Requests\PermissionStoreRequest;
use App\Http\Traits\ApiResponseTrait;
use App\Services\PermissionService;
use Illuminate\Http\JsonResponse;
use Spatie\Permission\Models\Permission;

class PermissionController extends Controller
{
    use ApiResponseTrait;
    use AuthorizesApiAccess;

    public function __construct(private readonly PermissionService $permissionService) {}

    public function index(): JsonResponse
    {
        $this->authorizeApiPermission('permission_list');

        return $this->successResponse(
            $this->permissionService->listPermissions(),
            'Permission list retrieved successfully.',
        );
    }

    public function store(PermissionStoreRequest $request): JsonResponse
    {
        $this->authorizeApiPermission('permission_create');

        $permission = $this->permissionService->createPermission($request->all());
        if (! $permission) {
            return $this->errorResponse('Failed to create permission.', 422);
        }

        return $this->successResponse($permission, 'Permission created successfully.', 201);
    }

    public function update(PermissionEditRequest $request, Permission $permission): JsonResponse
    {
        $this->authorizeApiPermission('permission_edit');

        $this->permissionService->updatePermission($permission, $request->all());

        return $this->successResponse($permission->fresh(), 'Permission updated successfully.');
    }

    public function destroy(Permission $permission): JsonResponse
    {
        $this->authorizeApiPermission('permission_delete');

        $this->permissionService->deletePermission($permission);

        return $this->successResponse(null, 'Permission deleted successfully.');
    }
}
