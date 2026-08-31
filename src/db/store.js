import {
  DEFAULT_COMMITTEE,
  DEFAULT_FESTIVALS,
  DEFAULT_ALBUMS,
  DEFAULT_PHOTOS,
  DEFAULT_MILESTONES
} from './defaultData.js';

const DB_KEY = 'bayanapalli_community_db';

const isIpAddress = (host) => /^(\d{1,3}\.){3}\d{1,3}$/.test(host);

// Helper to determine candidate API URLs for multi-device & network access
const getApiBaseUrls = () => {
  const urls = [];
  // 1. Environment variable if defined (e.g. Vercel/Render deployment)
  if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_URL) {
    urls.push(import.meta.env.VITE_API_URL.replace(/\/$/, ''));
  }
  // 2. Relative API path (Works natively on Vercel via api/index.js & local Vite proxy)
  urls.push('/api');
  // 3. Direct localhost and LAN IP fallback
  if (typeof window !== 'undefined' && window.location && window.location.hostname) {
    const hostname = window.location.hostname;
    const protocol = window.location.protocol || 'http:';
    if (isIpAddress(hostname)) {
      urls.push(`${protocol}//${hostname}:5000/api`);
    } else if (hostname === 'localhost' || hostname === '127.0.0.1') {
      urls.push(`http://localhost:5000/api`);
    }
  }
  return urls;
};

// Cross-tab / Broadcast notification system
const dbChannel = typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel('bayanapalli_db_channel') : null;

export const notifyDbChanged = () => {
  try {
    if (dbChannel) {
      dbChannel.postMessage({ type: 'DB_UPDATED', timestamp: Date.now() });
    }
    window.dispatchEvent(new CustomEvent('bayanapalli_db_updated'));
  } catch (e) {
    console.warn('Failed to broadcast db change event:', e);
  }
};

export const subscribeDbChanged = (callback) => {
  const handleMessage = (e) => {
    if (e.data && e.data.type === 'DB_UPDATED') {
      callback();
    }
  };
  const handleCustomEvent = () => callback();

  if (dbChannel) {
    dbChannel.addEventListener('message', handleMessage);
  }
  window.addEventListener('bayanapalli_db_updated', handleCustomEvent);

  return () => {
    if (dbChannel) {
      dbChannel.removeEventListener('message', handleMessage);
    }
    window.removeEventListener('bayanapalli_db_updated', handleCustomEvent);
  };
};

// Central Cloud Remote Database URL (npoint.io) - identical architecture to gajawada-jewellers
const REMOTE_DB_URL = 'https://api.npoint.io/66a94c8fdb996c0457c1';

// Initialize Database in localStorage safely
export const initDatabase = () => {
  const initialDb = {
    committee: DEFAULT_COMMITTEE,
    festivals: DEFAULT_FESTIVALS,
    albums: DEFAULT_ALBUMS,
    photos: DEFAULT_PHOTOS,
    milestones: DEFAULT_MILESTONES,
    messages: []
  };

  try {
    if (typeof localStorage !== 'undefined') {
      const existingData = localStorage.getItem(DB_KEY);
      if (!existingData) {
        try {
          localStorage.setItem(DB_KEY, JSON.stringify(initialDb));
        } catch (e) {
          console.warn('Could not write initial DB to localStorage:', e);
        }
        return initialDb;
      }
      return JSON.parse(existingData);
    }
    return initialDb;
  } catch (e) {
    console.error('Failed to parse database from localStorage, resetting.', e);
    return initialDb;
  }
};

// Retrieve Database (Sync local fallback)
export const getDatabase = () => {
  return initDatabase();
};

// Save Database to Remote Cloud (npoint.io), Browser localStorage, and Express backend
export const saveDatabase = async (data) => {
  if (!data) return;

  // 1. Instant Cache Update: Browser localStorage
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(DB_KEY, JSON.stringify(data));
    }
  } catch (e) {
    console.warn('localStorage setItem failed (quota exceeded or restricted):', e);
  }

  // 2. Notify open tabs & React context instantly (0ms delay)
  notifyDbChanged();

  // 3. Primary Cloud Persistence (npoint.io) with 3.5s timeout safeguard
  const cloudSave = (async () => {
    try {
      const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
      const timeoutId = controller ? setTimeout(() => controller.abort(), 3500) : null;
      await fetch(REMOTE_DB_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        signal: controller ? controller.signal : undefined
      });
      if (timeoutId) clearTimeout(timeoutId);
    } catch (e) {
      console.warn('Could not save database to remote cloud (npoint.io):', e);
    }
  })();

  // 4. Express local server fallback with 2s timeout safeguard
  const candidateUrls = getApiBaseUrls();
  const expressSaves = candidateUrls.map(async (apiBase) => {
    try {
      const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
      const timeoutId = controller ? setTimeout(() => controller.abort(), 2000) : null;
      await fetch(`${apiBase}/database`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        signal: controller ? controller.signal : undefined
      });
      if (timeoutId) clearTimeout(timeoutId);
    } catch (e) {
      // Background Express sync error ignored
    }
  });

  await Promise.allSettled([cloudSave, ...expressSaves]);
};

// --- API Persistence Helpers ---

// Helper to safely merge fetched remote data with existing local data
const mergeDataSafely = (remoteData, localData) => {
  if (!remoteData || typeof remoteData !== 'object') return localData;
  
  const merged = {
    committee: Array.isArray(remoteData.committee) && remoteData.committee.length > 0 ? remoteData.committee : (localData.committee || []),
    festivals: Array.isArray(remoteData.festivals) && remoteData.festivals.length > 0 ? remoteData.festivals : (localData.festivals || []),
    albums: Array.isArray(remoteData.albums) && remoteData.albums.length > 0 ? remoteData.albums : (localData.albums || []),
    photos: Array.isArray(remoteData.photos) && remoteData.photos.length > 0 ? remoteData.photos : (localData.photos || []),
    milestones: Array.isArray(remoteData.milestones) && remoteData.milestones.length > 0 ? remoteData.milestones : (localData.milestones || []),
    messages: Array.isArray(remoteData.messages) ? remoteData.messages : (localData.messages || [])
  };

  return merged;
};

export const fetchDatabaseApi = async () => {
  const localDb = getDatabase();

  // 1. Fetch from Remote Cloud DB (npoint.io) with cache-busting & 3.5s timeout safeguard
  try {
    const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
    const timeoutId = controller ? setTimeout(() => controller.abort(), 3500) : null;
    const cacheBusterUrl = `${REMOTE_DB_URL}?t=${Date.now()}`;
    const res = await fetch(cacheBusterUrl, { 
      cache: 'no-store',
      signal: controller ? controller.signal : undefined
    });
    if (timeoutId) clearTimeout(timeoutId);

    if (res.ok) {
      const text = await res.text();
      try {
        const data = JSON.parse(text);
        if (data && typeof data === 'object') {
          const merged = mergeDataSafely(data, localDb);
          try {
            if (typeof localStorage !== 'undefined') {
              localStorage.setItem(DB_KEY, JSON.stringify(merged));
            }
          } catch (e) {
            console.warn('localStorage cache update failed:', e);
          }
          return merged;
        }
      } catch (jsonErr) {
        console.warn('Remote cloud returned non-JSON payload, falling back to local cache.');
      }
    }
  } catch (e) {
    console.warn('Could not fetch database from remote cloud (npoint.io), trying local endpoints:', e);
  }

  // 2. Fallback to Express backend endpoints with 2s timeout safeguard
  const candidateUrls = getApiBaseUrls();
  for (const apiBase of candidateUrls) {
    try {
      const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
      const timeoutId = controller ? setTimeout(() => controller.abort(), 2000) : null;
      const res = await fetch(`${apiBase}/database`, {
        signal: controller ? controller.signal : undefined
      });
      if (timeoutId) clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        if (data && typeof data === 'object') {
          const merged = mergeDataSafely(data, localDb);
          try {
            if (typeof localStorage !== 'undefined') {
              localStorage.setItem(DB_KEY, JSON.stringify(merged));
            }
          } catch (e) {
            console.warn('localStorage cache update failed:', e);
          }
          return merged;
        }
      }
    } catch (e) {
      console.warn(`Express server at ${apiBase} not reachable:`, e);
    }
  }

  // 3. Fallback to localStorage cache
  return localDb;
};

export const getFreshDatabase = async () => {
  return await fetchDatabaseApi();
};

// Committee Members
export const getMembers = () => getDatabase().committee;

export const addMember = async (member) => {
  const db = await getFreshDatabase();
  const newMember = {
    ...member,
    id: member.id || `member_${Date.now()}`
  };
  db.committee.push(newMember);
  await saveDatabase(db);
  return newMember;
};

export const updateMember = async (id, updatedFields) => {
  const db = await getFreshDatabase();
  db.committee = db.committee.map(m => m.id === id ? { ...m, ...updatedFields } : m);
  await saveDatabase(db);
};

export const deleteMember = async (id) => {
  const db = await getFreshDatabase();
  db.committee = db.committee.filter(m => m.id !== id);
  await saveDatabase(db);
};

// Festivals & Events
export const getFestivals = () => getDatabase().festivals;

export const addFestival = async (festival) => {
  const db = await getFreshDatabase();
  const newFestival = {
    ...festival,
    id: festival.id || `fes_${Date.now()}`,
    year: parseInt(festival.year)
  };
  db.festivals.push(newFestival);

  const newAlbum = {
    id: `alb_${Date.now()}`,
    festivalId: newFestival.id,
    name: `General Album - ${newFestival.name}`,
    year: newFestival.year,
    description: `Photos from ${newFestival.name}`
  };
  db.albums.push(newAlbum);
  await saveDatabase(db);
  return newFestival;
};

export const updateFestival = async (id, updatedFields) => {
  const db = await getFreshDatabase();
  if (updatedFields.year) updatedFields.year = parseInt(updatedFields.year);
  db.festivals = db.festivals.map(f => f.id === id ? { ...f, ...updatedFields } : f);
  await saveDatabase(db);
};

export const deleteFestival = async (id) => {
  const db = await getFreshDatabase();
  db.festivals = db.festivals.filter(f => f.id !== id);
  const albumsToDelete = db.albums.filter(a => a.festivalId === id).map(a => a.id);
  db.photos = db.photos.filter(p => !albumsToDelete.includes(p.albumId));
  db.albums = db.albums.filter(a => a.festivalId !== id);
  await saveDatabase(db);
};

// Albums
export const getAlbums = () => getDatabase().albums;

export const addAlbum = async (album) => {
  const db = await getFreshDatabase();
  const newAlbum = {
    ...album,
    id: album.id || `alb_${Date.now()}`,
    year: parseInt(album.year)
  };
  db.albums.push(newAlbum);
  await saveDatabase(db);
  return newAlbum;
};

export const updateAlbum = async (id, updatedFields) => {
  const db = await getFreshDatabase();
  if (updatedFields.year) updatedFields.year = parseInt(updatedFields.year);
  db.albums = db.albums.map(a => a.id === id ? { ...a, ...updatedFields } : a);
  await saveDatabase(db);
};

export const deleteAlbum = async (id) => {
  const db = await getFreshDatabase();
  db.albums = db.albums.filter(a => a.id !== id);
  db.photos = db.photos.filter(p => p.albumId !== id);
  await saveDatabase(db);
};

// Photos
export const getPhotos = () => getDatabase().photos;

export const addPhotos = async (newPhotos) => {
  const db = await getFreshDatabase();
  const added = [];
  newPhotos.forEach((photo, index) => {
    const item = {
      ...photo,
      id: photo.id || `photo_${Date.now()}_${index}`,
      likes: photo.likes || 0
    };
    db.photos.push(item);
    added.push(item);
  });
  await saveDatabase(db);
  return added;
};

export const updatePhoto = async (id, updatedFields) => {
  const db = await getFreshDatabase();
  db.photos = db.photos.map(p => p.id === id ? { ...p, ...updatedFields } : p);
  await saveDatabase(db);
};

export const deletePhoto = async (id) => {
  const db = await getFreshDatabase();
  db.photos = db.photos.filter(p => p.id !== id);
  await saveDatabase(db);
};

export const likePhoto = async (id) => {
  const db = await getFreshDatabase();
  db.photos = db.photos.map(p => p.id === id ? { ...p, likes: (p.likes || 0) + 1 } : p);
  await saveDatabase(db);
  return db.photos.find(p => p.id === id);
};

// Milestones
export const getMilestones = () => getDatabase().milestones;

// Messages
export const getMessages = () => getDatabase().messages;

export const addMessage = async (message) => {
  const db = await getFreshDatabase();
  const newMessage = {
    ...message,
    id: message.id || `msg_${Date.now()}`,
    timestamp: new Date().toISOString(),
    readStatus: false
  };
  db.messages.push(newMessage);
  await saveDatabase(db);
  return newMessage;
};

export const toggleMessageReadStatus = async (id) => {
  const db = await getFreshDatabase();
  db.messages = db.messages.map(m => m.id === id ? { ...m, readStatus: !m.readStatus } : m);
  await saveDatabase(db);
};

export const deleteMessage = async (id) => {
  const db = await getFreshDatabase();
  db.messages = db.messages.filter(m => m.id !== id);
  await saveDatabase(db);
};

// Global Search across local cache
export const globalSearch = (query) => {
  if (!query || query.trim() === '') return { members: [], festivals: [], photos: [] };
  const term = query.toLowerCase().trim();
  const db = getDatabase();

  const members = (db.committee || []).filter(
    m => m.name.toLowerCase().includes(term) ||
         m.role.toLowerCase().includes(term) ||
         m.description.toLowerCase().includes(term) ||
         (m.startYear && m.startYear.toString().includes(term))
  );

  const festivals = (db.festivals || []).filter(
    f => f.name.toLowerCase().includes(term) ||
         f.description.toLowerCase().includes(term) ||
         f.year.toString().includes(term) ||
         f.location.toLowerCase().includes(term)
  );

  const photos = (db.photos || []).filter(p => {
    const album = (db.albums || []).find(a => a.id === p.albumId);
    const festival = album ? (db.festivals || []).find(f => f.id === album.festivalId) : null;
    
    return p.caption.toLowerCase().includes(term) ||
           (p.photographer && p.photographer.toLowerCase().includes(term)) ||
           (p.location && p.location.toLowerCase().includes(term)) ||
           (album && album.name.toLowerCase().includes(term)) ||
           (festival && festival.name.toLowerCase().includes(term)) ||
           (p.date && p.date.includes(term));
  }).map(p => {
    const album = (db.albums || []).find(a => a.id === p.albumId);
    const festival = album ? (db.festivals || []).find(f => f.id === album.festivalId) : null;
    return {
      ...p,
      albumName: album ? album.name : '',
      festivalName: festival ? festival.name : '',
      year: festival ? festival.year : (album ? album.year : '')
    };
  });

  return { members, festivals, photos };
};

// Backup Database
export const exportDatabase = () => {
  const db = getDatabase();
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(db, null, 2));
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute("href", dataStr);
  downloadAnchor.setAttribute("download", `bayanapalli_db_backup_${new Date().toISOString().slice(0,10)}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
};

// Restore Database
export const importDatabase = async (jsonData) => {
  try {
    const db = JSON.parse(jsonData);
    if (db.committee && db.festivals && db.albums && db.photos && db.milestones) {
      await saveDatabase(db);
      return true;
    }
    throw new Error("Missing required tables/fields");
  } catch (e) {
    console.error("Invalid database format", e);
    return false;
  }
};
