// server.js
const jsonServer = require('json-server');
const server = jsonServer.create();
const router = jsonServer.router('db.json');
const middlewares = jsonServer.defaults({
  static: false // This line explicitly tells json-server NOT to serve static files
});

// Render provides the PORT as an environment variable
const port = process.env.PORT || 3000;

server.use(middlewares); // Apply default middlewares (like CORS, logger) but without static serving
server.use(router);      // Apply the JSON server router for your db.json

server.listen(port, () => {
  console.log(`JSON Server is running on port ${port}`);
});