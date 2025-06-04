<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Transaction extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'user_id',
        'transaction_code',
        'flight_id',
        'flight_class_id',
        'promo_code_id',
        'total_amount',
        'discount_amount',
        'final_amount',
        'payment_status',
        'payment_method',
        'payment_reference',
        'booking_reference',
        'booking_status',
        'cancellation_reason',
        'cancelled_by',
        'cancelled_at',
        'notes'
    ];

    protected $casts = [
        'total_amount' => 'decimal:2',
        'discount_amount' => 'decimal:2',
        'final_amount' => 'decimal:2',
        'cancelled_at' => 'datetime',
    ];

    // Status constants
    const STATUS_PENDING = 'pending';
    const STATUS_PAID = 'paid';
    const STATUS_FAILED = 'failed';
    const STATUS_REFUNDED = 'refunded';
    const STATUS_CANCELLED = 'cancelled';
    const STATUS_COMPLETED = 'completed';

    // Booking status constants
    const BOOKING_CONFIRMED = 'confirmed';
    const BOOKING_PENDING = 'pending';
    const BOOKING_CANCELLED = 'cancelled';
    const BOOKING_CHECKED_IN = 'checked_in';
    const BOOKING_BOARDED = 'boarded';
    const BOOKING_COMPLETED = 'completed';

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function flight()
    {
        return $this->belongsTo(Flight::class);
    }

    public function flightClass()
    {
        return $this->belongsTo(FlightClass::class);
    }

    public function promoCode()
    {
        return $this->belongsTo(PromoCode::class);
    }

    public function passengers()
    {
        return $this->hasMany(TransactionPassenger::class);
    }

    public function cancel($reason = null, $userId = null)
    {
        $this->update([
            'booking_status' => self::BOOKING_CANCELLED,
            'cancellation_reason' => $reason,
            'cancelled_by' => $userId,
            'cancelled_at' => now()
        ]);

        // Release any held seats
        $this->passengers->each->releaseSeat();
    }

    public function isCancellable()
    {
        return !in_array($this->booking_status, [
            self::BOOKING_CANCELLED,
            self::BOOKING_COMPLETED,
            self::BOOKING_BOARDED
        ]);
    }

    public function scopeActive($query)
    {
        return $query->where('booking_status', '!=', self::BOOKING_CANCELLED);
    }

    public function scopeCompleted($query)
    {
        return $query->where('booking_status', self::BOOKING_COMPLETED);
    }

    public function scopePending($query)
    {
        return $query->where('booking_status', self::BOOKING_PENDING);
    }

    public function scopeConfirmed($query)
    {
        return $query->where('booking_status', self::BOOKING_CONFIRMED);
    }

    public function scopeCancelled($query)
    {
        return $query->where('booking_status', self::BOOKING_CANCELLED);
    }

    public function scopeRecent($query, $days = 30)
    {
        return $query->where('created_at', '>=', now()->subDays($days));
    }
}
