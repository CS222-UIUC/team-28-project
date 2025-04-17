const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const bodyParser = require('body-parser');
const { OAuth2Client } = require('google-auth-library');

const app = express();
const PORT = 3000;
const SECRET = 'supersecretkey'; // store securely in prod

// Initialize Google OAuth client
const GOOGLE_CLIENT_ID = '70522798885-alrv7qtb62qegfiqsj2pkegu5cdm1fq5.apps.googleusercontent.com';
const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);

// Configure CORS with specific options
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:8080', 'http://127.0.0.1:3000', 'http://127.0.0.1:8080'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.use(bodyParser.json());

// Input validation middleware
const validateSignupInput = (req, res, next) => {
  const { email, password, name } = req.body;

  if (!email || !password || !name) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ message: 'Invalid email format' });
  }

  if (password.length < 6) {
    return res.status(400).json({ message: 'Password must be at least 6 characters long' });
  }

  next();
};

// In-memory "database"
const users = [];

// Helper function to generate JWT token
const generateToken = (user) => {
  return jwt.sign(
    { 
      email: user.email,
      id: user.id,
      name: user.name 
    }, 
    SECRET, 
    { expiresIn: '1h' }
  );
};

// Signup route
app.post('/signup', validateSignupInput, async (req, res) => {
  try {
    const { email, password, name } = req.body;

    // Check if user exists
    const existingUser = users.find(u => u.email === email);
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create new user
    const newUser = {
      id: users.length + 1,
      email,
      password: hashedPassword,
      name: name || email.split('@')[0],
      createdAt: new Date().toISOString()
    };
    
    users.push(newUser);

    // Generate token
    const token = generateToken(newUser);

    // Log successful signup
    console.log(`New user registered: ${email}`);

    res.status(201).json({ 
      token,
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name
      }
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ message: 'Server error during signup' });
  }
});

// Login route
app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = users.find(u => u.email === email);
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = generateToken(user);
    
    res.json({ 
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// Google authentication route
app.post('/auth/google', async (req, res) => {
  try {
    const { token } = req.body;

    // Verify Google token
    const ticket = await googleClient.verifyIdToken({
      idToken: token,
      audience: GOOGLE_CLIENT_ID
    });

    const payload = ticket.getPayload();
    const { email, name, picture } = payload;

    // Check if user exists
    let user = users.find(u => u.email === email);

    if (!user) {
      // Create new user if they don't exist
      user = {
        id: users.length + 1,
        email,
        name,
        picture,
        googleId: payload.sub,
      };
      users.push(user);
    }

    // Generate token
    const jwtToken = generateToken(user);

    res.json({
      token: jwtToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        picture: user.picture
      }
    });
  } catch (error) {
    console.error('Google auth error:', error);
    res.status(401).json({ 
      message: 'Failed to authenticate with Google',
      error: error.message 
    });
  }
});

// Get current user route (protected)
app.get('/user', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = jwt.verify(token, SECRET);
    const user = users.find(u => u.email === decoded.email);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        picture: user.picture
      }
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(401).json({ message: 'Invalid token' });
  }
});

app.listen(PORT, () => {
  console.log(`Auth API running at http://localhost:${PORT}`);
});
