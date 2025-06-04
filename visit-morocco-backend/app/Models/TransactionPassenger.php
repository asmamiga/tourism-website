<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class TransactionPassenger extends Model
{
    use HasFactory, SoftDeletes;

    // Passenger types
    const TYPE_ADULT = 'adult';
    const TYPE_CHILD = 'child';
    const TYPE_INFANT = 'infant';

    // Document types
    const DOCUMENT_PASSPORT = 'passport';
    const DOCUMENT_ID_CARD = 'id_card';
    const DOCUMENT_DRIVING_LICENSE = 'driving_license';
    const DOCUMENT_BIRTH_CERTIFICATE = 'birth_certificate';

    protected $fillable = [
        'transaction_id',
        'flight_seat_id',
        'first_name',
        'last_name',
        'email',
        'phone',
        'date_of_birth',
        'gender',
        'nationality',
        'passenger_type',
        'document_type',
        'document_number',
        'document_expiry_date',
        'document_issuing_country',
        'frequent_flyer_number',
        'special_requests',
        'seat_preference',
        'meal_preference',
        'is_primary_passenger',
        'price',
        'taxes',
        'fees',
        'total_price',
        'status',
        'checked_in',
        'checked_in_at',
        'boarded',
        'boarded_at',
        'baggage_allowance',
        'extra_baggage_purchased',
        'ancillary_services',
        'notes'
    ];

    protected $casts = [
        'date_of_birth' => 'date',
        'document_expiry_date' => 'date',
        'is_primary_passenger' => 'boolean',
        'checked_in' => 'boolean',
        'boarded' => 'boolean',
        'checked_in_at' => 'datetime',
        'boarded_at' => 'datetime',
        'price' => 'decimal:2',
        'taxes' => 'decimal:2',
        'fees' => 'decimal:2',
        'total_price' => 'decimal:2',
        'extra_baggage_purchased' => 'integer',
        'ancillary_services' => 'array',
    ];

    public function transaction()
    {
        return $this->belongsTo(Transaction::class);
    }

    public function flightSeat()
    {
        return $this->belongsTo(FlightSeat::class);
    }

    public function getFullNameAttribute()
    {
        return "{$this->first_name} {$this->last_name}";
    }

    public function getAgeAttribute()
    {
        return $this->date_of_birth ? $this->date_of_birth->age : null;
    }

    public function isInfant()
    {
        return $this->passenger_type === self::TYPE_INFANT;
    }

    public function isChild()
    {
        return $this->passenger_type === self::TYPE_CHILD;
    }

    public function isAdult()
    {
        return $this->passenger_type === self::TYPE_ADULT;
    }

    public function assignSeat(FlightSeat $seat)
    {
        if (!$seat->is_available) {
            throw new \Exception('Seat is not available');
        }

        // If passenger already has a seat, release it first
        if ($this->flightSeat) {
            $this->releaseSeat();
        }

        $this->flightSeat()->associate($seat);
        $seat->update(['is_available' => false]);
        $this->save();
    }

    public function releaseSeat()
    {
        if ($this->flightSeat) {
            $this->flightSeat->update(['is_available' => true]);
            $this->flightSeat()->dissociate();
            $this->save();
        }
    }

    public function checkIn()
    {
        $this->update([
            'checked_in' => true,
            'checked_in_at' => now(),
            'status' => 'checked_in'
        ]);
    }

    public function board()
    {
        $this->update([
            'boarded' => true,
            'boarded_at' => now(),
            'status' => 'boarded'
        ]);
    }

    public function scopeAdults($query)
    {
        return $query->where('passenger_type', self::TYPE_ADULT);
    }

    public function scopeChildren($query)
    {
        return $query->where('passenger_type', self::TYPE_CHILD);
    }

    public function scopeInfants($query)
    {
        return $query->where('passenger_type', self::TYPE_INFANT);
    }

    public function scopeCheckedIn($query)
    {
        return $query->where('checked_in', true);
    }

    public function scopeBoarded($query)
    {
        return $query->where('boarded', true);
    }
}
