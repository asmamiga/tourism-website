<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use App\Models\AppUser;

class BusinessOwner extends Model
{
    use HasFactory;

    /**
     * The primary key for the model.
     *
     * @var string
     */
    protected $primaryKey = 'business_owner_id';

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'user_id',
        'business_name',
        'business_description',
        'business_license',
        'is_approved',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array
     */
    protected $casts = [
        'is_approved' => 'boolean',
    ];

    /**
     * Indicates if the model should be timestamped.
     *
     * @var bool
     */
    public $timestamps = false;

    /**
     * Get the user that owns the business owner profile.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(AppUser::class, 'user_id', 'user_id');
    }

    /**
     * Get the businesses owned by this business owner.
     */
    public function businesses(): HasMany
    {
        return $this->hasMany(Business::class, 'business_owner_id', 'business_owner_id');
    }
    
    /**
     * Get the display name for the business owner.
     * 
     * @return string
     */
    public function getNameAttribute()
    {
        // Get the app user associated with this business owner
        $appUser = AppUser::where('user_id', $this->user_id)->first();
        
        if ($appUser) {
            return $appUser->first_name . ' ' . $appUser->last_name . ' (' . $appUser->email . ')';
        }
        
        return "Owner #{$this->business_owner_id}";
    }
}
