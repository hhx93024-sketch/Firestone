# Local Firestore-like Database

This project is a local, file-based database that mimics some of the functionality of Firestore. It provides a simple RESTful API for CRUD operations and also supports file uploads and WebSocket connections for real-time communication.

## Features

- CRUD operations for documents
- File uploads
- WebSocket for real-time communication with automatic updates on document changes
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

You can connect to the WebSocket server at `ws://<your-ip-address>:3000`.

To easily test the real-time functionality, a client test page is available. With the server running, open your web browser and navigate to `http://localhost:3000`. Open the developer console to see the log of incoming WebSocket messages.

#### Real-Time Document Events

The server supports two modes of real-time communication:

1.  **Event Broadcasting (Server to Client):** The server will automatically send a message to all connected clients whenever a document is created, updated, or deleted via the REST API.
2.  **Real-Time Collaboration (Client to Server to Clients):** For collaborative applications like a custom sheet, clients can send partial updates (patches) over the WebSocket. The server will apply the patch to the document and then broadcast that same patch to all other connected clients.

##### Real-Time Collaboration

To update a document in real-time, a client should send a WebSocket message with the following format:

```json
{
  "event": "update-document",
  "data": {
    "collection": "your-collection-name",
    "id": "your-document-id",
    "patch": {
      "keyToUpdate": "newValue"
    }
  }
}
```

The server will apply the `patch` to the specified document and then broadcast the original message to all other clients so they can update their state.

##### Event Broadcasting

When a document is created, the message will have the following format:

```json
{
  "event": "document-created",
  "data": {
    "id": "...",
    "createdAt": "...",
    "updatedAt": "...",
    ...
  }
}
```

When a document is deleted, the message will have the following format:

```json
{
  "event": "document-deleted",
  "data": {
    "id": "..."
  }
}
```

When a document is updated, the message will have the following format:

```json
{
  "event": "document-updated",
  "data": {
    "id": "...",
    "createdAt": "...",
    "updatedAt": "...",
    ...
  }
}
```
