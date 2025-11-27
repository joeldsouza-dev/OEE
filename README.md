# Library Management System with Cassandra

A simple library management system with CRUD operations using Cassandra database.

## Features

- ✅ Create new books with detailed information
- ✅ Read/View all books with full details
- ✅ Update book details
- ✅ Delete books
- ✅ Track book availability
- ✅ **5 Book Categories:** Science Fiction, Horror, Literature, Mystery, Fantasy
- ✅ **Filter by Category:** View books by specific category
- ✅ **Detailed Book View:** Modal popup with complete book information
- ✅ **Rich Book Data:** Title, Author, ISBN, Category, Description, Publisher, Pages, Language, Year

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
- category (TEXT) - Science Fiction, Horror, Literature, Mystery, Fantasy
- description (TEXT)
- publisher (TEXT)
- pages (INT)
- language (TEXT)
- available (BOOLEAN)

**Indexes:**
- books_category_idx - For efficient category filtering

## API Endpoints

- `GET /api/books` - Get all books
- `GET /api/books?category=<category>` - Get books by category
- `GET /api/books/:id` - Get book by ID
- `GET /api/categories` - Get all available categories
- `POST /api/books` - Create new book
- `PUT /api/books/:id` - Update book
- `DELETE /api/books/:id` - Delete book

## Usage

1. **Add a Book:** Fill in the form with book details including category, description, publisher, etc., and click "Save Book"
2. **View Book Details:** Click "View Details" on any book card to see complete information in a modal
3. **Filter by Category:** Use the dropdown to filter books by Science Fiction, Horror, Literature, Mystery, or Fantasy
4. **Edit a Book:** Click "Edit" on any book card to modify its details
5. **Delete a Book:** Click "Delete" on any book card to remove it from the library
6. **View All Books:** All books are displayed in a responsive grid layout with color-coded categories

## Notes

- The database and table are created automatically on first run
- Make sure Cassandra is running before starting the server
- Default Cassandra connection: localhost:9042, datacenter
