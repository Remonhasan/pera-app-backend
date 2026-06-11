<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Api\Concerns\AuthorizesApiAccess;
use App\Http\Controllers\Controller;
use App\Http\Traits\ApiResponseTrait;
use App\Models\User;
use App\Services\ReportService;
use App\Support\ApiUserContext;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MembersController extends Controller
{
    use ApiResponseTrait;
    use AuthorizesApiAccess;

    public function __construct(private readonly ReportService $reportService) {}

    public function index(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = auth('api')->user();

        if (
            ! $user->hasRole(User::MEMBER_ROLE, User::MEMBER_GUARD)
            && ! ApiUserContext::can($user, 'user_list')
        ) {
            return $this->errorResponse('You do not have permission to access the members list.', 403);
        }

        $members = $this->reportService->listMembers();

        return $this->successResponse($members, 'Members retrieved successfully.');
    }
}
