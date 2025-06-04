<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Airport extends Model
{
    use HasFactory;

    protected $fillable = [
        'iata_code',
        'name',
        'image',
        'city',
        'country'
    ];

    public function flightSegments()
    {
        return $this->hasMany(FlightSegment::class);
    }
}
