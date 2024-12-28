const router = require('express').Router();
const {registerUserCtrl,loginUserCtrl} = require('../controllers/authcontroller')

router.post('/register', registerUserCtrl);
router.post('/login', loginUserCtrl);

module.exports = router