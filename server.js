const path = require('path');
const express = require('express');
const favicon = require('serve-favicon');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const session = require('express-session');
const compression = require('compression');

const port = process.env.PORT || '3000';
const app = express();

app.use(compression());
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(
  session({
    // REMOVE IF NOT NEEDED
    secret: 'What is this secret for??', // CHANGE!
    resave: false,
    saveUninitialized: false
  })
);

app.use(express.static(path.join(__dirname, 'public')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

/* eslint-disable no-console */
app.listen(port, () => console.log(`Server listening on port ${port}`));
/* eslint-enable no-console */
