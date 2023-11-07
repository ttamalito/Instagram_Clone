
function base(req, res, next) {
    // just render the initial file
    res.send('This is the initial page');
}



module.exports = {
    base: base
}