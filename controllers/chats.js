const express = require('express');

const router = express.Router();

// chats - all groups
router.get('/', (req,res)=>{
    res.render('main/chat_group')
})

router.get('/chats', (req,res)=>{
    res.render('main/chat_group')
})

// chats - my groups
router.get('/my_groups', (req,res)=>{
    res.render('main/chat_group')
})

// chats - create group
router.get('/create_group', (req,res)=>{
    res.render('main/chat_group')
})

// settings
router.get('/settings', (req,res)=>{
    res.render('main/chat_group')
})
// notification
router.get('/notification', (req,res)=>{
    res.render('main/chat_group')
})


module.exports = router;