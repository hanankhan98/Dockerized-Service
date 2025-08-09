require('dotenv').config();
const express = require('express');
const app = express();

const PORT = process.env.PORT || 3000;
const USERNAME = process.env.USERNAME || 'admin';
const PASSWORD = process.env.PASSWORD || 'password';
const SECRET_MESSAGE = process.env.SECRET_MESSAGE || 'This is the default secret.';

function basicAuth(req, res, next) {
  const auth = req.headers['authorization'];
  if (!auth || !auth.startsWith('Basic ')) {
    res.set('WWW-Authenticate', 'Basic realm="Restricted Area"');
    return res.status(401).send('Authentication required.');
  }

  const base64Credentials = auth.split(' ')[1];
  const credentials = Buffer.from(base64Credentials, 'base64').toString('utf8');
  const index = credentials.indexOf(':');
  const user = index >= 0 ? credentials.slice(0, index) : credentials;
  const pass = index >= 0 ? credentials.slice(index + 1) : '';

  if (user === USERNAME && pass === PASSWORD) {
    return next();
  }

  res.set('WWW-Authenticate', 'Basic realm="Restricted Area"');
  return res.status(401).send('Invalid credentials.');
}

app.get('/', (req, res) => res.send('Hello, world!'));
app.get('/secret', basicAuth, (req, res) => res.send(SECRET_MESSAGE));

app.listen(PORT, () => console.log(`Listening on port ${PORT}`));
