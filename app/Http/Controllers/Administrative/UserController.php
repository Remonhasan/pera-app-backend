<?php

namespace App\Http\Controllers\Administrative;

use App\Http\Controllers\Controller;
use App\Http\Requests\EditUserRequest;
use App\Http\Requests\StoreUserRequest;
use App\Models\User;
use App\Services\UserService;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class UserController extends Controller
{
    public function __construct(
        private readonly UserService $userService,
    ) {}

    public function index()
    {
        $data = $this->userService->listUsersAndRoleOptions(auth()->user());

        return Inertia::render('Administrative/Users/Index', [
            'users' => $data['users'],
            'roles' => $data['roles'],
            'schools' => [],
        ]);
    }

    public function store(StoreUserRequest $request)
    {
        $validated = $request->validated();

        $user = $this->userService->createUser($validated, (string) $request->role);
        if (!$user) {
            return redirect()->back()->with('error', 'User created failed.');
        }

        return redirect()->route('administrative.user.index')->with('success', 'User created successfully.');
    }

    public function edit(User $user)
    {
        $data = $this->userService->listUsersAndRoleOptions(auth()->user());
        $user->load('roles');

        return Inertia::render('Administrative/Users/Edit', [
            'user' => $user,
            'roles' => $data['roles'],
        ]);
    }

    public function update(EditUserRequest $request, User $user)
    {
        $validated = $request->validated();
        $imageFile = $request->file('image');
        $signatureFile = $request->file('signature');
        $clearImage = (bool) ($validated['clear_user_image'] ?? false);
        $clearSignature = (bool) ($validated['clear_user_signature'] ?? false);
        unset(
            $validated['image'],
            $validated['signature'],
            $validated['clear_user_image'],
            $validated['clear_user_signature'],
        );

        $this->userService->updateUser(
            $user,
            $validated,
            (string) $request->role,
            $imageFile,
            $signatureFile,
            $clearImage,
            $clearSignature,
        );

        return redirect()->route('administrative.user.index')->with('success', 'User updated successfully.');
    }

    public function updateStatus(Request $request, User $user)
    {
        $validated = $request->validate([
            'status' => ['required', 'integer', 'in:0,1'],
        ]);

        $this->userService->updateUserStatus($user, (int) $validated['status']);

        return redirect()->back()->with('success', 'User status updated successfully.');
    }

    public function destroy(User $user)
    {
        if (!$this->userService->deleteUser($user)) {
            return redirect()->route('administrative.user.index')->with('error', 'This user is protected and cannot be deleted.');
        }

        return redirect()->route('administrative.user.index')->with('success', 'User deleted successfully.');
    }

    public function export(Request $request)
    {
        try {
            $users = User::query()->with('roles')->orderBy('id')->get();
            $filename = 'users_' . date('Y-m-d_His') . '.csv';

            $headers = [
                'Content-Type' => 'text/csv; charset=UTF-8',
                'Content-Disposition' => 'attachment; filename=\"' . $filename . '\"',
            ];

            $callback = function () use ($users) {
                $file = fopen('php://output', 'w');
                fprintf($file, chr(0xEF) . chr(0xBB) . chr(0xBF));
                fputcsv($file, ['ID', 'Name', 'Email', 'Phone', 'Role', 'Status']);

                foreach ($users as $user) {
                    $role = $user->roles->first()?->name ?? 'N/A';
                    fputcsv($file, [
                        $user->id,
                        $user->name,
                        $user->email,
                        $user->phone,
                        $role,
                        $user->status ? 'Active' : 'Inactive',
                    ]);
                }

                fclose($file);
            };

            return response()->stream($callback, Response::HTTP_OK, $headers);
        } catch (\Throwable $th) {
            Log::error('User Export failed: ' . $th->getMessage());
            return redirect()->back()->with('error', 'Failed to export users. Please try again.');
        }
    }
}

