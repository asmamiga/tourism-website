<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class GuideBooking extends Model
{
    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'guide_bookings';

    /**
     * The primary key for the model.
     *
     * @var string
     */
    protected $primaryKey = 'booking_id';

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'service_id',
        'guide_id',
        'user_id',
        'booking_date',
        'start_time',
        'num_people',
        'special_requests',
        'status',
        'payment_status',
        'total_amount',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array
     */
    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
        'start_time' => 'datetime',
        'end_time' => 'datetime',
        'duration' => 'integer',
        'num_people' => 'integer',
        'total_amount' => 'decimal:2',
    ];

    /**
     * Indicates if the model should be timestamped.
     *
     * @var bool
     */
    public $timestamps = false;

    /**
     * Get the guide that owns the booking.
     */
    public function guide(): BelongsTo
    {
        return $this->belongsTo(Guide::class, 'guide_id', 'guide_id');
    }

    /**
     * Get the user that made the booking.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(AppUser::class, 'user_id', 'user_id');
    }

    /**
     * Get the service associated with the booking.
     */
    public function service(): BelongsTo
    {
        return $this->belongsTo(GuideService::class, 'service_id', 'service_id');
    }
}
