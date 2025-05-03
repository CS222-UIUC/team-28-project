// server.js

// Step 4: Initialize Supabase client
const express = require('express');
const dotenv = require('dotenv');
const { createClient } = require('@supabase/supabase-js');

dotenv.config();

const app = express();
app.use(express.json());

// ─── Supabase Client Setup (Step 4) ────────────────────────────────────────────
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

// ─── Health‑check endpoint ─────────────────────────────────────────────────────
app.get('/', (req, res) => {
  res.send('Hello from the Node.js + Supabase backend!');
});

// Step 6: CRUD endpoints for your `events` table

// ─── CREATE an Event ───────────────────────────────────────────────────────────
app.post('/events', async (req, res) => {
  const { user_id, task, participants, date, time, end_time, locations } = req.body;
  if (!user_id || !task || !date || !time) {
    return res.status(400).json({ error: 'user_id, task, date and time are required.' });
  }

  // Tell Supabase to return the full row(s) by using returning:'representation'
  const { data, error } = await supabase
    .from('events')
    .insert(
      [{ user_id, task, participants, date, time, end_time, locations }],
      { returning: 'representation' }
    );

  console.log('Insert result:', { data, error });

  if (error) {
    return res.status(400).json({ error: error.message });
  }
  if (!data || data.length === 0) {
    return res.status(500).json({ error: 'Insert succeeded but no data returned' });
  }

  // data[0] now contains your newly created event
  res.status(201).json(data[0]);
});

// ─── READ & NEST events by year→month→day ───────────────────────────────────────
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

// ─── UPDATE an Event ───────────────────────────────────────────────────────────
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

// ─── DELETE an Event ───────────────────────────────────────────────────────────
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

// ─── Start the server ──────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
