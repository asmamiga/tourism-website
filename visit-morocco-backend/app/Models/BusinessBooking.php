<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class BusinessBooking extends Model
{
    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'business_bookings';

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
        'business_id',
        'user_id',
        'booking_date',
        'booking_time',
        'duration',
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
        'booking_date' => 'date',
        'booking_time' => 'datetime',
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
     * Get the business that owns the booking.
     */
    public function business(): BelongsTo
    {
        return $this->belongsTo(Business::class, 'business_id', 'business_id');
    }

    /**
     * Get the user that made the booking.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(AppUser::class, 'user_id', 'user_id');
    }
}
