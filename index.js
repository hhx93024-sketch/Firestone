
const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const rateLimit = require('express-rate-limit');

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

const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30, // max 30 requests per minute
});

app.use('/:collection', limiter);
app.use('/:collection/:id', limiter);


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

const getDocPath = (collectionDir, id) => {
    const subDir1 = id.substring(0, 2);
    const subDir2 = id.substring(2, 4);
    const docPath = path.join(collectionDir, subDir1, subDir2, `${id}.json`);
    const resolvedCollectionDir = path.resolve(collectionDir);
    const resolvedDocPath = path.resolve(docPath);
    if (!resolvedDocPath.startsWith(resolvedCollectionDir)) {
        throw new Error('Invalid document id');
    }
    return docPath;
};

const getAllFiles = (dirPath, arrayOfFiles) => {
    const files = fs.readdirSync(dirPath);
    arrayOfFiles = arrayOfFiles || [];
    files.forEach(function (file) {
        if (fs.statSync(path.join(dirPath, file)).isDirectory()) {
            arrayOfFiles = getAllFiles(path.join(dirPath, file), arrayOfFiles);
        } else {
            arrayOfFiles.push(path.join(dirPath, file));
        }
    });
    return arrayOfFiles;
};

// Create a document
app.post('/:collection', (req, res) => {
    try {
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
        const filePath = getDocPath(collectionDir, id);
        const dir = path.dirname(filePath);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        fs.writeFileSync(filePath, JSON.stringify(doc, null, 2));
        res.status(201).json(doc);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
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
    const files = getAllFiles(collectionDir);
    const docs = files.map((file) => {
        return JSON.parse(fs.readFileSync(file));
    });
    res.json(docs);
});

// Read a single document
app.get('/:collection/:id', (req, res) => {
    try {
        const { collection, id } = req.params;
        const resolvedDbDir = path.resolve(dbDir);
        const collectionDir = path.resolve(resolvedDbDir, collection);

        if (!collectionDir.startsWith(resolvedDbDir)) {
            return res.status(400).json({ error: 'Invalid collection' });
        }

        const filePath = getDocPath(collectionDir, id);

        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ error: 'Document not found' });
        }
        const doc = JSON.parse(fs.readFileSync(filePath));
        res.json(doc);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Update a document
app.put('/:collection/:id', (req, res) => {
    try {
        const { collection, id } = req.params;
        const resolvedDbDir = path.resolve(dbDir);
        const collectionDir = path.resolve(resolvedDbDir, collection);

        if (!collectionDir.startsWith(resolvedDbDir)) {
            return res.status(400).json({ error: 'Invalid collection' });
        }

        const filePath = getDocPath(collectionDir, id);

        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ error: 'Document not found' });
        }
        const doc = JSON.parse(fs.readFileSync(filePath));
        const updatedDoc = { ...doc, ...req.body, updatedAt: new Date().toISOString() };
        fs.writeFileSync(filePath, JSON.stringify(updatedDoc, null, 2));
        res.json(updatedDoc);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Delete a document
app.delete('/:collection/:id', (req, res) => {
    try {
        const { collection, id } = req.params;
        const resolvedDbDir = path.resolve(dbDir);
        const collectionDir = path.resolve(resolvedDbDir, collection);

        if (!collectionDir.startsWith(resolvedDbDir)) {
            return res.status(400).json({ error: 'Invalid collection' });
        }

        const filePath = getDocPath(collectionDir, id);

        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ error: 'Document not found' });
        }
        fs.unlinkSync(filePath);
        res.status(204).send();
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Create a collection
app.post('/create2929/:collection', (req, res) => {
    try {
        const { collection } = req.params;
        const resolvedDbDir = path.resolve(dbDir);
        const collectionDir = path.resolve(resolvedDbDir, collection);

        if (!collectionDir.startsWith(resolvedDbDir)) {
            return res.status(400).json({ error: 'Invalid collection' });
        }

        if (fs.existsSync(collectionDir)) {
            return res.status(409).json({ error: 'Collection already exists' });
        }

        fs.mkdirSync(collectionDir, { recursive: true });
        res.status(201).json({ message: `Collection '${collection}' created successfully` });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Get all collections
app.get('/2929collection', (req, res) => {
    try {
        const collections = fs.readdirSync(dbDir, { withFileTypes: true })
            .filter(dirent => dirent.isDirectory())
            .map(dirent => dirent.name);
        res.json(collections);
    } catch (error) {
        res.status(500).json({ error: 'Failed to retrieve collections' });
    }
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
