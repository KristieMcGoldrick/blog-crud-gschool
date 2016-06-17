var express = require('express');
var router = express.Router();
var knex = require('../db/knex');


/* GET users listing. */
router.get('/', function(request, response) {
  knex('users')
    .join('post', 'users.id', 'post.user_id')
    .fullOuterJoin('comment', 'post.id', 'post_id')
    .select()
    .then(function(data) {
      console.log(data);
      response.render('blog', {data: data});
    });
});

router.get('/add', function(request, response) {
  response.render('add');
});

router.get('/:id/edit', function(request, response) {
  knex('post').where({ id: request.params.id }).first()
    .then(function(post) {
      response.render('edit', { post: post});
    });
});

router.put('/:id/edit', function(request, response) {
  knex('post').where({ id: request.params.id }).update(request.body)
    .then(function() {
      response.redirect('/blog/' + request.params.id);
    });
});

//update/delete violates foreign key constraint
router.get('/:id/delete', function(request, response) {
  knex('post').where({ id: request.params.id }).del()
    .then(function() {
      response.redirect('/blog');
    });
});

router.get('/:id', function(request, response) {
  knex('post').where({ id: request.params.id }).first()
    .then(function(post){
      response.render('details', {post: post});
    });
});

router.post('/add', function(request, response) {
  //grab info from body
  knex('users').first().returning('id').insert({ username: request.body.username })

    .then(function(userid) {
      return knex('post').insert({ content: request.body.content, user_id: userid[0] });
    })
    .then(function() {
      response.redirect('/blog');
    })
    .catch(function(error) {
      next(error);
    });
});

module.exports = router;