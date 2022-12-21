const express = require('express');
const app = express();
const fs = require('fs');
const path = require('path');
app.use(express.json({ limit: '50mb' }));
app.use(express.static(path.join(__dirname, 'client')));

const JSONfileName = './posts.json';

// eslint-disable-next-line prefer-const
let posts = require(JSONfileName);

app.post('/uploadPost', function (req, resp) {
  const postData = req.body;
  posts.unshift(postData);
  fs.writeFileSync(JSONfileName, JSON.stringify(posts));
  resp.send(posts);
});

app.get('/posts', function (req, resp) {
  resp.send(posts);
});

app.listen(8080);
