<?php

namespace App\Http\Controllers\Administrative;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreJobTypeRequest;
use App\Http\Requests\UpdateJobTypeRequest;
use App\Models\JobType;
use App\Services\JobTypeService;
use Inertia\Inertia;

class JobTypeController extends Controller
{
    public function __construct(private readonly JobTypeService $jobTypeService) {}

    public function index()
    {
        try {
            return Inertia::render('Administrative/JobType/Index', [
                'jobTypes' => $this->jobTypeService->listJobTypes(),
            ]);
        } catch (\Throwable $th) {
            return redirect()->back()->with('error', 'Something Wrong,Please Try Again');
        }
    }

    public function create() {}

    public function store(StoreJobTypeRequest $request)
    {
        try {
            $jobType = $this->jobTypeService->createJobType($request->validated());
            if (! $jobType) {
                return redirect()->back()->with('error', 'Job Type created failed.');
            }

            return redirect()->route('administrative.job-type.index')->with('success', 'Job Type created successfully.');
        } catch (\Throwable $th) {
            return redirect()->back()->with('error', 'Something Wrong,Please Try Again');
        }
    }

    public function edit(JobType $jobType)
    {
        return redirect()->route('administrative.job-type.index');
    }

    public function update(UpdateJobTypeRequest $request, JobType $jobType)
    {
        try {
            $this->jobTypeService->updateJobType($jobType, $request->validated());

            return redirect()->route('administrative.job-type.index')->with('success', 'Job Type updated successfully.');
        } catch (\Throwable $th) {
            return redirect()->back()->with('error', 'Something Wrong,Please Try Again');
        }
    }

    public function destroy(JobType $jobType)
    {
        $this->jobTypeService->deleteJobType($jobType);

        return redirect()->route('administrative.job-type.index')->with('success', 'Job Type deleted successfully.');
    }
}
