<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use App\Models\BusinessOwner;
use App\Models\Guide;

class AppUser extends Authenticatable
{
    use HasApiTokens, HasFactory;
    
    /**
     * The event map for the model.
     *
     * @var array
     */
    protected $dispatchesEvents = [
        'updated' => \App\Events\AppUserUpdated::class,
        'deleted' => \App\Events\AppUserDeleted::class,
    ];

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'app_users';

    /**
     * The primary key for the model.
     *
     * @var string
     */
    protected $primaryKey = 'user_id';

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'password_hash',
        'first_name',
        'last_name',
        'phone',
        'profile_picture',
        'role',
        'last_login',
        'is_verified',
        'verification_code',
        'reset_token',
        'reset_token_expires',
    ];

    /**
     * The accessors to append to the model's array form.
     *
     * @var array
     */
    protected $appends = ['profile_picture_url', 'full_name'];

    /**
     * Get the URL for the user's profile picture.
     *
     * @return string
     */
    public function getProfilePictureUrlAttribute()
    {
        if (empty($this->profile_picture)) {
            // Return a default avatar based on the user's name
            $name = urlencode(trim($this->first_name . ' ' . $this->last_name));
            return 'https://ui-avatars.com/api/?name=' . $name . '&color=7F9CF5&background=EBF4FF';
        }

        // Check if it's already a full URL
        if (str_starts_with($this->profile_picture, 'http')) {
            return $this->profile_picture;
        }

        // Remove any leading slashes to prevent double slashes in the URL
        $path = ltrim($this->profile_picture, '/');
        
        // Check if the file exists in storage
        if (Storage::disk('public')->exists($path)) {
            return asset('storage/' . $path);
        }

        // If the file doesn't exist, return the default avatar
        $name = urlencode(trim($this->first_name . ' ' . $this->last_name));
        return 'https://ui-avatars.com/api/?name=' . $name . '&color=7F9CF5&background=EBF4FF';
    }
    
    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password_hash',
        'password',
        'remember_token',
        'verification_code',
        'reset_token',
    ];

    /**
     * Automatically hash the password when setting it.
     *
     * @param string $value
     * @return void
     */
    public function setPasswordAttribute($value)
    {
        if ($value) {
            $this->attributes['password_hash'] = Hash::make($value);
        }
    }

    /**
     * Get the password for the user.
     *
     * @return string
     */
    public function getAuthPassword()
    {
        return $this->password_hash;
    }

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'created_at' => 'datetime',
        'last_login' => 'datetime',
        'reset_token_expires' => 'datetime',
        'is_verified' => 'boolean',
    ];
    
    /**
     * Indicates if the model should be timestamped.
     *
     * @var bool
     */
    public $timestamps = true;
    
    /**
     * The storage format of the model's date columns.
     *
     * @var string
     */
    protected $dateFormat = 'Y-m-d H:i:s';
    
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
     * Get the standard user associated with this app user.
     */
    public function user()
    {
        return $this->belongsTo(User::class, 'email', 'email');
    }
    
    /**
     * Handle profile_picture value coming from Filament
     * This ensures it's always stored properly whether it's a string or array
     */
    public function setProfilePictureAttribute($value)
    {
        // Handle the Filament upload format (array) and convert to string
        if (is_array($value)) {
            $this->attributes['profile_picture'] = $value[0] ?? null;
        } else {
            $this->attributes['profile_picture'] = $value;
        }
    }
}
