# Library Management System - Architecture

## System Architecture

This is a **3-tier web application** using **Apache Cassandra** as the NoSQL database.

```
┌─────────────────────────────────────────────────────────────┐
│                     PRESENTATION LAYER                       │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Browser (HTML5 + CSS3 + Vanilla JavaScript)          │ │
│  │  - User Interface                                      │ │
│  │  - Category Filtering                                  │ │
│  │  - Borrow/Return Actions                               │ │
│  │  - Authentication UI                                   │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                            ↕ HTTP/REST API
┌─────────────────────────────────────────────────────────────┐
│                     APPLICATION LAYER                        │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Node.js + Express.js Server                          │ │
│  │  - RESTful API Endpoints                              │ │
│  │  - Authentication (bcrypt + sessions)                 │ │
│  │  - Business Logic                                     │ │
│  │  - Request Validation                                 │ │
│  │  - Role-based Access Control                          │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                            ↕ CQL (Cassandra Query Language)
┌─────────────────────────────────────────────────────────────┐
│                       DATA LAYER                             │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Apache Cassandra (NoSQL Wide-Column Database)        │ │
│  │  - Distributed Architecture                           │ │
│  │  - High Availability                                  │ │
│  │  - Horizontal Scalability                             │ │
│  │  - Secondary Indexes on Category                      │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

## Database Schema

### Books Table
```cql
CREATE TABLE books (
    id UUID PRIMARY KEY,
    title TEXT,
    author TEXT,
    isbn TEXT,
    published_year INT,
    category TEXT,              -- Indexed for fast filtering
    description TEXT,
    publisher TEXT,
    pages INT,
    language TEXT,
    total_copies INT,
    available_copies INT
);

CREATE INDEX books_category_idx ON books (category);
```

### Users Table
```cql
CREATE TABLE users (
    id UUID PRIMARY KEY,
    username TEXT,
    email TEXT,
    password TEXT,              -- Hashed with bcrypt
    role TEXT,                  -- 'admin' or 'user'
    created_at TIMESTAMP
);

CREATE INDEX users_username_idx ON users (username);
CREATE INDEX users_email_idx ON users (email);
```

## Key Features Demonstrating Cassandra Capabilities

### 1. **Secondary Index on Category**
- Fast filtering by book category (Science Fiction, Horror, Literature, Mystery, Fantasy)
- Query: `SELECT * FROM books WHERE category = ? ALLOW FILTERING`
- Demonstrates Cassandra's indexing capabilities

### 2. **Concurrent Write Operations**
- Borrow/Return operations simulate frequent writes
- Multiple users can borrow/return books simultaneously
- Cassandra handles concurrent writes efficiently with eventual consistency

### 3. **Horizontal Scalability**
- Cassandra's distributed architecture allows adding nodes easily
- No single point of failure
- Data automatically distributed across nodes

### 4. **High Availability**
- Replication factor ensures data redundancy
- System continues operating even if nodes fail
- Tunable consistency levels

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user

### Books Management
- `GET /api/books` - Get all books
- `GET /api/books?category=<category>` - Filter by category (uses secondary index)
- `GET /api/books/:id` - Get book details
- `POST /api/books` - Create book (admin only)
- `PUT /api/books/:id` - Update book (admin only)
- `DELETE /api/books/:id` - Delete book (admin only)

### Borrow/Return Operations
- `POST /api/books/:id/borrow` - Borrow book (authenticated users)
- `POST /api/books/:id/return` - Return book (authenticated users)

## Technology Stack

### Frontend
- **HTML5** - Structure
- **CSS3** - Styling with gradients and animations
- **Vanilla JavaScript** - Client-side logic
- **Fetch API** - HTTP requests

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **cassandra-driver** - Cassandra client
- **bcryptjs** - Password hashing
- **express-session** - Session management
- **cors** - Cross-origin resource sharing

### Database
- **Apache Cassandra** - NoSQL wide-column store
- **Docker** - Containerized deployment

## Why Cassandra?

1. **Write-Optimized**: Perfect for frequent borrow/return operations
2. **Scalability**: Can handle millions of books and users
3. **High Availability**: No downtime even during node failures
4. **Flexible Schema**: Easy to add new fields without migrations
5. **Distributed**: Data automatically distributed across multiple nodes
6. **Fast Reads with Indexes**: Secondary indexes enable fast category filtering

## Demo Highlights

1. **Category Filtering**: Show how secondary index enables fast filtering
2. **Borrow/Return**: Demonstrate concurrent write operations
3. **User Roles**: Admin can manage books, users can only borrow/return
4. **Real-time Updates**: Changes reflect immediately across the system
5. **Scalability**: Explain how Cassandra can scale horizontally

## Default Credentials

- **Admin Account**
  - Username: `admin`
  - Password: `admin123`
  - Can: Add, Edit, Delete books + Borrow/Return

- **Regular Users**
  - Register new accounts
  - Can: View books + Borrow/Return

## Sample Data

The system comes pre-loaded with **50 books** across 5 categories:
- 10 Science Fiction books
- 10 Horror books
- 10 Literature books
- 10 Mystery books
- 10 Fantasy books

Each book includes:
- Title, Author, ISBN
- Category, Description
- Publisher, Pages, Language
- Total copies and available copies
