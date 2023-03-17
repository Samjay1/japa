const express = require('express');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

const router = express.Router();

// add users
router.post('/add-users', async (req, res) => {
    const {email, username} = req.body;

    try {
        const user = await prisma.user.create({
            data: {
                email,
                username,
                password: await bcrypt.hash(email.split('@')[0], 12)
            }
        });

        return res.status(201).json(user);
    } catch (error) {
        return res.status(400).json(error.message);
    }
});


// add groups
router.post('/add-groups', async (req, res) => {
    const {groupName, description, admin, image} = req.body;

    try {
        const group = await prisma.group.create({
            data: {
                groupName,
                description,
                admin: {
                    connect: {
                        email: admin
                    }
                },
                image
            }
        });

        return res.status(201).json(group);
    } catch (error) {
        return res.status(400).json(error.message);
    }
});

// add group comment
router.post('/add-comments', async (req, res) => {
    const {body, author, groupName} = req.body;

    try {
        const comment = await prisma.comment.create({
            data: {
                body,
                author: {
                    connect: {
                        email: author
                    }
                },
                group: {
                    connect: {
                        groupName: groupName
                    }
                }           
            }
        });

        return res.status(201).json(comment);
    } catch (error) {
        return res.status(400).json(error.message)
    }
})


// add sub-comment
router.post('/add-subcomments', async (req, res) => {
    const {body, author, groupName, parent} = req.body;

    try {
        const subcomment = await prisma.comment.create({
            data: {
                body,
                author: {
                    connect: {
                        email: author
                    }
                },
                group: {
                    connect: {
                        groupName
                    }
                },
                parent: {
                    connect: {
                        id: parent
                    }
                }
            }
        });

        return res.status(201).json(subcomment);
    } catch (error) {
        return res.status(400).json(error.message);
    }
})


module.exports = router;
