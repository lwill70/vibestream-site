// VIBESTREAM ADMIN DASHBOARD

// Admin security - default password (change this to your preferred password)
const ADMIN_PASSWORD = 'admin123'; // Change this to a strong password!

// Data keys
const DATA_KEYS = {
  MEDIA: 'vibestream_media',
  UPLOADS: 'vibestream_uploads',
  USERS: 'vibestream_users',
  ADVERTISEMENTS: 'vibestream_ads',
  PODCASTS: 'vibestream_podcasts',
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
  const adminToken = localStorage.getItem('admin_authenticated');
  const loginDialog = document.getElementById('adminLoginDialog');
  const adminContainer = document.querySelector('.admin-container');
  
  if (adminToken === 'true') {
    // Already authenticated
    loginDialog.style.display = 'none';
    adminContainer.style.display = 'grid';
    initAdmin();
  } else {
    // Not authenticated - show login
    loginDialog.style.display = 'flex';
    adminContainer.style.display = 'none';
    setupLoginForm();
  }
}

// Setup admin login form
function setupLoginForm() {
  const form = document.getElementById('adminLoginForm');
  const passwordInput = document.getElementById('adminPassword');
  const loginError = document.getElementById('loginError');
  
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const enteredPassword = passwordInput.value;
    
    if (enteredPassword === ADMIN_PASSWORD) {
      // Authentication successful
      localStorage.setItem('admin_authenticated', 'true');
      loginError.style.display = 'none';
      document.getElementById('adminLoginDialog').style.display = 'none';
      document.querySelector('.admin-container').style.display = 'grid';
      passwordInput.value = '';
      initAdmin();
    } else {
      // Authentication failed
      loginError.style.display = 'block';
      loginError.textContent = '❌ Invalid password. Access denied.';
      passwordInput.value = '';
      passwordInput.focus();
    }
  });
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
  adminState.podcasts = JSON.parse(localStorage.getItem(DATA_KEYS.PODCASTS)) || [];
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
      item.type?.toLowerCase().includes(adminState.contentFilter.toLowerCase())
    );
  }

  const contentList = document.getElementById('content-list');
  contentList.innerHTML = items.map((item, idx) => `
    <div class="content-item">
      <div class="content-item-info">
        <div class="content-item-title">${item.title}</div>
        <div class="content-item-meta">
          By ${item.artist} • ${item.type} • 👁️ ${item.views || 0}K views
        </div>
      </div>
      <div class="content-actions">
        <button class="action-icon-btn" title="Feature" onclick="featureContent(${idx})">⭐</button>
        <button class="action-icon-btn" title="View" onclick="viewContent(${idx})">👁️</button>
        <button class="action-icon-btn" title="Delete" onclick="deleteContent(${idx})">🗑️</button>
      </div>
    </div>
  `).join('');
}

function filterContent(type) {
  document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
  event.target.classList.add('active');
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
  adsList.innerHTML = ads.map((ad, idx) => `
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
        <button class="action-icon-btn" onclick="approveAd(${idx})">✅ Approve</button>
        <button class="action-icon-btn" onclick="rejectAd(${idx})">❌ Reject</button>
        <button class="action-icon-btn" onclick="viewAd(${idx})">👁️ View</button>
      </div>
    </div>
  `).join('');
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

function viewAd(idx) {
  const ad = adminState.advertisements[idx];
  alert(`📢 Advertisement Details:\n\nProduct: ${ad.productName}\nPrice: ${ad.price}\nLocation: ${ad.location}\nDelivery: ${ad.deliveryType}\nSeller: ${ad.seller}`);
}

// LOGOUT FUNCTION
function logout() {
  if (confirm('🚪 Are you sure you want to logout?')) {
    localStorage.removeItem('admin_authenticated');
    window.location.href = 'index.html';
  }
}
}

// SETTINGS
function saveSetting(type) {
  if (type === 'general') {
    alert('✅ General settings saved!');
  } else if (type === 'features') {
    alert('✅ Feature settings saved!');
  } else if (type === 'moderation') {
    alert('✅ Moderation settings saved!');
  }
}

function clearCache() {
  if (confirm('Clear all cache? This action cannot be undone.')) {
    localStorage.clear();
    alert('✅ Cache cleared!');
  }
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
  if (confirm('Logout from admin panel?')) {
    window.location.href = 'index.html';
  }
}

// Initialize on load
window.addEventListener('DOMContentLoaded', initAdmin);
