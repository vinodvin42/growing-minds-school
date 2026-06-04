// Contact Form Handler
const contactForm = document.getElementById('contactForm');
const contactSubmitBtn = document.getElementById('contactSubmitBtn');
const contactSubmitText = document.getElementById('contactSubmitText');
const contactSubmitSpinner = document.getElementById('contactSubmitSpinner');
const contactMessage = document.getElementById('contactMessage');

if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Show loading state
        contactSubmitText.classList.add('d-none');
        contactSubmitSpinner.classList.remove('d-none');
        contactSubmitBtn.disabled = true;
        contactMessage.classList.add('d-none');
        
        // Get form data
        const formData = new FormData(contactForm);
        
        try {
            // Submit to PHP script
            const response = await fetch('submit-contact.php', {
                method: 'POST',
                body: formData
            });
            
            const result = await response.json();
            
            if (response.ok && result.success) {
                // Success message
                contactMessage.className = 'alert alert-success';
                contactMessage.innerHTML = '<i class="fas fa-check-circle me-2"></i>' + result.message;
                contactMessage.classList.remove('d-none');
                
                // Reset form
                contactForm.reset();
            } else {
                // Error message
                contactMessage.className = 'alert alert-danger';
                contactMessage.innerHTML = '<i class="fas fa-exclamation-triangle me-2"></i>' + 
                    (result.message || 'Failed to send message. Please try again.');
                contactMessage.classList.remove('d-none');
            }
            
            // Scroll to message
            contactMessage.scrollIntoView({ behavior: 'smooth', block: 'center' });
            
        } catch (error) {
            console.error('Contact form error:', error);
            contactMessage.className = 'alert alert-danger';
            contactMessage.innerHTML = '<i class="fas fa-exclamation-triangle me-2"></i>' + 
                'Unable to send message. Please call us at +91 97685 32431 or email growingminds2025@gmail.com';
            contactMessage.classList.remove('d-none');
        } finally {
            // Reset button state
            contactSubmitText.classList.remove('d-none');
            contactSubmitSpinner.classList.add('d-none');
            contactSubmitBtn.disabled = false;
        }
    });
}