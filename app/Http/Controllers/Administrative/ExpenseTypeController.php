<?php

namespace App\Http\Controllers\Administrative;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreExpenseTypeRequest;
use App\Http\Requests\UpdateExpenseTypeRequest;
use App\Models\ExpenseType;
use App\Services\ExpenseTypeService;
use Inertia\Inertia;

class ExpenseTypeController extends Controller
{
    public function __construct(private readonly ExpenseTypeService $expenseTypeService) {}

    public function index()
    {
        try {
            return Inertia::render('Administrative/ExpenseType/Index', [
                'expenseTypes' => $this->expenseTypeService->listExpenseTypes(),
            ]);
        } catch (\Throwable $th) {
            return redirect()->back()->with('error', 'Something Wrong,Please Try Again');
        }
    }

    public function create() {}

    public function store(StoreExpenseTypeRequest $request)
    {
        try {
            $expenseType = $this->expenseTypeService->createExpenseType($request->validated());
            if (! $expenseType) {
                return redirect()->back()->with('error', 'Expense Type created failed.');
            }

            return redirect()->route('administrative.expense-type.index')->with('success', 'Expense Type created successfully.');
        } catch (\Throwable $th) {
            return redirect()->back()->with('error', 'Something Wrong,Please Try Again');
        }
    }

    public function edit(ExpenseType $expenseType)
    {
        return redirect()->route('administrative.expense-type.index');
    }

    public function update(UpdateExpenseTypeRequest $request, ExpenseType $expenseType)
    {
        try {
            $this->expenseTypeService->updateExpenseType($expenseType, $request->validated());

            return redirect()->route('administrative.expense-type.index')->with('success', 'Expense Type updated successfully.');
        } catch (\Throwable $th) {
            return redirect()->back()->with('error', 'Something Wrong,Please Try Again');
        }
    }

    public function destroy(ExpenseType $expenseType)
    {
        $this->expenseTypeService->deleteExpenseType($expenseType);

        return redirect()->route('administrative.expense-type.index')->with('success', 'Expense Type deleted successfully.');
    }
}
