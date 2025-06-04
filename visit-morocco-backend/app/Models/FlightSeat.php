<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class FlightSeat extends Model
{
    use HasFactory;

    protected $fillable = [
        'flight_class_id',
        'seat_number',
        'is_available'
    ];

    protected $casts = [
        'is_available' => 'boolean'
    ];

    public function flightClass()
    {
        return $this->belongsTo(FlightClass::class);
    }

    public function flight()
    {
        return $this->hasOneThrough(
            Flight::class,
            FlightClass::class,
            'id',
            'id',
            'flight_class_id',
            'flight_id'
        );
    }
}
