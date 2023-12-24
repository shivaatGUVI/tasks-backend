const jwt = require("jsonwebtoken");

const loginFunction = async (client) => {
  try {
    const authorization = jwt.sign(
      {
        data: client,
      },
      "tasksuserauthorization",
      { expiresIn: "1h" }
    );

    return authorization;
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

module.exports = loginFunction;
