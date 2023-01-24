const express = require('express');
const app = express();
const fs = require('fs');
const path = require('path');
app.use(express.json({ limit: '50mb' }));
app.use(express.static(path.join(__dirname, 'client')));

const postsFileName = './posts.json';
const commentsFileName = './comments.json';

// eslint-disable-next-line prefer-const
let posts = require(postsFileName);
// eslint-disable-next-line prefer-const
let comments = require(commentsFileName);

app.post('/posts/new', function (req, resp) {
  const postData = req.body;
  posts.unshift(postData);
  comments.unshift([]);
  fs.writeFileSync(postsFileName, JSON.stringify(posts));
  fs.writeFileSync(commentsFileName, JSON.stringify(comments));
  resp.send(posts);
});

app.post('/comments/new', function (req, resp) {
  const commentData = req.body;
  comments[req.query.index].push(commentData);
  fs.writeFileSync(commentsFileName, JSON.stringify(comments));
  resp.send(comments[req.query.index]);
});

app.post('/likes', function (req, resp) {
  posts[req.query.index].likes = req.query.likes;
  fs.writeFileSync(postsFileName, JSON.stringify(posts));
  resp.send(posts[req.query.index].likes);
});

app.get('/posts', function (req, resp) {
  if (req.query.index) {
    resp.send(posts[req.query.index]);
  } else {
    resp.send(posts);
  }
});

app.get('/comments', function (req, resp) {
  if (req.query.index) {
    resp.send(comments[req.query.index]);
  } else {
    resp.send(comments);
  }
});

app.get('/search', function (req, resp) {
  // eslint-disable-next-line prefer-const
  let foundPosts = [];
  // eslint-disable-next-line prefer-const
  let indexes = [];
  const query = req.query.search.toLowerCase();
  for (let i = 0; i < posts.length; i++) {
    if (posts[i].name.toLowerCase().includes(query) || posts[i].text.toLowerCase().includes(query)) {
      foundPosts.push(posts[i]);
      indexes.push(i);
    }
  }
  const data = {
    foundPosts,
    indexes
  };
  resp.send(data);
});

module.exports = app;
