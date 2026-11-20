require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const passport = require('passport');
const cookieParser = require('cookie-parser');


require('./config/passport'); // registers the jwt + google strategies

const app = express();

app.set('trust proxy', 1);
app.use(helmet());
app.use(cors({ origin: process.env.FRONTEND_URL, credentials: true })); // credentials: true is required for cookies;
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));
app.use(passport.initialize());

app.use('/api/v1/auth', require('./route/authRoute'));
app.use('/api/v1/task', require('./route/taskRoute'));

app.get('/', (req, res) => {
  res.status(200).send('DayFlow API is running successfully!');
});

// Final error handler: no stack traces to the client
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

module.exports = app;