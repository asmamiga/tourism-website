<?php

namespace App\Http\Controllers;

use App\Models\PromoCode;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Carbon\Carbon;

class PromoCodeController extends Controller
{
    // Existing methods remain unchanged...
    public function index()
    {
        $promoCodes = PromoCode::all();

        return response()->json([
            'status' => 'success',
            'data' => $promoCodes
        ]);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'code' => 'required|string|unique:promo_codes',
            'discount_type' => 'required|in:percentage,fixed',
            'discount' => 'required|integer',
            'valid_until' => 'required|date',
            'is_used' => 'boolean'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $promoCode = PromoCode::create($validator->validated());

        return response()->json([
            'status' => 'success',
            'message' => 'Promo code created successfully',
            'data' => $promoCode
        ], 201);
    }

    public function show($id)
    {
        $promoCode = PromoCode::find($id);

        if (!$promoCode) {
            return response()->json([
                'status' => 'error',
                'message' => 'Promo code not found'
            ], 404);
        }

        return response()->json([
            'status' => 'success',
            'data' => $promoCode
        ]);
    }

    public function update(Request $request, $id)
    {
        $promoCode = PromoCode::find($id);

        if (!$promoCode) {
            return response()->json([
                'status' => 'error',
                'message' => 'Promo code not found'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'code' => 'string|unique:promo_codes,code,' . $id,
            'discount_type' => 'in:percentage,fixed',
            'discount' => 'integer',
            'valid_until' => 'date',
            'is_used' => 'boolean'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $promoCode->update($validator->validated());

        return response()->json([
            'status' => 'success',
            'message' => 'Promo code updated successfully',
            'data' => $promoCode->fresh()
        ]);
    }

    public function destroy($id)
    {
        $promoCode = PromoCode::find($id);

        if (!$promoCode) {
            return response()->json([
                'status' => 'error',
                'message' => 'Promo code not found'
            ], 404);
        }

        $promoCode->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Promo code deleted successfully'
        ]);
    }

    public function search(Request $request)
    {
        $code = $request->query('code');
        if (!$code) {
            return response()->json([
                'status' => 'error',
                'message' => 'Promo code is required'
            ], 400);
        }

        $promoCode = PromoCode::where('code', $code)->first();
        
        if (!$promoCode) {
            return response()->json([
                'status' => 'error',
                'message' => 'Promo code not found'
            ], 404);
        }
        
        // Rest of validation logic...
        
        return response()->json([
            'status' => 'success',
            'data' => $promoCode
        ]);
    }
}