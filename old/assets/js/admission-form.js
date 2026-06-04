// Form submission handler for PHP backend
const form = document.getElementById('admissionForm');
const submitBtn = document.getElementById('submitBtn');
const submitText = document.getElementById('submitText');
const submitSpinner = document.getElementById('submitSpinner');
const formMessage = document.getElementById('formMessage');

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Show loading state
    submitText.classList.add('d-none');
    submitSpinner.classList.remove('d-none');
    submitBtn.disabled = true;
    formMessage.classList.add('d-none');
    
    // Create FormData object
    const formData = new FormData(form);
    
    try {
        // Submit to PHP script
        const response = await fetch('submit-admission.php', {
            method: 'POST',
            body: formData
        });
        
        const result = await response.json();
        
        if (response.ok && result.success) {
            // Success message
            formMessage.className = 'alert alert-success';
            formMessage.innerHTML = '<i class="fas fa-check-circle me-2"></i>' + 
                (result.message || 'Application submitted successfully! Our admission team will contact you shortly.');
            formMessage.classList.remove('d-none');
            
            // Reset form
            form.reset();
            
            // Scroll to message
            formMessage.scrollIntoView({ behavior: 'smooth', block: 'center' });
        } else {
            // Error message
            formMessage.className = 'alert alert-danger';
            formMessage.innerHTML = '<i class="fas fa-exclamation-triangle me-2"></i>' + 
                (result.message || 'Submission failed. Please check your information and try again.');
            formMessage.classList.remove('d-none');
            formMessage.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    } catch (error) {
        console.error('Form submission error:', error);
        formMessage.className = 'alert alert-danger';
        formMessage.innerHTML = '<i class="fas fa-exclamation-triangle me-2"></i>' + 
            'Unable to submit application. Please check your internet connection and try again, or contact us directly at +91 97685 32431.';
        formMessage.classList.remove('d-none');
        formMessage.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } finally {
        // Reset button state
        submitText.classList.remove('d-none');
        submitSpinner.classList.add('d-none');
        submitBtn.disabled = false;
    }
});

// File input validation
const fileInputs = form.querySelectorAll('input[type="file"]');
fileInputs.forEach(input => {
    input.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            // Check file size (5MB limit)
            if (file.size > 5 * 1024 * 1024) {
                alert('File size must be less than 5MB');
                e.target.value = '';
                return;
            }
            
            // Check file type
            const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
            if (!allowedTypes.includes(file.type)) {
                alert('Only PDF, JPG, and PNG files are allowed');
                e.target.value = '';
                return;
            }
            
            // Show file name
            const label = e.target.parentElement.querySelector('label');
            if (label) {
                label.innerHTML = label.innerHTML.split('<small>')[0] + 
                    '<small class="d-block text-success mt-1"><i class="fas fa-check"></i> ' + file.name + '</small>';
            }
        }
    });
});