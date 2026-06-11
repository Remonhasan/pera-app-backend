<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Exam extends Model
{
    public const STATUS_PENDING = 'pending';

    public const STATUS_COMPLETED = 'completed';

    public const STATUS_PASSED = 'passed';

    /** @var list<string> */
    public const EXAM_STATUSES = [
        self::STATUS_PENDING,
        self::STATUS_COMPLETED,
        self::STATUS_PASSED,
    ];

    protected $fillable = [
        'job_type_id',
        'name',
        'exam_date',
        'expected_exam_date',
        'application_file',
        'admit_card_file',
        'images',
        'status',
        'exam_status',
        'created_by',
        'updated_by',
    ];

    protected function casts(): array
    {
        return [
            'exam_date' => 'date',
            'expected_exam_date' => 'date',
            'images' => 'array',
            'status' => 'boolean',
        ];
    }

    /** @return BelongsTo<JobType, $this> */
    public function jobType(): BelongsTo
    {
        return $this->belongsTo(JobType::class);
    }

    /** @return BelongsTo<User, $this> */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /** @return BelongsTo<User, $this> */
    public function updater(): BelongsTo
    {
        return $this->belongsTo(User::class, 'updated_by');
    }
}
