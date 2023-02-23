const express = require('express');

const router = express.Router();

// CHATS SECTION -------------------------
router.route('/chats')
.get((req,res)=>{ //get all chats
    res.send('get chats')
})
.post((req,res)=>{ //add new chat
    res.send('post chats')
})

// delete chat
router.get('/delete_chat/:id', (req,res)=>{
    res.send('delete chat')
})

// disable chat
router.get('/disable_chat/:id', (req,res)=>{
    res.send('disable chat')
})

// enable chat
router.get('/enable_chat/:id', (req,res)=>{
    res.send('enable chat')
})

// END CHATS SECTION -------------------------


// CHATS SECTION -------------------------
// about
router.get('/about', (req,res)=>{
    res.render('main/about')
})

// news feed
router.get('/news', (req,res)=>{
    res.render('main/news_feed')
})

// faqs
router.get('/faqs', (req,res)=>{
    res.render('main/faqs')
})

// contact us
router.get('/contact', (req,res)=>{
    res.render('main/contact')
})

// sign up
router.get('/register', (req,res)=>{
    res.render('main/register')
})

// sign in
router.get('/login', (req,res)=>{
    res.render('main/login')
})




module.exports = router;