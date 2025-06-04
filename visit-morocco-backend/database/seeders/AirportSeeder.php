<?php

namespace Database\Seeders;

use App\Models\Airport;
use Illuminate\Database\Seeder;

class AirportSeeder extends Seeder
{
    public function run(): void
    {
        $airports = [
            // International Airports in Morocco
            [
                'iata_code' => 'CMN',
                'name' => 'Mohammed V International Airport',
                'city' => 'Casablanca',
                'country' => 'Morocco',
                'image' => 'cmn-airport.png'
            ],
            [
                'iata_code' => 'RAK',
                'name' => 'Marrakesh Menara Airport',
                'city' => 'Marrakesh',
                'country' => 'Morocco',
                'image' => 'rak-airport.png'
            ],
            [
                'iata_code' => 'AGA',
                'name' => 'Agadir–Al Massira Airport',
                'city' => 'Agadir',
                'country' => 'Morocco',
                'image' => 'aga-airport.png'
            ],
            [
                'iata_code' => 'FEZ',
                'name' => 'Fès–Saïs Airport',
                'city' => 'Fes',
                'country' => 'Morocco',
                'image' => 'fez-airport.png'
            ],
            [
                'iata_code' => 'TNG',
                'name' => 'Tangier Ibn Battouta Airport',
                'city' => 'Tangier',
                'country' => 'Morocco',
                'image' => 'tng-airport.png'
            ],
            [
                'iata_code' => 'OUD',
                'name' => 'Angads Airport',
                'city' => 'Oujda',
                'country' => 'Morocco',
                'image' => 'oud-airport.png'
            ],
            
            // Regional Airports in Morocco
            [
                'iata_code' => 'RBA',
                'name' => 'Rabat–Salé Airport',
                'city' => 'Rabat',
                'country' => 'Morocco',
                'image' => 'rba-airport.png'
            ],
            [
                'iata_code' => 'OZZ',
                'name' => 'Ouarzazate Airport',
                'city' => 'Ouarzazate',
                'country' => 'Morocco',
                'image' => 'ozz-airport.png'
            ],
            [
                'iata_code' => 'ERH',
                'name' => 'Moulay Ali Cherif Airport',
                'city' => 'Errachidia',
                'country' => 'Morocco',
                'image' => 'erh-airport.png'
            ],
            [
                'iata_code' => 'NDR',
                'name' => 'Nador International Airport',
                'city' => 'Nador',
                'country' => 'Morocco',
                'image' => 'ndr-airport.png'
            ],
            [
                'iata_code' => 'AHU',
                'name' => 'Cherif Al Idrissi Airport',
                'city' => 'Al Hoceima',
                'country' => 'Morocco',
                'image' => 'ahu-airport.png'
            ],
            [
                'iata_code' => 'ESU',
                'name' => 'Essaouira-Mogador Airport',
                'city' => 'Essaouira',
                'country' => 'Morocco',
                'image' => 'esu-airport.png'
            ],
            [
                'iata_code' => 'OUI',
                'name' => 'Benslimane Airport',
                'city' => 'Benslimane',
                'country' => 'Morocco',
                'image' => 'oui-airport.png'
            ],
            
            // Smaller Airports in Morocco
            [
                'iata_code' => 'TTU',
                'name' => 'Sania Ramel Airport',
                'city' => 'Tétouan',
                'country' => 'Morocco',
                'image' => 'ttu-airport.png'
            ],
            [
                'iata_code' => 'GLN',
                'name' => 'Guelmim Airport',
                'city' => 'Guelmim',
                'country' => 'Morocco',
                'image' => 'gln-airport.png'
            ],
            [
                'iata_code' => 'ZAG',
                'name' => 'Zagora Airport',
                'city' => 'Zagora',
                'country' => 'Morocco',
                'image' => 'zag-airport.png'
            ],
            
            // Major International Connections
            [
                'iata_code' => 'DXB',
                'name' => 'Dubai International Airport',
                'city' => 'Dubai',
                'country' => 'UAE',
                'image' => 'dxb-airport.png'
            ],
            [
                'iata_code' => 'CDG',
                'name' => 'Charles de Gaulle Airport',
                'city' => 'Paris',
                'country' => 'France',
                'image' => 'cdg-airport.png'
            ],
            [
                'iata_code' => 'MAD',
                'name' => 'Adolfo Suárez Madrid–Barajas Airport',
                'city' => 'Madrid',
                'country' => 'Spain',
                'image' => 'mad-airport.png'
            ],
            [
                'iata_code' => 'FCO',
                'name' => 'Leonardo da Vinci–Fiumicino Airport',
                'city' => 'Rome',
                'country' => 'Italy',
                'image' => 'fco-airport.png'
            ]
        ];
        
        // Ensure all logo files exist, generate if missing
        foreach ($airports as &$airport) {
            $logoFilename = strtolower($airport['iata_code']) . '-airport.png';
            // Change path to match what the controller expects
            $relativePath = 'airports-images/' . $logoFilename;
            $outputDir = storage_path('app/public/airports-images');
            
            // Create directory if it doesn't exist
            if (!file_exists($outputDir)) {
                mkdir($outputDir, 0777, true);
            }
            
            $logoPath = $outputDir . '/' . $logoFilename;
            
            if (!file_exists($logoPath)) {
                $this->generateAirportLogo($airport, $logoPath);
            }
            
            // Update the image path to use the generated logo
            $airport['image'] = $relativePath;
        }
        
        // Create or update all airports
        foreach ($airports as $airport) {
            Airport::updateOrCreate(
                ['iata_code' => $airport['iata_code']], // Find by IATA code
                $airport // Update or create with these values
            );
        }
    }
    
    /**
     * Generate a professional-looking logo for an airport
     *
     * @param array $airport Airport data
     * @param string $outputFile Full path where to save the logo
     * @return bool True on success, false on failure
     */
    protected function generateAirportLogo($airport, $outputFile)
    {
        $width = 400;
        $height = 250;
        
        // Create output directory if it doesn't exist
        $outputDir = dirname($outputFile);
        if (!file_exists($outputDir)) {
            mkdir($outputDir, 0777, true);
        }
        
        // Create image with alpha channel
        $image = imagecreatetruecolor($width, $height);
        imagesavealpha($image, true);
        
        // Generate a unique color scheme based on airport code and country
        $colorSeed = crc32($airport['iata_code'] . $airport['country']) % 1000;
        $hue = ($colorSeed % 360) / 360; // Value between 0-1 representing hue
        
        // Convert HSV to RGB for colors
        $primaryColor = $this->hsvToRgb($hue, 0.7, 0.9);
        $secondaryColor = $this->hsvToRgb(($hue + 0.5) % 1, 0.6, 0.8); // Complementary
        $accentColor = $this->hsvToRgb(($hue + 0.1) % 1, 0.8, 1.0); // Accent
        
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
        
        // Choose a design based on airport type (international, regional, etc.)
        $isInternational = stripos($airport['name'], 'international') !== false;
        $designVariation = $isInternational ? ($colorSeed % 3) : (3 + ($colorSeed % 2));
        
        // Create the background design
        switch ($designVariation) {
            case 0: // Modern design for international airports
                // Main background shape - rounded rectangle
                $this->imageRoundedRectangle(
                    $image,
                    10, 10,
                    $width - 10, $height - 10,
                    20, // Corner radius
                    $primaryRGB,
                    true // Filled
                );
                
                // Accent stripe
                imagefilledrectangle(
                    $image,
                    20,
                    $height / 3,
                    $width - 20,
                    $height / 3 + 10,
                    $accentRGB
                );
                break;
                
            case 1: // Globe/map inspired for international hubs
                // Draw a circular background
                $centerX = $width / 2;
                $centerY = $height / 2;
                $radius = min($width, $height) * 0.4;
                
                // Main circle
                imagefilledellipse($image, $centerX, $centerY, $radius * 2, $radius * 2, $primaryRGB);
                
                // Add world map style grid lines
                for ($i = 0; $i <= 8; $i++) {
                    $yOffset = ($radius * 2) / 8 * $i - $radius;
                    $arcWidth = sqrt(pow($radius, 2) - pow($yOffset, 2)) * 2;
                    if ($arcWidth > 0) {
                        imagearc($image, $centerX, $centerY + $yOffset, $arcWidth, $arcWidth * 0.2, 0, 360, $secondaryRGB);
                    }
                }
                
                // Vertical lines
                for ($i = 0; $i < 12; $i++) {
                    $angle = $i * 30;
                    $x1 = $centerX + $radius * cos(deg2rad($angle));
                    $y1 = $centerY - $radius * sin(deg2rad($angle));
                    $x2 = $centerX + $radius * cos(deg2rad($angle + 180));
                    $y2 = $centerY - $radius * sin(deg2rad($angle + 180));
                    imageline($image, $x1, $y1, $x2, $y2, $secondaryRGB);
                }
                break;
                
            case 2: // Runway-inspired design for international airports
                // Background rectangle
                imagefilledrectangle($image, 0, 0, $width, $height, $primaryRGB);
                
                // Runway-like pattern
                $runwayWidth = $width * 0.6;
                $runwayHeight = $height * 0.7;
                $runwayX = ($width - $runwayWidth) / 2;
                $runwayY = ($height - $runwayHeight) / 2;
                
                // Perspective trapezoid for runway
                $points = [
                    $runwayX, $runwayY + $runwayHeight,
                    $runwayX + $runwayWidth, $runwayY + $runwayHeight,
                    $runwayX + $runwayWidth * 0.8, $runwayY,
                    $runwayX + $runwayWidth * 0.2, $runwayY,
                ];
                imagefilledpolygon($image, $points, 4, $secondaryRGB);
                
                // Runway markings
                $stripeCount = 10;
                $stripeWidth = $runwayWidth * 0.05;
                
                for ($i = 1; $i < $stripeCount; $i++) {
                    $t = $i / $stripeCount;
                    $x1 = $runwayX + $runwayWidth * 0.2 * (1 - $t) + $runwayWidth * $t * 0.2;
                    $y1 = $runwayY + $runwayHeight * $t;
                    $x2 = $runwayX + $runwayWidth - $runwayWidth * 0.2 * (1 - $t) - $runwayWidth * $t * 0.2;
                    $y2 = $y1;
                    
                    imageline($image, $x1, $y1, $x2, $y2, $white);
                }
                break;
                
            case 3: // Simpler design for regional airports
                // Simple rounded rectangle with accent strip
                $this->imageRoundedRectangle(
                    $image,
                    10, 10,
                    $width - 10, $height - 10,
                    15,
                    $primaryRGB,
                    true
                );
                
                // Horizontal accent strip
                imagefilledrectangle(
                    $image,
                    20,
                    $height / 2 - 10,
                    $width - 20,
                    $height / 2 + 10,
                    $accentRGB
                );
                break;
                
            case 4: // Simple modern design for smaller airports
                // Gradient-like background with horizontal bands
                $bands = 5;
                $bandHeight = $height / $bands;
                
                for ($i = 0; $i < $bands; $i++) {
                    $intensity = 0.5 + (0.5 * ($i / $bands));
                    $r = (int)($primaryColor[0] * $intensity);
                    $g = (int)($primaryColor[1] * $intensity);
                    $b = (int)($primaryColor[2] * $intensity);
                    $bandColor = imagecolorallocate($image, $r, $g, $b);
                    
                    imagefilledrectangle(
                        $image,
                        0,
                        $i * $bandHeight,
                        $width,
                        ($i + 1) * $bandHeight,
                        $bandColor
                    );
                }
                
                // Simple icon - airplane silhouette
                $planeSize = $width * 0.15;
                $planeX = $width - $planeSize - 20;
                $planeY = 20;
                
                // Airplane shape
                $planePoints = [
                    $planeX, $planeY + $planeSize / 2,
                    $planeX + $planeSize * 0.8, $planeY + $planeSize / 2,
                    $planeX + $planeSize, $planeY + $planeSize * 0.3,
                    $planeX + $planeSize * 0.8, $planeY,
                    $planeX + $planeSize * 0.6, $planeY,
                    $planeX + $planeSize * 0.5, $planeY + $planeSize * 0.3,
                    $planeX, $planeY + $planeSize * 0.3,
                ];
                imagefilledpolygon($image, $planePoints, 7, $white);
                break;
        }
        
        // Add airport code (prominently displayed)
        $code = $airport['iata_code'];
        $codeSize = 5; // GD built-in font size (1-5)
        $codeWidth = strlen($code) * imagefontwidth($codeSize) * 1.5;
        $codeX = ($width - $codeWidth) / 2;
        $codeY = $height * 0.3;
        
        // Determine text color based on background
        $textColor = ($designVariation == 2) ? $white : $darkGray;
        
        // Add code with shadow for better readability
        imagestring($image, $codeSize, $codeX + 2, $codeY + 2, $code, $darkGray);
        imagestring($image, $codeSize, $codeX, $codeY, $code, $textColor);
        
        // Add city name
        $city = $airport['city'];
        $citySize = 4; // GD built-in font size (1-5)
        $cityWidth = strlen($city) * imagefontwidth($citySize);
        $cityX = ($width - $cityWidth) / 2;
        $cityY = $codeY + 40;
        
        // Add city with shadow
        imagestring($image, $citySize, $cityX + 1, $cityY + 1, $city, $darkGray);
        imagestring($image, $citySize, $cityX, $cityY, $city, $textColor);
        
        // Add country name
        $country = $airport['country'];
        $countrySize = 3; // GD built-in font size (1-5)
        $countryWidth = strlen($country) * imagefontwidth($countrySize);
        $countryX = ($width - $countryWidth) / 2;
        $countryY = $cityY + 25;
        
        // Add country with shadow
        imagestring($image, $countrySize, $countryX + 1, $countryY + 1, $country, $darkGray);
        imagestring($image, $countrySize, $countryX, $countryY, $country, $textColor);
        
        // Add airport name (at the bottom, smaller)
        $name = $airport['name'];
        $nameSize = 2; // GD built-in font size (1-5)
        
        // Split name if too long
        $maxWidth = $width - 40; // Leave 20px margin on each side
        $name = wordwrap($name, 40, "\n", false);
        $lines = explode("\n", $name);
        
        $lineHeight = 16;
        $startY = $countryY + 30;
        
        // Add each line of the airport name
        foreach ($lines as $i => $line) {
            $lineWidth = strlen($line) * imagefontwidth($nameSize);
            $lineX = ($width - $lineWidth) / 2;
            $lineY = $startY + ($i * $lineHeight);
            
            // Add text with shadow
            imagestring($image, $nameSize, $lineX + 1, $lineY + 1, $line, $darkGray);
            imagestring($image, $nameSize, $lineX, $lineY, $line, $textColor);
        }
        
        // Save image with high quality
        $result = imagepng($image, $outputFile, 1); // 1 = high quality (less compression)
        imagedestroy($image);
        
        return $result;
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

    /**
     * Draw a rounded rectangle
     * 
     * @param resource $image GD image resource
     * @param int $x1 Top left x coordinate
     * @param int $y1 Top left y coordinate
     * @param int $x2 Bottom right x coordinate
     * @param int $y2 Bottom right y coordinate
     * @param int $radius Corner radius
     * @param int $color Color identifier from imagecolorallocate
     * @param bool $filled Whether to fill the rectangle
     */
    protected function imageRoundedRectangle($image, $x1, $y1, $x2, $y2, $radius, $color, $filled = false) {
        // Draw the rectangle without corners
        if ($filled) {
            imagefilledrectangle($image, $x1 + $radius, $y1, $x2 - $radius, $y2, $color);
            imagefilledrectangle($image, $x1, $y1 + $radius, $x2, $y2 - $radius, $color);
        } else {
            imageline($image, $x1 + $radius, $y1, $x2 - $radius, $y1, $color);
            imageline($image, $x1 + $radius, $y2, $x2 - $radius, $y2, $color);
            imageline($image, $x1, $y1 + $radius, $x1, $y2 - $radius, $color);
            imageline($image, $x2, $y1 + $radius, $x2, $y2 - $radius, $color);
        }
        
        // Draw the corners
        if ($filled) {
            imagefilledarc($image, $x1 + $radius, $y1 + $radius, $radius * 2, $radius * 2, 180, 270, $color, IMG_ARC_PIE);
            imagefilledarc($image, $x2 - $radius, $y1 + $radius, $radius * 2, $radius * 2, 270, 360, $color, IMG_ARC_PIE);
            imagefilledarc($image, $x1 + $radius, $y2 - $radius, $radius * 2, $radius * 2, 90, 180, $color, IMG_ARC_PIE);
            imagefilledarc($image, $x2 - $radius, $y2 - $radius, $radius * 2, $radius * 2, 0, 90, $color, IMG_ARC_PIE);
        } else {
            imagearc($image, $x1 + $radius, $y1 + $radius, $radius * 2, $radius * 2, 180, 270, $color);
            imagearc($image, $x2 - $radius, $y1 + $radius, $radius * 2, $radius * 2, 270, 360, $color);
            imagearc($image, $x1 + $radius, $y2 - $radius, $radius * 2, $radius * 2, 90, 180, $color);
            imagearc($image, $x2 - $radius, $y2 - $radius, $radius * 2, $radius * 2, 0, 90, $color);
        }
    }
}
