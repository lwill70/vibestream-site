// VIBESTREAM - APPLICATION LOGIC

const DATA_KEYS = {
  MEDIA: 'vibestream_media',
  UPLOADS: 'vibestream_uploads',
  PROFILE: 'vibestream_profile',
  FAVORITES: 'vibestream_favorites',
  DOWNLOADS: 'vibestream_downloads',
  USERS: 'vibestream_users',
  CURRENT_USER: 'vibestream_current_user',
  ADVERTISEMENTS: 'vibestream_ads',
  PODCASTS: 'vibestream_podcasts',
};

let state = {
  selectedCategory: 'all',
  media: [],
  uploads: [],
  profile: { name: 'John Doe', initials: 'JD', bio: '' },
  currentUser: null,
  users: [],
  advertisements: [],
  podcasts: [],
  recordingPodcast: null,
};

// Sample data - with image URLs
const SAMPLE_TRENDING = [
  { id: 1, title: 'High Vibes', artist: 'DJ Yung', type: 'MUSIC', views: 2.5, likes: 1.2, icon: '🎵', image: 'https://picsum.photos/200/200?random=1' },
  { id: 2, title: 'Street Therapy 2', artist: 'DJ P Kay', type: 'MIXTAPE', views: 1.8, likes: 0.9, icon: '🎤', image: 'https://picsum.photos/200/200?random=2' },
  { id: 3, title: 'The Dark Knight', artist: 'Action', type: 'MOVIE', views: 5.1, likes: 2.8, icon: '🎬', image: 'https://picsum.photos/200/200?random=3' },
  { id: 4, title: 'Power Book II', artist: 'Series', type: 'SERIES', views: 1.6, likes: 0.8, icon: '📺', image: 'https://picsum.photos/200/200?random=4' },
  { id: 5, title: 'Believe', artist: 'Official Video', type: 'MUSIC VIDEO', views: 8.3, likes: 4.2, icon: '🎥', image: 'https://picsum.photos/200/200?random=5' },
  { id: 6, title: 'Album Cover Pack', artist: 'Graphics', type: 'GRAPHICS', views: 0.8, likes: 0.4, icon: '🎨', image: 'https://picsum.photos/200/200?random=6' },
  { id: 7, title: 'John Wick 4', artist: 'Action', type: 'MOVIE', views: 6.2, likes: 3.1, icon: '🎬', image: 'https://picsum.photos/200/200?random=7' },
  { id: 8, title: 'Cyberpunk 2077', artist: 'Gaming', type: 'GRAPHICS', views: 2.1, likes: 1.2, icon: '🎮', image: 'https://picsum.photos/200/200?random=8' },
];

const SAMPLE_UPLOADS = [
  { id: 101, title: 'New Level', artist: 'DJ Blaze', type: 'REMIX', icon: '🎵', image: 'https://picsum.photos/200/200?random=101' },
  { id: 102, title: 'Ghetto Gospel', artist: 'Gospel', type: 'MUSIC', icon: '🎤', image: 'https://picsum.photos/200/200?random=102' },
  { id: 103, title: 'No Mercy', artist: 'Rap', type: 'MUSIC', icon: '🎙️', image: 'https://picsum.photos/200/200?random=103' },
  { id: 104, title: 'The Equalizer 3', artist: 'Movie', type: 'MOVIE', icon: '🎬', image: 'https://picsum.photos/200/200?random=104' },
  { id: 105, title: 'The Boys S4', artist: 'Series', type: 'SERIES', icon: '📺', image: 'https://picsum.photos/200/200?random=105' },
  { id: 106, title: 'Cyberpunk Art', artist: 'Design', type: 'GRAPHICS', icon: '🎨', image: 'https://picsum.photos/200/200?random=106' },
  { id: 107, title: 'Lonely Heart', artist: 'Music', type: 'SINGLE', icon: '🎵', image: 'https://picsum.photos/200/200?random=107' },
  { id: 108, title: 'Street King', artist: 'Music', type: 'ALBUM', icon: '💿', image: 'https://picsum.photos/200/200?random=108' },
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
  { initials: 'DM', name: 'DJ Maphorisa', role: 'Artist', followed: false, image: 'https://picsum.photos/80/80?random=201' },
  { initials: 'DK', name: 'Director K', role: 'Filmmaker', followed: false, image: 'https://picsum.photos/80/80?random=202' },
  { initials: 'V', name: 'VisionGFX', role: 'Designer', followed: false, image: 'https://picsum.photos/80/80?random=203' },
  { initials: 'SW', name: 'Street Wear', role: 'Seller', followed: false, image: 'https://picsum.photos/80/80?random=204' },
  { initials: 'KP', name: 'King Promo', role: 'Promoter', followed: false, image: 'https://picsum.photos/80/80?random=205' },
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
  loginDialog: document.getElementById('loginDialog'),
  advertiseDialog: document.getElementById('advertiseDialog'),
  podcastDialog: document.getElementById('podcastDialog'),
  uploadForm: document.getElementById('uploadForm'),
  profileForm: document.getElementById('profileForm'),
  loginForm: document.getElementById('loginForm'),
  registerForm: document.getElementById('registerForm'),
  advertiseForm: document.getElementById('advertiseForm'),
  podcastForm: document.getElementById('podcastForm'),
  profileBtn: document.getElementById('profileBtn'),
  loginBtn: document.getElementById('loginBtn'),
  playerDialog: document.getElementById('playerDialog'),
  videoPlayer: document.getElementById('videoPlayer'),
  audioPlayer: document.getElementById('audioPlayer'),
  audioElement: document.getElementById('audioElement'),
  fallbackPlayer: document.getElementById('fallbackPlayer'),
  playPauseBtn: document.getElementById('playPauseBtn'),
  stopBtn: document.getElementById('stopBtn'),
};

// Initialize
function init() {
  loadData();
  setupHeroImage();
  renderCategories();
  renderTrending();
  renderUploads();
  renderBrowse();
  renderTopDownloads();
  renderTopCreators();
  setupPlayerControls();
  bindEvents();
}

// Setup hero image
function setupHeroImage() {
  const heroImage = document.getElementById('heroImage');
  if (heroImage) {
    heroImage.style.backgroundImage = 'url("https://picsum.photos/600/400?random=hero")';
  }
}

// Load data from localStorage
function loadData() {
  state.media = JSON.parse(localStorage.getItem(DATA_KEYS.MEDIA)) || SAMPLE_TRENDING;
  state.uploads = JSON.parse(localStorage.getItem(DATA_KEYS.UPLOADS)) || SAMPLE_UPLOADS;
  state.profile = JSON.parse(localStorage.getItem(DATA_KEYS.PROFILE)) || { name: 'John Doe', initials: 'JD', bio: '' };
  state.currentUser = JSON.parse(localStorage.getItem(DATA_KEYS.CURRENT_USER));
  state.users = JSON.parse(localStorage.getItem(DATA_KEYS.USERS)) || [];
  state.advertisements = JSON.parse(localStorage.getItem(DATA_KEYS.ADVERTISEMENTS)) || [];
  state.podcasts = JSON.parse(localStorage.getItem(DATA_KEYS.PODCASTS)) || [];
  updateLoginButtonState();
}

// Save data to localStorage
function saveData() {
  localStorage.setItem(DATA_KEYS.MEDIA, JSON.stringify(state.media));
  localStorage.setItem(DATA_KEYS.UPLOADS, JSON.stringify(state.uploads));
  localStorage.setItem(DATA_KEYS.PROFILE, JSON.stringify(state.profile));
  localStorage.setItem(DATA_KEYS.USERS, JSON.stringify(state.users));
  localStorage.setItem(DATA_KEYS.ADVERTISEMENTS, JSON.stringify(state.advertisements));
  localStorage.setItem(DATA_KEYS.PODCASTS, JSON.stringify(state.podcasts));
  if (state.currentUser) {
    localStorage.setItem(DATA_KEYS.CURRENT_USER, JSON.stringify(state.currentUser));
  }
}

// Update login button state
function updateLoginButtonState() {
  if (state.currentUser) {
    els.loginBtn.textContent = `👤 ${state.currentUser.username}`;
    els.loginBtn.classList.add('logged-in');
  } else {
    els.loginBtn.textContent = 'Login / Register';
    els.loginBtn.classList.remove('logged-in');
  }
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

  els.trendingGrid.innerHTML = items.map((item, idx) => `
    <div class="content-card" data-content-id="trending-${idx}">
      <div class="content-card-img" style="background-image: url('${item.image}'); background-size: cover; background-position: center;"><img src="${item.image}" style="display:none;" onerror="this.parentElement.innerHTML='${item.icon}'"/></div>
      <div class="content-card-info">
        <div class="content-card-label">${item.type}</div>
        <div class="content-card-title">${item.title}</div>
        <div class="content-card-artist">${item.artist}</div>
        <div class="content-card-stats">
          <span>👁️ ${item.views}K</span>
          <span>❤️ ${item.likes}K</span>
        </div>
        <div class="content-card-actions">
          <button class="btn-action btn-stream" data-id="trending-${idx}" title="Stream this content">▶ Stream</button>
          <button class="btn-action btn-download" data-id="trending-${idx}" title="Download">⬇ Download</button>
          <button class="btn-action btn-view" data-id="trending-${idx}" title="View details">👁 View</button>
        </div>
      </div>
    </div>
  `).join('');
  
  bindMediaActions(items, 'trending');
}

// Render uploads
function renderUploads() {
  els.uploadsGrid.innerHTML = state.uploads.map((item, idx) => `
    <div class="content-card" data-content-id="upload-${idx}">
      <div class="content-card-img" style="background-image: url('${item.image}'); background-size: cover; background-position: center;"><img src="${item.image}" style="display:none;" onerror="this.parentElement.innerHTML='${item.icon}'"/></div>
      <div class="content-card-info">
        <div class="content-card-label">UPLOAD</div>
        <div class="content-card-title">${item.title}</div>
        <div class="content-card-artist">${item.artist}</div>
        <div class="content-card-actions">
          <button class="btn-action btn-stream" data-id="upload-${idx}" title="Stream this content">▶ Stream</button>
          <button class="btn-action btn-publish" data-id="upload-${idx}" title="Publish">📤 Publish</button>
          <button class="btn-action btn-download" data-id="upload-${idx}" title="Download">⬇ Download</button>
          <button class="btn-action btn-view" data-id="upload-${idx}" title="View details">👁 View</button>
        </div>
      </div>
    </div>
  `).join('');
  
  bindMediaActions(state.uploads, 'upload');
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

// Render advertisements
function renderAdvertisements() {
  const adsContainer = document.querySelector('[data-section="marketplace"]') || document.getElementById('marketplaceGrid');
  if (!adsContainer) return;

  if (state.advertisements.length === 0) {
    adsContainer.innerHTML = '<p style="grid-column: 1/-1; padding: 40px; text-align: center; color: var(--muted);">No products listed. Be the first to advertise!</p>';
    return;
  }

  adsContainer.innerHTML = state.advertisements.map(ad => `
    <div class="product-card">
      <div class="product-card-header">
        <div>
          <div class="product-card-title">${ad.productName}</div>
          <div class="product-card-seller">by ${ad.seller}</div>
        </div>
        <div class="product-card-price">${ad.price}</div>
      </div>
      <div class="product-card-info">
        <div>📍 ${ad.location}</div>
        <div>🚚 ${ad.deliveryType}</div>
      </div>
      <p style="font-size: 13px; color: var(--text); margin: 8px 0;">${ad.description}</p>
      <div class="product-card-contact">
        <a href="tel:${ad.phone}" class="contact-btn">📞 ${ad.phone}</a>
        ${ad.whatsapp ? `<a href="https://wa.me/${ad.whatsapp}" target="_blank" class="contact-btn whatsapp">💬 WhatsApp</a>` : ''}
        ${ad.facebook ? `<a href="${ad.facebook}" target="_blank" class="contact-btn facebook">f Facebook</a>` : ''}
        ${ad.tiktok ? `<a href="https://tiktok.com/@${ad.tiktok}" target="_blank" class="contact-btn tiktok">TikTok</a>` : ''}
        ${ad.instagram ? `<a href="https://instagram.com/${ad.instagram}" target="_blank" class="contact-btn instagram">📷 Instagram</a>` : ''}
      </div>
    </div>
  `).join('');
}

// Render podcasts
function renderPodcasts() {
  const podcastsList = document.getElementById('podcastsList');
  if (!podcastsList) return;

  if (state.podcasts.length === 0) {
    podcastsList.innerHTML = '<p style="color: var(--muted); text-align: center; padding: 20px;">No episodes recorded yet.</p>';
    return;
  }

  podcastsList.innerHTML = state.podcasts.map(podcast => `
    <div class="podcast-item">
      <div style="display: flex; justify-content: space-between; align-items: start;">
        <div>
          <strong>${podcast.title}</strong>
          <div class="podcast-item .duration">Duration: ${Math.floor(podcast.duration / 60)}:${(podcast.duration % 60).toString().padStart(2, '0')}</div>
          <div style="font-size: 11px; color: var(--muted); margin-top: 4px;">by ${podcast.creator}</div>
        </div>
        <button class="contact-btn" onclick="downloadPodcastEpisode(${podcast.id})">⬇ Download</button>
      </div>
      <p style="font-size: 12px; color: var(--text); margin-top: 6px;">${podcast.description}</p>
      ${podcast.tags ? `<p style="font-size: 11px; color: var(--muted); margin-top: 4px;">Tags: ${podcast.tags}</p>` : ''}
    </div>
  `).join('');
}

// Download podcast episode
function downloadPodcastEpisode(podcastId) {
  const podcast = state.podcasts.find(p => p.id === podcastId);
  if (podcast) {
    alert(`✅ Download started: ${podcast.title}`);
    // In a real app, this would download the actual audio file
  }
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
      <div class="creator-avatar" style="background-image: url('${creator.image}'); background-size: cover; background-position: center;">
        <img src="${creator.image}" style="display:none;" onerror="this.parentElement.innerHTML='${creator.initials}'"/>
      </div>
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

  // Upload dialog - sidebar and header buttons
  document.querySelectorAll('[data-nav="upload"], #sidebarUpload, #sidebarUploadBtn').forEach(el => {
    if (el) {
      el.addEventListener('click', (e) => {
        e.preventDefault();
        els.uploadDialog.showModal();
      });
    }
  });

  // Top header upload button
  const uploadTopBtns = document.querySelectorAll('.btn-top');
  uploadTopBtns.forEach(btn => {
    if (btn.textContent.includes('Upload')) {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        els.uploadDialog.showModal();
      });
    }
  });

  // Advertise button handler - sidebar
  document.querySelectorAll('[data-nav="advertise"]').forEach(el => {
    if (el) {
      el.addEventListener('click', (e) => {
        e.preventDefault();
        els.advertiseDialog.showModal();
      });
    }
  });

  // Top header advertise button
  const advertiseTopBtns = document.querySelectorAll('.btn-top');
  advertiseTopBtns.forEach(btn => {
    if (btn.textContent.includes('Advertise')) {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        els.advertiseDialog.showModal();
      });
    }
  });

  // Login button handler
  els.loginBtn.addEventListener('click', (e) => {
    e.preventDefault();
    els.loginDialog.showModal();
  });

  // Login/Register tab switching
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const tabName = e.target.dataset.tab;
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');
      if (tabName === 'login') {
        els.loginForm.style.display = 'block';
        els.registerForm.style.display = 'none';
      } else {
        els.loginForm.style.display = 'none';
        els.registerForm.style.display = 'block';
      }
    });
  });

  // Login form submission
  els.loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = els.loginForm.querySelector('input[name="loginEmail"]').value;
    const password = els.loginForm.querySelector('input[name="loginPassword"]').value;

    // Find user
    const user = state.users.find(u => u.email === email && u.password === password);
    if (user) {
      state.currentUser = user;
      saveData();
      updateLoginButtonState();
      els.loginDialog.close();
      els.loginForm.reset();
      alert(`✅ Welcome back, ${user.username}!`);
    } else {
      alert('❌ Invalid email or password');
    }
  });

  // Register form submission
  els.registerForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const username = els.registerForm.querySelector('input[name="regUsername"]').value;
    const email = els.registerForm.querySelector('input[name="regEmail"]').value;
    const password = els.registerForm.querySelector('input[name="regPassword"]').value;
    const confirm = els.registerForm.querySelector('input[name="regConfirm"]').value;

    if (password !== confirm) {
      alert('❌ Passwords do not match');
      return;
    }

    if (state.users.find(u => u.email === email)) {
      alert('❌ Email already registered');
      return;
    }

    const newUser = {
      id: Date.now(),
      username,
      email,
      password,
      createdAt: new Date().toISOString(),
    };

    state.users.push(newUser);
    state.currentUser = newUser;
    saveData();
    updateLoginButtonState();
    els.loginDialog.close();
    els.registerForm.reset();
    alert(`✅ Account created! Welcome, ${username}!`);
  });

  // Close dialogs
  document.getElementById('closeLogin')?.addEventListener('click', () => {
    els.loginDialog.close();
  });

  document.getElementById('closeAdvertise')?.addEventListener('click', () => {
    els.advertiseDialog.close();
  });

  document.getElementById('closePodcast')?.addEventListener('click', () => {
    els.podcastDialog.close();
  });

  // Advertise form submission
  els.advertiseForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const ad = {
      id: Date.now(),
      productName: els.advertiseForm.querySelector('input[name="productName"]').value,
      price: els.advertiseForm.querySelector('input[name="price"]').value,
      location: els.advertiseForm.querySelector('input[name="location"]').value,
      deliveryType: els.advertiseForm.querySelector('select[name="deliveryType"]').value,
      phone: els.advertiseForm.querySelector('input[name="phone"]').value,
      whatsapp: els.advertiseForm.querySelector('input[name="whatsapp"]').value,
      facebook: els.advertiseForm.querySelector('input[name="facebook"]').value,
      tiktok: els.advertiseForm.querySelector('input[name="tiktok"]').value,
      instagram: els.advertiseForm.querySelector('input[name="instagram"]').value,
      description: els.advertiseForm.querySelector('textarea[name="description"]').value,
      createdAt: new Date().toISOString(),
      seller: state.currentUser?.username || 'Anonymous',
    };

    state.advertisements.unshift(ad);
    saveData();
    els.advertiseDialog.close();
    els.advertiseForm.reset();
    alert(`✅ Your ad is now live!\n\n${ad.productName}\n${ad.price}\n\nReach thousands of buyers on Vibestream!`);
  });

  // Podcast recording handlers
  let mediaRecorder;
  let audioChunks = [];
  let recordingStartTime;
  let recordingInterval;

  document.getElementById('startRecording')?.addEventListener('click', async (e) => {
    e.preventDefault();
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder = new MediaRecorder(stream);
      audioChunks = [];
      recordingStartTime = Date.now();

      mediaRecorder.ondataavailable = (event) => {
        audioChunks.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
        state.recordingPodcast = {
          blob: audioBlob,
          duration: Math.floor((Date.now() - recordingStartTime) / 1000),
        };
      };

      mediaRecorder.start();
      document.getElementById('podcastStatus').textContent = '🔴 Recording...';
      document.getElementById('startRecording').style.display = 'none';
      document.getElementById('stopRecording').style.display = 'block';
      document.getElementById('pauseRecording').style.display = 'block';

      recordingInterval = setInterval(() => {
        const elapsed = Math.floor((Date.now() - recordingStartTime) / 1000);
        const mins = Math.floor(elapsed / 60);
        const secs = elapsed % 60;
        document.getElementById('podcastDuration').textContent = `${mins}:${secs.toString().padStart(2, '0')}`;
      }, 1000);
    } catch (err) {
      alert('❌ Microphone access denied. Please allow microphone access to record.');
    }
  });

  document.getElementById('stopRecording')?.addEventListener('click', (e) => {
    e.preventDefault();
    mediaRecorder.stop();
    clearInterval(recordingInterval);
    document.getElementById('podcastStatus').textContent = '✅ Recording Complete';
    document.getElementById('stopRecording').style.display = 'none';
    document.getElementById('pauseRecording').style.display = 'none';
    document.getElementById('startRecording').style.display = 'block';
    document.getElementById('podcastForm').style.display = 'block';
  });

  document.getElementById('downloadPodcast')?.addEventListener('click', (e) => {
    e.preventDefault();
    if (state.recordingPodcast) {
      const url = URL.createObjectURL(state.recordingPodcast.blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `podcast_${Date.now()}.wav`;
      a.click();
      URL.revokeObjectURL(url);
    }
  });

  els.podcastForm.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!state.recordingPodcast) {
      alert('❌ No recording to save');
      return;
    }

    const podcast = {
      id: Date.now(),
      title: els.podcastForm.querySelector('input[name="podcastTitle"]').value,
      description: els.podcastForm.querySelector('textarea[name="podcastDesc"]').value,
      tags: els.podcastForm.querySelector('input[name="podcastTags"]').value,
      duration: state.recordingPodcast.duration,
      creator: state.currentUser?.username || 'Anonymous',
      createdAt: new Date().toISOString(),
      published: true,
    };

    state.podcasts.unshift(podcast);
    saveData();
    els.podcastDialog.close();
    els.podcastForm.reset();
    state.recordingPodcast = null;
    document.getElementById('podcastStatus').textContent = 'Ready';
    document.getElementById('podcastDuration').textContent = '0:00';
    document.getElementById('podcastForm').style.display = 'none';
    alert(`✅ Podcast Episode Published!\n\n${podcast.title}\n\nListeners can now find your episode!`);
  });

  document.getElementById('closeUpload')?.addEventListener('click', () => {
    els.uploadDialog.close();
  });

  els.uploadForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const title = els.uploadForm.querySelector('input[name="title"]').value;
    const artistName = els.uploadForm.querySelector('input[name="artistName"]').value;
    const category = els.uploadForm.querySelector('select[name="category"]').value;
    const genre = els.uploadForm.querySelector('input[name="genre"]').value;
    const albumName = els.uploadForm.querySelector('input[name="albumName"]').value;
    const features = els.uploadForm.querySelector('input[name="features"]').value;
    const tracklist = els.uploadForm.querySelector('textarea[name="tracklist"]').value;
    const description = els.uploadForm.querySelector('textarea[name="description"]').value;
    
    const newUpload = {
      id: Date.now(),
      title,
      artist: artistName || state.profile.name,
      type: category.toUpperCase(),
      genre: genre || null,
      icon: '🎵',
      albumName: albumName || null,
      features: features || null,
      tracklist: tracklist ? tracklist.split('\n').filter(t => t.trim()) : null,
      description: description || null,
      coverUrl: null,
      published: true,  // Auto-publish when uploaded
      publishedAt: new Date().toISOString(),
    };

    // Add to uploads and also to trending (published content)
    state.uploads.unshift(newUpload);
    state.media.unshift({
      ...newUpload,
      views: 0,
      likes: 0,
    });
    
    saveData();
    renderUploads();
    renderTrending();
    els.uploadDialog.close();
    els.uploadForm.reset();
    
    // Show success message
    alert(`✓ Content Published!\n\n${title}\nby ${artistName || state.profile.name}\n\nYour content is now live and visible to all users!`);
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
      els.trendingGrid.innerHTML = filtered.length ? filtered.map((item, idx) => `
        <div class="content-card" data-content-id="search-${idx}">
          <div class="content-card-img">${item.icon}</div>
          <div class="content-card-info">
            <div class="content-card-label">${item.type}</div>
            <div class="content-card-title">${item.title}</div>
            <div class="content-card-artist">${item.artist}</div>
            <div class="content-card-stats">
              <span>👁️ ${item.views}K</span>
              <span>❤️ ${item.likes}K</span>
            </div>
            <div class="content-card-actions">
              <button class="btn-action btn-stream" data-id="search-${idx}" title="Stream this content">▶ Stream</button>
              <button class="btn-action btn-download" data-id="search-${idx}" title="Download">⬇ Download</button>
              <button class="btn-action btn-view" data-id="search-${idx}" title="View details">👁 View</button>
            </div>
          </div>
        </div>
      `).join('') : '<p style="grid-column: 1/-1; padding: 40px; text-align: center; color: var(--muted);">No results found.</p>';
      bindMediaActions(filtered, 'search');
    }
  });
}

// Player state
let playerState = {
  isPlaying: false,
  currentTime: 0,
  duration: 180, // 3 minutes default
  currentMedia: null,
  playbackInterval: null,
  currentType: 'fallback',
  audioContext: null,
  oscillator: null,
  gainNode: null,
};

// Initialize Web Audio API
function initAudioContext() {
  if (!playerState.audioContext) {
    playerState.audioContext = new (window.AudioContext || window.webkitAudioContext)();
  }
  return playerState.audioContext;
}

// Start audio playback with sound
function playAudioWithSound() {
  if (!playerState.isPlaying) return;
  
  try {
    const ctx = initAudioContext();
    
    // Stop any existing oscillator
    if (playerState.oscillator) {
      playerState.oscillator.stop();
      playerState.oscillator.disconnect();
    }
    
    // Create oscillator for sound
    playerState.oscillator = ctx.createOscillator();
    playerState.gainNode = ctx.createGain();
    
    // Vary frequency based on current time for dynamic sound
    const baseFreq = 200 + Math.random() * 100;
    const frequency = baseFreq + (playerState.currentTime % 50);
    
    playerState.oscillator.frequency.value = frequency;
    playerState.oscillator.type = 'sine';
    playerState.gainNode.gain.value = 0.1; // Quiet so it doesn't startle
    
    playerState.oscillator.connect(playerState.gainNode);
    playerState.gainNode.connect(ctx.destination);
    playerState.oscillator.start();
  } catch (err) {
    console.log('Audio playback note:', err.message);
  }
}

// Stop audio playback
function stopAudioPlayback() {
  try {
    if (playerState.oscillator) {
      playerState.oscillator.stop();
      playerState.oscillator.disconnect();
      playerState.oscillator = null;
    }
  } catch (err) {
    console.log('Stop audio note:', err.message);
  }
}

// Determine media type for playback
function getMediaTypeForPlayback(contentType) {
  const type = contentType.toLowerCase();
  if (type.includes('music') || type.includes('remix') || type.includes('mixtape') || type.includes('album') || type.includes('single') || type.includes('ep')) {
    return 'audio';
  } else if (type.includes('video') || type.includes('movie') || type.includes('series') || type.includes('anime') || type.includes('live')) {
    return 'video';
  }
  return 'fallback';
}

// Format time to MM:SS
function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// Update progress bar
function updateProgressBar() {
  const progress = (playerState.currentTime / playerState.duration) * 100;
  document.getElementById('progressFill').style.width = progress + '%';
  document.getElementById('currentTime').textContent = formatTime(playerState.currentTime);
}

// Update playback simulation
function simulatePlayback() {
  if (playerState.isPlaying) {
    playerState.currentTime += 1;
    if (playerState.currentTime >= playerState.duration) {
      playerState.currentTime = 0;
      playerState.isPlaying = false;
      stopAudioPlayback();
      document.getElementById('playBtn').style.display = 'block';
      document.getElementById('pauseBtn').style.display = 'none';
      document.getElementById('detailStatus').textContent = 'Finished';
    } else {
      // Update frequency of audio for live sound effect
      if (playerState.oscillator && playerState.audioContext) {
        const newFreq = 200 + Math.random() * 100 + (playerState.currentTime % 30);
        playerState.oscillator.frequency.setTargetAtTime(newFreq, playerState.audioContext.currentTime, 0.1);
      }
      document.getElementById('detailStatus').textContent = `Streaming ${formatTime(playerState.currentTime)}`;
    }
    updateProgressBar();
  }
}

// Stream media content with enhanced player
function streamMedia(item, contentUrl = null) {
  const mediaType = getMediaTypeForPlayback(item.type);
  playerState.currentMedia = item;
  playerState.currentType = mediaType;
  playerState.currentTime = 0;
  
  // Set up player dialog
  els.playerDialog.showModal();
  document.getElementById('playerTitle').textContent = `Now Playing: ${item.title}`;
  document.getElementById('detailTitle').textContent = item.title;
  document.getElementById('detailArtist').textContent = item.artist;
  document.getElementById('detailType').textContent = item.type;
  document.getElementById('detailStatus').textContent = 'Ready to stream';
  document.getElementById('duration').textContent = formatTime(playerState.duration);
  
  // Set album cover icon based on type
  const coverIcon = item.icon || '🎵';
  document.getElementById('coverImage').textContent = coverIcon;
  
  // Reset UI
  els.videoPlayer.style.display = 'none';
  els.audioPlayer.style.display = 'none';
  document.getElementById('playBtn').style.display = 'block';
  document.getElementById('pauseBtn').style.display = 'none';
  playerState.isPlaying = false;
  
  // Clear any existing playback interval
  if (playerState.playbackInterval) {
    clearInterval(playerState.playbackInterval);
  }
  
  // Set up playback simulation
  playerState.playbackInterval = setInterval(simulatePlayback, 1000);
}

// Play media
function playMedia() {
  playerState.isPlaying = true;
  playAudioWithSound();
  document.getElementById('playBtn').style.display = 'none';
  document.getElementById('pauseBtn').style.display = 'block';
  document.getElementById('detailStatus').textContent = `Streaming ${formatTime(playerState.currentTime)}`;
}

// Pause media
function pauseMedia() {
  playerState.isPlaying = false;
  stopAudioPlayback();
  document.getElementById('playBtn').style.display = 'block';
  document.getElementById('pauseBtn').style.display = 'none';
  document.getElementById('detailStatus').textContent = 'Paused';
}

// Stop media
function stopMedia() {
  playerState.isPlaying = false;
  stopAudioPlayback();
  playerState.currentTime = 0;
  if (playerState.playbackInterval) {
    clearInterval(playerState.playbackInterval);
  }
  updateProgressBar();
  document.getElementById('playBtn').style.display = 'block';
  document.getElementById('pauseBtn').style.display = 'none';
  document.getElementById('detailStatus').textContent = 'Stopped';
  els.playerDialog.close();
}

// Download media file
function downloadMedia(item) {
  // Create a simulated download
  const element = document.createElement('a');
  element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(`${item.title} by ${item.artist}`));
  element.setAttribute('download', `${item.title}-${item.artist}.txt`);
  element.style.display = 'none';
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
  
  alert(`✓ Download Started: ${item.title}\nby ${item.artist}\n\nThe file will save to your Downloads folder.`);
}

// Bind media action buttons
function bindMediaActions(items, type) {
  document.querySelectorAll('.btn-action').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = btn.dataset.id;
      const [prefix, index] = id.split('-');
      const item = items[parseInt(index)];
      
      if (btn.classList.contains('btn-stream')) {
        streamMedia(item);
      } else if (btn.classList.contains('btn-publish')) {
        alert(`📤 Publishing: ${item.title}\n\nYour content is now live and visible to all users!`);
        btn.textContent = '✓ Published';
        btn.disabled = true;
      } else if (btn.classList.contains('btn-download')) {
        downloadMedia(item);
      } else if (btn.classList.contains('btn-view')) {
        alert(`👁 View Details\n\nTitle: ${item.title}\nArtist: ${item.artist}\nType: ${item.type}\nViews: ${item.views || 0}K\nLikes: ${item.likes || 0}K`);
      }
    });
  });
}

// Setup player controls
function setupPlayerControls() {
  document.getElementById('playBtn')?.addEventListener('click', playMedia);
  document.getElementById('pauseBtn')?.addEventListener('click', pauseMedia);
  document.getElementById('stopBtn')?.addEventListener('click', stopMedia);
  
  // Volume control
  document.getElementById('volumeSlider')?.addEventListener('input', (e) => {
    const volume = e.target.value;
    document.getElementById('volumeLevel').textContent = volume + '%';
    els.audioElement.volume = volume / 100;
    els.videoPlayer.volume = volume / 100;
  });
  
  // Progress bar click to seek
  document.querySelector('.progress-bar')?.addEventListener('click', (e) => {
    const bar = e.currentTarget;
    const rect = bar.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    playerState.currentTime = percent * playerState.duration;
    updateProgressBar();
  });
}

// Close player dialog
document.getElementById('closePlayer')?.addEventListener('click', () => {
  stopMedia();
  els.playerDialog.close();
});

// Start
document.addEventListener('DOMContentLoaded', init);
