<?php

namespace App\Http\Controllers\Administrative;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreNoticeRequest;
use App\Http\Requests\UpdateNoticeRequest;
use App\Models\Notice;
use App\Services\NoticeService;
use Inertia\Inertia;

class NoticeController extends Controller
{
    public function __construct(private readonly NoticeService $noticeService) {}

    public function index()
    {
        try {
            return Inertia::render('Administrative/Notice/Index', [
                'notices' => $this->noticeService->listNotices(),
            ]);
        } catch (\Throwable $th) {
            return redirect()->back()->with('error', 'Something Wrong,Please Try Again');
        }
    }

    public function create() {}

    public function store(StoreNoticeRequest $request)
    {
        try {
            $notice = $this->noticeService->createNotice($request->validated());
            if (! $notice) {
                return redirect()->back()->with('error', 'Notice created failed.');
            }

            return redirect()->route('administrative.notice.index')->with('success', 'Notice created successfully.');
        } catch (\Throwable $th) {
            return redirect()->back()->with('error', 'Something Wrong,Please Try Again');
        }
    }

    public function edit(Notice $notice)
    {
        return redirect()->route('administrative.notice.index');
    }

    public function update(UpdateNoticeRequest $request, Notice $notice)
    {
        try {
            $this->noticeService->updateNotice($notice, $request->validated());

            return redirect()->route('administrative.notice.index')->with('success', 'Notice updated successfully.');
        } catch (\Throwable $th) {
            return redirect()->back()->with('error', 'Something Wrong,Please Try Again');
        }
    }

    public function destroy(Notice $notice)
    {
        $this->noticeService->deleteNotice($notice);

        return redirect()->route('administrative.notice.index')->with('success', 'Notice deleted successfully.');
    }
}
