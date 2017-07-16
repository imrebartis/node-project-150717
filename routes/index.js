const express = require('express');
const router = express.Router();

// Do work here
router.get('/', (req, res) => {
  const bjim = { name: 'bjim', age: 100};
  //req has all the info
  //res has all the methods for sending data back
  //req.query is for getting the query paramaters
  //req.body is for posting paramaters
  //req.params is for accessing things that are in the url


  // res.send('Hey! It works!');
  // res.json(bjim); //this will display on the page the bjim const as a json object
  // res.send(req.query.name); // http://localhost:7777/?name=bjim&age=100 will display on the page bjim (actually the name param can be anything, e.g. bjam will display bjam)
  // res.json(req.query); //this will display on the page any param in the url (e.g. http://localhost:7777/?name=bjam&age=120&cool=true) as a json object 
  res.render('hello', {
    name: 'bjim',
    dog: req.query.dog,
    title: 'I love food'
  }
);
});

router.get('/reverse/:name', (req, res) => {
  const reverse = [...req.params.name].reverse().join('');
  res.send(reverse);
})
module.exports = router;
