// server.cjs
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { createClient } = require('@supabase/supabase-js');
const axios = require('axios');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// ─── Supabase Client Setup ───────────────────────────────────────────────────
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

const SECRET = process.env.JWT_SECRET || 'supersecretkey';

// ─── Health‑check endpoint ───────────────────────────────────────────────────
app.get('/', (req, res) => {
  res.send('Hello from the Node.js + Supabase backend!');
});

// ─── AUTH ROUTES ─────────────────────────────────────────────────────────────
app.post('/signup', async (req, res) => {
  const { email, password } = req.body;

  try {
    const { data: existingUser } = await supabase
      .from('users')
      .select()
      .eq('email', email)
      .single();

    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const { data, error } = await supabase
      .from('users')
      .insert([{ email, password: hashedPassword }])
      .select();

    if (error) throw error;

    res.status(201).json({ message: 'User created successfully' });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ message: 'Error creating user' });
  }
});

app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const { data: user, error } = await supabase
      .from('users')
      .select()
      .eq('email', email)
      .single();

    if (error || !user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ email: user.email }, SECRET, { expiresIn: '1h' });
    res.json({ token });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Error during login' });
  }
});

// ─── EVENTS CRUD ROUTES ──────────────────────────────────────────────────────
app.post('/events', async (req, res) => {
  const { user_id, task, participants, date, time, end_time, locations } = req.body;
  if (!user_id || !task || !date || !time) {
    return res.status(400).json({ error: 'user_id, task, date and time are required.' });
  }

  const { data, error } = await supabase
    .from('events')
    .insert(
      [{ user_id, task, participants, date, time, end_time, locations }],
      { returning: 'representation' }
    );

  if (error) {
    return res.status(400).json({ error: error.message });
  }
  if (!data || data.length === 0) {
    return res.status(500).json({ error: 'Insert succeeded but no data returned' });
  }

  res.status(201).json(data[0]);
});

app.get('/events/:user_id', async (req, res) => {
  const { user_id } = req.params;

  const { data: events, error } = await supabase
    .from('events')
    .select('*')
    .eq('user_id', user_id)
    .order('date', { ascending: true })
    .order('time', { ascending: true });

  if (error) {
    console.error('Supabase select error:', error);
    return res.status(400).json({ error: error.message });
  }

  const nested = events.reduce((acc, ev) => {
    const [year, month, day] = ev.date.toString().split('T')[0].split('-');
    acc[year]         ??= {};
    acc[year][month]  ??= {};
    acc[year][month][day] ??= [];
    acc[year][month][day].push(ev);
    return acc;
  }, {});

  res.json(nested);
});

app.put('/events/:id', async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  const { data, error } = await supabase
    .from('events')
    .update(updates)
    .eq('id', id);

  if (error) {
    console.error('Supabase update error:', error);
    return res.status(400).json({ error: error.message });
  }

  res.json(data[0]);
});

app.delete('/events/:id', async (req, res) => {
  const { id } = req.params;

  const { error } = await supabase
    .from('events')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Supabase delete error:', error);
    return res.status(400).json({ error: error.message });
  }

  res.status(204).send();
});

// ─── NLP Task Extraction Endpoint ─────────────────────────────────────────────
app.post('/tasks/nlp', async (req, res) => {
  try {
    const { text, user_id } = req.body;
    if (!text || !user_id) {
      return res.status(400).json({ error: 'text and user_id are required' });
    }

    // Call FastAPI NLP service
    const fastApiResponse = await axios.post('http://localhost:8080/nlp/process', { tasks: [{ text }] });
    const extracted = fastApiResponse.data.results[0].extracted_entities;

    // Check for missing fields
    const missingFields = [];
    if (!extracted.task) missingFields.push('task');
    if (!extracted.date) missingFields.push('date');
    if (!extracted.time) missingFields.push('time');
    if (!extracted.participants.length) missingFields.push('participants');
    if (!extracted.locations.length) missingFields.push('locations');

    res.status(200).json({
      message: 'NLP extraction successful',
      extracted,
      missingFields,
      needsUserInput: missingFields.length > 0
    });
  } catch (error) {
    console.error('NLP processing error:', error);
    res.status(500).json({ error: 'Error processing text' });
  }
});

// ─── Start the server ────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Combined server running on port ${PORT}`);
});