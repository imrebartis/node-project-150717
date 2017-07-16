exports.homePage = (req, res) => {
  console.log(req.name);
  res.render('index');
};

exports.addStore = (req, res) => {
  res.render('editStore', { title: 'Add Store' });
};

exports.createStore = (req, res) => {
  console.log(req.body);
  res.json(req.body); //this renders on http://localhost:7777/add the data submited in the form
};