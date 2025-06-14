<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Business extends Model
{
    use HasFactory;

    /**
     * The primary key for the model.
     *
     * @var string
     */
    protected $primaryKey = 'business_id';

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'business_owner_id',
        'category_id',
        'name',
        'description',
        'address',
        'city_id',
        'phone',
        'email',
        'website',
        'price_range',
        'latitude',
        'longitude',
        'opening_hours',
        'features',
        'is_verified',
        'is_featured',
        'avg_rating',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array
     */
    protected $casts = [
        'opening_hours' => 'json',
        'features' => 'json',
        'latitude' => 'decimal:8',
        'longitude' => 'decimal:8',
        'avg_rating' => 'decimal:2',
        'is_verified' => 'boolean',
        'is_featured' => 'boolean',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Get the business owner that owns the business.
     */
    public function businessOwner(): BelongsTo
    {
        return $this->belongsTo(BusinessOwner::class, 'business_owner_id', 'business_owner_id');
    }

    /**
     * Get the business category of the business.
     */
    public function businessCategory(): BelongsTo
    {
        return $this->belongsTo(BusinessCategory::class, 'category_id', 'category_id');
    }

    /**
     * Get the city where the business is located.
     */
    public function city(): BelongsTo
    {
        return $this->belongsTo(City::class, 'city_id', 'city_id');
    }

    /**
     * Get all photos for the business.
     */
    public function photos(): HasMany
    {
        return $this->hasMany(BusinessPhoto::class, 'business_id', 'business_id');
    }
    
    /**
     * Get only primary photos for the business.
     */
    public function primaryPhotos(): HasMany
    {
        return $this->hasMany(BusinessPhoto::class, 'business_id', 'business_id')
            ->where('is_primary', true);
    }

    /**
     * Get the reviews for the business.
     */
    public function reviews(): HasMany
    {
        return $this->hasMany(BusinessReview::class, 'business_id', 'business_id');
    }

    /**
     * Get the bookings for the business.
     */
    public function bookings(): HasMany
    {
        return $this->hasMany(BusinessBooking::class, 'business_id', 'business_id');
    }
}
