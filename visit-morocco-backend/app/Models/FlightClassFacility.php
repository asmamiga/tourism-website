<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class FlightClassFacility extends Model
{
    use HasFactory;

    protected $fillable = [
        'flight_class_id',
        'facility_id',
        'is_included',
        'additional_charge',
        'notes'
    ];

    protected $casts = [
        'is_included' => 'boolean',
        'additional_charge' => 'decimal:2'
    ];

    public function flightClass()
    {
        return $this->belongsTo(FlightClass::class);
    }

    public function facility()
    {
        return $this->belongsTo(Facility::class);
    }
}
