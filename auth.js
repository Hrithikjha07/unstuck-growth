document.addEventListener('DOMContentLoaded', function() {
    // Handle Signup Form
    const signupForm = document.getElementById('entrepreneur-signup-form');
    if (signupForm) {
        initSignupForm();
    }
    
    // Handle Login Form
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        initLoginForm();
    }
    
    // Handle Contact Form
    const contactForm = document.querySelector('form.contact-form:not(#login-form):not(#entrepreneur-signup-form)');
    if (contactForm) {
        initContactForm(contactForm);
    }
    
    // FAQ Toggle Functionality (moved from entrepreneur-signup.html)
    const faqItems = document.querySelectorAll('.faq-item');
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        if (question) {
            question.addEventListener('click', function() {
                // Toggle active state
                item.classList.toggle('active');
                
                // Update icon
                const icon = this.querySelector('.toggle-icon i');
                if (icon) {
                    if (item.classList.contains('active')) {
                        icon.classList.remove('fa-plus');
                        icon.classList.add('fa-minus');
                    } else {
                        icon.classList.remove('fa-minus');
                        icon.classList.add('fa-plus');
                    }
                }
            });
        }
    });
    
    // Check if user is already logged in
    checkAuthStatus();
});

// Initialize Signup Form
function initSignupForm() {
    const form = document.getElementById('entrepreneur-signup-form');
    const errorDiv = document.getElementById('signup-error');
    const successDiv = document.getElementById('signup-success');
    
    // Add password strength meter
    const passwordInput = document.getElementById('password');
    if (passwordInput) {
        // Create password strength elements
        const strengthMeterContainer = document.createElement('div');
        strengthMeterContainer.className = 'password-strength';
        strengthMeterContainer.style.display = 'none';
        
        const strengthMeter = document.createElement('div');
        strengthMeter.className = 'strength-meter';
        
        const strengthMeterFill = document.createElement('div');
        strengthMeterFill.className = 'strength-meter-fill';
        
        const strengthText = document.createElement('div');
        strengthText.className = 'strength-text';
        strengthText.innerHTML = 'Password strength: <span id="strength-text">Very Weak</span>';
        
        // Append elements
        strengthMeter.appendChild(strengthMeterFill);
        strengthMeterContainer.appendChild(strengthMeter);
        strengthMeterContainer.appendChild(strengthText);
        
        // Add after password input
        passwordInput.parentNode.insertBefore(strengthMeterContainer, passwordInput.nextSibling);
        
        // Add event listener for password input
        passwordInput.addEventListener('input', function() {
            const password = this.value;
            
            if (password.length > 0) {
                strengthMeterContainer.style.display = 'block';
                
                // Calculate password strength
                let strength = 0;
                
                // Length check (8+ characters)
                if (password.length >= 8) strength += 1;
                
                // Lowercase letter check
                if (/[a-z]/.test(password)) strength += 1;
                
                // Uppercase letter check
                if (/[A-Z]/.test(password)) strength += 1;
                
                // Number check
                if (/[0-9]/.test(password)) strength += 1;
                
                // Special character check
                if (/[^A-Za-z0-9]/.test(password)) strength += 1;
                
                // Update UI based on strength
                strengthMeterFill.className = 'strength-meter-fill';
                const strengthTextSpan = document.getElementById('strength-text');
                
                switch(strength) {
                    case 1:
                        strengthMeterFill.style.width = '20%';
                        strengthMeterFill.style.backgroundColor = '#ff4d4d';
                        strengthTextSpan.textContent = 'Very Weak';
                        break;
                    case 2:
                        strengthMeterFill.style.width = '40%';
                        strengthMeterFill.style.backgroundColor = '#ffa64d';
                        strengthTextSpan.textContent = 'Weak';
                        break;
                    case 3:
                        strengthMeterFill.style.width = '60%';
                        strengthMeterFill.style.backgroundColor = '#ffff4d';
                        strengthTextSpan.textContent = 'Medium';
                        break;
                    case 4:
                        strengthMeterFill.style.width = '80%';
                        strengthMeterFill.style.backgroundColor = '#4dd24d';
                        strengthTextSpan.textContent = 'Strong';
                        break;
                    case 5:
                        strengthMeterFill.style.width = '100%';
                        strengthMeterFill.style.backgroundColor = '#33cc33';
                        strengthTextSpan.textContent = 'Very Strong';
                        break;
                    default:
                        strengthMeterFill.style.width = '20%';
                        strengthMeterFill.style.backgroundColor = '#ff4d4d';
                        strengthTextSpan.textContent = 'Very Weak';
                }
            } else {
                strengthMeterContainer.style.display = 'none';
            }
        });
    }
    
    // Prevent duplicate form submissions
    let isSubmitting = false;
    
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // If already submitting, prevent duplicate submissions
        if (isSubmitting) {
            return;
        }
        
        // Clear previous error messages
        errorDiv.style.display = 'none';
        errorDiv.textContent = '';
        
        // Client-side validation
        const fullName = document.getElementById('full-name').value.trim();
        const email = document.getElementById('email').value.trim();
        const phone = document.getElementById('phone').value.trim();
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirm-password').value;
        const terms = document.getElementById('terms').checked;
        
        // Validate required fields
        if (!fullName || !email || !phone || !password || !confirmPassword) {
            errorDiv.textContent = 'Please fill in all required fields';
            errorDiv.style.display = 'block';
            return;
        }
        
        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            errorDiv.textContent = 'Please enter a valid email address';
            errorDiv.style.display = 'block';
            return;
        }
        
        // Validate phone format
        const phoneRegex = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/;
        if (!phoneRegex.test(phone)) {
            errorDiv.textContent = 'Please enter a valid phone number';
            errorDiv.style.display = 'block';
            return;
        }
        
        // Password validation
        if (password !== confirmPassword) {
            errorDiv.textContent = 'Passwords do not match. Please try again.';
            errorDiv.style.display = 'block';
            return;
        }
        
        // Validate password strength
        const hasLowercase = /[a-z]/.test(password);
        const hasUppercase = /[A-Z]/.test(password);
        const hasNumber = /[0-9]/.test(password);
        const hasSpecial = /[^A-Za-z0-9]/.test(password);
        const isLongEnough = password.length >= 8;
        
        if (!isLongEnough || !hasLowercase || !hasUppercase || !hasNumber || !hasSpecial) {
            errorDiv.textContent = 'Password must be at least 8 characters long and include lowercase, uppercase, number, and special character';
            errorDiv.style.display = 'block';
            return;
        }
        
        // Validate terms
        if (!terms) {
            errorDiv.textContent = 'You must agree to the Terms of Service and Privacy Policy.';
            errorDiv.style.display = 'block';
            return;
        }
        
        // Mark as submitting to prevent duplicates
        isSubmitting = true;
        
        // Show loading state
        const submitButton = this.querySelector('button[type="submit"]');
        const originalButtonText = submitButton.textContent;
        submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creating Account...';
        submitButton.disabled = true;
        
        // Collect form data
        const formData = {
            fullName: document.getElementById('full-name').value,
            email: document.getElementById('email').value,
            phone: document.getElementById('phone').value,
            password: document.getElementById('password').value,
            age: document.getElementById('age').value,
            businessStage: document.getElementById('business-stage').value,
            industry: document.getElementById('industry').value,
            goals: document.getElementById('goals').value,
            challenges: document.getElementById('challenges').value,
            referral: document.getElementById('referral').value,
            newsletter: document.getElementById('newsletter').checked,
            terms: document.getElementById('terms').checked
        };
        
        // Submit data to API
        fetch('/api/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        })
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                // Show error message
                errorDiv.textContent = data.error;
                errorDiv.style.display = 'block';
                submitButton.textContent = originalButtonText;
                submitButton.disabled = false;
                isSubmitting = false;
            } else {
                // Save token to localStorage
                localStorage.setItem('authToken', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
                
                // Show notification status
                let notificationStatus = '';
                if (data.notificationResults) {
                    if (data.notificationResults.emailSent) {
                        notificationStatus += '✓ Email notification sent<br>';
                    }
                    if (data.notificationResults.whatsappSent) {
                        notificationStatus += '✓ WhatsApp notification sent';
                    }
                }
                
                // Show success message
                const formContainer = document.querySelector('.contact-form-container');
                formContainer.innerHTML = `
                    <div class="success-message">
                        <i class="fas fa-check-circle"></i>
                        <h3>Account Created Successfully!</h3>
                        <p>Welcome to The Unstuck Growth Young Entrepreneurs community, ${data.user.fullName}! Check your email for confirmation and next steps.</p>
                        ${notificationStatus ? `<p class="notification-status">${notificationStatus}</p>` : ''}
                        <a href="index.html" class="btn primary" title="Return to Homepage">Return to Homepage</a>
                    </div>
                `;
                
                // Scroll to success message
                formContainer.scrollIntoView({ behavior: 'smooth' });
            }
        })
        .catch(error => {
            console.error('Error:', error);
            errorDiv.textContent = 'An unexpected error occurred. Please try again later.';
            errorDiv.style.display = 'block';
            submitButton.textContent = originalButtonText;
            submitButton.disabled = false;
            isSubmitting = false;
        });
    });
}

// Initialize Login Form
function initLoginForm() {
    const form = document.getElementById('login-form');
    const errorDiv = document.getElementById('login-error');
    const successDiv = document.getElementById('login-success');
    
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Clear previous error messages
        errorDiv.style.display = 'none';
        errorDiv.textContent = '';
        
        // Show loading state
        const submitButton = this.querySelector('button[type="submit"]');
        const originalButtonText = submitButton.textContent;
        submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Logging In...';
        submitButton.disabled = true;
        
        // Collect form data
        const formData = {
            email: document.getElementById('email').value,
            password: document.getElementById('password').value
        };
        
        // Submit data to API
        fetch('/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        })
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                // Show error message
                errorDiv.textContent = data.error;
                errorDiv.style.display = 'block';
                submitButton.textContent = originalButtonText;
                submitButton.disabled = false;
            } else {
                // Save token to localStorage
                localStorage.setItem('authToken', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
                
                // Show success message
                successDiv.textContent = 'Login successful! Redirecting...';
                successDiv.style.display = 'block';
                
                // Redirect to dashboard instead of homepage
                setTimeout(() => {
                    window.location.href = 'dashboard.html';
                }, 1500);
            }
        })
        .catch(error => {
            console.error('Error:', error);
            errorDiv.textContent = 'An unexpected error occurred. Please try again later.';
            errorDiv.style.display = 'block';
            submitButton.textContent = originalButtonText;
            submitButton.disabled = false;
        });
    });
    
    // Forgot password link
    const forgotPasswordLink = document.getElementById('forgot-password-link');
    if (forgotPasswordLink) {
        forgotPasswordLink.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Hide login form and show forgot password form
            document.getElementById('login-form').style.display = 'none';
            document.getElementById('forgot-password-form').style.display = 'block';
            
            // Clear any previous messages
            document.getElementById('login-error').style.display = 'none';
            document.getElementById('login-success').style.display = 'none';
        });
    }
    
    // Back to login button
    const backToLoginBtn = document.getElementById('back-to-login');
    if (backToLoginBtn) {
        backToLoginBtn.addEventListener('click', function() {
            // Hide forgot password form and show login form
            document.getElementById('forgot-password-form').style.display = 'none';
            document.getElementById('login-form').style.display = 'block';
            
            // Clear any previous messages
            document.getElementById('reset-error').style.display = 'none';
            document.getElementById('reset-success').style.display = 'none';
        });
    }
    
    // Forgot password form submission
    const forgotPasswordForm = document.getElementById('forgot-password-form');
    if (forgotPasswordForm) {
        forgotPasswordForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const resetErrorDiv = document.getElementById('reset-error');
            const resetSuccessDiv = document.getElementById('reset-success');
            
            // Clear previous messages
            resetErrorDiv.style.display = 'none';
            resetSuccessDiv.style.display = 'none';
            
            // Show loading state
            const submitButton = this.querySelector('button[type="submit"]');
            const originalButtonText = submitButton.textContent;
            submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
            submitButton.disabled = true;
            
            // Get email
            const email = document.getElementById('reset-email').value;
            
            // Submit to API
            fetch('/api/request-password-reset', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email })
            })
            .then(response => response.json())
            .then(data => {
                if (data.error) {
                    // Show error message
                    resetErrorDiv.textContent = data.error;
                    resetErrorDiv.style.display = 'block';
                    submitButton.textContent = originalButtonText;
                    submitButton.disabled = false;
                } else {
                    // Show success message
                    resetSuccessDiv.textContent = data.message || 'If an account with that email exists, a password reset link has been sent';
                    resetSuccessDiv.style.display = 'block';
                    
                    // Disable form fields
                    document.getElementById('reset-email').disabled = true;
                    submitButton.disabled = true;
                }
            })
            .catch(error => {
                console.error('Error:', error);
                resetErrorDiv.textContent = 'An unexpected error occurred. Please try again later.';
                resetErrorDiv.style.display = 'block';
                submitButton.textContent = originalButtonText;
                submitButton.disabled = false;
            });
        });
    }
}

// Initialize Contact Form
function initContactForm(form) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'alert-box error';
    errorDiv.style.display = 'none';
    form.appendChild(errorDiv);
    
    const successDiv = document.createElement('div');
    successDiv.className = 'alert-box success';
    successDiv.style.display = 'none';
    form.appendChild(successDiv);
    
    // Prevent duplicate form submissions
    let isSubmitting = false;
    
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // If already submitting, prevent duplicate submissions
        if (isSubmitting) {
            return;
        }
        
        // Clear previous messages
        errorDiv.style.display = 'none';
        errorDiv.textContent = '';
        successDiv.style.display = 'none';
        
        // Mark as submitting to prevent duplicates
        isSubmitting = true;
        
        // Show loading state
        const submitButton = this.querySelector('button[type="submit"]');
        const originalButtonText = submitButton.textContent;
        submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
        submitButton.disabled = true;
        
        // Build form data
        const formData = {};
        const formElements = form.elements;
        
        for (let i = 0; i < formElements.length; i++) {
            const element = formElements[i];
            if (element.name && element.name !== 'submit') {
                formData[element.name] = element.value;
            }
        }
        
        // Make sure we have the minimum required fields
        if (!formData.fullName && form.querySelector('[name="name"]')) {
            formData.fullName = form.querySelector('[name="name"]').value;
        }
        
        if (!formData.message && form.querySelector('[name="inquiry"]')) {
            formData.message = form.querySelector('[name="inquiry"]').value;
        }
        
        // Submit data to API
        fetch('/api/contact', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        })
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                // Show error message
                errorDiv.textContent = data.error;
                errorDiv.style.display = 'block';
            } else {
                // Show notification status
                let notificationStatus = '';
                if (data.notificationResults) {
                    if (data.notificationResults.emailSent) {
                        notificationStatus += ' Email notification sent.';
                    }
                    if (data.notificationResults.whatsappSent) {
                        notificationStatus += ' WhatsApp notification sent.';
                    }
                }
                
                // Show success message
                successDiv.innerHTML = `Thank you for your message! We will get back to you shortly.${notificationStatus}`;
                successDiv.style.display = 'block';
                
                // Reset form
                form.reset();
            }
            
            // Restore button
            submitButton.textContent = originalButtonText;
            submitButton.disabled = false;
            isSubmitting = false;
        })
        .catch(error => {
            console.error('Error:', error);
            errorDiv.textContent = 'An unexpected error occurred. Please try again later.';
            errorDiv.style.display = 'block';
            submitButton.textContent = originalButtonText;
            submitButton.disabled = false;
            isSubmitting = false;
        });
    });
}

// Check Authentication Status
function checkAuthStatus() {
    const authToken = localStorage.getItem('authToken');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    
    if (authToken) {
        // User is logged in
        updateNavForLoggedInUser(user);
    }
}

// Update Navigation for Logged In User
function updateNavForLoggedInUser(user) {
    // Create profile/logout elements
    const navLinks = document.querySelector('.nav-links');
    if (!navLinks) return;
    
    // Check if we've already updated the nav
    if (document.getElementById('user-profile-link')) return;
    
    // Remove any existing login/signup links
    const loginLinks = navLinks.querySelectorAll('a[href="login.html"], a[href="entrepreneur-signup.html"]');
    loginLinks.forEach(link => link.remove());
    
    // Create profile link
    const profileLink = document.createElement('a');
    profileLink.href = '#';
    profileLink.id = 'user-profile-link';
    profileLink.textContent = user.fullName || 'My Profile';
    navLinks.appendChild(profileLink);
    
    // Create logout link
    const logoutLink = document.createElement('a');
    logoutLink.href = '#';
    logoutLink.id = 'logout-link';
    logoutLink.textContent = 'Logout';
    logoutLink.addEventListener('click', function(e) {
        e.preventDefault();
        
        // Clear authentication data
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        
        // Refresh the page
        window.location.reload();
    });
    navLinks.appendChild(logoutLink);
    
    // Handle profile click
    profileLink.addEventListener('click', function(e) {
        e.preventDefault();
        
        // Implement user profile functionality
        // For now, just show a simple alert
        alert(`Hello, ${user.fullName}! Profile functionality coming soon.`);
    });
} 