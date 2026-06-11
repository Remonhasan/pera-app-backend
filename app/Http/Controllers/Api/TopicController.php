<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Api\Concerns\AuthorizesApiAccess;
use App\Http\Controllers\Controller;
use App\Http\Requests\StoreTopicRequest;
use App\Http\Requests\UpdateTopicRequest;
use App\Http\Traits\ApiResponseTrait;
use App\Models\Topic;
use App\Services\TopicService;
use Illuminate\Http\JsonResponse;

class TopicController extends Controller
{
    use ApiResponseTrait;
    use AuthorizesApiAccess;

    public function __construct(private readonly TopicService $topicService) {}

    public function index(): JsonResponse
    {
        $this->authorizeApiPermission('topic_list');

        return $this->successResponse(
            $this->topicService->listTopics(),
            'topic list retrieved successfully.',
        );
    }

    public function store(StoreTopicRequest $request): JsonResponse
    {
        $this->authorizeApiPermission('topic_create');

        $item = $this->topicService->createTopic($request->validated());
        if (! $item) {
            return $this->errorResponse('Failed to create topic.', 422);
        }

        return $this->successResponse($item, 'topic created successfully.', 201);
    }

    public function update(UpdateTopicRequest $request, Topic $topic): JsonResponse
    {
        $this->authorizeApiPermission('topic_edit');

        $this->topicService->updateTopic($topic, $request->validated());

        return $this->successResponse($topic->fresh(), 'topic updated successfully.');
    }

    public function destroy(Topic $topic): JsonResponse
    {
        $this->authorizeApiPermission('topic_delete');

        $this->topicService->deleteTopic($topic);

        return $this->successResponse(null, 'topic deleted successfully.');
    }
}
