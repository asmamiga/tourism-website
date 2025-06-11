<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Support\Facades\App;

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
        'languages' => 'array',
        'specialties' => 'array',
        'daily_rate' => 'decimal:2',
        'is_available' => 'boolean',
        'is_approved' => 'boolean',
        'experience_years' => 'integer',
    ];
    
    /**
     * The accessors to append to the model's array form.
     *
     * @var array
     */
    protected $appends = ['full_name'];
    
    /**
     * Get the user that owns the guide profile.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(AppUser::class, 'user_id', 'user_id');
    }
    
    /**
     * Get the guide's full name.
     *
     * @return string
     */
    public function getFullNameAttribute()
    {
        return $this->user ? trim($this->user->first_name . ' ' . $this->user->last_name) : '';
    }
    
    /**
     * Get the guide's image URL.
     *
     * @return string|null
     */
    public function getImageUrlAttribute()
    {
        return $this->user && $this->user->profile_photo_path 
            ? asset('storage/' . $this->user->profile_photo_path)
            : null;
    }

    /**
     * Indicates if the model should be timestamped.
     *
     * @var bool
     */
    public $timestamps = false;
    
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
     * Get the cities where the guide offers services.
     */
    public function cities(): BelongsToMany
    {
        return $this->belongsToMany(
            City::class,
            'guide_services', // Pivot table
            'guide_id',       // Foreign key on the guide_services table
            'city_id',        // Foreign key on the guide_services table
            'guide_id',       // Local key on guides table
            'city_id'         // Related key on cities table
        )->distinct()->withTimestamps();
    }

    /**
     * Calculate the average rating for the guide.
     */
    public function getAverageRatingAttribute(): float
    {
        return $this->reviews()->avg('rating') ?: 0;
    }
}
