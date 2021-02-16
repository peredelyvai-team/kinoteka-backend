// const express = require('express');
// const path = require('path');
// const cookieParser = require('cookie-parser');
// const logger = require('morgan');
//
// const indexRouter = require('./routes/index');
// const usersRouter = require('./routes/users');
//
// const app = express();
//
// app.use(logger('dev'));
// app.use(express.json());
// app.use(express.urlencoded({ extended: false }));
// app.use(cookieParser());
// app.use(express.static(path.join(__dirname, 'public')));
//
// app.use('/', indexRouter);
// app.use('/users', usersRouter);
//
// module.exports = app;

import LogRocket from 'logrocket'
LogRocket.init('lyodjz/kinoteka')

import express from 'express'
const app = express()
const PORT = 8000


app.get('/', (req, res) => {
    res.send('express server running')
})

app.listen(PORT, () => {
    console.log('server running..')
})
