<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Task extends Model
{
    public const STATUS_PENDING = 'pending';

    public const STATUS_DOING = 'doing';

    public const STATUS_COMPLETED = 'completed';

    /** @var list<string> */
    public const TASK_STATUSES = [
        self::STATUS_PENDING,
        self::STATUS_DOING,
        self::STATUS_COMPLETED,
    ];

    protected $fillable = [
        'user_id',
        'name',
        'description',
        'status',
        'task_status',
        'created_by',
        'updated_by',
    ];

    protected function casts(): array
    {
        return [
            'status' => 'boolean',
        ];
    }

    /** @return BelongsTo<User, $this> */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
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
