const express = require('express');
const moment = require('moment');
const bcrypt = require('bcrypt');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const router = express.Router();

const { PrismaClient } = require('@prisma/client');
const { url } = require('inspector');
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
    let user_id = req.session.user_id;
    console.log('user_id :>> ', user_id);
    const groups =  await prisma.group.findMany({
        where: {
            adminId: user_id,
        },
        include: {
            _count: {
                select: {
                    members: true
                }
            }
        }
    });
    // gets error or success state from redirects from update_group page
    console.log('req.query.status :>> ', req.query.status);
    if(req.query.status == 'true'){ 
        req.flash('success', 'Group has been updated successful');
    }else if(req.query.status == 'false'){ 
        req.flash('error', 'Something went wrong, Try again');
    }

    res.render('main/my_groups', {
        groups,
        email:req.session.email || null,
        error: req.flash('error'),
        success: req.flash('success'),
    })
})


const storage = multer.diskStorage({
    destination: (req, file, callback) => {
      callback(null, path.join('public', 'images', 'uploads', 'groups'))
    },
    filename: (req, file, callback) => {
      const suffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
      callback(null, file.fieldname + '-' + suffix + path.extname(file.originalname))
    }
})


// chats - create group
router.all('/create_group', multer({storage: storage}).single('upload'), async (req,res)=>{
    const {upload, title, description} = req.body;

    if (req.method === 'POST') {
        // const user = await prisma.user.findUnique({
        //     where: {
        //         email: req.session.email
        //     }
        // })

        console.log('req.session.email :>> ', req.session.email);
        const group = await prisma.group.create({
            data: {
                groupName: title,
                description,
                image: req.file.path || undefined,
                admin: {
                    connect: {
                        email: req.session.email
                    }
                },
                type: 'PUBLIC',
            }
        });
        res.redirect(`/preview_chat/${group.id}`)
    }

    res.render('main/add_chat',{
        email:req.session.email || null
    })
})

// chats - update group
router.get('/update_group/:id', async (req,res)=>{

    let group_id = req.params.id;
    let group = await prisma.group.findUnique({
        where: {
            id:group_id,
        },
    })

    console.log('group :>> ', group);

    res.render('main/update_group',{
        email:req.session.email || null,
        group
    })
})

router.post('/update_group', multer({storage: storage}).single('upload'), async(req,res)=>{
    let {group_id, title, description} = req.body;
    let old_image = req.body.old_image || 'none';
   

    console.log(group_id, title, description);
    try {
        if(req.file !== undefined){ //Checks for new image to upload.
             
            if(old_image !== 'none' ){ //Checks if an old image exist
                fs.unlink(old_image, async (err)=>{   //removes old image from local storage
                      //just post image
                      await prisma.group.update({
                        where:{
                            id: group_id,
                        },
                        data: {
                            groupName:title,
                            description,
                            image:req.file.path || undefined,
                        }
                    });
                    })
                    console.log('posting 1')

                    return res.redirect('my_groups/?status=true')
            }else{// when there's no previous image
                    //just post image
                    console.log('posting 2')
                    await prisma.group.update({
                        where:{
                            id: group_id,
                        },
                        data: {
                            groupName:title,
                            description,
                            image:req.file.path || undefined,
                        }
                    });

                    return res.redirect('my_groups/?status=true')
            }
        }else{
            console.log('posting 3')
            await prisma.group.update({
                where:{
                    id: group_id,
                },
                data: {
                    groupName:title,
                    description,
                }
            });
            return res.redirect('my_groups/?status=true')
        }
    } catch (error) {
        return res.redirect('my_groups/?status=false')
    }
})

// settings
router.get('/profile', async (req,res)=>{

    const user = await prisma.user.findUnique({
        where: {
            email: req.session.email
        }
    });

    res.render('main/profile',{
        email:req.session.email || null,
        user
    })
})

// toggle email notifications
router.get('/toggle-email-notifications', async (req, res) => {
    const user = await prisma.user.findUnique({
        where: {
            email: req.session.email
        }
    })

    if(user.emailNotificationStatus === 'ON') {
        const off = await prisma.user.update({
            where: {
                email: req.session.email
            },
            data: {
                emailNotificationStatus: 'OFF'
            }
        })
        return res.redirect('back')
    } 
    else if (user.emailNotificationStatus === 'OFF') {
        const on = await prisma.user.update({
            where: {
                email: req.session.email
            },
            data: {
                emailNotificationStatus: 'ON'
            }
        })
        return res.redirect('back')
    }
})

// toggle group chat notifications
router.get('/toggle-group-notifications', async (req, res) => {
    const user = await prisma.user.findUnique({
        where: {
            email: req.session.email
        }
    })

    if(user.groupNotificationStatus === 'ON') {
        const off = await prisma.user.update({
            where: {
                email: req.session.email
            },
            data: {
                groupNotificationStatus: 'OFF'
            }
        })
        return res.redirect('back')
    } 
    else if (user.groupNotificationStatus === 'OFF')  {
        const on = await prisma.user.update({
            where: {
                email: req.session.email
            },
            data: {
                groupNotificationStatus: 'ON'
            }
        })
        return res.redirect('back')
    }
})

// update password
router.post('/update_password', async (req, res) => {
    const {new_password, repeat_password} = req.body;

    if(new_password !== repeat_password) {
        req.flash('error', 'Passwords do not match')
        return res.redirect('back');
    } else {
        const user = await prisma.user.update({
            where: {
                email: req.session.email
            },
            data: {
                password: await bcrypt.hash(new_password, 12)
            }
        })
        req.flash('success', 'Password reset successfully. Proceed to log in.');
        return res.redirect('/login');
    }
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

// add sub comment
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