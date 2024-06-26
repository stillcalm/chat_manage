const express = require("express");
const router = express.Router();
const friend = require("../controllers/friend.controller");

router.post("/addFriend", friend.addFriend);

router.post("/verifyFriend", friend.verifyFriend);

router.get("/getFriends", friend.getFriends);

module.exports = router;
