<?php

namespace App\Http\Controllers\Administrative;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreGoalRequest;
use App\Http\Requests\UpdateGoalRequest;
use App\Models\Goal;
use App\Services\BankService;
use App\Services\GoalService;
use App\Services\SavingTypeService;
use Inertia\Inertia;

class GoalController extends Controller
{
    public function __construct(
        private readonly GoalService $goalService,
        private readonly BankService $bankService,
        private readonly SavingTypeService $savingTypeService,
    ) {}

    public function index()
    {
        try {
            return Inertia::render('Administrative/Goal/Index', [
                'goals' => $this->goalService->listGoals(),
                'members' => $this->goalService->memberOptions(),
                'banks' => $this->bankService->bankOptions(),
                'savingTypes' => $this->savingTypeService->savingTypeOptions(),
            ]);
        } catch (\Throwable $th) {
            return redirect()->back()->with('error', 'Something Wrong,Please Try Again');
        }
    }

    public function create() {}

    public function store(StoreGoalRequest $request)
    {
        try {
            $goal = $this->goalService->createGoal(
                $request->validated(),
                auth()->id(),
            );
            if (! $goal) {
                return redirect()->back()->with('error', 'Goal created failed.');
            }

            return redirect()->route('administrative.goal.index')->with('success', 'Goal created successfully.');
        } catch (\Throwable $th) {
            return redirect()->back()->with('error', 'Something Wrong,Please Try Again');
        }
    }

    public function edit(Goal $goal)
    {
        return redirect()->route('administrative.goal.index');
    }

    public function update(UpdateGoalRequest $request, Goal $goal)
    {
        try {
            $this->goalService->updateGoal(
                $goal,
                $request->validated(),
                auth()->id(),
            );

            return redirect()->route('administrative.goal.index')->with('success', 'Goal updated successfully.');
        } catch (\Throwable $th) {
            return redirect()->back()->with('error', 'Something Wrong,Please Try Again');
        }
    }

    public function destroy(Goal $goal)
    {
        $this->goalService->deleteGoal($goal);

        return redirect()->route('administrative.goal.index')->with('success', 'Goal deleted successfully.');
    }
}
