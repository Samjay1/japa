const express = require('express');

const router = express.Router();

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();




// resources-main
router.get('/resources', async (req,res)=>{
    const posts = await prisma.post.findMany();

    res.render('main/resource_center', {
        posts
    });
})

// blog
router.get('/blogs', async (req,res)=>{
    res.render('main/blogs')
})


// documents
router.get('/documents', async (req,res)=>{
    const docs = await prisma.document.findMany();
    
    res.render('main/documents', {
        docs
    })
})

// videos
router.get('/videos', async (req,res)=>{
    const videos = await prisma.video.findMany();

    res.render('main/videos', {
        videos
    })
})



module.exports = router;