<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Carbon\Carbon;

class TeacherResource extends JsonResource
{

    public function toArray(Request $request): array
    {
        return [
            'id'              => $this->id,
            'gender'          => $this->gender ?? null,
            'past_experience' => $this->past_experience ?? null,
            'address'         => $this->address ?? null,
            'education'       => $this->education ?? null,
            'date_of_birth'   => Carbon::parse($this->date_of_birth)->format('d F Y') ?? null,
            'name'            => $this->name ?? null,
            'email'           => $this->email ?? null,
            'phone'           => $this->phone ?? null,
            'image'           => $this->image ? asset('storage/' . $this->image) : null,
        ];
    }
}
