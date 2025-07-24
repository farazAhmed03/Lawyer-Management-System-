const express = require('express');
const router = express.Router();
const users = require('../Controllers/UserController')
const auth = require('../Middleware/authMiddleware');


// !Router for Users: 
router.route('/AllUsers').get(auth, users.AllUsers);
router.route('/SingleUser/:id').get(auth, users.singleUser);
router.route('/DeleteUser/:id').delete(auth, users.deleteUser);
router.route('/isUser').get(auth, users.isUser);
router.route("/allClients").get(auth, users.AllClients);
router.route("/allLawyers").get(auth, users.AllLawyers);
router.route('/UpdateUser/:id').put(auth, users.updateUser);
router.route('/SearchLawyer').post(auth, users.searchLawyer);
// router.route('/DeleteAllUser').delete(users.deleteAllUser);


module.exports = router;