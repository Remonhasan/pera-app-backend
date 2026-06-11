<?php

namespace App\Services;

use App\Models\Topic;
use App\Repositories\Contracts\TopicRepositoryInterface;
use Illuminate\Support\Collection;

class TopicService
{
    public function __construct(private readonly TopicRepositoryInterface $topics) {}

    public function listTopics(): Collection
    {
        return $this->topics->allWithRelations();
    }

    /** @return list<array{id: int, topic: string, subject_id: int}> */
    public function topicOptions(): array
    {
        return Topic::query()
            ->where('status', true)
            ->orderBy('topic')
            ->get(['id', 'topic', 'subject_id'])
            ->map(fn (Topic $topic) => [
                'id' => $topic->id,
                'topic' => $topic->topic,
                'subject_id' => $topic->subject_id,
            ])
            ->all();
    }

    /** @param  array<string, mixed>  $validated */
    public function createTopic(array $validated): ?Topic
    {
        return $this->topics->create([
            'subject_id' => (int) $validated['subject_id'],
            'topic' => $validated['topic'],
            'status' => $validated['status'] ?? true,
        ]);
    }

    /** @param  array<string, mixed>  $validated */
    public function updateTopic(Topic $topic, array $validated): bool
    {
        $payload = [];

        if (array_key_exists('subject_id', $validated)) {
            $payload['subject_id'] = (int) $validated['subject_id'];
        }
        if (array_key_exists('topic', $validated)) {
            $payload['topic'] = $validated['topic'];
        }
        if (array_key_exists('status', $validated)) {
            $payload['status'] = (bool) $validated['status'];
        }

        return $this->topics->update($topic, $payload);
    }

    public function deleteTopic(Topic $topic): bool
    {
        return $this->topics->delete($topic);
    }
}
