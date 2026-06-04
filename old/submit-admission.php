<?php
// Configuration
define('ADMIN_EMAIL', 'growingminds2025@gmail.com');
define('FROM_EMAIL', 'noreply@yourdomain.com'); // Change to your domain email
define('FROM_NAME', 'Growing Minds English School');
define('MAX_FILE_SIZE', 5 * 1024 * 1024); // 5MB

// CORS headers for local testing
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

// Handle preflight request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Only accept POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit();
}

try {
    // Validate required fields
    $required_fields = ['studentName', 'dateOfBirth', 'gender', 'applyingForStandard', 
                       'fatherName', 'motherName', 'fatherContact', 'motherContact',
                       'currentAddress', 'permanentAddress'];
    
    foreach ($required_fields as $field) {
        if (empty($_POST[$field])) {
            throw new Exception("Field $field is required");
        }
    }
    
    // Sanitize inputs
    $studentName = htmlspecialchars($_POST['studentName']);
    $dateOfBirth = htmlspecialchars($_POST['dateOfBirth']);
    $gender = htmlspecialchars($_POST['gender']);
    $applyingForStandard = htmlspecialchars($_POST['applyingForStandard']);
    $fatherName = htmlspecialchars($_POST['fatherName']);
    $motherName = htmlspecialchars($_POST['motherName']);
    $fatherContact = htmlspecialchars($_POST['fatherContact']);
    $motherContact = htmlspecialchars($_POST['motherContact']);
    $currentAddress = htmlspecialchars($_POST['currentAddress']);
    $permanentAddress = htmlspecialchars($_POST['permanentAddress']);
    $siblingName = htmlspecialchars($_POST['siblingName'] ?? '');
    $siblingSchool = htmlspecialchars($_POST['siblingSchool'] ?? '');
    $siblingStandard = htmlspecialchars($_POST['siblingStandard'] ?? '');
    
    // Validate and process file uploads
    $required_files = ['birthCertificate', 'studentPhoto', 'studentAadhaar', 
                      'fatherAadhaar', 'fatherPhoto', 'motherAadhaar', 
                      'motherPhoto', 'electricityBill'];
    
    $attachments = [];
    $allowed_types = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
    
    foreach ($required_files as $file_field) {
        if (!isset($_FILES[$file_field]) || $_FILES[$file_field]['error'] === UPLOAD_ERR_NO_FILE) {
            throw new Exception("File $file_field is required");
        }
        
        $file = $_FILES[$file_field];
        
        // Check for upload errors
        if ($file['error'] !== UPLOAD_ERR_OK) {
            throw new Exception("Error uploading $file_field");
        }
        
        // Validate file size
        if ($file['size'] > MAX_FILE_SIZE) {
            throw new Exception("File $file_field exceeds 5MB limit");
        }
        
        // Validate file type
        $finfo = finfo_open(FILEINFO_MIME_TYPE);
        $mime_type = finfo_file($finfo, $file['tmp_name']);
        finfo_close($finfo);
        
        if (!in_array($mime_type, $allowed_types)) {
            throw new Exception("File $file_field has invalid type. Only PDF, JPG, and PNG allowed.");
        }
        
        $attachments[] = [
            'name' => $file['name'],
            'tmp_name' => $file['tmp_name'],
            'type' => $mime_type
        ];
    }
    
    // Optional: previousTC for 2nd-8th standard
    if (isset($_FILES['previousTC']) && $_FILES['previousTC']['error'] === UPLOAD_ERR_OK) {
        $file = $_FILES['previousTC'];
        if ($file['size'] <= MAX_FILE_SIZE) {
            $attachments[] = [
                'name' => $file['name'],
                'tmp_name' => $file['tmp_name'],
                'type' => $file['type']
            ];
        }
    }
    
    // Generate unique boundary for multipart email
    $boundary = md5(time());
    
    // Email headers
    $headers = "From: " . FROM_NAME . " <" . FROM_EMAIL . ">\r\n";
    $headers .= "Reply-To: " . FROM_EMAIL . "\r\n";
    $headers .= "MIME-Version: 1.0\r\n";
    $headers .= "Content-Type: multipart/mixed; boundary=\"" . $boundary . "\"\r\n";
    
    // Email subject
    $subject = "New Admission Application - " . $studentName;
    
    // Email body (HTML)
    $sibling_section = '';
    if (!empty($siblingName)) {
        $sibling_section = "
        <h3 style='color: #FF8C00; margin-top: 30px;'>SIBLING DETAILS</h3>
        <table style='width: 100%; border-collapse: collapse;'>
            <tr>
                <td style='padding: 8px; border-bottom: 1px solid #ddd;'><strong>Sibling Name:</strong></td>
                <td style='padding: 8px; border-bottom: 1px solid #ddd;'>$siblingName</td>
            </tr>
            <tr>
                <td style='padding: 8px; border-bottom: 1px solid #ddd;'><strong>Sibling School:</strong></td>
                <td style='padding: 8px; border-bottom: 1px solid #ddd;'>$siblingSchool</td>
            </tr>
            <tr>
                <td style='padding: 8px; border-bottom: 1px solid #ddd;'><strong>Sibling Standard:</strong></td>
                <td style='padding: 8px; border-bottom: 1px solid #ddd;'>$siblingStandard</td>
            </tr>
        </table>";
    }
    
    $html_body = "
    <html>
    <body style='font-family: Arial, sans-serif; line-height: 1.6; color: #333;'>
        <div style='max-width: 800px; margin: 0 auto; padding: 20px;'>
            <h2 style='color: #FF8C00; border-bottom: 3px solid #AACC00; padding-bottom: 10px;'>
                New Admission Application Received
            </h2>
            
            <h3 style='color: #FF8C00; margin-top: 30px;'>STUDENT DETAILS</h3>
            <table style='width: 100%; border-collapse: collapse;'>
                <tr>
                    <td style='padding: 8px; border-bottom: 1px solid #ddd;'><strong>Name:</strong></td>
                    <td style='padding: 8px; border-bottom: 1px solid #ddd;'>$studentName</td>
                </tr>
                <tr>
                    <td style='padding: 8px; border-bottom: 1px solid #ddd;'><strong>Date of Birth:</strong></td>
                    <td style='padding: 8px; border-bottom: 1px solid #ddd;'>$dateOfBirth</td>
                </tr>
                <tr>
                    <td style='padding: 8px; border-bottom: 1px solid #ddd;'><strong>Gender:</strong></td>
                    <td style='padding: 8px; border-bottom: 1px solid #ddd;'>" . ucfirst($gender) . "</td>
                </tr>
                <tr>
                    <td style='padding: 8px; border-bottom: 1px solid #ddd;'><strong>Applying for Standard:</strong></td>
                    <td style='padding: 8px; border-bottom: 1px solid #ddd;'>$applyingForStandard</td>
                </tr>
            </table>
            
            <h3 style='color: #FF8C00; margin-top: 30px;'>PARENT DETAILS</h3>
            <table style='width: 100%; border-collapse: collapse;'>
                <tr>
                    <td style='padding: 8px; border-bottom: 1px solid #ddd;'><strong>Father's Name:</strong></td>
                    <td style='padding: 8px; border-bottom: 1px solid #ddd;'>$fatherName</td>
                </tr>
                <tr>
                    <td style='padding: 8px; border-bottom: 1px solid #ddd;'><strong>Father's Contact:</strong></td>
                    <td style='padding: 8px; border-bottom: 1px solid #ddd;'>$fatherContact</td>
                </tr>
                <tr>
                    <td style='padding: 8px; border-bottom: 1px solid #ddd;'><strong>Mother's Name:</strong></td>
                    <td style='padding: 8px; border-bottom: 1px solid #ddd;'>$motherName</td>
                </tr>
                <tr>
                    <td style='padding: 8px; border-bottom: 1px solid #ddd;'><strong>Mother's Contact:</strong></td>
                    <td style='padding: 8px; border-bottom: 1px solid #ddd;'>$motherContact</td>
                </tr>
            </table>
            
            <h3 style='color: #FF8C00; margin-top: 30px;'>ADDRESS DETAILS</h3>
            <table style='width: 100%; border-collapse: collapse;'>
                <tr>
                    <td style='padding: 8px; border-bottom: 1px solid #ddd;'><strong>Current Address:</strong></td>
                    <td style='padding: 8px; border-bottom: 1px solid #ddd;'>$currentAddress</td>
                </tr>
                <tr>
                    <td style='padding: 8px; border-bottom: 1px solid #ddd;'><strong>Permanent Address:</strong></td>
                    <td style='padding: 8px; border-bottom: 1px solid #ddd;'>$permanentAddress</td>
                </tr>
            </table>
            
            $sibling_section
            
            <div style='margin-top: 30px; padding: 15px; background-color: #f0f0f0; border-left: 4px solid #AACC00;'>
                <p style='margin: 0;'><strong>All required documents are attached to this email.</strong></p>
                <p style='margin: 5px 0 0 0; font-size: 14px; color: #666;'>Total attachments: " . count($attachments) . "</p>
            </div>
            
            <div style='margin-top: 30px; padding-top: 20px; border-top: 2px solid #ddd; text-align: center; color: #888; font-size: 12px;'>
                <p>This application was submitted through the Growing Minds English School website.</p>
                <p>&copy; 2026 Growing Minds English School. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>";
    
    // Build multipart message
    $message = "--" . $boundary . "\r\n";
    $message .= "Content-Type: text/html; charset=UTF-8\r\n";
    $message .= "Content-Transfer-Encoding: 7bit\r\n\r\n";
    $message .= $html_body . "\r\n";
    
    // Add attachments
    foreach ($attachments as $attachment) {
        $file_content = chunk_split(base64_encode(file_get_contents($attachment['tmp_name'])));
        
        $message .= "--" . $boundary . "\r\n";
        $message .= "Content-Type: " . $attachment['type'] . "; name=\"" . $attachment['name'] . "\"\r\n";
        $message .= "Content-Disposition: attachment; filename=\"" . $attachment['name'] . "\"\r\n";
        $message .= "Content-Transfer-Encoding: base64\r\n\r\n";
        $message .= $file_content . "\r\n";
    }
    
    $message .= "--" . $boundary . "--";
    
    // Send email
    if (mail(ADMIN_EMAIL, $subject, $message, $headers)) {
        echo json_encode([
            'success' => true,
            'message' => 'Thank you for applying! Our admission team will contact you shortly.',
            'submission_id' => uniqid('ADM-', true)
        ]);
    } else {
        throw new Exception('Failed to send email. Please try again or contact us directly.');
    }
    
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
?>