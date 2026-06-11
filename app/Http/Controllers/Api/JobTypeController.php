<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Api\Concerns\AuthorizesApiAccess;
use App\Http\Controllers\Controller;
use App\Http\Requests\StoreJobTypeRequest;
use App\Http\Requests\UpdateJobTypeRequest;
use App\Http\Traits\ApiResponseTrait;
use App\Models\JobType;
use App\Services\JobTypeService;
use Illuminate\Http\JsonResponse;

class JobTypeController extends Controller
{
    use ApiResponseTrait;
    use AuthorizesApiAccess;

    public function __construct(private readonly JobTypeService $jobTypeService) {}

    public function index(): JsonResponse
    {
        $this->authorizeApiPermission('job_type_list');

        return $this->successResponse(
            $this->jobTypeService->listJobTypes(),
            'job type list retrieved successfully.',
        );
    }

    public function store(StoreJobTypeRequest $request): JsonResponse
    {
        $this->authorizeApiPermission('job_type_create');

        $item = $this->jobTypeService->createJobType($request->validated());
        if (! $item) {
            return $this->errorResponse('Failed to create job type.', 422);
        }

        return $this->successResponse($item, 'job type created successfully.', 201);
    }

    public function update(UpdateJobTypeRequest $request, JobType $jobType): JsonResponse
    {
        $this->authorizeApiPermission('job_type_edit');

        $this->jobTypeService->updateJobType($jobType, $request->validated());

        return $this->successResponse($jobType->fresh(), 'job type updated successfully.');
    }

    public function destroy(JobType $jobType): JsonResponse
    {
        $this->authorizeApiPermission('job_type_delete');

        $this->jobTypeService->deleteJobType($jobType);

        return $this->successResponse(null, 'job type deleted successfully.');
    }
}
