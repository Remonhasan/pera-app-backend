<?php

namespace App\Http\Controllers\Administrative;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreHabitTypeRequest;
use App\Http\Requests\UpdateHabitTypeRequest;
use App\Models\HabitType;
use App\Services\HabitTypeService;
use Inertia\Inertia;

class HabitTypeController extends Controller
{
    public function __construct(private readonly HabitTypeService $habitTypeService) {}

    public function index()
    {
        try {
            return Inertia::render('Administrative/HabitType/Index', [
                'habitTypes' => $this->habitTypeService->listHabitTypes(),
            ]);
        } catch (\Throwable $th) {
            return redirect()->back()->with('error', 'Something Wrong,Please Try Again');
        }
    }

    public function create() {}

    public function store(StoreHabitTypeRequest $request)
    {
        try {
            $habitType = $this->habitTypeService->createHabitType($request->validated());
            if (! $habitType) {
                return redirect()->back()->with('error', 'Habit Type created failed.');
            }

            return redirect()->route('administrative.habit-type.index')->with('success', 'Habit Type created successfully.');
        } catch (\Throwable $th) {
            return redirect()->back()->with('error', 'Something Wrong,Please Try Again');
        }
    }

    public function edit(HabitType $habitType)
    {
        return redirect()->route('administrative.habit-type.index');
    }

    public function update(UpdateHabitTypeRequest $request, HabitType $habitType)
    {
        try {
            $this->habitTypeService->updateHabitType($habitType, $request->validated());

            return redirect()->route('administrative.habit-type.index')->with('success', 'Habit Type updated successfully.');
        } catch (\Throwable $th) {
            return redirect()->back()->with('error', 'Something Wrong,Please Try Again');
        }
    }

    public function destroy(HabitType $habitType)
    {
        $this->habitTypeService->deleteHabitType($habitType);

        return redirect()->route('administrative.habit-type.index')->with('success', 'Habit Type deleted successfully.');
    }
}
