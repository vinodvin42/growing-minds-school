# Growing Minds English School - Shared Hosting Deployment Guide

## Files Overview

Your website consists of:
- HTML files (index.html, admissions.html, etc.)
- CSS files (assets/css/style.css)
- JavaScript files (assets/js/)
- PHP form handler (submit-admission.php)

## Deployment Steps for GoDaddy/Hosting Raja Shared Hosting

### Step 1: Prepare Files

1. Download/copy all files from `/app/html-website/` folder
2. Your folder structure should look like:
   ```
   public_html/
   ├── index.html
   ├── admissions.html
   ├── about.html (if created)
   ├── news.html (if created)
   ├── contact.html (if created)
   ├── submit-admission.php
   └── assets/
       ├── css/
       │   └── style.css
       └── js/
           ├── main.js
           └── admission-form.js
   ```

### Step 2: Configure Email in PHP File

1. Open `submit-admission.php`
2. Update line 3-4:
   ```php
   define('ADMIN_EMAIL', 'growingminds2025@gmail.com'); // Your email
   define('FROM_EMAIL', 'noreply@yourdomain.com'); // Your domain email
   ```

**Important:** Replace `noreply@yourdomain.com` with an email from your domain (e.g., `info@growingminds.com` or `noreply@growingminds.com`)

### Step 3: Upload to Hosting

#### Using cPanel File Manager:

1. Login to your cPanel (provided by Hosting Raja)
2. Go to **File Manager**
3. Navigate to `public_html` folder
4. Click **Upload** button
5. Upload all your website files
6. Maintain the folder structure (assets folder with css and js subfolders)

#### Using FTP (FileZilla):

1. Download FileZilla from https://filezilla-project.org/
2. Get FTP credentials from Hosting Raja:
   - Host: ftp.yourdomain.com
   - Username: (provided by hosting)
   - Password: (provided by hosting)
3. Connect to FTP
4. Upload all files to `public_html` folder

### Step 4: Set File Permissions

1. In cPanel File Manager, right-click `submit-admission.php`
2. Click **Change Permissions**
3. Set to **644** (Owner: Read+Write, Group: Read, World: Read)
4. Click **Change Permissions**

### Step 5: Test the Website

1. Visit your domain: `http://yourdomain.com`
2. Navigate to Admissions page
3. Fill the form with test data
4. Submit and check if email arrives at `growingminds2025@gmail.com`

## Email Configuration (Important!)

### Option 1: Use Domain Email (Recommended)

Create an email account with your domain:
1. In cPanel, go to **Email Accounts**
2. Create: `info@yourdomain.com` or `noreply@yourdomain.com`
3. Update `FROM_EMAIL` in `submit-admission.php`

### Option 2: Configure SMTP (If mail() doesn't work)

If PHP mail() function doesn't work, you may need to use SMTP. Ask Hosting Raja support:
- SMTP server details
- Port (usually 587 or 465)
- Authentication required?

## Troubleshooting

### Problem: Form submits but no email received

**Solution 1:** Check spam folder

**Solution 2:** Enable PHP error reporting
- Add to top of `submit-admission.php`:
  ```php
  ini_set('display_errors', 1);
  error_reporting(E_ALL);
  ```

**Solution 3:** Check PHP mail logs
- In cPanel → **Error Logs**

**Solution 4:** Contact Hosting Raja support
- Ask: "Is PHP mail() function enabled on my account?"
- Ask for SMTP configuration if mail() is disabled

### Problem: File upload fails

**Solution:** Check PHP upload limits
1. Create file: `phpinfo.php` with content:
   ```php
   <?php phpinfo(); ?>
   ```
2. Upload to public_html
3. Visit: `yourdomain.com/phpinfo.php`
4. Check:
   - `upload_max_filesize` (should be at least 10M)
   - `post_max_size` (should be at least 50M)
   - `max_file_uploads` (should be at least 20)

5. If limits are too low, create `.htaccess` file:
   ```
   php_value upload_max_filesize 10M
   php_value post_max_size 50M
   php_value max_file_uploads 20
   php_value max_execution_time 300
   ```

6. Delete `phpinfo.php` after checking (security)

### Problem: CSS/JS not loading

**Solution:** Check file paths
- All CSS/JS paths should be relative: `assets/css/style.css`
- Not absolute: `/assets/css/style.css`

### Problem: Images not showing

**Solution:** 
- Check image URLs in HTML files
- Make sure external image URLs (WordPress, Unsplash) are accessible
- For local images, upload to `assets/images/` folder

## Domain Configuration

### If using subdomain (e.g., school.yourdomain.com):

1. In cPanel → **Subdomains**
2. Create subdomain: `school`
3. Document root: `public_html/school`
4. Upload files to `/public_html/school/` instead

### If using primary domain:

- Upload directly to `public_html/`
- index.html will be your homepage

## Security Recommendations

1. **Add .htaccess for security:**
   ```
   # Disable directory browsing
   Options -Indexes
   
   # Protect PHP files from direct access
   <FilesMatch "\.(php)$">
       Order Allow,Deny
       Deny from all
   </FilesMatch>
   
   # Allow only submit-admission.php
   <Files "submit-admission.php">
       Allow from all
   </Files>
   ```

2. **Backup regularly:**
   - Download website files weekly
   - Keep backup of database (if you add one later)

3. **Update email credentials:**
   - Don't hardcode passwords in PHP
   - Use environment variables or config files

## Post-Deployment Checklist

- [ ] Website loads at your domain
- [ ] All pages accessible (Home, About, Admissions, etc.)
- [ ] Images display correctly
- [ ] Navigation menu works
- [ ] Carousel auto-plays
- [ ] Admission form opens
- [ ] Form validation works
- [ ] File uploads accepted
- [ ] Form submission successful
- [ ] Email received at admin email
- [ ] Email contains all form data
- [ ] All attachments received in email
- [ ] Mobile responsive design works
- [ ] Contact information correct

## Support Contacts

**Hosting Support:**
- Hosting Raja Support: https://hostingraja.in/support/
- GoDaddy Support: https://www.godaddy.com/help

**Website Issues:**
- Email: growingminds2025@gmail.com
- Phone: +91 97685 32431

## Additional Notes

- Keep a copy of all files on your computer
- Take screenshots of cPanel settings
- Document any custom configurations
- Save FTP credentials securely
- Regular backups prevent data loss

---

**Your website is now ready to deploy!** 🚀

Simply upload the files and configure the email settings as described above.