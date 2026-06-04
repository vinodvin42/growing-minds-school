<?php
// Contact Form Handler
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit();
}

try {
    // Validate required fields
    $required = ['name', 'email', 'phone', 'subject', 'message'];
    foreach ($required as $field) {
        if (empty($_POST[$field])) {
            throw new Exception("Field $field is required");
        }
    }
    
    // Sanitize inputs
    $name = htmlspecialchars(trim($_POST['name']));
    $email = filter_var($_POST['email'], FILTER_SANITIZE_EMAIL);
    $phone = htmlspecialchars(trim($_POST['phone']));
    $subject = htmlspecialchars(trim($_POST['subject']));
    $message = htmlspecialchars(trim($_POST['message']));
    
    // Validate email
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        throw new Exception('Invalid email address');
    }
    
    // Admin email
    $to = 'growingminds2025@gmail.com';
    $email_subject = "Contact Form: " . $subject;
    
    // Email headers
    $headers = "From: Growing Minds <noreply@yourdomain.com>\r\n";
    $headers .= "Reply-To: " . $email . "\r\n";
    $headers .= "MIME-Version: 1.0\r\n";
    $headers .= "Content-Type: text/html; charset=UTF-8\r\n";
    
    // Email body
    $email_body = "
    <html>
    <body style='font-family: Arial, sans-serif; line-height: 1.6; color: #333;'>
        <div style='max-width: 600px; margin: 0 auto; padding: 20px;'>
            <h2 style='color: #FF8C00; border-bottom: 3px solid #AACC00; padding-bottom: 10px;'>
                New Contact Form Submission
            </h2>
            <table style='width: 100%; border-collapse: collapse; margin-top: 20px;'>
                <tr>
                    <td style='padding: 10px; border-bottom: 1px solid #ddd;'><strong>Name:</strong></td>
                    <td style='padding: 10px; border-bottom: 1px solid #ddd;'>$name</td>
                </tr>
                <tr>
                    <td style='padding: 10px; border-bottom: 1px solid #ddd;'><strong>Email:</strong></td>
                    <td style='padding: 10px; border-bottom: 1px solid #ddd;'>$email</td>
                </tr>
                <tr>
                    <td style='padding: 10px; border-bottom: 1px solid #ddd;'><strong>Phone:</strong></td>
                    <td style='padding: 10px; border-bottom: 1px solid #ddd;'>$phone</td>
                </tr>
                <tr>
                    <td style='padding: 10px; border-bottom: 1px solid #ddd;'><strong>Subject:</strong></td>
                    <td style='padding: 10px; border-bottom: 1px solid #ddd;'>$subject</td>
                </tr>
            </table>
            <div style='margin-top: 20px; padding: 15px; background-color: #f9f9f9; border-left: 4px solid #AACC00;'>
                <h3 style='margin-top: 0;'>Message:</h3>
                <p style='white-space: pre-wrap;'>$message</p>
            </div>
            <div style='margin-top: 30px; padding-top: 20px; border-top: 2px solid #ddd; text-align: center; color: #888; font-size: 12px;'>
                <p>This message was sent through the Growing Minds English School website contact form.</p>
                <p>&copy; 2026 Growing Minds English School. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>";
    
    // Send email
    if (mail($to, $email_subject, $email_body, $headers)) {
        echo json_encode([
            'success' => true,
            'message' => 'Thank you for contacting us! We will get back to you shortly.'
        ]);
    } else {
        throw new Exception('Failed to send email. Please try again.');
    }
    
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
?>