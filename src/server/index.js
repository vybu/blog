const server = require('./app.js');
const { init } = require('./db');

const PORT = process.env.PORT || 3000;

init().then(() => server.listen(PORT));
