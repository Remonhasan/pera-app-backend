<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Api\Concerns\AuthorizesApiAccess;
use App\Http\Controllers\Controller;
use App\Http\Requests\EditUserRequest;
use App\Http\Requests\StoreUserRequest;
use App\Http\Traits\ApiResponseTrait;
use App\Models\User;
use App\Services\UserService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class UserController extends Controller
{
    use ApiResponseTrait;
    use AuthorizesApiAccess;

    public function __construct(private readonly UserService $userService) {}

    public function index(): JsonResponse
    {
        $this->authorizeApiPermission('user_list');

        $data = $this->userService->listUsersAndRoleOptions($this->apiUser());

        return $this->successResponse($data, 'User list retrieved successfully.');
    }

    public function store(StoreUserRequest $request): JsonResponse
    {
        $this->authorizeApiPermission('user_create');

        $user = $this->userService->createUser($request->validated(), (string) $request->role);
        if (! $user) {
            return $this->errorResponse('Failed to create user.', 422);
        }

        return $this->successResponse($user->load('roles'), 'User created successfully.', 201);
    }

    public function show(User $user): JsonResponse
    {
        $this->authorizeApiPermission('user_list');

        return $this->successResponse($user->load('roles'), 'User retrieved successfully.');
    }

    public function update(EditUserRequest $request, User $user): JsonResponse
    {
        $this->authorizeApiPermission('user_edit');

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

        return $this->successResponse($user->fresh()->load('roles'), 'User updated successfully.');
    }

    public function updateStatus(Request $request, User $user): JsonResponse
    {
        $this->authorizeApiPermission('user_edit');

        $validated = $request->validate([
            'status' => ['required', 'integer', 'in:0,1'],
        ]);

        $this->userService->updateUserStatus($user, (int) $validated['status']);

        return $this->successResponse($user->fresh(), 'User status updated successfully.');
    }

    public function destroy(User $user): JsonResponse
    {
        $this->authorizeApiPermission('user_delete');

        if (! $this->userService->deleteUser($user)) {
            return $this->errorResponse('This user is protected and cannot be deleted.', 422);
        }

        return $this->successResponse(null, 'User deleted successfully.');
    }
}
