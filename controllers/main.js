require('dotenv').config();
const express = require('express');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const bcrypt = require('bcrypt');

const app = express();
const router = express.Router();

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();


// home
router.get('/home', async (req,res)=>{
    const groups = await prisma.group.findMany({
        include: {
            _count: {
                select: {
                    members: true
                }
            }
        }
    });
    const posts = await prisma.post.findMany({
        orderBy: {
            createdAt: 'desc',
        },
        take: 1,
      });
      console.log('POSTS :>> ', posts);
    const documents = await prisma.document.findMany({
         orderBy: {
        createdAt: 'desc',
    },
    take: 1,
      });
    const videos = await prisma.video.findMany({
        orderBy: {
            createdAt: 'desc',
        },
        take: 1,
      })

    res.render('main/index', {
        email:req.session.email || null,
        groups,
        post:posts[0],
        document:documents[0],
        video:videos[0]
    });
});

// about
router.get('/about', (req,res)=>{
    res.render('main/about',
    {email:req.session.email || null});
});

// news feed
router.get('/news', (req,res)=>{
    res.render('main/news_feed',
    {email:req.session.email || null});
});

// faqs
router.get('/faqs', (req,res)=>{
    res.render('main/faqs',
    {email:req.session.email || null});
});

// contact us
router.get('/contact', (req,res)=>{
    res.render('main/contact',{
        email:req.session.email || null
    });
});

// sign up
router.all('/register', async (req,res)=>{
    if (req.method === 'POST') {
        const { username, email, password } = req.body;

        try {
            const user = await prisma.user.create({
                data: {
                    username,
                    email,
                    password: await bcrypt.hash(password, 12),
                }
            });

            req.flash('success', 'Account successfully created. Proceed to log in.');
            return res.redirect('/login#success');
        } catch (error) {
            console.log(error);
        }
    }
    res.render('main/register',
    { email:req.session.email || null});
});

// sign in
router.all('/login', async (req,res)=>{
    req.session.destroy()
    if (req.method === 'POST') {
        const { email, password } = req.body;

        try {
            const user = await prisma.user.findUnique({
                where: {
                    email
                }
            });

            if(!user){
                req.flash('error', 'No such user');
                return res.redirect('/login#error');
            }

            if(user && !await bcrypt.compare(password, user.password)){
                req.flash('error', 'Password is incorrect');
                return res.redirect('/login#error');
            } else{
                req.session.email = user.email;
                console.log('req.session.email :>> ', req.session.email);
                return res.redirect('/chats');
            }

        } catch (error) {
            console.log(error);
        }
    }
    res.render('main/login', {
        email:req.session.email || null,
        error: req.flash('error'),
        success: req.flash('success')
    });
});


module.exports = router;