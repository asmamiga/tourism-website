<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Flight extends Model
{
    use HasFactory;

    protected $fillable = [
        'flight_number',
        'airline_id',
        'origin_id',
        'destination_id',
        'departure_time',
        'arrival_time',
        'status',
        'price'
    ];

    protected $casts = [
        'departure_time' => 'datetime',
        'arrival_time' => 'datetime',
    ];

    public function airline()
    {
        return $this->belongsTo(Airline::class);
    }

    public function origin()
    {
        return $this->belongsTo(Airport::class, 'origin_id');
    }

    public function destination()
    {
        return $this->belongsTo(Airport::class, 'destination_id');
    }

    public function flightSegments()
    {
        return $this->hasMany(FlightSegment::class);
    }

    public function flightClasses()
    {
        return $this->hasMany(FlightClass::class);
    }

    public function flightSeats()
    {
        return $this->hasManyThrough(FlightSeat::class, FlightClass::class);
    }

    public function transactions()
    {
        return $this->hasMany(Transaction::class);
    }
}
