# Growing Minds English School - README

## Project Overview

This is a complete static website for Growing Minds English School built with HTML, CSS (Bootstrap 5), and PHP for form handling. The website is designed to work on shared hosting (GoDaddy, Hosting Raja, etc.) without requiring a Python backend.

## Features

✅ Fully responsive design (mobile, tablet, desktop)
✅ Bootstrap 5 framework
✅ Image carousel with auto-play
✅ Programs section by age groups
✅ Teacher profiles with photos
✅ Parent testimonials
✅ Photo gallery
✅ Working admission form with file uploads
✅ Email notifications with attachments
✅ Form validation (client & server-side)
✅ Playful child-friendly design
✅ Orange & lime green color theme

## File Structure

```
html-website/
├── index.html              # Homepage
├── admissions.html         # Admission form page
├── about.html             # About us page (to be created)
├── news.html              # News & events (to be created)
├── contact.html           # Contact page (to be created)
├── submit-admission.php   # Form handler (PHP)
├── assets/
│   ├── css/
│   │   └── style.css     # Custom styles
│   ├── js/
│   │   ├── main.js       # Main JavaScript
│   │   └── admission-form.js  # Form handling
│   └── images/           # (Create this for local images)
├── DEPLOYMENT-GUIDE.md   # Deployment instructions
└── README.md            # This file
```

## Technologies Used

- **HTML5** - Structure
- **CSS3** - Styling
- **Bootstrap 5.3** - Responsive framework
- **Font Awesome 6.4** - Icons
- **JavaScript (Vanilla)** - Interactivity
- **PHP 7.4+** - Form processing

## Requirements

### For Development:
- Web browser (Chrome, Firefox, Safari, Edge)
- Text editor (VS Code, Sublime Text, Notepad++)
- Local server (XAMPP, WAMP, or MAMP) for testing PHP

### For Production:
- Shared hosting with PHP support (GoDaddy, Hosting Raja, etc.)
- cPanel access or FTP credentials
- Domain name
- Email account from your domain

## Local Setup (Testing)

### Using XAMPP (Windows/Mac/Linux):

1. **Download & Install XAMPP:**
   - Download from: https://www.apachefriends.org/
   - Install and start Apache server

2. **Copy Files:**
   ```
   Copy html-website folder to:
   Windows: C:\xampp\htdocs\growing-minds
   Mac/Linux: /opt/lampp/htdocs/growing-minds
   ```

3. **Access Website:**
   - Open browser
   - Visit: `http://localhost/growing-minds/`

4. **Configure Email:**
   - Open `submit-admission.php`
   - Update email addresses (lines 3-4)

5. **Test Form:**
   - Go to Admissions page
   - Fill form with test data
   - Submit and check email

## Production Deployment

See **DEPLOYMENT-GUIDE.md** for detailed deployment instructions.

### Quick Steps:

1. Upload all files to `public_html/` folder via cPanel or FTP
2. Update email settings in `submit-admission.php`
3. Set file permissions (644 for PHP files)
4. Test the website and form submission

## Configuration

### Email Configuration

Edit `submit-admission.php` (lines 3-5):

```php
define('ADMIN_EMAIL', 'growingminds2025@gmail.com');  // Where to receive applications
define('FROM_EMAIL', 'info@yourdomain.com');          // Sender email (use your domain)
define('FROM_NAME', 'Growing Minds English School');  // Sender name
```

### File Upload Limits

Current limit: 5MB per file

To change, edit `submit-admission.php` (line 6):
```php
define('MAX_FILE_SIZE', 10 * 1024 * 1024); // 10MB
```

## Form Fields

### Student Details:
- Full Name *
- Date of Birth *
- Gender *
- Applying for Standard *

### Student Documents:
- Birth Certificate * (PDF/JPG/PNG)
- Photograph * (JPG/PNG)
- Aadhaar Card * (PDF/JPG/PNG)
- Previous School TC/LC (PDF/JPG/PNG, for 2nd-8th only)

### Parent Details:
- Father's Name *
- Mother's Name *
- Father's Contact *
- Mother's Contact *

### Parent Documents:
- Father's Aadhaar Card * (PDF/JPG/PNG)
- Father's Photograph * (JPG/PNG)
- Mother's Aadhaar Card * (PDF/JPG/PNG)
- Mother's Photograph * (JPG/PNG)

### Address Details:
- Current Address *
- Electricity Bill * (PDF/JPG/PNG)
- Permanent Address *

### Sibling Details (Optional):
- Sibling Name
- Sibling School
- Sibling Standard

*Required fields

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Opera (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Customization

### Change Colors:

Edit `assets/css/style.css` (lines 2-4):
```css
:root {
    --orange: #FF8C00;  /* Your orange color */
    --lime: #AACC00;    /* Your lime color */
    --orange-light: #FFE5CC;
}
```

### Add/Update Content:

1. **Homepage:** Edit `index.html`
2. **Admission Form:** Edit `admissions.html`
3. **Styles:** Edit `assets/css/style.css`
4. **JavaScript:** Edit `assets/js/main.js` or `admission-form.js`

### Add More Pages:

Create new HTML files following the same structure:
1. Copy `index.html`
2. Rename (e.g., `about.html`)
3. Update content
4. Update navigation links in all pages

## Security Features

✅ Input sanitization (PHP)
✅ File type validation
✅ File size limits
✅ XSS protection
✅ MIME type checking
✅ Form CSRF protection (recommended to add)

## Troubleshooting

### Form not submitting:
- Check PHP is enabled on hosting
- Verify file permissions (644)
- Check browser console for JavaScript errors
- Test with smaller files first

### Email not received:
- Check spam folder
- Verify FROM_EMAIL is from your domain
- Check PHP error logs in cPanel
- Contact hosting support about mail() function

### Images not loading:
- Check image URLs are correct
- Verify images are uploaded
- Check file permissions
- Use browser dev tools to inspect errors

## Support & Contact

**School Contact:**
- Email: growingminds2025@gmail.com
- Phone: +91 97685 32431
- Address: Shop No. D1, Plot No. 17, Malwani Ashwamegh CHS LTD., RSC 08, Mhada, Malwani, Malad West, Mumbai - 400095

## License

© 2026 Growing Minds English School. All rights reserved.

## Credits

- Bootstrap 5: https://getbootstrap.com/
- Font Awesome: https://fontawesome.com/
- Images: School photos and Unsplash

---

**Website is ready to deploy!** 🎉

Follow the DEPLOYMENT-GUIDE.md for step-by-step deployment instructions.