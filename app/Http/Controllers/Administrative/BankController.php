<?php

namespace App\Http\Controllers\Administrative;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreBankRequest;
use App\Http\Requests\UpdateBankRequest;
use App\Models\Bank;
use App\Services\BankService;
use Inertia\Inertia;

class BankController extends Controller
{
    public function __construct(private readonly BankService $bankService) {}

    public function index()
    {
        try {
            return Inertia::render('Administrative/Bank/Index', [
                'banks' => $this->bankService->listBanks(),
            ]);
        } catch (\Throwable $th) {
            return redirect()->back()->with('error', 'Something Wrong,Please Try Again');
        }
    }

    public function create() {}

    public function store(StoreBankRequest $request)
    {
        try {
            $bank = $this->bankService->createBank($request->validated());
            if (! $bank) {
                return redirect()->back()->with('error', 'Bank created failed.');
            }

            return redirect()->route('administrative.bank.index')->with('success', 'Bank created successfully.');
        } catch (\Throwable $th) {
            return redirect()->back()->with('error', 'Something Wrong,Please Try Again');
        }
    }

    public function edit(Bank $bank)
    {
        return redirect()->route('administrative.bank.index');
    }

    public function update(UpdateBankRequest $request, Bank $bank)
    {
        try {
            $this->bankService->updateBank($bank, $request->validated());

            return redirect()->route('administrative.bank.index')->with('success', 'Bank updated successfully.');
        } catch (\Throwable $th) {
            return redirect()->back()->with('error', 'Something Wrong,Please Try Again');
        }
    }

    public function destroy(Bank $bank)
    {
        $this->bankService->deleteBank($bank);

        return redirect()->route('administrative.bank.index')->with('success', 'Bank deleted successfully.');
    }
}
