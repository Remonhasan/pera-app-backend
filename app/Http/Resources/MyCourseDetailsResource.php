<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class MyCourseDetailsResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */


    public function toArray(Request $request): array
    {
        return [
            'id'                                        => $this->resource['id'] ?? null,
            'name'                                      => $this->resource['name'] ?? null,
            'is_memorization'                           => $this->resource['is_memorization'],
            'school_course_id'                          => $this->resource['school_course_id'] ?? null,
            'batch_id'                                  => $this->resource['batch_id'] ?? null,
            'description'                               => $this->resource['description'] ?? null,
            'what_will_you_learn'                       => $this->resource['what_will_you_learn'] ?? null,
            'certification'                             => $this->resource['certification'] ?? null,
            'syllabus'                                  => $this->resource['syllabus'] ?? null,
            'what_you_get'                              => $this->resource['what_you_get'] ?? null,
            'price'                                     => $this->resource['price'] ?? 0,
            'duration'                                  => $this->resource['duration'] ?? null,
            'image'                                     => $this->resource['image'] ?? null,
            'status'                                    => $this->resource['status'] ?? 0,
            'lessons'                                   => $this->resource['lessons'] ?? [],
            'total_lesson_or_sublesson_count'           => $this->resource['total_lesson_or_sublesson_count'] ?? 0,
            'total_lesson_or_sublesson_completed_count' => $this->resource['total_lesson_or_sublesson_completed_count'] ?? 0,
            'is_course_complete'                        => $this->resource['is_course_complete'] ?? false,
            'average_rating'                            => $this->resource['average_rating'] ?? 0,
            'total_reviews'                              => $this->resource['total_reviews'] ?? 0,
            'instructors'                               => $this->resource['instructors'] ?? [],
            'last_updated'                              => $this->resource['last_updated'] ?? null,
            'tag'                                       => $this->resource['tag'] ?? null,
            'available_seat'                            => $this->resource['available_seat'] ?? 0,
            'total_students'                            => $this->resource['total_students'] ?? 0,
            'students'                                  => $this->resource['students'] ?? [],
            'total_seat'                                => $this->resource['total_seat'] ?? 0,
            'average_quiz_percent'                      => $this->resource['average_quiz_percent'] ?? null,
            'my_grade'                                  => $this->resource['my_grade'] ?? null,
            'my_badge'                                  => $this->resource['my_badge'] ?? null,
            'notification_message'                      => $this->resource['notification_message'] ?? null,
            'certificate_link'                  => $this->resource['certificate_link'] ?? null,
            'certificate_download'              => $this->resource['certificate_download'] ?? null,
            'is_reviewed'                       => $this->resource['is_reviewed'] ?? false,
            'my_rating'                         => $this->resource['my_rating'] ?? null,
            'is_individual_lesson_completed'    => $this->resource['is_individual_lesson_completed'] ?? false,
        ];
    }
}
