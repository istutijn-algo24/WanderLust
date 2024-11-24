const User = require("../models/user");
const { savedRedirectUrl } = require("../middleware.js");


module.exports.renderSignupForm = (req, res) => {
   res.render("users/signup.ejs");
};

module.exports.signup = async (req, res, next) => {
   try {
       let { username, email, password } = req.body;
       const newUser = new User({ email, username });
       const registeredUser = await User.register(newUser, password);
       console.log(registeredUser);
       req.login(registeredUser, (err) => {
           if (err) {
               return next(err);
           }
           req.flash("success", "Welcome to Wanderlust!");
           const redirectUrl = req.session.redirectUrl || "/listings"; // Fallback to home page if redirect URL is not set
           delete req.session.redirectUrl; // Clean up session data
           res.redirect(redirectUrl);
       });
   } catch (e) {
       req.flash("error", e.message);
       res.redirect("/signup");
   }
};

   
 module.exports.renderLoginForm = (req,res) =>{
    res.render("users/login.ejs");
 };

 module.exports.login = async (req, res) => {
   req.flash("success", "Welcome back to Wanderlust!");
   let redirectUrl = res.locals.redirectUrl || "/listings";
   res.redirect(redirectUrl);
};

module.exports.logout = (req,res,next) => {
   req.logout((err) => {
      if(err) {
         return next(err);
      }
      req.flash("success", "you are logged out now!");
      res.redirect("/listings");
   });
}
