module.exports = function (req, res, next) {
    if (req.session?.user?.rol !== 'admin') {
        return res.status(403).render('error', {
            message: 'Acceso denegado',
            error: { status: 403, stack: '' }
        });
    }
    next();
};
