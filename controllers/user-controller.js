const { User, Thought } = require("../models");

const getAllUsers = (req, res) => {
  User.find({})
    .select("-__v")
    .then((dbUserData) => res.json(dbUserData))
    .catch((err) => {
      console.log(err);
      res.status(500).json(err);
    });
};

const getUserById = ({ params }, res) => {
  User.findOne({ _id: params.id })
    .populate([
      { path: "thoughts", select: "-__v" },
      { path: "friends", select: "-__v" },
    ])
    .select("-__v")
    .then((dbUserData) => {
      if (!dbUserData) {
        res.status(404).json({ message: "userId not found!" });
        return;
      }
      res.json(dbUserData);
    })
    .catch((err) => {
      console.log(err);
      res.status(400).json(err);
    });
};
const createUser = ({ body }, res) => {
  User.create(body)
    .then((dbUserData) => res.json(dbUserData))
    .catch((err) => res.status(400).json(err));
};

const updateUser = ({ params, body }, res) => {
  User.findOneAndUpdate({ _id: params.id }, body, {
    new: true,
    runValidators: true,
  })
    .then((dbUserData) => {
      if (!dbUserData) {
        res.status(404).json({ message: "userId not found!" });
        return;
      }
      res.json(dbUserData);
    })
    .catch((err) => res.status(400).json(err));
};

const deleteUser = ({ params }, res) => {
  User.findOneAndDelete({ _id: params.id })
    .then((dbUserData) => {
      if (!dbUserData) {
        res.status(404).json({ message: "userId not found!" });
        return;
      }
      User.updateMany(
        { _id: { $in: dbUserData.friends } },
        { $pull: { friends: params.id } }
      )
        .then(() => {
          Thought.deleteMany({ username: dbUserData.username })
            .then(() => {
              res.json({ message: "Successfully deleted user" });
            })
            .catch((err) => res.status(400).json(err));
        })
        .catch((err) => res.status(400).json(err));
    })
    .catch((err) => res.status(400).json(err));
};

const addFriend = ({ params }, res) => {
  User.findOneAndUpdate(
    { _id: params.userId },
    { $addToSet: { friends: params.friendId } },
    { new: true, runValidators: true }
  )
    .then((dbUserData) => {
      if (!dbUserData) {
        res.status(404).json({ message: "userId not found!" });
        return;
      }
      User.findOneAndUpdate(
        { _id: params.friendId },
        { $addToSet: { friends: params.userId } },
        { new: true, runValidators: true }
      )
        .then((dbUserData2) => {
          if (!dbUserData2) {
            res.status(404).json({ message: "friendId Not Found!" });
            return;
          }
          res.json(dbUserData);
        })
        .catch((err) => res.json(err));
    })
    .catch((err) => res.json(err));
};

const deleteFriend = ({ params }, res) => {
  User.findOneAndUpdate(
    { _id: params.userId },
    { $pull: { friends: params.friendId } },
    { new: true, runValidators: true }
  )
    .then((dbUserData) => {
      if (!dbUserData) {
        res.status(404).json({ message: "userId not found!" });
        return;
      }
      User.findOneAndUpdate(
        { _id: params.friendId },
        { $pull: { friends: params.userId } },
        { new: true, runValidators: true }
      )
        .then((dbUserData2) => {
          if (!dbUserData2) {
            res.status(404).json({ message: "friendId Not Found!" });
            return;
          }
          res.json({ message: "Successfully deleted the friend" });
        })
        .catch((err) => res.json(err));
    })
    .catch((err) => res.json(err));
};

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  deleteUser,
  updateUser,
  addFriend,
  deleteFriend,
};
