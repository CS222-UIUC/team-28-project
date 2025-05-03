// testPost.js
// A quick script to POST your sample event to http://localhost:3000/events

(async () => {
    try {

      console.log('Attempting login...');
      const loginRes = await fetch('http://localhost:3000/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'nhidinh2@illinois.edu',
          password: 'Dani-2107'
        })
      });

      console.log('Login response status:', loginRes.status);
      const loginData = await loginRes.json();
      console.log('Login response:', loginData);

      if (!loginData.token) {
        throw new Error(`Login failed: ${JSON.stringify(loginData)}`);
      }

      // Now make the events request with the auth token
      console.log('Making events request...');
      const res = await fetch('http://localhost:3000/events', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${loginData.token}`
        },
        body: JSON.stringify({
          user_id:   '544a68f5-4f24-45b0-90bf-9e3fdd9ea2b0', // your test UID
          task:      'Meeting',
          participants: ['John'],
          date:      '2024-03-18', // Monday
          time:      '14:00',      // 2pm
          end_time:  null,
          locations: ['school']
        })
      });
  
      console.log('Events response status:', res.status);
      const eventData = await res.json();
      console.log('Events response:', eventData);
    } catch (err) {
      console.error('Error:', err);
    }
  })();
  