const Campground = require("../models/campground");
const Review = require("../models/review");
const AppError = require("../utilities/AppError");

module.exports.ValidateForm = (schema) => {
  return function (req, res, next) {
    const { error } = schema.validate(req.body);
    if (error) {
      const msg = error.details.map((e) => e.message).join(",");
      throw new AppError(msg, 400);
    } else {
      next();
    }
  };
};

module.exports.isLoggedIn = (req, res, next) => {
  if (!req.isAuthenticated()) {
    req.flash("error", "You must be signed in for this operation");
    return res.redirect("/login");
  }

  next();
};

module.exports.storeReturnTo = (req, res, next) => {
  if (req.session.returnTo) {
    res.locals.returnTo = req.session.returnTo;
  }

  next();
};

module.exports.isAuthor = async (req, res, next) => {
  const { id } = req.params;
  const findCampground = await Campground.findById(id).exec();

  if (!findCampground.author.equals(req.user._id)) {
    req.flash("error", "You do not have permission to this operation!");
    return res.redirect(`/campgrounds/${id}`);
  }

  next();
};

module.exports.isReviewAuthor = async (req, res, next) => {
  const { id, reviewId } = req.params;
  const findReview = await Review.findById(reviewId).exec();

  if (!findReview.author.equals(req.user._id)) {
    req.flash("error", "You do not have permission to this operation!");
    return res.redirect(`/campgrounds/${id}`);
  }

  next();
};
