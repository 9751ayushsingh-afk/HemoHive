
const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const { Server } = require('socket.io');

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = process.env.PORT || 3000;
// when using middleware `hostname` and `port` must be provided below
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = createServer(async (req, res) => {
    try {
      // Be sure to pass `true` as the second argument to `url.parse`.
      // This tells it to parse the query portion of the URL.
      const parsedUrl = parse(req.url, true);
      const { pathname, query } = parsedUrl;

      // [DEBUG] Log all API requests to see what's happening
      if (pathname.startsWith('/api/internal')) {
        console.log(`[SERVER DEBUG] Method: ${req.method}, Path: ${pathname}`);
      }

      // Custom Internal Broadcast Route
      if (req.method === 'POST' && pathname === '/api/internal/broadcast-request') {
        let body = '';
        req.on('data', chunk => { body += chunk.toString(); });
        req.on('end', () => {
          try {
            const requestData = JSON.parse(body);
            const fulfillmentTarget = requestData.hospitalId;
            const broadcastTargets = requestData.broadcastTo; // Array of hospital IDs

            if (broadcastTargets && Array.isArray(broadcastTargets) && broadcastTargets.length > 0) {
              console.log(`Targeting Request ${requestData._id} to ${broadcastTargets.length} private hospital rooms.`);
              broadcastTargets.forEach(targetId => {
                io.to(`hospital_${targetId}`).emit('new_blood_request', requestData);
              });
            } else if (fulfillmentTarget) {
              console.log(`Targeting Request ${requestData._id} to Single Hospital Room: ${fulfillmentTarget}`);
              io.to(`hospital_${fulfillmentTarget}`).emit('new_blood_request', requestData);
            } else {
              console.log('Broadcasting New Request to GLOBAL Hospital Room:', requestData._id);
              // Last fallback: global notification
              io.to('hospitals').emit('new_blood_request', requestData);
            }

            res.statusCode = 200;
            res.end('Broadcasted');
          } catch (e) {
            console.error('Broadcast Error:', e);
            res.statusCode = 400;
            res.end('Invalid JSON');
          }
        });
        return;
      }

      // Broadcast "Request Taken" Route
      if (req.method === 'POST' && pathname === '/api/internal/broadcast-taken') {
        let body = '';
        req.on('data', chunk => { body += chunk.toString(); });
        req.on('end', () => {
          try {
            const { requestId } = JSON.parse(body);
            console.log('Broadcasting Request TAKEN:', requestId);
            // Broadcast to all hospitals to remove it
            io.to('hospitals').emit('request_taken', requestId);
            res.statusCode = 200;
            res.end('Broadcasted');
          } catch (e) {
            console.error('Broadcast Error:', e);
            res.statusCode = 400;
            res.end('Invalid JSON');
          }
        });
        return;
      }

      // Broadcast "Driver Proposal" Route (Target Specific Driver)
      if (req.method === 'POST' && pathname === '/api/internal/broadcast-proposal') {
        let body = '';
        req.on('data', chunk => { body += chunk.toString(); });
        req.on('end', () => {
          try {
            const { driverId, data } = JSON.parse(body);
            console.log('Broadcasting Proposal to Driver:', driverId);
            io.to(`driver_${driverId}`).emit('incoming_request', data);
            res.statusCode = 200;
            res.end('Broadcasted');
          } catch (e) {
            console.error('Broadcast Error:', e);
            res.statusCode = 400;
            res.end('Invalid JSON');
          }
        });
        return;
      }


      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error occurred handling', req.url, err);
      res.statusCode = 500;
      res.end('internal server error');
    }
  });

  // Tracking for latest driver locations per delivery
  const deliveryLocations = new Map();

  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    // Join room for specific delivery tracking
    socket.on('join_delivery_room', (deliveryId) => {
      socket.join(`delivery_${deliveryId}`);
      console.log(`Socket ${socket.id} joined delivery_${deliveryId}`);
    });

    // Driver updates location
    socket.on('update_location', (data) => {
      const { deliveryId, location } = data;
      console.log(`[Socket] Received update_location for delivery_${deliveryId}:`, location);

      // Store latest location
      deliveryLocations.set(deliveryId, location);

      // Broadcast to everyone in the room (hospital, donor)
      io.to(`delivery_${deliveryId}`).emit('driver_moved', location);
      console.log(`[Socket] Broadcasted driver_moved to delivery_${deliveryId}`);
    });

    // Request latest location (used by donor on join)
    socket.on('request_driver_location', (deliveryId) => {
      const location = deliveryLocations.get(deliveryId);
      console.log(`[Socket] Received request_driver_location for delivery_${deliveryId}. Found:`, !!location);
      if (location) {
        socket.emit('current_driver_location', location);
      }
    });

    // Delivery status change
    socket.on('status_change', (data) => {
      const { deliveryId, status } = data;
      console.log(`[Socket] Received status_change for delivery_${deliveryId}:`, status);
      io.to(`delivery_${deliveryId}`).emit('delivery_status_updated', status);
      console.log(`[Socket] Broadcasted delivery_status_updated to delivery_${deliveryId}`);
    });

    // Hospital Room Logic
    socket.on('join_hospital_room', (hospitalId) => {
      socket.join('hospitals'); // Still join global room for broadcasts
      if (hospitalId) {
        socket.join(`hospital_${hospitalId}`);
        console.log(`Socket ${socket.id} joined private hospital_${hospitalId}`);
      }
    });

    // Driver Personal Room
    socket.on('join_driver_room', (driverId) => {
      socket.join(`driver_${driverId}`);
      console.log(`Socket ${socket.id} joined 'driver_${driverId}'`);
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });

  server.listen(port, (err) => {
    if (err) throw err;
    console.log(`> Ready on http://${hostname}:${port}`);
    console.log(`> Custom Server handling Internal Broadcasts enabled`);
  });

  // Internal Broadcast Route Handler (Must be attached before Next.js handle if possible, or intercept inside createServer)
  // We need to modify the createServer callback at the top, not here.
  // ... Wait, I am inside 'app.prepare().then(...)'.
  // I need to modify the createServer logic at lines 15-28.
  // I will skip this edit and use a multi_replace instead to target the top part.
});