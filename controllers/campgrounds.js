const Campground = require("../models/campground");
const { cloudinary } = require("../cloudinary/index");
const maptilerClient = require("@maptiler/client");

maptilerClient.config.apiKey = process.env.MAPTILER_API_KEY;

module.exports.index = async (req, res) => {
  const campgrounds = await Campground.find({});

  res.render("campgrounds/index", { campgrounds });
};

module.exports.renderNewForm = (req, res) => {
  res.render("campgrounds/new");
};

module.exports.createNewCampground = async (req, res) => {
  const geoData = await maptilerClient.geocoding.forward(
    req.body.campground.location,
    { limit: 1 },
  );

  if (!geoData.features?.length) {
    req.flash(
      "error",
      "Could not get that location, please use valid location",
    );
    return res.redirect("/campgrounds/new");
  }

  const newCampground = new Campground(req.body.campground);

  newCampground.geometry = geoData.features[0].geometry;
  newCampground.location = geoData.features[0].place_name;

  newCampground.images = req.files.map((image) => ({
    url: image.path,
    fileName: image.filename,
  }));
  newCampground.author = req.user._id;

  await newCampground.save();

  req.flash("success", "Successfully made a new campgorund");
  res.redirect(`/campgrounds/${newCampground._id}`);
};

module.exports.renderCampgroundDetail = async (req, res) => {
  const { id } = req.params;
  const findCampgrounds = await Campground.findById(id)
    .populate({
      path: "reviews",
      populate: {
        path: "author",
        model: "User",
      },
    })
    .populate("author")
    .exec();

  if (!findCampgrounds) {
    req.flash("error", "Cannot find that campground");
    return res.redirect("/campgrounds");
  }

  res.render("campgrounds/detail", { campground: findCampgrounds });
};

module.exports.renderEditForm = async (req, res) => {
  const { id } = req.params;
  const findCampground = await Campground.findById(id).exec();

  if (!findCampground) {
    req.flash("error", "Cannot find that camground");
    return res.redirect("/campgrounds");
  }

  res.render("campgrounds/edit", { campground: findCampground });
};

module.exports.editCampground = async (req, res) => {
  const { id } = req.params;

  const geoData = await maptilerClient.geocoding.forward(
    req.body.campground.location,
    { limit: 1 },
  );

  if (!geoData.features?.length) {
    req.flash(
      "error",
      "Could not get that location, please use valid location",
    );
    return res.redirect(`/campgrounds/${id}/edit`);
  }

  const newImages = req.files.map((image) => ({
    url: image.path,
    fileName: image.filename,
  }));

  const editedCampground = await Campground.findByIdAndUpdate(
    id,
    {
      $set: { ...req.body.campground },
      $push: { images: { $each: newImages } },
    },
    {
      new: true,
      runValidators: true,
    },
  );

  editedCampground.geometry = geoData.features[0].geometry;
  editedCampground.location = geoData.features[0].place_name;

  if (req.body.deleteImages) {
    for (let filename of req.body.deleteImages) {
      await cloudinary.uploader.destroy(filename);
    }
    await editedCampground.updateOne({
      $pull: { images: { fileName: { $in: req.body.deleteImages } } },
    });
  }

  req.flash("success", "Successfully edit campground");
  res.redirect(`/campgrounds/${editedCampground._id}`);
};

module.exports.deleteCampground = async (req, res) => {
  const { id } = req.params;
  await Campground.findByIdAndDelete(id);

  req.flash("success", "Successfully delete campgorund");
  res.redirect("/campgrounds");
};
