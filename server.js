const express = require('express');
const cassandra = require('cassandra-driver');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const bcrypt = require('bcryptjs');
const session = require('express-session');

const app = express();
const PORT = 3000;

// Session configuration
app.use(session({
  secret: 'library-management-secret-key-change-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: { 
    secure: false, // Set to true if using HTTPS
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Middleware
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
app.use(bodyParser.json());
app.use(express.static('public'));

// Cassandra client setup (without keyspace initially)
const client = new cassandra.Client({
  contactPoints: ['127.0.0.1'],
  localDataCenter: 'datacenter1'
});

// Sample books data
const sampleBooks = [
  // Science Fiction (10 books)
  { title: 'Dune', author: 'Frank Herbert', isbn: '978-0441172719', year: 1965, category: 'Science Fiction', description: 'A stunning blend of adventure and mysticism, environmentalism and politics.', publisher: 'Ace', pages: 688, copies: 5 },
  { title: 'Foundation', author: 'Isaac Asimov', isbn: '978-0553293357', year: 1951, category: 'Science Fiction', description: 'The story of a group of scientists who seek to preserve knowledge as civilization collapses.', publisher: 'Spectra', pages: 255, copies: 4 },
  { title: 'Neuromancer', author: 'William Gibson', isbn: '978-0441569595', year: 1984, category: 'Science Fiction', description: 'The book that defined the cyberpunk movement.', publisher: 'Ace', pages: 271, copies: 3 },
  { title: 'The Left Hand of Darkness', author: 'Ursula K. Le Guin', isbn: '978-0441478125', year: 1969, category: 'Science Fiction', description: 'A groundbreaking work of science fiction exploring gender and society.', publisher: 'Ace', pages: 304, copies: 6 },
  { title: 'Ender\'s Game', author: 'Orson Scott Card', isbn: '978-0812550702', year: 1985, category: 'Science Fiction', description: 'A young boy is trained to fight in an interstellar war.', publisher: 'Tor Books', pages: 324, copies: 7 },
  { title: 'The Martian', author: 'Andy Weir', isbn: '978-0553418026', year: 2011, category: 'Science Fiction', description: 'An astronaut becomes stranded on Mars and must survive.', publisher: 'Crown', pages: 369, copies: 8 },
  { title: 'Snow Crash', author: 'Neal Stephenson', isbn: '978-0553380958', year: 1992, category: 'Science Fiction', description: 'A pizza delivery driver and hacker in a dystopian future.', publisher: 'Bantam', pages: 440, copies: 4 },
  { title: 'Hyperion', author: 'Dan Simmons', isbn: '978-0553283686', year: 1989, category: 'Science Fiction', description: 'Seven pilgrims journey to the Time Tombs on Hyperion.', publisher: 'Spectra', pages: 482, copies: 5 },
  { title: 'The Three-Body Problem', author: 'Liu Cixin', isbn: '978-0765382030', year: 2008, category: 'Science Fiction', description: 'China\'s first contact with an alien civilization.', publisher: 'Tor Books', pages: 400, copies: 6 },
  { title: 'Brave New World', author: 'Aldous Huxley', isbn: '978-0060850524', year: 1932, category: 'Science Fiction', description: 'A dystopian vision of a future society.', publisher: 'Harper Perennial', pages: 268, copies: 5 },

  // Horror (10 books)
  { title: 'The Shining', author: 'Stephen King', isbn: '978-0307743657', year: 1977, category: 'Horror', description: 'A family\'s winter caretaking job at a haunted hotel turns deadly.', publisher: 'Doubleday', pages: 447, copies: 6 },
  { title: 'Dracula', author: 'Bram Stoker', isbn: '978-0486411095', year: 1897, category: 'Horror', description: 'The classic vampire tale that started it all.', publisher: 'Archibald Constable', pages: 418, copies: 5 },
  { title: 'Frankenstein', author: 'Mary Shelley', isbn: '978-0486282114', year: 1818, category: 'Horror', description: 'The story of a scientist who creates a monster.', publisher: 'Lackington', pages: 280, copies: 7 },
  { title: 'It', author: 'Stephen King', isbn: '978-1501142970', year: 1986, category: 'Horror', description: 'A group of friends face their childhood fears embodied in a terrifying entity.', publisher: 'Viking', pages: 1138, copies: 4 },
  { title: 'The Exorcist', author: 'William Peter Blatty', isbn: '978-0061007224', year: 1971, category: 'Horror', description: 'A young girl becomes possessed by a demonic entity.', publisher: 'Harper & Row', pages: 385, copies: 5 },
  { title: 'The Haunting of Hill House', author: 'Shirley Jackson', isbn: '978-0143039983', year: 1959, category: 'Horror', description: 'Four seekers arrive at a notoriously haunted house.', publisher: 'Viking', pages: 246, copies: 6 },
  { title: 'Pet Sematary', author: 'Stephen King', isbn: '978-0743412285', year: 1983, category: 'Horror', description: 'A burial ground with the power to raise the dead.', publisher: 'Doubleday', pages: 374, copies: 5 },
  { title: 'The Silence of the Lambs', author: 'Thomas Harris', isbn: '978-0312924584', year: 1988, category: 'Horror', description: 'An FBI trainee seeks help from an imprisoned cannibal.', publisher: 'St. Martin\'s Press', pages: 338, copies: 7 },
  { title: 'American Psycho', author: 'Bret Easton Ellis', isbn: '978-0679735779', year: 1991, category: 'Horror', description: 'A wealthy New York investment banker hides his psychopathic ego.', publisher: 'Vintage', pages: 399, copies: 3 },
  { title: 'The Call of Cthulhu', author: 'H.P. Lovecraft', isbn: '978-1542461689', year: 1928, category: 'Horror', description: 'The discovery of ancient cosmic horrors.', publisher: 'Weird Tales', pages: 43, copies: 8 },

  // Literature (10 books)
  { title: 'To Kill a Mockingbird', author: 'Harper Lee', isbn: '978-0061120084', year: 1960, category: 'Literature', description: 'A gripping tale of racial injustice and childhood innocence.', publisher: 'J.B. Lippincott', pages: 324, copies: 10 },
  { title: '1984', author: 'George Orwell', isbn: '978-0451524935', year: 1949, category: 'Literature', description: 'A dystopian social science fiction novel.', publisher: 'Secker & Warburg', pages: 328, copies: 9 },
  { title: 'Pride and Prejudice', author: 'Jane Austen', isbn: '978-0141439518', year: 1813, category: 'Literature', description: 'A romantic novel of manners.', publisher: 'T. Egerton', pages: 432, copies: 7 },
  { title: 'The Great Gatsby', author: 'F. Scott Fitzgerald', isbn: '978-0743273565', year: 1925, category: 'Literature', description: 'A portrait of the Jazz Age in all its decadence.', publisher: 'Scribner', pages: 180, copies: 8 },
  { title: 'One Hundred Years of Solitude', author: 'Gabriel García Márquez', isbn: '978-0060883287', year: 1967, category: 'Literature', description: 'The multi-generational story of the Buendía family.', publisher: 'Harper & Row', pages: 417, copies: 6 },
  { title: 'The Catcher in the Rye', author: 'J.D. Salinger', isbn: '978-0316769174', year: 1951, category: 'Literature', description: 'A story of teenage rebellion and alienation.', publisher: 'Little, Brown', pages: 277, copies: 7 },
  { title: 'Moby-Dick', author: 'Herman Melville', isbn: '978-0142437247', year: 1851, category: 'Literature', description: 'The quest of Captain Ahab to seek revenge on a white whale.', publisher: 'Harper & Brothers', pages: 585, copies: 5 },
  { title: 'War and Peace', author: 'Leo Tolstoy', isbn: '978-0199232765', year: 1869, category: 'Literature', description: 'An epic tale of Russian society during the Napoleonic era.', publisher: 'The Russian Messenger', pages: 1225, copies: 4 },
  { title: 'The Lord of the Rings', author: 'J.R.R. Tolkien', isbn: '978-0544003415', year: 1954, category: 'Literature', description: 'An epic high-fantasy novel.', publisher: 'Allen & Unwin', pages: 1178, copies: 9 },
  { title: 'Crime and Punishment', author: 'Fyodor Dostoevsky', isbn: '978-0486415871', year: 1866, category: 'Literature', description: 'A psychological thriller about guilt and redemption.', publisher: 'The Russian Messenger', pages: 671, copies: 6 },

  // Mystery (10 books)
  { title: 'The Hound of the Baskervilles', author: 'Arthur Conan Doyle', isbn: '978-0486282145', year: 1902, category: 'Mystery', description: 'Sherlock Holmes investigates a supernatural hound.', publisher: 'George Newnes', pages: 256, copies: 7 },
  { title: 'Murder on the Orient Express', author: 'Agatha Christie', isbn: '978-0062693662', year: 1934, category: 'Mystery', description: 'Hercule Poirot investigates a murder on a train.', publisher: 'Collins Crime Club', pages: 256, copies: 8 },
  { title: 'The Girl with the Dragon Tattoo', author: 'Stieg Larsson', isbn: '978-0307454546', year: 2005, category: 'Mystery', description: 'A journalist and hacker investigate a disappearance.', publisher: 'Norstedts', pages: 465, copies: 6 },
  { title: 'Gone Girl', author: 'Gillian Flynn', isbn: '978-0307588371', year: 2012, category: 'Mystery', description: 'A woman disappears on her fifth wedding anniversary.', publisher: 'Crown', pages: 415, copies: 9 },
  { title: 'The Da Vinci Code', author: 'Dan Brown', isbn: '978-0307474278', year: 2003, category: 'Mystery', description: 'A symbologist uncovers a religious mystery.', publisher: 'Doubleday', pages: 454, copies: 10 },
  { title: 'Big Little Lies', author: 'Liane Moriarty', isbn: '978-0399167065', year: 2014, category: 'Mystery', description: 'Three women\'s lives unravel to a shocking murder.', publisher: 'Putnam', pages: 460, copies: 7 },
  { title: 'The Maltese Falcon', author: 'Dashiell Hammett', isbn: '978-0679722649', year: 1930, category: 'Mystery', description: 'A private detective takes on a case involving a valuable statuette.', publisher: 'Knopf', pages: 217, copies: 5 },
  { title: 'In Cold Blood', author: 'Truman Capote', isbn: '978-0679745587', year: 1966, category: 'Mystery', description: 'A true crime account of a brutal murder.', publisher: 'Random House', pages: 343, copies: 6 },
  { title: 'The Woman in White', author: 'Wilkie Collins', isbn: '978-0141439617', year: 1859, category: 'Mystery', description: 'A mystery involving mistaken identity and a sinister conspiracy.', publisher: 'All the Year Round', pages: 672, copies: 4 },
  { title: 'And Then There Were None', author: 'Agatha Christie', isbn: '978-0062073488', year: 1939, category: 'Mystery', description: 'Ten strangers are invited to an island and murdered one by one.', publisher: 'Collins Crime Club', pages: 272, copies: 8 },

  // Fantasy (10 books)
  { title: 'Harry Potter and the Sorcerer\'s Stone', author: 'J.K. Rowling', isbn: '978-0439708180', year: 1997, category: 'Fantasy', description: 'A young wizard begins his magical education.', publisher: 'Bloomsbury', pages: 309, copies: 12 },
  { title: 'The Hobbit', author: 'J.R.R. Tolkien', isbn: '978-0547928227', year: 1937, category: 'Fantasy', description: 'Bilbo Baggins embarks on an unexpected journey.', publisher: 'Allen & Unwin', pages: 310, copies: 10 },
  { title: 'A Game of Thrones', author: 'George R.R. Martin', isbn: '978-0553103540', year: 1996, category: 'Fantasy', description: 'Noble families vie for control of the Iron Throne.', publisher: 'Bantam Spectra', pages: 694, copies: 9 },
  { title: 'The Name of the Wind', author: 'Patrick Rothfuss', isbn: '978-0756404741', year: 2007, category: 'Fantasy', description: 'A legendary hero tells his own story.', publisher: 'DAW Books', pages: 662, copies: 7 },
  { title: 'The Chronicles of Narnia', author: 'C.S. Lewis', isbn: '978-0066238500', year: 1950, category: 'Fantasy', description: 'Children discover a magical world through a wardrobe.', publisher: 'Geoffrey Bles', pages: 767, copies: 8 },
  { title: 'Mistborn: The Final Empire', author: 'Brandon Sanderson', isbn: '978-0765311788', year: 2006, category: 'Fantasy', description: 'A street thief becomes key to overthrowing an empire.', publisher: 'Tor Books', pages: 541, copies: 6 },
  { title: 'The Way of Kings', author: 'Brandon Sanderson', isbn: '978-0765326355', year: 2010, category: 'Fantasy', description: 'Epic fantasy in a world of stone and storms.', publisher: 'Tor Books', pages: 1007, copies: 5 },
  { title: 'American Gods', author: 'Neil Gaiman', isbn: '978-0380789030', year: 2001, category: 'Fantasy', description: 'Old gods and new clash in modern America.', publisher: 'William Morrow', pages: 465, copies: 7 },
  { title: 'The Lies of Locke Lamora', author: 'Scott Lynch', isbn: '978-0553588941', year: 2006, category: 'Fantasy', description: 'A con artist and his crew pull off elaborate heists.', publisher: 'Bantam Spectra', pages: 499, copies: 6 },
  { title: 'The Fifth Season', author: 'N.K. Jemisin', isbn: '978-0316229296', year: 2015, category: 'Fantasy', description: 'A woman searches for her daughter in a dying world.', publisher: 'Orbit', pages: 512, copies: 8 }
];

// Populate sample books
async function populateSampleBooks() {
  for (const book of sampleBooks) {
    const id = cassandra.types.Uuid.random();
    const query = `
      INSERT INTO books (id, title, author, isbn, published_year, category, description, publisher, pages, language, total_copies, available_copies) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    await client.execute(query, [
      id, 
      book.title, 
      book.author, 
      book.isbn, 
      book.year, 
      book.category, 
      book.description, 
      book.publisher, 
      book.pages, 
      'English',
      book.copies,
      book.copies
    ], { prepare: true });
  }
}

// Initialize database
async function initDatabase() {
  try {
    // Test connection first
    console.log('Connecting to Cassandra at 127.0.0.1:9042...');
    await client.connect();
    console.log('✓ Connected to Cassandra successfully');

    // Create keyspace
    await client.execute(`
      CREATE KEYSPACE IF NOT EXISTS library 
      WITH replication = {'class': 'SimpleStrategy', 'replication_factor': 1}
    `);

    console.log('✓ Keyspace created');

    // Use keyspace
    await client.execute('USE library');

    // Create books table
    await client.execute(`
      CREATE TABLE IF NOT EXISTS books (
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
      )
    `);

    // Create index on category for filtering
    await client.execute(`
      CREATE INDEX IF NOT EXISTS books_category_idx ON books (category)
    `);

    // Create users table
    await client.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY,
        username TEXT,
        email TEXT,
        password TEXT,
        role TEXT,
        created_at TIMESTAMP
      )
    `);

    // Create indexes for users
    await client.execute(`
      CREATE INDEX IF NOT EXISTS users_username_idx ON users (username)
    `);
    await client.execute(`
      CREATE INDEX IF NOT EXISTS users_email_idx ON users (email)
    `);

    console.log('✓ Table and indexes created');
    
    // Check if we need to populate sample data
    const countResult = await client.execute('SELECT COUNT(*) as count FROM books');
    const bookCount = countResult.rows[0].count.low || 0;
    
    if (bookCount === 0) {
      console.log('Populating sample books...');
      await populateSampleBooks();
      console.log('✓ Sample books added!');
    } else {
      console.log(`✓ Found ${bookCount} existing books in database`);
    }

    // Create default admin user if no users exist
    const userCountResult = await client.execute('SELECT COUNT(*) as count FROM users');
    const userCount = userCountResult.rows[0].count.low || 0;
    
    if (userCount === 0) {
      console.log('Creating default admin user...');
      const adminId = cassandra.types.Uuid.random();
      const hashedPassword = await bcrypt.hash('admin123', 10);
      const adminQuery = `
        INSERT INTO users (id, username, email, password, role, created_at) 
        VALUES (?, ?, ?, ?, ?, ?)
      `;
      await client.execute(adminQuery, [
        adminId,
        'admin',
        'admin@library.com',
        hashedPassword,
        'admin',
        new Date()
      ], { prepare: true });
      console.log('✓ Default admin user created (username: admin, password: admin123)');
    }
  } catch (error) {
    if (error.code === 'ECONNREFUSED' || error.message.includes('ECONNREFUSED')) {
      console.error('\n❌ ERROR: Cannot connect to Cassandra database!');
      console.error('\n📋 To fix this issue:');
      console.error('   1. Make sure Apache Cassandra is installed and running');
      console.error('   2. Start Cassandra using one of these methods:');
      console.error('      • Docker: docker run -d -p 9042:9042 --name cassandra cassandra:latest');
      console.error('      • Local install: cassandra (or bin/cassandra in Cassandra directory)');
      console.error('   3. Wait for Cassandra to fully start (may take 30-60 seconds)');
      console.error('   4. Verify it\'s running: telnet localhost 9042');
      console.error('\n💡 For more information, see: https://cassandra.apache.org/download/\n');
    } else {
      console.error('Database initialization error:', error.message);
    }
    process.exit(1);
  }
}

// Authentication Middleware
function requireAuth(req, res, next) {
  if (req.session && req.session.user) {
    return next();
  }
  return res.status(401).json({ error: 'Authentication required' });
}

function requireAdmin(req, res, next) {
  if (req.session && req.session.user && req.session.user.role === 'admin') {
    return next();
  }
  return res.status(403).json({ error: 'Admin access required' });
}

// Authentication Routes

// Register new user
app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ error: 'Username, email, and password are required' });
    }

    // Check if username already exists
    const existingUsername = await client.execute(
      'SELECT * FROM users WHERE username = ? ALLOW FILTERING',
      [username],
      { prepare: true }
    );

    if (existingUsername.rows.length > 0) {
      return res.status(400).json({ error: 'Username already exists' });
    }

    // Check if email already exists
    const existingEmail = await client.execute(
      'SELECT * FROM users WHERE email = ? ALLOW FILTERING',
      [email],
      { prepare: true }
    );

    if (existingEmail.rows.length > 0) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = cassandra.types.Uuid.random();

    // Insert new user
    const query = `
      INSERT INTO users (id, username, email, password, role, created_at) 
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    await client.execute(query, [
      userId,
      username,
      email,
      hashedPassword,
      'user',
      new Date()
    ], { prepare: true });

    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    // Find user by username
    const result = await client.execute(
      'SELECT * FROM users WHERE username = ? ALLOW FILTERING',
      [username],
      { prepare: true }
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    const user = result.rows[0];

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    // Create session
    req.session.user = {
      id: user.id.toString(),
      username: user.username,
      email: user.email,
      role: user.role
    };

    res.json({
      message: 'Login successful',
      user: {
        id: user.id.toString(),
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Logout
app.post('/api/auth/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: 'Error logging out' });
    }
    res.json({ message: 'Logout successful' });
  });
});

// Get current user
app.get('/api/auth/me', (req, res) => {
  if (req.session && req.session.user) {
    res.json({ user: req.session.user });
  } else {
    res.status(401).json({ error: 'Not authenticated' });
  }
});

// Routes

// Get all books or filter by category
app.get('/api/books', async (req, res) => {
  try {
    const { category } = req.query;
    let query, params;

    if (category && category !== 'all') {
      query = 'SELECT * FROM books WHERE category = ? ALLOW FILTERING';
      params = [category];
    } else {
      query = 'SELECT * FROM books';
      params = [];
    }

    const result = await client.execute(query, params, { prepare: true });
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all categories
app.get('/api/categories', async (req, res) => {
  try {
    const categories = [
      'Science Fiction',
      'Horror',
      'Literature',
      'Mystery',
      'Fantasy'
    ];
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get book by ID
app.get('/api/books/:id', async (req, res) => {
  try {
    const query = 'SELECT * FROM books WHERE id = ?';
    const result = await client.execute(query, [req.params.id], { prepare: true });
    if (result.rows.length > 0) {
      res.json(result.rows[0]);
    } else {
      res.status(404).json({ error: 'Book not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create book (Admin only)
app.post('/api/books', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { title, author, isbn, published_year, category, description, publisher, pages, language, total_copies } = req.body;
    const id = cassandra.types.Uuid.random();
    const copies = total_copies || 1;

    const query = `
      INSERT INTO books (id, title, author, isbn, published_year, category, description, publisher, pages, language, total_copies, available_copies) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    await client.execute(query, [id, title, author, isbn, published_year, category, description, publisher, pages, language, copies, copies], { prepare: true });
    res.status(201).json({ id: id.toString(), title, author, isbn, published_year, category, description, publisher, pages, language, total_copies: copies, available_copies: copies });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update book (Admin only)
app.put('/api/books/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { title, author, isbn, published_year, category, description, publisher, pages, language, total_copies, available_copies } = req.body;

    const query = `
      UPDATE books 
      SET title = ?, author = ?, isbn = ?, published_year = ?, category = ?, description = ?, publisher = ?, pages = ?, language = ?, total_copies = ?, available_copies = ? 
      WHERE id = ?
    `;

    await client.execute(query, [title, author, isbn, published_year, category, description, publisher, pages, language, total_copies, available_copies, req.params.id], { prepare: true });
    res.json({ message: 'Book updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Borrow book (decrease available copies) - Requires authentication
app.post('/api/books/:id/borrow', requireAuth, async (req, res) => {
  try {
    // Get current book data
    const getQuery = 'SELECT * FROM books WHERE id = ?';
    const result = await client.execute(getQuery, [req.params.id], { prepare: true });
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Book not found' });
    }
    
    const book = result.rows[0];
    
    if (book.available_copies <= 0) {
      return res.status(400).json({ error: 'No copies available' });
    }
    
    // Decrease available copies
    const updateQuery = 'UPDATE books SET available_copies = ? WHERE id = ?';
    await client.execute(updateQuery, [book.available_copies - 1, req.params.id], { prepare: true });
    
    res.json({ message: 'Book borrowed successfully', available_copies: book.available_copies - 1 });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Return book (increase available copies) - Requires authentication
app.post('/api/books/:id/return', requireAuth, async (req, res) => {
  try {
    // Get current book data
    const getQuery = 'SELECT * FROM books WHERE id = ?';
    const result = await client.execute(getQuery, [req.params.id], { prepare: true });
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Book not found' });
    }
    
    const book = result.rows[0];
    
    if (book.available_copies >= book.total_copies) {
      return res.status(400).json({ error: 'All copies are already returned' });
    }
    
    // Increase available copies
    const updateQuery = 'UPDATE books SET available_copies = ? WHERE id = ?';
    await client.execute(updateQuery, [book.available_copies + 1, req.params.id], { prepare: true });
    
    res.json({ message: 'Book returned successfully', available_copies: book.available_copies + 1 });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete book (Admin only)
app.delete('/api/books/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    const query = 'DELETE FROM books WHERE id = ?';
    await client.execute(query, [req.params.id], { prepare: true });
    res.json({ message: 'Book deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Start server
initDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
});
