<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Api\Concerns\AuthorizesApiAccess;
use App\Http\Controllers\Controller;
use App\Http\Requests\StoreBankRequest;
use App\Http\Requests\UpdateBankRequest;
use App\Http\Traits\ApiResponseTrait;
use App\Models\Bank;
use App\Services\BankService;
use Illuminate\Http\JsonResponse;

class BankController extends Controller
{
    use ApiResponseTrait;
    use AuthorizesApiAccess;

    public function __construct(private readonly BankService $bankService) {}

    public function index(): JsonResponse
    {
        $this->authorizeApiPermission('bank_list');

        return $this->successResponse(
            $this->bankService->listBanks(),
            'bank list retrieved successfully.',
        );
    }

    public function store(StoreBankRequest $request): JsonResponse
    {
        $this->authorizeApiPermission('bank_create');

        $item = $this->bankService->createBank($request->validated());
        if (! $item) {
            return $this->errorResponse('Failed to create bank.', 422);
        }

        return $this->successResponse($item, 'bank created successfully.', 201);
    }

    public function update(UpdateBankRequest $request, Bank $bank): JsonResponse
    {
        $this->authorizeApiPermission('bank_edit');

        $this->bankService->updateBank($bank, $request->validated());

        return $this->successResponse($bank->fresh(), 'bank updated successfully.');
    }

    public function destroy(Bank $bank): JsonResponse
    {
        $this->authorizeApiPermission('bank_delete');

        $this->bankService->deleteBank($bank);

        return $this->successResponse(null, 'bank deleted successfully.');
    }
}
