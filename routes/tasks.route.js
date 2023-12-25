const express = require("express");
const TaskModel = require("../models/task.model");
const UserModel = require("../models/user.model");
const nodemailer = require("nodemailer");
const authorizeMiddleware = require("../middlewares/authorize.middleware");
const CompletedModel = require("../models/completed.model");
require("dotenv").config();

const taskRouter = express.Router();

taskRouter.get("/all", authorizeMiddleware, async (req, res) => {
  const { owner } = req.body;
  // const { page } = req.query || 1;
  const limit = 5;
  try {
    let tasks = await TaskModel.find({ owner: owner._id });
    // const startIndex = (page - 1) * limit;
    // const endIndex = page * limit;

    // let taskPerPage = tasks.slice(startIndex, endIndex);

    tasks = tasks.sort((a, b) => {
      if (a.deadline && b.deadline) {
        return new Date(b.deadline).getTime() - new Date(a.deadline).getTime();
      }
    });

    let message;

    if (tasks.length === 0) {
      message = { message: "You have 0 tasks, create new tasks" };
    } else {
      message = { message: "Here are all your tasks", tasks: tasks.reverse() };
    }

    res.status(200).send(message);
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
});

taskRouter.post("/add", authorizeMiddleware, async (req, res) => {
  const { owner, ...payload } = req.body;
  try {
    const newTask = new TaskModel({ ...payload, owner: owner._id });
    await newTask.save();
    res.status(200).send({ message: "New task added" });
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
});

taskRouter.patch("/edit/:_id", authorizeMiddleware, async (req, res) => {
  const { owner, ...payload } = req.body;
  const { _id } = req.params;
  try {
    const task = await TaskModel.findOne({ _id, owner: owner._id });
    if (!task) {
      res.status(404).send({
        error:
          "Unable to find this task, maybe you are not the owner of this task",
      });
      return;
    } else {
      await TaskModel.findByIdAndUpdate({ _id }, payload);
      res.status(200).send({ message: "The task is updated successfully" });
    }
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
});

taskRouter.delete("/delete/:_id", authorizeMiddleware, async (req, res) => {
  const { owner } = req.body;
  const { _id } = req.params;
  try {
    const task = await TaskModel.findOne({ _id, owner: owner._id });
    if (!task) {
      res.status(404).send({
        error:
          "Unable to find this task, maybe you are not the owner of this task",
      });
      return;
    } else {
      await TaskModel.findByIdAndDelete({ _id });
      res.status(200).send({ message: "The task is deleted successfully" });
    }
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
});

taskRouter.post("/reminder/:_id", authorizeMiddleware, async (req, res) => {
  const { owner } = req.body;
  const { _id } = req.params;
  try {
    const task = await TaskModel.findOne({ _id, owner: owner._id });

    const transporter = nodemailer.createTransport({
      service: "gmail",
      host: "smtp.gmail.com",
      port: 465,
      secure: false,
      auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD,
      },
    });

    const info = await transporter.sendMail({
      from: process.env.EMAIL,
      to: owner.email,
      subject: `Task reminder`,
      text: `<p>This email is sent you because you have opted for the reminder for this task.</p>
      <p><b>Task title: -</b> ${task.name}</p>
      <p><b>Description: -</b> ${task.description}</p>`,
    });

    res.status(200).json(info);
    // .send({ message: "The reminder email has been sent to you" });
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
});

taskRouter.post("/complete/:task", authorizeMiddleware, async (req, res) => {
  const { owner } = req.body;
  const { task } = req.params;
  try {
    const payload = await TaskModel.findOne({
      _id: task,
      owner: owner._id,
    });
    const newComplete = new CompletedModel({
      name: payload.name,
      description: payload.description,
      createdOn: payload.createdOn,
      owner: owner._id,
    });
    await newComplete.save();
    await TaskModel.findByIdAndDelete({ _id: task });
    res.status(200).send({ message: "The task is marked as completed" });
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
});

module.exports = taskRouter;
