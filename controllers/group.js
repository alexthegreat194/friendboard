
const prisma = require('../utils/prisma')
const express = require('express');
const { userInGroup } = require('../utils/prisma');

const router = express.Router()

// middleware to check if user is logged in
router.use(async (req, res, next) => {
    if (req.path.includes('/group')) {
        if (!res.locals.currentUser) {
            return res.redirect('/login');
        }
    }
    next();
});

router.get('/group/:id', async (req, res) => {
    const group = await prisma.group.findFirst({
        where: {
            id: req.params.code
        },
        include: {
            owner: {
                include: {
                    profile: true
                }
            },
            usersInGroups: {
                include: {
                    user: true,
                    group: true
                }
            }
        }
    });

    if (!group) {
        console.log('group not found')
        return res.redirect('/dashboard')
    }

    console.log('group found')
    //check if user is in group
    let inGroup = false;
    group.usersInGroups.forEach(userInGroup => {
        // console.log('userInGroup: ', userInGroup)
        if (userInGroup.userId == res.locals.currentUser.id) {
            inGroup = true;
        }
    });

    if (!inGroup) {
        console.log('user not in group')
        return res.redirect('/dashboard')
    }

    const events = await prisma.event.findMany({
        where: {
            groupId: group.id
        },
        include: {
            group: true,
            creator: {
                include: {
                    profile: true
                }
            },
            attendees: {
                include: {
                    user: {
                        include: {
                            profile: true
                        }
                    }
                }
            }
        },
    }); 

    events.map(event => {
        event.isOwner = event.creator.id == res.locals.currentUser.id;
        event.profiles = [];
        event.isAttending = false;
        event.attendees.map(attendee => {
            event.profiles.push(attendee.user.profile);
            if (attendee.user.id == res.locals.currentUser.id){
                event.isAttending = true;
            }
        });
    });

    // console.log(events)

    const shoppingLists = await prisma.shoppingList.findMany({
        where: {
            groupId: group.id
        },
        include: {
            group: true,
            creator: {
                include: {
                    profile: true
                }
            },
            items: {
                include: {
                    creator: {
                        include: {
                            profile: true
                        }
                    }
                },
            }
        }
    });

    console.table(shoppingLists[0].items)

    res.render('group', {
        group, events, shoppingLists
    });

});
    
router.post('/group/:id/events/new', async (req, res) => {

    const data = req.body;
    const groupId = parseInt(req.params.id);

    if(!data.name || !data.description || !data.date) {
        console.log('no name or description or date')
        return res.redirect(`/group/${groupId}`)
    }

    const event = await prisma.event.create({
        data: {
            name: data.name,
            description: data.description,
            date: new Date(data.date),
            groupId: groupId,
            creatorId: res.locals.currentUser.id,
        }
    });

    console.log('event created')

    const eventAttending = await prisma.eventAttending.create({
        data: {
            eventId: event.id,
            userId: res.locals.currentUser.id,
        }
    });

    console.log('added user to event')

    res.redirect(`/group/${groupId}`)
});

router.get('/group/:id/events/:eventId/delete', async (req, res) => {
    
    const groupId = parseInt(req.params.id);
    const eventId = parseInt(req.params.eventId);

    const event = await prisma.event.findFirst({
        where: {
            id: eventId
        }
    });

    if (!event) {
        console.log('event not found')
        return res.redirect(`/group/${groupId}`)
    }

    if(event.creatorId != res.locals.currentUser.id) {
        console.log('user not creator')
        return res.redirect(`/group/${groupId}`)
    }
    
    await prisma.eventAttending.deleteMany({
        where: {
            eventId: eventId
        }
    });

    console.log('event attending deleted')

    await prisma.event.delete({
        where: {
            id: eventId
        }
    });

    console.log('event deleted')


    res.redirect(`/group/${groupId}`)
});

router.get('/group/:id/events/:eventId/join', async (req, res) => {

    const groupId = parseInt(req.params.id);
    const eventId = parseInt(req.params.eventId);

    const event = await prisma.event.findFirst({
        where: {
            id: eventId
        }
    });

    if (!event) {
        console.log('event not found')
        return res.redirect(`/group/${groupId}`)
    }

    // check to see if user is already attending

    const eventAttendingCheck = await prisma.eventAttending.findFirst({
        where: {
            eventId: eventId,
            userId: res.locals.currentUser.id
        }
    });

    if (eventAttendingCheck) {
        console.log('user already attending')
        return res.redirect(`/group/${groupId}`)
    }

    const eventAttending = await prisma.eventAttending.create({
        data: {
            eventId: event.id,
            userId: res.locals.currentUser.id,
        }
    });

    console.log('added user to event')

    res.redirect(`/group/${groupId}`)
});

router.get('/group/:id/events/:eventId/leave', async (req, res) => {

    const groupId = parseInt(req.params.id);
    const eventId = parseInt(req.params.eventId);

    const event = await prisma.event.findFirst({
        where: {
            id: eventId
        }
    });

    if (!event) {
        console.log('event not found')
        return res.redirect(`/group/${groupId}`)
    }

    // check to see if user is already attending
    const eventAttending = await prisma.eventAttending.findFirst({
        where: {
            eventId: eventId,
            userId: res.locals.currentUser.id
        }
    });

    if (!eventAttending) {
        console.log('user not attending')
        return res.redirect(`/group/${groupId}`)
    }

    await prisma.eventAttending.delete({
        where: {
            id: eventAttending.id
        }
    });

    console.log('removed user from event')

    res.redirect(`/group/${groupId}`)
});


module.exports = router;