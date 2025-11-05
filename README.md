# Local Firestore-like Database

This project is a local, file-based database that mimics some of the functionality of Firestore. It provides a simple RESTful API for CRUD operations and also supports file uploads and WebSocket connections for real-time communication.

## Features

- CRUD operations for documents
- File uploads
- WebSocket for real-time communication
- Accessible from other devices on the same network
- Rate limiting (30 requests per minute per IP)

## Getting Started

### Prerequisites

- Node.js and npm installed

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/your-repo-name.git
   ```
2. Install the dependencies:
   ```bash
   npm install
   ```

### Running the Server

To start the server, run the following command:

```bash
npm start
```

The server will be running on `http://0.0.0.0:3000`.

## API Usage

You can use the `api.http` file with a REST client like [Visual Studio Code REST Client](https://marketplace.visualstudio.com/items?itemName=humao.rest-client) to interact with the API.

### Collections and Documents

- **Create a collection:** `POST /create2929/:collection`
- **Read all collections:** `GET /2929collection`
- **Create a document:** `POST /:collection`
- **Read all documents in a collection:** `GET /:collection`
- **Read a single document:** `GET /:collection/:id`
- **Update a document:** `PUT /:collection/:id`
- **Delete a document:** `DELETE /:collection/:id`

### File Uploads

- **Upload a file:** `POST /upload`

When uploading a file, you can also provide an optional `referenceId` field in the multipart form data. The server will automatically generate metadata for the uploaded file, including a unique ID, the file type, a timestamp, and a BlurHash for images. The response will be a JSON object containing this metadata.

### WebSocket

You can connect to the WebSocket server at `ws://<your-ip-address>:3000`. Any message sent to the server will be broadcast to all other connected clients.
