# Library Management System - Features

## 📚 Complete Feature List

### Book Categories (5 Categories)
- **Science Fiction** - 10 books (Dune, Foundation, Neuromancer, etc.)
- **Horror** - 10 books (The Shining, Dracula, Frankenstein, etc.)
- **Literature** - 10 books (To Kill a Mockingbird, 1984, Pride and Prejudice, etc.)
- **Mystery** - 10 books (Murder on the Orient Express, Gone Girl, The Da Vinci Code, etc.)
- **Fantasy** - 10 books (Harry Potter, The Hobbit, Game of Thrones, etc.)

**Total: 50 pre-loaded books!**

### Core Features

#### 1. Book Management (CRUD)
- ✅ **Create** - Add new books with detailed information
- ✅ **Read** - View all books or filter by category
- ✅ **Update** - Edit book details
- ✅ **Delete** - Remove books from the library

#### 2. Copy Management
- ✅ **Total Copies** - Track total number of copies for each book
- ✅ **Available Copies** - Real-time tracking of available copies
- ✅ **Borrow Book** - Decrease available copies when borrowed
- ✅ **Return Book** - Increase available copies when returned
- ✅ **Visual Indicators** - Shows "X / Y available" on each book card

#### 3. Book Information
Each book includes:
- Title
- Author
- ISBN
- Category (with color-coded badges)
- Description
- Publisher
- Number of Pages
- Language
- Published Year
- Total Copies
- Available Copies

#### 4. User Interface
- ✅ **Category Filter** - Dropdown to filter books by category
- ✅ **View Details Modal** - Click to see complete book information
- ✅ **Borrow Button** - Appears when copies are available
- ✅ **Return Button** - Appears when copies are borrowed
- ✅ **Color-Coded Categories** - Each category has a unique color
- ✅ **Responsive Design** - Works on all screen sizes
- ✅ **Modern UI** - Gradient background, card layout, smooth animations

#### 5. Database Features
- ✅ **Cassandra Database** - NoSQL database for scalability
- ✅ **Category Index** - Fast filtering by category
- ✅ **Auto-Population** - 50 sample books loaded on first run
- ✅ **UUID Primary Keys** - Unique identifiers for each book

## 🎯 How to Use

### Borrowing a Book
1. Browse books or filter by category
2. Find a book with available copies
3. Click the **"Borrow"** button
4. Confirm the action
5. Available copies decrease by 1

### Returning a Book
1. Find a book that has borrowed copies
2. Click the **"Return"** button
3. Confirm the action
4. Available copies increase by 1

### Adding a New Book
1. Fill in the form at the top
2. Set the number of total copies
3. Click **"Save Book"**
4. Book appears in the collection

### Viewing Book Details
1. Click **"View Details"** on any book card
2. See complete information in a modal popup
3. Close by clicking the X or outside the modal

## 📊 Sample Data

The system comes pre-loaded with 50 classic and popular books:
- Each category has exactly 10 books
- Copy counts range from 3-12 per book
- All books include descriptions, publishers, and page counts
- Books span from 1813 (Pride and Prejudice) to 2015 (The Fifth Season)

## 🔧 Technical Details

**Backend API Endpoints:**
- `GET /api/books` - Get all books
- `GET /api/books?category=X` - Filter by category
- `GET /api/books/:id` - Get single book
- `POST /api/books` - Create new book
- `PUT /api/books/:id` - Update book
- `DELETE /api/books/:id` - Delete book
- `POST /api/books/:id/borrow` - Borrow a copy
- `POST /api/books/:id/return` - Return a copy

**Database Schema:**
```
books {
  id UUID PRIMARY KEY,
  title TEXT,
  author TEXT,
  isbn TEXT,
  published_year INT,
  category TEXT,
  description TEXT,
  publisher TEXT,
  pages INT,
  language TEXT,
  total_copies INT,
  available_copies INT
}
```

## 🚀 Access

Open your browser and go to: **http://localhost:3000**

Enjoy your fully-featured library management system!
