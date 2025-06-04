<?php

namespace Database\Seeders;

use App\Models\Airline;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Storage;

class AirlineSeeder extends Seeder
{
    public function run(): void
    {
        // Delete existing airlines to avoid duplicates
        \App\Models\Airline::query()->delete();

        // Map airline codes to their logo files
        // Format: 'AIRLINE_CODE' => 'logo-filename.png'
        $airlineLogos = [
            // Moroccan Airlines
            'AT' => 'royal-air-maroc-logo.png',
            '3O' => 'air-arabia-logo.png',
            '8U' => 'afriqiyah-airways-logo.png',
            
            // International Airlines
            'AF' => 'air-france-logo.png',
            'BA' => 'british-airways-logo.png',
            'LH' => 'lufthansa-logo.png',
            'IB' => 'iberia-logo.png',
            'TK' => 'turkish-airlines-logo.png',
            'QR' => 'qatar-airways-logo.png',
            'EK' => 'emirates-logo.png',
            'TP' => 'tap-portugal-logo.png',
            'AC' => 'air-canada-logo.png',
            'AA' => 'american-airlines-logo.png',
            'JL' => 'japan-airlines-logo.png',
            'FR' => 'ryanair-logo.png',
            'W6' => 'wizz-air-logo.png'
        ];
        
        $airlines = [
            // Moroccan Airlines
            [
                'code' => 'AT',
                'name' => 'Royal Air Maroc',
                'logo' => $airlineLogos['AT']
            ],
            [
                'code' => '3O',
                'name' => 'Air Arabia Maroc',
                'logo' => $airlineLogos['3O']
            ],
            [
                'code' => '8U',
                'name' => 'Afriqiyah Airways',
                'logo' => $airlineLogos['8U']
            ],
            
            // Major International Carriers to Morocco
            [
                'code' => 'AF',
                'name' => 'Air France',
                'logo' => $airlineLogos['AF']
            ],
            [
                'code' => 'BA',
                'name' => 'British Airways',
                'logo' => $airlineLogos['BA']
            ],
            [
                'code' => 'LH',
                'name' => 'Lufthansa',
                'logo' => $airlineLogos['LH']
            ],
            [
                'code' => 'IB',
                'name' => 'Iberia',
                'logo' => $airlineLogos['IB']
            ],
            [
                'code' => 'TK',
                'name' => 'Turkish Airlines',
                'logo' => $airlineLogos['TK']
            ],
            [
                'code' => 'QR',
                'name' => 'Qatar Airways',
                'logo' => $airlineLogos['QR']
            ],
            [
                'code' => 'EK',
                'name' => 'Emirates',
                'logo' => $airlineLogos['EK']
            ],
            [
                'code' => 'TP',
                'name' => 'TAP Portugal',
                'logo' => $airlineLogos['TP']
            ]
        ];
        
        // Ensure all logo files exist, fallback to default if not
        $defaultLogo = 'airline-logo.jpg';
        foreach ($airlines as &$airline) {
            $logoPath = public_path("images/airlines/{$airline['logo']}");
            if (!file_exists($logoPath)) {
                // Try to generate the logo if it doesn't exist
                $generatedLogo = $this->generateAirlineLogo($airline['name'], $airline['code']);
                $airline['logo'] = $generatedLogo ?: $defaultLogo;
            }
        }
        
        foreach ($airlines as $airline) {
            Airline::updateOrCreate(
                ['code' => $airline['code']], // Find by code
                $airline // Update or create with these values
            );
        }
    }
    
    /**
     * Generate a simple logo for an airline
     *
     * @param string $airlineName
     * @param string $airlineCode
     * @return string|null The generated filename or null on failure
     */
    protected function generateAirlineLogo($airlineName, $airlineCode)
{
    $width = 300;
    $height = 200;
    $filename = strtolower(str_replace(' ', '-', $airlineName)) . '-logo.png';
    // Change path to match what the controller expects
    $relativePath = 'airlines-images/' . $filename;
    $outputDir = storage_path('app/public/airlines-images');
    $outputFile = $outputDir . '/' . $filename;

    // Return the relative path for storage in the database
    
    // Create directory if it doesn't exist
    if (!file_exists($outputDir)) {
        mkdir($outputDir, 0777, true);
    }
    
    // Create image with alpha channel
    $image = imagecreatetruecolor($width, $height);
    imagesavealpha($image, true);
    
    // Colors - generate a unique color scheme for each airline based on name
    $colorSeed = crc32($airlineName) % 1000;
    $hue = ($colorSeed % 360) / 360; // Value between 0-1 representing hue
    
    // Convert HSV to RGB for primary color (bright, saturated)
    $primaryColor = $this->hsvToRgb($hue, 0.8, 0.9);
    $secondaryColor = $this->hsvToRgb(($hue + 0.5) % 1, 0.7, 0.8); // Complementary color
    $accentColor = $this->hsvToRgb(($hue + 0.1) % 1, 0.9, 1.0); // Slightly offset hue for accent
    
    // Allocate colors
    $primaryRGB = imagecolorallocate($image, $primaryColor[0], $primaryColor[1], $primaryColor[2]);
    $secondaryRGB = imagecolorallocate($image, $secondaryColor[0], $secondaryColor[1], $secondaryColor[2]);
    $accentRGB = imagecolorallocate($image, $accentColor[0], $accentColor[1], $accentColor[2]);
    $white = imagecolorallocate($image, 255, 255, 255);
    $lightGray = imagecolorallocate($image, 240, 240, 240);
    $darkGray = imagecolorallocate($image, 40, 40, 40);
    $transparent = imagecolorallocatealpha($image, 0, 0, 0, 127);
    
    // Fill background with transparency
    imagefill($image, 0, 0, $transparent);
    
    // Design variations based on airline name hash
    $designVariation = $colorSeed % 5;
    
    switch ($designVariation) {
        case 0: // Modern circular logo with accent stripe
            // Main circle
            $centerX = $width / 2;
            $centerY = $height / 2;
            $radius = min($width, $height) * 0.35;
            imagefilledellipse($image, $centerX, $centerY, $radius * 2, $radius * 2, $primaryRGB);
            
            // Accent stripe across the circle
            $stripeWidth = $radius * 0.4;
            $points = [
                $centerX - $radius, $centerY - $stripeWidth / 2,
                $centerX + $radius, $centerY - $stripeWidth / 2,
                $centerX + $radius, $centerY + $stripeWidth / 2,
                $centerX - $radius, $centerY + $stripeWidth / 2,
            ];
            imagefilledpolygon($image, $points, 4, $accentRGB);
            break;
            
        case 1: // Shield or crest design
            // Shield shape
            $shieldWidth = $width * 0.6;
            $shieldHeight = $height * 0.7;
            $shieldX = ($width - $shieldWidth) / 2;
            $shieldY = ($height - $shieldHeight) / 2;
            
            // Shield points
            $points = [
                $shieldX, $shieldY, // Top left
                $shieldX + $shieldWidth, $shieldY, // Top right
                $shieldX + $shieldWidth, $shieldY + $shieldHeight * 0.7, // Middle right
                $shieldX + $shieldWidth / 2, $shieldY + $shieldHeight, // Bottom middle
                $shieldX, $shieldY + $shieldHeight * 0.7, // Middle left
            ];
            imagefilledpolygon($image, $points, 5, $primaryRGB);
            
            // Inner shield
            $innerMargin = 10;
            $innerPoints = [
                $shieldX + $innerMargin, $shieldY + $innerMargin,
                $shieldX + $shieldWidth - $innerMargin, $shieldY + $innerMargin,
                $shieldX + $shieldWidth - $innerMargin, $shieldY + $shieldHeight * 0.7 - $innerMargin,
                $shieldX + $shieldWidth / 2, $shieldY + $shieldHeight - $innerMargin,
                $shieldX + $innerMargin, $shieldY + $shieldHeight * 0.7 - $innerMargin,
            ];
            imagefilledpolygon($image, $innerPoints, 5, $secondaryRGB);
            break;
            
        case 2: // Wing-like design
            // Wing shape
            $centerX = $width / 2;
            $centerY = $height / 2;
            $wingSpan = $width * 0.8;
            $wingHeight = $height * 0.4;
            
            // Draw curved wing
            for ($i = 0; $i < $wingSpan / 2; $i++) {
                $curveHeight = sin(($i / ($wingSpan / 2)) * M_PI) * $wingHeight;
                imagefilledarc(
                    $image, 
                    $centerX, 
                    $centerY - $curveHeight / 2, 
                    $i * 2, 
                    $curveHeight, 
                    0, 360, 
                    $primaryRGB, 
                    IMG_ARC_PIE
                );
            }
            
            // Accent stripe
            imagefilledrectangle(
                $image, 
                $centerX - $wingSpan / 2, 
                $centerY, 
                $centerX + $wingSpan / 2, 
                $centerY + 10, 
                $accentRGB
            );
            break;
            
        case 3: // Globe design
            // Main globe
            $centerX = $width / 2;
            $centerY = $height / 2;
            $radius = min($width, $height) * 0.35;
            imagefilledellipse($image, $centerX, $centerY, $radius * 2, $radius * 2, $primaryRGB);
            
            // Globe latitude lines
            for ($i = 1; $i <= 5; $i++) {
                $yOffset = ($radius * 2) / 6 * $i - $radius;
                $arcWidth = sqrt(($radius * $radius) - ($yOffset * $yOffset)) * 2;
                if ($arcWidth > 0) {
                    imagearc(
                        $image, 
                        $centerX, 
                        $centerY, 
                        $arcWidth, 
                        $arcWidth * 0.2, 
                        0, 360, 
                        $secondaryRGB
                    );
                }
            }
            
            // Globe longitude lines
            for ($i = 0; $i < 6; $i++) {
                $angle = $i * 30;
                $x1 = $centerX + $radius * cos(deg2rad($angle));
                $y1 = $centerY - $radius * sin(deg2rad($angle));
                $x2 = $centerX + $radius * cos(deg2rad($angle + 180));
                $y2 = $centerY - $radius * sin(deg2rad($angle + 180));
                imageline($image, $x1, $y1, $x2, $y2, $secondaryRGB);
            }
            break;
            
        case 4: // Abstract/geometric design
            // Create triangular patterns
            $centerX = $width / 2;
            $centerY = $height / 2;
            $size = min($width, $height) * 0.4;
            
            // Main triangles
            $trianglePoints = [
                // Top triangle
                $centerX, $centerY - $size,
                $centerX - $size, $centerY,
                $centerX + $size, $centerY,
                // Bottom left triangle
                $centerX - $size / 2, $centerY + $size,
                $centerX - $size, $centerY,
                $centerX, $centerY,
                // Bottom right triangle
                $centerX + $size / 2, $centerY + $size,
                $centerX + $size, $centerY,
                $centerX, $centerY,
            ];
            
            imagefilledpolygon($image, array_slice($trianglePoints, 0, 6), 3, $primaryRGB);
            imagefilledpolygon($image, array_slice($trianglePoints, 6, 6), 3, $secondaryRGB);
            imagefilledpolygon($image, array_slice($trianglePoints, 12, 6), 3, $accentRGB);
            break;
    }
    
    // Add airline code (prominent in the design)
    $codeSize = 5; // GD built-in font size (1-5)
    $codeWidth = strlen($airlineCode) * imagefontwidth($codeSize) * 1.5;
    $codeX = ($width - $codeWidth) / 2;
    $codeY = $height / 2 - 10;
    
    // Add text with contrasting color
    $textColor = ($designVariation == 1 || $designVariation == 4) ? $white : $darkGray;
    
    // Add subtle shadow for better readability
    imagestring($image, $codeSize, $codeX + 1, $codeY + 1, $airlineCode, $darkGray);
    imagestring($image, $codeSize, $codeX, $codeY, $airlineCode, $textColor);
    
    // Add airline name (smaller, below the code)
    $nameSize = 3; // GD built-in font size (1-5)
    
    // Split name if too long
    $maxWidth = $width - 40;
    $name = wordwrap($airlineName, 20, "\n", false);
    $lines = explode("\n", $name);
    
    $lineHeight = 20;
    $startY = $codeY + 30;
    
    foreach ($lines as $i => $line) {
        $lineWidth = strlen($line) * imagefontwidth($nameSize);
        $lineX = ($width - $lineWidth) / 2;
        $lineY = $startY + ($i * $lineHeight);
        
        // Add subtle shadow for better readability
        imagestring($image, $nameSize, $lineX + 1, $lineY + 1, $line, $darkGray);
        imagestring($image, $nameSize, $lineX, $lineY, $line, $textColor);
    }
    
    // Add visual details based on airline type
    if (stripos($airlineName, 'air') !== false || stripos($airlineName, 'airways') !== false) {
        // Add small airplane silhouette
        $planeSize = 24;
        $planeX = $width - $planeSize - 10;
        $planeY = 10;
        
        // Simple plane shape
        imagefilledrectangle($image, $planeX, $planeY + $planeSize/3, $planeX + $planeSize, $planeY + $planeSize*2/3, $accentRGB); // Wings
        imagefilledrectangle($image, $planeX + $planeSize/3, $planeY, $planeX + $planeSize*2/3, $planeY + $planeSize, $accentRGB); // Body
    }
    
    // Save image
    $result = imagepng($image, $outputFile, 1); // Higher quality
    imagedestroy($image);
    
    return $relativePath;
}

/**
 * Convert HSV color values to RGB
 * 
 * @param float $h Hue (0-1)
 * @param float $s Saturation (0-1)
 * @param float $v Value (0-1)
 * @return array RGB values (0-255)
 */
protected function hsvToRgb($h, $s, $v) {
    $h_i = floor($h * 6);
    $f = $h * 6 - $h_i;
    $p = $v * (1 - $s);
    $q = $v * (1 - $f * $s);
    $t = $v * (1 - (1 - $f) * $s);
    
    switch($h_i) {
        case 0: return [round($v * 255), round($t * 255), round($p * 255)];
        case 1: return [round($q * 255), round($v * 255), round($p * 255)];
        case 2: return [round($p * 255), round($v * 255), round($t * 255)];
        case 3: return [round($p * 255), round($q * 255), round($v * 255)];
        case 4: return [round($t * 255), round($p * 255), round($v * 255)];
        case 5: return [round($v * 255), round($p * 255), round($q * 255)];
        default: return [0, 0, 0];
    }
}
}
