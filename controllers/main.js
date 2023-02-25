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
    const posts = await prisma.post.findMany();

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

            return res.redirect('/login');
        } catch (error) {
            console.log(error);
        }
    }
    res.render('main/register')
})

// sign in
router.all('/login', async (req,res)=>{
    if (req.method === 'POST') {
        const { email, password } = req.body;

        try {
            const user = await prisma.user.findUnique({
                where: {
                    email
                }
            });

            if(!user){
                console.log('No such user')
                return res.render('main/login',{
                    error: 'No such user'
                });
            }

            if(user && !await bcrypt.compare(password, user.password)){
                console.log('Password is incorrect');
                return res.render('main/login',{
                    error: 'Password is incorrect'
                })
            } else{
                req.session.email = user.email;
                return res.redirect('/');
            }

        } catch (error) {
            console.log(error)
        }
    }
    res.render('main/login')
})




module.exports = router;