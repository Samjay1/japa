const express = require('express');
const bcrypt = require('bcrypt');
const moment = require('moment');

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
router.all('/preview_blog/:id', async (req,res)=>{
    const id = req.params.id;
    const {email, comment} = req.body;

    if (req.method === 'POST') {
        if (req.session.email) {
            const postComment = await prisma.postComment.create({
                data: {
                    body: comment,
                    author: {
                        connect: {
                            email: req.session.email
                        }
                    },
                    post: {
                        connect: {
                            id
                        }
                    }
                }
            })

            return res.redirect(`/preview_blog/${id}#${postComment.id}`)
        } else {
            const user = await prisma.user.create({
                data: {
                    username: email.split('@')[0],
                    email,
                    password: await bcrypt.hash(email.split('@')[0], 12),
                    postComments: {
                        create: {
                            body: comment,
                            post: {
                                connect: {
                                    id
                                }
                            }
                        }
                    }
                }
            });

            const newComment = await prisma.postComment.findMany({
                where: {
                    author: {
                        email
                    }
                },
                orderBy: {
                    createdAt: 'desc'
                },
                take: 1
            });

            req.session.email = user.email;
            return res.redirect(`/preview_blog/${id}#${newComment[0].id}`)
        }
    }

    const post = await prisma.post.findFirst({
        where: {
            id
        },
        include: {
            comments: {
                include: {
                    author: {
                        select: {
                            username: true
                        }
                    }
                }
            }
        }
    })

    console.log(post)

    res.render('main/preview_blog',{
        email:req.session.email || null,
        post,
        moment
    })
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
router.all('/preview_document/:id', async (req,res)=>{
    const id = req.params.id;
    const {email, comment} = req.body;

    if (req.method === 'POST') {
        if (req.session.email) {
            const docComment = await prisma.documentComment.create({
                data: {
                    body: comment,
                    author: {
                        connect: {
                            email: req.session.email
                        }
                    },
                    document: {
                        connect: {
                            id
                        }
                    }
                }
            })

            return res.redirect(`/preview_document/${id}#${docComment.id}`)
        } else {
            const user = await prisma.user.create({
                data: {
                    username: email.split('@')[0],
                    email,
                    password: await bcrypt.hash(email.split('@')[0], 12),
                    documentComments: {
                        create: {
                            body: comment,
                            document: {
                                connect: {
                                    id
                                }
                            }
                        }
                    }
                }
            });

            const newComment = await prisma.documentComment.findMany({
                where: {
                    author: {
                        email
                    }
                },
                orderBy: {
                    createdAt: 'desc'
                },
                take: 1
            });

            req.session.email = user.email;
            return res.redirect(`/preview_document/${id}#${newComment[0].id}`)
        }
    }

    const doc = await prisma.document.findFirst({
        where: {
            id
        },
        include: {
            comments: {
                include: {
                    author: {
                        select: {
                            username: true
                        }
                    }
                }
            }
        }
    })
    res.render('main/preview_document',{
        email:req.session.email || null,
        doc,
        moment
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
router.all('/preview_video/:id', async (req,res)=>{
    const id = req.params.id;
    const {email, comment} = req.body;

    if (req.method === 'POST') {
        if (req.session.email) {
            const videoComment = await prisma.videoComment.create({
                data: {
                    body: comment,
                    author: {
                        connect: {
                            email: req.session.email
                        }
                    },
                    video: {
                        connect: {
                            id
                        }
                    }
                }
            })

            return res.redirect(`/preview_video/${id}#${videoComment.id}`)
        } else {
            const user = await prisma.user.create({
                data: {
                    username: email.split('@')[0],
                    email,
                    password: await bcrypt.hash(email.split('@')[0], 12),
                    videoComments: {
                        create: {
                            body: comment,
                            video: {
                                connect: {
                                    id
                                }
                            }
                        }
                    }
                }
            });

            const newComment = await prisma.videoComment.findMany({
                where: {
                    author: {
                        email
                    }
                },
                orderBy: {
                    createdAt: 'desc'
                },
                take: 1
            });

            req.session.email = user.email;
            return res.redirect(`/preview_video/${id}#${newComment[0].id}`)
        }
    }

    const vid = await prisma.video.findFirst({
        where: {
            id
        },
        include: {
            comments: {
                include: {
                    author: {
                        select: {
                            username: true
                        }
                    }
                }
            }
        }
    })

    res.render('main/preview_video',{
        email:req.session.email || null,
        vid,
        moment
    })
})


module.exports = router;