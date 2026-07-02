// VIBESTREAM - APPLICATION LOGIC

const DATA_KEYS = {
  MEDIA: 'vibestream_media',
  UPLOADS: 'vibestream_uploads',
  PROFILE: 'vibestream_profile',
  FAVORITES: 'vibestream_favorites',
  DOWNLOADS: 'vibestream_downloads',
};

let state = {
  selectedCategory: 'all',
  media: [],
  uploads: [],
  profile: { name: 'John Doe', initials: 'JD', bio: '' },
};

// Sample data
const SAMPLE_TRENDING = [
  { id: 1, title: 'High Vibes', artist: 'DJ Yung', type: 'MUSIC', views: 2.5, likes: 1.2, icon: '🎵' },
  { id: 2, title: 'Street Therapy 2', artist: 'DJ P Kay', type: 'MIXTAPE', views: 1.8, likes: 0.9, icon: '🎤' },
  { id: 3, title: 'The Dark Knight', artist: 'Action', type: 'MOVIE', views: 5.1, likes: 2.8, icon: '🎬' },
  { id: 4, title: 'Power Book II', artist: 'Series', type: 'SERIES', views: 1.6, likes: 0.8, icon: '📺' },
  { id: 5, title: 'Believe', artist: 'Official Video', type: 'MUSIC VIDEO', views: 8.3, likes: 4.2, icon: '🎥' },
  { id: 6, title: 'Album Cover Pack', artist: 'Graphics', type: 'GRAPHICS', views: 0.8, likes: 0.4, icon: '🎨' },
  { id: 7, title: 'John Wick 4', artist: 'Action', type: 'MOVIE', views: 6.2, likes: 3.1, icon: '🎬' },
  { id: 8, title: 'Cyberpunk 2077', artist: 'Gaming', type: 'GRAPHICS', views: 2.1, likes: 1.2, icon: '🎮' },
];

const SAMPLE_UPLOADS = [
  { id: 101, title: 'New Level', artist: 'DJ Blaze', type: 'REMIX', icon: '🎵' },
  { id: 102, title: 'Ghetto Gospel', artist: 'Gospel', type: 'MUSIC', icon: '🎤' },
  { id: 103, title: 'No Mercy', artist: 'Rap', type: 'MUSIC', icon: '🎙️' },
  { id: 104, title: 'The Equalizer 3', artist: 'Movie', type: 'MOVIE', icon: '🎬' },
  { id: 105, title: 'The Boys S4', artist: 'Series', type: 'SERIES', icon: '📺' },
  { id: 106, title: 'Cyberpunk Art', artist: 'Design', type: 'GRAPHICS', icon: '🎨' },
  { id: 107, title: 'Lonely Heart', artist: 'Music', type: 'SINGLE', icon: '🎵' },
  { id: 108, title: 'Street King', artist: 'Music', type: 'ALBUM', icon: '💿' },
];

const CATEGORIES = [
  { name: 'Music', count: 0, icon: '🎵' },
  { name: 'Mixtapes', count: 0, icon: '💿' },
  { name: 'Albums', count: 0, icon: '💿' },
  { name: 'EPs', count: 0, icon: '🎵' },
  { name: 'Movies', count: 0, icon: '🎬' },
  { name: 'Series', count: 0, icon: '📺' },
  { name: 'Music Videos', count: 0, icon: '🎥' },
  { name: 'Graphics', count: 0, icon: '🎨' },
  { name: 'Podcasts', count: 0, icon: '🎙️' },
  { name: 'Marketplace', count: 0, icon: '🛍️' },
];

const TOP_CREATORS = [
  { initials: 'DM', name: 'DJ Maphorisa', role: 'Artist', followed: false },
  { initials: 'DK', name: 'Director K', role: 'Filmmaker', followed: false },
  { initials: 'V', name: 'VisionGFX', role: 'Designer', followed: false },
  { initials: 'SW', name: 'Street Wear', role: 'Seller', followed: false },
  { initials: 'KP', name: 'King Promo', role: 'Promoter', followed: false },
];

const TOP_DOWNLOADS = [
  { num: 1, title: 'Street Therapy 2', artist: 'DJ P Kay' },
  { num: 2, title: 'The Dark Knight', artist: 'Action' },
  { num: 3, title: 'Power Book II Ep 5', artist: 'Series' },
  { num: 4, title: 'Believe', artist: 'Official Video' },
  { num: 5, title: 'Album Cover Pack', artist: 'Graphics' },
];

const BROWSE_CATEGORIES = [
  { name: 'Music', icon: '🎵', count: 0 },
  { name: 'Mixtapes', icon: '💿', count: 0 },
  { name: 'Albums', icon: '💿', count: 0 },
  { name: 'EPs', icon: '🎵', count: 0 },
  { name: 'Movies', icon: '🎬', count: 0 },
  { name: 'Series', icon: '📺', count: 0 },
  { name: 'Music Videos', icon: '🎥', count: 0 },
  { name: 'Graphics', icon: '🎨', count: 0 },
];

// DOM elements
const els = {
  categoryGrid: document.getElementById('categoryGrid'),
  trendingGrid: document.getElementById('trendingGrid'),
  uploadsGrid: document.getElementById('uploadsGrid'),
  browseGrid: document.getElementById('browseGrid'),
  topDownloads: document.getElementById('topDownloads'),
  topCreators: document.getElementById('topCreators'),
  uploadDialog: document.getElementById('uploadDialog'),
  profileDialog: document.getElementById('profileDialog'),
  uploadForm: document.getElementById('uploadForm'),
  profileForm: document.getElementById('profileForm'),
  profileBtn: document.getElementById('profileBtn'),
};

// Initialize
function init() {
  loadData();
  renderCategories();
  renderTrending();
  renderUploads();
  renderBrowse();
  renderTopDownloads();
  renderTopCreators();
  bindEvents();
}

// Load data from localStorage
function loadData() {
  state.media = JSON.parse(localStorage.getItem(DATA_KEYS.MEDIA)) || SAMPLE_TRENDING;
  state.uploads = JSON.parse(localStorage.getItem(DATA_KEYS.UPLOADS)) || SAMPLE_UPLOADS;
  state.profile = JSON.parse(localStorage.getItem(DATA_KEYS.PROFILE)) || { name: 'John Doe', initials: 'JD', bio: '' };
}

// Save data to localStorage
function saveData() {
  localStorage.setItem(DATA_KEYS.MEDIA, JSON.stringify(state.media));
  localStorage.setItem(DATA_KEYS.UPLOADS, JSON.stringify(state.uploads));
  localStorage.setItem(DATA_KEYS.PROFILE, JSON.stringify(state.profile));
}

// Render categories
function renderCategories() {
  els.categoryGrid.innerHTML = CATEGORIES.map(cat => `
    <div class="category-card" data-category="${cat.name.toLowerCase()}">
      <div class="icon">${cat.icon}</div>
      <h4>${cat.name}</h4>
      <p>Unlimited</p>
    </div>
  `).join('');

  document.querySelectorAll('.category-card').forEach(card => {
    card.addEventListener('click', () => {
      state.selectedCategory = card.dataset.category;
      renderTrending();
    });
  });
}

// Render trending
function renderTrending() {
  const items = state.selectedCategory === 'all' ? state.media : state.media.filter(m => m.type.toLowerCase().includes(state.selectedCategory));
  
  if (items.length === 0) {
    els.trendingGrid.innerHTML = '<p style="grid-column: 1/-1; padding: 40px; text-align: center; color: var(--muted);">No content matches your filters.</p>';
    return;
  }

  els.trendingGrid.innerHTML = items.map(item => `
    <div class="content-card">
      <div class="content-card-img">${item.icon}</div>
      <div class="content-card-info">
        <div class="content-card-label">${item.type}</div>
        <div class="content-card-title">${item.title}</div>
        <div class="content-card-artist">${item.artist}</div>
        <div class="content-card-stats">
          <span>👁️ ${item.views}K</span>
          <span>❤️ ${item.likes}K</span>
        </div>
      </div>
    </div>
  `).join('');
}

// Render uploads
function renderUploads() {
  els.uploadsGrid.innerHTML = state.uploads.map(item => `
    <div class="content-card">
      <div class="content-card-img">${item.icon}</div>
      <div class="content-card-info">
        <div class="content-card-label">UPLOAD</div>
        <div class="content-card-title">${item.title}</div>
        <div class="content-card-artist">${item.artist}</div>
      </div>
    </div>
  `).join('');
}

// Render browse categories
function renderBrowse() {
  els.browseGrid.innerHTML = BROWSE_CATEGORIES.map(cat => `
    <div class="browse-item">
      <div class="browse-item-icon">${cat.icon}</div>
      <div class="browse-item-name">${cat.name}<br/><span style="font-size:10px;color:var(--muted)">All Uploads</span></div>
    </div>
  `).join('');
}

// Render top downloads
function renderTopDownloads() {
  els.topDownloads.innerHTML = TOP_DOWNLOADS.map(item => `
    <li><strong>${item.num}.</strong> ${item.title} by ${item.artist}</li>
  `).join('');
}

// Render top creators
function renderTopCreators() {
  els.topCreators.innerHTML = TOP_CREATORS.map((creator, idx) => `
    <div class="creator-item">
      <div class="creator-avatar">${creator.initials}</div>
      <div class="creator-info">
        <div class="creator-name">${creator.name}</div>
        <div class="creator-role">${creator.role}</div>
      </div>
      <button class="creator-follow" data-idx="${idx}">Follow</button>
    </div>
  `).join('');

  document.querySelectorAll('.creator-follow').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      btn.textContent = btn.textContent === 'Follow' ? 'Following' : 'Follow';
      btn.style.background = btn.textContent === 'Following' ? 'var(--accent)' : 'transparent';
      btn.style.color = btn.textContent === 'Following' ? 'white' : 'var(--accent)';
    });
  });
}

// Event listeners
function bindEvents() {
  // Navigation
  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
      item.classList.add('active');
      if (item.dataset.section) {
        state.selectedCategory = item.dataset.section;
        renderTrending();
      }
    });
  });

  // Upload dialog
  document.querySelectorAll('[data-nav="upload"], #sidebarUpload, #sidebarUploadBtn').forEach(el => {
    if (el) el.addEventListener('click', (e) => {
      e.preventDefault();
      els.uploadDialog.showModal();
    });
  });

  document.getElementById('closeUpload')?.addEventListener('click', () => {
    els.uploadDialog.close();
  });

  els.uploadForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const title = els.uploadForm.querySelector('input[name="title"]').value;
    const category = els.uploadForm.querySelector('select[name="category"]').value;
    
    const newUpload = {
      id: Date.now(),
      title,
      artist: state.profile.name,
      type: category.toUpperCase(),
      icon: '🎵',
    };

    state.uploads.unshift(newUpload);
    saveData();
    renderUploads();
    els.uploadDialog.close();
    els.uploadForm.reset();
  });

  // Profile dialog
  els.profileBtn.addEventListener('click', (e) => {
    e.preventDefault();
    els.profileDialog.showModal();
    els.profileForm.querySelector('input[name="displayName"]').value = state.profile.name;
    els.profileForm.querySelector('input[name="initials"]').value = state.profile.initials;
    els.profileForm.querySelector('textarea[name="bio"]').value = state.profile.bio;
  });

  document.getElementById('closeProfile')?.addEventListener('click', () => {
    els.profileDialog.close();
  });

  els.profileForm.addEventListener('submit', (e) => {
    e.preventDefault();
    state.profile.name = els.profileForm.querySelector('input[name="displayName"]').value;
    state.profile.initials = els.profileForm.querySelector('input[name="initials"]').value;
    state.profile.bio = els.profileForm.querySelector('textarea[name="bio"]').value;
    saveData();
    els.profileDialog.close();
  });

  // Search
  document.getElementById('searchInput')?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const query = e.target.value.toLowerCase();
      const filtered = state.media.filter(m => m.title.toLowerCase().includes(query) || m.artist.toLowerCase().includes(query));
      els.trendingGrid.innerHTML = filtered.length ? filtered.map(item => `
        <div class="content-card">
          <div class="content-card-img">${item.icon}</div>
          <div class="content-card-info">
            <div class="content-card-label">${item.type}</div>
            <div class="content-card-title">${item.title}</div>
            <div class="content-card-artist">${item.artist}</div>
            <div class="content-card-stats">
              <span>👁️ ${item.views}K</span>
              <span>❤️ ${item.likes}K</span>
            </div>
          </div>
        </div>
      `).join('') : '<p style="grid-column: 1/-1; padding: 40px; text-align: center; color: var(--muted);">No results found.</p>';
    }
  });
}

// Start
document.addEventListener('DOMContentLoaded', init);
