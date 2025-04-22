document.addEventListener('DOMContentLoaded', function() {
    // Check if user is logged in
    const authToken = localStorage.getItem('authToken');
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    
    if (!authToken || !userData) {
        // Redirect to login if not logged in
        window.location.href = 'login.html';
        return;
    }
    
    // Load user data into dashboard
    loadUserData(userData);
    
    // Initialize tab navigation
    initTabs();
    
    // Initialize sidebar navigation
    initSidebarNav();
    
    // Fetch additional user data from API
    fetchUserProfile();
    
    // Initialize settings forms
    initAccountSettingsForm();
    initPasswordChangeForm();
    
    // Set up logout functionality
    document.getElementById('logout-link').addEventListener('click', function(e) {
        e.preventDefault();
        logout();
    });
});

// Load basic user data from localStorage
function loadUserData(userData) {
    document.getElementById('user-name').textContent = userData.fullName || 'User';
    document.getElementById('user-email').textContent = userData.email || '';
    document.getElementById('welcome-name').textContent = (userData.fullName || 'User').split(' ')[0];
    
    // Format last login date if available
    if (userData.lastLogin) {
        const date = new Date(userData.lastLogin);
        document.getElementById('last-login').textContent = date.toLocaleString();
    } else {
        document.getElementById('last-login').textContent = 'First login';
    }
    
    // Pre-populate settings form
    if (document.getElementById('settings-name')) {
        document.getElementById('settings-name').value = userData.fullName || '';
    }
    if (document.getElementById('settings-email')) {
        document.getElementById('settings-email').value = userData.email || '';
    }
}

// Initialize tab navigation
function initTabs() {
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove active class from all buttons and content
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            
            // Add active class to clicked button and corresponding content
            button.classList.add('active');
            const tabId = button.getAttribute('data-tab');
            document.getElementById(tabId).classList.add('active');
            
            // Update sidebar nav to match selected tab
            updateSidebarNav(tabId);
        });
    });
}

// Initialize sidebar navigation
function initSidebarNav() {
    const navLinks = document.querySelectorAll('.sidebar-menu a');
    
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Remove active class from all links
            navLinks.forEach(navLink => navLink.classList.remove('active'));
            
            // Add active class to clicked link
            link.classList.add('active');
            
            // Get the href attribute and activate corresponding tab
            const tabId = link.getAttribute('href').substring(1); // Remove # from href
            activateTab(tabId);
        });
    });
}

// Activate tab by ID
function activateTab(tabId) {
    const tabMapping = {
        'overview': 'tab-overview',
        'profile': 'tab-profile',
        'resources': 'tab-resources',
        'messages': 'tab-messages',
        'settings': 'tab-settings'
    };
    
    const tabContentId = tabMapping[tabId];
    if (tabContentId) {
        // Activate tab button
        const tabButtons = document.querySelectorAll('.tab-button');
        tabButtons.forEach(btn => {
            if (btn.getAttribute('data-tab') === tabContentId) {
                btn.click();
            }
        });
    }
}

// Update sidebar nav based on active tab
function updateSidebarNav(tabContentId) {
    const mapping = {
        'tab-overview': 'nav-overview',
        'tab-profile': 'nav-profile',
        'tab-resources': 'nav-resources',
        'tab-messages': 'nav-messages',
        'tab-settings': 'nav-settings'
    };
    
    const navLinks = document.querySelectorAll('.sidebar-menu a');
    navLinks.forEach(link => link.classList.remove('active'));
    
    const navId = mapping[tabContentId];
    if (navId) {
        document.getElementById(navId).classList.add('active');
    }
}

// Fetch user profile from API
function fetchUserProfile() {
    const authToken = localStorage.getItem('authToken');
    if (!authToken) return;
    
    fetch('/api/user-profile', {
        headers: {
            'Authorization': `Bearer ${authToken}`
        }
    })
    .then(response => {
        if (!response.ok) {
            if (response.status === 401 || response.status === 403) {
                // Token expired or invalid, redirect to login
                logout();
                return;
            }
            throw new Error('Failed to fetch user profile');
        }
        return response.json();
    })
    .then(data => {
        if (data && data.user) {
            // Update profile tab with user data
            updateProfileTab(data.user);
            
            // Update settings form
            updateSettingsForm(data.user);
            
            // Store updated user data in localStorage
            localStorage.setItem('user', JSON.stringify(data.user));
        }
    })
    .catch(error => {
        console.error('Error fetching profile:', error);
    });
}

// Update profile tab with user data
function updateProfileTab(user) {
    const profileDetailsEl = document.getElementById('profile-details');
    if (!profileDetailsEl) return;
    
    // Format user info for display
    const businessStage = formatBusinessStage(user.businessStage);
    const industry = formatIndustry(user.industry);
    
    const profileHTML = `
        <div class="profile-section">
            <h4>Personal Information</h4>
            <p><strong>Name:</strong> ${user.fullName || 'Not provided'}</p>
            <p><strong>Email:</strong> ${user.email || 'Not provided'}</p>
            <p><strong>Phone:</strong> ${user.phone || 'Not provided'}</p>
            <p><strong>Age Range:</strong> ${formatAge(user.age) || 'Not provided'}</p>
        </div>
        
        <div class="profile-section">
            <h4>Business Information</h4>
            <p><strong>Business Stage:</strong> ${businessStage || 'Not provided'}</p>
            <p><strong>Industry:</strong> ${industry || 'Not provided'}</p>
        </div>
        
        <div class="profile-section">
            <h4>Goals and Challenges</h4>
            <p><strong>Goals:</strong> ${user.goals || 'Not provided'}</p>
            <p><strong>Challenges:</strong> ${user.challenges || 'Not provided'}</p>
        </div>
    `;
    
    profileDetailsEl.innerHTML = profileHTML;
}

// Format business stage for display
function formatBusinessStage(stage) {
    if (!stage) return '';
    
    const stages = {
        'idea': 'Idea Stage',
        'planning': 'Planning Phase',
        'early-startup': 'Early-stage Startup',
        'growing': 'Growing Business',
        'established': 'Established Business',
        'none': 'No Business Yet'
    };
    
    return stages[stage] || stage;
}

// Format industry for display
function formatIndustry(industry) {
    if (!industry) return '';
    
    const industries = {
        'technology': 'Technology/Software',
        'ecommerce': 'E-Commerce',
        'health': 'Health/Wellness',
        'education': 'Education',
        'finance': 'Finance/FinTech',
        'media': 'Media/Entertainment',
        'food': 'Food/Beverage',
        'service': 'Professional Services',
        'manufacturing': 'Manufacturing',
        'other': 'Other'
    };
    
    return industries[industry] || industry;
}

// Format age range for display
function formatAge(age) {
    if (!age) return '';
    
    const ages = {
        'under-18': 'Under 18',
        '18-24': '18-24',
        '25-34': '25-34',
        '35-44': '35-44',
        '45+': '45+'
    };
    
    return ages[age] || age;
}

// Update settings form with user data
function updateSettingsForm(user) {
    const nameInput = document.getElementById('settings-name');
    const emailInput = document.getElementById('settings-email');
    const phoneInput = document.getElementById('settings-phone');
    const newsletterCheckbox = document.getElementById('settings-newsletter');
    
    if (nameInput) nameInput.value = user.fullName || '';
    if (emailInput) emailInput.value = user.email || '';
    if (phoneInput) phoneInput.value = user.phone || '';
    if (newsletterCheckbox) newsletterCheckbox.checked = user.newsletter || false;
}

// Initialize account settings form
function initAccountSettingsForm() {
    const form = document.getElementById('account-settings-form');
    if (!form) return;
    
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // TODO: Implement API call to update user settings
        alert('Account settings update functionality coming soon!');
    });
}

// Initialize password change form
function initPasswordChangeForm() {
    const form = document.getElementById('change-password-form');
    if (!form) return;
    
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const currentPassword = document.getElementById('current-password').value;
        const newPassword = document.getElementById('new-password').value;
        const confirmPassword = document.getElementById('confirm-password').value;
        
        // Validate passwords match
        if (newPassword !== confirmPassword) {
            alert('New passwords do not match!');
            return;
        }
        
        // TODO: Implement API call to change password
        alert('Password change functionality coming soon!');
    });
}

// Logout user
function logout() {
    // Clear auth data
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    
    // Redirect to login page
    window.location.href = 'login.html';
} 