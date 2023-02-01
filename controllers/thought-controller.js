const { User, Thought } = require("../models");

const getAllThoughts = (req, res) => {
  Thought.find({})
    .populate({ path: "reactions", select: "-__v" })
    .select("-__v")
    .then((dbThoughtData) => res.json(dbThoughtData))
    .catch((err) => {
      console.log(err);
      res.status(500).json(err);
    });
};

const getThoughtById = ({ params }, res) => {
  Thought.findOne({ _id: params.id })
    .populate({ path: "reactions", select: "-__v" })
    .select("-__v")
    .then((dbThoughtData) => {
      if (!dbThoughtData) {
        res.status(404).json({ message: "No thought found with this id" });
        return;
      }
      res.json(dbThoughtData);
    })
    .catch((err) => {
      console.log(err);
      res.status(400).json(err);
    });
};

const createThought = ({ body }, res) => {
  Thought.create(body)
    .then((dbThoughtData) => {
      User.findOneAndUpdate(
        { _id: body.userId },
        { $push: { thoughts: dbThoughtData._id } },
        { new: true }
      )
        .then((dbUserData) => {
          if (!dbUserData) {
            res.status(404).json({ message: "No user found with this id" });
            return;
          }
          res.json(dbUserData);
        })
        .catch((err) => res.json(err));
    })
    .catch((err) => res.status(400).json(err));
};

const updateThought = ({ params, body }, res) => {
  Thought.findOneAndUpdate({ _id: params.id }, body, { new: true })
    .then((dbThoughtData) => {
      if (!dbThoughtData) {
        res.status(404).json({ message: "No thought found with this id" });
        return;
      }
      res.json(dbThoughtData);
    })
    .catch((err) => res.status(400).json(err));
};

const deleteThought = ({ params }, res) => {
  Thought.findOneAndDelete({ _id: params.id })
    .then((dbThoughtData) => {
      if (!dbThoughtData) {
        res.status(404).json({ message: "Thought ID not found!" });
        return;
      }

      User.findOneAndUpdate(
        { username: dbThoughtData.username },
        { $pull: { thoughts: params.id } }
      )
        .then(() => {
          res.json({ message: "Successfully deleted the thought" });
        })
        .catch((err) => res.status(500).json(err));
    })
    .catch((err) => res.status(500).json(err));
};

const addReaction = ({ params, body }, res) => {
  Thought.findOneAndUpdate(
    { _id: params.thoughtId },
    { $addToSet: { reactions: body } },
    { new: true, runValidators: true }
  )
    .then((dbThoughtData) => {
      if (!dbThoughtData) {
        res.status(404).json({ message: "Thought ID not found!" });
        return;
      }
      res.json(dbThoughtData);
    })
    .catch((err) => res.status(500).json(err));
};

const deleteReaction = ({ params, body }, res) => {
  Thought.findOneAndUpdate(
    { _id: params.thoughtId },
    { $pull: { reactions: { _id: body.reactionId } } },
    { new: true, runValidators: true }
  )
    .then((dbThoughtData) => {
      if (!dbThoughtData) {
        res.status(404).json({ message: "Thought ID not found!" });
        return;
      }
      res.json({ message: "Successfully deleted the reaction" });
    })
    .catch((err) => res.status(500).json(err));
};

module.exports = {
  getAllThoughts,
  getThoughtById,
  deleteThought,
  createThought,
  updateThought,
  addReaction,
  deleteReaction,
};
