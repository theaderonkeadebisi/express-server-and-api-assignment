const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();

const itemsDbPath = path.join(__dirname, 'items.json');
let itemsDB = [];

app.use(express.json());

app.get('/items', getAllItems);
app.post('/items', addItem);
app.put('/items/:id', updateItem);
app.delete('/items/:id', deleteItem);

app.use((req, res) => {
    res.status(404).json({ message: 'Method Not Supported' });
});

function getAllItems(req, res) {
    fs.readFile(itemsDbPath, 'utf8', (err, items) => {
        if (err) {
            console.log(err);
            res.status(400).json({ message: 'An error occurred' });
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
    console.log(`Server is listening on ${HOST_NAME}:${PORT}`);
});