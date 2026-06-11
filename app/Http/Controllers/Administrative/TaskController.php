<?php

namespace App\Http\Controllers\Administrative;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreTaskRequest;
use App\Http\Requests\UpdateTaskRequest;
use App\Models\Task;
use App\Services\TaskService;
use Inertia\Inertia;

class TaskController extends Controller
{
    public function __construct(private readonly TaskService $taskService) {}

    public function index()
    {
        try {
            return Inertia::render('Administrative/Task/Index', [
                'tasks' => $this->taskService->listTasks(),
                'members' => $this->taskService->memberOptions(),
            ]);
        } catch (\Throwable $th) {
            return redirect()->back()->with('error', 'Something Wrong,Please Try Again');
        }
    }

    public function create() {}

    public function store(StoreTaskRequest $request)
    {
        try {
            $task = $this->taskService->createTask(
                $request->validated(),
                auth()->id(),
            );
            if (! $task) {
                return redirect()->back()->with('error', 'Task created failed.');
            }

            return redirect()->route('administrative.task.index')->with('success', 'Task created successfully.');
        } catch (\Throwable $th) {
            return redirect()->back()->with('error', 'Something Wrong,Please Try Again');
        }
    }

    public function edit(Task $task)
    {
        return redirect()->route('administrative.task.index');
    }

    public function update(UpdateTaskRequest $request, Task $task)
    {
        try {
            $this->taskService->updateTask(
                $task,
                $request->validated(),
                auth()->id(),
            );

            return redirect()->route('administrative.task.index')->with('success', 'Task updated successfully.');
        } catch (\Throwable $th) {
            return redirect()->back()->with('error', 'Something Wrong,Please Try Again');
        }
    }

    public function destroy(Task $task)
    {
        $this->taskService->deleteTask($task);

        return redirect()->route('administrative.task.index')->with('success', 'Task deleted successfully.');
    }
}
