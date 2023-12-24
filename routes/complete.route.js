const express = require("express");
const authorizeMiddleware = require("../middlewares/authorize.middleware");
const CompletedModel = require("../models/completed.model");

const completeRoute = express.Router();

completeRoute.get("/all", authorizeMiddleware, async (req, res) => {
  const { owner } = req.body;
  // const { page } = req.query || 1;
  // const limit = 5;
  try {
    const complete = await CompletedModel.find({ owner: owner._id });
    // const startIndex = (page - 1) * limit;
    // const endIndex = page * limit;

    // let taskPerPage = complete.slice(startIndex, endIndex);

    let message;

    if (complete.length === 0) {
      message = { message: "You have 0 complete tasks" };
    } else {
      message = {
        message: "Here are all your complete tasks",
        tasks: complete,
      };
    }

    res.status(200).send(message);
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
});

module.exports = completeRoute;
