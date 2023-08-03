// this middleware adds a user's id parameter in request header if user is auntheticated

const jwt = require("jsonwebtoken");
const config = require("config");

module.exports = function (req, res, next) {
  // get token from header
  const token = req.header("x-auth-token");

  // check if there is token
  if (!token) {
    return res.status(401).json({ msg: "No token, authorization denied" });
  }

  try {
    // this now has the value of payload(which is basically user's id)
    // note: we gave user's id for generating token so even for different tokens that we generate if we decode them then at last we will get the same user's id payload so the time at which it is created doesn't matter
    const decoded = jwt.verify(token, config.get("jwtSecret"));

    // this has the id property of the user from the payload. we assigned it to req.user coz it will then have access to the route(in contacts route)
    // see payload in users.js route file. When we use decoded.user then it now contains an object with id property of that user so req.user will only have the user's id in id property(which is inside user's id property) so to access it we have to use req.user.id in contacts route file
    req.user = decoded.user;

    // to continue with the processing code
    next();
  } catch (err) {
    res.status(401).json({ msg: "token is not valid" });
  }
};
