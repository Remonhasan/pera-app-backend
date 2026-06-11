<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Api\Concerns\AuthorizesApiAccess;
use App\Http\Controllers\Controller;
use App\Http\Requests\StoreSubjectRequest;
use App\Http\Requests\UpdateSubjectRequest;
use App\Http\Traits\ApiResponseTrait;
use App\Models\Subject;
use App\Services\SubjectService;
use Illuminate\Http\JsonResponse;

class SubjectController extends Controller
{
    use ApiResponseTrait;
    use AuthorizesApiAccess;

    public function __construct(private readonly SubjectService $subjectService) {}

    public function index(): JsonResponse
    {
        $this->authorizeApiPermission('subject_list');

        return $this->successResponse(
            $this->subjectService->listSubjects(),
            'subject list retrieved successfully.',
        );
    }

    public function store(StoreSubjectRequest $request): JsonResponse
    {
        $this->authorizeApiPermission('subject_create');

        $item = $this->subjectService->createSubject($request->validated());
        if (! $item) {
            return $this->errorResponse('Failed to create subject.', 422);
        }

        return $this->successResponse($item, 'subject created successfully.', 201);
    }

    public function update(UpdateSubjectRequest $request, Subject $subject): JsonResponse
    {
        $this->authorizeApiPermission('subject_edit');

        $this->subjectService->updateSubject($subject, $request->validated());

        return $this->successResponse($subject->fresh(), 'subject updated successfully.');
    }

    public function destroy(Subject $subject): JsonResponse
    {
        $this->authorizeApiPermission('subject_delete');

        $this->subjectService->deleteSubject($subject);

        return $this->successResponse(null, 'subject deleted successfully.');
    }
}
