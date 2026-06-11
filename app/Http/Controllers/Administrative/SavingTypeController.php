<?php

namespace App\Http\Controllers\Administrative;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreSavingTypeRequest;
use App\Http\Requests\UpdateSavingTypeRequest;
use App\Models\SavingType;
use App\Services\SavingTypeService;
use Inertia\Inertia;

class SavingTypeController extends Controller
{
    public function __construct(private readonly SavingTypeService $savingTypeService) {}

    public function index()
    {
        try {
            return Inertia::render('Administrative/SavingType/Index', [
                'savingTypes' => $this->savingTypeService->listSavingTypes(),
            ]);
        } catch (\Throwable $th) {
            return redirect()->back()->with('error', 'Something Wrong,Please Try Again');
        }
    }

    public function create() {}

    public function store(StoreSavingTypeRequest $request)
    {
        try {
            $savingType = $this->savingTypeService->createSavingType($request->validated());
            if (! $savingType) {
                return redirect()->back()->with('error', 'Savings Type created failed.');
            }

            return redirect()->route('administrative.saving-type.index')->with('success', 'Savings Type created successfully.');
        } catch (\Throwable $th) {
            return redirect()->back()->with('error', 'Something Wrong,Please Try Again');
        }
    }

    public function edit(SavingType $savingType)
    {
        return redirect()->route('administrative.saving-type.index');
    }

    public function update(UpdateSavingTypeRequest $request, SavingType $savingType)
    {
        try {
            $this->savingTypeService->updateSavingType($savingType, $request->validated());

            return redirect()->route('administrative.saving-type.index')->with('success', 'Savings Type updated successfully.');
        } catch (\Throwable $th) {
            return redirect()->back()->with('error', 'Something Wrong,Please Try Again');
        }
    }

    public function destroy(SavingType $savingType)
    {
        $this->savingTypeService->deleteSavingType($savingType);

        return redirect()->route('administrative.saving-type.index')->with('success', 'Savings Type deleted successfully.');
    }
}
