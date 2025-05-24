<?php

namespace App\Listeners;

use App\Events\AppUserUpdated;
use App\Models\BusinessOwner;
use App\Models\Business;
use Illuminate\Support\Facades\Log;

class HandleAppUserRoleChange
{
    /**
     * Handle the event.
     *
     * @param  \App\Events\AppUserUpdated  $event
     * @return void
     */
    public function handle(AppUserUpdated $event)
    {
        // Check if the role has changed
        if (isset($event->original['role']) && 
            $event->original['role'] === 'business_owner' && 
            $event->appUser->role !== 'business_owner') {
            
            Log::info('Business owner role changed for user ID: ' . $event->appUser->user_id);
            
            // Find the business owner record
            $businessOwner = BusinessOwner::where('user_id', $event->appUser->user_id)->first();
            
            if ($businessOwner) {
                // Delete all businesses associated with this business owner
                $businesses = Business::where('business_owner_id', $businessOwner->business_owner_id)->get();
                
                foreach ($businesses as $business) {
                    Log::info('Deleting business ID: ' . $business->business_id . ' due to owner role change');
                    $business->delete();
                }
                
                // Delete the business owner record
                Log::info('Deleting business owner ID: ' . $businessOwner->business_owner_id . ' due to role change');
                $businessOwner->delete();
            }
        }
    }
}
