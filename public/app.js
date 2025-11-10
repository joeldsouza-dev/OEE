const API_URL = 'http://localhost:3000/api/books';

let editingBookId = null;

// DOM Elements
const bookForm = document.getElementById('book-form');
const booksList = document.getElementById('books-list');
const formTitle = document.getElementById('form-title');
const cancelBtn = document.getElementById('cancel-btn');

// Load books on page load
document.addEventListener('DOMContentLoaded', loadBooks);

// Form submit handler
bookForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const bookData = {
        title: document.getElementById('title').value,
        author: document.getElementById('author').value,
        isbn: document.getElementById('isbn').value,
        published_year: parseInt(document.getElementById('published_year').value),
        available: document.getElementById('available').checked
    };
    
    if (editingBookId) {
        await updateBook(editingBookId, bookData);
    } else {
        await createBook(bookData);
    }
    
    resetForm();
    loadBooks();
});

// Cancel button handler
cancelBtn.addEventListener('click', resetForm);

// Load all books
async function loadBooks() {
    try {
        const response = await fetch(API_URL);
        const books = await response.json();
        
        if (books.length === 0) {
            booksList.innerHTML = '<div class="empty-state">No books in the library yet. Add your first book!</div>';
            return;
        }
        
        booksList.innerHTML = books.map(book => `
            <div class="book-card">
                <h3>${book.title}</h3>
                <p><strong>Author:</strong> ${book.author}</p>
                <p><strong>ISBN:</strong> ${book.isbn}</p>
                <p><strong>Year:</strong> ${book.published_year}</p>
                <span class="book-status ${book.available ? 'status-available' : 'status-unavailable'}">
                    ${book.available ? '✓ Available' : '✗ Not Available'}
                </span>
                <div class="book-actions">
                    <button class="btn btn-edit" onclick="editBook('${book.id}')">Edit</button>
                    <button class="btn btn-delete" onclick="deleteBook('${book.id}')">Delete</button>
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading books:', error);
        booksList.innerHTML = '<div class="empty-state">Error loading books. Please check if the server is running.</div>';
    }
}

// Create new book
async function createBook(bookData) {
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(bookData)
        });
        
        if (response.ok) {
            alert('Book added successfully!');
        } else {
            alert('Error adding book');
        }
    } catch (error) {
        console.error('Error creating book:', error);
        alert('Error adding book');
    }
}

// Edit book
async function editBook(id) {
    try {
        const response = await fetch(`${API_URL}/${id}`);
        const book = await response.json();
        
        document.getElementById('book-id').value = id;
        document.getElementById('title').value = book.title;
        document.getElementById('author').value = book.author;
        document.getElementById('isbn').value = book.isbn;
        document.getElementById('published_year').value = book.published_year;
        document.getElementById('available').checked = book.available;
        
        editingBookId = id;
        formTitle.textContent = 'Edit Book';
        cancelBtn.style.display = 'inline-block';
        
        window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
        console.error('Error loading book:', error);
        alert('Error loading book details');
    }
}

// Update book
async function updateBook(id, bookData) {
    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(bookData)
        });
        
        if (response.ok) {
            alert('Book updated successfully!');
        } else {
            alert('Error updating book');
        }
    } catch (error) {
        console.error('Error updating book:', error);
        alert('Error updating book');
    }
}

// Delete book
async function deleteBook(id) {
    if (!confirm('Are you sure you want to delete this book?')) {
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            alert('Book deleted successfully!');
            loadBooks();
        } else {
            alert('Error deleting book');
        }
    } catch (error) {
        console.error('Error deleting book:', error);
        alert('Error deleting book');
    }
}

// Reset form
function resetForm() {
    bookForm.reset();
    editingBookId = null;
    formTitle.textContent = 'Add New Book';
    cancelBtn.style.display = 'none';
    document.getElementById('book-id').value = '';
}
