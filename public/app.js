const API_URL = 'http://localhost:3000/api';

let editingBookId = null;
let currentUser = null;

// DOM Elements
const bookForm = document.getElementById('book-form');
const booksList = document.getElementById('books-list');
const formTitle = document.getElementById('form-title');
const cancelBtn = document.getElementById('cancel-btn');
const categoryFilter = document.getElementById('category-filter');
const bookModal = document.getElementById('book-modal');
const closeBookModal = document.getElementById('close-book-modal');
const authModal = document.getElementById('auth-modal');
const closeAuth = document.getElementById('close-auth');
const loginBtn = document.getElementById('login-btn');
const logoutBtn = document.getElementById('logout-btn');
const bookFormContainer = document.getElementById('book-form-container');

// Load books and check auth on page load
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    loadBooks();
});

// Check authentication status
async function checkAuth() {
    try {
        const response = await fetch(`${API_URL}/auth/me`, {
            credentials: 'include'
        });

        if (response.ok) {
            const data = await response.json();
            currentUser = data.user;
            updateUIForUser(currentUser);
        } else {
            currentUser = null;
            updateUIForGuest();
        }
    } catch (error) {
        console.error('Error checking auth:', error);
        currentUser = null;
        updateUIForGuest();
    }
}

// Update UI for logged-in user
function updateUIForUser(user) {
    document.getElementById('user-info').style.display = 'flex';
    document.getElementById('guest-info').style.display = 'none';
    document.getElementById('user-display').innerHTML = `👤 <strong>${user.username}</strong> <span class="role-badge role-${user.role}">${user.role}</span>`;

    // Show book form only for admin
    if (user.role === 'admin') {
        bookFormContainer.style.display = 'block';
    } else {
        bookFormContainer.style.display = 'none';
    }
}

// Update UI for guest
function updateUIForGuest() {
    document.getElementById('user-info').style.display = 'none';
    document.getElementById('guest-info').style.display = 'block';
    bookFormContainer.style.display = 'none';
}

// Auth Modal handlers
loginBtn.addEventListener('click', () => {
    authModal.style.display = 'block';
    document.getElementById('login-form-container').style.display = 'block';
    document.getElementById('register-form-container').style.display = 'none';
});

closeAuth.addEventListener('click', () => {
    authModal.style.display = 'none';
});

document.getElementById('show-register').addEventListener('click', (e) => {
    e.preventDefault();
    document.getElementById('login-form-container').style.display = 'none';
    document.getElementById('register-form-container').style.display = 'block';
});

document.getElementById('show-login').addEventListener('click', (e) => {
    e.preventDefault();
    document.getElementById('register-form-container').style.display = 'none';
    document.getElementById('login-form-container').style.display = 'block';
});

// Login form handler
document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;

    try {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();

        if (response.ok) {
            currentUser = data.user;
            authModal.style.display = 'none';
            updateUIForUser(currentUser);
            loadBooks(categoryFilter.value);
            alert(`Welcome ${currentUser.username}!`);
        } else {
            alert(data.error || 'Login failed');
        }
    } catch (error) {
        console.error('Login error:', error);
        alert('Login failed. Please try again.');
    }
});

// Register form handler
document.getElementById('register-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const username = document.getElementById('register-username').value;
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;

    try {
        const response = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, email, password })
        });

        const data = await response.json();

        if (response.ok) {
            alert('Registration successful! Please login.');
            document.getElementById('register-form-container').style.display = 'none';
            document.getElementById('login-form-container').style.display = 'block';
            document.getElementById('register-form').reset();
        } else {
            alert(data.error || 'Registration failed');
        }
    } catch (error) {
        console.error('Registration error:', error);
        alert('Registration failed. Please try again.');
    }
});

// Logout handler
logoutBtn.addEventListener('click', async () => {
    try {
        await fetch(`${API_URL}/auth/logout`, {
            method: 'POST',
            credentials: 'include'
        });

        currentUser = null;
        updateUIForGuest();
        loadBooks(categoryFilter.value);
        alert('Logged out successfully');
    } catch (error) {
        console.error('Logout error:', error);
    }
});

// Category filter handler
categoryFilter.addEventListener('change', () => {
    loadBooks(categoryFilter.value);
});

// Modal close handlers
closeBookModal.addEventListener('click', () => {
    bookModal.style.display = 'none';
});

window.addEventListener('click', (e) => {
    if (e.target === bookModal) {
        bookModal.style.display = 'none';
    }
    if (e.target === authModal) {
        authModal.style.display = 'none';
    }
});

// Form submit handler
if (bookForm) {
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
            total_copies: parseInt(document.getElementById('total_copies').value),
            available_copies: parseInt(document.getElementById('available_copies').value)
        };

        if (editingBookId) {
            await updateBook(editingBookId, bookData);
        } else {
            await createBook(bookData);
        }

        resetForm();
        loadBooks(categoryFilter.value);
    });
}

// Cancel button handler
if (cancelBtn) {
    cancelBtn.addEventListener('click', resetForm);
}

// Load all books or filter by category
async function loadBooks(category = 'all') {
    try {
        const url = category && category !== 'all' ? `${API_URL}/books?category=${encodeURIComponent(category)}` : `${API_URL}/books`;
        const response = await fetch(url);
        const books = await response.json();

        if (books.length === 0) {
            booksList.innerHTML = '<div class="empty-state">No books found in this category.</div>';
            return;
        }

        booksList.innerHTML = books.map(book => {
            const categoryClass = book.category ? book.category.toLowerCase().replace(/\s+/g, '-') : 'unknown';
            const availabilityPercent = book.total_copies > 0 ? (book.available_copies / book.total_copies * 100) : 0;
            const availabilityClass = availabilityPercent > 50 ? 'high' : availabilityPercent > 0 ? 'medium' : 'low';

            return `
                <div class="book-card">
                    <h3>${book.title}</h3>
                    <span class="book-category category-${categoryClass}">${book.category || 'Uncategorized'}</span>
                    <p><strong>Author:</strong> ${book.author}</p>
                    ${book.description ? `<p class="book-description">${book.description}</p>` : ''}
                    <p><strong>Year:</strong> ${book.published_year}</p>
                    
                    <div class="availability-info">
                        <div class="availability-bar">
                            <div class="availability-fill availability-${availabilityClass}" style="width: ${availabilityPercent}%"></div>
                        </div>
                        <span class="availability-text">
                            <strong>${book.available_copies}/${book.total_copies}</strong> copies available
                        </span>
                    </div>
                    
                    <div class="book-actions">
                        <button class="btn btn-view" onclick="viewBook('${book.id}')">View Details</button>
                        ${currentUser ? `
                            <button class="btn btn-borrow" onclick="borrowBook('${book.id}')" ${book.available_copies <= 0 ? 'disabled' : ''}>
                                📖 Borrow
                            </button>
                            <button class="btn btn-return" onclick="returnBook('${book.id}')" ${book.available_copies >= book.total_copies ? 'disabled' : ''}>
                                ↩️ Return
                            </button>
                        ` : ''}
                        ${currentUser && currentUser.role === 'admin' ? `
                            <button class="btn btn-edit" onclick="editBook('${book.id}')">Edit</button>
                            <button class="btn btn-delete" onclick="deleteBook('${book.id}')">Delete</button>
                        ` : ''}
                    </div>
                </div>
            `;
        }).join('');
    } catch (error) {
        console.error('Error loading books:', error);
        booksList.innerHTML = '<div class="empty-state">Error loading books. Please check if the server is running.</div>';
    }
}

// View book details
async function viewBook(id) {
    try {
        const response = await fetch(`${API_URL}/books/${id}`);
        const book = await response.json();

        const categoryClass = book.category ? book.category.toLowerCase().replace(/\s+/g, '-') : 'unknown';
        const availabilityPercent = book.total_copies > 0 ? (book.available_copies / book.total_copies * 100) : 0;
        const availabilityClass = availabilityPercent > 50 ? 'high' : availabilityPercent > 0 ? 'medium' : 'low';

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
                <span class="detail-label">Availability:</span>
                <div class="availability-info">
                    <div class="availability-bar">
                        <div class="availability-fill availability-${availabilityClass}" style="width: ${availabilityPercent}%"></div>
                    </div>
                    <span class="availability-text">
                        <strong>${book.available_copies}/${book.total_copies}</strong> copies available
                    </span>
                </div>
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

// Borrow book
async function borrowBook(id) {
    if (!currentUser) {
        alert('Please login to borrow books');
        return;
    }

    try {
        const response = await fetch(`${API_URL}/books/${id}/borrow`, {
            method: 'POST',
            credentials: 'include'
        });

        const data = await response.json();

        if (response.ok) {
            alert('✅ Book borrowed successfully! This demonstrates Cassandra handling concurrent writes efficiently.');
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
    if (!currentUser) {
        alert('Please login to return books');
        return;
    }

    try {
        const response = await fetch(`${API_URL}/books/${id}/return`, {
            method: 'POST',
            credentials: 'include'
        });

        const data = await response.json();

        if (response.ok) {
            alert('✅ Book returned successfully! Cassandra efficiently updates the available copies.');
            loadBooks(categoryFilter.value);
        } else {
            alert(data.error || 'Error returning book');
        }
    } catch (error) {
        console.error('Error returning book:', error);
        alert('Error returning book');
    }
}

// Create new book
async function createBook(bookData) {
    try {
        const response = await fetch(`${API_URL}/books`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify(bookData)
        });

        if (response.ok) {
            alert('Book added successfully!');
        } else {
            const data = await response.json();
            alert(data.error || 'Error adding book');
        }
    } catch (error) {
        console.error('Error creating book:', error);
        alert('Error adding book');
    }
}

// Edit book
async function editBook(id) {
    try {
        const response = await fetch(`${API_URL}/books/${id}`);
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
        document.getElementById('available_copies').value = book.available_copies || 0;

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
        const response = await fetch(`${API_URL}/books/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify(bookData)
        });

        if (response.ok) {
            alert('Book updated successfully!');
        } else {
            const data = await response.json();
            alert(data.error || 'Error updating book');
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
        const response = await fetch(`${API_URL}/books/${id}`, {
            method: 'DELETE',
            credentials: 'include'
        });

        if (response.ok) {
            alert('Book deleted successfully!');
            loadBooks(categoryFilter.value);
        } else {
            const data = await response.json();
            alert(data.error || 'Error deleting book');
        }
    } catch (error) {
        console.error('Error deleting book:', error);
        alert('Error deleting book');
    }
}

// Reset form
function resetForm() {
    if (bookForm) {
        bookForm.reset();
    }
    editingBookId = null;
    formTitle.textContent = 'Add New Book';
    if (cancelBtn) {
        cancelBtn.style.display = 'none';
    }
    document.getElementById('book-id').value = '';
}
