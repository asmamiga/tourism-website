<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Carbon;

class PromoCode extends Model
{
    use HasFactory;

    protected $fillable = [
        'code',
        'description',
        'discount_type',
        'discount_value',
        'min_amount',
        'max_discount',
        'start_date',
        'end_date',
        'max_uses',
        'current_uses',
        'is_active',
        'min_passengers',
        'valid_days'
    ];

    protected $casts = [
        'start_date' => 'datetime',
        'end_date' => 'datetime',
        'is_active' => 'boolean',
        'valid_days' => 'array',
        'min_amount' => 'float',
        'max_discount' => 'float',
        'discount_value' => 'float',
        'max_uses' => 'integer',
        'current_uses' => 'integer',
        'min_passengers' => 'integer',
    ];

    public function transactions()
    {
        return $this->hasMany(Transaction::class);
    }

    public function isValid()
    {
        if (!$this->is_active) {
            return false;
        }

        $now = now();
        if ($this->start_date && $this->start_date->gt($now)) {
            return false;
        }

        if ($this->end_date && $this->end_date->lt($now)) {
            return false;
        }

        if ($this->max_uses > 0 && $this->current_uses >= $this->max_uses) {
            return false;
        }

        if (!empty($this->valid_days) && is_array($this->valid_days)) {
            $currentDay = strtolower(Carbon::now()->format('l'));
            if (!in_array($currentDay, $this->valid_days)) {
                return false;
            }
        }

        return true;
    }

    public function calculateDiscount($amount, $passengerCount = 1)
    {
        if (!$this->isValid()) {
            return 0;
        }

        if ($this->min_amount && $amount < $this->min_amount) {
            return 0;
        }

        if ($this->min_passengers && $passengerCount < $this->min_passengers) {
            return 0;
        }

        $discount = 0;
        
        if ($this->discount_type === 'percentage') {
            $discount = ($this->discount_value / 100) * $amount;
        } else { // fixed
            $discount = $this->discount_value;
        }

        // Apply maximum discount if set
        if ($this->max_discount && $discount > $this->max_discount) {
            $discount = $this->max_discount;
        }

        // Don't discount more than the total amount
        if ($discount > $amount) {
            $discount = $amount;
        }

        return $discount;
    }

    public function incrementUses()
    {
        $this->increment('current_uses');
    }
}
