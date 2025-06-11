<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;

class AppUser extends Authenticatable
{
    use HasFactory;
    
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
