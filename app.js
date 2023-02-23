'use strict';

const express = require('express');
const cors = require('cors')
const bodyParser = require('body-parser');
require('dotenv/config');
const path = require('path');

const main = require('./controllers/main');
const chats = require('./controllers/chats');
const resources = require('./controllers/resources');

const app = express();

app.use('/public', express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:false}));


app.use(cors({
    origin: '*'
}));


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
