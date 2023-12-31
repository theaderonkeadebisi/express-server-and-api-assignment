const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const { apiKeyAuth, ValidateUserCreation, authorizeAdmin } = require('./users/users.middleware');
const usersRouter = require('./users/users.router');

const usersDbPath = path.join(__dirname, 'users', 'users.json');
const itemsDbPath = path.join(__dirname, 'items.json');
let itemsDB = [];
let usersDB = [];

const secretKey = '1234';

app.use(express.json());
app.use(apiKeyAuth);
app.use(ValidateUserCreation);
app.use('/users', usersRouter);


app.get('/items', apiKeyAuth, getAllItems);
app.post('/items', apiKeyAuth, authorizeAdmin, addItem);
app.put('/items/:id', apiKeyAuth, authorizeAdmin, updateItem);
app.delete('/items/:id', apiKeyAuth, authorizeAdmin, deleteItem);

function getAllItems(req, res) {
    fs.readFile(itemsDbPath, 'utf8', (err, items) => {
        if (err) {
            console.log(err);
            res.status(500).json({ message: 'An error occurred' });
        }
        res.json(JSON.parse(items));
    });
}

function addItem(req, res) {
    const newItem = req.body;
    const lastItem = itemsDB[itemsDB.length - 1];
    newItem.id = lastItem ? lastItem.id + 1 : 1;

    itemsDB.push(newItem);
    fs.writeFile(itemsDbPath, JSON.stringify(itemsDB), (err) => {
        if (err) {
            console.log(err);
            res.status(500).json({ message: 'Internal Server Error. Could not save item to database.' });
        }
        res.json(newItem);
    });
}

function updateItem(req, res) {
    const itemId = parseInt(req.params.id);
    const updatedItem = req.body;

    const itemIndex = itemsDB.findIndex(item => item.id === itemId);
    if (itemIndex === -1) {
        res.status(404).json({ message: 'Item not found' });
        return;
    }

    itemsDB[itemIndex] = { ...itemsDB[itemIndex], ...updatedItem };

    fs.writeFile(itemsDbPath, JSON.stringify(itemsDB), err => {
        if (err) {
            console.log(err);
            res.status(500).json({ message: 'Internal Server Error. Could not update item in database.' });
        }
        res.json(itemsDB[itemIndex]);
    });
}

function deleteItem(req, res) {
    const itemId = parseInt(req.params.id);
    const itemIndex = itemsDB.findIndex(item => item.id === itemId);

    if (itemIndex === -1) {
        res.status(404).json({ message: 'Item not found' });
        return;
    }

    itemsDB.splice(itemIndex, 1);

    fs.writeFile(itemsDbPath, JSON.stringify(itemsDB), err => {
        if (err) {
            console.log(err);
            res.status(500).json({ message: 'Internal Server Error. Could not delete item from database.' });
        }
        res.json({ message: 'Item deleted' });
    });
}

const PORT = 6000;
const HOST_NAME = 'localhost';

app.listen(PORT, HOST_NAME, () => {
    itemsDB = JSON.parse(fs.readFileSync(itemsDbPath, 'utf8'));
    usersDB = JSON.parse(fs.readFileSync(usersDbPath, 'utf8'));
    console.log(`Server is listening on ${HOST_NAME}:${PORT}`);
});