<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Traits\ApiResponseTrait;
use App\Models\User;
use App\Services\ReportService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MemberNoticeController extends Controller
{
    use ApiResponseTrait;

    public function __construct(private readonly ReportService $reportService) {}

    public function index(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = auth('api')->user();

        if (! $user->hasRole(User::MEMBER_ROLE, User::MEMBER_GUARD)) {
            return $this->errorResponse('You do not have permission to access notices.', 403);
        }

        $notices = $this->reportService->listNotices();

        return $this->successResponse($notices, 'Notices retrieved successfully.');
    }
}
