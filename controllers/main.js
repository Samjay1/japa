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

let transporter = nodemailer.createTransport({
    service: 'gmail',
    host: 'smtp.gmail.com',
    authMethod:"PLAIN",
    auth: {
        user: 'japa.run.official@gmail.com',
        pass: 'pkeooiqhrddzmgez'
    },            
})

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
            console.log('user :>> ', user);
            let mailOptions = {
                from: 'no-reply@japa.run',
                to: email,
                subject: 'Welcome to Japa.run',
                html: `<div style="width: 80%; margin: auto;">

                <img class="size-medium wp-image-4144 aligncenter" src="https://japa.run/wp-content/uploads/2022/11/japalogo-300x44.webp" alt="" width="300" height="44" />
                
                <hr style="border: 1px solid orange;" />
                
                <h5>Welcome ${username},</h5>
                <pre><strong>Thank you for registering on "Japa.Run - Join the conversation..."!.</strong> </pre>  
                
                Please click <a style="color: orange;" href="https://japa.run/login/">login</a> to open your account.
                
                At <a style="color: orange;" href="https://japa.run/"><strong>JAPA.RUN</strong></a>
                , we believe there is no limit to the potential of young Africans. 
                <a style="color: orange;" href="https://japa.run/"><strong>JAPA.RUN</strong></a>
                 is a platform for young Africans to learn, share and grow together. It is a resource for those looking to take the
                  next step by pursuing education or seeking opportunities abroad. We believe there is a more valuable way forward 
                  where young Africans utilize technology to breakdown barriers. Rather than forging ahead alone, 
                  
                  <a style="color: orange;" href="https://japa.run/"><strong>JAPA.RUN</strong></a>
                enables young Africans to leverage the knowledge of and create community with those who have come before them and 
                those on similar paths. We are passionate about the potential of young Africans, and our mission is to actualize it.
                
                <strong>If you have any questions you check out our <a style="color: orange;" href="https://japa.run/faqs/">FAQs</a> page.</strong>
                
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
                    console.log('error email',error)
                    return res.render('main/login', {
                        email: null,
                        error: 'Failed to login. Please try again',
                        success: req.flash('success')
                    });
                  }
                  else{
                    console.log('success email')
                    return res.render('main/login', {
                        email: null,
                        error: req.flash('error'),
                        success: 'Account successfully created. Proceed to log in.'
                    });
                  }
              })
        } catch (error) {
            console.log('catch error',error);
            return  res.render('main/login', {
                email: null,
                error: 'Email already in use. Try login',
                success: req.flash('success')
            });
        }
    }else{
         res.render('main/register',
            { email:req.session.email || null});
    }
   
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
                req.session.user_id = user.id;
                req.session.username = user.username;
                console.log('req.session.email :>> ',user.id, req.session.email);
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



// forgot password
router.all('/forgotpassword',async(req,res)=>{
    if(req.method === 'POST'){
        let email = req.body.email;

        const user = await prisma.user.findUnique({
            where: {
                email
            }
        });
        // console.log('user :>> ', user);
        if(user === null){
            return res.render('main/forgotpassword',
            {
                email:req.session.email || null,
                error: 'Email not registered with Japa.run',
                success: req.flash('success')
            })
        }

        let mailOptions = {
            from: 'no-reply@japa.run',
            to: email,
            subject: 'Password reset request - Japa.run',
            html: `<div style="width: 80%; margin: auto;">

            <img class="size-medium wp-image-4144 aligncenter" src="https://japa.run/wp-content/uploads/2022/11/japalogo-300x44.webp" alt="" width="300" height="44" />
            
            <hr style="border: 1px solid orange;" />
            <p>Hello ${user.username},</p>
            <p>You requested a password reset on your Japa.run Account</p>
            <p>Please click the LINK below to set a new password on your account</p>

            <p> <a href="localhost:8040/reset/${user.id}">https://japa.run/reset/${user.id}</a></p>

            <p>If you did not initiate this request, please ignore this email and contact our Support Team immediately.</p>
           
            Best Regards, <br>
            Japa.Run Team!

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
                return res.render('main/forgotpassword',
                {
                    email:req.session.email || null,
                    error: 'Failed to send Password Reset Link',
                    success: req.flash('success')
                })
              }
              else{
                return res.render('main/forgotpassword',
                    {
                        email:req.session.email || null,
                        error: req.flash('error'),
                        success: 'Password Reset Link sent to your email.'
                    })
              }
          })
    }else{
        return res.render('main/forgotpassword',
        {
            email:req.session.email || null,
            error: req.flash('error'),
            success: req.flash('success')
        })
    }
})

// Reset password
router.get('/reset/:id',(req,res)=>{
   let user_id = req.params.id;
   console.log('user_id :>> ', user_id);
    return res.render('main/resetpassword',
    {
        email:req.session.email || null,
        user_id,
        error: req.flash('error'),
        success: req.flash('success')
    })
 
})
// Reset password
router.post('/resetpassword',async(req,res)=>{
    let user_id = req.body.user_id;
    let password = req.body.password;
    let repeat_password = req.body.repeatpassword;
    console.log(user_id, password,repeat_password);
    if(password.length <= 5){
        console.log('Passwords must be more than 6 characters (include symbols !@#$ etc.)')
        return res.render('main/resetpassword',
        {
            email:req.session.email || null,
            user_id,
            error: "Passwords must be more than 6 characters (include symbols !@#$ etc.)",
            success: req.flash('success')
        })
    }
    if(password!==repeat_password){
        return res.render('main/resetpassword',
        {
            email:req.session.email || null,
            user_id,
            error: "Passwords must be the same",
            success: req.flash('success')
        })
    }
    else{
        console.log('works')
        const user = await prisma.user.update({
            where:{
                id: user_id,
            },
            data: {
                password: await bcrypt.hash(password, 12),
            }
        });
        if(user.id === user_id){
            return res.render('main/forgotpassword',
        {
            email:req.session.email || null,
            user_id,
            error: req.flash('error'),
            success: 'Password Reset successful'
        })
        }

        console.log('user :>> ', user);
    }
    
})

// subscribers
router.post('/subscriber',async(req,res)=>{
    let email = req.body.email;
    if(email.length <= 0){
        return res.render('main/message',
        {
            email:req.session.email || null,
            error: "Please enter a valid email",
            success: req.flash('success')
        })
    }
    try {
        await prisma.subscriber.create({
            data: {
              email: email,
            },
          })

            return res.render('main/message',
            {
                email:req.session.email || null,
                error: req.flash('error'),
                success: 'Welcome to the Japa.run Community, Subscription Successful.'
            })
    } catch (error) {
        return res.render('main/message',
            {
                email:req.session.email || null,
                error: "Welcome to Japa.run Community",
                success: req.flash('success')
            })
    }
})


module.exports = router;