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
    LIVE_SESSION: 'vibestream_live_session',
    MAINTENANCE: 'vibestream_maintenance',
};

const MEDIA_DB_NAME = 'vibestream_media_files';
const MEDIA_DB_STORE = 'files';
let mediaObjectUrls = new Map();

function openMediaDatabase() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(MEDIA_DB_NAME, 1);
        request.onupgradeneeded = () => request.result.createObjectStore(MEDIA_DB_STORE, { keyPath: 'key' });
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error || new Error('Media storage is unavailable'));
    });
}

async function storeMediaFile(file) {
    if (!file) return { key: null, url: null };
    const key = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const database = await openMediaDatabase();
    await new Promise((resolve, reject) => {
        const request = database.transaction(MEDIA_DB_STORE, 'readwrite').objectStore(MEDIA_DB_STORE).put({ key, blob: file });
        request.onsuccess = resolve;
        request.onerror = () => reject(request.error || new Error('Unable to save media file'));
    });
    database.close();
    const url = URL.createObjectURL(file);
    mediaObjectUrls.set(key, url);
    return { key, url };
}

async function getStoredMediaUrl(key) {
    if (!key) return null;
    if (mediaObjectUrls.has(key)) return mediaObjectUrls.get(key);
    const database = await openMediaDatabase();
    const record = await new Promise((resolve, reject) => {
        const request = database.transaction(MEDIA_DB_STORE, 'readonly').objectStore(MEDIA_DB_STORE).get(key);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
    database.close();
    if (!record || !record.blob) return null;
    const url = URL.createObjectURL(record.blob);
    mediaObjectUrls.set(key, url);
    return url;
}

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
    liveSession: null,
    liveStream: null,
    podcastFilter: 'all',
    podcastQuery: '',
    podcastComments: [],
    podcastGuests: [],
};

function normalizeCount(value) {
    const num = Number(value);
    return Number.isFinite(num) && num >= 0 ? Math.round(num) : 0;
}

function normalizeReactionState(item) {
    if (!item || typeof item !== 'object') return item;

    item.views = normalizeCount(item.views);
    item.likes = normalizeCount(item.likes);
    item.reactions = item.reactions || { like: 0, love: 0, fire: 0, celebrate: 0 };
    Object.keys(item.reactions).forEach((key) => {
        item.reactions[key] = normalizeCount(item.reactions[key]);
    });

    item.likes = Object.values(item.reactions).reduce((total, value) => total + normalizeCount(value), 0) || item.likes;
    return item;
}

function buildReactionButtons(item, sourceKey, index) {
    const reactionMap = { like: '👍', love: '💜', fire: '🔥', celebrate: '🎉' };
    const itemKey = item.id ? `${sourceKey}-${item.id}` : `${sourceKey}-${index}`;

    return `
    <div class="engagement-row" aria-label="Reaction buttons for ${item.title}">
      ${Object.entries(reactionMap).map(([type, emoji]) => `
        <button class="reaction-btn" data-id="${itemKey}" data-reaction="${type}" type="button">
          <span>${emoji}</span>
          <span>${normalizeCount(item.reactions?.[type])}</span>
        </button>
      `).join('')}
    </div>
  `;
}

// Data arrays are loaded only from localStorage; no built-in demo content is preloaded.
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
  marketplaceGrid: document.getElementById('marketplaceGrid'),
  podcastFeed: document.getElementById('podcastFeed'),
  liveStatus: document.getElementById('liveStatus'),
  liveTitle: document.getElementById('liveTitle'),
  liveDescription: document.getElementById('liveDescription'),
  liveCategoryChip: document.getElementById('liveCategory'),
  liveViewers: document.getElementById('liveViewers'),
  liveLikes: document.getElementById('liveLikes'),
  liveTitleInput: document.getElementById('liveTitleInput'),
  liveCategorySelect: document.getElementById('liveCategorySelect'),
  liveDescInput: document.getElementById('liveDescInput'),
  startLiveBtn: document.getElementById('startLiveBtn'),
  stopLiveBtn: document.getElementById('stopLiveBtn'),
  joinLiveBtn: document.getElementById('joinLiveBtn'),
  liveChat: document.getElementById('liveChat'),
  liveChatInput: document.getElementById('liveChatInput'),
  sendLiveChat: document.getElementById('sendLiveChat'),
  livePreview: document.getElementById('livePreview'),
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
  podcastSearchInput: document.getElementById('podcastSearchInput'),
  podcastCommentTarget: document.getElementById('podcastCommentTarget'),
  podcastCommentInput: document.getElementById('podcastCommentInput'),
  podcastCommentSubmit: document.getElementById('podcastCommentSubmit'),
  podcastCommentList: document.getElementById('podcastCommentList'),
  podcastGuestInput: document.getElementById('podcastGuestInput'),
  addGuestBtn: document.getElementById('addGuestBtn'),
  podcastGuests: document.getElementById('podcastGuests'),
  podcastForm: document.getElementById('podcastForm'),
  profileBtn: document.getElementById('profileBtn'),
  loginBtn: document.getElementById('loginBtn'),
  playerDialog: document.getElementById('playerDialog'),
  videoPlayer: document.getElementById('videoPlayer'),
  audioPlayer: document.getElementById('audioPlayer'),
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
async function init() {
  loadData();
  await hydrateStoredMediaUrls();
  showMaintenanceNotice();
  setupHeroImage();
  renderCategories();
  renderTrending();
  renderUploads();
  renderBrowse();
  renderMarketplace();
  renderPodcastFeed();
  renderPodcastComments();
  renderPodcastGuests();
  renderPodcasts();
  renderLiveSession();
  renderTopDownloads();
  renderTopCreators();
  setupPlayerControls();
  bindEvents();
  setupMobileMenu();
  // Apply saved theme
  const savedTheme = localStorage.getItem('vibestream_theme');
  if (savedTheme === 'light') document.documentElement.classList.add('light-theme');
}

function showMaintenanceNotice() {
  if (localStorage.getItem(DATA_KEYS.MAINTENANCE) !== 'true') return;
  const notice = document.createElement('div');
  notice.className = 'maintenance-overlay';
  notice.innerHTML = '<div class="maintenance-card"><div class="maintenance-icon">🛠️</div><h2>VibeStream is under maintenance</h2><p>We are making improvements. Please check back soon.</p></div>';
  document.body.appendChild(notice);
}

// Mobile menu / hamburger
function setupMobileMenu() {
  const hamburger = document.getElementById('hamburgerBtn');
  const sidebar = document.getElementById('mainSidebar');
  const overlay = document.getElementById('sidebarOverlay');
  const closeBtn = document.getElementById('sidebarCloseBtn');

  function openSidebar() {
    sidebar?.classList.add('open');
    overlay?.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeSidebar() {
    sidebar?.classList.remove('open');
    overlay?.classList.remove('active');
    document.body.style.overflow = '';
  }

  hamburger?.addEventListener('click', openSidebar);
  closeBtn?.addEventListener('click', closeSidebar);
  overlay?.addEventListener('click', closeSidebar);

  // Close sidebar when a nav item is clicked on mobile
  sidebar?.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', () => {
      if (window.innerWidth <= 768) closeSidebar();
    });
  });
}

// Setup hero image
function setupHeroImage() {
  const heroImage = document.getElementById('heroImage');
  if (heroImage) {
    heroImage.style.backgroundImage = 'url("https://picsum.photos/600/400?random=hero")';
  }
}

// Load data from localStorage
// Owner account - always available for login
const OWNER_ACCOUNT = {
  id: 'owner-1',
  username: 'LWILL',
  email: 'lwill70.bl@gmail.com',
  password: '38841997',
  role: 'owner',
  createdAt: '2026-01-01T00:00:00.000Z'
};

function loadData() {
  state.media = (JSON.parse(localStorage.getItem(DATA_KEYS.MEDIA)) || []).map(normalizeReactionState);
  // Do not preload fake/sample uploads by default — only load real uploads from localStorage
  state.uploads = (JSON.parse(localStorage.getItem(DATA_KEYS.UPLOADS)) || []).map(normalizeReactionState);
  state.profile = JSON.parse(localStorage.getItem(DATA_KEYS.PROFILE)) || { name: '', initials: '', bio: '' };
  state.currentUser = JSON.parse(localStorage.getItem(DATA_KEYS.CURRENT_USER));
  state.users = JSON.parse(localStorage.getItem(DATA_KEYS.USERS)) || [];
  state.advertisements = JSON.parse(localStorage.getItem(DATA_KEYS.ADVERTISEMENTS)) || [];
  state.podcasts = JSON.parse(localStorage.getItem(DATA_KEYS.PODCASTS)) || [];
  state.podcastFilter = localStorage.getItem('vibestream_podcast_filter') || 'all';
  state.podcastQuery = localStorage.getItem('vibestream_podcast_query') || '';
  state.podcastComments = JSON.parse(localStorage.getItem('vibestream_podcast_comments')) || [];
  state.podcastGuests = JSON.parse(localStorage.getItem('vibestream_podcast_guests')) || [];
  state.liveSession = JSON.parse(localStorage.getItem(DATA_KEYS.LIVE_SESSION)) || {
    active: false,
    viewers: 0,
    likes: 0,
    category: 'Music',
    title: 'Vibestream Live Studio',
    description: 'Go live with your show, podcast or marketplace stream.',
    chat: [],
  };

  // Always ensure owner account exists in users list
  const ownerExists = state.users.find(u => u.email === OWNER_ACCOUNT.email);
  if (!ownerExists) {
    state.users.unshift(OWNER_ACCOUNT);
    localStorage.setItem(DATA_KEYS.USERS, JSON.stringify(state.users));
  }

  updateLoginButtonState();
}

async function hydrateStoredMediaUrls() {
  const items = [...state.media, ...state.uploads];
  await Promise.all(items.map(async (item) => {
    if (item.mediaKey) item.mediaUrl = await getStoredMediaUrl(item.mediaKey);
    if (item.coverKey) item.coverUrl = await getStoredMediaUrl(item.coverKey);
  }));
}

// Save data to localStorage
function saveData() {
  localStorage.setItem(DATA_KEYS.MEDIA, JSON.stringify(state.media));
  localStorage.setItem(DATA_KEYS.UPLOADS, JSON.stringify(state.uploads));
  localStorage.setItem(DATA_KEYS.PROFILE, JSON.stringify(state.profile));
  localStorage.setItem(DATA_KEYS.USERS, JSON.stringify(state.users));
  localStorage.setItem(DATA_KEYS.ADVERTISEMENTS, JSON.stringify(state.advertisements));
  localStorage.setItem(DATA_KEYS.PODCASTS, JSON.stringify(state.podcasts));
  localStorage.setItem('vibestream_podcast_filter', state.podcastFilter);
  localStorage.setItem('vibestream_podcast_query', state.podcastQuery);
  localStorage.setItem('vibestream_podcast_comments', JSON.stringify(state.podcastComments));
  localStorage.setItem('vibestream_podcast_guests', JSON.stringify(state.podcastGuests));
  localStorage.setItem(DATA_KEYS.LIVE_SESSION, JSON.stringify(state.liveSession));
  if (state.currentUser) {
    localStorage.setItem(DATA_KEYS.CURRENT_USER, JSON.stringify(state.currentUser));
  } else {
    localStorage.removeItem(DATA_KEYS.CURRENT_USER);
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
      document.querySelector('.feed .section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
}

// Render trending
function renderTrending() {
  const items = state.selectedCategory === 'all' ? state.media : state.media.filter(m => m.type.toLowerCase().includes(state.selectedCategory));

  if (items.length === 0) {
    const label = state.selectedCategory === 'all' ? 'content' : state.selectedCategory;
    els.trendingGrid.innerHTML = `<p style="grid-column: 1/-1; padding: 40px; text-align: center; color: var(--muted);">No ${label} uploaded yet. Use Upload Content to add the first one.</p>`;
    return;
  }

  els.trendingGrid.innerHTML = items.map((item, idx) => {
    const safeItem = normalizeReactionState({ ...item });
    return `
      <div class="content-card" data-content-id="trending-${idx}">
        <div class="content-card-img" style="background-image: url('${safeItem.image || safeItem.coverUrl || ''}'); background-size: cover; background-position: center;"><img src="${safeItem.image || safeItem.coverUrl || ''}" style="display:none;" onerror="this.parentElement.innerHTML='${safeItem.icon}'"/></div>
        <div class="content-card-info">
          <div class="content-card-label">${safeItem.type}</div>
          <div class="content-card-title">${safeItem.title}</div>
          ${getUploadMetadata(safeItem)}
          <div class="content-card-stats">
            <span>👁️ ${safeItem.views}</span>
            <span>❤ ${normalizeCount(safeItem.likes)}</span>
          </div>
          ${buildReactionButtons(safeItem, 'trending', idx)}
          <div class="content-card-actions">
            <button class="btn-action btn-stream" data-id="trending-${idx}" title="Stream this content">▶ Stream</button>
            <button class="btn-action btn-download" data-id="trending-${idx}" title="Download">⬇ Download</button>
            <button class="btn-action btn-view" data-id="trending-${idx}" title="View details">👁 View</button>
          </div>
        </div>
      </div>
    `;
  }).join('');

  bindMediaActions(items, 'trending');
}

// Render uploads
function renderUploads() {
  if (!state.uploads || state.uploads.length === 0) {
    els.uploadsGrid.innerHTML = '<p style="grid-column: 1/-1; padding: 40px; text-align: center; color: var(--muted);">No uploads yet. Click UPLOAD to add your first item.</p>';
    return;
  }

  els.uploadsGrid.innerHTML = state.uploads.map((item, idx) => {
    const safeItem = normalizeReactionState({ ...item });
    return `
      <div class="content-card" data-content-id="upload-${idx}">
        <div class="content-card-img" style="background-image: url('${safeItem.image || safeItem.coverUrl || ''}'); background-size: cover; background-position: center;"><img src="${safeItem.image || safeItem.coverUrl || ''}" style="display:none;" onerror="this.parentElement.innerHTML='${safeItem.icon || '🎵'}'"/></div>
        <div class="content-card-info">
          <div class="content-card-label">UPLOAD</div>
          <div class="content-card-title">${safeItem.title}</div>
          ${getUploadMetadata(safeItem)}
          <div class="content-card-stats">
            <span>👁️ ${safeItem.views}</span>
            <span>❤ ${normalizeCount(safeItem.likes)}</span>
          </div>
          ${buildReactionButtons(safeItem, 'upload', idx)}
          <div class="content-card-actions">
            <button class="btn-action btn-stream" data-id="upload-${idx}" title="Stream this content">▶ Stream</button>
            <button class="btn-action btn-publish" data-id="upload-${idx}" title="Publish">📤 Publish</button>
            <button class="btn-action btn-download" data-id="upload-${idx}" title="Download">⬇ Download</button>
            <button class="btn-action btn-view" data-id="upload-${idx}" title="View details">👁 View</button>
          </div>
        </div>
      </div>
    `;
  }).join('');

  bindMediaActions(state.uploads, 'upload');
}

// Render browse categories
function renderBrowse() {
  if (!els.browseGrid) return;
  els.browseGrid.innerHTML = BROWSE_CATEGORIES.map(cat => `
    <div class="browse-item">
      <div class="browse-item-icon">${cat.icon}</div>
      <div class="browse-item-name">${cat.name}<br/><span style="font-size:10px;color:var(--muted)">All Uploads</span></div>
    </div>
  `).join('');
}

// Render marketplace section
function renderMarketplace() {
  if (!els.marketplaceGrid) return;
  if (state.advertisements.length === 0) {
    els.marketplaceGrid.innerHTML = '<p style="grid-column: 1/-1; padding: 40px; text-align: center; color: var(--muted);">No marketplace listings found. Post your first item to sell!</p>';
    return;
  }

  const visibleAds = state.advertisements.filter(ad => ad.status !== 'rejected');
  if (visibleAds.length === 0) {
    els.marketplaceGrid.innerHTML = '<p style="grid-column: 1/-1; padding: 40px; text-align: center; color: var(--muted);">No approved marketplace listings are available yet.</p>';
    return;
  }

  els.marketplaceGrid.innerHTML = visibleAds.map((ad, idx) => `
    <div class="product-card">
      <div class="product-card-image" style="background-image: url('${ad.imageUrl || 'https://picsum.photos/420/260?random=' + ad.id}');"></div>
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
      <p class="product-card-description">${ad.description || 'Showcasing the best local product. Add photos for stronger listings.'}</p>
      <div class="product-card-actions">
        <button class="contact-btn btn-buy" data-id="market-${ad.id}">🛒 Buy Now</button>
      </div>
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

// Render podcast feed section
function getFilteredPodcasts() {
  const query = (state.podcastQuery || '').trim().toLowerCase();
  let list = state.podcasts.slice();

  if (state.podcastFilter && state.podcastFilter !== 'all') {
    list = list.filter(p => (p.tags || '').toLowerCase().includes(state.podcastFilter) || p.type?.toLowerCase().includes(state.podcastFilter) || p.title.toLowerCase().includes(state.podcastFilter));
  }

  if (query) {
    list = list.filter(p => p.title.toLowerCase().includes(query) || p.creator.toLowerCase().includes(query) || (p.tags || '').toLowerCase().includes(query));
  }

  return list;
}

function renderPodcastFeed() {
  if (!els.podcastFeed) return;
  const filteredPodcasts = getFilteredPodcasts();

  if (filteredPodcasts.length === 0) {
    els.podcastFeed.innerHTML = '<p style="grid-column: 1/-1; padding: 40px; text-align: center; color: var(--muted);">No podcast episodes match your filter yet.</p>';
    return;
  }

  els.podcastFeed.innerHTML = filteredPodcasts.map((podcast, idx) => `
    <div class="content-card" data-content-id="podcast-${idx}">
      <div class="content-card-img">🎙️</div>
      <div class="content-card-info">
        <div class="content-card-label">PODCAST</div>
        <div class="content-card-title">${podcast.title}</div>
        <div class="content-card-artist">by ${podcast.creator}</div>
        <div class="content-card-stats">
          <span>⏱ ${Math.floor(podcast.duration / 60)}:${(podcast.duration % 60).toString().padStart(2, '0')}</span>
          <span>${podcast.tags || 'General'}</span>
        </div>
        <div class="content-card-actions">
          <button class="btn-action btn-stream" data-id="podcast-${idx}" title="Stream episode">▶ Stream</button>
          <button class="btn-action btn-download" data-id="podcast-${idx}" title="Download episode">⬇ Download</button>
          <button class="btn-action btn-view" data-id="podcast-${idx}" title="Episode details">👁 View</button>
        </div>
      </div>
    </div>
  `).join('');

  bindMediaActions(filteredPodcasts, 'podcast');
  renderPodcastCommentTargets();
  renderPodcastComments();
  renderPodcastGuests();
}

function renderPodcastCommentTargets() {
  if (!els.podcastCommentTarget) return;
  const options = [{ value: 'all', label: 'Comment on all podcasts' }].concat(
    state.podcasts.map(p => ({ value: `podcast-${p.id}`, label: `Episode: ${p.title}` }))
  );
  els.podcastCommentTarget.innerHTML = options.map(opt => `<option value="${opt.value}">${opt.label}</option>`).join('');
}

function renderPodcastComments() {
  if (!els.podcastCommentList) return;
  if (!state.podcastComments || state.podcastComments.length === 0) {
    els.podcastCommentList.innerHTML = '<p style="color: var(--muted); padding: 16px;">No comments yet. Share your thoughts about the latest podcast.</p>';
    return;
  }

  els.podcastCommentList.innerHTML = state.podcastComments.map(comment => `
    <div class="comment-item">
      <div class="author">${comment.by}</div>
      <div class="text">${comment.message}</div>
      <div class="time">${comment.target === 'all' ? 'All episodes' : comment.targetLabel} · ${comment.createdAt}</div>
    </div>
  `).join('');
}

function renderPodcastGuests() {
  if (!els.podcastGuests) return;
  if (!state.podcastGuests || state.podcastGuests.length === 0) {
    els.podcastGuests.innerHTML = '<p style="color: var(--muted); font-size: 13px; padding: 10px;">Invite guests to your next recording session.</p>';
    return;
  }

  els.podcastGuests.innerHTML = state.podcastGuests.map((guest, idx) => `
    <div class="guest-chip">
      <span>${guest.name}</span>
      <button type="button" class="btn-action btn-small remove-guest" data-guest-index="${idx}">✕</button>
    </div>
  `).join('');
}

function updatePodcastFilterButtons() {
  document.querySelectorAll('[data-podcast-filter]').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.podcastFilter === state.podcastFilter);
  });
}

function renderLiveSession() {
  if (!els.liveStatus || !els.liveTitle || !els.liveDescription || !els.liveCategoryChip || !els.liveViewers || !els.liveLikes) return;
  els.liveStatus.textContent = state.liveSession.active ? 'Live Now' : 'Offline';
  els.liveStatus.classList.toggle('live', state.liveSession.active);
  els.liveTitle.textContent = state.liveSession.title;
  els.liveDescription.textContent = state.liveSession.description;
  els.liveCategoryChip.textContent = `Category: ${state.liveSession.category}`;
  els.liveViewers.textContent = `Viewers: ${state.liveSession.viewers}`;
  els.liveLikes.textContent = `Likes: ${state.liveSession.likes}`;
  document.getElementById('startLiveBtn').style.display = state.liveSession.active ? 'none' : 'inline-flex';
  document.getElementById('stopLiveBtn').style.display = state.liveSession.active ? 'inline-flex' : 'none';
  renderLiveChatHistory();
}

function appendLiveChatMessage(sender, message) {
  if (!state.liveSession.chat) state.liveSession.chat = [];
  const entry = {
    id: Date.now(),
    sender,
    message,
    createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  };
  state.liveSession.chat.push(entry);
  saveData();
  renderLiveChatHistory();
}

function renderLiveChatHistory() {
  if (!els.liveChat) return;
  const chatHistory = state.liveSession.chat || [];
  els.liveChat.innerHTML = chatHistory.map(entry => `
    <div class="chat-row chat-${entry.sender}">
      <span class="chat-sender">${entry.sender === 'system' ? 'System' : entry.sender === 'audience' ? 'Viewer' : 'You'}</span>
      <span class="chat-message">${entry.message}</span>
      <span class="chat-time">${entry.createdAt}</span>
    </div>
  `).join('');
  els.liveChat.scrollTop = els.liveChat.scrollHeight;
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

const MUSIC_RELEASE_CATEGORIES = new Set(['music', 'single', 'album', 'ep', 'mixtape']);
const VIDEO_CATEGORIES = new Set(['video', 'movie', 'series']);

function normalizeUploadCategory(category) {
  const value = (category || '').toLowerCase();
  const aliases = {
    videos: 'video',
    'music videos': 'video',
    mixtapes: 'mixtape',
    albums: 'album',
    eps: 'ep',
    movies: 'movie',
    podcasts: 'podcast',
  };
  if (aliases[value]) return aliases[value];
  return value;
}

function updateUploadFormFields() {
  const categorySelect = els.uploadForm?.querySelector('select[name="category"]');
  if (!categorySelect) return;

  const category = normalizeUploadCategory(categorySelect.value);
  const isMusicRelease = MUSIC_RELEASE_CATEGORIES.has(category);
  const isVideo = VIDEO_CATEGORIES.has(category);
  const musicFields = document.getElementById('musicReleaseFields');
  const videoFields = document.getElementById('videoDetailsFields');
  const mediaLabel = document.getElementById('uploadMediaLabel');
  const mediaHint = document.getElementById('uploadMediaHint');
  const mediaInput = els.uploadForm.querySelector('input[name="mediaFile"]');
  const artistField = document.getElementById('uploadArtistField');
  const genreField = document.getElementById('uploadGenreField');
  const directorField = document.getElementById('uploadDirectorField');
  const labelField = document.getElementById('uploadLabelField');
  const producerField = document.getElementById('uploadProducerField');
  const durationField = document.getElementById('uploadDurationField');
  const artistInput = els.uploadForm.querySelector('input[name="artistName"]');

  document.querySelectorAll('[data-upload-category]').forEach((card) => {
    card.classList.toggle('active', card.dataset.uploadCategory === category || (category === 'album' || category === 'ep' || category === 'mixtape' || category === 'single') && card.dataset.uploadCategory === 'music');
  });
  musicFields.hidden = !isMusicRelease;
  videoFields.hidden = !isVideo;
  const isMovie = category === 'movie';
  const hidesArtist = ['movie', 'marketplace', 'graphics', 'series'].includes(category);
  artistField.hidden = hidesArtist;
  genreField.hidden = false;
  directorField.hidden = !isVideo || isMovie;
  labelField.hidden = !isVideo || isMovie;
  producerField.hidden = !isVideo || isMovie;
  durationField.hidden = !isVideo || isMovie;
  artistInput.required = !hidesArtist;

  if (isMusicRelease) {
    mediaLabel.textContent = category === 'music' || category === 'single' ? 'Audio File' : `${category.toUpperCase()} Audio File`;
    mediaHint.textContent = 'Upload the audio release. Add a tracklist for albums, EPs, and mixtapes.';
    mediaInput.accept = 'audio/*';
  } else if (isVideo) {
    mediaLabel.textContent = category === 'video' ? 'Music Video File' : `${category.charAt(0).toUpperCase() + category.slice(1)} File`;
    mediaHint.textContent = 'Upload the video file and add the director, release year, and duration.';
    mediaInput.accept = 'video/*';
  } else if (category === 'graphics') {
    mediaLabel.textContent = 'Design File';
    mediaHint.textContent = 'Upload an image or design file.';
    mediaInput.accept = 'image/*,.psd,.ai,.pdf';
  } else if (category === 'podcast') {
    mediaLabel.textContent = 'Podcast Audio File';
    mediaHint.textContent = 'Upload the podcast audio file.';
    mediaInput.accept = 'audio/*';
  } else {
    mediaLabel.textContent = 'Upload File';
    mediaHint.textContent = 'Choose the main file for this upload.';
    mediaInput.accept = 'image/*,video/*,audio/*';
  }
}

function openUploadDialog(category = state.selectedCategory) {
  const categorySelect = els.uploadForm?.querySelector('select[name="category"]');
  const normalizedCategory = normalizeUploadCategory(category);
  if (categorySelect && categorySelect.querySelector(`option[value="${normalizedCategory}"]`)) {
    categorySelect.value = normalizedCategory;
  }
  updateUploadFormFields();
  els.uploadDialog.showModal();
}

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    if (!file) {
      resolve(null);
      return;
    }
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error || new Error('Unable to read file'));
    reader.readAsDataURL(file);
  });
}

function getUploadMetadata(item) {
  const category = normalizeUploadCategory(item.type);
  const style = item.genre || 'Style not set';
  if (['movie', 'marketplace', 'graphics', 'series'].includes(category)) {
    return `<div class="content-card-artist">${style}</div>${category === 'movie' ? `<div class="content-card-artist">${item.releaseYear || 'Year not set'}</div>` : ''}`;
  }
  if (category === 'video') {
    return `<div class="content-card-artist">${item.artist}</div>
      <div class="content-card-artist">${style}</div>
      <div class="content-card-artist">${item.director || 'Video creator not set'} · ${item.releaseYear || 'Year not set'}</div>
      <div class="content-card-artist">${item.label || 'None'}${item.producer ? ` · Producer: ${item.producer}` : ''}</div>`;
  }
  return `<div class="content-card-artist">${item.artist}</div>`;
}

// Event listeners
function bindEvents() {
  // Navigation
  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
      item.classList.add('active');
      const destination = item.dataset.nav;
      const section = item.dataset.section;

      if (section && !['podcasts', 'marketplace'].includes(section)) {
        state.selectedCategory = section;
        renderTrending();
        document.querySelector('.feed .section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        return;
      }

      if (section === 'podcasts' || destination === 'podcasts') {
        document.getElementById('podcasts')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        return;
      }

      if (section === 'marketplace' || destination === 'marketplace-shop') {
        renderMarketplace();
        document.getElementById('marketplace')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        return;
      }

      if (destination === 'home') {
        state.selectedCategory = 'all';
        renderTrending();
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }

      if (['favorites', 'downloads', 'later', 'recent'].includes(destination)) {
        const labels = {
          favorites: 'Favorites',
          downloads: 'Downloads',
          later: 'Watch Later',
          recent: 'Recently Played',
        };
        els.trendingGrid.innerHTML = `<p style="grid-column: 1/-1; padding: 40px; text-align: center; color: var(--muted);">Your ${labels[destination]} list is empty.</p>`;
        document.querySelector('.feed .section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  // Hero buttons
  document.querySelectorAll('.btn-hero, .btn-hero-alt').forEach(btn => {
    btn.addEventListener('click', () => {
      const text = btn.textContent;
      if (text.includes('Stream')) {
        // Scroll to trending section
        document.querySelector('.section')?.scrollIntoView({ behavior: 'smooth' });
      } else if (text.includes('Download')) {
        const first = state.media[0] || state.uploads[0];
        if (first) {
          downloadMedia(first);
        } else {
          alert('Upload content first to enable downloads.');
        }
      } else if (text.includes('Upload')) {
        openUploadDialog();
      } else if (text.includes('Share')) {
        if (navigator.share) {
          navigator.share({ title: 'VibeStream', url: 'https://vibestream.co.za' });
        } else {
          navigator.clipboard.writeText('https://vibestream.co.za')
            .then(() => alert('✅ Link copied: https://vibestream.co.za'))
            .catch(() => alert('Share: https://vibestream.co.za'));
        }
      }
    });
  });

  // Back and Hide buttons on home screen
  document.getElementById('backBtn')?.addEventListener('click', (e) => {
    e.preventDefault();
    if (window.history.length > 1) {
      window.history.back();
    } else {
      // Fallback: navigate to the root
      window.location.href = '/';
    }
  });

  // Minimize button on the home screen (collapses the hero to a small bar)
  document.getElementById('minimizeBtn')?.addEventListener('click', (e) => {
    e.preventDefault();
    const hero = document.querySelector('.hero');
    if (!hero) return;
    const btn = e.currentTarget;
    const isMin = hero.dataset.minimized === 'true';
    if (isMin) {
      hero.style.height = '';
      hero.style.overflow = '';
      hero.dataset.minimized = 'false';
      btn.textContent = 'Minimize';
    } else {
      hero.style.height = '64px';
      hero.style.overflow = 'hidden';
      hero.dataset.minimized = 'true';
      btn.textContent = 'Restore';
    }
  });

  // Resize button - toggles between normal and large hero sizes
  document.getElementById('resizeBtn')?.addEventListener('click', (e) => {
    e.preventDefault();
    const hero = document.querySelector('.hero');
    if (!hero) return;
    const current = hero.dataset.size || 'normal';
    if (current === 'normal') {
      // Expand
      hero.style.padding = '64px 24px';
      hero.style.minHeight = '520px';
      hero.dataset.size = 'large';
      e.currentTarget.textContent = '⤡';
    } else {
      // Restore
      hero.style.padding = '';
      hero.style.minHeight = '';
      hero.dataset.size = 'normal';
      e.currentTarget.textContent = '⤢';
    }
  });

  // View All links — smooth scroll or placeholder
  document.querySelectorAll('.view-all, .view-all-sm').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const section = link.closest('.section');
      if (section) {
        section.scrollIntoView({ behavior: 'smooth' });
      } else {
        alert('View all: feature coming soon.');
      }
    });
  });

  // Header Upload / Advertise explicit handlers
  document.getElementById('uploadTopBtn')?.addEventListener('click', (e) => {
    e.preventDefault();
    openUploadDialog();
  });

  document.getElementById('advertiseTopBtn')?.addEventListener('click', (e) => {
    e.preventDefault();
    els.advertiseDialog.showModal();
  });

  // Premium button shows informational toast/modal
  document.querySelectorAll('.btn-premium').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      alert('✨ Vibestream is 100% FREE — no subscriptions, no hidden fees.');
    });
  });

  // Theme toggle
  document.querySelectorAll('.btn-theme').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const isLight = document.documentElement.classList.toggle('light-theme');
      localStorage.setItem('vibestream_theme', isLight ? 'light' : 'dark');
      btn.textContent = isLight ? '🌙' : '☀️';
    });
  });

  // Learn more button scrolls to categories
  document.querySelectorAll('.btn-learn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      document.querySelector('.categories')?.scrollIntoView({ behavior: 'smooth' });
    });
  });

  // Upload-now promo button
  document.querySelector('.btn-upload-now')?.addEventListener('click', () => {
    openUploadDialog();
  });

  // Advertise section button
  document.querySelector('.btn-advertise')?.addEventListener('click', () => {
    els.advertiseDialog.showModal();
  });

  // Upload dialog - sidebar and header buttons
  document.querySelectorAll('[data-nav="upload"], #sidebarUpload, #sidebarUploadBtn').forEach(el => {
    if (el) {
      el.addEventListener('click', (e) => {
        e.preventDefault();
        openUploadDialog();
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
        openUploadDialog();
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
    if (state.currentUser) {
      const confirmLogout = confirm(`You are logged in as ${state.currentUser.username}. Do you want to logout?`);
      if (confirmLogout) {
        state.currentUser = null;
        saveData();
        updateLoginButtonState();
        alert('✅ You have been logged out.');
      }
      return;
    }
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
    const email = els.loginForm.querySelector('input[name="loginEmail"]').value.trim().toLowerCase();
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
      alert('❌ Invalid email or password. Please check your email and password.');
    }
  });

  // Register form submission
  els.registerForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const username = els.registerForm.querySelector('input[name="regUsername"]').value.trim();
    const email = els.registerForm.querySelector('input[name="regEmail"]').value.trim().toLowerCase();
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
      username: username || email.split('@')[0],
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
    alert(`✅ Account created! Welcome, ${state.currentUser.username}!`);
  });

  // Forgot Password handler
  document.getElementById('forgotPasswordBtn')?.addEventListener('click', () => {
    const email = prompt('Enter your registered email address to reset your password:');
    if (!email) return;

    const user = state.users.find(u => u.email === email.trim().toLowerCase());
    if (!user) {
      alert('❌ No account found with that email address.');
      return;
    }

    const newPassword = prompt('Enter your new password:');
    if (!newPassword) {
      alert('❌ Password reset cancelled.');
      return;
    }

    user.password = newPassword;
    saveData();
    alert('✅ Your password has been reset successfully. You can now login with your new password.');
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
    const fileInput = els.advertiseForm.querySelector('input[name="productImage"]');
    const imageFile = fileInput?.files?.[0];
    const adBase = {
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
      status: 'pending',
      imageUrl: 'https://picsum.photos/420/260?random=' + Date.now(),
    };

    const saveAd = (ad) => {
      state.advertisements.unshift(ad);
      saveData();
      renderMarketplace();
      showMarketplaceSection();
      els.advertiseDialog.close();
      els.advertiseForm.reset();
      alert(`✅ Your ad is now live!\n\n${ad.productName}\n${ad.price}\n\nReach thousands of buyers on Vibestream!`);
    };

    if (imageFile) {
      const reader = new FileReader();
      reader.onload = () => {
        saveAd({ ...adBase, imageUrl: reader.result });
      };
      reader.readAsDataURL(imageFile);
    } else {
      saveAd(adBase);
    }
  });

  document.querySelector('.btn-open-marketplace')?.addEventListener('click', (e) => {
    e?.preventDefault();
    showMarketplaceSection();
  });

  document.querySelectorAll('[data-nav="marketplace-shop"]').forEach(el => {
    el.addEventListener('click', (e) => {
      e.preventDefault();
      showMarketplaceSection();
    });
  });

  function showMarketplaceSection() {
    const section = document.getElementById('marketplace');
    if (!section) return;
    renderMarketplace();
    section.style.display = 'flex';
    section.scrollIntoView({ behavior: 'smooth' });
  }

  document.querySelector('.btn-open-podcast')?.addEventListener('click', (e) => {
    e?.preventDefault();
    els.podcastDialog.showModal();
  });

  if (els.podcastSearchInput) {
    els.podcastSearchInput.value = state.podcastQuery || '';
    els.podcastSearchInput.addEventListener('input', (e) => {
      state.podcastQuery = e.target.value || '';
      saveData();
      renderPodcastFeed();
    });
  }

  document.querySelectorAll('[data-podcast-filter]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      document.querySelectorAll('[data-podcast-filter]').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.podcastFilter = btn.dataset.podcastFilter || 'all';
      saveData();
      renderPodcastFeed();
    });
  });

  setTimeout(() => {
    updatePodcastFilterButtons();
  }, 0);

  els.podcastCommentSubmit?.addEventListener('click', (e) => {
    e.preventDefault();
    const target = els.podcastCommentTarget?.value || 'all';
    const message = els.podcastCommentInput?.value.trim();
    if (!message) {
      alert('Please enter a comment before posting.');
      return;
    }
    const targetLabel = target === 'all' ? 'All episodes' : (state.podcasts.find(p => `podcast-${p.id}` === target)?.title || 'Episode');
    state.podcastComments.unshift({
      id: Date.now(),
      target,
      targetLabel,
      message,
      by: state.currentUser?.username || 'You',
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    });
    saveData();
    els.podcastCommentInput.value = '';
    renderPodcastComments();
  });

  els.addGuestBtn?.addEventListener('click', (e) => {
    e.preventDefault();
    const guestName = els.podcastGuestInput?.value.trim();
    if (!guestName) {
      alert('Enter a guest name to invite.');
      return;
    }
    state.podcastGuests.unshift({ name: guestName, invitedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) });
    saveData();
    els.podcastGuestInput.value = '';
    renderPodcastGuests();
  });

  els.podcastGuests?.addEventListener('click', (e) => {
    const removeBtn = e.target.closest('.remove-guest');
    if (!removeBtn) return;
    const index = parseInt(removeBtn.dataset.guestIndex, 10);
    if (Number.isFinite(index)) {
      state.podcastGuests.splice(index, 1);
      saveData();
      renderPodcastGuests();
    }
  });

  document.getElementById('openLiveStudio')?.addEventListener('click', (e) => {
    e?.preventDefault();
    document.getElementById('liveStudio')?.scrollIntoView({ behavior: 'smooth' });
  });

  els.startLiveBtn?.addEventListener('click', async (e) => {
    e?.preventDefault();
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      state.liveStream = stream;
      if (els.livePreview) {
        els.livePreview.srcObject = stream;
        els.livePreview.style.display = 'block';
      }
      state.liveSession.active = true;
      state.liveSession.title = els.liveTitleInput.value.trim() || 'Vibestream Live Studio';
      state.liveSession.description = els.liveDescInput.value.trim() || 'Go live with your show, podcast or marketplace stream.';
      state.liveSession.category = els.liveCategorySelect.value || 'Music';
      state.liveSession.viewers = Math.max(1, state.liveSession.viewers + 1);
      state.liveSession.likes = Math.max(0, state.liveSession.likes);
      saveData();
      renderLiveSession();
      appendLiveChatMessage('system', `✅ Live stream started: ${state.liveSession.title}`);
    } catch (err) {
      alert('❌ Camera and microphone access are required for live streaming. Please allow permission and try again.');
    }
  });

  els.stopLiveBtn?.addEventListener('click', (e) => {
    e?.preventDefault();
    stopLiveStream();
    state.liveSession.active = false;
    saveData();
    renderLiveSession();
    appendLiveChatMessage('system', '⏹ Live stream ended. Thank you for watching!');
  });

  els.joinLiveBtn?.addEventListener('click', (e) => {
    e?.preventDefault();
    if (!state.liveSession.active) {
      alert('No live stream is active right now. Start a live stream first.');
      return;
    }
    state.liveSession.viewers += 1;
    saveData();
    renderLiveSession();
    appendLiveChatMessage('audience', 'A new viewer joined the live stream.');
  });

  els.sendLiveChat?.addEventListener('click', (e) => {
    e?.preventDefault();
    const message = els.liveChatInput.value.trim();
    if (!message) return;
    appendLiveChatMessage('user', message);
    els.liveChatInput.value = '';
  });

  document.body.addEventListener('click', (e) => {
    const buyButton = e.target.closest('.btn-buy');
    if (buyButton) {
      e.preventDefault();
      const id = buyButton.dataset.id;
      if (!id) return;
      const adId = Number(id.replace('market-', ''));
      const ad = state.advertisements.find(item => item.id === adId);
      if (!ad) return;
      alert(`✅ Purchase confirmed!\n\nProduct: ${ad.productName}\nPrice: ${ad.price}\nSeller: ${ad.seller}\n\nThe seller will contact you via WhatsApp or phone.`);
      return;
    }
  });

  els.liveChatInput?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const message = els.liveChatInput.value.trim();
      if (!message) return;
      appendLiveChatMessage('user', message);
      els.liveChatInput.value = '';
    }
  });

  function stopLiveStream() {
    if (state.liveStream) {
      state.liveStream.getTracks().forEach(track => track.stop());
      state.liveStream = null;
    }
    if (els.livePreview) {
      els.livePreview.srcObject = null;
      els.livePreview.style.display = 'none';
    }
  }

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
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      mediaRecorder.stop();
    }
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
    renderPodcastFeed();
    renderPodcasts();
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

  const uploadCategorySelect = els.uploadForm.querySelector('select[name="category"]');
  const tracklistInput = els.uploadForm.querySelector('textarea[name="tracklist"]');
  const tracklistCount = document.getElementById('tracklistCount');

  uploadCategorySelect.addEventListener('change', updateUploadFormFields);
  document.querySelectorAll('[data-upload-category]').forEach((card) => {
    card.addEventListener('click', () => {
      uploadCategorySelect.value = card.dataset.uploadCategory;
      updateUploadFormFields();
    });
  });
  const releaseTypeSelect = els.uploadForm.querySelector('select[name="releaseType"]');
  releaseTypeSelect?.addEventListener('change', () => {
    uploadCategorySelect.value = releaseTypeSelect.value;
    updateUploadFormFields();
  });
  const mediaDropzone = document.getElementById('uploadMediaField');
  const mediaInput = els.uploadForm.querySelector('input[name="mediaFile"]');
  const updateSelectedFileName = () => {
    const selectedFile = mediaInput.files?.[0];
    if (selectedFile) document.getElementById('uploadMediaHint').textContent = `${selectedFile.name} (${Math.round(selectedFile.size / 1024 / 1024 * 10) / 10} MB)`;
  };
  mediaInput.addEventListener('change', updateSelectedFileName);
  ['dragenter', 'dragover'].forEach((eventName) => mediaDropzone.addEventListener(eventName, (event) => { event.preventDefault(); mediaDropzone.classList.add('dragging'); }));
  ['dragleave', 'drop'].forEach((eventName) => mediaDropzone.addEventListener(eventName, (event) => { event.preventDefault(); mediaDropzone.classList.remove('dragging'); }));
  mediaDropzone.addEventListener('drop', (event) => {
    const files = event.dataTransfer.files;
    if (files.length) {
      mediaInput.files = files;
      updateSelectedFileName();
    }
  });
  document.getElementById('cancelUpload')?.addEventListener('click', () => els.uploadDialog.close());
  tracklistInput.addEventListener('input', () => {
    const tracks = tracklistInput.value.split('\n').map(track => track.trim()).filter(Boolean);
    if (tracks.length > 50) {
      tracklistInput.value = tracks.slice(0, 50).join('\n');
    }
    tracklistCount.textContent = `${Math.min(tracks.length, 50)} / 50 songs`;
  });

  els.uploadForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const title = els.uploadForm.querySelector('input[name="title"]').value;
    const artistName = els.uploadForm.querySelector('input[name="artistName"]').value;
    const category = normalizeUploadCategory(uploadCategorySelect.value);
    const genre = els.uploadForm.querySelector('select[name="genre"]').value;
    const albumName = els.uploadForm.querySelector('input[name="albumName"]').value;
    const features = els.uploadForm.querySelector('input[name="features"]').value;
    const tracklist = tracklistInput.value.split('\n').map(track => track.trim()).filter(Boolean).slice(0, 50);
    const description = els.uploadForm.querySelector('textarea[name="description"]').value;
    const coverFile = els.uploadForm.querySelector('input[name="cover"]').files?.[0];
    const mediaFile = els.uploadForm.querySelector('input[name="mediaFile"]').files?.[0];
    const iconMap = { music: '🎵', single: '🎵', album: '💿', ep: '🎵', mixtape: '💿', video: '🎬', movie: '🎥', series: '📺', podcast: '🎙️', graphics: '🎨', marketplace: '🛍️' };
    const isMusicRelease = MUSIC_RELEASE_CATEGORIES.has(category);
    const isVideo = VIDEO_CATEGORIES.has(category);

    if (['album', 'ep', 'mixtape'].includes(category) && tracklist.length === 0) {
      alert('Add at least one song to the tracklist for an album, EP, or mixtape.');
      return;
    }
    
    const submitButton = els.uploadForm.querySelector('button[type="submit"]');
    submitButton.disabled = true;
    submitButton.textContent = 'Reading files...';

    let mediaFileRecord;
    let coverFileRecord;
    try {
      [mediaFileRecord, coverFileRecord] = await Promise.all([
        storeMediaFile(mediaFile),
        storeMediaFile(coverFile),
      ]);
    } catch (error) {
      submitButton.disabled = false;
      submitButton.textContent = 'Upload';
      alert(`Could not read the selected file: ${error.message}`);
      return;
    }

    const newUpload = {
      id: Date.now(),
      title,
      artist: artistName || state.profile.name,
      type: category.toUpperCase(),
      genre: genre || null,
      icon: iconMap[category] || '📁',
      albumName: isMusicRelease ? (albumName || null) : null,
      features: isMusicRelease ? (features || null) : null,
      tracklist: isMusicRelease && ['album', 'ep', 'mixtape'].includes(category) ? tracklist : null,
      director: isVideo ? (els.uploadForm.querySelector('input[name="director"]').value || null) : null,
      label: isVideo ? (els.uploadForm.querySelector('input[name="label"]').value || 'None') : null,
      producer: isVideo ? (els.uploadForm.querySelector('input[name="producer"]').value || null) : null,
      releaseYear: isVideo ? (els.uploadForm.querySelector('input[name="releaseYear"]').value || null) : null,
      duration: isVideo ? (els.uploadForm.querySelector('input[name="duration"]').value || null) : null,
      coverFileName: coverFile?.name || null,
      mediaFileName: mediaFile?.name || null,
      description: description || null,
      coverKey: coverFileRecord.key,
      mediaKey: mediaFileRecord.key,
      coverUrl: coverFileRecord.url,
      mediaUrl: mediaFileRecord.url,
      mediaMimeType: mediaFile?.type || null,
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
    submitButton.disabled = false;
    submitButton.textContent = 'Upload';
    tracklistCount.textContent = '0 / 50 songs';
    updateUploadFormFields();
    
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
  function renderSearchResults() {
    const input = document.getElementById('searchInput');
    const query = (input?.value || '').toLowerCase();
    const filtered = state.media.filter(m => (m.title || '').toLowerCase().includes(query) || (m.artist || '').toLowerCase().includes(query));
    els.trendingGrid.innerHTML = filtered.length ? filtered.map((item, idx) => `
      <div class="content-card" data-content-id="search-${idx}">
        <div class="content-card-img">${item.icon || '🎵'}</div>
        <div class="content-card-info">
          <div class="content-card-label">${item.type}</div>
          <div class="content-card-title">${item.title}</div>
          <div class="content-card-artist">${item.artist}</div>
          <div class="content-card-stats">
            <span>👁️ ${normalizeCount(item.views)}</span>
            <span>❤ ${normalizeCount(item.likes)}</span>
          </div>
          ${buildReactionButtons(normalizeReactionState({ ...item }), 'search', idx)}
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

  document.getElementById('searchInput')?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      renderSearchResults();
    }
  });

  // Search button click - mirrors Enter behavior
  document.querySelector('.search-btn')?.addEventListener('click', (e) => {
    e.preventDefault();
    renderSearchResults();
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
  if (type.includes('music') || type.includes('remix') || type.includes('mixtape') || type.includes('album') || type.includes('single') || type.includes('ep') || type.includes('podcast')) {
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
  const progress = playerState.duration ? (playerState.currentTime / playerState.duration) * 100 : 0;
  document.getElementById('progressFill').style.width = progress + '%';
  document.getElementById('currentTime').textContent = formatTime(playerState.currentTime);
}

// Update playback simulation
function simulatePlayback() {
  const mediaElement = playerState.currentType === 'video' ? els.videoPlayer : els.audioElement;
  if (!mediaElement || mediaElement.paused) return;
  playerState.currentTime = mediaElement.currentTime;
  playerState.duration = Number.isFinite(mediaElement.duration) ? mediaElement.duration : playerState.duration;
  document.getElementById('detailStatus').textContent = `Playing ${formatTime(playerState.currentTime)}`;
  updateProgressBar();
}

// Stream media content with enhanced player
async function streamMedia(item, contentUrl = null) {
  const mediaType = getMediaTypeForPlayback(item.type);
  const mediaUrl = contentUrl || item.mediaUrl || await getStoredMediaUrl(item.mediaKey);
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
  document.getElementById('duration').textContent = '0:00';
  
  // Set album cover icon based on type
  const coverImage = document.getElementById('coverImage');
  const coverIcon = item.icon || '🎵';
  coverImage.textContent = item.coverUrl ? '' : coverIcon;
  coverImage.style.backgroundImage = item.coverUrl ? `url("${item.coverUrl}")` : '';
  coverImage.style.backgroundSize = 'cover';
  coverImage.style.backgroundPosition = 'center';
  
  // Reset UI
  els.videoPlayer.style.display = 'none';
  els.audioPlayer.style.display = 'none';
  els.videoPlayer.pause();
  els.audioElement.pause();
  els.videoPlayer.removeAttribute('src');
  els.audioElement.removeAttribute('src');
  if (mediaType === 'video') {
    els.videoPlayer.src = mediaUrl || '';
    els.videoPlayer.controls = true;
    els.videoPlayer.poster = item.coverUrl || '';
    els.videoPlayer.style.display = mediaUrl ? 'block' : 'none';
  } else if (mediaType === 'audio') {
    els.audioElement.src = mediaUrl || '';
    els.audioElement.controls = true;
    document.getElementById('playerArtist').textContent = item.artist || 'Unknown artist';
    document.getElementById('playerGenre').textContent = item.genre || 'Audio';
    els.audioPlayer.style.display = mediaUrl ? 'block' : 'none';
  }
  document.getElementById('detailStatus').textContent = mediaUrl ? 'Ready to play' : 'No playable file attached';
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
  const mediaElement = playerState.currentType === 'video' ? els.videoPlayer : els.audioElement;
  if (!mediaElement?.src) {
    document.getElementById('detailStatus').textContent = 'No playable file attached';
    return;
  }
  mediaElement.play().catch((error) => {
    document.getElementById('detailStatus').textContent = `Playback failed: ${error.message}`;
  });
  playerState.isPlaying = true;
  document.getElementById('playBtn').style.display = 'none';
  document.getElementById('pauseBtn').style.display = 'block';
  document.getElementById('detailStatus').textContent = `Streaming ${formatTime(playerState.currentTime)}`;
}

// Pause media
function pauseMedia() {
  els.videoPlayer.pause();
  els.audioElement.pause();
  playerState.isPlaying = false;
  document.getElementById('playBtn').style.display = 'block';
  document.getElementById('pauseBtn').style.display = 'none';
  document.getElementById('detailStatus').textContent = 'Paused';
}

// Stop media
function stopMedia() {
  els.videoPlayer.pause();
  els.audioElement.pause();
  els.videoPlayer.currentTime = 0;
  els.audioElement.currentTime = 0;
  playerState.isPlaying = false;
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

function updateReaction(item, type) {
  if (!item || !item.reactions) return;
  item.reactions[type] = normalizeCount(item.reactions[type]) + 1;
  item.likes = Object.values(item.reactions).reduce((total, value) => total + normalizeCount(value), 0);
  localStorage.setItem(DATA_KEYS.MEDIA, JSON.stringify(state.media));
  localStorage.setItem(DATA_KEYS.UPLOADS, JSON.stringify(state.uploads));
}

// Bind media action buttons
function bindMediaActions(items, type) {
  document.querySelectorAll('.reaction-btn').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const reaction = btn.dataset.reaction;
      const itemId = btn.dataset.id;
      if (!reaction || !itemId) return;

      const itemIndex = itemId.includes('trending-') ? itemId.replace('trending-', '') : itemId.includes('upload-') ? itemId.replace('upload-', '') : null;
      const item = itemIndex !== null ? items[Number(itemIndex)] : null;
      if (!item) return;

      updateReaction(item, reaction);
      renderTrending();
      renderUploads();
      renderSearchResults();
    });
  });

  document.querySelectorAll('.btn-action').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = btn.dataset.id;
      if (!id) return;
      const [prefix, index] = id.split('-');
      if (!index) return;
      const item = items[parseInt(index)];
      if (!item) return;

      if (btn.classList.contains('btn-stream')) {
        streamMedia(item);
      } else if (btn.classList.contains('btn-publish')) {
        alert(`📤 Publishing: ${item.title}\n\nYour content is now live and visible to all users!`);
        btn.textContent = '✓ Published';
        btn.disabled = true;
      } else if (btn.classList.contains('btn-download')) {
        downloadMedia(item);
      } else if (btn.classList.contains('btn-view')) {
        const trackDetails = item.tracklist?.length ? `\nTracks: ${item.tracklist.length} (maximum 50)` : '';
        const videoDetails = item.director ? `\nDirector: ${item.director}\nRelease year: ${item.releaseYear || 'Not set'}\nDuration: ${item.duration || 'Not set'}` : '';
        alert(`👁 View Details\n\nTitle: ${item.title}\nArtist: ${item.artist}\nType: ${item.type}\nViews: ${item.views || 0}\nLikes: ${item.likes || 0}${trackDetails}${videoDetails}`);
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
    const mediaElement = playerState.currentType === 'video' ? els.videoPlayer : els.audioElement;
    if (mediaElement?.duration) {
      mediaElement.currentTime = percent * mediaElement.duration;
    }
    playerState.currentTime = percent * playerState.duration;
    updateProgressBar();
  });

  [els.videoPlayer, els.audioElement].forEach((mediaElement) => {
    mediaElement?.addEventListener('loadedmetadata', () => {
      playerState.duration = mediaElement.duration;
      document.getElementById('duration').textContent = formatTime(mediaElement.duration);
      updateProgressBar();
    });
    mediaElement?.addEventListener('ended', () => {
      playerState.isPlaying = false;
      document.getElementById('playBtn').style.display = 'block';
      document.getElementById('pauseBtn').style.display = 'none';
      document.getElementById('detailStatus').textContent = 'Finished';
    });
    mediaElement?.addEventListener('error', () => {
      document.getElementById('detailStatus').textContent = 'This file could not be played in the browser';
    });
  });
}

// Close player dialog
document.getElementById('closePlayer')?.addEventListener('click', () => {
  stopMedia();
  els.playerDialog.close();
});

// Start
document.addEventListener('DOMContentLoaded', init);