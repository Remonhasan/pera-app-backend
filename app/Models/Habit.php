<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Habit extends Model
{
    public const STATUS_PENDING = 'pending';

    public const STATUS_ADAPTED = 'adapted';

    public const STATUS_IMPROVED = 'improved';

    /** @var list<string> */
    public const HABIT_STATUSES = [
        self::STATUS_PENDING,
        self::STATUS_ADAPTED,
        self::STATUS_IMPROVED,
    ];

    protected $fillable = [
        'user_ids',
        'name',
        'description',
        'status',
        'habit_status',
        'created_by',
        'updated_by',
    ];

    protected function casts(): array
    {
        return [
            'user_ids' => 'array',
            'status' => 'boolean',
        ];
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
