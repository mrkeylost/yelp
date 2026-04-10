const Joi = require("joi");
const extension = require("../utilities/SanitizeHTML");

const sanitizeJoi = Joi.extend(extension);

const reviewSchema = sanitizeJoi.object({
  review: sanitizeJoi
    .object({
      body: sanitizeJoi.string().required().escapeHTML(),
      rating: sanitizeJoi.number().required().min(1).max(5),
    })
    .required(),
});

module.exports = reviewSchema;
