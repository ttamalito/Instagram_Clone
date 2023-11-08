
function base(req, res, next) {
    // just render the initial file
    res.render('index');
}



module.exports = {
    base: base
}