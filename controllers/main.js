require('dotenv').config();
const express = require('express');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const nodemailer = require('nodemailer');
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
router.get('/about', async (req,res)=>{

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
    res.render('main/about',
    {
        email:req.session.email || null,
        post:posts[0],
        document:documents[0],
        video:videos[0]
    });
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
    // req.session.destroy()
    res.render('main/login', {
        email:req.session.email || null,
        error: req.flash('error'),
        success: req.flash('success')
    });
});


let transporter = nodemailer.createTransport({
    service: 'gmail',
    host: 'smtp.gmail.com',
    authMethod:"PLAIN",
    auth: {
        // type: 'OAuth2',
        // user: process.env.GMAIL, // generated ethereal user
        // pass: process.env.PASS,
        user: 'japa.run.official@gmail.com',
        pass: 'pkeooiqhrddzmgez'
    },            
})

// forgot password
router.all('/forgotpassword',async(req,res)=>{
    if(req.method === 'POST'){
        let email = req.body.email;

        const user = await prisma.user.findUnique({
            where: {
                email
            }
        });
        console.log('user :>> ', user);

        let mailOptions = {
            from: 'no-reply@japa.run',
            to: email,
            subject: 'Password reset request - Japa.run',
            html: `<div style="width: 80%; margin: auto;">

            <img class="size-medium wp-image-4144 aligncenter" src="https://japa.run/wp-content/uploads/2022/11/japalogo-300x44.webp" alt="" width="300" height="44" />
            
            <hr style="border: 1px solid orange;" />
            <p>Hello ${user.username}</p>
            <p>You requested a password reset on your Japa.run Account</p>
            <p>Please click the LINK below to set a new password on your account</p>

            <p> <a href="https://japa.run/reset/${user.id}">https://japa.run/reset/${user.id}</a></p>

            <p>If you did not initiate this request, please ignore this email and contact our Support Team immediately.</p>
           
            <p>Best Regards,</p>
            <p>Japa.Run Team!</p>

            <hr style="border: 1px solid orange;" />
            
            <div style="background-color: gray; padding: 10px 5px; margin-top: 5px; color: white;">
            <div style="text-align: center; color: white;">
            
            Do not hesitate to reach out.
            Message Us at <a style="color: orange;" href="mailto:support@japa.com">support@japa.com</a>
            
            © 2023 Japa.Run - Join the conversation!
            <a style="color: orange;" href="https://japa.run">www.japa.run</a>
            
            </div>
            </div>
            </div>`
          };
          transporter.sendMail(mailOptions, function(error, info){
              if(error){
                res.send('error sending email')
                return;
              }
              else{
                res.send('email sent')
              }
          })
    }else{
        res.render('main/forgotpassword',
        {
            email:req.session.email || null,
            error: req.flash('error'),
            success: req.flash('success')
        })
    }
})


module.exports = router;