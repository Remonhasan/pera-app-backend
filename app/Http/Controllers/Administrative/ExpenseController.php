<?php

namespace App\Http\Controllers\Administrative;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreExpenseRequest;
use App\Http\Requests\UpdateExpenseRequest;
use App\Models\Expense;
use App\Services\BudgetTypeService;
use App\Services\ExpenseService;
use App\Services\ExpenseTypeService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class ExpenseController extends Controller
{
    public function __construct(
        private readonly ExpenseService $expenseService,
        private readonly ExpenseTypeService $expenseTypeService,
        private readonly BudgetTypeService $budgetTypeService,
    ) {}

    public function index()
    {
        try {
            return Inertia::render('Administrative/Expense/Index', [
                'expenses' => $this->expenseService->listExpenses(),
                'members' => $this->expenseService->memberOptions(),
                'expenseTypes' => $this->expenseTypeService->expenseTypeOptions(),
                'budgetTypes' => $this->budgetTypeService->budgetTypeOptions(),
            ]);
        } catch (\Throwable $th) {
            return redirect()->back()->with('error', 'Something Wrong,Please Try Again');
        }
    }

    public function create() {}

    public function expenseImage(Request $request, Expense $expense)
    {
        abort_unless($request->user()->can('expense_list'), 403);

        $path = $expense->image;
        if (! $path || ! Storage::disk('public_dir')->exists($path)) {
            abort(404);
        }

        return Storage::disk('public_dir')->response($path, basename($path), [
            'Content-Disposition' => 'inline',
        ]);
    }

    public function store(StoreExpenseRequest $request)
    {
        try {
            $validated = $request->validated();
            $file = $request->file('image');
            unset($validated['image']);

            $expense = $this->expenseService->createExpense(
                $validated,
                $file,
                auth()->id(),
            );
            if (! $expense) {
                return redirect()->back()->with('error', 'Expense created failed.');
            }

            return redirect()->route('administrative.expense.index')->with('success', 'Expense created successfully.');
        } catch (\Throwable $th) {
            return redirect()->back()->with('error', 'Something Wrong,Please Try Again');
        }
    }

    public function edit(Expense $expense)
    {
        return redirect()->route('administrative.expense.index');
    }

    public function update(UpdateExpenseRequest $request, Expense $expense)
    {
        try {
            $validated = $request->validated();
            $file = $request->file('image');
            $clearImage = (bool) ($validated['clear_expense_image'] ?? false);
            unset($validated['image'], $validated['clear_expense_image']);

            $this->expenseService->updateExpense(
                $expense,
                $validated,
                $file,
                $clearImage,
                auth()->id(),
            );

            return redirect()->route('administrative.expense.index')->with('success', 'Expense updated successfully.');
        } catch (\Throwable $th) {
            return redirect()->back()->with('error', 'Something Wrong,Please Try Again');
        }
    }

    public function destroy(Expense $expense)
    {
        $this->expenseService->deleteExpense($expense);

        return redirect()->route('administrative.expense.index')->with('success', 'Expense deleted successfully.');
    }
}
