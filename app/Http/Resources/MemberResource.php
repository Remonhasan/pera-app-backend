<?php

namespace App\Http\Resources;

use App\Support\PublicStorageUrl;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class MemberResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'phone' => $this->phone,
            'email' => $this->email,
            'image' => PublicStorageUrl::fromPath($this->image),
            'status' => (bool) $this->status,
            'last_login_at' => $this->last_login_at?->toIso8601String(),
        ];
    }
}
