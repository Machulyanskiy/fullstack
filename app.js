const express = require('express');
const mongoose = require ('mongoose');
const bodyParser = require ('body-parser');
const authRoutes = require('./routes/auth');
const authAnalytics = require('./routes/analytics');
const authCategory = require('./routes/category');
const authOrder = require('./routes/order');
const authPosition = require('./routes/position');
const keys = require('./config/keys');
const passport = require('passport');
const path = require('path');
const app = express();

mongoose.connect(keys.mongoURI, {useCreateIndex: true, useNewUrlParser: true})
    .then(() => console.log('MongoDB connected.'))
    .catch(error => console.log(error));

app.use(passport.initialize());
require('./middleware/passport')(passport);

app.use(require('morgan')('dev'));
app.use('/uploads', express.static('uploads'));
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(require('cors')());

app.use('/api/auth', authRoutes);
app.use('/api/analytics', authAnalytics);
app.use('/api/category', authCategory);
app.use('/api/order', authOrder);
app.use('/api/position', authPosition);

if (process.env.NODE_ENV === 'production') {
    app.use(express.static('client/dist/client'));

    app.get('*', (req, res) => {
       res.sendFile(
           path.resolve(
               __dirname, 'client', 'dist', 'client', 'index.html'
           )
       )
    });
}

module.exports = app;