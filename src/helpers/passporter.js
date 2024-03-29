import passport from 'passport';
import { Strategy as TwitterStrategy } from 'passport-twitter';
import { Strategy as GitHubStrategy } from 'passport-github2';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import expressSession from 'express-session';

const applyStrategy = (authenticator, config, Strategy, origin) => {
  passport.use(new Strategy(
    {
      clientID: config.appId,
      clientSecret: config.secret,
      consumerKey: config.appId,
      consumerSecret: config.secret,
      callbackURL: `${origin}/auth/${authenticator}/callback`,
      profileFields: ['id', 'displayName', 'picture']
    },
    (accessToken, refreshToken, profile, cb) => cb(null, { ...profile, token: accessToken })
  ));
};

const applyEndpoint = (app, authenticator) => {
  app.get(
    `/auth/${authenticator}`,
    passport.authenticate(authenticator, { session: true, scope: ['public_profile'] })
  );

  app.get(
    `/auth/${authenticator}/callback`,
    passport.authenticate(authenticator, {
      session: true,
      failureRedirect: `/auth/${authenticator}`
    }),
    (req, res) => {
      const redirect = req.cookies.redirect || '/';
      res.clearCookie('redirect');
      res.redirect(redirect);
    }
  );
};

export default {
  use: (config, app, origin) => {
    app.use(cookieParser());
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: false }));
    app.use(expressSession({ secret: 'keyboard cat', resave: true, saveUninitialized: true }));

    // passport setup Strategy
    passport.serializeUser((user, cb) => {
      cb(null, user);
    });

    passport.deserializeUser((obj, cb) => {
      cb(null, obj);
    });

    applyStrategy('twitter', config.twitter, TwitterStrategy, origin);
    applyStrategy('github', config.github, GitHubStrategy, origin);

    app.use(passport.initialize());
    app.use(passport.session());

    // Endpoint to confirm authentication is still in valid
    app.get(
      '/auth',
      (req, res, next) => {
        if (req.isAuthenticated()) {
          return next();
        }
        return res.status(401).json({});
      },
      (req, res) => {
        res.status(200).json({
          id: req.user.id,
          name: req.user.displayName,
          image: `https://atdnpzwmpo.cloudimg.io/v7/${
            req.user.photos[0].value
          }&w=100&radius=50`
        });
      }
    );

    applyEndpoint(app, 'twitter');
    applyEndpoint(app, 'github');
  }
};
