const Friend = require("../models/friend.model");
const User = require("../models/user.model");
const Chats = require("../models/chats.model");
const { v4: uuid_v4 } = require("uuid");

exports.addFriend = async (req, res) => {
  if (!req.body) {
    return res.status(400).send({
      message: "Content can not be empty!",
    });
  }
  try {
    const data = await User.findByUsername(req.body.friendName);
    if (!data) {
      return res.status(404).send({
        status: 404,
        message: "Friend not found!",
      });
    }

    if (req.body.uuid && data.uuid) {
      const chat_uuid = await Chats.addChatsByUUID(uuid_v4());
      if (!chat_uuid) {
        return res.status(500).send({
          status: 500,
          message: "Failed to add chat UUID!",
        });
      }
      await Friend.addFriendByUUID(req.body.uuid, data.uuid, chat_uuid);

      return res.send({
        status: 200,
        message: "Friend was added successfully!",
      });
    } else {
      return res.status(400).send({
        status: 400,
        message: "UUID is required!",
      });
    }
  } catch (err) {
    console.error("Error adding friend:", err);
    return res.status(500).send({
      status: 500,
      message: "Error adding friend",
      error: err.message || "Internal Server Error",
    });
  }
};

exports.verifyFriend = async (req, res) => {
  if (!req.body) {
    return res.status(400).send({
      message: "Content can not be empty!",
    });
  }
  try {
    await Friend.updateFriendStatusByUUID(req.body.status, req.body.chat_uuid);
    await Chats.updateChatStatusByUUID(req.body.status, req.body.chat_uuid);
    return res.send({
      status: 200,
      message: "Friend was added successfully!",
    });
  } catch (err) {
    console.error("Error adding friend:", err);
    return res.status(500).send({
      status: 500,
      message: "Error adding friend",
    });
  }
};

exports.getFriends = async (req, res) => {
  try {
    const data = await Friend.getFriendsByUUID(req.query.uuid);
    const friendsList = data.reduce((list, friendRelation) => {
      if (friendRelation.user1_uuid === req.query.uuid) {
        list.push({
          chat_uuid: friendRelation.friend_uuid,
          uuid: friendRelation.user2_uuid,
        });
      } else {
        list.push({
          chat_uuid: friendRelation.friend_uuid,
          uuid: friendRelation.user1_uuid,
        });
      }
      return list;
    }, []);

    return res.send({
      status: 200,
      message: "Friends were retrieved successfully!",
      data: {
        friendsList: friendsList,
      },
    });
  } catch (err) {
    console.error("Error getting friends:", err);
    return res.status(500).send({
      message: "Error retrieving friends: " + err.message,
    });
  }
};
