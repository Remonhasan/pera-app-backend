<?php

namespace App\Repositories;

use App\Models\Note;
use App\Repositories\Contracts\NoteRepositoryInterface;
use Illuminate\Support\Collection;

class EloquentNoteRepository implements NoteRepositoryInterface
{
    public function allWithRelations(): Collection
    {
        return Note::query()
            ->with([
                'user:id,name,phone',
                'subject:id,name',
                'topic:id,topic,subject_id',
                'creator:id,name',
                'updater:id,name',
            ])
            ->orderByDesc('id')
            ->get();
    }

    public function findWithRelations(Note $note): Note
    {
        return $note->load([
            'user:id,name,phone',
            'subject:id,name',
            'topic:id,topic,subject_id',
            'creator:id,name',
            'updater:id,name',
        ]);
    }

    public function create(array $attributes): Note
    {
        return Note::create($attributes);
    }

    public function update(Note $note, array $attributes): bool
    {
        return $note->update($attributes);
    }

    public function delete(Note $note): bool
    {
        return (bool) $note->delete();
    }
}
