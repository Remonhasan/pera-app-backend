<?php

namespace App\Http\Controllers\Administrative;

use App\Http\Controllers\Controller;
use App\Http\Requests\RoleEditRequest;
use App\Http\Requests\RoleStoreRequest;
use Inertia\Inertia;
use Spatie\Permission\Models\Role;
use App\Services\RoleService;

class RoleController extends Controller
{
    public function __construct(private readonly RoleService $roleService) {}
    public function index()
    {
        try {
            $data = $this->roleService->listRolesAndPermissions();
            return Inertia::render('Administrative/Role/Index', [
                'roles' => $data['roles'],
                'permission' => $data['permission'],
            ]);
        } catch (\Throwable $th) {
            return redirect()->back()->with('error', 'Something Wrong,Please Try Again');
        }
    }

    public function create() {}

    public function store(RoleStoreRequest $request)
    {
        try {
            $validatedData = $request->all();
            $create = $this->roleService->createRole($validatedData, $request->permissions ?? []);
            if (!$create) {
                return redirect()->back()->with('error', 'Role created failed.');
            }
            return redirect()->route('administrative.role.index')->with('success', 'Role created successfully.');
        } catch (\Throwable $th) {
            return redirect()->back()->with('error', 'Something Wrong,Please Try Again');
        }
    }

    public function edit(Role $role)
    {
        // Starter/admin UI uses drawer-based edit inside index.
        return redirect()->route('administrative.role.index');
    }

    public function update(RoleEditRequest $request, Role $role)
    {
        try {
            $this->roleService->updateRole($role, ['name' => $request['name']], $request['permissions'] ?? null);
            return redirect()->route('administrative.role.index')->with('success', 'Role updated successfully.');
        } catch (\Throwable $th) {
            return redirect()->back()->with('error', 'Something went wrong. Please try again.');
        }
    }

    public function destroy(Role $role)
    {
        $this->roleService->deleteRole($role);
        return redirect()->route('administrative.role.index')->with('success', 'Role deleted successfully.');
    }
}
