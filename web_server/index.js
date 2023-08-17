const express = require('express');
const fs = require('fs');

const app = express();

app.get('/index.html', (req, res) => {
  fs.readFile('index.html', (err, data) => {
    if (err) {
      res.status(500).send('Internal Server Error');
    } else {
      res.status(200).send(data);
    }
  });
});

app.use((req, res) => {
  fs.readFile('404.html', (err, data) => {
    if (err) {
      res.status(500).send('Internal Server Error');
    } else {
      res.status(404).send(data);
    }
  });
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});