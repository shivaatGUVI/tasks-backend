const jwt = require("jsonwebtoken");

const authorizeMiddleware = (req, res, next) => {
  const payload = req.body;
  const token = req.headers.authorization || req.session.token;
  console.log(req.session.token);
  try {
    jwt.verify(token, "tasksuserauthorization", function (err, decoded) {
      if (err) {
        res.status(500).send({
          error: err.message + ", you are logged out. Please login again",
        });
        return;
      }

      payload.owner = decoded.data;
      next();
    });
  } catch (err) {
    res.status(500).send({
      error: err.message,
    });
  }
};

module.exports = authorizeMiddleware;
