<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Api\Concerns\AuthorizesApiAccess;
use App\Http\Controllers\Controller;
use App\Http\Requests\StoreNoticeRequest;
use App\Http\Requests\UpdateNoticeRequest;
use App\Http\Traits\ApiResponseTrait;
use App\Models\Notice;
use App\Services\NoticeService;
use Illuminate\Http\JsonResponse;

class NoticeController extends Controller
{
    use ApiResponseTrait;
    use AuthorizesApiAccess;

    public function __construct(private readonly NoticeService $noticeService) {}

    public function index(): JsonResponse
    {
        $this->authorizeApiPermission('notice_list');

        return $this->successResponse(
            $this->noticeService->listNotices(),
            'notice list retrieved successfully.',
        );
    }

    public function store(StoreNoticeRequest $request): JsonResponse
    {
        $this->authorizeApiPermission('notice_create');

        $item = $this->noticeService->createNotice($request->validated());
        if (! $item) {
            return $this->errorResponse('Failed to create notice.', 422);
        }

        return $this->successResponse($item, 'notice created successfully.', 201);
    }

    public function update(UpdateNoticeRequest $request, Notice $notice): JsonResponse
    {
        $this->authorizeApiPermission('notice_edit');

        $this->noticeService->updateNotice($notice, $request->validated());

        return $this->successResponse($notice->fresh(), 'notice updated successfully.');
    }

    public function destroy(Notice $notice): JsonResponse
    {
        $this->authorizeApiPermission('notice_delete');

        $this->noticeService->deleteNotice($notice);

        return $this->successResponse(null, 'notice deleted successfully.');
    }
}
