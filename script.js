const STORAGE_KEYS = {
	media: "vibestream-media",
	uploads: "vibestream-uploads",
	queue: "vibestream-queue",
	follows: "vibestream-follows",
	stream: "vibestream-stream-settings",
	streamItemState: "vibestream-stream-item-state",
	comments: "vibestream-comments",
	profile: "vibestream-profile",
	spotlight: "vibestream-spotlight-apps",
};

const MAX_MEDIA_ITEMS = 5000;
const MAX_UPLOADS = 5000;
const MAX_QUEUE_ITEMS = 500;
const TITLE_MAX_LEN = 120;
const CREATOR_MAX_LEN = 80;
const RECENT_WINDOW = 200;

const VALID_CATEGORIES = new Set([
	"music",
	"video",
	"videos",
	"podcast",
	"documentary",
	"live set",
	"series",
	"graphics",
	"movie",
	"mixtape",
	"music videos",
	"music video",
	"product",
	"other",
]);

const VALID_GENRES = new Set([
	"afrobeats",
	"hip hop",
	"r&b",
	"amapiano",
	"dancehall",
	"gospel",
	"podcast",
	"cinematic",
	"other",
]);

const VALID_STREAM_QUALITY = new Set(["360p", "720p", "1080p", "4k"]);
const VALID_STREAM_MODE = new Set(["public", "unlisted", "private"]);
const VALID_STREAM_SOURCE = new Set(["camera", "screen", "mixed"]);
const VALID_REACTIONS = ["like", "fire", "love"];

const DEFAULT_MEDIA = [
	{ id: "m1", title: "Neon Skyline", creator: "DJ Maphorisa", category: "music", views: "24.5K", palette: "linear-gradient(140deg, #2e7bff, #8f3cff)" },
	{ id: "m2", title: "Street Vibes 3", creator: "DJ Flexy", category: "mixtape", views: "18.7K", palette: "linear-gradient(140deg, #1469ff, #10307f)" },
	{ id: "m3", title: "Blood Covenant", creator: "Vibe Pictures", category: "movie", views: "35.6K", palette: "linear-gradient(140deg, #7d2a20, #25152f)" },
	{ id: "m4", title: "Last City", creator: "Core Frame", category: "series", views: "29.1K", palette: "linear-gradient(140deg, #1f3d6d, #0c141f)" },
	{ id: "m5", title: "Forever", creator: "Rex V", category: "music video", views: "22.8K", palette: "linear-gradient(140deg, #641d28, #1e182f)" },
	{ id: "m6", title: "Free Cover Pack", creator: "Design Hive", category: "graphics", views: "8.3K", palette: "linear-gradient(140deg, #8f6b2f, #1a1e38)" },
	{ id: "m7", title: "Vibe Hoodie", creator: "Street Wear", category: "product", views: "13.4K", palette: "linear-gradient(140deg, #2f3a54, #121826)" },
	{ id: "m8", title: "Pulse Mix 2026", creator: "VisionGFX", category: "music", views: "17.9K", palette: "linear-gradient(140deg, #0e66a8, #2a1655)" },
];

const DEFAULT_UPLOADS = [
	{ title: "Summer Fever", creator: "Jay Melody", createdAt: Date.now() - 2 * 60 * 60 * 1000 },
	{ title: "The Equalizer 3", creator: "Action Vault", createdAt: Date.now() - 4 * 60 * 60 * 1000 },
	{ title: "Logo Design Pack", creator: "VisionGFX", createdAt: Date.now() - 6 * 60 * 60 * 1000 },
	{ title: "No Love", creator: "Official V", createdAt: Date.now() - 9 * 60 * 60 * 1000 },
	{ title: "V-Lone Tee", creator: "Street Wear", createdAt: Date.now() - 8 * 60 * 60 * 1000 },
];

const promotions = [
	{ title: "Open Creator Challenges", desc: "Weekly free challenges to feature your work." },
	{ title: "Community Collab Hub", desc: "Find producers, designers and editors in one place." },
	{ title: "Free Creator Toolkit", desc: "Templates, release checklists and promo guides." },
];

const creators = [
	{ name: "DJ Maphorisa", role: "Artist" },
	{ name: "Director K", role: "Filmmaker" },
	{ name: "VisionGFX", role: "Designer" },
	{ name: "Street Wear", role: "Seller" },
	{ name: "King Promo", role: "Promoter" },
];

const playlist = ["Hot Hits This Week", "Afrobeats Bangers", "Rap Highlights", "Chill Vibes", "Movie Themes"];

const stats = [
	["Albums", "12,456"],
	["Mixtapes", "8,742"],
	["EPs", "6,312"],
	["Movies", "15,489"],
	["Series", "9,805"],
	["Music Videos", "7,248"],
	["Graphics", "5,631"],
	["Marketplace", "12,984"],
];

// Session-only blob URLs (not persisted – object URLs last until page reload)
const mediaBlobUrls = {};
let liveMediaStream = null;

const state = {
	selectedCategory: "all",
	selectedChip: "all",
	query: "",
	mediaItems: [],
	latestUploads: [],
	queue: [],
	follows: {},
	stream: {
		quality: "720p",
		mode: "public",
		source: "camera",
		isLive: false,
		scheduledAt: "",
	},
	streamItemState: {},
	streamFilter: "all",
	selectedStreamId: "",
	comments: [],
	pendingFiles: [],
	uploadDisplayLimit: 30,
};

const els = {
	menuToggle: document.getElementById("menuToggle"),
	sidebar: document.getElementById("sidebar"),
	searchInput: document.getElementById("searchInput"),
	menuItems: Array.from(document.querySelectorAll(".menu-item[data-section]")),
	chips: document.getElementById("filterChips"),
	statsStrip: document.getElementById("statsStrip"),
	trendingGrid: document.getElementById("trendingGrid"),
	latestStrip: document.getElementById("latestStrip"),
	promoGrid: document.getElementById("promoGrid"),
	creatorsList: document.getElementById("creatorsList"),
	playlistList: document.getElementById("playlistList"),
	queueList: document.getElementById("queueList"),
	nowPlayingText: document.getElementById("nowPlayingText"),
	queueRandom: document.getElementById("queueRandom"),
	clearFilters: document.getElementById("clearFilters"),
	uploadDialog: document.getElementById("uploadDialog"),
	uploadOpen: document.getElementById("uploadOpen"),
	createBtn: document.getElementById("createBtn"),
	uploadForm: document.getElementById("uploadForm"),
	toast: document.getElementById("toast"),
	playFeatured: document.getElementById("playFeatured"),
	themeCycle: document.getElementById("themeCycle"),
	clearQueue: document.getElementById("clearQueue"),
	communityShare: document.getElementById("communityShare"),
	profileBtn: document.getElementById("profileBtn"),
	joinSpotlight: document.getElementById("joinSpotlight"),
	uploadBack: document.getElementById("uploadBack"),
	uploadCancel: document.getElementById("uploadCancel"),
	streamStatus: document.getElementById("streamStatus"),
	streamQuality: document.getElementById("streamQuality"),
	streamMode: document.getElementById("streamMode"),
	streamSource: document.getElementById("streamSource"),
	goLiveBtn: document.getElementById("goLiveBtn"),
	scheduleBtn: document.getElementById("scheduleBtn"),
	stopLiveBtn: document.getElementById("stopLiveBtn"),
	toggleUploads: document.getElementById("toggleUploads"),
	uploadCustomCategory: document.querySelector("#uploadForm input[name='customCategory']"),
	uploadBulkTitles: document.querySelector("#uploadForm textarea[name='bulkTitles']"),
	uploadMediaFiles: document.getElementById("mediaFiles"),
	pendingFilesWrap: document.getElementById("pendingFilesWrap"),
	pendingFilesList: document.getElementById("pendingFilesList"),
	clearPendingFiles: document.getElementById("clearPendingFiles"),
	streamFilterRow: document.getElementById("streamFilterRow"),
	streamFeed: document.getElementById("streamFeed"),
	screenStatusBadge: document.getElementById("screenStatusBadge"),
	screenTitle: document.getElementById("screenTitle"),
	screenMeta: document.getElementById("screenMeta"),
	liveVideoFeed: document.getElementById("liveVideoFeed"),
	audioPlayer: document.getElementById("audioPlayer"),
	commentsList: document.getElementById("commentsList"),
	commentForm: document.getElementById("commentForm"),
	commentInput: document.getElementById("commentInput"),
	profileDialog: document.getElementById("profileDialog"),
	profileForm: document.getElementById("profileForm"),
	profileClose: document.getElementById("profileClose"),
	spotlightDialog: document.getElementById("spotlightDialog"),
	spotlightForm: document.getElementById("spotlightForm"),
	spotlightClose: document.getElementById("spotlightClose"),
};

let toastTimer;
let storageWarned = false;

function escapeHtml(value) {
	return String(value)
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/\"/g, "&quot;")
		.replace(/'/g, "&#39;");
}

function cleanText(value, maxLen) {
	return String(value || "")
		.replace(/[<>]/g, "")
		.replace(/\s+/g, " ")
		.trim()
		.slice(0, maxLen);
}

function normalizeCategory(value) {
	const cleaned = cleanText(value, 30).toLowerCase();
	if (!cleaned) {
		return "music";
	}
	if (cleaned === "video") {
		return "videos";
	}
	if (cleaned === "music videos") {
		return "music video";
	}
	if (cleaned === "other") {
		return "other";
	}
	return VALID_CATEGORIES.has(cleaned) ? cleaned : cleaned;
}

function normalizeGenre(value) {
	const cleaned = cleanText(value, 30).toLowerCase();
	if (!cleaned) {
		return "other";
	}
	return VALID_GENRES.has(cleaned) ? cleaned : "other";
}

function titleFromFileName(fileName) {
	const raw = String(fileName || "").replace(/\.[^/.]+$/, "");
	return cleanText(raw, TITLE_MAX_LEN);
}

function fileSignature(file) {
	return `${file.name}::${file.size}::${file.lastModified}`;
}

function renderPendingFiles() {
	if (!els.pendingFilesWrap || !els.pendingFilesList || !els.clearPendingFiles) {
		return;
	}
	if (!state.pendingFiles.length) {
		els.pendingFilesWrap.style.display = "none";
		els.pendingFilesList.innerHTML = "";
		return;
	}
	els.pendingFilesWrap.style.display = "block";
	els.pendingFilesList.innerHTML = state.pendingFiles
		.map((file) => `<li>${escapeHtml(file.name)}</li>`)
		.join("");
}

function clearPendingFilesQueue() {
	state.pendingFiles = [];
	if (els.uploadMediaFiles) {
		els.uploadMediaFiles.value = "";
	}
	renderPendingFiles();
}

function appendPendingFiles(files) {
	if (!Array.isArray(files) || !files.length) {
		return;
	}
	const existing = new Set(state.pendingFiles.map(fileSignature));
	files.forEach((file) => {
		if (!file || typeof file.name !== "string") {
			return;
		}
		const signature = fileSignature(file);
		if (!existing.has(signature)) {
			state.pendingFiles.push(file);
			existing.add(signature);
		}
	});
	renderPendingFiles();
}

function formatRelativeTime(createdAt) {
	const parsed = Number(createdAt);
	if (!Number.isFinite(parsed)) {
		return "Just now";
	}
	const diffMs = Math.max(Date.now() - parsed, 0);
	const minute = 60 * 1000;
	const hour = 60 * minute;
	const day = 24 * hour;
	if (diffMs < minute) {
		return "Just now";
	}
	if (diffMs < hour) {
		return `${Math.floor(diffMs / minute)}m ago`;
	}
	if (diffMs < day) {
		return `${Math.floor(diffMs / hour)}h ago`;
	}
	return `${Math.floor(diffMs / day)}d ago`;
}

function loadJson(key, fallback) {
	try {
		const value = localStorage.getItem(key);
		if (!value) {
			return fallback;
		}
		return JSON.parse(value);
	} catch {
		return fallback;
	}
}

function safeSetJson(key, data) {
	try {
		localStorage.setItem(key, JSON.stringify(data));
		return true;
	} catch {
		if (!storageWarned) {
			storageWarned = true;
			showToast("Storage is full. Older items may not be saved.");
		}
		return false;
	}
}

function showToast(message) {
	if (!els.toast) {
		return;
	}
	els.toast.textContent = message;
	els.toast.classList.add("show");
	if (toastTimer) {
		clearTimeout(toastTimer);
	}
	toastTimer = setTimeout(() => {
		els.toast.classList.remove("show");
	}, 2200);
}

function makeId() {
	if (window.crypto && typeof window.crypto.randomUUID === "function") {
		return window.crypto.randomUUID();
	}
	return `id-${Date.now()}-${Math.floor(Math.random() * 1e9)}`;
}

function normalizeMedia(rawMedia) {
	if (!Array.isArray(rawMedia)) {
		return [];
	}
	return rawMedia
		.map((item) => {
			if (!item || typeof item !== "object") {
				return null;
			}
			const title = cleanText(item.title, TITLE_MAX_LEN);
			const creator = cleanText(item.creator, CREATOR_MAX_LEN);
			if (!title || !creator) {
				return null;
			}
			return {
				id: cleanText(item.id || makeId(), 100),
				title,
				creator,
				category: normalizeCategory(item.category),
				genre: normalizeGenre(item.genre),
				views: cleanText(item.views || "0", 20),
				palette: cleanText(item.palette || "linear-gradient(140deg, #1f71ff, #0d2c7f)", 120),
				createdAt: Number(item.createdAt) || Date.now(),
			};
		})
		.filter(Boolean)
		.slice(0, MAX_MEDIA_ITEMS);
}

function normalizeUploads(rawUploads) {
	if (!Array.isArray(rawUploads)) {
		return [];
	}
	return rawUploads
		.map((item) => {
			if (!item || typeof item !== "object") {
				return null;
			}
			const title = cleanText(item.title, TITLE_MAX_LEN);
			const creator = cleanText(item.creator, CREATOR_MAX_LEN);
			if (!title || !creator) {
				return null;
			}
			const createdAt = Number(item.createdAt)
				|| Date.now() - (typeof item.time === "string" && item.time.endsWith("h ago")
					? Number(item.time.replace("h ago", "")) * 60 * 60 * 1000
					: 0);
			return { title, creator, genre: normalizeGenre(item.genre), createdAt };
		})
		.filter(Boolean)
		.slice(0, MAX_UPLOADS);
}

function normalizeQueue(rawQueue) {
	if (!Array.isArray(rawQueue)) {
		return [];
	}
	return rawQueue
		.map((entry) => {
			if (typeof entry === "string") {
				const title = cleanText(entry, TITLE_MAX_LEN);
				return title ? { id: makeId(), title, creator: "Unknown creator" } : null;
			}
			if (entry && typeof entry === "object") {
				const title = cleanText(entry.title, TITLE_MAX_LEN);
				if (!title) {
					return null;
				}
				return {
					id: cleanText(entry.id || makeId(), 100),
					title,
					creator: cleanText(entry.creator || "Unknown creator", CREATOR_MAX_LEN),
				};
			}
			return null;
		})
		.filter(Boolean)
		.slice(0, MAX_QUEUE_ITEMS);
}

function normalizeStream(rawStream) {
	const stream = rawStream && typeof rawStream === "object" ? rawStream : {};
	const quality = cleanText(stream.quality || "720p", 10).toLowerCase();
	const mode = cleanText(stream.mode || "public", 20).toLowerCase();
	const source = cleanText(stream.source || "camera", 20).toLowerCase();
	return {
		quality: VALID_STREAM_QUALITY.has(quality) ? quality : "720p",
		mode: VALID_STREAM_MODE.has(mode) ? mode : "public",
		source: VALID_STREAM_SOURCE.has(source) ? source : "camera",
		isLive: Boolean(stream.isLive),
		scheduledAt: cleanText(stream.scheduledAt || "", 80),
	};
}

function normalizeComments(rawComments) {
	if (!Array.isArray(rawComments)) {
		return [];
	}
	return rawComments
		.map((entry) => {
			if (!entry || typeof entry !== "object") {
				return null;
			}
			const text = cleanText(entry.text, 240);
			const author = cleanText(entry.author || "Viewer", CREATOR_MAX_LEN);
			if (!text) {
				return null;
			}
			const reactions = entry.reactions && typeof entry.reactions === "object" ? entry.reactions : {};
			return {
				id: cleanText(entry.id || makeId(), 100),
				streamId: cleanText(entry.streamId || "general", 100),
				author,
				text,
				createdAt: Number(entry.createdAt) || Date.now(),
				userReaction: VALID_REACTIONS.includes(cleanText(entry.userReaction || "", 20))
					? cleanText(entry.userReaction || "", 20)
					: "",
				reactions: {
					like: Number(reactions.like) || 0,
					fire: Number(reactions.fire) || 0,
					love: Number(reactions.love) || 0,
				},
			};
		})
		.filter(Boolean)
		.slice(0, 3000);
}

function normalizeStreamItemState(rawState) {
	if (!rawState || typeof rawState !== "object") {
		return {};
	}
	const normalized = {};
	Object.entries(rawState).forEach(([id, value]) => {
		const streamId = cleanText(id, 100);
		if (!streamId || !value || typeof value !== "object") {
			return;
		}
		const status = cleanText(value.status || "offline", 20).toLowerCase();
		normalized[streamId] = {
			status: ["live", "scheduled", "offline"].includes(status) ? status : "offline",
			viewers: Math.max(0, Number(value.viewers) || 0),
			updatedAt: Number(value.updatedAt) || Date.now(),
		};
	});
	return normalized;
}

function ensureStateIntegrity() {
	const validIds = new Set(state.mediaItems.map((item) => item.id));
	const cleanedMap = {};
	Object.entries(state.streamItemState).forEach(([id, val]) => {
		if (validIds.has(id)) {
			cleanedMap[id] = val;
		}
	});
	state.streamItemState = cleanedMap;

	if (!state.selectedStreamId || !validIds.has(state.selectedStreamId)) {
		state.selectedStreamId = state.mediaItems[0] ? state.mediaItems[0].id : "";
	}

	if (!state.comments.length) {
		const fallbackId = state.selectedStreamId || "general";
		state.comments = [
			{
				id: makeId(),
				streamId: fallbackId,
				author: "System",
				text: "Welcome to the live chat.",
				createdAt: Date.now() - 3 * 60 * 1000,
				userReaction: "",
				reactions: { like: 0, fire: 0, love: 0 },
			},
		];
	}
}

function loadState() {
	state.mediaItems = normalizeMedia(loadJson(STORAGE_KEYS.media, DEFAULT_MEDIA));
	if (!state.mediaItems.length) {
		state.mediaItems = normalizeMedia(DEFAULT_MEDIA);
	}
	state.latestUploads = normalizeUploads(loadJson(STORAGE_KEYS.uploads, DEFAULT_UPLOADS));
	if (!state.latestUploads.length) {
		state.latestUploads = normalizeUploads(DEFAULT_UPLOADS);
	}
	state.queue = normalizeQueue(loadJson(STORAGE_KEYS.queue, []));
	const follows = loadJson(STORAGE_KEYS.follows, {});
	state.follows = follows && typeof follows === "object" ? follows : {};
	state.stream = normalizeStream(loadJson(STORAGE_KEYS.stream, state.stream));
	state.streamItemState = normalizeStreamItemState(loadJson(STORAGE_KEYS.streamItemState, {}));
	state.comments = normalizeComments(loadJson(STORAGE_KEYS.comments, []));
	ensureStateIntegrity();
}

function saveState() {
	safeSetJson(STORAGE_KEYS.media, state.mediaItems.slice(0, MAX_MEDIA_ITEMS));
	safeSetJson(STORAGE_KEYS.uploads, state.latestUploads.slice(0, MAX_UPLOADS));
	safeSetJson(STORAGE_KEYS.queue, state.queue.slice(0, MAX_QUEUE_ITEMS));
	safeSetJson(STORAGE_KEYS.follows, state.follows);
	safeSetJson(STORAGE_KEYS.stream, state.stream);
	safeSetJson(STORAGE_KEYS.streamItemState, state.streamItemState);
	safeSetJson(STORAGE_KEYS.comments, state.comments);
}

function getStreamStatusForItem(item) {
	if (!item) {
		return "offline";
	}
	const entry = state.streamItemState[item.id];
	if (entry && typeof entry === "object") {
		return entry.status;
	}
	return "offline";
}

function getFilteredStreams() {
	const streams = state.mediaItems.filter((item) => {
		const category = item.category;
		return category.includes("music") || category.includes("video") || category.includes("movie") || category.includes("series");
	});
	if (state.streamFilter === "all") {
		return streams;
	}
	return streams.filter((item) => getStreamStatusForItem(item) === state.streamFilter);
}

function renderStreamFilters() {
	if (!els.streamFilterRow) {
		return;
	}
	const filters = ["all", "live", "scheduled", "offline"];
	els.streamFilterRow.innerHTML = filters
		.map((filter) => `<button class="stream-filter-chip ${state.streamFilter === filter ? "active" : ""}" data-stream-filter="${filter}">${filter}</button>`)
		.join("");

	Array.from(els.streamFilterRow.querySelectorAll("button[data-stream-filter]")).forEach((button) => {
		button.addEventListener("click", () => {
			state.streamFilter = cleanText(button.dataset.streamFilter || "all", 20);
			renderStreamFilters();
			renderStreamFeed();
		});
	});
}

function updateStreamScreen(item) {
	if (!els.screenTitle || !els.screenMeta || !els.screenStatusBadge) {
		return;
	}
	if (!item) {
		els.screenTitle.textContent = "No stream selected";
		els.screenMeta.textContent = "Select a stream from the feed.";
		els.screenStatusBadge.textContent = "OFFLINE";
		els.screenStatusBadge.classList.remove("live", "scheduled");
		return;
	}
	const status = getStreamStatusForItem(item);
	els.screenTitle.textContent = item.title;
	els.screenMeta.textContent = `${item.creator} • ${item.category} • ${item.genre || "other"} • ${item.views} views`;
	els.screenStatusBadge.textContent = status.toUpperCase();
	els.screenStatusBadge.classList.remove("live", "scheduled");
	if (status === "live") {
		els.screenStatusBadge.classList.add("live");
	}
	if (status === "scheduled") {
		els.screenStatusBadge.classList.add("scheduled");
	}
}

function renderStreamFeed() {
	if (!els.streamFeed) {
		return;
	}
	const filtered = getFilteredStreams();
	if (!filtered.length) {
		els.streamFeed.innerHTML = "<p class='meta'>No streams match this filter.</p>";
		updateStreamScreen(null);
		renderComments();
		return;
	}
	if (!state.selectedStreamId || !filtered.some((item) => item.id === state.selectedStreamId)) {
		state.selectedStreamId = filtered[0].id;
	}
	els.streamFeed.innerHTML = filtered
		.map((item) => {
			const status = getStreamStatusForItem(item);
			return `
				<article class="stream-card ${state.selectedStreamId === item.id ? "active" : ""}" data-stream-id="${escapeHtml(item.id)}">
					<h4>${escapeHtml(item.title)}</h4>
					<p>${escapeHtml(item.creator)} • ${escapeHtml(status.toUpperCase())}</p>
				</article>
			`;
		})
		.join("");

	Array.from(els.streamFeed.querySelectorAll(".stream-card")).forEach((card) => {
		card.addEventListener("click", () => {
			state.selectedStreamId = cleanText(card.dataset.streamId || "", 100);
			renderStreamFeed();
			renderComments();
		});
	});

	const selected = state.mediaItems.find((item) => item.id === state.selectedStreamId) || filtered[0];
	updateStreamScreen(selected);
}

function renderComments() {
	if (!els.commentsList) {
		return;
	}
	const streamId = state.selectedStreamId || "general";
	const comments = state.comments
		.filter((entry) => entry.streamId === streamId)
		.sort((a, b) => b.createdAt - a.createdAt)
		.slice(0, 80);

	if (!comments.length) {
		els.commentsList.innerHTML = "<p class='meta'>No comments yet. Start the conversation.</p>";
		return;
	}

	els.commentsList.innerHTML = comments
		.map(
			(entry) => `
				<article class="comment-item">
					<p class="author">${escapeHtml(entry.author)}</p>
					<p class="text">${escapeHtml(entry.text)}</p>
					<p class="time">${escapeHtml(formatRelativeTime(entry.createdAt))}</p>
					<div class="reaction-row">
						<button class="reaction-btn ${entry.userReaction === "like" ? "active" : ""}" data-reaction-comment-id="${escapeHtml(entry.id)}" data-reaction-type="like">Like ${entry.reactions.like}</button>
						<button class="reaction-btn ${entry.userReaction === "fire" ? "active" : ""}" data-reaction-comment-id="${escapeHtml(entry.id)}" data-reaction-type="fire">Fire ${entry.reactions.fire}</button>
						<button class="reaction-btn ${entry.userReaction === "love" ? "active" : ""}" data-reaction-comment-id="${escapeHtml(entry.id)}" data-reaction-type="love">Love ${entry.reactions.love}</button>
					</div>
				</article>
			`
		)
		.join("");

	Array.from(els.commentsList.querySelectorAll("button[data-reaction-comment-id]")).forEach((button) => {
		button.addEventListener("click", () => {
			const id = cleanText(button.dataset.reactionCommentId || "", 100);
			const reaction = cleanText(button.dataset.reactionType || "", 20).toLowerCase();
			if (!VALID_REACTIONS.includes(reaction)) {
				return;
			}
			const target = state.comments.find((entry) => entry.id === id);
			if (!target) {
				return;
			}
			if (target.userReaction === reaction) {
				target.reactions[reaction] = Math.max(0, target.reactions[reaction] - 1);
				target.userReaction = "";
			} else {
				if (target.userReaction && target.reactions[target.userReaction] > 0) {
					target.reactions[target.userReaction] -= 1;
				}
				target.userReaction = reaction;
				target.reactions[reaction] += 1;
			}
			saveState();
			renderComments();
		});
	});
}

function applyStreamState() {
	if (!els.streamStatus || !els.streamQuality || !els.streamMode || !els.streamSource) {
		return;
	}
	const { isLive, quality, mode, source, scheduledAt } = state.stream;
	els.streamQuality.value = quality;
	els.streamMode.value = mode;
	els.streamSource.value = source;
	if (isLive) {
		els.streamStatus.textContent = `Status: Live now (${quality}, ${mode}, ${source})`;
		return;
	}
	if (scheduledAt) {
		els.streamStatus.textContent = `Status: Scheduled for ${scheduledAt}`;
		return;
	}
	els.streamStatus.textContent = "Status: Offline";
}

function categoryMatches(filter, category) {
	if (filter === "all") {
		return true;
	}
	if (filter === "videos") {
		return category.includes("movie") || category.includes("video");
	}
	if (filter === "marketplace") {
		return category.includes("product");
	}
	return category.includes(filter);
}

function matchesFilters(item) {
	let bySidebar = categoryMatches(state.selectedCategory, item.category);
	if (state.selectedCategory === "favorites") {
		bySidebar = Boolean(state.follows[item.creator]);
	}
	if (state.selectedCategory === "history") {
		bySidebar = state.queue.some((queued) => queued.title === item.title);
	}
	if (state.selectedCategory === "recent") {
		const recentTitles = new Set(state.latestUploads.slice(0, RECENT_WINDOW).map((upload) => upload.title));
		bySidebar = recentTitles.has(item.title);
	}
	if (state.selectedCategory === "upload") {
		bySidebar = true;
	}

	const byChip = categoryMatches(state.selectedChip, item.category);
	const q = cleanText(state.query, 120).toLowerCase();
	const bySearch = !q || `${item.title} ${item.creator} ${item.category}`.toLowerCase().includes(q);

	return bySidebar && byChip && bySearch;
}

function getFilteredMedia() {
	return state.mediaItems.filter(matchesFilters);
}

function renderProfile() {
	const profile = loadJson(STORAGE_KEYS.profile, { displayName: "John Doe", initials: "JD", bio: "" });
	const initials = cleanText(profile.initials || "JD", 2).toUpperCase() || "JD";
	const displayName = cleanText(profile.displayName || "John Doe", 60) || "John Doe";
	if (els.profileBtn) {
		const span = els.profileBtn.querySelector("span");
		if (span) {
			span.textContent = initials;
		}
		els.profileBtn.setAttribute("aria-label", `Open profile: ${displayName}`);
	}
}

function renderStats() {
	if (!els.statsStrip) {
		return;
	}
	els.statsStrip.innerHTML = stats
		.map(
			([label, value]) => `
				<article class="stat-card">
					<p>${escapeHtml(label)}</p>
					<strong>${escapeHtml(value)}</strong>
				</article>
			`
		)
		.join("");
}

function renderChips() {
	if (!els.chips) {
		return;
	}
	const chipValues = ["all", "music", "videos", "movie", "series", "graphics", "product"];
	els.chips.innerHTML = chipValues
		.map(
			(chip) =>
				`<button class="chip ${state.selectedChip === chip ? "active" : ""}" data-chip="${escapeHtml(chip)}">${escapeHtml(chip)}</button>`
		)
		.join("");

	Array.from(els.chips.querySelectorAll(".chip")).forEach((chipEl) => {
		chipEl.addEventListener("click", () => {
			state.selectedChip = cleanText(chipEl.dataset.chip || "all", 20);
			renderChips();
			renderMedia();
		});
	});
}

function renderMedia() {
	if (!els.trendingGrid) {
		return;
	}
	const filtered = getFilteredMedia();
	if (!filtered.length) {
		els.trendingGrid.innerHTML = "<p class='meta'>No content matches your filters.</p>";
		return;
	}

	els.trendingGrid.innerHTML = filtered
		.map(
			(item) => `
				<article class="media-card">
					<div class="media-art" style="background:${escapeHtml(item.palette)}">
						<span class="tag">${escapeHtml(item.category)}</span>
					</div>
					<div class="media-info">
						<p class="media-title">${escapeHtml(item.title)}</p>
						<p class="meta">${escapeHtml(item.creator)} - ${escapeHtml(item.genre || "other")} - ${escapeHtml(item.views)} views</p>
						<div class="card-actions">
							<button data-action="play" data-id="${escapeHtml(item.id)}">Play</button>
							<button data-action="queue" data-id="${escapeHtml(item.id)}">Queue</button>
						</div>
					</div>
				</article>
			`
		)
		.join("");

	Array.from(els.trendingGrid.querySelectorAll("button")).forEach((btn) => {
		btn.addEventListener("click", () => {
			const item = state.mediaItems.find((m) => m.id === btn.dataset.id);
			if (!item) {
				return;
			}

			if (btn.dataset.action === "play" && els.nowPlayingText) {
				els.nowPlayingText.textContent = `Now playing: ${item.title} by ${item.creator}`;

				// Play actual file if one was uploaded for this item
				const blobInfo = mediaBlobUrls[item.id];
				if (blobInfo && blobInfo.url) {
					if (blobInfo.type && blobInfo.type.startsWith("video/")) {
						if (els.liveVideoFeed) {
							// Stop any live camera first
							if (liveMediaStream) {
								liveMediaStream.getTracks().forEach((track) => track.stop());
								liveMediaStream = null;
							}
							els.liveVideoFeed.srcObject = null;
							els.liveVideoFeed.src = blobInfo.url;
							els.liveVideoFeed.style.display = "block";
							els.liveVideoFeed.play().catch(() => {});
						}
					} else if (els.audioPlayer) {
						els.audioPlayer.src = blobInfo.url;
						els.audioPlayer.play().catch(() => {});
					}
				}

				showToast(`Playing ${item.title}`);
			}

			if (btn.dataset.action === "queue") {
				state.queue.unshift({ id: makeId(), title: item.title, creator: item.creator });
				state.queue = state.queue.slice(0, MAX_QUEUE_ITEMS);
				saveState();
				renderQueue();
				showToast(`${item.title} added to queue`);
			}
		});
	});
}

function renderUploads() {
	if (!els.latestStrip) {
		return;
	}
	const hasMore = state.latestUploads.length > state.uploadDisplayLimit;
	const uploadsToRender = hasMore ? state.latestUploads.slice(0, state.uploadDisplayLimit) : state.latestUploads;

	els.latestStrip.innerHTML = uploadsToRender
		.map(
			(item) => `
				<article class="upload-item">
					<p>${escapeHtml(item.title)}</p>
					<p class="creator">${escapeHtml(item.creator)} • ${escapeHtml(item.genre || "other")}</p>
					<p class="time">${escapeHtml(formatRelativeTime(item.createdAt))}</p>
				</article>
			`
		)
		.join("");

	if (els.toggleUploads) {
		if (state.latestUploads.length <= 30) {
			els.toggleUploads.style.visibility = "hidden";
		} else {
			els.toggleUploads.style.visibility = "visible";
			els.toggleUploads.textContent = hasMore
				? `Show More (${Math.max(state.latestUploads.length - state.uploadDisplayLimit, 0)} left)`
				: "Show Less";
		}
	}
}

function renderPromotions() {
	if (!els.promoGrid) {
		return;
	}
	els.promoGrid.innerHTML = promotions
		.map(
			(item, index) => `
				<article class="promo-card">
					<h4>${escapeHtml(item.title)}</h4>
					<p>${escapeHtml(item.desc)}</p>
					<button class="btn-outline" data-promo-index="${index}">Learn More</button>
				</article>
			`
		)
		.join("");

	Array.from(els.promoGrid.querySelectorAll("button[data-promo-index]")).forEach((button) => {
		button.addEventListener("click", () => {
			const index = Number(button.dataset.promoIndex || 0);
			const promo = promotions[index];
			if (promo) {
				showToast(`${promo.title} opened`);
			}
		});
	});
}

function renderCreators() {
	if (!els.creatorsList) {
		return;
	}
	els.creatorsList.innerHTML = creators
		.map((creator) => {
			const initials = creator.name
				.split(" ")
				.map((part) => part[0])
				.join("")
				.slice(0, 2)
				.toUpperCase();
			const following = Boolean(state.follows[creator.name]);
			return `
				<article class="creator-item">
					<span class="creator-avatar">${escapeHtml(initials)}</span>
					<div>
						<strong>${escapeHtml(creator.name)}</strong>
						<p class="meta">${escapeHtml(creator.role)}</p>
					</div>
					<button data-creator="${escapeHtml(creator.name)}">${following ? "Following" : "Follow"}</button>
				</article>
			`;
		})
		.join("");

	Array.from(els.creatorsList.querySelectorAll("button[data-creator]")).forEach((btn) => {
		btn.addEventListener("click", () => {
			const name = cleanText(btn.dataset.creator || "", CREATOR_MAX_LEN);
			if (!name) {
				return;
			}
			state.follows[name] = !state.follows[name];
			saveState();
			renderCreators();
			showToast(`${state.follows[name] ? "Following" : "Unfollowed"} ${name}`);
		});
	});
}

function renderPlaylist() {
	if (!els.playlistList) {
		return;
	}
	els.playlistList.innerHTML = playlist
		.map((item) => `<li>${escapeHtml(item)} <span class="meta">50 songs</span></li>`)
		.join("");
}

function renderQueue() {
	if (!els.queueList) {
		return;
	}
	const queue = state.queue.slice(0, 8);
	if (!queue.length) {
		els.queueList.innerHTML = "<li class='meta'>Queue is empty. Add a track.</li>";
		return;
	}
	els.queueList.innerHTML = queue
		.map(
			(item) => `
				<li class="queue-item">
					<span>${escapeHtml(item.title)}</span>
					<button data-remove-queue="${escapeHtml(item.id)}">Remove</button>
				</li>
			`
		)
		.join("");

	Array.from(els.queueList.querySelectorAll("button[data-remove-queue]")).forEach((button) => {
		button.addEventListener("click", () => {
			const removeId = cleanText(button.dataset.removeQueue || "", 100);
			state.queue = state.queue.filter((queued) => queued.id !== removeId);
			saveState();
			renderQueue();
			showToast("Removed from queue");
		});
	});
}

function addSafeListener(element, eventName, handler) {
	if (!element) {
		return;
	}
	element.addEventListener(eventName, handler);
}

function registerGlobalErrorHandlers() {
	window.addEventListener("error", () => {
		showToast("Something went wrong. Recovered safely.");
	});
	window.addEventListener("unhandledrejection", () => {
		showToast("An async action failed. Please retry.");
	});
}

function bindEvents() {
	addSafeListener(els.menuToggle, "click", () => {
		if (els.sidebar) {
			els.sidebar.classList.toggle("open");
		}
	});

	addSafeListener(document, "click", (event) => {
		if (!els.sidebar || !els.menuToggle) {
			return;
		}
		if (window.innerWidth > 980 || !els.sidebar.classList.contains("open")) {
			return;
		}
		if (!els.sidebar.contains(event.target) && event.target !== els.menuToggle) {
			els.sidebar.classList.remove("open");
		}
	});

	addSafeListener(els.searchInput, "input", () => {
		state.query = cleanText(els.searchInput.value, 120);
		renderMedia();
	});

	els.menuItems.forEach((menuItem) => {
		addSafeListener(menuItem, "click", () => {
			els.menuItems.forEach((el) => el.classList.remove("active"));
			menuItem.classList.add("active");
			state.selectedCategory = cleanText(menuItem.dataset.section || "all", 20);
			renderMedia();
		});
	});

	addSafeListener(els.clearFilters, "click", () => {
		state.query = "";
		state.selectedCategory = "all";
		state.selectedChip = "all";
		if (els.searchInput) {
			els.searchInput.value = "";
		}
		els.menuItems.forEach((el) => {
			el.classList.toggle("active", el.dataset.section === "all");
		});
		renderChips();
		renderMedia();
	});

	const openUpload = () => {
		if (!els.uploadDialog) {
			return;
		}
		if (typeof els.uploadDialog.showModal === "function") {
			els.uploadDialog.showModal();
			return;
		}
		showToast("Upload dialog is not supported in this browser.");
	};

	addSafeListener(els.uploadOpen, "click", openUpload);
	addSafeListener(els.createBtn, "click", openUpload);

	addSafeListener(els.uploadMediaFiles, "change", () => {
		if (!els.uploadMediaFiles || !els.uploadMediaFiles.files) {
			return;
		}
		appendPendingFiles(Array.from(els.uploadMediaFiles.files));
		const added = els.uploadMediaFiles.files.length;
		els.uploadMediaFiles.value = "";
		if (added > 0) {
			showToast(`${added} file${added === 1 ? "" : "s"} added to upload queue`);
		}
	});

	addSafeListener(els.clearPendingFiles, "click", () => {
		clearPendingFilesQueue();
		showToast("Cleared selected files");
	});

	addSafeListener(els.uploadForm, "submit", (event) => {
		event.preventDefault();
		const formData = new FormData(els.uploadForm);
		const title = cleanText(formData.get("title"), TITLE_MAX_LEN);
		const creator = cleanText(formData.get("creator"), CREATOR_MAX_LEN);
		const baseCategory = normalizeCategory(formData.get("category"));
		const genre = normalizeGenre(formData.get("genre"));
		const customCategory = normalizeCategory(formData.get("customCategory"));
		const category = customCategory && customCategory !== "other" ? customCategory : baseCategory;
		const bulkRaw = String(formData.get("bulkTitles") || "").slice(0, 20000);
		const bulkTitles = bulkRaw
			.split(/\r?\n/)
			.map((line) => cleanText(line, TITLE_MAX_LEN))
			.filter((line) => line.length >= 3);
		const selectedFiles = [...state.pendingFiles];
		const fileTitles = selectedFiles
			.map((file) => titleFromFileName(file.name))
			.filter((name) => name.length >= 3);
		const titlesToUpload = [title, ...bulkTitles, ...fileTitles].filter(Boolean);
		const uniqueTitles = Array.from(new Set(titlesToUpload));

		// Build a map from title → file so we can store blob URLs per item
		const fileTitleToFile = {};
		fileTitles.forEach((t, i) => {
			if (!fileTitleToFile[t]) {
				fileTitleToFile[t] = selectedFiles[i];
			}
		});

		if (!uniqueTitles.length) {
			showToast("Add a title, bulk titles, or select media files.");
			return;
		}
		if (creator.length < 2) {
			showToast("Creator name must be at least 2 characters.");
			return;
		}
		if (uniqueTitles.length > 200) {
			showToast("Please upload up to 200 items per batch.");
			return;
		}

		let addedCount = 0;
		const start = Date.now();
		uniqueTitles.forEach((uploadTitle, index) => {
			const now = start + index;
			const id = makeId();
			// Store playable blob URL if this title originated from an uploaded file
			const srcFile = fileTitleToFile[uploadTitle];
			if (srcFile) {
				try {
					mediaBlobUrls[id] = { url: URL.createObjectURL(srcFile), type: srcFile.type };
				} catch {
					// createObjectURL not available – skip
				}
			}
			state.latestUploads.unshift({ title: uploadTitle, creator, genre, createdAt: now });
			state.mediaItems.unshift({
				id,
				title: uploadTitle,
				creator,
				category,
				genre,
				views: "0",
				palette: "linear-gradient(140deg, #1f71ff, #0d2c7f)",
				createdAt: now,
			});
			addedCount += 1;
		});
		state.latestUploads = state.latestUploads.slice(0, MAX_UPLOADS);
		state.mediaItems = state.mediaItems.slice(0, MAX_MEDIA_ITEMS);

		renderUploads();
		renderMedia();
		saveState();
		if (els.uploadDialog && typeof els.uploadDialog.close === "function") {
			els.uploadDialog.close();
		}
		els.uploadForm.reset();
		clearPendingFilesQueue();
		showToast(`Published ${addedCount} upload${addedCount === 1 ? "" : "s"}`);
	});

	addSafeListener(els.uploadDialog, "click", (event) => {
		if (event.target === els.uploadDialog && typeof els.uploadDialog.close === "function") {
			els.uploadDialog.close();
		}
	});

	addSafeListener(els.uploadBack, "click", () => {
		if (els.uploadDialog && typeof els.uploadDialog.close === "function") {
			els.uploadDialog.close();
		}
		showToast("Returned to dashboard");
	});

	addSafeListener(els.uploadCancel, "click", () => {
		if (els.uploadDialog && typeof els.uploadDialog.close === "function") {
			els.uploadDialog.close();
		}
		if (els.uploadForm) {
			els.uploadForm.reset();
		}
		clearPendingFilesQueue();
		showToast("Upload draft cleared");
	});

	addSafeListener(els.playFeatured, "click", () => {
		const featured = state.mediaItems[0];
		if (!featured || !els.nowPlayingText) {
			return;
		}
		els.nowPlayingText.textContent = `Now playing: ${featured.title} by ${featured.creator}`;
		showToast(`Playing ${featured.title}`);
	});

	addSafeListener(els.queueRandom, "click", () => {
		if (!state.mediaItems.length) {
			showToast("No tracks available to queue.");
			return;
		}
		const index = Math.floor(Math.random() * state.mediaItems.length);
		const randomItem = state.mediaItems[index];
		state.queue.unshift({ id: makeId(), title: randomItem.title, creator: randomItem.creator });
		state.queue = state.queue.slice(0, MAX_QUEUE_ITEMS);
		saveState();
		renderQueue();
		showToast(`${randomItem.title} queued`);
	});

	addSafeListener(els.profileBtn, "click", () => {
		if (!els.profileDialog || !els.profileForm) {
			return;
		}
		const profile = loadJson(STORAGE_KEYS.profile, { displayName: "John Doe", initials: "JD", bio: "" });
		els.profileForm.elements.displayName.value = cleanText(profile.displayName || "John Doe", 60);
		els.profileForm.elements.initials.value = cleanText(profile.initials || "JD", 2).toUpperCase();
		els.profileForm.elements.bio.value = cleanText(profile.bio || "", 200);
		if (typeof els.profileDialog.showModal === "function") {
			els.profileDialog.showModal();
		}
	});

	addSafeListener(els.profileForm, "submit", (event) => {
		event.preventDefault();
		if (!els.profileForm) {
			return;
		}
		const fd = new FormData(els.profileForm);
		const displayName = cleanText(fd.get("displayName"), 60) || "Creator";
		const rawInitials = cleanText(fd.get("initials"), 2).toUpperCase();
		const initials = rawInitials || displayName.slice(0, 2).toUpperCase();
		const bio = cleanText(fd.get("bio"), 200);
		safeSetJson(STORAGE_KEYS.profile, { displayName, initials, bio });
		renderProfile();
		if (els.profileDialog && typeof els.profileDialog.close === "function") {
			els.profileDialog.close();
		}
		showToast("Profile saved");
	});

	addSafeListener(els.profileClose, "click", () => {
		if (els.profileDialog && typeof els.profileDialog.close === "function") {
			els.profileDialog.close();
		}
	});

	addSafeListener(els.profileDialog, "click", (event) => {
		if (event.target === els.profileDialog && typeof els.profileDialog.close === "function") {
			els.profileDialog.close();
		}
	});

	addSafeListener(els.joinSpotlight, "click", () => {
		if (els.spotlightDialog && typeof els.spotlightDialog.showModal === "function") {
			els.spotlightDialog.showModal();
		}
	});

	addSafeListener(els.spotlightForm, "submit", (event) => {
		event.preventDefault();
		if (!els.spotlightForm) {
			return;
		}
		const fd = new FormData(els.spotlightForm);
		const name = cleanText(fd.get("spotName"), 80);
		const email = cleanText(fd.get("spotEmail"), 120);
		const role = cleanText(fd.get("spotRole"), 40);
		const bio = cleanText(fd.get("spotBio"), 400);
		if (name.length < 2) {
			showToast("Please enter your creator name.");
			return;
		}
		if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
			showToast("Please enter a valid email address.");
			return;
		}
		const existing = loadJson(STORAGE_KEYS.spotlight, []);
		existing.unshift({ name, email, role, bio, submittedAt: Date.now() });
		safeSetJson(STORAGE_KEYS.spotlight, existing.slice(0, 200));
		if (els.spotlightDialog && typeof els.spotlightDialog.close === "function") {
			els.spotlightDialog.close();
		}
		els.spotlightForm.reset();
		showToast(`Application submitted, ${name}! We'll review it soon.`);
	});

	addSafeListener(els.spotlightClose, "click", () => {
		if (els.spotlightDialog && typeof els.spotlightDialog.close === "function") {
			els.spotlightDialog.close();
		}
	});

	addSafeListener(els.spotlightDialog, "click", (event) => {
		if (event.target === els.spotlightDialog && typeof els.spotlightDialog.close === "function") {
			els.spotlightDialog.close();
		}
	});

	addSafeListener(els.clearQueue, "click", () => {
		state.queue = [];
		saveState();
		renderQueue();
		showToast("Queue cleared");
	});

	addSafeListener(els.communityShare, "click", async () => {
		const inviteUrl = "https://www.vibestream.co.za";
		const shareData = { title: "Join VibeStream", text: "Stream, release and promote your music for free on VibeStream!", url: inviteUrl };
		if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
			try {
				await navigator.share(shareData);
				showToast("Invite shared successfully");
			} catch {
				showToast("Share cancelled");
			}
		} else if (navigator.clipboard) {
			try {
				await navigator.clipboard.writeText(inviteUrl);
				showToast("Invite link copied: " + inviteUrl);
			} catch {
				showToast("Invite link: " + inviteUrl);
			}
		} else {
			showToast("Invite link: " + inviteUrl);
		}
	});

	if (els.streamQuality && els.streamMode && els.streamSource) {
		const updateStreamPrefs = () => {
			state.stream.quality = VALID_STREAM_QUALITY.has(els.streamQuality.value.toLowerCase())
				? els.streamQuality.value.toLowerCase()
				: "720p";
			state.stream.mode = VALID_STREAM_MODE.has(els.streamMode.value.toLowerCase())
				? els.streamMode.value.toLowerCase()
				: "public";
			state.stream.source = VALID_STREAM_SOURCE.has(els.streamSource.value.toLowerCase())
				? els.streamSource.value.toLowerCase()
				: "camera";
			saveState();
			applyStreamState();
		};
		addSafeListener(els.streamQuality, "change", updateStreamPrefs);
		addSafeListener(els.streamMode, "change", updateStreamPrefs);
		addSafeListener(els.streamSource, "change", updateStreamPrefs);
	}

	addSafeListener(els.goLiveBtn, "click", async () => {
		const source = state.stream.source;
		let stream = null;
		try {
			if (source === "screen") {
				stream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });
			} else if (source === "mixed") {
				// Camera + screen: show camera in preview
				stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
			} else {
				stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
			}
		} catch {
			showToast("Camera/screen access denied. Check browser permissions.");
			return;
		}

		// Stop any previous stream
		if (liveMediaStream) {
			liveMediaStream.getTracks().forEach((track) => track.stop());
		}
		liveMediaStream = stream;

		if (els.liveVideoFeed) {
			els.liveVideoFeed.src = "";
			els.liveVideoFeed.srcObject = stream;
			els.liveVideoFeed.style.display = "block";
		}

		state.stream.isLive = true;
		state.stream.scheduledAt = "";
		if (state.selectedStreamId) {
			state.streamItemState[state.selectedStreamId] = {
				status: "live",
				viewers: Math.max(1, Number((state.streamItemState[state.selectedStreamId] || {}).viewers) || 0),
				updatedAt: Date.now(),
			};
		}
		saveState();
		applyStreamState();
		renderStreamFeed();
		showToast("You are now live");
	});

	addSafeListener(els.scheduleBtn, "click", () => {
		const inOneHour = new Date(Date.now() + 60 * 60 * 1000);
		state.stream.isLive = false;
		state.stream.scheduledAt = inOneHour.toLocaleString();
		if (state.selectedStreamId) {
			state.streamItemState[state.selectedStreamId] = {
				status: "scheduled",
				viewers: Number((state.streamItemState[state.selectedStreamId] || {}).viewers) || 0,
				updatedAt: Date.now(),
			};
		}
		saveState();
		applyStreamState();
		renderStreamFeed();
		showToast("Stream scheduled for 1 hour from now");
	});

	addSafeListener(els.stopLiveBtn, "click", () => {
		if (liveMediaStream) {
			liveMediaStream.getTracks().forEach((track) => track.stop());
			liveMediaStream = null;
		}
		if (els.liveVideoFeed) {
			els.liveVideoFeed.srcObject = null;
			els.liveVideoFeed.src = "";
			els.liveVideoFeed.style.display = "none";
		}
		state.stream.isLive = false;
		state.stream.scheduledAt = "";
		if (state.selectedStreamId) {
			state.streamItemState[state.selectedStreamId] = {
				status: "offline",
				viewers: 0,
				updatedAt: Date.now(),
			};
		}
		saveState();
		applyStreamState();
		renderStreamFeed();
		showToast("Stream stopped");
	});

	addSafeListener(els.commentForm, "submit", (event) => {
		event.preventDefault();
		if (!els.commentInput) {
			return;
		}
		const text = cleanText(els.commentInput.value, 240);
		if (!text) {
			showToast("Comment cannot be empty.");
			return;
		}
		const streamId = state.selectedStreamId || "general";
		state.comments.unshift({
			id: makeId(),
			streamId,
			author: "You",
			text,
			createdAt: Date.now(),
			userReaction: "",
			reactions: { like: 0, fire: 0, love: 0 },
		});
		state.comments = state.comments.slice(0, 3000);
		saveState();
		els.commentInput.value = "";
		renderComments();
		showToast("Comment posted");
	});

	addSafeListener(els.toggleUploads, "click", () => {
		if (state.latestUploads.length <= 30) {
			return;
		}
		if (state.uploadDisplayLimit >= state.latestUploads.length) {
			state.uploadDisplayLimit = 30;
		} else {
			state.uploadDisplayLimit += 30;
		}
		renderUploads();
	});

	const accents = [
		["#1f71ff", "#00d2ff"],
		["#1ecb7f", "#00a4d9"],
		["#ff784f", "#ff2f7f"],
	];
	let accentIndex = 0;
	addSafeListener(els.themeCycle, "click", () => {
		accentIndex = (accentIndex + 1) % accents.length;
		const [a, b] = accents[accentIndex];
		document.documentElement.style.setProperty("--accent", a);
		document.documentElement.style.setProperty("--accent-2", b);
		showToast("Accent updated");
	});
}

function init() {
	registerGlobalErrorHandlers();
	loadState();
	renderProfile();
	renderStats();
	renderChips();
	renderMedia();
	renderUploads();
	renderPromotions();
	renderCreators();
	renderPlaylist();
	renderQueue();
	applyStreamState();
	renderStreamFilters();
	renderStreamFeed();
	renderComments();
	renderPendingFiles();
	bindEvents();
}

init();

