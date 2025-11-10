const API_URL = 'http://localhost:3000/api/books';

let editingBookId = null;

// DOM Elements
const bookForm = document.getElementById('book-form');
const booksList = document.getElementById('books-list');
const formTitle = document.getElementById('form-title');
const cancelBtn = document.getElementById('cancel-btn');
const categoryFilter = document.getElementById('category-filter');
const bookModal = document.getElementById('book-modal');
const closeModal = document.querySelector('.close');

// Load books on page load
document.addEventListener('DOMContentLoaded', loadBooks);

// Category filter handler
categoryFilter.addEventListener('change', () => {
    loadBooks(categoryFilter.value);
});

// Modal close handlers
closeModal.addEventListener('click', () => {
    bookModal.style.display = 'none';
});

window.addEventListener('click', (e) => {
    if (e.target === bookModal) {
        bookModal.style.display = 'none';
    }
});

// Form submit handler
bookForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const bookData = {
        title: document.getElementById('title').value,
        author: document.getElementById('author').value,
        isbn: document.getElementById('isbn').value,
        published_year: parseInt(document.getElementById('published_year').value),
        category: document.getElementById('category').value,
        description: document.getElementById('description').value,
        publisher: document.getElementById('publisher').value,
        pages: parseInt(document.getElementById('pages').value) || 0,
        language: document.getElementById('language').value,
        total_copies: parseInt(document.getElementById('total_copies').value) || 1,
        available_copies: parseInt(document.getElementById('available_copies').value) || 1
    };
    
    if (editingBookId) {
        await updateBook(editingBookId, bookData);
    } else {
        await createBook(bookData);
    }
    
    resetForm();
    loadBooks(categoryFilter.value);
});

// Cancel button handler
cancelBtn.addEventListener('click', resetForm);

// Load all books or filter by category
async function loadBooks(category = 'all') {
    try {
        const url = category && category !== 'all' ? `${API_URL}?category=${encodeURIComponent(category)}` : API_URL;
        const response = await fetch(url);
        const books = await response.json();
        
        if (books.length === 0) {
            booksList.innerHTML = '<div class="empty-state">No books found in this category. Add your first book!</div>';
            return;
        }
        
        booksList.innerHTML = books.map(book => {
            const categoryClass = book.category ? book.category.toLowerCase().replace(/\s+/g, '-') : 'unknown';
            const isAvailable = book.available_copies > 0;
            return `
                <div class="book-card">
                    <h3>${book.title}</h3>
                    <span class="book-category category-${categoryClass}">${book.category || 'Uncategorized'}</span>
                    <p><strong>Author:</strong> ${book.author}</p>
                    ${book.description ? `<p class="book-description">${book.description}</p>` : ''}
                    <p><strong>Year:</strong> ${book.published_year}</p>
                    <p><strong>Copies:</strong> ${book.available_copies} / ${book.total_copies} available</p>
                    <span class="book-status ${isAvailable ? 'status-available' : 'status-unavailable'}">
                        ${isAvailable ? '✓ Available' : '✗ All Borrowed'}
                    </span>
                    <div class="book-actions">
                        <button class="btn btn-view" onclick="viewBook('${book.id}')">View Details</button>
                        ${isAvailable ? `<button class="btn btn-borrow" onclick="borrowBook('${book.id}')">Borrow</button>` : ''}
                        ${book.available_copies < book.total_copies ? `<button class="btn btn-return" onclick="returnBook('${book.id}')">Return</button>` : ''}
                        <button class="btn btn-edit" onclick="editBook('${book.id}')">Edit</button>
                        <button class="btn btn-delete" onclick="deleteBook('${book.id}')">Delete</button>
                    </div>
                </div>
            `;
        }).join('');
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

// View book details
async function viewBook(id) {
    try {
        const response = await fetch(`${API_URL}/${id}`);
        const book = await response.json();
        
        const categoryClass = book.category ? book.category.toLowerCase().replace(/\s+/g, '-') : 'unknown';
        
        document.getElementById('book-details').innerHTML = `
            <h2>${book.title}</h2>
            <span class="book-category category-${categoryClass}">${book.category || 'Uncategorized'}</span>
            
            <div class="detail-row">
                <span class="detail-label">Author:</span>
                <span class="detail-value">${book.author}</span>
            </div>
            
            <div class="detail-row">
                <span class="detail-label">ISBN:</span>
                <span class="detail-value">${book.isbn}</span>
            </div>
            
            <div class="detail-row">
                <span class="detail-label">Published Year:</span>
                <span class="detail-value">${book.published_year}</span>
            </div>
            
            ${book.publisher ? `
            <div class="detail-row">
                <span class="detail-label">Publisher:</span>
                <span class="detail-value">${book.publisher}</span>
            </div>
            ` : ''}
            
            ${book.pages ? `
            <div class="detail-row">
                <span class="detail-label">Pages:</span>
                <span class="detail-value">${book.pages}</span>
            </div>
            ` : ''}
            
            ${book.language ? `
            <div class="detail-row">
                <span class="detail-label">Language:</span>
                <span class="detail-value">${book.language}</span>
            </div>
            ` : ''}
            
            <div class="detail-row">
                <span class="detail-label">Total Copies:</span>
                <span class="detail-value">${book.total_copies}</span>
            </div>
            
            <div class="detail-row">
                <span class="detail-label">Available Copies:</span>
                <span class="detail-value">${book.available_copies}</span>
            </div>
            
            <div class="detail-row">
                <span class="detail-label">Status:</span>
                <span class="book-status ${book.available_copies > 0 ? 'status-available' : 'status-unavailable'}">
                    ${book.available_copies > 0 ? '✓ Available for Borrowing' : '✗ All Copies Borrowed'}
                </span>
            </div>
            
            ${book.description ? `
            <div class="detail-description">
                <strong>Description:</strong><br>
                ${book.description}
            </div>
            ` : ''}
        `;
        
        bookModal.style.display = 'block';
    } catch (error) {
        console.error('Error loading book:', error);
        alert('Error loading book details');
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
        document.getElementById('category').value = book.category || '';
        document.getElementById('description').value = book.description || '';
        document.getElementById('publisher').value = book.publisher || '';
        document.getElementById('pages').value = book.pages || '';
        document.getElementById('language').value = book.language || 'English';
        document.getElementById('total_copies').value = book.total_copies || 1;
        document.getElementById('available_copies').value = book.available_copies || 1;
        
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

// Borrow book
async function borrowBook(id) {
    if (!confirm('Do you want to borrow this book?')) {
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/${id}/borrow`, {
            method: 'POST'
        });
        
        const data = await response.json();
        
        if (response.ok) {
            alert(`Book borrowed successfully! ${data.available_copies} copies remaining.`);
            loadBooks(categoryFilter.value);
        } else {
            alert(data.error || 'Error borrowing book');
        }
    } catch (error) {
        console.error('Error borrowing book:', error);
        alert('Error borrowing book');
    }
}

// Return book
async function returnBook(id) {
    if (!confirm('Are you returning this book?')) {
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/${id}/return`, {
            method: 'POST'
        });
        
        const data = await response.json();
        
        if (response.ok) {
            alert(`Book returned successfully! ${data.available_copies} copies now available.`);
            loadBooks(categoryFilter.value);
        } else {
            alert(data.error || 'Error returning book');
        }
    } catch (error) {
        console.error('Error returning book:', error);
        alert('Error returning book');
    }
}

// Reset form
function resetForm() {
    bookForm.reset();
    editingBookId = null;
    formTitle.textContent = 'Add New Book';
    cancelBtn.style.display = 'none';
    document.getElementById('book-id').value = '';
    document.getElementById('total_copies').value = 1;
    document.getElementById('available_copies').value = 1;
}
