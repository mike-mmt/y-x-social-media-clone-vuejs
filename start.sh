#!/bin/sh

# Start the backend Node.js application
cd /app/backend && node server.js &

# Start nginx
nginx -g 'daemon off;'