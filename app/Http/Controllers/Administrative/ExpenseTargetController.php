<?php

namespace App\Http\Controllers\Administrative;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreExpenseTargetRequest;
use App\Http\Requests\UpdateExpenseTargetRequest;
use App\Models\ExpenseTarget;
use App\Services\BudgetTypeService;
use App\Services\ExpenseTargetService;
use Inertia\Inertia;

class ExpenseTargetController extends Controller
{
    public function __construct(
        private readonly ExpenseTargetService $expenseTargetService,
        private readonly BudgetTypeService $budgetTypeService,
    ) {}

    public function index()
    {
        try {
            return Inertia::render('Administrative/ExpenseTarget/Index', [
                'expenseTargets' => $this->expenseTargetService->listExpenseTargets(),
                'budgetTypes' => $this->budgetTypeService->budgetTypeOptions(),
                'members' => $this->expenseTargetService->memberOptions(),
            ]);
        } catch (\Throwable $th) {
            return redirect()->back()->with('error', 'Something Wrong,Please Try Again');
        }
    }

    public function create() {}

    public function store(StoreExpenseTargetRequest $request)
    {
        try {
            $expenseTarget = $this->expenseTargetService->createExpenseTarget($request->validated());
            if (! $expenseTarget) {
                return redirect()->back()->with('error', 'Expense Target created failed.');
            }

            return redirect()->route('administrative.expense-target.index')->with('success', 'Expense Target created successfully.');
        } catch (\Throwable $th) {
            return redirect()->back()->with('error', 'Something Wrong,Please Try Again');
        }
    }

    public function edit(ExpenseTarget $expenseTarget)
    {
        return redirect()->route('administrative.expense-target.index');
    }

    public function update(UpdateExpenseTargetRequest $request, ExpenseTarget $expenseTarget)
    {
        try {
            $this->expenseTargetService->updateExpenseTarget($expenseTarget, $request->validated());

            return redirect()->route('administrative.expense-target.index')->with('success', 'Expense Target updated successfully.');
        } catch (\Throwable $th) {
            return redirect()->back()->with('error', 'Something Wrong,Please Try Again');
        }
    }

    public function destroy(ExpenseTarget $expenseTarget)
    {
        $this->expenseTargetService->deleteExpenseTarget($expenseTarget);

        return redirect()->route('administrative.expense-target.index')->with('success', 'Expense Target deleted successfully.');
    }
}
