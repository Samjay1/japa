const express = require('express');

const router = express.Router();

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();




// resources-main
router.get('/resources', async (req,res)=>{
    const posts = await prisma.post.findMany();

    res.render('main/resource_center', {
        posts,
        email:req.session.email || null
    });
})

// preview blog
router.get('/preview_blog/:id', async (req,res)=>{
    res.render('main/preview_blog',
    {email:req.session.email || null})
})


// documents
router.get('/documents', async (req,res)=>{
    const docs = await prisma.document.findMany();
    
    res.render('main/documents', {
        docs,
        email:req.session.email || null
    })
})

// preview document
router.get('/preview_document/:id', async (req,res)=>{
    res.render('main/preview_document',{
        email:req.session.email || null
    })
})

// videos
router.get('/videos', async (req,res)=>{
    const videos = await prisma.video.findMany();

    res.render('main/videos', {
        videos,
        email:req.session.email || null
    })
})


// preview video
router.get('/preview_video/:id', async (req,res)=>{
    res.render('main/preview_video',{
        email:req.session.email || null
    })
})


module.exports = router;