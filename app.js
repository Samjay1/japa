'use strict';

require('dotenv/config');
const path = require('path');
const express = require('express');
const cors = require('cors')
const bodyParser = require('body-parser');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const flash = require('connect-flash');
const cookieParser = require('cookie-parser');

const main = require('./controllers/main');
const chats = require('./controllers/chats');
const resources = require('./controllers/resources');

const app = express();

// Sessions Config
app.use(session({
  name:'Japa.run',
  secret: process.env.SECRET_KEY,
  store: MongoStore.create({
      mongoUrl: process.env.DATABASE_URL,
      ttl: 2 * 24 * 60 * 60,
      autoRemove: 'native',
      touchAfter: 24 * 3600,
  }),
  cookie: {
    maxAge:  2 * 24 * 60 * 60,
    sameSite: true,
  },
  resave: false,
  saveUninitialized: false
}));

app.use('/public', express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:false}));

app.use(cors({
    origin: '*'
}));

app.use(flash());
app.use(cookieParser());

app.use('/', main);
app.use('/', chats);
app.use('/', resources);


var PORT = process.env.PORT || 8040;



app.get('/test', (req, res)=>{
  res.status(200).json({
      status: true,
      message:'works here'
    })
})


app.listen(PORT, console.log('server on 8040'))
