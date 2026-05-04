import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, 'data');
const app = express();
const PORT = 3001;

app.use(express.json({ limit: '5mb' }));

// CORS — allow Vite dev server
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  console.log(`Created data directory: ${DATA_DIR}`);
}

// Slugify a service name into a safe filename
function toFilename(name) {
  return (name || 'untitled')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 80);
}

// GET /api/roadmaps — list all roadmaps
app.get('/api/roadmaps', (req, res) => {
  try {
    const files = fs.readdirSync(DATA_DIR).filter(f => f.endsWith('.json'));
    const roadmaps = files.map(f => {
      try {
        const content = fs.readFileSync(path.join(DATA_DIR, f), 'utf-8');
        const data = JSON.parse(content);
        data._filename = f;
        return data;
      } catch (e) {
        console.error(`Error reading ${f}:`, e.message);
        return null;
      }
    }).filter(Boolean);
    res.json(roadmaps);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// PUT /api/roadmaps/:filename — save/update a roadmap
app.put('/api/roadmaps/:filename', (req, res) => {
  try {
    const data = req.body;
    const filename = req.params.filename.endsWith('.json')
      ? req.params.filename
      : req.params.filename + '.json';
    const filepath = path.join(DATA_DIR, path.basename(filename));
    fs.writeFileSync(filepath, JSON.stringify(data, null, 2), 'utf-8');
    res.json({ saved: filename });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// POST /api/roadmaps — create a new roadmap (auto-generates filename)
app.post('/api/roadmaps', (req, res) => {
  try {
    const data = req.body;
    let base = toFilename(data.serviceName);
    let filename = `${base}.json`;
    let counter = 1;
    while (fs.existsSync(path.join(DATA_DIR, filename))) {
      filename = `${base}-${counter}.json`;
      counter++;
    }
    const filepath = path.join(DATA_DIR, filename);
    data._filename = filename;
    fs.writeFileSync(filepath, JSON.stringify(data, null, 2), 'utf-8');
    res.json({ saved: filename, data });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// DELETE /api/roadmaps/:filename — delete a roadmap
app.delete('/api/roadmaps/:filename', (req, res) => {
  try {
    const filename = path.basename(req.params.filename);
    const filepath = path.join(DATA_DIR, filename);
    if (fs.existsSync(filepath)) {
      fs.unlinkSync(filepath);
      res.json({ deleted: filename });
    } else {
      res.status(404).json({ error: 'Not found' });
    }
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.listen(PORT, () => {
  console.log(`Roadmap API server running on http://localhost:${PORT}`);
  console.log(`Data directory: ${DATA_DIR}`);
});
