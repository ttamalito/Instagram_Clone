
function base(req, res, next) {
    // just render the initial file
    res.send('You are gay');
}



module.exports = {
    base: base
}