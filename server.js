import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import {
  DEFAULT_COMMITTEE,
  DEFAULT_FESTIVALS,
  DEFAULT_ALBUMS,
  DEFAULT_PHOTOS,
  DEFAULT_MILESTONES
} from './src/db/defaultData.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: '50mb' }));

const DATA_DIR = path.join(__dirname, 'server', 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initial seed database helper
const getInitialDatabase = () => ({
  committee: DEFAULT_COMMITTEE,
  festivals: DEFAULT_FESTIVALS,
  albums: DEFAULT_ALBUMS,
  photos: DEFAULT_PHOTOS,
  milestones: DEFAULT_MILESTONES,
  messages: []
});

// Helper to read database file
const readDatabase = () => {
  try {
    if (!fs.existsSync(DB_FILE)) {
      const initial = getInitialDatabase();
      fs.writeFileSync(DB_FILE, JSON.stringify(initial, null, 2), 'utf-8');
      return initial;
    }
    const content = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    console.error('Error reading DB file, returning initial database:', error);
    return getInitialDatabase();
  }
};

// Helper to write database file
const writeDatabase = (data) => {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (error) {
    console.error('Error writing DB file:', error);
    return false;
  }
};

// --- REST API ENDPOINTS ---

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Full Database Get & Replace
app.get('/api/database', (req, res) => {
  const db = readDatabase();
  res.json(db);
});

app.post('/api/database', (req, res) => {
  const newDb = req.body;
  if (!newDb || typeof newDb !== 'object') {
    return res.status(400).json({ error: 'Invalid database payload' });
  }
  const success = writeDatabase(newDb);
  if (success) {
    res.json({ message: 'Database saved successfully', db: newDb });
  } else {
    res.status(500).json({ error: 'Failed to write database file' });
  }
});

// Committee Members
app.get('/api/committee', (req, res) => {
  const db = readDatabase();
  res.json(db.committee || []);
});

app.post('/api/committee', (req, res) => {
  const db = readDatabase();
  const member = {
    ...req.body,
    id: req.body.id || `member_${Date.now()}`
  };
  db.committee = db.committee || [];
  db.committee.push(member);
  writeDatabase(db);
  res.status(201).json(member);
});

app.put('/api/committee/:id', (req, res) => {
  const db = readDatabase();
  const { id } = req.params;
  let updatedMember = null;
  db.committee = (db.committee || []).map((m) => {
    if (m.id === id) {
      updatedMember = { ...m, ...req.body };
      return updatedMember;
    }
    return m;
  });
  writeDatabase(db);
  res.json(updatedMember || { error: 'Member not found' });
});

app.delete('/api/committee/:id', (req, res) => {
  const db = readDatabase();
  const { id } = req.params;
  db.committee = (db.committee || []).filter((m) => m.id !== id);
  writeDatabase(db);
  res.json({ message: 'Member deleted', id });
});

// Festivals
app.get('/api/festivals', (req, res) => {
  const db = readDatabase();
  res.json(db.festivals || []);
});

app.post('/api/festivals', (req, res) => {
  const db = readDatabase();
  const festival = {
    ...req.body,
    id: req.body.id || `fes_${Date.now()}`,
    year: parseInt(req.body.year)
  };
  db.festivals = db.festivals || [];
  db.festivals.push(festival);

  // Auto create album
  const newAlbum = {
    id: `alb_${Date.now()}`,
    festivalId: festival.id,
    name: `General Album - ${festival.name}`,
    year: festival.year,
    description: `Photos from ${festival.name}`
  };
  db.albums = db.albums || [];
  db.albums.push(newAlbum);

  writeDatabase(db);
  res.status(201).json(festival);
});

app.put('/api/festivals/:id', (req, res) => {
  const db = readDatabase();
  const { id } = req.params;
  let updatedFes = null;
  if (req.body.year) req.body.year = parseInt(req.body.year);

  db.festivals = (db.festivals || []).map((f) => {
    if (f.id === id) {
      updatedFes = { ...f, ...req.body };
      return updatedFes;
    }
    return f;
  });
  writeDatabase(db);
  res.json(updatedFes || { error: 'Festival not found' });
});

app.delete('/api/festivals/:id', (req, res) => {
  const db = readDatabase();
  const { id } = req.params;
  db.festivals = (db.festivals || []).filter((f) => f.id !== id);
  const albumsToDelete = (db.albums || []).filter((a) => a.festivalId === id).map((a) => a.id);
  db.photos = (db.photos || []).filter((p) => !albumsToDelete.includes(p.albumId));
  db.albums = (db.albums || []).filter((a) => a.festivalId !== id);

  writeDatabase(db);
  res.json({ message: 'Festival and associated albums deleted', id });
});

// Albums
app.get('/api/albums', (req, res) => {
  const db = readDatabase();
  res.json(db.albums || []);
});

app.post('/api/albums', (req, res) => {
  const db = readDatabase();
  const album = {
    ...req.body,
    id: req.body.id || `alb_${Date.now()}`,
    year: parseInt(req.body.year)
  };
  db.albums = db.albums || [];
  db.albums.push(album);
  writeDatabase(db);
  res.status(201).json(album);
});

app.put('/api/albums/:id', (req, res) => {
  const db = readDatabase();
  const { id } = req.params;
  let updatedAlb = null;
  if (req.body.year) req.body.year = parseInt(req.body.year);

  db.albums = (db.albums || []).map((a) => {
    if (a.id === id) {
      updatedAlb = { ...a, ...req.body };
      return updatedAlb;
    }
    return a;
  });
  writeDatabase(db);
  res.json(updatedAlb || { error: 'Album not found' });
});

app.delete('/api/albums/:id', (req, res) => {
  const db = readDatabase();
  const { id } = req.params;
  db.albums = (db.albums || []).filter((a) => a.id !== id);
  db.photos = (db.photos || []).filter((p) => p.albumId !== id);
  writeDatabase(db);
  res.json({ message: 'Album deleted', id });
});

// Photos
app.get('/api/photos', (req, res) => {
  const db = readDatabase();
  res.json(db.photos || []);
});

app.post('/api/photos', (req, res) => {
  const db = readDatabase();
  const photosToAdd = Array.isArray(req.body) ? req.body : [req.body];
  const added = [];

  db.photos = db.photos || [];
  photosToAdd.forEach((p, idx) => {
    const item = {
      ...p,
      id: p.id || `photo_${Date.now()}_${idx}`,
      likes: p.likes || 0
    };
    db.photos.push(item);
    added.push(item);
  });

  writeDatabase(db);
  res.status(201).json(added);
});

app.put('/api/photos/:id', (req, res) => {
  const db = readDatabase();
  const { id } = req.params;
  let updatedPhoto = null;

  db.photos = (db.photos || []).map((p) => {
    if (p.id === id) {
      updatedPhoto = { ...p, ...req.body };
      return updatedPhoto;
    }
    return p;
  });
  writeDatabase(db);
  res.json(updatedPhoto || { error: 'Photo not found' });
});

app.delete('/api/photos/:id', (req, res) => {
  const db = readDatabase();
  const { id } = req.params;
  db.photos = (db.photos || []).filter((p) => p.id !== id);
  writeDatabase(db);
  res.json({ message: 'Photo deleted', id });
});

app.post('/api/photos/:id/like', (req, res) => {
  const db = readDatabase();
  const { id } = req.params;
  let updatedPhoto = null;

  db.photos = (db.photos || []).map((p) => {
    if (p.id === id) {
      updatedPhoto = { ...p, likes: (p.likes || 0) + 1 };
      return updatedPhoto;
    }
    return p;
  });
  writeDatabase(db);
  res.json(updatedPhoto || { error: 'Photo not found' });
});

// Messages
app.get('/api/messages', (req, res) => {
  const db = readDatabase();
  res.json(db.messages || []);
});

app.post('/api/messages', (req, res) => {
  const db = readDatabase();
  const msg = {
    ...req.body,
    id: `msg_${Date.now()}`,
    timestamp: new Date().toISOString(),
    readStatus: false
  };
  db.messages = db.messages || [];
  db.messages.push(msg);
  writeDatabase(db);
  res.status(201).json(msg);
});

app.patch('/api/messages/:id/toggle-read', (req, res) => {
  const db = readDatabase();
  const { id } = req.params;
  let updatedMsg = null;

  db.messages = (db.messages || []).map((m) => {
    if (m.id === id) {
      updatedMsg = { ...m, readStatus: !m.readStatus };
      return updatedMsg;
    }
    return m;
  });
  writeDatabase(db);
  res.json(updatedMsg || { error: 'Message not found' });
});

app.delete('/api/messages/:id', (req, res) => {
  const db = readDatabase();
  const { id } = req.params;
  db.messages = (db.messages || []).filter((m) => m.id !== id);
  writeDatabase(db);
  res.json({ message: 'Message deleted', id });
});

// Start Express Server
app.listen(PORT, () => {
  console.log(`🚀 Express server is running on http://localhost:${PORT}`);
});
