<?php

namespace App\Listeners;

use App\Events\AppUserDeleted;
use App\Models\BusinessOwner;
use App\Models\Business;
use Illuminate\Support\Facades\Log;

class HandleAppUserDeleted
{
    /**
     * Handle the event.
     *
     * @param  \App\Events\AppUserDeleted  $event
     * @return void
     */
    public function handle(AppUserDeleted $event)
    {
        // Check if the deleted user was a business owner
        if ($event->appUser->role === 'business_owner') {
            Log::info('Business owner deleted: User ID: ' . $event->appUser->user_id);
            
            // Find the business owner record
            $businessOwner = BusinessOwner::where('user_id', $event->appUser->user_id)->first();
            
            if ($businessOwner) {
                // Delete all businesses associated with this business owner
                $businesses = Business::where('business_owner_id', $businessOwner->business_owner_id)->get();
                
                foreach ($businesses as $business) {
                    Log::info('Deleting business ID: ' . $business->business_id . ' due to owner deletion');
                    $business->delete();
                }
                
                // Delete the business owner record
                Log::info('Deleting business owner ID: ' . $businessOwner->business_owner_id . ' due to user deletion');
                $businessOwner->delete();
            }
        }
    }
}
