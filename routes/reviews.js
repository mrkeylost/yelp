const express = require("express");

const HandleAsync = require("../utilities/CatchAsync");
const ReviewController = require("../controllers/reviews");
const ReviewSchema = require("../schema/reviewSchema");
const {
  isLoggedIn,
  isReviewAuthor,
  ValidateForm,
} = require("../middleware/middleware");

const router = express.Router({ mergeParams: true });

router.post(
  "/",
  isLoggedIn,
  ValidateForm(ReviewSchema),
  HandleAsync(ReviewController.addReview),
);

router.delete(
  "/:reviewId",
  isLoggedIn,
  isReviewAuthor,
  HandleAsync(ReviewController.deleteReview),
);

module.exports = router;
