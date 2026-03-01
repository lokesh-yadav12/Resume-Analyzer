const passport = require('passport');
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const LinkedInStrategy = require('passport-linkedin-oauth2').Strategy;
const GitHubStrategy = require('passport-github2').Strategy;
const User = require('../models/User');

// JWT Strategy
passport.use(new JwtStrategy({
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET
}, async (payload, done) => {
  try {
    const user = await User.findById(payload.userId).select('-password');
    
    if (user && user.isActive && !user.isLocked) {
      return done(null, user);
    }
    
    return done(null, false);
  } catch (error) {
    return done(error, false);
  }
}));

// Google OAuth Strategy
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: '/api/auth/google/callback'
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      // Check if user already exists with this Google ID
      let user = await User.findOne({ googleId: profile.id });
      
      if (user) {
        // Update last login
        user.lastLoginAt = new Date();
        await user.save();
        return done(null, user);
      }
      
      // Check if user exists with same email
      user = await User.findOne({ email: profile.emails[0].value });
      
      if (user) {
        // Link Google account to existing user
        user.googleId = profile.id;
        user.emailVerified = true; // Google emails are verified
        user.lastLoginAt = new Date();
        
        // Update profile if missing info
        if (!user.profile.firstName) user.profile.firstName = profile.name.givenName;
        if (!user.profile.lastName) user.profile.lastName = profile.name.familyName;
        if (!user.profile.avatar) user.profile.avatar = profile.photos[0]?.value;
        
        await user.save();
        return done(null, user);
      }
      
      // Create new user
      user = new User({
        email: profile.emails[0].value,
        googleId: profile.id,
        emailVerified: true,
        profile: {
          firstName: profile.name.givenName || 'User',
          lastName: profile.name.familyName || '',
          avatar: profile.photos[0]?.value
        },
        lastLoginAt: new Date()
      });
      
      await user.save();
      done(null, user);
      
    } catch (error) {
      done(error, null);
    }
  }));
}

// LinkedIn OAuth Strategy
if (process.env.LINKEDIN_CLIENT_ID && process.env.LINKEDIN_CLIENT_SECRET) {
  passport.use(new LinkedInStrategy({
    clientID: process.env.LINKEDIN_CLIENT_ID,
    clientSecret: process.env.LINKEDIN_CLIENT_SECRET,
    callbackURL: '/api/auth/linkedin/callback',
    scope: ['r_emailaddress', 'r_liteprofile']
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      let user = await User.findOne({ linkedinId: profile.id });
      
      if (user) {
        user.lastLoginAt = new Date();
        await user.save();
        return done(null, user);
      }
      
      const email = profile.emails[0]?.value;
      if (email) {
        user = await User.findOne({ email });
        
        if (user) {
          user.linkedinId = profile.id;
          user.emailVerified = true;
          user.lastLoginAt = new Date();
          
          if (!user.profile.firstName) user.profile.firstName = profile.name.givenName;
          if (!user.profile.lastName) user.profile.lastName = profile.name.familyName;
          if (!user.profile.avatar) user.profile.avatar = profile.photos[0]?.value;
          if (!user.profile.linkedinUrl) user.profile.linkedinUrl = `https://linkedin.com/in/${profile.username}`;
          
          await user.save();
          return done(null, user);
        }
      }
      
      user = new User({
        email: email || `${profile.id}@linkedin.temp`,
        linkedinId: profile.id,
        emailVerified: !!email,
        profile: {
          firstName: profile.name.givenName || 'User',
          lastName: profile.name.familyName || '',
          avatar: profile.photos[0]?.value,
          linkedinUrl: `https://linkedin.com/in/${profile.username}`
        },
        lastLoginAt: new Date()
      });
      
      await user.save();
      done(null, user);
      
    } catch (error) {
      done(error, null);
    }
  }));
}

// GitHub OAuth Strategy
if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
  passport.use(new GitHubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: '/api/auth/github/callback'
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      let user = await User.findOne({ githubId: profile.id });
      
      if (user) {
        user.lastLoginAt = new Date();
        await user.save();
        return done(null, user);
      }
      
      const email = profile.emails?.[0]?.value;
      if (email) {
        user = await User.findOne({ email });
        
        if (user) {
          user.githubId = profile.id;
          user.emailVerified = true;
          user.lastLoginAt = new Date();
          
          if (!user.profile.firstName) {
            const nameParts = (profile.displayName || profile.username).split(' ');
            user.profile.firstName = nameParts[0] || 'User';
            user.profile.lastName = nameParts.slice(1).join(' ') || '';
          }
          if (!user.profile.avatar) user.profile.avatar = profile.photos[0]?.value;
          
          await user.save();
          return done(null, user);
        }
      }
      
      const nameParts = (profile.displayName || profile.username).split(' ');
      user = new User({
        email: email || `${profile.username}@github.temp`,
        githubId: profile.id,
        emailVerified: !!email,
        profile: {
          firstName: nameParts[0] || 'User',
          lastName: nameParts.slice(1).join(' ') || '',
          avatar: profile.photos[0]?.value
        },
        lastLoginAt: new Date()
      });
      
      await user.save();
      done(null, user);
      
    } catch (error) {
      done(error, null);
    }
  }));
}

// Serialize/Deserialize user for session
passport.serializeUser((user, done) => {
  done(null, user._id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id).select('-password');
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

module.exports = passport;