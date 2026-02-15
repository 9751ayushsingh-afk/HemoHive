const io = require('socket.io-client');

const socket = io('http://localhost:3000', {
    path: '/api/socket',
    reconnection: false
});

socket.on('connect', () => {
    console.log('✅ Connected to socket server');

    const mockRequest = {
        _id: 'TEST_ID_' + Date.now(),
        bloodGroup: 'AB+',
        units: 5,
        hospitalId: '6909953f1f8cd77da9a6b49c', // Use one from requests.txt
        urgency: 'Emergency',
        patientHospital: 'TEST HOSPITAL',
        reason: 'Socket Test Emission',
        expiresAt: new Date(Date.now() + 30 * 60000).toISOString(),
        status: 'Pending'
    };

    console.log('📤 Emitting test request...');
    // We need to emit to a custom event that the SERVER listens to, 
    // which then broadcasts to 'hospital_room'.
    // If the server doesn't have a 'relay' event, we can't emit from client-to-client directly usually.
    // BUT, let's see if we can join the room and if that helps?
    // Actually, we are testing if the CLIENT (like the API route logic) can emit.
    // The API route logic I added uses SERVER-SIDE io.emit.

    // This script is testing CLIENT-SIDE receive.
    socket.emit('join_hospital_room');

    // We will just listen here. I will manually trigger the API via curl or similar if needed, 
    // but for now let's just see if we can connect.
});

socket.on('disconnect', () => {
    console.log('❌ Disconnected');
});

socket.on('connect_error', (err) => {
    console.error('❌ Connection Error:', err.message);
});

socket.on('new_blood_request', (data) => {
    console.log('✅ RECEIVED DATA:', data);
    process.exit(0);
});

// Keep alive for 10s
setTimeout(() => {
    console.log('⏰ Timeout - No data received');
    process.exit(1);
}, 10000);
