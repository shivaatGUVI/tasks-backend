const express = require("express");
const connection = require("./config/db");
const userRoute = require("./routes/user.route");
const taskRouter = require("./routes/tasks.route");
const completeRoute = require("./routes/complete.route");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const cors = require("cors");
require("dotenv").config();

const application = express();
application.use(express.json());
application.use(cors());
application.use(cookieParser());
application.use(
  session({
    secret: "Your in the application",
    resave: false,
    saveUninitialized: false,
    cookie: {},
  })
);
application.use("/user", userRoute);
application.use("/task", taskRouter);
application.use("/complete", completeRoute);

application.get("/", (req, res) => {
  res.send("<h2>Home route</h2>");
});

application.listen(process.env.PORT, async () => {
  console.log("Server Started");
  try {
    await connection;
    console.log("MongoDB connected");
  } catch (err) {
    console.log({ error: err.message });
  }
});
