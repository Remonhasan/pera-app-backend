<?php

namespace App\Http\Controllers\Administrative;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreSubjectRequest;
use App\Http\Requests\UpdateSubjectRequest;
use App\Models\Subject;
use App\Services\SubjectService;
use Inertia\Inertia;

class SubjectController extends Controller
{
    public function __construct(private readonly SubjectService $subjectService) {}

    public function index()
    {
        try {
            return Inertia::render('Administrative/Subject/Index', [
                'subjects' => $this->subjectService->listSubjects(),
            ]);
        } catch (\Throwable $th) {
            return redirect()->back()->with('error', 'Something Wrong,Please Try Again');
        }
    }

    public function create() {}

    public function store(StoreSubjectRequest $request)
    {
        try {
            $subject = $this->subjectService->createSubject($request->validated());
            if (! $subject) {
                return redirect()->back()->with('error', 'Subject created failed.');
            }

            return redirect()->route('administrative.subject.index')->with('success', 'Subject created successfully.');
        } catch (\Throwable $th) {
            return redirect()->back()->with('error', 'Something Wrong,Please Try Again');
        }
    }

    public function edit(Subject $subject)
    {
        return redirect()->route('administrative.subject.index');
    }

    public function update(UpdateSubjectRequest $request, Subject $subject)
    {
        try {
            $this->subjectService->updateSubject($subject, $request->validated());

            return redirect()->route('administrative.subject.index')->with('success', 'Subject updated successfully.');
        } catch (\Throwable $th) {
            return redirect()->back()->with('error', 'Something Wrong,Please Try Again');
        }
    }

    public function destroy(Subject $subject)
    {
        $this->subjectService->deleteSubject($subject);

        return redirect()->route('administrative.subject.index')->with('success', 'Subject deleted successfully.');
    }
}
