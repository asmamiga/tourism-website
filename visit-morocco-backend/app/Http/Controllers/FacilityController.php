<?php

namespace App\Http\Controllers;

use App\Models\Facility;
use Illuminate\Support\Facades\Storage;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class FacilityController extends Controller
{
    public function index()
    {
        $facilities = Facility::all();

        $facilities->each(function ($facility) {
            $facility->image = $facility->image
                ? asset('storage/' . $facility->image)
                : null; // Handle null images gracefully
        });

        return $facilities;
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required',
            'description' => 'nullable',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg,webp',
        ]);

        if ($request->hasFile('image')) {
            $imagePath = $request->file('image')->store('facilities-images', 'public');
        } else {
            $imagePath = null;
        }

        Facility::create([
            'name' => $validated['name'],
            'description' => $validated['description'],
            'image' => $imagePath,
        ]);

        return response()->json(['message' => 'Facility created successfully!'], 201);
    }

    public function show($id)
    {
        $facility = Facility::findOrFail($id);
        $facility->image = $facility->image ? asset('storage/' . $facility->image) : null;
        return $facility;
    }

    public function update(Request $request, $id)
    {
        try {
            $facility = Facility::findOrFail($id);

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
                'name' => 'required',
                'description' => 'nullable',
                'image' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg,webp|max:2048',
            ]);

            $data = [
                'name' => $validated['name'],
                'description' => $validated['description'],
            ];

            // Handle the image file upload
            if ($request->hasFile('image')) {
                // Delete old image if exists
                if ($facility->image && Storage::disk('public')->exists($facility->image)) {
                    Storage::disk('public')->delete($facility->image);
                }

                // Store new image
                $imagePath = $request->file('image')->store('facilities-images', 'public');
                $data['image'] = $imagePath;
            }
            // Handle image removal
            elseif ($request->has('image') &&
                    ($request->input('image') === null || $request->input('image') === 'null' || $request->input('image') === '')) {
                if ($facility->image && Storage::disk('public')->exists($facility->image)) {
                    Storage::disk('public')->delete($facility->image);
                }
                $data['image'] = null;
            }

            // Update the facility
            $facility->update($data);
            $facility->refresh();

            // Return full URL for image
            $facility->image = $facility->image ? asset('storage/' . $facility->image) : null;

            return response()->json([
                'message' => 'Facility updated successfully',
                'facility' => $facility
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
        $facility = Facility::findOrFail($id);

        // Delete the image if it exists
        if ($facility->image && Storage::disk('public')->exists($facility->image)) {
            Storage::disk('public')->delete($facility->image);
        }

        $facility->delete();
        return response()->noContent();
    }
}
