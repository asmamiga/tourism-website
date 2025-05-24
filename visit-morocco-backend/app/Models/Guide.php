<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Guide extends Model
{
    use HasFactory;

    /**
     * The primary key for the model.
     *
     * @var string
     */
    protected $primaryKey = 'guide_id';

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'user_id',
        'bio',
        'experience_years',
        'languages',
        'specialties',
        'daily_rate',
        'is_available',
        'is_approved',
        'identity_verification',
        'guide_license',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array
     */
    protected $casts = [
        'languages' => 'json',
        'specialties' => 'json',
        'daily_rate' => 'decimal:2',
        'is_available' => 'boolean',
        'is_approved' => 'boolean',
        'experience_years' => 'integer',
    ];

    /**
     * Indicates if the model should be timestamped.
     *
     * @var bool
     */
    public $timestamps = false;

    /**
     * Get the user that owns the guide profile.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id', 'user_id');
    }

    /**
     * Get the services offered by the guide.
     */
    public function services(): HasMany
    {
        return $this->hasMany(GuideService::class, 'guide_id', 'guide_id');
    }

    /**
     * Get the availability records for the guide.
     */
    public function availability(): HasMany
    {
        return $this->hasMany(GuideAvailability::class, 'guide_id', 'guide_id');
    }

    /**
     * Get the bookings for the guide.
     */
    public function bookings(): HasMany
    {
        return $this->hasMany(GuideBooking::class, 'guide_id', 'guide_id');
    }

    /**
     * Get the reviews for the guide.
     */
    public function reviews(): HasMany
    {
        return $this->hasMany(GuideReview::class, 'guide_id', 'guide_id');
    }

    /**
     * Calculate the average rating for the guide.
     */
    public function getAverageRatingAttribute()
    {
        return $this->reviews()->avg('rating') ?? 0;
    }
}
