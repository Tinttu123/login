const { OAuth2Client } = require('google-auth-library');
const express = require('express');
const app = express();
const port = 3000;

const CLIENT_ID = 'YOUR_CLIENT_ID';
const CLIENT_SECRET = 'YOUR_CLIENT_SECRET';
const REDIRECT_URI = 'http://localhost:3000/oauth2callback';

const client = new OAuth2Client(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);

let gmailUser = false;

app.use(express.static('public'));

app.get('/auth', (req, res) => {
  const authorizeUrl = client.generateAuthUrl({
    access_type: 'offline',
    scope: 'https://www.googleapis.com/auth/userinfo.email',
  });
  res.redirect(authorizeUrl);
});

app.get('/oauth2callback', async (req, res) => {
  const code = req.query.code;
  const { tokens } = await client.getToken(code);
  client.setCredentials(tokens);

  const userinfoResponse = await client.request({
    url: 'https://www.googleapis.com/oauth2/v1/userinfo',
  });

  const email = userinfoResponse.data.email;
  if (email.endsWith('@gmail.com')) {
    gmailUser = true;
    res.redirect('/');
  } else {
    res.send('Pääsy evätty: Vain Gmail-käyttäjille.');
  }
});

app.get('/', (req, res) => {
  if (gmailUser) {
    res.sendFile(__dirname + '/index.html');
  } else {
    res.send('Pääsy evätty: Kirjaudu sisään Gmail-tunnuksellasi.');
  }
});

app.listen(port, () => {
  console.log(`Sovellus kuuntelee osoitteessa http://localhost:${port}`);
});
