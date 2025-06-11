<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use App\Models\Business;

class BusinessPhoto extends Model
{
    use HasFactory;

    /**
     * The primary key for the model.
     *
     * @var string
     */
    protected $primaryKey = 'photo_id';

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'business_id',
        'photo_url',
        'caption',
        'is_primary',
        'upload_date',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array
     */
    protected $casts = [
        'is_primary' => 'boolean',
        'upload_date' => 'datetime',
    ];

    /**
     * Indicates if the model should be timestamped.
     *
     * @var bool
     */
    public $timestamps = false;

    /**
     * Get the business that owns the photo.
     */
    public function business(): BelongsTo
    {
        return $this->belongsTo(Business::class, 'business_id', 'business_id');
    }
    
    /**
     * The "booted" method of the model.
     *
     * @return void
     */
    protected static function booted()
    {
        static::saving(function ($photo) {
            if ($photo->is_primary) {
                // If this photo is being set as primary, unset any existing primary for this business
                static::where('business_id', $photo->business_id)
                    ->where('photo_id', '!=', $photo->getKey())
                    ->update(['is_primary' => false]);
            } elseif ($photo->getOriginal('is_primary') && !$photo->isDirty('business_id')) {
                // If this was the primary photo and is being unset, set another photo as primary
                $newPrimary = static::where('business_id', $photo->business_id)
                    ->where('photo_id', '!=', $photo->getKey())
                    ->first();
                
                if ($newPrimary) {
                    $newPrimary->update(['is_primary' => true]);
                }
            }
        });

        // When a photo is deleted, if it was primary, set another photo as primary
        static::deleting(function ($photo) {
            if ($photo->is_primary) {
                $newPrimary = static::where('business_id', $photo->business_id)
                    ->where('photo_id', '!=', $photo->getKey())
                    ->first();
                
                if ($newPrimary) {
                    $newPrimary->update(['is_primary' => true]);
                }
            }
        });
    }
}
