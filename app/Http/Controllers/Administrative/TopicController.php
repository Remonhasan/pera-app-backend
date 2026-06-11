<?php

namespace App\Http\Controllers\Administrative;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreTopicRequest;
use App\Http\Requests\UpdateTopicRequest;
use App\Models\Topic;
use App\Services\SubjectService;
use App\Services\TopicService;
use Inertia\Inertia;

class TopicController extends Controller
{
    public function __construct(
        private readonly TopicService $topicService,
        private readonly SubjectService $subjectService,
    ) {}

    public function index()
    {
        try {
            return Inertia::render('Administrative/Topic/Index', [
                'topics' => $this->topicService->listTopics(),
                'subjects' => $this->subjectService->subjectOptions(),
            ]);
        } catch (\Throwable $th) {
            return redirect()->back()->with('error', 'Something Wrong,Please Try Again');
        }
    }

    public function create() {}

    public function store(StoreTopicRequest $request)
    {
        try {
            $topic = $this->topicService->createTopic($request->validated());
            if (! $topic) {
                return redirect()->back()->with('error', 'Topic created failed.');
            }

            return redirect()->route('administrative.topic.index')->with('success', 'Topic created successfully.');
        } catch (\Throwable $th) {
            return redirect()->back()->with('error', 'Something Wrong,Please Try Again');
        }
    }

    public function edit(Topic $topic)
    {
        return redirect()->route('administrative.topic.index');
    }

    public function update(UpdateTopicRequest $request, Topic $topic)
    {
        try {
            $this->topicService->updateTopic($topic, $request->validated());

            return redirect()->route('administrative.topic.index')->with('success', 'Topic updated successfully.');
        } catch (\Throwable $th) {
            return redirect()->back()->with('error', 'Something Wrong,Please Try Again');
        }
    }

    public function destroy(Topic $topic)
    {
        $this->topicService->deleteTopic($topic);

        return redirect()->route('administrative.topic.index')->with('success', 'Topic deleted successfully.');
    }
}
