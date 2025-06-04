<?php

namespace Database\Seeders;

use App\Models\Facility;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class FacilitySeeder extends Seeder
{
    public function run(): void
    {
        $facilities = [
            [
                'name' => 'In-Flight Entertainment',
                'description' => 'Seatback screens or overhead screens (movies, TV shows, music)',
                'image' => 'entertainment-facility.png'
            ],
            [
                'name' => 'Wi-Fi',
                'description' => 'Available on some airlines, often paid',
                'image' => 'wifi-facility.png'
            ],
            [
                'name' => 'Food & Drinks',
                'description' => 'Complimentary meals on long flights; buy-on-board for short ones.',
                'image' => 'food-facility.png'
            ],
            [
                'name' => 'Charging Ports',
                'description' => 'USB or power outlets on newer planes.',
                'image' => 'charging-facility.png'
            ],
            [
                'name' => 'Blankets & Pillows',
                'description' => 'Provided on long haul flights',
                'image' => 'blanket-facility.png'
            ],
            [
                'name' => 'Upgraded Meals',
                'description' => 'Better food choices, sometimes served on real plates.',
                'image' => 'upgraded-meals-facility.png'
            ],
            [
                'name' => 'Lie-Flat Seats',
                'description' => 'Convert into fully flat beds for sleeping',
                'image' => 'lifeflat-seats-facility.png'
            ],
            [
                'name' => 'Fine Dining',
                'description' => 'Gourmet meals with premium dining experience',
                'image' => 'fine-dining-facility.png'
            ]
        ];

        // First, delete all existing facilities to avoid duplicates
        Facility::query()->delete();
        
        // Then create the new facilities
        foreach ($facilities as $facility) {
            $this->generateFacilityIcon($facility);
            Facility::create($facility);
        }
    }

    /**
     * Generate a facility icon if it doesn't exist
     *
     * @param array $facility
     * @return void
     */
    protected function generateFacilityIcon(array &$facility): void
    {
        $filename = $facility['image'];
        // Change path to match what the controller expects
        $relativePath = 'facilities-images/' . $filename;
        $facility['image'] = $relativePath; // Update the facility data with the correct path
        $outputDir = storage_path('app/public/facilities-images');
        $outputFile = $outputDir . '/' . $filename;
        
        // Skip if file already exists
        if (file_exists($outputFile)) {
            return;
        }
        
        // Create directory if it doesn't exist
        if (!file_exists($outputDir)) {
            mkdir($outputDir, 0777, true);
        }
        
        // Determine icon text based on facility name
        $iconText = $this->getIconTextFromName($facility['name']);
        
        // Create a professional-looking icon using GD
        $width = 200;
        $height = 200;
        $image = imagecreatetruecolor($width, $height);
        
        // Make background transparent
        $transparent = imagecolorallocatealpha($image, 0, 0, 0, 127);
        imagefill($image, 0, 0, $transparent);
        imagesavealpha($image, true);
        
        // Set up colors based on facility type
        $colorScheme = $this->getColorSchemeForFacility($facility['name']);
        $primaryColor = imagecolorallocate($image, $colorScheme[0][0], $colorScheme[0][1], $colorScheme[0][2]);
        $secondaryColor = imagecolorallocate($image, $colorScheme[1][0], $colorScheme[1][1], $colorScheme[1][2]);
        $textColor = imagecolorallocate($image, 255, 255, 255);
        $highlightColor = imagecolorallocate($image, 255, 255, 220);
        
        // Draw a more interesting background
        $centerX = $width / 2;
        $centerY = $height / 2;
        $radius = min($width, $height) * 0.4;
        
        // Create a gradient-like effect with multiple circles
        for ($i = $radius * 2; $i > 0; $i -= 4) {
            $shade = $i / ($radius * 2); // Value between 0 and 1
            $r = (int)($colorScheme[0][0] * $shade + $colorScheme[1][0] * (1 - $shade));
            $g = (int)($colorScheme[0][1] * $shade + $colorScheme[1][1] * (1 - $shade));
            $b = (int)($colorScheme[0][2] * $shade + $colorScheme[1][2] * (1 - $shade));
            $circleColor = imagecolorallocate($image, $r, $g, $b);
            imagefilledellipse($image, $centerX, $centerY, $i, $i, $circleColor);
        }
        
        // Add an icon effect based on the facility type
        $this->drawFacilityIcon($image, $facility['name'], $centerX, $centerY, $radius, $highlightColor, $textColor);
        
        // Save the image with higher quality
        imagepng($image, $outputFile, 1); // 1 = higher quality (less compression)
        imagedestroy($image);
    }
    
    /**
     * Get color scheme based on facility type
     */
    protected function getColorSchemeForFacility(string $name): array
    {
        $name = strtolower($name);
        
        // Primary and secondary colors: [R, G, B]
        if (str_contains($name, 'entertainment')) return [[50, 100, 180], [20, 60, 120]]; // Blue tones
        if (str_contains($name, 'wi-fi') || str_contains($name, 'wifi')) return [[0, 120, 180], [0, 80, 140]]; // Cyan tones
        if (str_contains($name, 'food') || str_contains($name, 'dining')) return [[180, 80, 40], [140, 50, 20]]; // Orange/Brown tones
        if (str_contains($name, 'drink')) return [[100, 160, 40], [60, 120, 20]]; // Green tones
        if (str_contains($name, 'charg')) return [[200, 60, 60], [160, 30, 30]]; // Red tones
        if (str_contains($name, 'blanket') || str_contains($name, 'pillow')) return [[140, 100, 180], [100, 60, 140]]; // Purple tones
        if (str_contains($name, 'meal') || str_contains($name, 'upgraded')) return [[200, 150, 50], [160, 120, 30]]; // Gold tones
        if (str_contains($name, 'seat') || str_contains($name, 'flat')) return [[60, 120, 160], [30, 80, 120]]; // Steel blue tones
        
        // Default blue
        return [[60, 120, 200], [30, 80, 160]];
    }
    
    /**
     * Draw a custom icon based on facility type
     */
    protected function drawFacilityIcon($image, $facilityName, $centerX, $centerY, $radius, $highlightColor, $textColor): void
    {
        $name = strtolower($facilityName);
        $iconText = $this->getIconTextFromName($facilityName);
        $smallRadius = $radius * 0.6;
        
        // Draw specific icon based on facility type
        if (str_contains($name, 'entertainment')) {
            // TV/Screen icon
            imagefilledrectangle($image, $centerX - $smallRadius, $centerY - $smallRadius * 0.8, 
                              $centerX + $smallRadius, $centerY + $smallRadius * 0.8, $highlightColor);
            // Screen inner area
            imagefilledrectangle($image, $centerX - $smallRadius * 0.9, $centerY - $smallRadius * 0.7, 
                              $centerX + $smallRadius * 0.9, $centerY + $smallRadius * 0.7, $textColor);
        } 
        else if (str_contains($name, 'wi-fi') || str_contains($name, 'wifi')) {
            // WiFi signal waves
            for ($i = 1; $i <= 3; $i++) {
                $arcSize = $smallRadius * (0.5 + $i * 0.2);
                // Draw arc segments for wifi symbol
                imagefilledarc($image, $centerX, $centerY + $smallRadius * 0.5, 
                           $arcSize, $arcSize, 180, 360, $highlightColor, IMG_ARC_PIE);
            }
            // Center dot
            imagefilledellipse($image, $centerX, $centerY + $smallRadius * 0.5, $smallRadius * 0.3, $smallRadius * 0.3, $textColor);
        }
        else if (str_contains($name, 'food') || str_contains($name, 'drink') || str_contains($name, 'meal') || str_contains($name, 'dining')) {
            // Plate/dish icon
            imagefilledellipse($image, $centerX, $centerY, $smallRadius * 1.4, $smallRadius * 1.4, $highlightColor);
            imagefilledellipse($image, $centerX, $centerY, $smallRadius * 1.2, $smallRadius * 1.2, $textColor);
            // Fork and knife
            $offset = $smallRadius * 0.5;
            imageline($image, $centerX - $offset, $centerY - $offset, $centerX - $offset, $centerY + $offset, $highlightColor);
            imageline($image, $centerX + $offset, $centerY - $offset, $centerX + $offset, $centerY + $offset, $highlightColor);
        }
        else if (str_contains($name, 'charg')) {
            // Battery with lightning bolt
            imagefilledrectangle($image, $centerX - $smallRadius * 0.8, $centerY - $smallRadius * 0.6, 
                              $centerX + $smallRadius * 0.8, $centerY + $smallRadius * 0.6, $highlightColor);
            // Lightning bolt
            $points = [
                $centerX, $centerY - $smallRadius * 0.4,
                $centerX - $smallRadius * 0.3, $centerY,
                $centerX, $centerY,
                $centerX, $centerY + $smallRadius * 0.4,
                $centerX + $smallRadius * 0.3, $centerY,
                $centerX, $centerY
            ];
            imagefilledpolygon($image, $points, 6, $textColor);
        }
        else if (str_contains($name, 'blanket') || str_contains($name, 'pillow')) {
            // Pillow/blanket icon
            imagefilledrectangle($image, $centerX - $smallRadius, $centerY - $smallRadius * 0.6, 
                              $centerX + $smallRadius, $centerY + $smallRadius * 0.6, $highlightColor);
            // Z's for sleep
            $startX = $centerX - $smallRadius * 0.3;
            $startY = $centerY - $smallRadius * 0.3;
            $zSize = $smallRadius * 0.3;
            for ($i = 0; $i < 3; $i++) {
                imageline($image, $startX, $startY + ($i * $zSize * 0.7), $startX + $zSize, $startY + ($i * $zSize * 0.7), $textColor);
                imageline($image, $startX + $zSize, $startY + ($i * $zSize * 0.7), $startX, $startY + ($i * $zSize * 0.7) + $zSize * 0.5, $textColor);
                imageline($image, $startX, $startY + ($i * $zSize * 0.7) + $zSize * 0.5, $startX + $zSize, $startY + ($i * $zSize * 0.7) + $zSize * 0.5, $textColor);
            }
        }
        else if (str_contains($name, 'seat') || str_contains($name, 'flat')) {
            // Seat icon
            imagefilledrectangle($image, $centerX - $smallRadius, $centerY - $smallRadius * 0.1, 
                              $centerX + $smallRadius, $centerY + $smallRadius * 0.6, $highlightColor); // Seat base
            imagefilledrectangle($image, $centerX - $smallRadius, $centerY - $smallRadius * 0.8, 
                              $centerX + $smallRadius, $centerY - $smallRadius * 0.1, $highlightColor); // Seat back
        }
        else {
            // Generic icon - text only
            $font = 5; // Built-in GD font
            $textWidth = imagefontwidth($font) * strlen($iconText);
            $textHeight = imagefontheight($font);
            $x = $centerX - ($textWidth / 2);
            $y = $centerY - ($textHeight / 2);
            imagestring($image, $font, $x, $y, $iconText, $textColor);
        }
    }
    
    /**
     * Get icon text based on facility name
     */
    protected function getIconTextFromName(string $name): string
    {
        $name = strtolower($name);
        
        if (str_contains($name, 'entertainment')) return 'TV';
        if (str_contains($name, 'wi-fi') || str_contains($name, 'wifi')) return 'WiFi';
        if (str_contains($name, 'food') || str_contains($name, 'drink') || str_contains($name, 'meal')) return 'EAT';
        if (str_contains($name, 'charg')) return 'PWR';
        if (str_contains($name, 'blanket') || str_contains($name, 'pillow') || str_contains($name, 'bed') || str_contains($name, 'flat')) return 'Zzz';
        
        // Default: return first letter of each word
        $words = explode(' ', $name);
        $initials = '';
        foreach ($words as $word) {
            $initials .= strtoupper(substr(trim($word), 0, 1));
        }
        return substr($initials, 0, 3);
    }
}
