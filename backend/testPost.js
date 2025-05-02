// testPost.js
// A quick script to POST your sample event to http://localhost:3000/events

(async () => {
    try {
      // Node 18+ has fetch built‑in
      const res = await fetch('http://localhost:3000/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id:   '21d77745-c580-4b30-aac8-45a86fcb62e1', // your test UID
          task:      'Meet',
          participants: ['team'],
          date:      '2025-04-17',
          time:      '14:00',
          end_time:  null,
          locations: []
        })
      });
  
      console.log('Status:', res.status);
      console.log('Body:', await res.json());
    } catch (err) {
      console.error('Error calling /events:', err);
    }
  })();
  