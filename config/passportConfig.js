// config/passportConfig.js
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import bcrypt from "bcrypt";
import User from "../models/user.model.js";  // Adjust path to User model

// Passport Local Strategy for login
passport.use(
  new LocalStrategy(
    { usernameField: 'emailOrNumber' }, 
    async (emailOrNumber, password, done) => {
      try {
        const user = await User.findOne({
          $or: [{ email: emailOrNumber }, { number: emailOrNumber }],
        });

        if (!user) {
          return done(null, false, { message: "User not found" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
          return done(null, false, { message: "Incorrect password" });
        }

        return done(null, user); // Successful login
      } catch (err) {
        return done(err); // Handle any other errors
      }
    }
  )
);
passport.serializeUser((user, done) => {
  done(null, user.id); // Storing the user ID in the session
});

passport.deserializeUser((id, done) => {
  User.findById(id, (err, user) => {
    done(err, user);
  });
});




export default passport;
