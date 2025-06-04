<?php

namespace App\Http\Controllers;

use App\Models\Airport;
use Illuminate\Support\Facades\Storage;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class AirportController extends Controller
{
    public function index()
    {
        $airports = Airport::all();

        $airports->each(function ($airport) {
            $airport->image = $airport->image
                ? asset('storage/' . $airport->image)
                : null; // Handle null images gracefully
        });

        return $airports;
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'iata_code' => 'required|unique:airports',
            'name' => 'required',
            'city' => 'required',
            'country' => 'required',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg,webp',
        ]);

        if ($request->hasFile('image')) {
            $imagePath = $request->file('image')->store('airport-images', 'public');
        } else {
            $imagePath = null;
        }

        Airport::create([
            'iata_code' => $validated['iata_code'],
            'name' => $validated['name'],
            'city' => $validated['city'],
            'country' => $validated['country'],
            'image' => $imagePath,
        ]);

        return response()->json(['message' => 'Airport created successfully!'], 201);
    }

    public function show($id)
    {
        $airport = Airport::findOrFail($id);
        $airport->image = $airport->image? asset('storage/' . $airport->image) : null;
        return $airport;
    }

    public function update(Request $request, $id)
{
    try {
        $airport = Airport::findOrFail($id);

        // Parse PUT form-data if necessary
        if ($request->isMethod('PUT')) {
            $putData = $request->getContent();
            if (strpos($request->header('Content-Type'), 'multipart/form-data') !== false) {
                // Get the boundary
                preg_match('/boundary=(.*)$/', $request->header('Content-Type'), $matches);
                $boundary = $matches[1];

                // Parse the multipart form data manually
                $parts = array_slice(explode('--' . $boundary, $putData), 1, -1);
                $data = [];

                foreach ($parts as $part) {
                    // If this is the file content
                    if (strpos($part, 'filename') !== false) {
                        preg_match('/name="([^"]+)"; filename="([^"]+)"/i', $part, $matches);
                        $fieldName = $matches[1];

                        // Get file content
                        $fileContent = substr($part, strpos($part, "\r\n\r\n") + 4, -2);

                        // Create temporary file
                        $tmpfname = tempnam(sys_get_temp_dir(), 'put_');
                        file_put_contents($tmpfname, $fileContent);

                        // Create UploadedFile instance
                        $file = new \Illuminate\Http\UploadedFile(
                            $tmpfname,
                            $matches[2],
                            mime_content_type($tmpfname),
                            null,
                            true
                        );

                        $request->files->set($fieldName, $file);
                    }
                    // If this is regular form data
                    else {
                        preg_match('/name="([^"]+)"/i', $part, $matches);
                        if (isset($matches[1])) {
                            $fieldName = $matches[1];
                            $value = substr($part, strpos($part, "\r\n\r\n") + 4, -2);
                            $data[$fieldName] = $value;
                        }
                    }
                }

                $request->merge($data);
            }
        }

        // Validate the input
        $validated = $request->validate([
            'iata_code' => 'required|unique:airports,iata_code,' . $id,
            'name' => 'required',
            'city' => 'required',
            'country' => 'required',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg,webp|max:2048',
        ]);

        $data = [
            'iata_code' => $validated['iata_code'],
            'name' => $validated['name'],
            'city' => $validated['city'],
            'country' => $validated['country'],
        ];

        // Handle the image file upload
        if ($request->hasFile('image')) {
            // Delete old image if exists
            if ($airport->image && Storage::disk('public')->exists($airport->image)) {
                Storage::disk('public')->delete($airport->image);
            }

            // Store new image
            $imagePath = $request->file('image')->store('airport-images', 'public');
            $data['image'] = $imagePath;
        }
        // Handle image removal
        elseif ($request->has('image') &&
                ($request->input('image') === null || $request->input('image') === 'null' || $request->input('image') === '')) {
            if ($airport->image && Storage::disk('public')->exists($airport->image)) {
                Storage::disk('public')->delete($airport->image);
            }
            $data['image'] = null;
        }

        // Update the airport record
        $airport->update($data);
        $airport->refresh();

        // Return the updated airport with the full storage link
        $airport->image = $airport->image ? asset('storage/' . $airport->image) : null;

        return response()->json([
            'message' => 'Airport updated successfully',
            'airport' => $airport
        ]);

    } catch (\Exception $e) {
        Log::error('Update failed', [
            'id' => $id,
            'error' => $e->getMessage()
        ]);

        return response()->json([
            'message' => 'Update failed',
            'error' => $e->getMessage()
        ], 500);
    }
}

    public function destroy($id)
    {
        Airport::findOrFail($id)->delete();
        return response()->noContent();
    }
}
