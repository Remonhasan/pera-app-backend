<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Api\Concerns\AuthorizesApiAccess;
use App\Http\Controllers\Controller;
use App\Http\Requests\StoreWithdrawRequest;
use App\Http\Requests\UpdateWithdrawRequest;
use App\Http\Traits\ApiResponseTrait;
use App\Models\Withdraw;
use App\Services\BankService;
use App\Services\SavingTypeService;
use App\Services\WithdrawService;
use App\Support\ApiUserContext;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\StreamedResponse;

class WithdrawController extends Controller
{
    use ApiResponseTrait;
    use AuthorizesApiAccess;

    public function __construct(
        private readonly WithdrawService $withdrawService,
        private readonly BankService $bankService,
        private readonly SavingTypeService $savingTypeService,
    ) {}

    public function index(): JsonResponse
    {
        $this->authorizeApiPermission('withdraw_list');

        return $this->successResponse([
            'withdraws' => $this->withdrawService->listWithdraws(),
            'members' => $this->withdrawService->memberOptions(),
            'banks' => $this->bankService->bankOptions(),
            'savingTypes' => $this->savingTypeService->savingTypeOptions(),
        ], 'Withdraw list retrieved successfully.');
    }

    public function store(StoreWithdrawRequest $request): JsonResponse
    {
        $this->authorizeApiPermission('withdraw_create');

        $validated = $request->validated();
        $file = $request->file('image');
        unset($validated['image']);

        $withdraw = $this->withdrawService->createWithdraw(
            $validated,
            $file,
            ApiUserContext::actorId(),
        );

        if (! $withdraw) {
            return $this->errorResponse('Failed to create withdraw.', 422);
        }

        return $this->successResponse($withdraw, 'Withdraw created successfully.', 201);
    }

    public function update(UpdateWithdrawRequest $request, Withdraw $withdraw): JsonResponse
    {
        $this->authorizeApiPermission('withdraw_edit');

        $validated = $request->validated();
        $file = $request->file('image');
        $clearImage = (bool) ($validated['clear_withdraw_image'] ?? false);
        unset($validated['image'], $validated['clear_withdraw_image']);

        $this->withdrawService->updateWithdraw(
            $withdraw,
            $validated,
            $file,
            $clearImage,
            ApiUserContext::actorId(),
        );

        return $this->successResponse($withdraw->fresh(), 'Withdraw updated successfully.');
    }

    public function destroy(Withdraw $withdraw): JsonResponse
    {
        $this->authorizeApiPermission('withdraw_delete');

        $this->withdrawService->deleteWithdraw($withdraw);

        return $this->successResponse(null, 'Withdraw deleted successfully.');
    }

    public function image(Withdraw $withdraw): StreamedResponse
    {
        $this->authorizeApiPermission('withdraw_list');

        $path = $withdraw->image;
        if (! $path || ! Storage::disk('public_dir')->exists($path)) {
            abort(404);
        }

        return Storage::disk('public_dir')->response($path, basename($path), [
            'Content-Disposition' => 'inline',
        ]);
    }
}
