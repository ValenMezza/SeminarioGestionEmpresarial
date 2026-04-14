const bcrypt = require('bcrypt');
const SALT_ROUNDS = 10;

const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z0-9\s]).{8,}$/;

function validarContrasena(password) {
    if (!PASSWORD_REGEX.test(password)) {
        return 'La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula, un número y un carácter especial (+, -, *, /, ?, &, %, $, @, etc.).';
    }
    return null;
}

async function hashPassword(password) {
    return bcrypt.hash(password, SALT_ROUNDS);
}

async function verifyPassword(password, hash) {
    return bcrypt.compare(password, hash);
}

module.exports = { validarContrasena, hashPassword, verifyPassword };
