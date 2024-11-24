const Listing = require("./models/listing");
const Review = require("./models/reviews");
const ExpressError = require("./utils/ExpressError.js");

const { listingSchema, reviewSchema } = require("./schema.js");
module.exports.isLoggedIn = (req,res,next) => {
    if(!req.isAuthenticated()) {
        req.session.redirectUrl = req.originalUrl;
        req.flash("error","you must be logged in to create listing");
        return res.redirect("/login");
    }
    next();
};

module.exports.savedRedirectUrl = (req,res,next) => {
    if(req.session.redirectUrl) {
        res.locals.redirectUrl = req.session.redirectUrl;
    }
    next();
};

module.exports.isOwner = async (req, res, next) => {
    try {
        const { id } = req.params;
        const listing = await Listing.findById(id);

        if (!listing) {
            req.flash("error", "Listing not found");
            return res.redirect("/listings");
        }

        if (!res.locals.currUser || !listing.owner.equals(res.locals.currUser._id)) {
            req.flash("error", "You don't have permission to edit this listing");
            return res.redirect(`/listings/${id}`);
        }

        next(); // Proceed only if everything is valid
    } catch (err) {
        next(err); // Forward error to error-handling middleware
    }
};

module.exports.validateListing = (req, res, next) => {
    let { error } = listingSchema.validate(req.body);
    if (error) {
        let errMsg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(400, errMsg);
    } else {
        next();
    }
};
module.exports.validateReview = (req,res,next) => {
    let {error} = reviewSchema.validate(req.body);
   
    if(error) {
        let errMsg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(400, errMsg);
    } else {
        next();
    }
};

module.exports.isReviewAuthor = async (req, res, next) => {
    try {
        const { id, reviewId } = req.params;
        const review = await Review.findById(reviewId);

        if (!review) {
            req.flash("error", "Review not found");
            return res.redirect(`/listings/${id}`);
        }

        if (!res.locals.currUser || !review.author.equals(res.locals.currUser._id)) {
            req.flash("error", "You are not authorized to edit this review");
            return res.redirect(`/listings/${id}`);
        }

        next(); // Proceed only if everything is valid
    } catch (err) {
        next(err); // Forward error to error-handling middleware
    }
};
