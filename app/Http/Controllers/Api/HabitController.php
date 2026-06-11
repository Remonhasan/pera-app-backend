<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Api\Concerns\AuthorizesApiAccess;
use App\Http\Controllers\Controller;
use App\Http\Requests\StoreHabitRequest;
use App\Http\Requests\UpdateHabitRequest;
use App\Http\Traits\ApiResponseTrait;
use App\Models\Habit;
use App\Services\HabitService;
use App\Support\ApiUserContext;
use Illuminate\Http\JsonResponse;

class HabitController extends Controller
{
    use ApiResponseTrait;
    use AuthorizesApiAccess;

    public function __construct(private readonly HabitService $habitService) {}

    public function index(): JsonResponse
    {
        $this->authorizeApiPermission('habit_list');

        return $this->successResponse([
            'habits' => $this->habitService->listHabits(),
            'members' => $this->habitService->memberOptions(),
        ], 'Habit list retrieved successfully.');
    }

    public function store(StoreHabitRequest $request): JsonResponse
    {
        $this->authorizeApiPermission('habit_create');

        $habit = $this->habitService->createHabit(
            $request->validated(),
            ApiUserContext::actorId(),
        );

        if (! $habit) {
            return $this->errorResponse('Failed to create habit.', 422);
        }

        return $this->successResponse($habit, 'Habit created successfully.', 201);
    }

    public function update(UpdateHabitRequest $request, Habit $habit): JsonResponse
    {
        $this->authorizeApiPermission('habit_edit');

        $this->habitService->updateHabit(
            $habit,
            $request->validated(),
            ApiUserContext::actorId(),
        );

        return $this->successResponse($habit->fresh(), 'Habit updated successfully.');
    }

    public function destroy(Habit $habit): JsonResponse
    {
        $this->authorizeApiPermission('habit_delete');

        $this->habitService->deleteHabit($habit);

        return $this->successResponse(null, 'Habit deleted successfully.');
    }
}
