<?php

namespace App\Filament\Admin\Resources\BusinessResource\Hooks;

use App\Models\BusinessOwner;
use Filament\Forms\Form;

class CreateBusinessOwnerHook
{
    public static function handle(Form $form, array $data): array
    {
        // Check if we need to create a new business owner
        if (isset($data['business_owner_id']) && $data['business_owner_id'] < 0) {
            // Get the user ID (the negative value is the user_id)
            $userId = abs($data['business_owner_id']);
            
            // Create a new business owner record
            $businessOwner = new BusinessOwner();
            $businessOwner->user_id = $userId;
            $businessOwner->is_approved = true; // Set default values as needed
            $businessOwner->save();
            
            // Update the business_owner_id to use the new ID
            $data['business_owner_id'] = $businessOwner->business_owner_id;
        }
        
        return $data;
    }
}
