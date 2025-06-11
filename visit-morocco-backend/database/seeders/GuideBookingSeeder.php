<?php

namespace Database\Seeders;

use App\Models\AppUser;
use App\Models\Guide;
use App\Models\GuideBooking;
use App\Models\GuideService;
use Carbon\Carbon;
use Illuminate\Database\Seeder;

class GuideBookingSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Define sample guide bookings data
        $bookings = [
            // Cultural Tours
            [
                'guide_email' => 'guide.ahmed@example.com',
                'service_title' => 'Marrakesh Cultural Tour',
                'user_email' => 'tourist.john@example.com',
                'booking_date' => Carbon::tomorrow()->format('Y-m-d'),
                'start_time' => '09:30:00',
                'duration' => 4,
                'num_people' => 2,
                'meeting_point' => 'Jemaa el-Fnaa, main square',
                'special_requests' => 'We\'re interested in the history of the Saadian Tombs',
                'status' => 'confirmed',
                'payment_status' => 'paid',
                'total_amount' => 800.00,
                'currency' => 'MAD',
                'language' => 'English',
                'additional_notes' => 'Please provide water and entrance fees are included',
            ],
            [
                'guide_email' => 'guide.fatima@example.com',
                'service_title' => 'Fes Medina Walking Tour',
                'user_email' => 'history.lover@example.com',
                'booking_date' => Carbon::today()->addDays(2)->format('Y-m-d'),
                'start_time' => '10:00:00',
                'duration' => 3,
                'num_people' => 4,
                'meeting_point' => 'Blue Gate (Bab Boujloud)',
                'special_requests' => 'Interested in traditional crafts and tanneries',
                'status' => 'confirmed',
                'payment_status' => 'paid',
                'total_amount' => 1200.00,
                'currency' => 'MAD',
                'language' => 'French',
            ],
            
            // Day Trips & Excursions
            [
                'guide_email' => 'guide.youssef@example.com',
                'service_title' => 'Atlas Mountains & Ait Ben Haddou',
                'user_email' => 'adventure.seeker@example.com',
                'booking_date' => Carbon::today()->addDays(3)->format('Y-m-d'),
                'start_time' => '07:00:00',
                'duration' => 10,
                'num_people' => 2,
                'meeting_point' => 'Hotel pickup in Marrakesh',
                'special_requests' => 'We\'d like to visit a Berber family for tea if possible',
                'status' => 'confirmed',
                'payment_status' => 'paid_deposit',
                'total_amount' => 2500.00,
                'currency' => 'MAD',
                'language' => 'English',
                'additional_notes' => 'Includes transportation and lunch',
            ],
            
            // Food & Market Tours
            [
                'guide_email' => 'guide.leila@example.com',
                'service_title' => 'Marrakesh Food Tasting Tour',
                'user_email' => 'foodie.traveler@example.com',
                'booking_date' => Carbon::today()->addDays(1)->format('Y-m-d'),
                'start_time' => '17:30:00',
                'duration' => 3.5,
                'num_people' => 4,
                'meeting_point' => 'Café de France, Jemaa el-Fnaa',
                'special_requests' => 'Two vegetarians in the group',
                'status' => 'confirmed',
                'payment_status' => 'paid',
                'total_amount' => 1800.00,
                'currency' => 'MAD',
                'language' => 'English',
            ],
            
            // Desert Tours
            [
                'guide_email' => 'guide.hassan@example.com',
                'service_title' => '3-Day Sahara Desert Tour',
                'user_email' => 'desert.explorer@example.com',
                'booking_date' => Carbon::today()->addDays(5)->format('Y-m-d'),
                'start_time' => '07:30:00',
                'duration' => 72,
                'num_people' => 2,
                'meeting_point' => 'Hotel pickup in Marrakesh',
                'special_requests' => 'Private tent with bathroom if possible',
                'status' => 'confirmed',
                'payment_status' => 'partially_paid',
                'total_amount' => 6800.00,
                'currency' => 'MAD',
                'language' => 'English',
                'additional_notes' => 'Includes 2 nights in desert camp, all meals, and camel trekking',
            ],
            
            // Photography Tours
            [
                'guide_email' => 'guide.karim@example.com',
                'service_title' => 'Sunrise Photography Tour - Chefchaouen',
                'user_email' => 'photo.enthusiast@example.com',
                'booking_date' => Carbon::today()->addDays(4)->format('Y-m-d'),
                'start_time' => '05:30:00',
                'duration' => 3,
                'num_people' => 1,
                'meeting_point' => 'Place Outa el Hammam',
                'special_requests' => 'Interested in architectural details and local life',
                'status' => 'pending',
                'payment_status' => 'unpaid',
                'total_amount' => 900.00,
                'currency' => 'MAD',
                'language' => 'Spanish',
            ],
            
            // Historical Tours
            [
                'guide_email' => 'guide.rachid@example.com',
                'service_title' => 'Roman Ruins of Volubilis',
                'user_email' => 'history.buff@example.com',
                'booking_date' => Carbon::today()->addDays(6)->format('Y-m-d'),
                'start_time' => '09:00:00',
                'duration' => 6,
                'num_people' => 3,
                'meeting_point' => 'Hotel pickup in Meknes',
                'special_requests' => 'In-depth historical information preferred',
                'status' => 'confirmed',
                'payment_status' => 'paid',
                'total_amount' => 2100.00,
                'currency' => 'MAD',
                'language' => 'English',
                'additional_notes' => 'Includes transportation and entrance fees',
            ],
            
            // Custom Tours
            [
                'guide_email' => 'guide.nadia@example.com',
                'service_title' => 'Customized Private Tour',
                'user_email' => 'luxury.traveler@example.com',
                'booking_date' => Carbon::today()->addDays(7)->format('Y-m-d'),
                'start_time' => '10:00:00',
                'duration' => 8,
                'num_people' => 6,
                'meeting_point' => 'To be arranged',
                'special_requests' => 'Luxury vehicle with driver, gourmet lunch included',
                'status' => 'confirmed',
                'payment_status' => 'paid',
                'total_amount' => 8500.00,
                'currency' => 'MAD',
                'language' => 'French',
                'additional_notes' => 'Itinerary to be confirmed 2 days before',
            ]
        ];

        // Ensure we have at least 15 bookings
        $totalBookings = 15;
        
        // Get all guides and users
        $guides = Guide::with('user')->get();
        $users = AppUser::all();
        
        if ($guides->isEmpty() || $users->isEmpty()) {
            $this->command->info('No guides or users found. Please run GuideSeeder and UserSeeder first.');
            return;
        }
        
        // Create bookings from our sample data
        foreach ($bookings as $bookingData) {
            $guide = $guides->firstWhere('user.email', $bookingData['guide_email']);
            $user = $users->firstWhere('email', $bookingData['user_email']);
            
            if ($guide && $user) {
                $this->createGuideBooking($guide, $user, $bookingData);
            }
        }
        
        // Create additional random bookings if needed
        $existingCount = count($bookings);
        if ($existingCount < $totalBookings) {
            $this->createRandomGuideBookings(
                $guides, 
                $users, 
                $totalBookings - $existingCount
            );
        }
    }
    
    /**
     * Create a guide booking from the given data
     */
    private function createGuideBooking($guide, $user, array $data): void
    {
        // Find or create the guide service
        $service = GuideService::firstOrCreate(
            [
                'guide_id' => $guide->guide_id,
                'title' => $data['service_title'],
            ],
            [
                'description' => 'Private guided tour',
                'duration' => $data['duration'] ?? 2,
                'price' => ($data['total_amount'] / max(1, $data['num_people'])),
                'max_group_size' => 10,
                'is_private' => true,
                'languages' => ['en'],
                'includes' => [],
                'excludes' => [],
                'meeting_point' => $data['meeting_point'] ?? 'To be arranged',
                'city_id' => 1 // Default city ID, you might want to make this dynamic
            ]
        );
        
        // Ensure payment_status is valid
        $validPaymentStatuses = ['unpaid', 'paid', 'partially_paid'];
        $paymentStatus = in_array($data['payment_status'] ?? 'unpaid', $validPaymentStatuses) 
            ? $data['payment_status'] 
            : 'unpaid';
        
        // Create the booking
        $booking = new GuideBooking([
            'service_id' => $service->service_id,
            'guide_id' => $guide->guide_id,
            'user_id' => $user->user_id,
            'booking_date' => $data['booking_date'],
            'start_time' => $data['start_time'],
            'num_people' => $data['num_people'],
            'special_requests' => $data['special_requests'] ?? null,
            'status' => $data['status'] ?? 'pending',
            'payment_status' => $paymentStatus,
            'total_amount' => $data['total_amount']
        ]);
        
        $booking->save();
    }
    
    // ... rest of the code remains the same ...
    /**
     * Create random guide bookings
     */
    private function createRandomGuideBookings($guides, $users, $count): void
    {
        $statuses = ['pending', 'confirmed', 'completed', 'cancelled'];
        $paymentStatuses = ['unpaid', 'paid', 'partially_paid']; // Removed 'refunded' as it's not a valid option
        $tourTypes = [
            'City Tour', 
            'Food Tour', 
            'Desert Safari', 
            'Mountain Trek', 
            'Cultural Experience',
            'Photography Walk',
            'Historical Tour'
        ];
        $languages = ['English', 'French', 'Spanish', 'German', 'Arabic'];
        $meetingPoints = [
            'Hotel lobby', 
            'Main square', 
            'Tourist information center',
            'To be arranged',
            'City center'
        ];
        
        for ($i = 0; $i < $count; $i++) {
            $guide = $guides->random();
            $user = $users->random();
            $bookingDate = Carbon::today()->addDays(rand(-30, 60));
            $status = $statuses[array_rand($statuses)];
            $tourType = $tourTypes[array_rand($tourTypes)];
            $duration = rand(2, 10);
            $numPeople = rand(1, 8);
            $pricePerPerson = rand(300, 1500);
            
            $bookingData = [
                'guide_email' => $guide->user->email,
                'service_title' => $tourType . ' - ' . $this->getRandomCity(),
                'user_email' => $user->email,
                'booking_date' => $bookingDate->format('Y-m-d'),
                'start_time' => sprintf('%02d:00:00', rand(6, 16)),
                'duration' => $duration,
                'num_people' => $numPeople,
                'meeting_point' => $meetingPoints[array_rand($meetingPoints)],
                'special_requests' => rand(0, 1) ? $this->getRandomSpecialRequest() : null,
                'status' => $status,
                'payment_status' => $paymentStatuses[array_rand($paymentStatuses)],
                'total_amount' => $pricePerPerson * $numPeople,
                'currency' => 'MAD',
                'language' => $languages[array_rand($languages)],
                'additional_notes' => rand(0, 1) ? $this->getRandomAdditionalNote() : null,
            ];
            
            $this->createGuideBooking($guide, $user, $bookingData);
        }
    }
    
    /**
     * Generate a random city in Morocco
     */
    private function getRandomCity(): string
    {
        $cities = [
            'Marrakesh', 'Fes', 'Chefchaouen', 'Essaouira', 'Rabat',
            'Casablanca', 'Meknes', 'Tangier', 'Agadir', 'Ouarzazate',
            'Merzouga', 'Dades Valley', 'Todgha Gorge', 'Asilah', 'Ifrane'
        ];
        return $cities[array_rand($cities)];
    }
    
    /**
     * Generate a random special request
     */
    private function getRandomSpecialRequest(): string
    {
        $requests = [
            'Wheelchair accessible',
            'Vegetarian meal options',
            'Private tour',
            'Photography focused',
            'Family with young children',
            'Senior citizens in group',
            'Need English speaking guide',
            'Interested in local crafts',
            'Food allergies: ' . $this->getRandomFoodAllergy(),
            'Celebrating special occasion',
        ];
        return $requests[array_rand($requests)];
    }
    
    /**
     * Generate a random food allergy
     */
    private function getRandomFoodAllergy(): string
    {
        $allergies = [
            'Nuts', 'Shellfish', 'Dairy', 'Gluten', 'Eggs',
            'Soy', 'Fish', 'Sesame', 'Mustard', 'Sulfites'
        ];
        return $allergies[array_rand($allergies)];
    }
    
    /**
     * Generate a random additional note
     */
    private function getRandomAdditionalNote(): string
    {
        $notes = [
            'Please confirm booking by email',
            'Will pay in cash on arrival',
            'Need receipt for business expenses',
            'Flexible on timing',
            'First time visiting Morocco',
            'Returning customer',
            'Interested in shopping for local crafts',
            'Photography enthusiast',
            'Will provide own transportation',
            'Need child seats if transportation included'
        ];
        return $notes[array_rand($notes)];
    }
    
    /**
     * Get a random cancellation policy
     */
    private function getRandomCancellationPolicy(): string
    {
        $policies = [
            'Free cancellation up to 24 hours before the tour',
            'Non-refundable',
            '50% refund if cancelled at least 48 hours in advance',
            'Full refund if cancelled 7 days in advance',
            'No refund for no-shows',
            'Free rescheduling up to 24 hours before the tour',
        ];
        return $policies[array_rand($policies)];
    }
}
