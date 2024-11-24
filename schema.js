const Joi = require('joi');

// Joi schema for validating listing
const listingSchema = Joi.object({
    listing: Joi.object({
        title: Joi.string().required(),
        description: Joi.string().required(),
        location: Joi.string().required(),
        country: Joi.string().required(),
        price: Joi.number().min(18).required(),
        image: Joi.object({
            filename: Joi.string().optional().allow("", null),
            url: Joi.string().uri().optional().allow("", null)
        }).optional() // Make image optional
    }).required()
});

// Joi schema for validating reviews
const reviewSchema = Joi.object({
    review: Joi.object({
        rating: Joi.number().required().min(1).max(5),
        comment: Joi.string().required(),
    }).required()
});

module.exports = { listingSchema, reviewSchema }; // Export both schemas
