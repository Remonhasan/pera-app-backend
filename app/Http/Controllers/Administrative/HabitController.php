<?php

namespace App\Http\Controllers\Administrative;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreHabitRequest;
use App\Http\Requests\UpdateHabitRequest;
use App\Models\Habit;
use App\Services\HabitService;
use Inertia\Inertia;

class HabitController extends Controller
{
    public function __construct(private readonly HabitService $habitService) {}

    public function index()
    {
        try {
            return Inertia::render('Administrative/Habit/Index', [
                'habits' => $this->habitService->listHabits(),
                'members' => $this->habitService->memberOptions(),
            ]);
        } catch (\Throwable $th) {
            return redirect()->back()->with('error', 'Something Wrong,Please Try Again');
        }
    }

    public function create() {}

    public function store(StoreHabitRequest $request)
    {
        try {
            $habit = $this->habitService->createHabit(
                $request->validated(),
                auth()->id(),
            );
            if (! $habit) {
                return redirect()->back()->with('error', 'Habit created failed.');
            }

            return redirect()->route('administrative.habit.index')->with('success', 'Habit created successfully.');
        } catch (\Throwable $th) {
            return redirect()->back()->with('error', 'Something Wrong,Please Try Again');
        }
    }

    public function edit(Habit $habit)
    {
        return redirect()->route('administrative.habit.index');
    }

    public function update(UpdateHabitRequest $request, Habit $habit)
    {
        try {
            $this->habitService->updateHabit(
                $habit,
                $request->validated(),
                auth()->id(),
            );

            return redirect()->route('administrative.habit.index')->with('success', 'Habit updated successfully.');
        } catch (\Throwable $th) {
            return redirect()->back()->with('error', 'Something Wrong,Please Try Again');
        }
    }

    public function destroy(Habit $habit)
    {
        $this->habitService->deleteHabit($habit);

        return redirect()->route('administrative.habit.index')->with('success', 'Habit deleted successfully.');
    }
}
