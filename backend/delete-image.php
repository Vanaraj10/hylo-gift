<?php
// delete-image.php - Server-side Cloudinary image deletion
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// Only allow POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

// Configuration - Replace with your actual Cloudinary credentials
$CLOUDINARY_CLOUD_NAME = 'dqfsza8e6';
$CLOUDINARY_API_KEY = 'YOUR_API_KEY';        // Replace with your actual API key
$CLOUDINARY_API_SECRET = 'YOUR_API_SECRET';  // Replace with your actual API secret

// Get input data
$input = json_decode(file_get_contents('php://input'), true);
$imageUrl = $input['imageUrl'] ?? '';

if (empty($imageUrl)) {
    http_response_code(400);
    echo json_encode(['error' => 'Image URL is required']);
    exit;
}

// Extract public ID from Cloudinary URL
function extractPublicId($url) {
    if (!$url || strpos($url, 'cloudinary.com') === false) {
        return null;
    }
    
    $parsedUrl = parse_url($url);
    $pathParts = explode('/', $parsedUrl['path']);
    
    // Find the part after 'upload'
    $uploadIndex = array_search('upload', $pathParts);
    if ($uploadIndex === false) return null;
    
    // Get the filename (last part of the path)
    $filename = end($pathParts);
    
    // Remove file extension if present
    $publicId = pathinfo($filename, PATHINFO_FILENAME);
    
    return $publicId;
}

$publicId = extractPublicId($imageUrl);

if (!$publicId) {
    http_response_code(400);
    echo json_encode(['error' => 'Could not extract public ID from URL']);
    exit;
}

// Prepare the deletion request
$timestamp = time();
$params = [
    'public_id' => $publicId,
    'timestamp' => $timestamp,
    'api_key' => $CLOUDINARY_API_KEY
];

// Create signature
$signatureString = http_build_query($params) . $CLOUDINARY_API_SECRET;
$signature = sha1($signatureString);
$params['signature'] = $signature;

// Make the deletion request to Cloudinary
$url = "https://api.cloudinary.com/v1_1/{$CLOUDINARY_CLOUD_NAME}/image/destroy";

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($params));
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/x-www-form-urlencoded'
]);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($httpCode === 200) {
    $result = json_decode($response, true);
    if ($result['result'] === 'ok') {
        echo json_encode(['success' => true, 'message' => 'Image deleted successfully']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Image deletion failed', 'details' => $result]);
    }
} else {
    http_response_code($httpCode);
    echo json_encode(['error' => 'Failed to delete image', 'details' => $response]);
}
?>
