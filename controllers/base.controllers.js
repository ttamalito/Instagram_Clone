
function base(req, res, next) {
    // just render the initial file
    res.render('index', {posts: []});
}



module.exports = {
    base: base
}