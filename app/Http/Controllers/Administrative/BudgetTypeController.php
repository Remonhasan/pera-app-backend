<?php

namespace App\Http\Controllers\Administrative;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreBudgetTypeRequest;
use App\Http\Requests\UpdateBudgetTypeRequest;
use App\Models\BudgetType;
use App\Services\BudgetTypeService;
use Inertia\Inertia;

class BudgetTypeController extends Controller
{
    public function __construct(private readonly BudgetTypeService $budgetTypeService) {}

    public function index()
    {
        try {
            return Inertia::render('Administrative/BudgetType/Index', [
                'budgetTypes' => $this->budgetTypeService->listBudgetTypes(),
            ]);
        } catch (\Throwable $th) {
            return redirect()->back()->with('error', 'Something Wrong,Please Try Again');
        }
    }

    public function create() {}

    public function store(StoreBudgetTypeRequest $request)
    {
        try {
            $budgetType = $this->budgetTypeService->createBudgetType($request->validated());
            if (! $budgetType) {
                return redirect()->back()->with('error', 'Budget Type created failed.');
            }

            return redirect()->route('administrative.budget-type.index')->with('success', 'Budget Type created successfully.');
        } catch (\Throwable $th) {
            return redirect()->back()->with('error', 'Something Wrong,Please Try Again');
        }
    }

    public function edit(BudgetType $budgetType)
    {
        return redirect()->route('administrative.budget-type.index');
    }

    public function update(UpdateBudgetTypeRequest $request, BudgetType $budgetType)
    {
        try {
            $this->budgetTypeService->updateBudgetType($budgetType, $request->validated());

            return redirect()->route('administrative.budget-type.index')->with('success', 'Budget Type updated successfully.');
        } catch (\Throwable $th) {
            return redirect()->back()->with('error', 'Something Wrong,Please Try Again');
        }
    }

    public function destroy(BudgetType $budgetType)
    {
        $this->budgetTypeService->deleteBudgetType($budgetType);

        return redirect()->route('administrative.budget-type.index')->with('success', 'Budget Type deleted successfully.');
    }
}
