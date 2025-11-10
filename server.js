const express = require('express');
const cassandra = require('cassandra-driver');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

// Cassandra client setup
const client = new cassandra.Client({
  contactPoints: ['127.0.0.1'],
  localDataCenter: 'datacenter1',
  keyspace: 'library'
});

// Initialize database
async function initDatabase() {
  try {
    // Create keyspace
    await client.execute(`
      CREATE KEYSPACE IF NOT EXISTS library 
      WITH replication = {'class': 'SimpleStrategy', 'replication_factor': 1}
    `);
    
    console.log('Keyspace created');
    
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
        available BOOLEAN
      )
    `);
    
    console.log('Table created');
  } catch (error) {
    console.error('Database initialization error:', error);
  }
}

// Routes

// Get all books
app.get('/api/books', async (req, res) => {
  try {
    const result = await client.execute('SELECT * FROM books');
    res.json(result.rows);
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

// Create book
app.post('/api/books', async (req, res) => {
  try {
    const { title, author, isbn, published_year, available } = req.body;
    const id = cassandra.types.Uuid.random();
    
    const query = `
      INSERT INTO books (id, title, author, isbn, published_year, available) 
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    
    await client.execute(query, [id, title, author, isbn, published_year, available], { prepare: true });
    res.status(201).json({ id: id.toString(), title, author, isbn, published_year, available });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update book
app.put('/api/books/:id', async (req, res) => {
  try {
    const { title, author, isbn, published_year, available } = req.body;
    
    const query = `
      UPDATE books 
      SET title = ?, author = ?, isbn = ?, published_year = ?, available = ? 
      WHERE id = ?
    `;
    
    await client.execute(query, [title, author, isbn, published_year, available, req.params.id], { prepare: true });
    res.json({ message: 'Book updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete book
app.delete('/api/books/:id', async (req, res) => {
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
