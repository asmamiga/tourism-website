<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AttractionPhoto extends Model
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
        'attraction_id',
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
     * The "booted" method of the model.
     *
     * @return void
     */
    protected static function booted()
    {
        static::saving(function ($photo) {
            if ($photo->is_primary) {
                // If this photo is being set as primary, unset any existing primary for this attraction
                static::where('attraction_id', $photo->attraction_id)
                    ->where('photo_id', '!=', $photo->getKey())
                    ->update(['is_primary' => false]);
            } elseif ($photo->getOriginal('is_primary') && !$photo->isDirty('attraction_id')) {
                // If this was the primary photo and is being unset, set another photo as primary
                $newPrimary = static::where('attraction_id', $photo->attraction_id)
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
                $newPrimary = static::where('attraction_id', $photo->attraction_id)
                    ->where('photo_id', '!=', $photo->getKey())
                    ->first();
                
                if ($newPrimary) {
                    $newPrimary->update(['is_primary' => true]);
                }
            }
        });
    }

    /**
     * Get the attraction that owns the photo.
     */
    public function attraction(): BelongsTo
    {
        return $this->belongsTo(Attraction::class, 'attraction_id', 'attraction_id');
    }

    /**
     * Get the full URL for the photo.
     *
     * @return string|null
     */
    public function getPhotoUrlAttribute($value): ?string
    {
        if (!$value) {
            return null;
        }

        // Check if the URL is already a full URL
        if (str_starts_with($value, 'http')) {
            return $value;
        }

        // Remove any leading slashes to prevent double slashes in the URL
        $path = ltrim($value, '/\\');
        
        // Check if the file exists in storage
        if (file_exists(storage_path('app/public/' . $path))) {
            return asset('storage/' . $path);
        }

        return $value;
    }
}
