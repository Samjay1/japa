'use strict';

const express = require('express');
const cors = require('cors')
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt'); 
require('dotenv/config');
const path = require('path');

const app = express();

app.use('/public', express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:false}));


app.use(cors({
    origin: '*'
}));
var PORT = process.env.PORT || 1000;
app.get('/', (req, res) => {
    res.send('hello world')
})


  app.get('/test', (req, res)=>{
    res.status(200).json({
        status: true,
        message:'workshere'
      })
      res.status(200).json({
        status: true,
        message:'workshere'
      })
  })
  

app.listen(PORT, console.log('server on 1000'))
