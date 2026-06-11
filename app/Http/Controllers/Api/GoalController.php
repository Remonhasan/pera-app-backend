<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Api\Concerns\AuthorizesApiAccess;
use App\Http\Controllers\Controller;
use App\Http\Requests\StoreGoalRequest;
use App\Http\Requests\UpdateGoalRequest;
use App\Http\Traits\ApiResponseTrait;
use App\Models\Goal;
use App\Services\BankService;
use App\Services\GoalService;
use App\Services\SavingTypeService;
use App\Support\ApiUserContext;
use Illuminate\Http\JsonResponse;

class GoalController extends Controller
{
    use ApiResponseTrait;
    use AuthorizesApiAccess;

    public function __construct(
        private readonly GoalService $goalService,
        private readonly BankService $bankService,
        private readonly SavingTypeService $savingTypeService,
    ) {}

    public function index(): JsonResponse
    {
        $this->authorizeApiPermission('goal_list');

        return $this->successResponse([
            'goals' => $this->goalService->listGoals(),
            'members' => $this->goalService->memberOptions(),
            'banks' => $this->bankService->bankOptions(),
            'savingTypes' => $this->savingTypeService->savingTypeOptions(),
        ], 'Goal list retrieved successfully.');
    }

    public function store(StoreGoalRequest $request): JsonResponse
    {
        $this->authorizeApiPermission('goal_create');

        $goal = $this->goalService->createGoal(
            $request->validated(),
            ApiUserContext::actorId(),
        );

        if (! $goal) {
            return $this->errorResponse('Failed to create goal.', 422);
        }

        return $this->successResponse($goal, 'Goal created successfully.', 201);
    }

    public function update(UpdateGoalRequest $request, Goal $goal): JsonResponse
    {
        $this->authorizeApiPermission('goal_edit');

        $this->goalService->updateGoal(
            $goal,
            $request->validated(),
            ApiUserContext::actorId(),
        );

        return $this->successResponse($goal->fresh(), 'Goal updated successfully.');
    }

    public function destroy(Goal $goal): JsonResponse
    {
        $this->authorizeApiPermission('goal_delete');

        $this->goalService->deleteGoal($goal);

        return $this->successResponse(null, 'Goal deleted successfully.');
    }
}
