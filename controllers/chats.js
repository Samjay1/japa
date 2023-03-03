const express = require('express');
const moment = require('moment');
const bcrypt = require('bcrypt');

const router = express.Router();

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// chats - all groups
router.get('/', (req,res)=>{
    res.render('main/chat_group')
})

router.get('/chats', async (req,res)=>{
    console.log('chats req.session.email :>> ', req.session.email);
    const groups =  await prisma.group.findMany({
        include: {
            _count: {
                select: {
                    members: true
                }
            }
        }
    });

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

// add comment
router.post('/add-comment/:id', async (req,res) => {
    const id = req.params.id;
    const body = req.body.comment;

    const comment = await prisma.comment.create({
        data: {
            author: {
                connect: {
                    id: '63fa4193ffc61692d5b8f15c'
                }
            },
            body,
            parent: undefined,
            group: {
                connect: {
                    id
                }
            }
        }
    });

    res.redirect('back');
})

router.post('/add-subcomment/:id/:groupId', async (req,res) => {
    const {id, groupId} = req.params
    const {email, comment} = req.body;

    console.log(email.split('@')[0]);

    if(req.session.user) {
        const subcomment = await prisma.comment.create({
            data: {
                author: {
                    connect: {
                        email: req.session.user
                    }
                },
                parent: {
                    connect: {
                        id
                    }
                },
                body: comment
            }
        })
    } else {

        const user = await prisma.user.create({
            data: {
                username: email.split('@')[0],
                email,
                password: await bcrypt.hash(email.split('@')[0], 12),
                comments: {
                    create: {
                        parent: {
                            connect: {
                                id,
                            }
                        },
                        body: comment,
                        group: {
                            connect: {
                                id: groupId
                            }
                        }
                    }
                },
                groups: {
                    connect: {
                        id: groupId
                    }
                }

            }
        })

        return res.redirect('back');
    }

});
module.exports = router;