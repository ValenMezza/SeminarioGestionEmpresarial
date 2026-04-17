// si no hay sesion activa, manda al login
module.exports = function (req, res, next) {
    if (!req.session?.user) return res.redirect('/');
    next();
};
