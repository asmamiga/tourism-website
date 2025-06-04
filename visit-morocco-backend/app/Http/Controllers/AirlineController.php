<?php

namespace App\Http\Controllers;

use App\Models\Airline;
use Illuminate\Support\Facades\Storage;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class AirlineController extends Controller
{
    public function index()
    {
        $airlines = Airline::all();

        $airlines->each(function ($airline) {
            $airline->logo = $airline->logo
                ? asset('storage/' . $airline->logo)
                : null; // Handle null logos gracefully
        });

        return $airlines;
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'code' => 'required|unique:airlines',
            'name' => 'required',
            'logo' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg,webp',
        ]);

        if ($request->hasFile('logo')) {
            $logoPath = $request->file('logo')->store('airlines-logos', 'public');
        } else {
            $logoPath = null;
        }

        Airline::create([
            'code' => $validated['code'],
            'name' => $validated['name'],
            'logo' => $logoPath,
        ]);

        return response()->json(['message' => 'Airline created successfully!'], 201);
    }


    public function show($id)
    {
        $airline = Airline::findOrFail($id);
        $airline->logo = $airline->logo ? asset('storage/' . $airline->logo) : null;
        return $airline;
    }

    public function update(Request $request, $id)
    {
        try {
            $airline = Airline::findOrFail($id);

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
                'code' => 'required|unique:airlines,code,' . $id,
                'name' => 'required',
                'logo' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg,webp|max:2048',
            ]);

            $data = [
                'code' => $validated['code'],
                'name' => $validated['name'],
            ];

            // Handle the logo file upload
            if ($request->hasFile('logo')) {
                // Delete old logo if exists
                if ($airline->logo && Storage::disk('public')->exists($airline->logo)) {
                    Storage::disk('public')->delete($airline->logo);
                }

                // Store new logo
                $logoPath = $request->file('logo')->store('airlines-logos', 'public');
                $data['logo'] = $logoPath;
            }
            // Handle logo removal
            elseif ($request->has('logo') &&
                    ($request->input('logo') === null || $request->input('logo') === 'null' || $request->input('logo') === '')) {
                if ($airline->logo && Storage::disk('public')->exists($airline->logo)) {
                    Storage::disk('public')->delete($airline->logo);
                }
                $data['logo'] = null;
            }

            // Update the airline
            $airline->update($data);
            $airline->refresh();

            // Return full URL for logo
            $airline->logo = $airline->logo ? asset('storage/' . $airline->logo) : null;

            return response()->json([
                'message' => 'Airline updated successfully',
                'airline' => $airline
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
        Airline::findOrFail($id)->delete();
        return response()->noContent();
    }
}
