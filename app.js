if (process.env.NODE_ENV != "production") {
    require('dotenv').config();
 }
 
 console.log(process.env.SECRET);
 
 const express = require("express");
 const app = express();
 const mongoose = require("mongoose");
 const dbUrl = process.env.ATLASDB_URL;
 const path = require("path");
 const MongoStore = require('connect-mongo');
 const methodOverride = require("method-override");
 const ExpressError = require("./utils/ExpressError.js");
 const ejsMate = require("ejs-mate");
 const session = require("express-session");

 const flash = require("connect-flash");
 const passport = require("passport");
 const LocalStrategy = require("passport-local");
 const User = require("./models/user.js");
 const listingsRouter = require("./routes/listing.js");
 const reviewsRouter = require("./routes/review.js");
 const userRouter = require("./routes/user.js");
 
 async function main() {
     await mongoose.connect(dbUrl);
 }
 main()
     .then(() => {
         console.log("Connected to DB");
     })
     .catch((error) => {
         console.error("Database connection error:", error);
     });
 
 app.set("view engine", "ejs");
 app.set("views", path.join(__dirname, "views"));
 app.use(express.urlencoded({ extended: true }));
 app.use(methodOverride("_method"));
 app.engine("ejs", ejsMate);
 app.use(express.static(path.join(__dirname, "/public")));
   
 const store = MongoStore.create({
    mongoUrl:dbUrl,
   crypto : {
    secret : process.env.SECRET,
   },
   touchAfter: 24 * 3600,
 });

 store.on("error", () => {
    console.log("Error in MONGO SESSION STORE", err);
 });

 // Session and Flash Middleware
 const sessionOptions = {
    store,
     secret: process.env.SECRET,
     resave: false,
     saveUninitialized: true,
     store: MongoStore.create({
         mongoUrl: process.env.ATLASDB_URL,
         touchAfter: 24 * 3600 // Reduces frequency of session updates (optional)
     }),
     cookie: {
         expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
         maxAge: 7 * 24 * 60 * 60 * 1000,
         httpOnly: true,
     },
 };

 
 
 app.use(session(sessionOptions));  // Add session middleware before flash
 app.use(flash());  // Flash middleware needs to be after session middleware
 
 // Passport Middleware
 app.use(passport.initialize());
 app.use(passport.session());
 passport.use(new LocalStrategy(User.authenticate()));
 passport.serializeUser(User.serializeUser());
 passport.deserializeUser(User.deserializeUser());
 
 // Flash and user data middleware (this should be after flash middleware)
 app.use((req, res, next) => {
     res.locals.success = req.flash("success") || "";
     res.locals.error = req.flash("error") || "";
     res.locals.currUser = req.user;
     next();
 });
 
 // Flash Message Route
 app.get("/", (req, res) => {
     req.flash("success", "Welcome to the website!");  // Set a flash success message
     res.render("home");  // Render the home view
 });
 
 // Demo User Route
 app.get("/demouser", async (req, res) => {
     let fakeUser = new User({
         email: "aayushi@gmail.com",
         username: "delta-student",
         password: "helloworld",
     });
 
     let registeredUser = await User.register(fakeUser, "helloworld");
     res.send(registeredUser);
 });
 
 // Use other routes
 app.use("/users", userRouter);
 app.use("/listings", listingsRouter);
 app.use("/listings/:id/reviews", reviewsRouter);
 app.use("/", userRouter);
 
 // 404 Error Handling
 app.all("*", (req, res, next) => {
     next(new ExpressError(404, "Page Not Found"));
 });
 
 // Error Handling Middleware
 app.use((err, req, res, next) => {
     const { statusCode = 500, message = "Something went wrong" } = err;
     res.status(statusCode).render("error", { message }); // Pass only `message`
 });
 
 // Server Listener
 app.listen(8080, () => {
     console.log("Server is listening on port 8080");
 });
 
