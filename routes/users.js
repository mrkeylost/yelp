const express = require("express");
const passport = require("passport");
const { storeReturnTo } = require("../middleware/middleware");

const UserController = require("../controllers/users");
const HandleAsync = require("../utilities/CatchAsync");

const router = express.Router();

router
  .route("/register")
  .get(UserController.renderRegisterForm)
  .post(HandleAsync(UserController.register));

router
  .route("/login")
  .get(UserController.renderLoginForm)
  .post(
    storeReturnTo,
    passport.authenticate("local", {
      failureFlash: true,
      failureRedirect: "/login",
    }),
    UserController.login,
  );

router.get("/logout", UserController.logout);

module.exports = router;
