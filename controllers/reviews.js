const Campground = require("../models/campground");
const Review = require("../models/review");

module.exports.addReview = async (req, res) => {
  const { id } = req.params;
  const campground = await Campground.findById(id).exec();
  const review = new Review(req.body.review);
  review.author = req.user._id;

  campground.reviews.push(review);

  await campground.save();
  await review.save();

  req.flash("success", "Successfully made a new review");
  res.redirect(`/campgrounds/${id}`);
};

module.exports.deleteReview = async (req, res) => {
  const { id, reviewId } = req.params;
  await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
  await Review.findByIdAndDelete(reviewId);

  req.flash("success", "Successfully delete review");
  res.redirect(`/campgrounds/${id}`);
};
