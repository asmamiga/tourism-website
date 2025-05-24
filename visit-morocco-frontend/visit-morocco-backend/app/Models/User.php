<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Filament\Models\Contracts\FilamentUser;
use Filament\Panel;

class User extends Authenticatable implements FilamentUser
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'email_verified_at',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'created_at' => 'datetime',
            'updated_at' => 'datetime',
        ];
    }

    /**
     * Check if the user can access the Filament admin panel.
     *
     * @param \Filament\Panel $panel
     * @return bool
     */
    public function canAccessPanel(Panel $panel): bool
    {
        return true; // Allow any authenticated user to access the panel for now
    }

    /**
     * Get the business owner profile associated with the user.
     */
    public function businessOwner()
    {
        return $this->hasOne(BusinessOwner::class, 'user_id', 'user_id');
    }

    /**
     * Get the guide profile associated with the user.
     */
    public function guide()
    {
        return $this->hasOne(Guide::class, 'user_id', 'user_id');
    }

    /**
     * Get the business bookings made by this user.
     */
    public function businessBookings()
    {
        return $this->hasMany(BusinessBooking::class, 'user_id', 'user_id');
    }

    /**
     * Get the guide bookings made by this user.
     */
    public function guideBookings()
    {
        return $this->hasMany(GuideBooking::class, 'user_id', 'user_id');
    }

    /**
     * Get the business reviews written by this user.
     */
    public function businessReviews()
    {
        return $this->hasMany(BusinessReview::class, 'user_id', 'user_id');
    }

    /**
     * Get the guide reviews written by this user.
     */
    public function guideReviews()
    {
        return $this->hasMany(GuideReview::class, 'user_id', 'user_id');
    }

    /**
     * Get the itineraries created by this user.
     */
    public function itineraries()
    {
        return $this->hasMany(Itinerary::class, 'user_id', 'user_id');
    }

    /**
     * Get the blog posts authored by this user.
     */
    public function blogPosts()
    {
        return $this->hasMany(BlogPost::class, 'author_id', 'user_id');
    }

    /**
     * Get the user's full name.
     */
    public function getFullNameAttribute()
    {
        return "{$this->first_name} {$this->last_name}";
    }

    /**
     * Check if user is an admin.
     */
    public function isAdmin()
    {
        return $this->role === 'admin';
    }

    /**
     * Check if user is a business owner.
     */
    public function isBusinessOwner()
    {
        return $this->role === 'business_owner';
    }

    /**
     * Check if user is a guide.
     */
    public function isGuide()
    {
        return $this->role === 'guide';
    }

    /**
     * Check if user is a tourist.
     */
    public function isTourist()
    {
        return $this->role === 'tourist';
    }
}
