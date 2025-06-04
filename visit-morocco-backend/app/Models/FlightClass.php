<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class FlightClass extends Model
{
    use HasFactory;

    protected $fillable = [
        'flight_id',
        'name',
        'price_multiplier',
        'available_seats'
    ];

    public function flight()
    {
        return $this->belongsTo(Flight::class);
    }

    public function facilities()
    {
        return $this->belongsToMany(Facility::class, 'flight_class_facilities');
    }

    public function seats()
    {
        return $this->hasMany(FlightSeat::class);
    }
}
