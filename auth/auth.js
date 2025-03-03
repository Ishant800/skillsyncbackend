const express = require('express');
const { register, userlogin, getuser, updateuserinfo } = require('../controllers/router');
const upload = require('../multer/multer');

const router = express.Router(); 

// Authentication routes
router.post("/userregister", register);
router.post("/userlogin", userlogin);
router.post('/userupdateinfo/:id', upload.single('image'), updateuserinfo); // 'image' matches form field name
router.get("/user", getuser);

module.exports = router; 