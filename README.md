# Library Management System with Cassandra

A simple library management system with CRUD operations using Cassandra database.

## Features

- ✅ Create new books
- ✅ Read/View all books
- ✅ Update book details
- ✅ Delete books
- ✅ Track book availability

## Tech Stack

**Backend:**
- Node.js
- Express.js
- Cassandra (cassandra-driver)

**Frontend:**
- HTML5
- CSS3
- Vanilla JavaScript

## Prerequisites

1. **Apache Cassandra** - Install and run Cassandra locally
   - Download from: https://cassandra.apache.org/download/
   - Or use Docker: `docker run -p 9042:9042 cassandra:latest`

2. **Node.js** - Version 14 or higher
   - Download from: https://nodejs.org/

## Installation

1. Install dependencies:
```bash
npm install
```

2. Make sure Cassandra is running on localhost:9042

3. Start the server:
```bash
npm start
```

For development with auto-reload:
```bash
npm run dev
```

4. Open your browser and navigate to:
```
http://localhost:3000
```

## Database Schema

**Keyspace:** library

**Table:** books
- id (UUID, PRIMARY KEY)
- title (TEXT)
- author (TEXT)
- isbn (TEXT)
- published_year (INT)
- available (BOOLEAN)

## API Endpoints

- `GET /api/books` - Get all books
- `GET /api/books/:id` - Get book by ID
- `POST /api/books` - Create new book
- `PUT /api/books/:id` - Update book
- `DELETE /api/books/:id` - Delete book

## Usage

1. **Add a Book:** Fill in the form and click "Save Book"
2. **Edit a Book:** Click "Edit" on any book card
3. **Delete a Book:** Click "Delete" on any book card
4. **View Books:** All books are displayed in a grid layout

## Notes

- The database and table are created automatically on first run
- Make sure Cassandra is running before starting the server
- Default Cassandra connection: localhost:9042, datacenter1
