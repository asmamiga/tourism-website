<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Drop existing tables if they exist
        Schema::dropIfExists('app_users');
        Schema::dropIfExists('users');
        
        // Create standard Laravel users table for Filament
        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('email')->unique();
            $table->timestamp('email_verified_at')->nullable();
            $table->string('password');
            $table->rememberToken();
            $table->timestamps();
        });

        // Create app_users table with your custom fields
        Schema::create('app_users', function (Blueprint $table) {
            $table->id('user_id');
            $table->string('email')->unique();
            $table->string('password_hash');
            $table->string('first_name', 100);
            $table->string('last_name', 100);
            $table->string('phone', 20)->nullable();
            $table->string('profile_picture')->nullable(); 
            $table->enum('role', ['admin', 'business_owner', 'guide', 'tourist']);
            $table->timestamp('created_at')->default(DB::raw('CURRENT_TIMESTAMP'));
            $table->timestamp('updated_at')->default(DB::raw('CURRENT_TIMESTAMP'));
            $table->timestamp('last_login')->nullable();
            $table->boolean('is_verified')->default(false);
            $table->string('verification_code', 100)->nullable();
            $table->string('reset_token', 100)->nullable();
            $table->timestamp('reset_token_expires')->nullable();
        });

        // Business owners
        Schema::create('business_owners', function (Blueprint $table) {
            $table->id('business_owner_id');
            $table->foreignId('user_id')->constrained('app_users', 'user_id')->onDelete('cascade');
            $table->string('business_name');
            $table->text('business_description')->nullable();
            $table->string('business_license', 100)->nullable();
            $table->boolean('is_approved')->default(false);
        });

        // Guides
        Schema::create('guides', function (Blueprint $table) {
            $table->id('guide_id');
            $table->foreignId('user_id')->constrained('app_users', 'user_id')->onDelete('cascade');
            $table->text('bio')->nullable();
            $table->integer('experience_years')->nullable();
            $table->json('languages')->nullable(); // Array of languages
            $table->json('specialties')->nullable(); // Array of specialties
            $table->decimal('daily_rate', 10, 2)->nullable();
            $table->boolean('is_available')->default(true);
            $table->boolean('is_approved')->default(false);
            $table->string('identity_verification', 100)->nullable();
            $table->string('guide_license', 100)->nullable();
        });

        // Regions
        Schema::create('regions', function (Blueprint $table) {
            $table->id('region_id');
            $table->string('name', 100);
            $table->text('description')->nullable();
        });

        // Cities
        Schema::create('cities', function (Blueprint $table) {
            $table->id('city_id');
            $table->foreignId('region_id')->nullable()->constrained('regions', 'region_id');
            $table->string('name', 100);
            $table->text('description')->nullable();
            $table->decimal('latitude', 10, 8)->nullable();
            $table->decimal('longitude', 11, 8)->nullable();
        });

        // Business categories
        Schema::create('business_categories', function (Blueprint $table) {
            $table->id('category_id');
            $table->string('name', 100);
            $table->text('description')->nullable();
        });

        // Businesses
        Schema::create('businesses', function (Blueprint $table) {
            $table->id('business_id');
            $table->foreignId('business_owner_id')->constrained('business_owners', 'business_owner_id');
            $table->foreignId('category_id')->constrained('business_categories', 'category_id');
            $table->string('name');
            $table->text('description')->nullable();
            $table->text('address')->nullable();
            $table->foreignId('city_id')->constrained('cities', 'city_id');
            $table->string('phone', 20)->nullable();
            $table->string('email')->nullable();
            $table->string('website')->nullable();
            $table->enum('price_range', ['$', '$$', '$$$', '$$$$'])->nullable();
            $table->decimal('latitude', 10, 8)->nullable();
            $table->decimal('longitude', 11, 8)->nullable();
            $table->json('opening_hours')->nullable(); // JSON format for opening hours
            $table->json('features')->nullable(); // Store features as JSON
            $table->timestamp('created_at')->default(DB::raw('CURRENT_TIMESTAMP'));
            $table->timestamp('updated_at')->default(DB::raw('CURRENT_TIMESTAMP'));
            $table->boolean('is_verified')->default(false);
            $table->boolean('is_featured')->default(false);
            $table->decimal('avg_rating', 3, 2)->nullable();
        });

        // Business photos
        Schema::create('business_photos', function (Blueprint $table) {
            $table->id('photo_id');
            $table->foreignId('business_id')->constrained('businesses', 'business_id')->onDelete('cascade');
            $table->string('photo_url');
            $table->text('caption')->nullable();
            $table->boolean('is_primary')->default(false);
            $table->timestamp('upload_date')->default(DB::raw('CURRENT_TIMESTAMP'));
        });

        // Guide services/tours
        Schema::create('guide_services', function (Blueprint $table) {
            $table->id('service_id');
            $table->foreignId('guide_id')->constrained('guides', 'guide_id')->onDelete('cascade');
            $table->string('title');
            $table->text('description')->nullable();
            $table->integer('duration')->nullable(); // Duration in hours
            $table->decimal('price', 10, 2)->nullable();
            $table->foreignId('city_id')->constrained('cities', 'city_id');
            $table->integer('max_group_size')->nullable();
            $table->json('includes')->nullable(); // Array of inclusions
            $table->json('excludes')->nullable(); // Array of exclusions
            $table->text('meeting_point')->nullable();
            $table->json('languages')->nullable();
            $table->boolean('is_private')->default(false);
            $table->timestamp('created_at')->default(DB::raw('CURRENT_TIMESTAMP'));
            $table->timestamp('updated_at')->default(DB::raw('CURRENT_TIMESTAMP'));
        });

        // Guide service photos
        Schema::create('guide_service_photos', function (Blueprint $table) {
            $table->id('photo_id');
            $table->foreignId('service_id')->constrained('guide_services', 'service_id')->onDelete('cascade');
            $table->string('photo_url');
            $table->text('caption')->nullable();
            $table->boolean('is_primary')->default(false);
            $table->timestamp('upload_date')->default(DB::raw('CURRENT_TIMESTAMP'));
        });

        // Guide availability
        Schema::create('guide_availability', function (Blueprint $table) {
            $table->id('availability_id');
            $table->foreignId('guide_id')->constrained('guides', 'guide_id')->onDelete('cascade');
            $table->date('date');
            $table->boolean('is_available')->default(true);
            $table->json('available_hours')->nullable(); // JSON format for hours
        });

        // Business bookings
        Schema::create('business_bookings', function (Blueprint $table) {
            $table->id('booking_id');
            $table->foreignId('business_id')->constrained('businesses', 'business_id');
            $table->foreignId('user_id')->constrained('app_users', 'user_id');
            $table->date('booking_date');
            $table->time('booking_time')->nullable();
            $table->integer('duration')->nullable(); // Duration in hours or days
            $table->integer('num_people')->nullable();
            $table->text('special_requests')->nullable();
            $table->enum('status', ['pending', 'confirmed', 'completed', 'cancelled'])->default('pending');
            $table->timestamp('created_at')->default(DB::raw('CURRENT_TIMESTAMP'));
            $table->timestamp('updated_at')->default(DB::raw('CURRENT_TIMESTAMP'));
            $table->enum('payment_status', ['unpaid', 'partially_paid', 'paid'])->default('unpaid');
            $table->decimal('total_amount', 10, 2)->nullable();
        });

        // Guide bookings
        Schema::create('guide_bookings', function (Blueprint $table) {
            $table->id('booking_id');
            $table->foreignId('service_id')->constrained('guide_services', 'service_id');
            $table->foreignId('guide_id')->constrained('guides', 'guide_id');
            $table->foreignId('user_id')->constrained('app_users', 'user_id');
            $table->date('booking_date');
            $table->time('start_time')->nullable();
            $table->integer('num_people')->nullable();
            $table->text('special_requests')->nullable();
            $table->enum('status', ['pending', 'confirmed', 'completed', 'cancelled'])->default('pending');
            $table->timestamp('created_at')->default(DB::raw('CURRENT_TIMESTAMP'));
            $table->timestamp('updated_at')->default(DB::raw('CURRENT_TIMESTAMP'));
            $table->enum('payment_status', ['unpaid', 'partially_paid', 'paid'])->default('unpaid');
            $table->decimal('total_amount', 10, 2)->nullable();
        });

        // Business reviews
        Schema::create('business_reviews', function (Blueprint $table) {
            $table->id('review_id');
            $table->foreignId('business_id')->constrained('businesses', 'business_id')->onDelete('cascade');
            $table->foreignId('user_id')->constrained('app_users', 'user_id');
            $table->integer('rating')->check('rating BETWEEN 1 AND 5');
            $table->string('title')->nullable();
            $table->text('content')->nullable();
            $table->date('visit_date')->nullable();
            $table->timestamp('created_at')->default(DB::raw('CURRENT_TIMESTAMP'));
            $table->timestamp('updated_at')->default(DB::raw('CURRENT_TIMESTAMP'));
            $table->boolean('is_verified')->default(false);
            $table->integer('helpful_votes')->default(0);
        });

        // Guide reviews
        Schema::create('guide_reviews', function (Blueprint $table) {
            $table->id('review_id');
            $table->foreignId('guide_id')->constrained('guides', 'guide_id')->onDelete('cascade');
            $table->foreignId('user_id')->constrained('app_users', 'user_id');
            $table->integer('rating')->check('rating BETWEEN 1 AND 5');
            $table->string('title')->nullable();
            $table->text('content')->nullable();
            $table->date('tour_date')->nullable();
            $table->timestamp('created_at')->default(DB::raw('CURRENT_TIMESTAMP'));
            $table->timestamp('updated_at')->default(DB::raw('CURRENT_TIMESTAMP'));
            $table->boolean('is_verified')->default(false);
            $table->integer('helpful_votes')->default(0);
        });

        // Review photos
        Schema::create('review_photos', function (Blueprint $table) {
            $table->id('photo_id');
            $table->foreignId('review_id')->constrained('business_reviews', 'review_id')->onDelete('cascade');
            $table->string('photo_url');
            $table->text('caption')->nullable();
            $table->timestamp('upload_date')->default(DB::raw('CURRENT_TIMESTAMP'));
        });

        // Attractions
        Schema::create('attractions', function (Blueprint $table) {
            $table->id('attraction_id');
            $table->string('name');
            $table->text('description')->nullable();
            $table->foreignId('city_id')->constrained('cities', 'city_id');
            $table->text('address')->nullable();
            $table->string('category', 100)->nullable(); // e.g., 'historical', 'natural', 'cultural'
            $table->decimal('entrance_fee', 10, 2)->nullable();
            $table->json('opening_hours')->nullable();
            $table->decimal('latitude', 10, 8)->nullable();
            $table->decimal('longitude', 11, 8)->nullable();
            $table->integer('visit_duration')->nullable(); // minutes
            $table->timestamp('created_at')->default(DB::raw('CURRENT_TIMESTAMP'));
            $table->timestamp('updated_at')->default(DB::raw('CURRENT_TIMESTAMP'));
            $table->decimal('avg_rating', 3, 2)->nullable();
        });

        // Attraction photos
        Schema::create('attraction_photos', function (Blueprint $table) {
            $table->id('photo_id');
            $table->foreignId('attraction_id')->constrained('attractions', 'attraction_id')->onDelete('cascade');
            $table->string('photo_url');
            $table->text('caption')->nullable();
            $table->boolean('is_primary')->default(false);
            $table->timestamp('upload_date')->default(DB::raw('CURRENT_TIMESTAMP'));
        });

        // Favorites
        Schema::create('favorites', function (Blueprint $table) {
            $table->id('favorite_id');
            $table->foreignId('user_id')->constrained('app_users', 'user_id')->onDelete('cascade');
            $table->enum('entity_type', ['business', 'guide', 'attraction']);
            $table->integer('entity_id');
            $table->timestamp('created_at')->default(DB::raw('CURRENT_TIMESTAMP'));
            
            // Add index for better query performance
            $table->index(['entity_type', 'entity_id']);
        });

        // Payments
        Schema::create('payments', function (Blueprint $table) {
            $table->id('payment_id');
            $table->enum('booking_type', ['business', 'guide']);
            $table->integer('booking_id'); // References either business_bookings or guide_bookings
            $table->foreignId('user_id')->constrained('app_users', 'user_id');
            $table->decimal('amount', 10, 2);
            $table->string('payment_method', 50)->nullable();
            $table->string('transaction_id', 100)->nullable();
            $table->enum('status', ['pending', 'completed', 'failed', 'refunded']);
            $table->timestamp('payment_date')->default(DB::raw('CURRENT_TIMESTAMP'));
        });

        // Messages
        Schema::create('messages', function (Blueprint $table) {
            $table->id('message_id');
            $table->foreignId('sender_id')->constrained('app_users', 'user_id');
            $table->foreignId('receiver_id')->constrained('app_users', 'user_id');
            $table->text('content');
            $table->timestamp('sent_at')->default(DB::raw('CURRENT_TIMESTAMP'));
            $table->timestamp('read_at')->nullable();
            $table->boolean('is_read')->default(false);
        });

        // Itineraries
        Schema::create('itineraries', function (Blueprint $table) {
            $table->id('itinerary_id');
            $table->foreignId('user_id')->constrained('app_users', 'user_id');
            $table->string('title');
            $table->text('description')->nullable();
            $table->date('start_date')->nullable();
            $table->date('end_date')->nullable();
            $table->boolean('is_public')->default(false);
            $table->timestamp('created_at')->default(DB::raw('CURRENT_TIMESTAMP'));
            $table->timestamp('updated_at')->default(DB::raw('CURRENT_TIMESTAMP'));
        });

        // Itinerary items
        Schema::create('itinerary_items', function (Blueprint $table) {
            $table->id('item_id');
            $table->foreignId('itinerary_id')->constrained('itineraries', 'itinerary_id')->onDelete('cascade');
            $table->integer('day_number')->nullable();
            $table->time('time_slot')->nullable();
            $table->enum('entity_type', ['business', 'guide', 'attraction']);
            $table->integer('entity_id');
            $table->text('notes')->nullable();
            $table->integer('duration')->nullable(); // Duration in minutes
        });

        // Notifications
        Schema::create('notifications', function (Blueprint $table) {
            $table->id('notification_id');
            $table->foreignId('user_id')->constrained('app_users', 'user_id')->onDelete('cascade');
            $table->string('type', 50);
            $table->text('content');
            $table->string('related_entity_type', 20)->nullable();
            $table->integer('related_entity_id')->nullable();
            $table->timestamp('created_at')->default(DB::raw('CURRENT_TIMESTAMP'));
            $table->boolean('is_read')->default(false);
            $table->timestamp('read_at')->nullable();
        });

        // Tags
        Schema::create('tags', function (Blueprint $table) {
            $table->id('tag_id');
            $table->string('name', 50)->unique();
        });

        // Entity tags
        Schema::create('entity_tags', function (Blueprint $table) {
            $table->id('entity_tag_id');
            $table->enum('entity_type', ['business', 'guide', 'attraction']);
            $table->integer('entity_id');
            $table->foreignId('tag_id')->constrained('tags', 'tag_id')->onDelete('cascade');
            
            // Add index for better performance
            $table->index(['entity_type', 'entity_id']);
        });

        // Blog posts
        Schema::create('blog_posts', function (Blueprint $table) {
            $table->id('post_id');
            $table->string('title');
            $table->text('content');
            $table->foreignId('author_id')->constrained('app_users', 'user_id');
            $table->timestamp('publish_date')->default(DB::raw('CURRENT_TIMESTAMP'));
            $table->timestamp('updated_at')->default(DB::raw('CURRENT_TIMESTAMP'));
            $table->enum('status', ['draft', 'published', 'archived'])->default('draft');
            $table->string('featured_image')->nullable();
            $table->text('excerpt')->nullable();
            $table->integer('view_count')->default(0);
        });

        // Blog categories
        Schema::create('blog_categories', function (Blueprint $table) {
            $table->id('category_id');
            $table->string('name', 100)->unique();
            $table->text('description')->nullable();
        });

        // Blog post categories mapping
        Schema::create('blog_post_categories', function (Blueprint $table) {
            $table->id('post_category_id');
            $table->foreignId('post_id')->constrained('blog_posts', 'post_id')->onDelete('cascade');
            $table->foreignId('category_id')->constrained('blog_categories', 'category_id')->onDelete('cascade');
        });

        // Blog comments
        Schema::create('blog_comments', function (Blueprint $table) {
            $table->id('comment_id');
            $table->foreignId('post_id')->constrained('blog_posts', 'post_id')->onDelete('cascade');
            $table->foreignId('user_id')->constrained('app_users', 'user_id');
            $table->text('content');
            $table->timestamp('created_at')->default(DB::raw('CURRENT_TIMESTAMP'));
            $table->boolean('is_approved')->default(false);
        });

        

        // System settings
        Schema::create('settings', function (Blueprint $table) {
            $table->id('setting_id');
            $table->string('setting_key', 100)->unique();
            $table->text('setting_value')->nullable();
            $table->text('description')->nullable();
        });

        // Create indexes for better performance
        Schema::table('businesses', function (Blueprint $table) {
            $table->index('city_id');
            $table->index('category_id');
        });
        
        Schema::table('guide_services', function (Blueprint $table) {
            $table->index('city_id');
        });
        
        Schema::table('business_bookings', function (Blueprint $table) {
            $table->index('user_id');
        });
        
        Schema::table('guide_bookings', function (Blueprint $table) {
            $table->index('user_id');
        });
        
        Schema::table('business_reviews', function (Blueprint $table) {
            $table->index('business_id');
        });
        
        Schema::table('guide_reviews', function (Blueprint $table) {
            $table->index('guide_id');
        });
        
        Schema::table('attractions', function (Blueprint $table) {
            $table->index('city_id');
        });
        
        Schema::table('messages', function (Blueprint $table) {
            $table->index('sender_id');
            $table->index('receiver_id');
        });
        
        Schema::table('notifications', function (Blueprint $table) {
            $table->index('user_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Drop tables in reverse order to respect foreign key constraints
        Schema::dropIfExists('settings');
        
        Schema::dropIfExists('blog_comments');
        Schema::dropIfExists('blog_post_categories');
        Schema::dropIfExists('blog_categories');
        Schema::dropIfExists('blog_posts');
        Schema::dropIfExists('entity_tags');
        Schema::dropIfExists('tags');
        Schema::dropIfExists('notifications');
        Schema::dropIfExists('itinerary_items');
        Schema::dropIfExists('itineraries');
        Schema::dropIfExists('messages');
        Schema::dropIfExists('payments');
        Schema::dropIfExists('favorites');
        Schema::dropIfExists('attraction_photos');
        Schema::dropIfExists('attractions');
        Schema::dropIfExists('review_photos');
        Schema::dropIfExists('guide_reviews');
        Schema::dropIfExists('business_reviews');
        Schema::dropIfExists('guide_bookings');
        Schema::dropIfExists('business_bookings');
        Schema::dropIfExists('guide_availability');
        Schema::dropIfExists('guide_service_photos');
        Schema::dropIfExists('guide_services');
        Schema::dropIfExists('business_photos');
        Schema::dropIfExists('businesses');
        Schema::dropIfExists('business_categories');
        Schema::dropIfExists('cities');
        Schema::dropIfExists('regions');
        Schema::dropIfExists('guides');
        Schema::dropIfExists('business_owners');
        Schema::dropIfExists('users');
    }
};
