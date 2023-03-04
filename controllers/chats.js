const express = require('express');
const moment = require('moment');
const bcrypt = require('bcrypt');

const router = express.Router();

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// chats - all groups
router.get('/', async (req,res)=>{
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
        groups,
        email:req.session.email || null
    })
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
        groups,
        email:req.session.email || null
    });
})

router.get('/preview_chat/:id', async (req,res)=>{
    const id = req.params.id;
    console.log('2 chats req.session.email :>> ', req.session.email);
    
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

    console.log(req.session.email);

    res.render('main/preview_chat', {
        group,
        comments,
        moment,
        email: req.session.email || null

    })
})

// chats - my groups
router.get('/my_groups', async (req,res)=>{
    const user = prisma.user.findUnique({
        where: {
            email: req.session.email
        }, 
        include: {
            groups: true
        }
    });

    res.render('main/chat_group', {
        groups,
        email:req.session.email || null

    })
})

// chats - create group
router.get('/create_group', (req,res)=>{
    res.render('main/chat_group',{
        email:req.session.email || null
    })
})

// settings
router.get('/settings', (req,res)=>{
    res.render('main/chat_group',{
        email:req.session.email || null
    })
})
// notification
router.get('/notification', (req,res)=>{
    res.render('main/chat_group',{
        email:req.session.email || null
    })
})

// add comment
router.post('/add-comment/:id', async (req,res) => {
    const id = req.params.id;
    const {email, comment} = req.body;

    if (req.session.email) {
        const userComment = await prisma.comment.create({
            data: {
                author: {
                    connect: {
                        email: req.session.email
                    }
                },
                body: comment,
                parent: undefined,
                group: {
                    connect: {
                        id
                    }
                },
            }
        });

        const membership = await prisma.member.create({
            data: {
                group: {
                    connect: {
                        id
                    }
                },
                user: {
                    connect: {
                        email: req.session.email
                    }
                }
            }
        })

        return res.redirect(`${req.headers.referer}#${userComment.id}`);
    } else {
        const user = await prisma.user.create({
            data: {
                username: email.split('@')[0],
                email,
                password: await bcrypt.hash(email.split('@')[0], 12),
                comments: {
                    create: {
                        body: comment,
                        parent: undefined,
                        group: {
                            connect: {
                                id
                            }
                        },
                    }
                },
                groups: {
                    connect: {
                        id
                    }
                },
                memberships: {
                    connectOrCreate: {
                        create: {
                            group: {
                                connect: {
                                    id
                                }
                            }
                        },
                        where: {
                            id
                        }
                    }
                }
            }
        })

        const newComment = await prisma.comment.findMany({
            where: {
                author: {
                    email: user.email
                }
            },
            orderBy: {
                createdAt: 'desc'
            },
            take: 1
        })

        req.session.email = user.email;
        return res.redirect(`${req.headers.referer}#${newComment[0].id}`);
    }

})

router.post('/add-subcomment/:id/:groupId', async (req,res) => {
    const {id, groupId} = req.params
    const {email, comment} = req.body;

    if(req.session.email) {
        const subcomment = await prisma.comment.create({
            data: {
                author: {
                    connect: {
                        email: req.session.email
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

        const membership = await prisma.member.create({
            data: {
                group: {
                    connect: {
                        id
                    }
                },
                user: {
                    connect: {
                        email: req.session.email
                    }
                }
            }
        })
        return res.redirect(`${req.headers.referer}#${subcomment.id}`);
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
                },
                memberships: {
                    connectOrCreate: {
                        create: {
                            group: {
                                connect: {
                                    id: groupId
                                }
                            }
                        },
                        where: {
                            id: groupId
                        }
                    }
                }

            }
        });

        const newComment = await prisma.comment.findMany({
            where: {
                author: {
                    email: user.email
                }
            },
            orderBy: {
                createdAt: 'desc'
            },
            take: 1
        })

        req.session.email = user.email;

        return res.redirect(`${req.headers.referer}#${newComment[0].id}`);
    }

});
module.exports = router;