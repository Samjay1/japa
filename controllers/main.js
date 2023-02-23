const express = require('express');

const router = express.Router();

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// home
router.get('/', async (req,res)=>{
    const groups = await prisma.group.findMany({
        include: {
            _count: {
                select: {
                    members: true
                }
            }
        }
    });
    const posts = await prisma.post.findMany();

    console.log(posts)

    res.render('main/index', {
        groups,
        posts
    })

})

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