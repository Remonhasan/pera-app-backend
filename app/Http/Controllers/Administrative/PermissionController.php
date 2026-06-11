<?php

namespace App\Http\Controllers\Administrative;

use Inertia\Inertia;
use App\Http\Controllers\Controller;
use Spatie\Permission\Models\Permission;
use App\Services\PermissionService;
use App\Http\Requests\PermissionEditRequest;
use App\Http\Requests\PermissionStoreRequest;

class PermissionController extends Controller
{
    public function __construct(private readonly PermissionService $permissionService) {}
    public function index()
    {
        try {
            $permissions = $this->permissionService->listPermissions();
            return Inertia::render('Administrative/Permission/Index', [
                'permissions' => $permissions,
            ]);
        } catch (\Throwable $th) {
            return redirect()->back()->with('error', 'Something Wrong,Please Try Again');
        }
    }

    public function create() {}

    public function store(PermissionStoreRequest $request)
    {
        try {
            $validatedData = $request->all();
            $create = $this->permissionService->createPermission($validatedData);
            if (!$create) {
                return redirect()->back()->with('error', 'Permission created failed.');
            }
            return redirect()->route('administrative.permission.index')->with('success', 'Permission created successfully.');
        } catch (\Throwable $th) {
            return redirect()->back()->with('error', 'Something Wrong,Please Try Again');
        }
    }

    public function edit(Permission $permission)
    {
        return Inertia::render('Administrative/Permission/Edit', [
            'permission' => $permission,
        ]);
    }

    public function update(PermissionEditRequest $request, Permission $permission)
    {
        try {
            $validatedData = $request->all();
            $this->permissionService->updatePermission($permission, $validatedData);
            return redirect()->route('administrative.permission.index')->with('success', 'Permission updated successfully.');
        } catch (\Throwable $th) {
            return redirect()->back()->with('error', 'Something Wrong,Please Try Again');
        }
    }

    public function destroy(Permission $permission)
    {
        $this->permissionService->deletePermission($permission);
        return redirect()->route('administrative.permission.index')->with('success', 'Permission deleted successfully.');
    }
}
