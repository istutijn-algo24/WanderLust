const express = require("express");
const router = express.Router();
const Listing = require("../models/listing.js");
const wrapAsync = require("../utils/wrapAsync.js");
const {isLoggedIn,isOwner,validateListing} = require("../middleware.js");
const multer  = require('multer')
const {storage} = require("../cloudConfi.js");
const upload = multer({ storage });

const listingController = require("../controllers/listings.js");

router
  .route("/")
  .get(wrapAsync(listingController.index))
  .post(  // Use .post() here to define the POST route
    isLoggedIn,
    
    upload.single('listing[image]'),
    wrapAsync(listingController.createListing)
  );



//new route
router.get("/new",isLoggedIn,listingController.renderNewForm);

router
.route("/:id")
.get( wrapAsync(listingController.showListing)) 
.put(isLoggedIn,
    isOwner,
    upload.single("listing[image"),
    validateListing,
wrapAsync(listingController.renderUpdateForm))
.delete(
    isLoggedIn,isOwner,
    wrapAsync(listingController.deleteListing));


//edit route
router.get("/:id/edit",isLoggedIn,isOwner,
    wrapAsync(listingController.renderEditForm),
);
module.exports = router;
