<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class GuideService extends Model
{
    use HasFactory;

    /**
     * The primary key for the model.
     *
     * @var string
     */
    protected $primaryKey = 'service_id';

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'guide_id',
        'title',
        'description',
        'duration',
        'price',
        'city_id',
        'max_group_size',
        'includes',
        'excludes',
        'meeting_point',
        'languages',
        'is_private',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array
     */
    protected $casts = [
        'duration' => 'integer',
        'price' => 'decimal:2',
        'max_group_size' => 'integer',
        'includes' => 'json',
        'excludes' => 'json',
        'languages' => 'json',
        'is_private' => 'boolean',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Get the guide that owns the service.
     */
    public function guide(): BelongsTo
    {
        return $this->belongsTo(Guide::class, 'guide_id', 'guide_id');
    }

    /**
     * Get the city where the service is offered.
     */
    public function city(): BelongsTo
    {
        return $this->belongsTo(City::class, 'city_id', 'city_id');
    }

    /**
     * Get the photos for the guide service.
     */
    public function photos(): HasMany
    {
        return $this->hasMany(GuideServicePhoto::class, 'service_id', 'service_id');
    }

    /**
     * Get the bookings for the guide service.
     */
    public function bookings(): HasMany
    {
        return $this->hasMany(GuideBooking::class, 'service_id', 'service_id');
    }
}
