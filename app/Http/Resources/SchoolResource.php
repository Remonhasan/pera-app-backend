<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SchoolResource extends JsonResource
{

    public function toArray(Request $request): array
    {

        $certifications = [];
        $certificationsData = $this->certifications ?? null;

        if ($certificationsData) {
            if (is_string($certificationsData)) {
                $decoded = json_decode($certificationsData, true);
                if (json_last_error() === JSON_ERROR_NONE && is_array($decoded)) {
                    $certificationsData = $decoded;
                }
            }
            if (is_array($certificationsData)) {
                $certifications = array_map(function ($cert) {
                    return $cert ? asset('storage/' . $cert) : null;
                }, $certificationsData);
            }
        }

        return [
            'id'             => $this->id,
            'name'           => $this->name ?? null,
            'description'    => $this->description ?? null,
            'address'        => $this->address ?? null,
            'logo'           => $this->logo ? asset('storage/' . $this->logo) : null,
            'certifications' => $certifications ?? null
        ];
    }
}
