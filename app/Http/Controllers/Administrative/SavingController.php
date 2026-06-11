<?php

namespace App\Http\Controllers\Administrative;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreSavingRequest;
use App\Http\Requests\UpdateSavingRequest;
use App\Models\Saving;
use App\Services\BankService;
use App\Services\SavingService;
use App\Services\SavingTypeService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class SavingController extends Controller
{
    public function __construct(
        private readonly SavingService $savingService,
        private readonly BankService $bankService,
        private readonly SavingTypeService $savingTypeService,
    ) {}

    public function index()
    {
        try {
            return Inertia::render('Administrative/Saving/Index', [
                'savings' => $this->savingService->listSavings(),
                'members' => $this->savingService->memberOptions(),
                'banks' => $this->bankService->bankOptions(),
                'savingTypes' => $this->savingTypeService->savingTypeOptions(),
            ]);
        } catch (\Throwable $th) {
            return redirect()->back()->with('error', 'Something Wrong,Please Try Again');
        }
    }

    public function create() {}

    public function savingImage(Request $request, Saving $saving)
    {
        abort_unless($request->user()->can('saving_list'), 403);

        $path = $saving->image;
        if (! $path || ! Storage::disk('public_dir')->exists($path)) {
            abort(404);
        }

        return Storage::disk('public_dir')->response($path, basename($path), [
            'Content-Disposition' => 'inline',
        ]);
    }

    public function store(StoreSavingRequest $request)
    {
        try {
            $validated = $request->validated();
            $file = $request->file('image');
            unset($validated['image']);

            $saving = $this->savingService->createSaving(
                $validated,
                $file,
                auth()->id(),
            );
            if (! $saving) {
                return redirect()->back()->with('error', 'Saving created failed.');
            }

            return redirect()->route('administrative.saving.index')->with('success', 'Saving created successfully.');
        } catch (\Throwable $th) {
            return redirect()->back()->with('error', 'Something Wrong,Please Try Again');
        }
    }

    public function edit(Saving $saving)
    {
        return redirect()->route('administrative.saving.index');
    }

    public function update(UpdateSavingRequest $request, Saving $saving)
    {
        try {
            $validated = $request->validated();
            $file = $request->file('image');
            $clearImage = (bool) ($validated['clear_saving_image'] ?? false);
            unset($validated['image'], $validated['clear_saving_image']);

            $this->savingService->updateSaving(
                $saving,
                $validated,
                $file,
                $clearImage,
                auth()->id(),
            );

            return redirect()->route('administrative.saving.index')->with('success', 'Saving updated successfully.');
        } catch (\Throwable $th) {
            return redirect()->back()->with('error', 'Something Wrong,Please Try Again');
        }
    }

    public function destroy(Saving $saving)
    {
        $this->savingService->deleteSaving($saving);

        return redirect()->route('administrative.saving.index')->with('success', 'Saving deleted successfully.');
    }
}
