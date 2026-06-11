<?php

namespace App\Http\Controllers\Administrative;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreTaskTypeRequest;
use App\Http\Requests\UpdateTaskTypeRequest;
use App\Models\TaskType;
use App\Services\TaskTypeService;
use Inertia\Inertia;

class TaskTypeController extends Controller
{
    public function __construct(private readonly TaskTypeService $taskTypeService) {}

    public function index()
    {
        try {
            return Inertia::render('Administrative/TaskType/Index', [
                'taskTypes' => $this->taskTypeService->listTaskTypes(),
            ]);
        } catch (\Throwable $th) {
            return redirect()->back()->with('error', 'Something Wrong,Please Try Again');
        }
    }

    public function create() {}

    public function store(StoreTaskTypeRequest $request)
    {
        try {
            $taskType = $this->taskTypeService->createTaskType($request->validated());
            if (! $taskType) {
                return redirect()->back()->with('error', 'Task Type created failed.');
            }

            return redirect()->route('administrative.task-type.index')->with('success', 'Task Type created successfully.');
        } catch (\Throwable $th) {
            return redirect()->back()->with('error', 'Something Wrong,Please Try Again');
        }
    }

    public function edit(TaskType $taskType)
    {
        return redirect()->route('administrative.task-type.index');
    }

    public function update(UpdateTaskTypeRequest $request, TaskType $taskType)
    {
        try {
            $this->taskTypeService->updateTaskType($taskType, $request->validated());

            return redirect()->route('administrative.task-type.index')->with('success', 'Task Type updated successfully.');
        } catch (\Throwable $th) {
            return redirect()->back()->with('error', 'Something Wrong,Please Try Again');
        }
    }

    public function destroy(TaskType $taskType)
    {
        $this->taskTypeService->deleteTaskType($taskType);

        return redirect()->route('administrative.task-type.index')->with('success', 'Task Type deleted successfully.');
    }
}
