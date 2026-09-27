// VIBESTREAM ADMIN DASHBOARD

// HARDCODED ADMIN CREDENTIALS - ONLY YOU CAN ACCESS
const ADMIN_EMAIL = 'lwill70.bl@gmail.com';
const ADMIN_PASSWORD = '38841997';

// Data keys
const DATA_KEYS = {
    MEDIA: 'vibestream_media',
    UPLOADS: 'vibestream_uploads',
    USERS: 'vibestream_users',
    ADVERTISEMENTS: 'vibestream_ads',
    PODCASTS: 'vibestream_podcasts',
    MAINTENANCE: 'vibestream_maintenance',
};

let adminState = {
    currentSection: 'dashboard',
    contentFilter: 'all',
    adsFilter: 'all',
    uploads: [],
    users: [],
    advertisements: [],
    podcasts: [],
};

// Check admin authentication on page load
document.addEventListener('DOMContentLoaded', () => {
    checkAdminAuth();
});

// Check if user is authenticated as admin
function checkAdminAuth() {
    const adminToken = localStorage.getItem('admin_authenticated_secure');
    const loginDialog = document.getElementById('adminLoginDialog');
    const adminContainer = document.querySelector('.admin-container');

    if (adminToken === 'true') {
        // Already authenticated
        loginDialog.style.display = 'none';
        adminContainer.style.display = 'grid';
        initAdmin();
    } else {
        // Not authenticated - ALWAYS show login with email + password
        loginDialog.style.display = 'flex';
        adminContainer.style.display = 'none';
        setupLoginForm();
    }
}

// Setup admin login form - HARDCODED CREDENTIALS ONLY
function setupLoginForm() {
    const form = document.getElementById('adminLoginForm');
    const passwordInput = document.getElementById('adminPassword');
    const loginError = document.getElementById('loginError');
    const loginBtn = form.querySelector('.btn-admin-login');

    // Clear any existing fields
    form.innerHTML = '';

    // Add email field
    const emailField = document.createElement('div');
    emailField.className = 'form-group';
    emailField.innerHTML = `
    <label for="adminEmail">Admin Email:</label>
    <input 
      type="email" 
      id="adminEmail" 
      name="adminEmail" 
      placeholder="Enter your admin email" 
      required
    >
  `;
    form.appendChild(emailField);

    // Add password field
    const passwordField = document.createElement('div');
    passwordField.className = 'form-group';
    passwordField.innerHTML = `
    <label for="adminPassword">Admin Password:</label>
    <input 
      type="password" 
      id="adminPassword" 
      name="adminPassword" 
      placeholder="Enter your admin password" 
      required
    >
  `;
    form.appendChild(passwordField);

    // Add login button
    const submitBtn = document.createElement('button');
    submitBtn.type = 'submit';
    submitBtn.className = 'btn-admin-login';
    submitBtn.textContent = '🔓 Unlock Admin Panel';
    form.appendChild(submitBtn);

    // Handle login with hardcoded credentials
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('adminEmail').value.trim();
        const password = document.getElementById('adminPassword').value;

        if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
            // ✅ Authentication successful - ONLY for you!
            localStorage.setItem('admin_authenticated_secure', 'true');
            loginError.style.display = 'none';
            document.getElementById('adminLoginDialog').style.display = 'none';
            document.querySelector('.admin-container').style.display = 'grid';
            form.reset();
            initAdmin();
        } else {
            // ❌ Authentication failed
            showLoginError('❌ Invalid email or password. Access denied.');
            document.getElementById('adminEmail').value = '';
            document.getElementById('adminPassword').value = '';
            document.getElementById('adminEmail').focus();
        }
    });
}

// Show login error
function showLoginError(message) {
    const loginError = document.getElementById('loginError');
    loginError.style.display = 'block';
    loginError.textContent = message;
}

// Initialize admin dashboard
function initAdmin() {
    loadAllData();
    setupEventListeners();
    updateDashboard();
    displayActivity();
}

// Load all data from localStorage
function loadAllData() {
    adminState.uploads = JSON.parse(localStorage.getItem(DATA_KEYS.UPLOADS)) || [];
    adminState.users = JSON.parse(localStorage.getItem(DATA_KEYS.USERS)) || [];
    adminState.advertisements = JSON.parse(localStorage.getItem(DATA_KEYS.ADVERTISEMENTS)) || [];
    adminState.advertisements.forEach(ad => {
        if (!ad.status) ad.status = 'pending';
    });
    adminState.podcasts = JSON.parse(localStorage.getItem(DATA_KEYS.PODCASTS)) || [];
    document.getElementById('maintenance-mode').checked = localStorage.getItem(DATA_KEYS.MAINTENANCE) === 'true';
}

// Setup event listeners
function setupEventListeners() {
    // Navigation
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const section = link.dataset.section;
            switchSection(section);
        });
    });

    const adminAdForm = document.getElementById('admin-ad-form');
    if (adminAdForm) adminAdForm.addEventListener('submit', createAdvertisement);
}

// Switch between sections
function switchSection(section) {
    // Hide all sections
    document.querySelectorAll('.admin-section').forEach(sec => {
        sec.classList.remove('active');
    });

    // Remove active from nav
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
    });

    // Show selected section
    const sectionEl = document.getElementById(section);
    if (sectionEl) {
        sectionEl.classList.add('active');
        adminState.currentSection = section;
    }

    // Mark nav as active
    const navLink = document.querySelector(`[data-section="${section}"]`);
    if (navLink) {
        navLink.classList.add('active');
    }

    // Update title
    const titles = {
        dashboard: 'Dashboard',
        content: 'Content Management',
        users: 'User Management',
        analytics: 'Analytics & Statistics',
        ads: 'Advertisement Management',
        settings: 'Site Settings',
    };

    document.getElementById('section-title').textContent = titles[section] || 'Dashboard';
    document.getElementById('section-subtitle').textContent = `Manage ${titles[section].toLowerCase()}`;

    // Load section data
    if (section === 'content') {
        displayContent();
    } else if (section === 'users') {
        displayUsers();
    } else if (section === 'analytics') {
        displayAnalytics();
    } else if (section === 'ads') {
        displayAds();
    }
}

// UPDATE DASHBOARD
function updateDashboard() {
    let totalViews = 0;
    let totalLikes = 0;

    adminState.uploads.forEach(item => {
        totalViews += item.views || 0;
        totalLikes += item.likes || 0;
    });

    document.getElementById('stat-uploads').textContent = adminState.uploads.length;
    document.getElementById('stat-users').textContent = adminState.users.length;
    document.getElementById('stat-views').textContent = totalViews.toLocaleString();
    document.getElementById('stat-likes').textContent = totalLikes.toLocaleString();
}

// DISPLAY ACTIVITY
function displayActivity() {
    const activities = [];

    // Recent uploads
    adminState.uploads.slice(-5).forEach(item => {
        activities.push({
            type: 'upload',
            text: `📤 New upload: "${item.title}" by ${item.artist}`,
            time: '2 hours ago'
        });
    });

    // Recent users
    adminState.users.slice(-3).forEach(user => {
        activities.push({
            type: 'user',
            text: `👤 New user registered: ${user.username}`,
            time: 'Recently'
        });
    });

    // Recent ads
    adminState.advertisements.slice(-3).forEach(ad => {
        activities.push({
            type: 'ad',
            text: `📢 New ad: "${ad.productName}" by ${ad.seller}`,
            time: 'Recently'
        });
    });

    const feedEl = document.getElementById('activity-feed');
    feedEl.innerHTML = activities.map(act => `
    <div class="activity-item">
      <span>${act.text}</span>
      <span class="activity-time">${act.time}</span>
    </div>
  `).join('');
}

// CONTENT MANAGEMENT
function displayContent() {
    let items = adminState.uploads;

    if (adminState.contentFilter !== 'all') {
        items = items.filter(item =>
            (item.type || '').toLowerCase().includes(adminState.contentFilter.toLowerCase())
        );
    }

    const contentList = document.getElementById('content-list');
    contentList.innerHTML = items.map((item) => {
        const originalIndex = adminState.uploads.indexOf(item);
        return `
    <div class="content-item">
      <div class="content-item-info">
        <div class="content-item-title">${item.title}</div>
        <div class="content-item-meta">
          By ${item.artist} • ${item.type} • 👁️ ${item.views || 0}K views
        </div>
      </div>
      <div class="content-actions">
        <button class="action-icon-btn" title="Feature" onclick="featureContent(${originalIndex})">⭐</button>
        <button class="action-icon-btn" title="View" onclick="viewContent(${originalIndex})">👁️</button>
        <button class="action-icon-btn" title="Delete" onclick="deleteContent(${originalIndex})">🗑️</button>
      </div>
    </div>
  `;
    }).join('');
}

function filterContent(type) {
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    const clickedButton = [...document.querySelectorAll('.tab-btn')].find(btn => btn.textContent.toLowerCase().includes(type === 'all' ? 'all' : type));
    if (clickedButton) clickedButton.classList.add('active');
    adminState.contentFilter = type;
    displayContent();
}

function featureContent(idx) {
    const item = adminState.uploads[idx];
    item.featured = !item.featured;
    localStorage.setItem(DATA_KEYS.UPLOADS, JSON.stringify(adminState.uploads));
    alert(`✅ ${item.title} ${item.featured ? 'featured' : 'unfeatured'}!`);
    displayContent();
}

function viewContent(idx) {
    const item = adminState.uploads[idx];
    alert(`📁 Content Details:\n\nTitle: ${item.title}\nArtist: ${item.artist}\nType: ${item.type}\nViews: ${item.views}K\nLikes: ${item.likes}K`);
}

function deleteContent(idx) {
    if (confirm('Are you sure you want to delete this content?')) {
        const item = adminState.uploads[idx];
        adminState.uploads.splice(idx, 1);
        localStorage.setItem(DATA_KEYS.UPLOADS, JSON.stringify(adminState.uploads));
        const media = JSON.parse(localStorage.getItem(DATA_KEYS.MEDIA)) || [];
        localStorage.setItem(DATA_KEYS.MEDIA, JSON.stringify(media.filter(mediaItem => mediaItem.id !== item.id)));
        updateDashboard();
        displayActivity();
        displayContent();
        alert(`✅ ${item.title} deleted!`);
    }
}

function refreshContent() {
    loadAllData();
    displayContent();
    alert('✅ Content refreshed!');
}

// USER MANAGEMENT
function displayUsers() {
    const tbody = document.getElementById('users-table-body');
    tbody.innerHTML = adminState.users.map((user, idx) => `
    <tr>
      <td>${user.username}</td>
      <td>${user.email}</td>
      <td>Creator</td>
      <td>${new Date(user.createdAt).toLocaleDateString()}</td>
      <td><span class="status-badge status-active">✅ Active</span></td>
      <td>
        <button class="action-icon-btn" onclick="viewUser(${idx})">👁️</button>
        <button class="action-icon-btn" onclick="banUser(${idx})">🚫</button>
      </td>
    </tr>
  `).join('');
}

function viewUser(idx) {
    const user = adminState.users[idx];
    alert(`👤 User Details:\n\nUsername: ${user.username}\nEmail: ${user.email}\nJoined: ${new Date(user.createdAt).toLocaleDateString()}`);
}

function banUser(idx) {
    if (confirm('Ban this user?')) {
        const user = adminState.users[idx];
        adminState.users.splice(idx, 1);
        localStorage.setItem(DATA_KEYS.USERS, JSON.stringify(adminState.users));
        updateDashboard();
        displayUsers();
        alert(`✅ ${user.username} banned!`);
    }
}

function exportUsers() {
    const data = JSON.stringify(adminState.users, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'users.json';
    link.click();
    alert('✅ Users exported!');
}

// ANALYTICS
function displayAnalytics() {
    // Top content
    const topContent = [...adminState.uploads]
        .sort((a, b) => (b.views || 0) - (a.views || 0))
        .slice(0, 5);

    const topContentEl = document.getElementById('top-content');
    topContentEl.innerHTML = topContent.map(item => `
    <div class="top-item">
      <span class="top-item-name">${item.title}</span>
      <span class="top-item-count">${item.views}K views</span>
    </div>
  `).join('');

    // Top creators
    const creatorViews = {};
    adminState.uploads.forEach(item => {
        creatorViews[item.artist] = (creatorViews[item.artist] || 0) + (item.views || 0);
    });

    const topCreators = Object.entries(creatorViews)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);

    const topCreatorsEl = document.getElementById('top-creators');
    topCreatorsEl.innerHTML = topCreators.map(([name, views]) => `
    <div class="top-item">
      <span class="top-item-name">${name}</span>
      <span class="top-item-count">${views}K views</span>
    </div>
  `).join('');

    // Category distribution
    const categoryStats = {};
    adminState.uploads.forEach(item => {
        categoryStats[item.type] = (categoryStats[item.type] || 0) + 1;
    });

    const maxCount = Math.max(...Object.values(categoryStats), 1);

    const categoryStatsEl = document.getElementById('category-stats');
    categoryStatsEl.innerHTML = Object.entries(categoryStats).map(([category, count]) => {
        const percentage = (count / maxCount) * 100;
        return `
      <div class="category-bar">
        <div class="category-label">${category}</div>
        <div class="category-progress">
          <div class="category-fill" style="width: ${percentage}%">${count}</div>
        </div>
      </div>
    `;
    }).join('');
}

function changeTimeRange(range) {
    // In a real app, this would filter data by date
    alert(`📊 Showing analytics for: ${range}`);
}

// ADVERTISEMENTS MANAGEMENT
function displayAds() {
    let ads = adminState.advertisements;

    if (adminState.adsFilter !== 'all') {
        ads = ads.filter(ad => ad.status === adminState.adsFilter);
    }

    const adsList = document.getElementById('ads-list');
    adsList.innerHTML = ads.map((ad) => {
        const originalIndex = adminState.advertisements.indexOf(ad);
        return `
    <div class="ad-card">
      <div class="ad-image">📦</div>
      <div class="ad-info">
        <h3>${ad.productName}</h3>
        <p><strong>Seller:</strong> ${ad.seller}</p>
        <p><strong>Location:</strong> ${ad.location}</p>
        <div class="ad-price">${ad.price}</div>
        <p>${ad.description.substring(0, 60)}...</p>
      </div>
      <div class="ad-actions">
        <button class="action-icon-btn" onclick="approveAd(${originalIndex})">✅ Approve</button>
        <button class="action-icon-btn" onclick="rejectAd(${originalIndex})">❌ Reject</button>
        <button class="action-icon-btn" onclick="viewAd(${originalIndex})">👁️ View</button>
        <button class="action-icon-btn" onclick="deleteAd(${originalIndex})">🗑️ Delete</button>
      </div>
    </div>
  `;
    }).join('');
}

function toggleAdForm(force) {
    const form = document.getElementById('admin-ad-form');
    if (!form) return;
    form.hidden = typeof force === 'boolean' ? !force : !form.hidden;
}

function createAdvertisement(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const values = new FormData(form);
    const ad = {
        id: Date.now(),
        productName: values.get('productName').trim(),
        price: values.get('price').trim(),
        location: values.get('location').trim(),
        phone: values.get('phone').trim(),
        whatsapp: values.get('whatsapp').trim(),
        facebook: values.get('facebook').trim(),
        deliveryType: values.get('deliveryType'),
        description: values.get('description').trim(),
        seller: 'LWILL',
        status: 'pending',
        createdAt: new Date().toISOString(),
        imageUrl: 'https://picsum.photos/420/260?random=' + Date.now(),
    };
    adminState.advertisements.unshift(ad);
    localStorage.setItem(DATA_KEYS.ADVERTISEMENTS, JSON.stringify(adminState.advertisements));
    form.reset();
    toggleAdForm(false);
    displayAds();
    displayActivity();
    alert(`✅ Advertisement "${ad.productName}" saved as pending.`);
}

function filterAds(status) {
    adminState.adsFilter = status;
    displayAds();
}

function approveAd(idx) {
    const ad = adminState.advertisements[idx];
    ad.status = 'active';
    localStorage.setItem(DATA_KEYS.ADVERTISEMENTS, JSON.stringify(adminState.advertisements));
    displayAds();
    alert(`✅ Ad "${ad.productName}" approved!`);
}

function rejectAd(idx) {
    const ad = adminState.advertisements[idx];
    ad.status = 'rejected';
    localStorage.setItem(DATA_KEYS.ADVERTISEMENTS, JSON.stringify(adminState.advertisements));
    displayAds();
    alert(`❌ Ad "${ad.productName}" rejected!`);
}

function deleteAd(idx) {
    const ad = adminState.advertisements[idx];
    if (!ad || !confirm(`Delete the advertisement "${ad.productName}"?`)) return;
    adminState.advertisements.splice(idx, 1);
    localStorage.setItem(DATA_KEYS.ADVERTISEMENTS, JSON.stringify(adminState.advertisements));
    displayAds();
    displayActivity();
    alert(`✅ Ad "${ad.productName}" deleted.`);
}

function viewAd(idx) {
    const ad = adminState.advertisements[idx];
    alert(`📢 Advertisement Details:\n\nProduct: ${ad.productName}\nPrice: ${ad.price}\nLocation: ${ad.location}\nDelivery: ${ad.deliveryType}\nSeller: ${ad.seller}`);
}

// LOGOUT FUNCTION
function logout() {
    if (confirm('🚪 Are you sure you want to logout? You will need to login again.')) {
        localStorage.removeItem('admin_authenticated_secure');
        window.location.href = 'index.html';
    }
}

// SETTINGS
function saveSetting(type) {
    const settings = JSON.parse(localStorage.getItem('vibestream_settings') || '{}');
    if (type === 'general') {
        settings.siteName = document.getElementById('setting-sitename').value.trim();
        settings.description = document.getElementById('setting-description').value.trim();
        settings.email = document.getElementById('setting-email').value.trim();
        localStorage.setItem('vibestream_settings', JSON.stringify(settings));
        alert('✅ General settings saved!');
    } else if (type === 'features') {
        settings.features = {
            uploads: document.getElementById('feature-uploads').checked,
            ads: document.getElementById('feature-ads').checked,
            podcasts: document.getElementById('feature-podcasts').checked,
            marketplace: document.getElementById('feature-marketplace').checked,
        };
        localStorage.setItem('vibestream_settings', JSON.stringify(settings));
        alert('✅ Feature settings saved!');
    } else if (type === 'moderation') {
        settings.moderation = {
            autoApprove: document.getElementById('mod-auto-approve').checked,
            explicitFilter: document.getElementById('mod-explicit-filter').checked,
            spamFilter: document.getElementById('mod-spam-filter').checked,
        };
        localStorage.setItem('vibestream_settings', JSON.stringify(settings));
        alert('✅ Moderation settings saved!');
    }
}

function saveMaintenanceMode() {
    const enabled = document.getElementById('maintenance-mode').checked;
    localStorage.setItem(DATA_KEYS.MAINTENANCE, String(enabled));
    alert(enabled ? '⚠️ Maintenance mode is now visible to visitors.' : '✅ Maintenance mode is off.');
}

function clearCache() {
    if (!confirm('Clear temporary browser cache only? Your uploads, ads, users, and admin access will stay safe.')) return;
    localStorage.removeItem('vibestream_podcast_query');
    localStorage.removeItem('vibestream_podcast_filter');
    alert('✅ Temporary cache cleared. Your saved site data was kept.');
}

function exportData() {
    const data = {
        uploads: adminState.uploads,
        users: adminState.users,
        advertisements: adminState.advertisements,
        podcasts: adminState.podcasts,
        exportedAt: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `vibestream-backup-${Date.now()}.json`;
    link.click();
    alert('✅ Data exported!');
}

function resetDatabase() {
    if (confirm('⚠️ This will PERMANENTLY delete all data! Are you absolutely sure?')) {
        if (confirm('Last chance - this cannot be undone!')) {
            localStorage.clear();
            location.reload();
        }
    }
}

// NAVIGATION
function backToSite() {
    window.location.href = 'index.html';
}

function logout() {
    if (confirm('🚪 Are you sure you want to logout? You will need to login again.')) {
        localStorage.removeItem('admin_authenticated_secure');
        window.location.href = 'index.html';
    }
}

// NOTE: Admin initializes only through checkAdminAuth() -> initAdmin() after password is verified