exports.myMiddleware = (req, res, next) => {
    req.name = 'bjim';
    res.cookie('name', 'bjim is cool', {maxAge: 9000000 })
    next();
}

exports.homePage = (req, res) => {
    res.render('index');
}