// Telegram WebApp API Integration
let tg = window.Telegram.WebApp;

// Backend API Configuration
const API_BASE_URL = 'https://itbrv05-partners-backend-0674.twc1.net';

// Initialize Telegram WebApp
function initTelegramWebApp() {
    // Expand the web app to full height
    tg.expand();
    
    // Enable closing confirmation
    tg.enableClosingConfirmation();
    
    // Set theme parameters
    document.body.style.backgroundColor = tg.themeParams.bg_color || '#667eea';
    document.body.style.color = tg.themeParams.text_color || '#333';
    
    // Get user data from Telegram
    const user = tg.initDataUnsafe?.user;
    if (user) {
        updateUserProfile(user);
    }
    
    // Set main button
    tg.MainButton.setText('Создать заявку');
    tg.MainButton.onClick(createLead);
    tg.MainButton.show();
    
    console.log('Telegram WebApp initialized');
}

// Update user profile with Telegram data
function updateUserProfile(user) {
    const firstName = user.first_name || '';
    const lastName = user.last_name || '';
    const username = user.username || '';
    
    document.getElementById('userName').textContent = `${firstName} ${lastName}`.trim() || username || 'Партнер';
    document.getElementById('userInitials').textContent = getInitials(firstName, lastName);
    
    // Store user ID for API calls
    window.userId = user.id;
    window.userData = user;
}

// Get user initials
function getInitials(firstName, lastName) {
    const first = firstName ? firstName[0].toUpperCase() : '';
    const last = lastName ? lastName[0].toUpperCase() : '';
    return (first + last) || 'П';
}

// Show loading overlay
function showLoading() {
    document.getElementById('loadingOverlay').classList.add('show');
}

// Hide loading overlay
function hideLoading() {
    document.getElementById('loadingOverlay').classList.remove('show');
}

// Show notification
function showNotification(message, type = 'info') {
    tg.showAlert(message);
}

// API Functions
async function apiRequest(endpoint, method = 'GET', data = null) {
    try {
        const options = {
            method,
            headers: {
                'Content-Type': 'application/json',
            }
        };
        
        if (data) {
            options.body = JSON.stringify(data);
        }
        
        const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error('API request failed:', error);
        showNotification('Ошибка соединения с сервером', 'error');
        throw error;
    }
}

// Load user data
async function loadUserData() {
    try {
        showLoading();
        
        // Simulate API call - replace with actual endpoint
        const userData = await apiRequest('/api/user/profile');
        
        // Update UI with loaded data
        updateStats(userData.stats || {});
        updateLeads(userData.leads || []);
        
    } catch (error) {
        console.error('Failed to load user data:', error);
        // Show default data
        updateStats({
            balance: 0,
            totalLeads: 0,
            completedDeals: 0,
            earnings: 0
        });
    } finally {
        hideLoading();
    }
}

// Update statistics
function updateStats(stats) {
    document.getElementById('balance').textContent = `${stats.balance || 0} ₽`;
    document.getElementById('totalLeads').textContent = stats.totalLeads || 0;
    document.getElementById('completedDeals').textContent = stats.completedDeals || 0;
    document.getElementById('earnings').textContent = `${stats.earnings || 0} ₽`;
}

// Update leads list
function updateLeads(leads) {
    const leadsList = document.getElementById('leadsList');
    
    if (leads.length === 0) {
        leadsList.innerHTML = '<div class="lead-item"><div class="lead-info"><h4>Заявок пока нет</h4><p>Создайте первую заявку</p></div></div>';
        return;
    }
    
    leadsList.innerHTML = leads.map(lead => `
        <div class="lead-item">
            <div class="lead-info">
                <h4>Заявка #${lead.id}</h4>
                <p>Клиент: ${lead.clientName}</p>
                <span class="lead-date">${formatDate(lead.createdAt)}</span>
            </div>
            <div class="lead-status ${lead.status}">
                ${getStatusText(lead.status)}
            </div>
        </div>
    `).join('');
}

// Format date
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU');
}

// Get status text
function getStatusText(status) {
    const statusMap = {
        'pending': '⏳ Ожидает',
        'processing': '🔄 В работе',
        'completed': '✅ Завершена',
        'cancelled': '❌ Отменена'
    };
    return statusMap[status] || status;
}

// Modal Functions
function editProfile() {
    const modal = document.getElementById('profileModal');
    modal.classList.add('show');
    
    // Fill form with current data
    const userData = window.userData || {};
    document.getElementById('firstName').value = userData.first_name || '';
    document.getElementById('lastName').value = userData.last_name || '';
    document.getElementById('phone').value = userData.phone || '';
    document.getElementById('email').value = userData.email || '';
}

function closeModal() {
    document.getElementById('profileModal').classList.remove('show');
}

function createLead() {
    const modal = document.getElementById('leadModal');
    modal.classList.add('show');
}

function closeLeadModal() {
    document.getElementById('leadModal').classList.remove('show');
}

// Profile form submission
document.getElementById('profileForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    try {
        showLoading();
        
        const formData = new FormData(e.target);
        const profileData = {
            firstName: formData.get('firstName'),
            lastName: formData.get('lastName'),
            phone: formData.get('phone'),
            email: formData.get('email')
        };
        
        // Update UI immediately
        document.getElementById('userName').textContent = `${profileData.firstName} ${profileData.lastName}`;
        document.getElementById('userPhone').textContent = profileData.phone;
        document.getElementById('userEmail').textContent = profileData.email;
        document.getElementById('userInitials').textContent = getInitials(profileData.firstName, profileData.lastName);
        
        // Simulate API call
        await apiRequest('/api/user/profile', 'PUT', profileData);
        
        showNotification('Профиль успешно обновлен!');
        closeModal();
        
    } catch (error) {
        console.error('Failed to update profile:', error);
        showNotification('Ошибка при обновлении профиля', 'error');
    } finally {
        hideLoading();
    }
});

// Lead form submission
document.getElementById('leadForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    try {
        showLoading();
        
        const formData = new FormData(e.target);
        const leadData = {
            clientName: formData.get('clientName'),
            clientPhone: formData.get('clientPhone'),
            service: formData.get('service'),
            description: formData.get('description'),
            userId: window.userId
        };
        
        // Simulate API call
        const newLead = await apiRequest('/api/leads', 'POST', leadData);
        
        showNotification('Заявка успешно создана!');
        closeLeadModal();
        
        // Refresh leads list
        await loadUserData();
        
        // Reset form
        e.target.reset();
        
    } catch (error) {
        console.error('Failed to create lead:', error);
        showNotification('Ошибка при создании заявки', 'error');
    } finally {
        hideLoading();
    }
});

// Action buttons
function viewLeads() {
    // Scroll to leads section
    document.querySelector('.leads-section').scrollIntoView({ 
        behavior: 'smooth' 
    });
}

function viewProfile() {
    editProfile();
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    initTelegramWebApp();
    loadUserData();
    
    // Add smooth scrolling for better UX
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            document.querySelector(this.getAttribute('href')).scrollIntoView({
                behavior: 'smooth'
            });
        });
    });
});

// Handle Telegram WebApp events
tg.onEvent('mainButtonClicked', createLead);
tg.onEvent('backButtonClicked', () => {
    // Handle back button
    const modals = document.querySelectorAll('.modal.show');
    if (modals.length > 0) {
        modals[modals.length - 1].classList.remove('show');
    } else {
        tg.close();
    }
});

// Export functions for global access
window.editProfile = editProfile;
window.createLead = createLead;
window.viewLeads = viewLeads;
window.viewProfile = viewProfile;
window.closeModal = closeModal;
window.closeLeadModal = closeLeadModal;
