const express = require('express');
const moment = require('moment');

const router = express.Router();

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// chats - all groups
router.get('/', (req,res)=>{
    res.render('main/chat_group')
})

router.get('/chats', async (req,res)=>{
    const groups =  await prisma.group.findMany({
        include: {
            _count: {
                select: {
                    members: true
                }
            }
        }
    });

    console.log(groups);

    res.render('main/chat_group', {
        groups
    });
})

router.get('/preview_chat/:id', async (req,res)=>{
    const id = req.params.id;

    const group = await prisma.group.findFirst({
        where: {
            id
        },
        include: {
            _count: {
                select: {
                    members: true,
                    comments: true
                }
            },
            // comments: {
            //     include: {
            //         childComments: true
            //     }
            // }
        }
    });

    const comments = await prisma.comment.findMany({
        where: {
            groupId: id
        },

        include: {
            childComments: {
                include: {
                    _count: {
                        select: {
                            childComments: true
                        }
                    },
                    author: {
                        select: {
                            username: true
                        }
                    },
                    childComments: {
                        include: {
                            author: {
                                select: {
                                    username: true
                                }
                            }
                        }
                    }
                }
            },
            _count: {
                select: {
                    childComments: true
                }
            },
            author: {
                select: {
                    username: true
                }
            }
        }
    })

    // console.log(group);
    console.log(comments);

    res.render('main/preview_chat', {
        group,
        comments,
        moment
    })
})

// chats - my groups
router.get('/my_groups', async (req,res)=>{
    const user = prisma.user.findUnique({
        where: {
            email: req.session.user
        }
    });

    const groups = prisma.group.findMany({
        where: {
            members: {
                some: {
                    id: user.id
                }
            }
        }
    })

    console.log()
    res.render('main/chat_group', {
        groups
    })
})

// chats - create group
router.get('/create_group', (req,res)=>{
    res.render('main/chat_group')
})

// settings
router.get('/settings', (req,res)=>{
    res.render('main/chat_group')
})
// notification
router.get('/notification', (req,res)=>{
    res.render('main/chat_group')
})


module.exports = router;