<?php

namespace App\Repositories\Contracts;

use App\Models\Note;
use Illuminate\Support\Collection;

interface NoteRepositoryInterface
{
    public function allWithRelations(): Collection;

    public function findWithRelations(Note $note): Note;

    public function create(array $attributes): Note;

    public function update(Note $note, array $attributes): bool;

    public function delete(Note $note): bool;
}
