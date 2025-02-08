const express = require('express');
const { registerController, loginController } = require('../controllers/authController'); 
const { verifyToken } = require('../config/util');
 const router = express.Router();

router.post('/signup', registerController);
router.post('/signin', loginController); 
router.get('/get',verifyToken ,(req,res)=>{ 
     
    return res 
    .status(200)
    .json({success: true, message: "Boom"});
}); 
module.exports = router
