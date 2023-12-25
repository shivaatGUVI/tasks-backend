const express = require("express");
const UserModel = require("../models/user.model");
const loginFunction = require("../config/login");
const bcrypt = require("bcrypt");
require("dotenv").config();

const userRoute = express.Router();

userRoute.post("/signup", async (req, res) => {
  const payload = req.body;

  try {
    const user = await UserModel.findOne({ email: payload.email });

    if (user) {
      res.status(302).send({ error: "Email address already exists" });
      return;
    }

    bcrypt.hash(payload.password, 3, async function (err, hash) {
      if (err) {
        res.status(500).send({ error: err.message });
      }

      const newUser = new UserModel({ ...payload, password: hash });
      await newUser.save();

      const user = await UserModel.findOne({ email: payload.email });

      const token = await loginFunction(user);

      req.session.token = token;

      res.status(200).send({
        message: "User signed up successfully",
        token,
        user: {
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
        },
      });
    });
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
});

userRoute.post("/login", async (req, res) => {
  const payload = req.body;
  try {
    const user = await UserModel.findOne({ email: payload.email });
    if (user) {
      bcrypt.compare(
        payload.password,
        user.password,
        async function (err, result) {
          if (err) {
            res.status(500).send({ error: err.message });
            return;
          }

          if (result) {
            const token = await loginFunction(user);
            req.session.token = token;
            // req.session.save(function (err) {
            //   if (err) {
            //     console.error(err);
            //     return res
            //       .status(500)
            //       .send({ error: "You are logged out. Please login again" });
            //   }
            //   console.log("saved");
            // });

            res.status(200).send({
              message: "User Logged in successfully",
              token,
              user: {
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
              },
            });
            return;
          } else {
            res.status(400).json({ error: "Password incorrect" });
          }
        }
      );
    } else {
      res.status(404).send({ error: "User email address not found" });
    }
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
});

module.exports = userRoute;
