const mongoose = require("mongoose");

const completedSchema = mongoose.Schema(
  {
    owner: String,
    name: String,
    description: String,
  },
  { versionKey: false }
);

const CompletedModel = mongoose.model("complete", completedSchema);

module.exports = CompletedModel;
