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
router.get('/blogs', (req,res)=>{
    res.render('main/blogs')
})


// documents
router.get('/documents', (req,res)=>{
    res.render('main/documents')
})

// videos
router.get('/videos', (req,res)=>{
    res.render('main/videos')
})



module.exports = router;