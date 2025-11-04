
const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const PORT = process.env.PORT || 3000;
const HOST = '0.0.0.0';

const dbDir = path.join(__dirname, 'db');
const uploadsDir = path.join(__dirname, 'uploads');

if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir);
}
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

app.use(express.json());
app.use('/uploads', express.static(uploadsDir));

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${uuidv4()}${path.extname(file.originalname)}`);
  },
});

const upload = multer({ storage });

// CRUD Operations

// Create a document
app.post('/:collection', (req, res) => {
  const { collection } = req.params;
  const resolvedDbDir = path.resolve(dbDir);
  const collectionDir = path.resolve(resolvedDbDir, collection);

  if (!collectionDir.startsWith(resolvedDbDir)) {
    return res.status(400).json({ error: 'Invalid collection' });
  }

  if (!fs.existsSync(collectionDir)) {
    fs.mkdirSync(collectionDir);
  }
  const id = uuidv4();
  const createdAt = new Date().toISOString();
  const doc = { id, createdAt, updatedAt: createdAt, ...req.body };
  const filePath = path.join(collectionDir, `${id}.json`);
  fs.writeFileSync(filePath, JSON.stringify(doc, null, 2));
  res.status(201).json(doc);
});

// Read all documents in a collection
app.get('/:collection', (req, res) => {
  const { collection } = req.params;
  const resolvedDbDir = path.resolve(dbDir);
  const collectionDir = path.resolve(resolvedDbDir, collection);

  if (!collectionDir.startsWith(resolvedDbDir)) {
    return res.status(400).json({ error: 'Invalid collection' });
  }

  if (!fs.existsSync(collectionDir)) {
    return res.json([]);
  }
  const files = fs.readdirSync(collectionDir);
  const docs = files.map((file) => {
    const filePath = path.join(collectionDir, file);
    return JSON.parse(fs.readFileSync(filePath));
  });
  res.json(docs);
});

// Read a single document
app.get('/:collection/:id', (req, res) => {
  const { collection, id } = req.params;
  const resolvedDbDir = path.resolve(dbDir);
  const collectionDir = path.resolve(resolvedDbDir, collection);

  if (!collectionDir.startsWith(resolvedDbDir)) {
    return res.status(400).json({ error: 'Invalid collection' });
  }

  const filePath = path.resolve(collectionDir, `${id}.json`);
  if (!filePath.startsWith(collectionDir)) {
    return res.status(400).json({ error: 'Invalid document id' });
  }

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'Document not found' });
  }
  const doc = JSON.parse(fs.readFileSync(filePath));
  res.json(doc);
});

// Update a document
app.put('/:collection/:id', (req, res) => {
  const { collection, id } = req.params;
  const resolvedDbDir = path.resolve(dbDir);
  const collectionDir = path.resolve(resolvedDbDir, collection);

  if (!collectionDir.startsWith(resolvedDbDir)) {
    return res.status(400).json({ error: 'Invalid collection' });
  }

  const filePath = path.resolve(collectionDir, `${id}.json`);
  if (!filePath.startsWith(collectionDir)) {
    return res.status(400).json({ error: 'Invalid document id' });
  }

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'Document not found' });
  }
  const doc = JSON.parse(fs.readFileSync(filePath));
  const updatedDoc = { ...doc, ...req.body, updatedAt: new Date().toISOString() };
  fs.writeFileSync(filePath, JSON.stringify(updatedDoc, null, 2));
  res.json(updatedDoc);
});

// Delete a document
app.delete('/:collection/:id', (req, res) => {
  const { collection, id } = req.params;
  const resolvedDbDir = path.resolve(dbDir);
  const collectionDir = path.resolve(resolvedDbDir, collection);

  if (!collectionDir.startsWith(resolvedDbDir)) {
    return res.status(400).json({ error: 'Invalid collection' });
  }

  const filePath = path.resolve(collectionDir, `${id}.json`);
  if (!filePath.startsWith(collectionDir)) {
    return res.status(400).json({ error: 'Invalid document id' });
  }

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'Document not found' });
  }
  fs.unlinkSync(filePath);
  res.status(204).send();
});

// File upload
app.post('/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  const fileUrl = `/uploads/${req.file.filename}`;
  res.json({ url: fileUrl });
});

// WebSocket connection
wss.on('connection', (ws) => {
  console.log('Client connected');

  ws.on('message', (message) => {
    console.log(`Received message: ${message}`);
    wss.clients.forEach((client) => {
      if (client !== ws && client.readyState === WebSocket.OPEN) {
        client.send(message.toString());
      }
    });
  });

  ws.on('close', () => {
    console.log('Client disconnected');
  });
});

server.listen(PORT, HOST, () => {
  console.log(`Server is running on http://${HOST}:${PORT}`);
});
