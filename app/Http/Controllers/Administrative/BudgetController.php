<?php

namespace App\Http\Controllers\Administrative;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreBudgetRequest;
use App\Http\Requests\UpdateBudgetRequest;
use App\Models\Budget;
use App\Services\BudgetService;
use App\Services\BudgetTypeService;
use Inertia\Inertia;

class BudgetController extends Controller
{
    public function __construct(
        private readonly BudgetService $budgetService,
        private readonly BudgetTypeService $budgetTypeService,
    ) {}

    public function index()
    {
        try {
            return Inertia::render('Administrative/Budget/Index', [
                'budgets' => $this->budgetService->listBudgets(),
                'budgetTypes' => $this->budgetTypeService->budgetTypeOptions(),
                'members' => $this->budgetService->memberOptions(),
            ]);
        } catch (\Throwable $th) {
            return redirect()->back()->with('error', 'Something Wrong,Please Try Again');
        }
    }

    public function create() {}

    public function store(StoreBudgetRequest $request)
    {
        try {
            $budget = $this->budgetService->createBudget(
                $request->validated(),
                auth()->id(),
            );
            if (! $budget) {
                return redirect()->back()->with('error', 'Budget created failed.');
            }

            return redirect()->route('administrative.budget.index')->with('success', 'Budget created successfully.');
        } catch (\Throwable $th) {
            return redirect()->back()->with('error', 'Something Wrong,Please Try Again');
        }
    }

    public function edit(Budget $budget)
    {
        return redirect()->route('administrative.budget.index');
    }

    public function update(UpdateBudgetRequest $request, Budget $budget)
    {
        try {
            $this->budgetService->updateBudget(
                $budget,
                $request->validated(),
                auth()->id(),
            );

            return redirect()->route('administrative.budget.index')->with('success', 'Budget updated successfully.');
        } catch (\Throwable $th) {
            return redirect()->back()->with('error', 'Something Wrong,Please Try Again');
        }
    }

    public function destroy(Budget $budget)
    {
        $this->budgetService->deleteBudget($budget);

        return redirect()->route('administrative.budget.index')->with('success', 'Budget deleted successfully.');
    }
}
