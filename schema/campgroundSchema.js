const Joi = require("joi");
const extension = require("../utilities/SanitizeHTML");

const sanitizeJoi = Joi.extend(extension);

const campgroundSchema = sanitizeJoi.object({
  campground: sanitizeJoi
    .object({
      title: sanitizeJoi.string().required().escapeHTML(),
      price: sanitizeJoi.number().required().min(0),
      // image: Joi.string().required(),
      location: sanitizeJoi.string().required().escapeHTML(),
      description: sanitizeJoi.string().required().escapeHTML(),
    })
    .required(),
  deleteImages: sanitizeJoi.array(),
});

module.exports = campgroundSchema;
