const router = require ('express').Router();
const auth = require('../controllers/login.controller');

router.get('/', auth.index);
router.get('/create', auth.createUser);
router.post('/postUser', auth.postUser)

