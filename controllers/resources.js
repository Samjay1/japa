const express = require('express');

const router = express.Router();




// resources-main
router.get('/resources', (req,res)=>{
    res.render('main/resource_center')
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