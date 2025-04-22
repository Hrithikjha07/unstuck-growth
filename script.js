document.addEventListener('DOMContentLoaded', function() {
    // Initialize tabs
    initTabs();
    
    // Initialize service cards
    initServiceCards();
    
    // Initialize file upload functionality
    initializeFileUpload();
    
    // Set up quick contact actions for mobile
    if (window.innerWidth <= 767) {
        setupQuickContactActions();
    }
    
    // Initialize read more buttons for testimonials
    initReadMoreButtons();
    
    // Initialize smooth scroll page navigation
    initSmoothScroll();
    
    // Initialize mobile menu
    initMobileMenu();
    
    // Initialize back-to-top button
    initBackToTop();
    
    // Initialize page navigation for mobile
    initPageNavigation();
    
    // Mobile Quick Contact Banner functionality
    const mobileQuickContact = document.querySelector('.mobile-quick-contact');
    if (!mobileQuickContact) return;
    
    // Show/hide the quick contact banner based on scroll direction
    let lastScrollTop = 0;
    const scrollThreshold = 100; // Minimum scroll amount before showing/hiding
    
    window.addEventListener('scroll', function() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        // Don't do anything if we're at the top or bottom of the page
        if (scrollTop <= 0 || (window.innerHeight + scrollTop) >= document.body.offsetHeight) return;
        
        // Check if we've scrolled enough to trigger a state change
        if (Math.abs(scrollTop - lastScrollTop) > scrollThreshold) {
            if (scrollTop > lastScrollTop) {
                // Scrolling down - hide the quick contact
                mobileQuickContact.style.transform = 'translateY(100%)';
            } else {
                // Scrolling up - show the quick contact
                mobileQuickContact.style.transform = 'translateY(0)';
            }
            lastScrollTop = scrollTop;
        }
    });
    
    // Add active state for buttons on touch
    const quickActions = document.querySelectorAll('.quick-action');
    quickActions.forEach(action => {
        action.addEventListener('touchstart', function() {
            this.classList.add('active');
        });
        
        action.addEventListener('touchend', function() {
            this.classList.remove('active');
        });
        
        // Prevent getting stuck in active state if touch is moved away
        action.addEventListener('touchmove', function() {
            this.classList.remove('active');
        });
        
        // Handle click for the message action to scroll to contact form
        if (action.getAttribute('href') === '#contact') {
            action.addEventListener('click', function(e) {
                e.preventDefault();
                const contactSection = document.querySelector('#contact');
                if (contactSection) {
                    // Smooth scroll to contact section
                    contactSection.scrollIntoView({ behavior: 'smooth' });
                    
                    // Focus on the first form input after scrolling
                    setTimeout(() => {
                        const firstInput = contactSection.querySelector('input');
                        if (firstInput) firstInput.focus();
                    }, 1000);
                }
            });
        }
    });
    
    // Check if we should show the quick contact banner based on viewport size
    function checkMobileView() {
        if (window.innerWidth <= 768) {
            mobileQuickContact.style.display = 'block';
            mobileQuickContact.style.transform = 'translateY(0)';
        } else {
            mobileQuickContact.style.display = 'none';
        }
    }
    
    // Initialize on load and update on resize
    checkMobileView();
    window.addEventListener('resize', checkMobileView);
    
    // Initialize About Section Tabs
    initAboutTabs();
    
    // Initialize Knowledge Hub Tabs
    initKnowledgeHubTabs();
    
    // Initialize Persona Selection and Content Filtering
    initPersonaSelection();
});

// Initialize Tab Trigger Links
function initTabTriggers() {
    const tabTriggers = document.querySelectorAll('[data-tab-trigger]');
    
    tabTriggers.forEach(trigger => {
        trigger.addEventListener('click', function(e) {
            e.preventDefault();
            
            const tabId = this.getAttribute('data-tab-trigger');
            const tabsContainer = document.querySelector('.pricing-tabs');
            
            if (tabsContainer) {
                // Find the corresponding tab button
                const tabButton = tabsContainer.querySelector(`.tab-btn[data-tab="${tabId}"]`);
                
                if (tabButton) {
                    // Trigger a click on the tab button
                    tabButton.click();
                }
            }
        });
    });
}

// Initialize the tabs for pricing and path selection
function initTabs() {
    // Initialize Services Tabs
    initTabSystem('.services-tabs .tab-btn', 'startup');
    
    // Initialize Knowledge Hub Tabs
    initTabSystem('.knowledge-tabs .tab-btn', 'case-studies');
    
    // Initialize Client Stories Tabs
    initTabSystem('.client-stories-tabs .tab-btn', 'testimonials');
    
    // Initialize Pricing Tabs (updated for new structure)
    initTabSystem('.pricing .tab-nav .tab-btn', 'startup');
    
    // Initialize Tab Trigger Links
    initTabTriggers();
    
    // Initialize Career Advisory Path Selection
    const pathButtons = document.querySelectorAll('.path-btn');
    const pathSections = document.querySelectorAll('.path-section');
    
    if (pathButtons.length > 0 && pathSections.length > 0) {
        console.log('Path buttons found:', pathButtons.length);
        console.log('Path sections found:', pathSections.length);
        
        pathButtons.forEach(button => {
            button.addEventListener('click', function() {
                // Remove active class from all buttons and sections
                pathButtons.forEach(btn => btn.classList.remove('active'));
                pathSections.forEach(section => section.classList.remove('active'));
                
                // Add active class to clicked button
                this.classList.add('active');
                
                // Get the path from data attribute
                const path = this.getAttribute('data-path');
                console.log('Path button clicked:', path);
                
                // Find and activate the corresponding section
                const section = document.getElementById(path + '-path');
                console.log('Corresponding section found:', section ? 'Yes' : 'No', section);
                
                if (section) {
                    section.classList.add('active');
                }
            });
        });
    }
}

// Reusable tab initialization function
function initTabSystem(tabSelector, defaultTab) {
    const tabButtons = document.querySelectorAll(tabSelector);
    if (!tabButtons.length) return;
    
    let activeTab = defaultTab;
    
    // Get tab container parent
    const tabsContainer = tabButtons[0].closest('.tab-nav').parentElement;
    
    tabButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active class from all buttons
            tabButtons.forEach(b => b.classList.remove('active'));
            
            // Add active class to clicked button
            btn.classList.add('active');
            
            // Get the tab ID from data attribute
            const tabId = btn.getAttribute('data-tab');
            activeTab = tabId;
            
            // Find all tab panes in this container
            const tabPanes = tabsContainer.querySelectorAll('.tab-pane');
            
            // Hide all tab panes
            tabPanes.forEach(pane => pane.classList.remove('active'));
            
            // Show the selected tab pane
            const selectedPane = tabsContainer.querySelector(`#${tabId}-tab`);
            if (selectedPane) {
                selectedPane.classList.add('active');
            }
        });
    });
    
    // Initialize with default tab
    if (defaultTab) {
        const defaultButton = document.querySelector(`${tabSelector}[data-tab="${defaultTab}"]`);
        if (defaultButton) {
            defaultButton.click();
        }
    }
}

// Initialize Read More buttons for testimonials
function initReadMoreButtons() {
    const readMoreButtons = document.querySelectorAll('.read-more-btn');
    
    readMoreButtons.forEach(button => {
        button.addEventListener('click', function() {
            const testimonial = this.closest('.testimonial');
            testimonial.classList.toggle('expanded');
            
            if (testimonial.classList.contains('expanded')) {
                this.textContent = 'Read Less';
            } else {
                this.textContent = 'Read More';
            }
        });
    });
}

// Initialize smooth scrolling for navigation links
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Close mobile menu if open
            const navLinks = document.querySelector('.nav-links');
            if (navLinks && navLinks.classList.contains('active')) {
                navLinks.classList.remove('active');
                
                // Reset mobile menu button
                const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
                if (mobileMenuBtn) {
                    const icon = mobileMenuBtn.querySelector('i');
                    if (icon && icon.classList.contains('fa-times')) {
                        icon.classList.remove('fa-times');
                        icon.classList.add('fa-bars');
                    }
                }
            }
            
            // Get target element
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 80,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// Initialize mobile menu
function initMobileMenu() {
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');
    
    if (mobileMenuBtn && navLinks) {
        mobileMenuBtn.addEventListener('click', function() {
            navLinks.classList.toggle('active');
            
            // Toggle icon
            const icon = this.querySelector('i');
            if (icon) {
                if (icon.classList.contains('fa-bars')) {
                    icon.classList.remove('fa-bars');
                    icon.classList.add('fa-times');
                } else {
                    icon.classList.remove('fa-times');
                    icon.classList.add('fa-bars');
                }
            }
        });
    }
}

// Initialize back-to-top button
function initBackToTop() {
    const backToTopButton = document.querySelector('.back-to-top');
    
    if (backToTopButton) {
        // Show/hide button based on scroll position
        window.addEventListener('scroll', function() {
            if (window.scrollY > 300) {
                backToTopButton.classList.add('show');
            } else {
                backToTopButton.classList.remove('show');
            }
        });
        
        // Scroll to top when clicked
        backToTopButton.addEventListener('click', function(e) {
            e.preventDefault();
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }
}

// Mobile quick contact actions setup
function setupQuickContactActions() {
    const quickActions = document.querySelectorAll('.quick-actions a');
    
    quickActions.forEach(action => {
        action.addEventListener('click', function() {
            // Add active state for better touch feedback
            this.classList.add('active');
            
            setTimeout(() => {
                this.classList.remove('active');
            }, 200);
        });
    });
}

// Function for file upload handling
function initializeFileUpload() {
    const dropArea = document.getElementById('drop-area');
    const fileInput = document.getElementById('resume');
    
    if (!dropArea || !fileInput) return;
    
    // Prevent default behavior (prevent file from being opened)
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropArea.addEventListener(eventName, preventDefaults, false);
    });

    // Highlight drop area when item is dragged over it
    ['dragenter', 'dragover'].forEach(eventName => {
        dropArea.addEventListener(eventName, highlight, false);
    });

    // Unhighlight drop area when item is dragged out or dropped
    ['dragleave', 'drop'].forEach(eventName => {
        dropArea.addEventListener(eventName, unhighlight, false);
    });

    // Handle dropped files
    dropArea.addEventListener('drop', handleDrop, false);
    
    // Trigger file browser when clicked
    dropArea.addEventListener('click', function() {
        fileInput.click();
    });
    
    // Handle files from file input
    fileInput.addEventListener('change', function() {
        if (this.files.length > 0) {
            handleFiles(this.files[0]);
        }
    });
    
    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }
    
    function highlight() {
        dropArea.classList.add('highlighted');
    }
    
    function unhighlight() {
        dropArea.classList.remove('highlighted');
    }
    
    function handleDrop(e) {
        const dt = e.dataTransfer;
        const files = dt.files;
        
        if (files.length) {
            handleFiles(files[0]);
        }
    }
    
    function handleFiles(file) {
        if (validateFile(file)) {
            displayFilePreview(file);
        } else {
            alert('Please upload a valid PDF, DOC, or DOCX file under 5MB.');
        }
    }
    
    function validateFile(file) {
        // Check file type
        const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
        if (!validTypes.includes(file.type)) {
            return false;
        }
        
        // Check file size (5MB max)
        if (file.size > 5 * 1024 * 1024) {
            return false;
        }
        
        return true;
    }
    
    function displayFilePreview(file) {
        const preview = dropArea.querySelector('.file-preview');
        const fileName = preview.querySelector('.file-name');
        const filePrompt = dropArea.querySelector('.file-upload-prompt');
        
        fileName.textContent = file.name;
        preview.style.display = 'flex';
        filePrompt.style.display = 'none';
        
        const removeBtn = preview.querySelector('.remove-file');
        if (removeBtn) {
            removeBtn.addEventListener('click', function(e) {
                e.stopPropagation();
                fileInput.value = '';
                preview.style.display = 'none';
                filePrompt.style.display = 'block';
            });
        }
    }
}

// Handle Form Submission
function handleFormSubmit(e) {
    e.preventDefault();
    
    // Dismiss keyboard for mobile
    if (document.activeElement) {
        document.activeElement.blur();
    }
    
    const form = e.target;
    const formData = new FormData(form);
    
    // Simulate form submission
    console.log('Form submitted:', Object.fromEntries(formData.entries()));
    
    // Show success message
    const successMessage = document.createElement('div');
    successMessage.className = 'success-message';
    successMessage.innerHTML = `
        <i class="fas fa-check-circle"></i>
        <h3>Thank you for reaching out!</h3>
        <p>Your message has been received. We'll get back to you shortly.</p>
    `;
    
    form.innerHTML = '';
    form.appendChild(successMessage);
}

// Add event listeners for form submission
document.addEventListener('DOMContentLoaded', function() {
    const contactForm = document.getElementById('contactForm');
    const newsletterForm = document.querySelector('.footer-newsletter');
    
    if (contactForm) {
        contactForm.addEventListener('submit', handleFormSubmit);
    }
    
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', handleFormSubmit);
    }
});

// Initialize page navigation system for mobile
function initPageNavigation() {
    const sections = document.querySelectorAll('section[id]');
    const navSections = document.querySelectorAll('.nav-section');
    const navProgress = document.querySelector('.nav-progress');
    
    if (sections.length && navSections.length) {
        // Track scroll position to update active section
        window.addEventListener('scroll', function() {
            // Get current scroll position
            const scrollY = window.scrollY;
            
            // Calculate scroll progress for progress bar
            const pageHeight = document.body.scrollHeight - window.innerHeight;
            const scrollProgress = (scrollY / pageHeight) * 100;
            
            // Update progress bar width
            if (navProgress) {
                navProgress.style.width = scrollProgress + '%';
            }
            
            // Find the current section
            let currentSection = '';
            sections.forEach(section => {
                const sectionTop = section.offsetTop - 100;
                const sectionHeight = section.offsetHeight;
                
                if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
                    currentSection = section.getAttribute('id');
                }
            });
            
            // Update active nav section
            navSections.forEach(nav => {
                nav.classList.remove('active');
                
                const navSection = nav.getAttribute('data-section');
                if (navSection === currentSection || 
                    (navSection === 'home' && currentSection === '')) {
                    nav.classList.add('active');
                    
                    // Scroll the active section into view in the navigation bar
                    nav.scrollIntoView({
                        behavior: 'smooth',
                        block: 'nearest',
                        inline: 'center'
                    });
                }
            });
        });
        
        // Add click event listeners to navigation sections
        navSections.forEach(nav => {
            nav.addEventListener('click', function(e) {
                e.preventDefault();
                const targetSection = document.querySelector(this.getAttribute('href'));
                if (targetSection) {
                    window.scrollTo({
                        top: targetSection.offsetTop - 80,
                        behavior: 'smooth'
                    });
                }
            });
        });
    }
}

// Mobile Quick Contact Banner
(function() {
  const quickContactBanner = document.querySelector('.mobile-quick-contact');
  if (!quickContactBanner) return;
  
  let lastScrollTop = 0;
  let isScrolling;
  
  window.addEventListener('scroll', function() {
    clearTimeout(isScrolling);
    
    isScrolling = setTimeout(function() {
      const currentScrollTop = window.pageYOffset || document.documentElement.scrollTop;
      
      // Show banner when scrolling up, hide when scrolling down
      if (currentScrollTop > lastScrollTop && currentScrollTop > 300) {
        // Scrolling down
        quickContactBanner.classList.add('hidden');
      } else {
        // Scrolling up
        quickContactBanner.classList.remove('hidden');
      }
      
      lastScrollTop = currentScrollTop;
    }, 66);
  });
  
  // Add noopener to external links
  const calendarLink = document.querySelector('.quick-action.calendar');
  if (calendarLink && calendarLink.getAttribute('target') === '_blank') {
    calendarLink.setAttribute('rel', 'noopener');
  }
})();

// Initialize Service Cards Toggle
function initServiceCards() {
    const serviceCards = document.querySelectorAll('.service-card');
    
    if (window.innerWidth <= 767) {
        serviceCards.forEach(card => {
            const detailsList = card.querySelector('.service-details-list');
            const serviceLink = card.querySelector('.service-link');
            
            if (detailsList && serviceLink) {
                // Initially hide details on mobile
                detailsList.style.display = 'none';
                
                // Create toggle button
                const toggleBtn = document.createElement('button');
                toggleBtn.classList.add('toggle-details-btn');
                toggleBtn.innerHTML = 'Show Details <i class="fas fa-chevron-down"></i>';
                
                // Insert button before service link
                card.insertBefore(toggleBtn, serviceLink);
                
                // Add click event
                toggleBtn.addEventListener('click', function() {
                    const isHidden = detailsList.style.display === 'none';
                    detailsList.style.display = isHidden ? 'block' : 'none';
                    toggleBtn.innerHTML = isHidden 
                        ? 'Hide Details <i class="fas fa-chevron-up"></i>' 
                        : 'Show Details <i class="fas fa-chevron-down"></i>';
                });
            }
        });
    }
}

// Client Stories Tabs
document.addEventListener('DOMContentLoaded', function() {
    const tabButtons = document.querySelectorAll('.client-stories-tabs .tab-btn');
    const tabPanes = document.querySelectorAll('.client-stories-tabs .tab-pane');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remove active class from all buttons and panes
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabPanes.forEach(pane => pane.classList.remove('active'));
            
            // Add active class to current button
            this.classList.add('active');
            
            // Show the corresponding tab pane
            const tabId = this.getAttribute('data-tab');
            const tabPane = document.getElementById(tabId + '-tab');
            if (tabPane) {
                tabPane.classList.add('active');
            }
        });
    });
    
    // Testimonial Read More functionality
    const readMoreButtons = document.querySelectorAll('.read-more-btn');
    
    readMoreButtons.forEach(button => {
        button.addEventListener('click', function() {
            const testimonial = this.closest('.testimonial');
            testimonial.classList.toggle('expanded');
            
            if (testimonial.classList.contains('expanded')) {
                this.textContent = 'Read Less';
            } else {
                this.textContent = 'Read More';
            }
        });
    });
    
    // Mini Contact Form Submission
    const contactMiniForm = document.querySelector('.contact-mini-form');
    if (contactMiniForm) {
        contactMiniForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Here you would typically send the form data to your server
            // For now, we'll just show a success message
            const formData = new FormData(this);
            console.log('Form submitted with data:', Object.fromEntries(formData));
            
            // Show success message or reset form
            this.reset();
            alert('Thank you for your message! We will get back to you soon.');
        });
    }
});

// Initialize About Section Tabs
function initAboutTabs() {
    const tabButtons = document.querySelectorAll('.about-tab-btn');
    const tabPanes = document.querySelectorAll('.about-tab-pane');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remove active class from all buttons and panes
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabPanes.forEach(pane => pane.classList.remove('active'));
            
            // Add active class to current button
            this.classList.add('active');
            
            // Show the corresponding tab pane
            const tabId = this.getAttribute('data-tab');
            const tabPane = document.getElementById(tabId + '-tab');
            if (tabPane) {
                tabPane.classList.add('active');
            }
        });
    });
}

// Initialize Knowledge Hub Tabs
function initKnowledgeHubTabs() {
    const tabButtons = document.querySelectorAll('.knowledge-tabs .tab-btn');
    const tabPanes = document.querySelectorAll('.knowledge-tabs .tab-pane');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remove active class from all buttons and panes
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabPanes.forEach(pane => pane.classList.remove('active'));
            
            // Add active class to current button
            this.classList.add('active');
            
            // Show the corresponding tab pane
            const tabId = this.getAttribute('data-tab');
            const tabPane = document.getElementById(tabId + '-tab');
            if (tabPane) {
                tabPane.classList.add('active');
            }
        });
    });
}

// Initialize Persona Selection and Content Filtering
function initPersonaSelection() {
    const personaCards = document.querySelectorAll('.persona-card');
    const personaContents = document.querySelectorAll('[data-persona-content]');
    let currentPersona = localStorage.getItem('selectedPersona') || null;
    
    // Function to update UI based on selected persona
    function updatePersonaUI(persona) {
        // Update active state on persona cards
        personaCards.forEach(card => {
            if (card.getAttribute('data-persona') === persona) {
                card.classList.add('active');
                card.querySelector('.persona-select-btn').textContent = 'Selected';
            } else {
                card.classList.remove('active');
                card.querySelector('.persona-select-btn').textContent = 'Select Profile';
            }
        });
        
        // Filter content based on persona
        personaContents.forEach(content => {
            const targetPersonas = content.getAttribute('data-persona-content').split(',');
            
            if (!persona || targetPersonas.includes(persona) || targetPersonas.includes('all')) {
                content.classList.add('show');
            } else {
                content.classList.remove('show');
            }
        });
        
        // Update welcome message if it exists
        const welcomeMessage = document.querySelector('.persona-welcome');
        if (welcomeMessage && persona) {
            const personaName = getPersonaDisplayName(persona);
            welcomeMessage.textContent = `Welcome, ${personaName}`;
            welcomeMessage.style.display = 'block';
        } else if (welcomeMessage) {
            welcomeMessage.style.display = 'none';
        }
        
        // Show or hide the "Clear Profile" button
        const clearButton = document.querySelector('.clear-persona-btn');
        if (clearButton) {
            clearButton.style.display = persona ? 'block' : 'none';
        }
    }
    
    // Helper to get display name from persona ID
    function getPersonaDisplayName(personaId) {
        const personaMap = {
            'young-entrepreneur': 'Young Entrepreneur',
            'startup-founder': 'Startup Founder',
            'product-manager': 'Product Manager',
            'career-changer': 'Career Changer',
            'mba-applicant': 'MBA Applicant'
        };
        return personaMap[personaId] || 'User';
    }
    
    // Add click event to persona cards
    personaCards.forEach(card => {
        card.addEventListener('click', function() {
            const persona = this.getAttribute('data-persona');
            
            // Save selection
            localStorage.setItem('selectedPersona', persona);
            currentPersona = persona;
            
            // Update UI
            updatePersonaUI(persona);
            
            // Scroll to services section
            const servicesSection = document.querySelector('#services');
            if (servicesSection) {
                setTimeout(() => {
                    servicesSection.scrollIntoView({ behavior: 'smooth' });
                }, 300);
            }
        });
    });
    
    // Add clear button functionality
    const clearButton = document.createElement('button');
    clearButton.classList.add('clear-persona-btn');
    clearButton.textContent = 'Clear Profile Selection';
    clearButton.style.display = 'none';
    
    const personaSection = document.querySelector('.persona-selection .container');
    if (personaSection) {
        personaSection.appendChild(clearButton);
        
        clearButton.addEventListener('click', function() {
            localStorage.removeItem('selectedPersona');
            currentPersona = null;
            updatePersonaUI(null);
        });
    }
    
    // Initialize UI with saved persona on page load
    if (currentPersona) {
        updatePersonaUI(currentPersona);
    }
    
    // Add persona welcome message to header
    const header = document.querySelector('header .container');
    if (header) {
        const welcomeMessage = document.createElement('div');
        welcomeMessage.classList.add('persona-welcome');
        welcomeMessage.style.display = 'none';
        
        // Insert after the logo
        const logo = header.querySelector('.logo');
        if (logo) {
            logo.parentNode.insertBefore(welcomeMessage, logo.nextSibling);
            
            // Update the welcome message if needed
            if (currentPersona) {
                const personaName = getPersonaDisplayName(currentPersona);
                welcomeMessage.textContent = `Welcome, ${personaName}`;
                welcomeMessage.style.display = 'block';
            }
        }
    }
}