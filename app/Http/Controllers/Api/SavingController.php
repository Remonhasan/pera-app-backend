<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Api\Concerns\AuthorizesApiAccess;
use App\Http\Controllers\Controller;
use App\Http\Requests\StoreSavingRequest;
use App\Http\Requests\UpdateSavingRequest;
use App\Http\Traits\ApiResponseTrait;
use App\Models\Saving;
use App\Services\BankService;
use App\Services\SavingService;
use App\Services\SavingTypeService;
use App\Support\ApiUserContext;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\StreamedResponse;

class SavingController extends Controller
{
    use ApiResponseTrait;
    use AuthorizesApiAccess;

    public function __construct(
        private readonly SavingService $savingService,
        private readonly BankService $bankService,
        private readonly SavingTypeService $savingTypeService,
    ) {}

    public function index(): JsonResponse
    {
        $this->authorizeApiPermission('saving_list');

        return $this->successResponse([
            'savings' => $this->savingService->listSavings(),
            'members' => $this->savingService->memberOptions(),
            'banks' => $this->bankService->bankOptions(),
            'savingTypes' => $this->savingTypeService->savingTypeOptions(),
        ], 'Saving list retrieved successfully.');
    }

    public function store(StoreSavingRequest $request): JsonResponse
    {
        $this->authorizeApiPermission('saving_create');

        $validated = $request->validated();
        $file = $request->file('image');
        unset($validated['image']);

        $saving = $this->savingService->createSaving(
            $validated,
            $file,
            ApiUserContext::actorId(),
        );

        if (! $saving) {
            return $this->errorResponse('Failed to create saving.', 422);
        }

        return $this->successResponse($saving, 'Saving created successfully.', 201);
    }

    public function update(UpdateSavingRequest $request, Saving $saving): JsonResponse
    {
        $this->authorizeApiPermission('saving_edit');

        $validated = $request->validated();
        $file = $request->file('image');
        $clearImage = (bool) ($validated['clear_saving_image'] ?? false);
        unset($validated['image'], $validated['clear_saving_image']);

        $this->savingService->updateSaving(
            $saving,
            $validated,
            $file,
            $clearImage,
            ApiUserContext::actorId(),
        );

        return $this->successResponse($saving->fresh(), 'Saving updated successfully.');
    }

    public function destroy(Saving $saving): JsonResponse
    {
        $this->authorizeApiPermission('saving_delete');

        $this->savingService->deleteSaving($saving);

        return $this->successResponse(null, 'Saving deleted successfully.');
    }

    public function image(Saving $saving): StreamedResponse
    {
        $this->authorizeApiPermission('saving_list');

        $path = $saving->image;
        if (! $path || ! Storage::disk('public_dir')->exists($path)) {
            abort(404);
        }

        return Storage::disk('public_dir')->response($path, basename($path), [
            'Content-Disposition' => 'inline',
        ]);
    }
}
