const mongoose = require("mongoose");
const deadline = Date | Boolean;

const taskSchema = mongoose.Schema(
  {
    owner: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    createdOn: {
      type: Date,
      required: true,
    },
    deadline: {
      type: Date,
      required: false,
    },
  },
  { versionKey: false }
);

const TaskModel = mongoose.model("task", taskSchema);

module.exports = TaskModel;
