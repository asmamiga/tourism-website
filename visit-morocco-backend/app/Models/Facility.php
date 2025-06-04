<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Facility extends Model
{
    use HasFactory;

    protected $fillable = [
        'image',
        'name',
        'description'
    ];

    public function flightClasses()
    {
        return $this->belongsToMany(FlightClass::class, 'flight_class_facilities');
    }
}
