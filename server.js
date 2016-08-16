var express = require('express');
// BP will take our form data that we're posting and give us a nice object back using req.body
var bodyParser = require('body-parser');
var handlebars = require('express-handlebars');

// requiring the Posts model so you can sync it and actually create the db. after syncing, the Posts var actually REFERS TO the ACTUAL database, so you can run queries on it like Posts.findAll({})
var Posts = require('./models')['Posts'];
Posts.sync();

var app = express();

// Makes sure that anything from our 'public' folder is accessible to the public/from the Internet
app.use(express.static(__dirname + '/public'));

// Parses the text as URL encoded data (which is how browsers tend to send form data from regular forms set to POST) and exposes the resulting object (containing the keys and values) on req.body. For comparison; in PHP all of this is automatically done and exposed in $_POST.
app.use(bodyParser.urlencoded({
  extended: false
}));


// Registers handlebars as the template engine; sets main.handlebars as the default layout using a callback function (the second argument)
app.engine('handlebars', handlebars({
  defaultLayout: 'main'
}));

app.set('view engine', 'handlebars');

app.get('/', function(req, res) {
  Posts.findAll({}).then(function(result) {
    return res.render('index', {
      posts: result
    })
  })
});

app.get('/new-post', function(req, res) {
  res.render('new');
})

app.post('/new-post', function(req, res) {
  var body = req.body;
  // create the post in the database
  Posts.create({
    title: body.title,
    url: body.url,
    image: body.image,
    score: 0,
    description: body.description
  }).then(function(data) {
    console.log('data', data);
    // redirect to the posts/:id page
    res.redirect('/posts/' + data.dataValues.id);
  })

});

app.get('/posts/:id', function(req, res) {
  var id = req.params.id;
  Posts.findOne({
    where: {
      id: id
    }
  }).then(function(post) {
    console.log('post', post);
    res.render('post', {
      post: post
    });
  });
})

// Sets port as process.env.PORT ***OR*** 3000 for heroku
var port = process.env.PORT || 3000;

app.listen(port);