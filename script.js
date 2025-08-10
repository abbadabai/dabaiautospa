// Global Variables
let selectedServices = [];
let selectedServicesTotal = 0;
let additionalServices = [];
let map = null;
let statesData = [];
let lgaData = {};
let currentTheme = localStorage.getItem('theme') || 'light';

// Additional Services Pricing
const additionalServicesPricing = {
    'engine-bay': 1500,
    'headlight-restoration': 2500,
    'wheel-coating': 3000,
    'glass-coating': 2000
};

// Nigerian States Data (Fallback)
const fallbackStates = [
    'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa', 'Benue', 'Borno', 
    'Cross River', 'Delta', 'Ebonyi', 'Edo', 'Ekiti', 'Enugu', 'Federal Capital Territory', 
    'Gombe', 'Imo', 'Jigawa', 'Kaduna', 'Kano', 'Katsina', 'Kebbi', 'Kogi', 'Kwara', 
    'Lagos', 'Nasarawa', 'Niger', 'Ogun', 'Ondo', 'Osun', 'Oyo', 'Plateau', 'Rivers', 
    'Sokoto', 'Taraba', 'Yobe', 'Zamfara'
];

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing app...');
    initializeApp();
    
    // If we're on the booking page, load the bookings
    if (window.location.pathname.includes('booking.html')) {
        console.log('On booking page, loading bookings...');
        loadBookings();
    } else {
        console.log('Not on booking page, current path:', window.location.pathname);
    }
});

// Main initialization function
function initializeApp() {
    setupTheme();
    setupNavigation();
    setupFormHandlers();
    loadStatesData();
    initializeMap();
    setupDateValidation();
    setupPriceCalculation();
    setupContactForm();
    setupGallery();
    setupFAQ();
    
    // Initialize booking page if we're on it
    if (window.location.pathname.includes('booking.html')) {
        loadBookings();
    }
}

// Navigation Setup
function setupNavigation() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');

    if (hamburger && navMenu) {
        hamburger.addEventListener('click', function() {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
        });

        // Close mobile menu when clicking on a link
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
            });
        });
    }

    // Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// Load States Data from API
async function loadStatesData() {
    const stateSelect = document.getElementById('state');
    const lgaSelect = document.getElementById('localGovernment');
    
    if (!stateSelect) return;

    try {
        console.log('Fetching states data from new API...');
        const response = await fetch('https://nga-api.vercel.app/');
        
        if (response.ok) {
            const data = await response.json();
            // Filter for only Kaduna, Kano, and Abuja (FCT)
            const filteredStates = data.filter(state => 
                state.name === 'Kaduna' || 
                state.name === 'Kano' || 
                state.name === 'Federal Capital Territory'
            );
            statesData = filteredStates;
            console.log('Filtered states data loaded successfully:', filteredStates);
        } else {
            throw new Error('API response not ok');
        }
    } catch (error) {
        console.log('API failed, using fallback data:', error);
        // Use fallback data for the three states only
        statesData = [
            { name: 'Kaduna', id: 'kaduna' },
            { name: 'Kano', id: 'kano' },
            { name: 'Federal Capital Territory', id: 'fct' }
        ];
    }

    populateStatesDropdown(stateSelect);
}

// Populate States Dropdown
function populateStatesDropdown(stateSelect) {
    stateSelect.innerHTML = '<option value="">Select State</option>';
    
    statesData.forEach(state => {
        const option = document.createElement('option');
        option.value = state.name; // Use state.name for dropdown
        option.textContent = state.name;
        stateSelect.appendChild(option);
    });
    
    // Setup state change handler
    const lgaSelect = document.getElementById('localGovernment');
    if (lgaSelect) {
        stateSelect.addEventListener('change', function() {
            const selectedState = this.value;
            if (selectedState) {
                loadLGAData(selectedState, lgaSelect);
            } else {
                lgaSelect.innerHTML = '<option value="">Select Local Government</option>';
            }
        });
    }
}

// Load Local Government Data for selected state
async function loadLGAData(state, lgaSelect) {
    if (!lgaSelect) return;
    
    lgaSelect.innerHTML = '<option value="">Loading...</option>';
    
    try {
        // For the three specific states, we'll use a mapping approach
        const stateLGAMapping = {
            'Kaduna': [
                'Birnin Gwari', 'Chikun', 'Giwa', 'Igabi', 'Ikara', 'Jaba', 'Jema\'a', 'Kachia', 
                'Kaduna North', 'Kaduna South', 'Kagarko', 'Kajuru', 'Kaura', 'Kauru', 'Kubau', 
                'Kudan', 'Lere', 'Makarfi', 'Sabon Gari', 'Sanga', 'Soba', 'Zangon Kataf', 'Zaria'
            ],
            'Kano': [
                'Ajingi', 'Albasu', 'Bagwai', 'Bebeji', 'Bichi', 'Bunkure', 'Dala', 'Dambatta', 
                'Dawakin Kudu', 'Dawakin Tofa', 'Doguwa', 'Fagge', 'Gabasawa', 'Garko', 'Garum', 
                'Gaya', 'Gezawa', 'Gwale', 'Gwarzo', 'Kabo', 'Kano Municipal', 'Karaye', 'Kibiya', 
                'Kiru', 'Kumbotso', 'Kunchi', 'Kura', 'Madobi', 'Makoda', 'Minjibir', 'Nasarawa', 
                'Rano', 'Rimin Gado', 'Rogo', 'Shanono', 'Sumaila', 'Takai', 'Tarauni', 'Tofa', 
                'Tsanyawa', 'Tudun Wada', 'Ungogo', 'Warawa', 'Wudil'
            ],
            'Federal Capital Territory': [
                'Abaji', 'Abuja Municipal', 'Gwagwalada', 'Kuje', 'Kwali', 'Kwali'
            ]
        };
        
        const lgas = stateLGAMapping[state] || [];
        
        if (lgas.length > 0) {
            populateLGADropdown(lgaSelect, lgas);
        } else {
            lgaSelect.innerHTML = '<option value="">No LGAs available</option>';
        }
        
    } catch (error) {
        console.error('Error loading LGA data:', error);
        lgaSelect.innerHTML = '<option value="">Error loading LGAs</option>';
    }
}

// Populate LGA Dropdown
function populateLGADropdown(lgaSelect, lgas) {
    lgaSelect.innerHTML = '<option value="">Select Local Government</option>';
    
    if (Array.isArray(lgas)) {
        lgas.forEach(lga => {
            const option = document.createElement('option');
            option.value = lga;
            option.textContent = lga;
            lgaSelect.appendChild(option);
        });
    }
}

// Initialize Google Maps
function initializeMap() {
    const mapContainer = document.getElementById('map');
    if (!mapContainer) return;

    // Check if Google Maps API is loaded
    if (typeof google === 'undefined' || !google.maps) {
        // Fallback when Google Maps API is not available
        mapContainer.innerHTML = `
            <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; color: #64748b; text-align: center; padding: 20px;">
                <i class="fas fa-map-marker-alt" style="font-size: 3rem; margin-bottom: 1rem; color: #2563eb;"></i>
                <h3 style="margin: 0 0 1rem 0; color: #333;">Dabai Auto Spa</h3>
                <p style="margin: 0.5rem 0; font-size: 1.1rem;"><strong>Address:</strong></p>
                <p style="margin: 0.5rem 0; font-size: 1.1rem;">Basawa Road, Zaria</p>
                <p style="margin: 0.5rem 0; font-size: 1.1rem;">Kaduna State, Nigeria</p>
                <p style="margin: 1rem 0 0 0; font-size: 0.9rem; color: #666;">
                    <i class="fas fa-info-circle"></i> 
                    Google Maps requires a valid API key to display the interactive map.
                </p>
            </div>
        `;
        return;
    }

    try {
        // Location: Basawa Road, Zaria, Kaduna, Nigeria
        const defaultLocation = { lat: 11.1112, lng: 7.7227 };
        
        map = new google.maps.Map(mapContainer, {
            center: defaultLocation,
            zoom: 15,
            styles: [
                {
                    featureType: 'poi',
                    elementType: 'labels',
                    stylers: [{ visibility: 'off' }]
                }
            ]
        });

        // Add a marker for Dabai Auto Spa location
        const marker = new google.maps.Marker({
            position: defaultLocation,
            map: map,
            title: 'Dabai Auto Spa - Basawa Road, Zaria',
            icon: {
                url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                    <svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="20" cy="20" r="20" fill="#2563eb"/>
                        <path d="M20 10c-5.5 0-10 4.5-10 10s4.5 10 10 10 10-4.5 10-10-4.5-10-10-10zm0 18c-4.4 0-8-3.6-8-8s3.6-8 8-8 8 3.6 8 8-3.6 8-8 8z" fill="white"/>
                        <circle cx="20" cy="20" r="4" fill="white"/>
                    </svg>
                `),
                scaledSize: new google.maps.Size(40, 40)
            }
        });

        // Add an info window with location details
        const infoWindow = new google.maps.InfoWindow({
            content: `
                <div style="padding: 10px; max-width: 200px;">
                    <h3 style="margin: 0 0 10px 0; color: #2563eb;">Dabai Auto Spa</h3>
                    <p style="margin: 5px 0; font-size: 14px;"><strong>Address:</strong></p>
                    <p style="margin: 5px 0; font-size: 14px;">Basawa Road, Zaria</p>
                    <p style="margin: 5px 0; font-size: 14px;">Kaduna State, Nigeria</p>
                    <p style="margin: 5px 0; font-size: 14px;"><strong>Services:</strong></p>
                    <p style="margin: 5px 0; font-size: 14px;">Car Wash • Detailing • Maintenance</p>
                </div>
            `
        });

        // Show info window when marker is clicked
        google.maps.event.addListener(map, 'click', function() {
            infoWindow.close();
        });

        // Show info window when marker is clicked
        google.maps.event.addListener(marker, 'click', function() {
            infoWindow.open(map, marker);
        });

    } catch (error) {
        console.error('Error initializing map:', error);
        mapContainer.innerHTML = '<div style="display: flex; align-items: center; justify-content: center; height: 100%; color: #64748b;"><i class="fas fa-exclamation-triangle" style="font-size: 2rem; margin-right: 1rem;"></i>Map unavailable</div>';
    }
}

// Theme Toggle Function
function toggleTheme() {
    currentTheme = currentTheme === 'light' ? 'dark' : 'light';
    localStorage.setItem('theme', currentTheme);
    setupTheme();
}

// Setup Theme
function setupTheme() {
    document.documentElement.setAttribute('data-theme', currentTheme);
    const themeToggle = document.querySelector('.theme-toggle i');
    if (themeToggle) {
        themeToggle.className = currentTheme === 'light' ? 'fas fa-moon' : 'fas fa-sun';
    }
}

// Multiple Service Selection
function toggleServiceSelection(serviceId, serviceName, price) {
    const existingServiceIndex = selectedServices.findIndex(service => service.id === serviceId);
    
    if (existingServiceIndex !== -1) {
        // Remove service if already selected
        selectedServices.splice(existingServiceIndex, 1);
        selectedServicesTotal -= price;
        
        // Update button appearance
        const button = event.target;
        button.textContent = 'Select';
        button.classList.remove('selected');
        
        // Update service card
        const serviceCard = document.querySelector(`[data-service="${serviceId}"]`);
        if (serviceCard) {
            serviceCard.classList.remove('selected');
        }
    } else {
        // Add service if not selected
        selectedServices.push({
            id: serviceId,
            name: serviceName,
            price: price
        });
        selectedServicesTotal += price;
        
        // Update button appearance
        const button = event.target;
        button.textContent = 'Selected';
        button.classList.add('selected');
        
        // Update service card
        const serviceCard = document.querySelector(`[data-service="${serviceId}"]`);
        if (serviceCard) {
            serviceCard.classList.add('selected');
        }
    }
    
    // Update displays
    updateSelectedServicesDisplay();
    updatePriceCalculation();
}

// Update Selected Services Display
function updateSelectedServicesDisplay() {
    const selectedServiceDisplay = document.getElementById('selectedService');
    if (selectedServiceDisplay) {
        if (selectedServices.length === 0) {
            selectedServiceDisplay.innerHTML = '<span>No services selected</span>';
        } else {
            let html = '';
            selectedServices.forEach(service => {
                html += `
                    <div class="selected-service-item">
                        <span>${service.name}</span>
                        <span style="color: #2563eb; font-weight: 600;">₦${service.price.toLocaleString()}</span>
                        <button onclick="removeService('${service.id}', ${service.price})">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                `;
            });
            selectedServiceDisplay.innerHTML = html;
        }
    }
}



// Remove Service
function removeService(serviceId, price) {
    const serviceIndex = selectedServices.findIndex(service => service.id === serviceId);
    if (serviceIndex !== -1) {
        selectedServices.splice(serviceIndex, 1);
        selectedServicesTotal -= price;
        
        // Update button appearance
        const button = document.querySelector(`[data-service="${serviceId}"] .service-select-btn`);
        if (button) {
            button.textContent = 'Select';
            button.classList.remove('selected');
        }
        
        // Update service card
        const serviceCard = document.querySelector(`[data-service="${serviceId}"]`);
        if (serviceCard) {
            serviceCard.classList.remove('selected');
        }
        
            // Update displays
    updateSelectedServicesDisplay();
    updatePriceCalculation();
    }
}



// Setup Form Handlers
function setupFormHandlers() {
    const bookingForm = document.getElementById('bookingForm');
    if (bookingForm) {
        bookingForm.addEventListener('submit', handleBookingSubmit);
    }

    // Additional services checkboxes
    const additionalServicesCheckboxes = document.querySelectorAll('input[name="additionalServices"]');
    additionalServicesCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', updatePriceCalculation);
    });
}

// Setup Price Calculation
function setupPriceCalculation() {
    // Listen for changes in additional services
    const additionalServicesCheckboxes = document.querySelectorAll('input[name="additionalServices"]');
    additionalServicesCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', updatePriceCalculation);
    });
}

// Update Price Calculation
function updatePriceCalculation() {
    const basePriceElement = document.getElementById('basePrice');
    const additionalPriceElement = document.getElementById('additionalPrice');
    const totalPriceElement = document.getElementById('totalPrice');
    
    if (!basePriceElement || !additionalPriceElement || !totalPriceElement) return;

    // Calculate additional services total
    let additionalTotal = 0;
    const selectedAdditionalServices = document.querySelectorAll('input[name="additionalServices"]:checked');
    
    selectedAdditionalServices.forEach(checkbox => {
        const serviceId = checkbox.value;
        if (additionalServicesPricing[serviceId]) {
            additionalTotal += additionalServicesPricing[serviceId];
        }
    });

    // Update price display
    basePriceElement.textContent = `₦${selectedServicesTotal.toLocaleString()}`;
    additionalPriceElement.textContent = `₦${additionalTotal.toLocaleString()}`;
    
    const totalPrice = selectedServicesTotal + additionalTotal;
    totalPriceElement.textContent = `₦${totalPrice.toLocaleString()}`;
}

// Setup Date Validation
function setupDateValidation() {
    const appointmentDateInput = document.getElementById('appointmentDate');
    if (appointmentDateInput) {
        // Set minimum date to today
        const today = new Date().toISOString().split('T')[0];
        appointmentDateInput.min = today;
        
        // Set maximum date to 3 months from today
        const maxDate = new Date();
        maxDate.setMonth(maxDate.getMonth() + 3);
        appointmentDateInput.max = maxDate.toISOString().split('T')[0];
    }
}

// Handle Booking Form Submission
async function handleBookingSubmit(event) {
    event.preventDefault();
    
    const form = event.target;
    if (!validateForm(form)) {
        return;
    }

    // Show loading modal
    showModal('loadingModal');

    try {
        // Collect form data
        const formData = new FormData(form);
        const bookingData = {
            id: generateBookingId(),
            timestamp: new Date().toISOString(),
            status: 'pending',
            service: document.getElementById('selectedService').textContent,
            vehicleMake: formData.get('vehicleMake'),
            vehicleModel: formData.get('vehicleModel'),
            vehicleYear: formData.get('vehicleYear'),
            vehicleColor: formData.get('vehicleColor'),
            additionalServices: getSelectedAdditionalServices(),
            appointmentDate: formData.get('appointmentDate'),
            appointmentTime: formData.get('appointmentTime'),
            serviceLocation: formData.get('serviceLocation'),
            customerName: formData.get('customerName'),
            customerPhone: formData.get('customerPhone'),
            customerEmail: formData.get('customerEmail'),
            state: formData.get('state'),
            localGovernment: formData.get('localGovernment'),
            address: formData.get('address'),
            specialInstructions: formData.get('specialInstructions'),
            totalPrice: selectedServicesTotal + getAdditionalServicesTotal()
        };

        // Save booking to localStorage
        saveBookingToStorage(bookingData);
        
        // Update booking.html with the new booking
        updateBookingPage(bookingData);

        // Hide loading modal and show success modal
        hideModal('loadingModal');
        showModal('successModal');

        // Reset form
        form.reset();
        selectedServices = [];
        selectedServicesTotal = 0;
        updateSelectedServicesDisplay();
        updatePriceCalculation();

        // Optional: Send to external service
        try {
            await sendToGoogleForm(bookingData);
        } catch (error) {
            console.log('External form submission failed:', error);
        }

    } catch (error) {
        console.error('Booking submission error:', error);
        hideModal('loadingModal');
        alert('An error occurred while processing your booking. Please try again.');
    }
}

// Generate unique booking ID
function generateBookingId() {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    return `BK${timestamp}${random}`;
}

// Save booking to localStorage
function saveBookingToStorage(bookingData) {
    console.log('Saving booking to storage:', bookingData);
    let bookings = JSON.parse(localStorage.getItem('dabaiBookings') || '[]');
    bookings.push(bookingData);
    localStorage.setItem('dabaiBookings', JSON.stringify(bookings));
    console.log('Total bookings in storage:', bookings.length);
}

// Update booking.html with new booking
function updateBookingPage(bookingData) {
    // Store the new booking data to be displayed on booking.html
    sessionStorage.setItem('latestBooking', JSON.stringify(bookingData));
}

// Load and display bookings on booking.html
function loadBookings() {
    console.log('loadBookings function called');
    const container = document.querySelector('.booking-status-container');
    if (!container) {
        console.log('Container not found');
        return;
    }

    const bookings = JSON.parse(localStorage.getItem('dabaiBookings') || '[]');
    console.log('Bookings found:', bookings);
    
    if (bookings.length === 0) {
        console.log('No bookings found, showing no-bookings message');
        container.innerHTML = `
            <div class="no-bookings">
                <i class="fas fa-calendar-times"></i>
                <h3>No Bookings Found</h3>
                <p>You haven't made any appointments yet.</p>
                <a href="services.html" class="btn btn-primary">Book a Service</a>
            </div>
        `;
        return;
    }

    // Sort bookings by date (newest first)
    bookings.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    let html = '<div class="bookings-grid">';
    
    bookings.forEach(booking => {
        const statusClass = getStatusClass(booking.status);
        const appointmentDate = new Date(booking.appointmentDate).toLocaleDateString();
        const bookingTime = new Date(booking.timestamp).toLocaleString();
        
        html += `
            <div class="booking-card ${statusClass}">
                <div class="booking-header">
                    <h3>Booking #${booking.id}</h3>
                    <span class="status-badge ${statusClass}">${booking.status}</span>
                </div>
                <div class="booking-details">
                    <div class="detail-row">
                        <span class="label">Service:</span>
                        <span class="value">${booking.service}</span>
                    </div>
                    <div class="detail-row">
                        <span class="label">Vehicle:</span>
                        <span class="value">${booking.vehicleYear} ${booking.vehicleMake} ${booking.vehicleModel}</span>
                    </div>
                    <div class="detail-row">
                        <span class="label">Appointment:</span>
                        <span class="value">${appointmentDate} at ${booking.appointmentTime}</span>
                    </div>
                    <div class="detail-row">
                        <span class="label">Location:</span>
                        <span class="value">${booking.state} - ${booking.localGovernment}</span>
                    </div>
                    <div class="detail-row">
                        <span class="label">Total Price:</span>
                        <span class="value">₦${booking.totalPrice.toLocaleString()}</span>
                    </div>
                    <div class="detail-row">
                        <span class="label">Booked on:</span>
                        <span class="value">${bookingTime}</span>
                    </div>
                </div>
                <div class="booking-actions">
                    <button class="btn btn-outline" onclick="viewBookingDetails('${booking.id}')">
                        <i class="fas fa-eye"></i> View Details
                    </button>
                </div>
            </div>
        `;
    });
    
    html += '</div>';
    container.innerHTML = html;
}

// Get CSS class for status
function getStatusClass(status) {
    switch(status.toLowerCase()) {
        case 'pending': return 'status-pending';
        case 'confirmed': return 'status-confirmed';
        case 'in progress': return 'status-progress';
        case 'completed': return 'status-completed';
        case 'cancelled': return 'status-cancelled';
        default: return 'status-pending';
    }
}

// View detailed booking information
function viewBookingDetails(bookingId) {
    const bookings = JSON.parse(localStorage.getItem('dabaiBookings') || '[]');
    const booking = bookings.find(b => b.id === bookingId);
    
    if (!booking) return;
    
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>Booking Details #${booking.id}</h3>
                <button class="close-btn" onclick="this.closest('.modal').remove()">&times;</button>
            </div>
            <div class="modal-body">
                <div class="detail-section">
                    <h4>Service Information</h4>
                    <p><strong>Service:</strong> ${booking.service}</p>
                    <p><strong>Additional Services:</strong> ${booking.additionalServices.join(', ') || 'None'}</p>
                    <p><strong>Total Price:</strong> ₦${booking.totalPrice.toLocaleString()}</p>
                </div>
                <div class="detail-section">
                    <h4>Vehicle Information</h4>
                    <p><strong>Make:</strong> ${booking.vehicleMake}</p>
                    <p><strong>Model:</strong> ${booking.vehicleModel}</p>
                    <p><strong>Year:</strong> ${booking.vehicleYear}</p>
                    <p><strong>Color:</strong> ${booking.vehicleColor || 'Not specified'}</p>
                </div>
                <div class="detail-section">
                    <h4>Appointment Details</h4>
                    <p><strong>Date:</strong> ${new Date(booking.appointmentDate).toLocaleDateString()}</p>
                    <p><strong>Time:</strong> ${booking.appointmentTime}</p>
                    <p><strong>Service Location:</strong> ${booking.serviceLocation}</p>
                </div>
                <div class="detail-section">
                    <h4>Customer Information</h4>
                    <p><strong>Name:</strong> ${booking.customerName}</p>
                    <p><strong>Phone:</strong> ${booking.customerPhone}</p>
                    <p><strong>Email:</strong> ${booking.customerEmail || 'Not provided'}</p>
                </div>
                <div class="detail-section">
                    <h4>Location</h4>
                    <p><strong>State:</strong> ${booking.state}</p>
                    <p><strong>Local Government:</strong> ${booking.localGovernment}</p>
                    <p><strong>Address:</strong> ${booking.address}</p>
                </div>
                ${booking.specialInstructions ? `
                <div class="detail-section">
                    <h4>Special Instructions</h4>
                    <p>${booking.specialInstructions}</p>
                </div>
                ` : ''}
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    modal.style.display = 'flex';
}

// Get Selected Additional Services
function getSelectedAdditionalServices() {
    const selectedServices = [];
    const checkboxes = document.querySelectorAll('input[name="additionalServices"]:checked');
    
    checkboxes.forEach(checkbox => {
        selectedServices.push({
            id: checkbox.value,
            name: checkbox.nextElementSibling.textContent,
            price: additionalServicesPricing[checkbox.value]
        });
    });
    
    return selectedServices;
}

// Get Additional Services Total
function getAdditionalServicesTotal() {
    let total = 0;
    const checkboxes = document.querySelectorAll('input[name="additionalServices"]:checked');
    
    checkboxes.forEach(checkbox => {
        const serviceId = checkbox.value;
        if (additionalServicesPricing[serviceId]) {
            total += additionalServicesPricing[serviceId];
        }
    });
    
    return total;
}

// Send Booking to Google Form
async function sendToGoogleForm(bookingData) {
    // Google Form submission URL (extracted from the form link)
    const formUrl = 'https://docs.google.com/forms/d/e/1FAIpQLScHq5Q8TBFJthvsMTXAwNzV8dn27Bmz_RanDEcFeWWv-NFRCw/formResponse';
    
    // Map our form fields to Google Form field IDs
    // You'll need to inspect your Google Form to get the exact field IDs
    const formData = new FormData();
    
    // Basic customer information
    formData.append('entry.1234567890', bookingData.customerInfo.name); // Replace with actual field ID
    formData.append('entry.1234567891', bookingData.customerInfo.phone); // Replace with actual field ID
    formData.append('entry.1234567892', bookingData.customerInfo.email || 'Not provided'); // Replace with actual field ID
    
    // Vehicle information
    formData.append('entry.1234567893', `${bookingData.vehicleInfo.make} ${bookingData.vehicleInfo.model} ${bookingData.vehicleInfo.year}`); // Replace with actual field ID
    formData.append('entry.1234567894', bookingData.vehicleInfo.color || 'Not specified'); // Replace with actual field ID
    
    // Services selected
    const servicesList = bookingData.services.map(s => s.name).join(', ');
    formData.append('entry.1234567895', servicesList); // Replace with actual field ID
    
    // Additional services
    const additionalServicesList = bookingData.additionalServices.map(s => s.name).join(', ') || 'None';
    formData.append('entry.1234567896', additionalServicesList); // Replace with actual field ID
    
    // Appointment details
    formData.append('entry.1234567897', bookingData.appointment.date); // Replace with actual field ID
    formData.append('entry.1234567898', bookingData.appointment.time); // Replace with actual field ID
    formData.append('entry.1234567899', bookingData.appointment.location); // Replace with actual field ID
    
    // Location information
    formData.append('entry.1234567900', `${bookingData.customerInfo.state}, ${bookingData.customerInfo.localGovernment}`); // Replace with actual field ID
    formData.append('entry.1234567901', bookingData.customerInfo.address); // Replace with actual field ID
    
    // Special instructions
    formData.append('entry.1234567902', bookingData.specialInstructions || 'None'); // Replace with actual field ID
    
    // Total price
    formData.append('entry.1234567903', `₦${bookingData.totalPrice.toLocaleString()}`); // Replace with actual field ID
    
    // Timestamp
    formData.append('entry.1234567904', new Date().toISOString()); // Replace with actual field ID
    
    try {
        // Use a proxy service to bypass CORS restrictions
        const proxyUrl = 'https://cors-anywhere.herokuapp.com/';
        const response = await fetch(proxyUrl + formUrl, {
            method: 'POST',
            body: formData,
            mode: 'cors'
        });
        
        if (response.ok) {
            return {
                success: true,
                bookingId: 'BK' + Date.now(),
                message: 'Booking submitted to Google Form successfully'
            };
        } else {
            throw new Error('Google Form submission failed');
        }
    } catch (error) {
        console.error('Google Form submission error:', error);
        
        // Fallback: Try using a different approach with iframe
        return submitViaIframe(formUrl, formData);
    }
}

// Fallback method using iframe for Google Form submission
function submitViaIframe(formUrl, formData) {
    return new Promise((resolve, reject) => {
        try {
            // Create a hidden iframe
            const iframe = document.createElement('iframe');
            iframe.style.display = 'none';
            iframe.name = 'google-form-submit';
            document.body.appendChild(iframe);
            
            // Create a form to submit to the iframe
            const form = document.createElement('form');
            form.target = 'google-form-submit';
            form.action = formUrl;
            form.method = 'POST';
            
            // Add form fields
            for (let [key, value] of formData.entries()) {
                const input = document.createElement('input');
                input.type = 'hidden';
                input.name = key;
                input.value = value;
                form.appendChild(input);
            }
            
            // Submit the form
            document.body.appendChild(form);
            form.submit();
            
            // Clean up
            setTimeout(() => {
                document.body.removeChild(form);
                document.body.removeChild(iframe);
                resolve({
                    success: true,
                    bookingId: 'BK' + Date.now(),
                    message: 'Booking submitted via iframe successfully'
                });
            }, 2000);
            
        } catch (error) {
            reject(new Error('Iframe submission failed: ' + error.message));
        }
    });
}

// Simulate Booking API Call (kept for fallback)
async function simulateBookingAPI(bookingData) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            // Simulate API response
            console.log('Booking data sent to API:', bookingData);
            
            // Simulate success (90% success rate)
            if (Math.random() > 0.1) {
                resolve({
                    success: true,
                    bookingId: 'BK' + Date.now(),
                    message: 'Booking successful'
                });
            } else {
                reject(new Error('Booking failed'));
            }
        }, 2000);
    });
}

// Setup Contact Form
function setupContactForm() {
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', handleContactSubmit);
    }
}

// Handle Contact Form Submit
async function handleContactSubmit(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const contactData = {
        name: formData.get('contactName'),
        email: formData.get('contactEmail'),
        subject: formData.get('contactSubject'),
        message: formData.get('contactMessage'),
        timestamp: new Date().toISOString()
    };

    try {
        // Simulate API call
        await simulateContactAPI(contactData);
        
        alert('Thank you for your message! We will get back to you soon.');
        event.target.reset();
        
    } catch (error) {
        console.error('Contact form error:', error);
        alert('There was an error sending your message. Please try again.');
    }
}

// Simulate Contact API Call
async function simulateContactAPI(contactData) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            console.log('Contact form data sent to API:', contactData);
            
            // Simulate success (95% success rate)
            if (Math.random() > 0.05) {
                resolve({
                    success: true,
                    message: 'Message sent successfully'
                });
            } else {
                reject(new Error('Message sending failed'));
            }
        }, 1000);
    });
}



// Modal Functions
function showModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'flex';
    }
}

function hideModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
    }
}

function closeModal(modalId) {
    hideModal(modalId);
}

// Utility Functions
function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        section.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }
}

// Form Validation
function validateForm(form) {
    const requiredFields = form.querySelectorAll('[required]');
    let isValid = true;
    
    requiredFields.forEach(field => {
        if (!field.value.trim()) {
            field.style.borderColor = '#ef4444';
            isValid = false;
        } else {
            field.style.borderColor = '#10b981';
        }
    });
    
    return isValid;
}

// Phone Number Validation
function validatePhoneNumber(phone) {
    const phoneRegex = /^(\+234|0)?[789][01]\d{8}$/;
    return phoneRegex.test(phone);
}

// Email Validation
function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Real-time Form Validation
document.addEventListener('DOMContentLoaded', function() {
    // Phone number validation
    const phoneInput = document.getElementById('customerPhone');
    if (phoneInput) {
        phoneInput.addEventListener('blur', function() {
            if (this.value && !validatePhoneNumber(this.value)) {
                this.style.borderColor = '#ef4444';
                this.setCustomValidity('Please enter a valid Nigerian phone number');
            } else {
                this.style.borderColor = '#10b981';
                this.setCustomValidity('');
            }
        });
    }

    // Email validation
    const emailInput = document.getElementById('customerEmail');
    if (emailInput) {
        emailInput.addEventListener('blur', function() {
            if (this.value && !validateEmail(this.value)) {
                this.style.borderColor = '#ef4444';
                this.setCustomValidity('Please enter a valid email address');
            } else {
                this.style.borderColor = '#10b981';
                this.setCustomValidity('');
            }
        });
    }
});

// Intersection Observer for Animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('fade-in');
        }
    });
}, observerOptions);

// Observe elements for animation
document.addEventListener('DOMContentLoaded', function() {
    const animatedElements = document.querySelectorAll('.service-card, .feature, .contact-item');
    animatedElements.forEach(el => observer.observe(el));
});

// Service Status Check (Mock API)
async function checkServiceStatus() {
    try {
        const response = await fetch('https://httpbin.org/status/200');
        if (response.ok) {
            console.log('Service is operational');
            return true;
        }
    } catch (error) {
        console.log('Service check failed:', error);
        return false;
    }
}

// Weather API Integration (for service planning)
async function getWeatherData(city = 'Lagos') {
    try {
        // Using a free weather API (you'll need to replace with your own API key)
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city},NG&appid=YOUR_API_KEY&units=metric`);
        if (response.ok) {
            const data = await response.json();
            console.log('Weather data:', data);
            return data;
        }
    } catch (error) {
        console.log('Weather API error:', error);
        return null;
    }
}

// Gallery Setup
function setupGallery() {
    // Gallery filter functionality
    const filterButtons = document.querySelectorAll('.filter-btn');
    const galleryItems = document.querySelectorAll('.gallery-item');
    
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            const filter = this.getAttribute('data-filter');
            
            // Update active button
            filterButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            // Filter gallery items
            galleryItems.forEach(item => {
                if (filter === 'all' || item.getAttribute('data-category') === filter) {
                    item.style.display = 'block';
                } else {
                    item.style.display = 'none';
                }
            });
        });
    });
    
    // Gallery image click to open modal
    galleryItems.forEach(item => {
        item.addEventListener('click', function() {
            const img = this.querySelector('img');
            const caption = this.querySelector('.gallery-overlay h4').textContent;
            openImageModal(img.src, caption);
        });
    });
}

// Open Image Modal
function openImageModal(imageSrc, caption) {
    const modal = document.getElementById('imageModal');
    const modalImage = document.getElementById('modalImage');
    const modalCaption = document.getElementById('modalCaption');
    
    if (modal && modalImage && modalCaption) {
        modalImage.src = imageSrc;
        modalCaption.textContent = caption;
        modal.style.display = 'flex';
    }
}

// Close Image Modal
function closeImageModal() {
    const modal = document.getElementById('imageModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

// FAQ Setup
function setupFAQ() {
    const faqQuestions = document.querySelectorAll('.faq-question');
    
    faqQuestions.forEach(question => {
        question.addEventListener('click', function() {
            const answer = this.nextElementSibling;
            const icon = this.querySelector('i');
            
            // Toggle answer visibility
            if (answer.style.maxHeight) {
                answer.style.maxHeight = null;
                icon.style.transform = 'rotate(0deg)';
            } else {
                answer.style.maxHeight = answer.scrollHeight + 'px';
                icon.style.transform = 'rotate(180deg)';
            }
        });
    });
}

// Toggle FAQ (for onclick handlers)
function toggleFAQ(element) {
    const answer = element.nextElementSibling;
    const icon = element.querySelector('i');
    
    if (answer.style.maxHeight) {
        answer.style.maxHeight = null;
        icon.style.transform = 'rotate(0deg)';
    } else {
        answer.style.maxHeight = answer.scrollHeight + 'px';
        icon.style.transform = 'rotate(180deg)';
    }
}

// Export functions for global access
window.toggleServiceSelection = toggleServiceSelection;
window.toggleTheme = toggleTheme;
window.scrollToSection = scrollToSection;
window.closeModal = closeModal;
window.closeImageModal = closeImageModal;
window.toggleFAQ = toggleFAQ;
window.removeService = removeService; 