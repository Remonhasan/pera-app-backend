<?php

namespace App\Http\Controllers\Administrative;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreWithdrawRequest;
use App\Http\Requests\UpdateWithdrawRequest;
use App\Models\Withdraw;
use App\Services\BankService;
use App\Services\SavingTypeService;
use App\Services\WithdrawService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class WithdrawController extends Controller
{
    public function __construct(
        private readonly WithdrawService $withdrawService,
        private readonly BankService $bankService,
        private readonly SavingTypeService $savingTypeService,
    ) {}

    public function index()
    {
        try {
            return Inertia::render('Administrative/Withdraw/Index', [
                'withdraws' => $this->withdrawService->listWithdraws(),
                'members' => $this->withdrawService->memberOptions(),
                'banks' => $this->bankService->bankOptions(),
                'savingTypes' => $this->savingTypeService->savingTypeOptions(),
            ]);
        } catch (\Throwable $th) {
            return redirect()->back()->with('error', 'Something Wrong,Please Try Again');
        }
    }

    public function create() {}

    public function withdrawImage(Request $request, Withdraw $withdraw)
    {
        abort_unless($request->user()->can('withdraw_list'), 403);

        $path = $withdraw->image;
        if (! $path || ! Storage::disk('public_dir')->exists($path)) {
            abort(404);
        }

        return Storage::disk('public_dir')->response($path, basename($path), [
            'Content-Disposition' => 'inline',
        ]);
    }

    public function store(StoreWithdrawRequest $request)
    {
        try {
            $validated = $request->validated();
            $file = $request->file('image');
            unset($validated['image']);

            $withdraw = $this->withdrawService->createWithdraw(
                $validated,
                $file,
                auth()->id(),
            );
            if (! $withdraw) {
                return redirect()->back()->with('error', 'Withdraw created failed.');
            }

            return redirect()->route('administrative.withdraw.index')->with('success', 'Withdraw created successfully.');
        } catch (\Throwable $th) {
            return redirect()->back()->with('error', 'Something Wrong,Please Try Again');
        }
    }

    public function edit(Withdraw $withdraw)
    {
        return redirect()->route('administrative.withdraw.index');
    }

    public function update(UpdateWithdrawRequest $request, Withdraw $withdraw)
    {
        try {
            $validated = $request->validated();
            $file = $request->file('image');
            $clearImage = (bool) ($validated['clear_withdraw_image'] ?? false);
            unset($validated['image'], $validated['clear_withdraw_image']);

            $this->withdrawService->updateWithdraw(
                $withdraw,
                $validated,
                $file,
                $clearImage,
                auth()->id(),
            );

            return redirect()->route('administrative.withdraw.index')->with('success', 'Withdraw updated successfully.');
        } catch (\Throwable $th) {
            return redirect()->back()->with('error', 'Something Wrong,Please Try Again');
        }
    }

    public function destroy(Withdraw $withdraw)
    {
        $this->withdrawService->deleteWithdraw($withdraw);

        return redirect()->route('administrative.withdraw.index')->with('success', 'Withdraw deleted successfully.');
    }
}
