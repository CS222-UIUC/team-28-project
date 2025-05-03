const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const app = express();
const PORT = process.env.DB_PORT || 5432;

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

app.use(cors());
app.use(bodyParser.json());

// Create task
app.post('/tasks', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('tasks')
      .insert([{
        ...req.body,
        created_at: new Date().toISOString()
      }])
      .select();

    if (error) throw error;
    res.status(201).json(data[0]);
  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({ message: 'Error creating task' });
  }
});

// Get all tasks
app.get('/tasks', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({ message: 'Error fetching tasks' });
  }
});

// Get task by id
app.get('/tasks/:id', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('tasks')
      .select()
      .eq('id', req.params.id)
      .single();

    if (error) throw error;
    if (!data) return res.status(404).json({ message: 'Task not found' });
    
    res.json(data);
  } catch (error) {
    console.error('Get task error:', error);
    res.status(500).json({ message: 'Error fetching task' });
  }
});

// Update task
app.put('/tasks/:id', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('tasks')
      .update({
        ...req.body,
        updated_at: new Date().toISOString()
      })
      .eq('id', req.params.id)
      .select();

    if (error) throw error;
    if (!data.length) return res.status(404).json({ message: 'Task not found' });
    
    res.json(data[0]);
  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({ message: 'Error updating task' });
  }
});

// Delete task
app.delete('/tasks/:id', async (req, res) => {
  try {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', req.params.id);

    if (error) throw error;
    res.status(204).send();
  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({ message: 'Error deleting task' });
  }
});

// Create event
app.post('/events', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('events')
      .insert([{
        user_id: req.body.user_id,
        task: req.body.task,
        participants: req.body.participants || [],
        event_date: req.body.date,
        event_time: req.body.time,
        end_time: req.body.end_time,
        locations: req.body.locations || []
      }])
      .select();

    if (error) throw error;
    res.status(201).json(data[0]);
  } catch (error) {
    console.error('Create event error:', error);
    res.status(500).json({ message: 'Error creating event' });
  }
});

// Get all events for a user
app.get('/events/:userId', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('user_id', req.params.userId)
      .order('event_date', { ascending: true });

    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error('Get events error:', error);
    res.status(500).json({ message: 'Error fetching events' });
  }
});

// Get events by date range
app.get('/events/:userId/range', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('user_id', req.params.userId)
      .gte('event_date', startDate)
      .lte('event_date', endDate)
      .order('event_date', { ascending: true });

    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error('Get events by range error:', error);
    res.status(500).json({ message: 'Error fetching events' });
  }
});

// Update event
app.put('/events/:id', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('events')
      .update({
        task: req.body.task,
        participants: req.body.participants,
        event_date: req.body.date,
        event_time: req.body.time,
        end_time: req.body.end_time,
        locations: req.body.locations,
        updated_at: new Date().toISOString()
      })
      .eq('id', req.params.id)
      .select();

    if (error) throw error;
    if (!data.length) return res.status(404).json({ message: 'Event not found' });
    
    res.json(data[0]);
  } catch (error) {
    console.error('Update event error:', error);
    res.status(500).json({ message: 'Error updating event' });
  }
});

// Delete event
app.delete('/events/:id', async (req, res) => {
  try {
    const { error } = await supabase
      .from('events')
      .delete()
      .eq('id', req.params.id);

    if (error) throw error;
    res.status(204).send();
  } catch (error) {
    console.error('Delete event error:', error);
    res.status(500).json({ message: 'Error deleting event' });
  }
});

app.listen(PORT, () => {
  console.log(`Database server running at http://localhost:${PORT}`);
}); 