<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class City extends Model
{
    use HasFactory;

    /**
     * The primary key for the model.
     *
     * @var string
     */
    protected $primaryKey = 'city_id';

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'region_id',
        'name',
        'description',
        'latitude',
        'longitude',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array
     */
    protected $casts = [
        'latitude' => 'decimal:8',
        'longitude' => 'decimal:8',
    ];

    /**
     * Indicates if the model should be timestamped.
     *
     * @var bool
     */
    public $timestamps = false;

    /**
     * Get the region that owns the city.
     */
    public function region(): BelongsTo
    {
        return $this->belongsTo(Region::class, 'region_id', 'region_id');
    }

    /**
     * Get the businesses located in this city.
     */
    public function businesses(): HasMany
    {
        return $this->hasMany(Business::class, 'city_id', 'city_id');
    }

    /**
     * Get the guide services offered in this city.
     */
    public function guideServices(): HasMany
    {
        return $this->hasMany(GuideService::class, 'city_id', 'city_id');
    }

    /**
     * Get the attractions located in this city.
     */
    public function attractions(): HasMany
    {
        return $this->hasMany(Attraction::class, 'city_id', 'city_id');
    }
}
