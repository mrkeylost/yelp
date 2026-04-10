const express = require("express");
const multer = require("multer");

const HandleAsync = require("../utilities/CatchAsync");
const CampgroundController = require("../controllers/campgrounds");
const CampgroundSchema = require("../schema/campgroundSchema");
const {
  isLoggedIn,
  isAuthor,
  ValidateForm,
} = require("../middleware/middleware");
const { storage } = require("../cloudinary/index");

const upload = multer({ storage });

const router = express.Router();

router
  .route("/")
  .get(HandleAsync(CampgroundController.index))
  .post(
    isLoggedIn,
    upload.array("campground[image]", 12),
    ValidateForm(CampgroundSchema),
    HandleAsync(CampgroundController.createNewCampground),
  );

router.get("/new", isLoggedIn, CampgroundController.renderNewForm);

router
  .route("/:id")
  .get(HandleAsync(CampgroundController.renderCampgroundDetail))
  .patch(
    isLoggedIn,
    isAuthor,
    upload.array("campground[image]", 12),
    ValidateForm(CampgroundSchema),
    HandleAsync(CampgroundController.editCampground),
  )
  .delete(
    isLoggedIn,
    isAuthor,
    HandleAsync(CampgroundController.deleteCampground),
  );

router.get(
  "/:id/edit",
  isLoggedIn,
  isAuthor,
  HandleAsync(CampgroundController.renderEditForm),
);

module.exports = router;
