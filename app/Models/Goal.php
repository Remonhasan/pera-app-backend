<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Goal extends Model
{
    public const STATUS_PENDING = 'pending';

    public const STATUS_DOING = 'doing';

    public const STATUS_ACHIEVED = 'achieved';

    /** @var list<string> */
    public const GOAL_STATUSES = [
        self::STATUS_PENDING,
        self::STATUS_DOING,
        self::STATUS_ACHIEVED,
    ];

    protected $fillable = [
        'user_id',
        'bank_id',
        'saving_type_id',
        'start_date',
        'end_date',
        'amount',
        'description',
        'drive_link',
        'status',
        'goal_status',
        'created_by',
        'updated_by',
    ];

    protected function casts(): array
    {
        return [
            'start_date' => 'date',
            'end_date' => 'date',
            'amount' => 'decimal:2',
            'status' => 'boolean',
        ];
    }

    /** @return BelongsTo<User, $this> */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /** @return BelongsTo<Bank, $this> */
    public function bank(): BelongsTo
    {
        return $this->belongsTo(Bank::class);
    }

    /** @return BelongsTo<SavingType, $this> */
    public function savingType(): BelongsTo
    {
        return $this->belongsTo(SavingType::class);
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
