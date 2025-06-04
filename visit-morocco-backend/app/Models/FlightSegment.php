<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class FlightSegment extends Model
{
    use HasFactory;

    protected $fillable = [
        'flight_id',
        'origin_airport_id',
        'destination_airport_id',
        'departure_time',
        'arrival_time',
        'flight_number',
        'airline_id',
        'duration_minutes',
        'layover_minutes',
        'segment_order'
    ];

    protected $casts = [
        'departure_time' => 'datetime',
        'arrival_time' => 'datetime',
        'duration_minutes' => 'integer',
        'layover_minutes' => 'integer',
        'segment_order' => 'integer'
    ];

    public function flight()
    {
        return $this->belongsTo(Flight::class);
    }

    public function originAirport()
    {
        return $this->belongsTo(Airport::class, 'origin_airport_id');
    }

    public function destinationAirport()
    {
        return $this->belongsTo(Airport::class, 'destination_airport_id');
    }

    public function airline()
    {
        return $this->belongsTo(Airline::class);
    }
}
