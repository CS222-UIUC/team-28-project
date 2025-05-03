const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = 3000;
const SECRET = 'supersecretkey'; // store securely in prod

app.use(cors());
app.use(bodyParser.json());

// In-memory "database"
const users = [];

// Signup route
app.post('/signup', async (req, res) => {
  const { email, password } = req.body;

  // Check if user exists
  const existingUser = users.find(u => u.email === email);
  if (existingUser) return res.status(400).json({ message: 'User already exists' });

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);
  users.push({ email, password: hashedPassword });

  res.status(201).json({ message: 'User created successfully' });
});

// Login route
app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  const user = users.find(u => u.email === email);
  if (!user) return res.status(400).json({ message: 'Invalid credentials' });

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

  const token = jwt.sign({ email }, SECRET, { expiresIn: '1h' });
  res.json({ token });
});

app.listen(PORT, () => {
  console.log(`Auth API running at http://localhost:${PORT}`);
});
