<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StudyGoal extends Model
{
    public const STATUS_PENDING = 'pending';

    public const STATUS_DOING = 'doing';

    public const STATUS_COMPLETED = 'completed';

    /** @var list<string> */
    public const STUDY_GOAL_STATUSES = [
        self::STATUS_PENDING,
        self::STATUS_DOING,
        self::STATUS_COMPLETED,
    ];

    protected $fillable = [
        'user_id',
        'subject_id',
        'topic_id',
        'job_id',
        'date_from',
        'date_to',
        'extended_date',
        'status',
        'study_goal_status',
        'created_by',
        'updated_by',
    ];

    protected function casts(): array
    {
        return [
            'date_from' => 'date:Y-m-d',
            'date_to' => 'date:Y-m-d',
            'extended_date' => 'date:Y-m-d',
            'status' => 'boolean',
        ];
    }

    /** @return BelongsTo<User, $this> */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /** @return BelongsTo<Subject, $this> */
    public function subject(): BelongsTo
    {
        return $this->belongsTo(Subject::class);
    }

    /** @return BelongsTo<Topic, $this> */
    public function topic(): BelongsTo
    {
        return $this->belongsTo(Topic::class);
    }

    /** @return BelongsTo<JobType, $this> */
    public function jobType(): BelongsTo
    {
        return $this->belongsTo(JobType::class, 'job_id');
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
