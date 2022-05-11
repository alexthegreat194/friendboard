
const express = require('express');
const prisma = require('../utils/prisma');

const router = express.Router();

router.post('/group/:id/shoppinglist/new', async (req, res) => {
    
    const data = req.body;
    const groupId = parseInt(req.params.id);

    if (!data.name) {
        return res.redirect(`/group/${groupId}`)
    }

    const group = await prisma.group.findFirst({
        where: {
            id: groupId
        }
    });

    if (!group) {
        console.log('no group');
        return res.redirect('/dashboard');
    }
    
    const shoppingList = await prisma.shoppingList.create({
        data: {
            name: data.name,
            groupId: groupId,
            creatorId: res.locals.currentUser.id,
        }
    });

    console.log('shopping list created')

    res.redirect(`/group/${groupId}`)
            
});

router.post('/group/:id/shoppinglist/:listId/item/new', async (req, res) => {
    const data = req.body;
    const groupId = parseInt(req.params.id);
    const listId = parseInt(req.params.listId);

    console.log(data)

    if(!data.name || !data.amount) {
        console.log('no name or quantity')
        return res.redirect(`/group/${groupId}`)
    }

    // check to see if group exists
    const group = await prisma.group.findFirst({
        where: {
            id: groupId
        }
    });

    if (!group) {
        console.log('no group');
        return res.redirect('/dashboard');
    }

    // check to see if shopping list exists
    const shoppingList = await prisma.shoppingList.findFirst({
        where: {
            id: listId
        }
    });

    if (!shoppingList) {
        console.log('no shopping list');
        return res.redirect(`/group/${groupId}`)
    }

    const item = await prisma.shoppingListItem.create({
        data: {
            name: data.name,
            quantity: parseInt(data.amount),
            creatorId: res.locals.currentUser.id,
            shoppingListId: listId,
            groupId: groupId,
        }
    });

    console.log('item created')

    res.redirect(`/group/${groupId}`)
});

router.get('/group/:id/shoppinglist/:listId/item/:itemId/delete', async (req, res) => {
    const groupId = parseInt(req.params.id);
    const listId = parseInt(req.params.listId);
    const itemId = parseInt(req.params.itemId);

    const group = await prisma.group.findFirst({
        where: {
            id: groupId
        }
    });

    if (!group) {
        console.log('no group');
        return res.redirect('/dashboard');
    }

    const shoppingList = await prisma.shoppingList.findFirst({
        where: {
            id: listId
        }
    });

    if (!shoppingList) {
        console.log('no shopping list');
        return res.redirect(`/group/${groupId}`)
    }

    const item = await prisma.shoppingListItem.findFirst({
        where: {
            id: itemId
        }
    });

    if (!item) {
        console.log('no item');
        return res.redirect(`/group/${groupId}`)
    }

    await prisma.shoppingListItem.delete({
        where: {
            id: itemId
        }
    });

    console.log('item deleted')

    res.redirect(`/group/${groupId}`)
});

router.get('/group/:id/shoppinglist/:listId/delete', async (req, res) => {
    const groupId = parseInt(req.params.id);
    const listId = parseInt(req.params.listId);

    const group = await prisma.group.findFirst({
        where: {
            id: groupId
        }
    });

    if (!group) {
        console.log('no group');
        return res.redirect('/dashboard');
    }

    const shoppingList = await prisma.shoppingList.findFirst({
        where: {
            id: listId
        }
    });

    if (!shoppingList) {
        console.log('no shopping list');
        return res.redirect(`/group/${groupId}`)
    }

    await prisma.shoppingListItem.deleteMany({
        where: {
            shoppingListId: listId
        }
    });

    await prisma.shoppingList.delete({
        where: {
            id: listId
        }
    });

    console.log('list deleted')

    res.redirect(`/group/${groupId}`)
});
module.exports = router;