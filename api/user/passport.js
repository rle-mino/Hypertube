import User					from './schema';
import configAuth			from './auth';

const LocalStrategy 	= 		require('passport-local').Strategy;
const FacebookStrategy 	= 		require('passport-facebook').Strategy;
const FortyTwoStrategy 	= 		require('passport-42').Strategy;
// const BnetStrategy 		= 		require('passport-bnet').Strategy;
// const TwitterStrategy 	= 		require('passport-twitter').Strategy;
// const LinkedInStrategy 	= 		require('passport-linkedin').Strategy;
// const gitHubStrategy	=		require('passport-github2').Strategy;
// const GoogleStrategy	=		require('passport-google-oauth20').Strategy;

module.exports = (passport) => {
// /////////////////////////////////////////////////////////////////////////////

	passport.serializeUser((profile, done) => done(null, profile));

	passport.deserializeUser((profile, done) => done(null, profile));

// /////////////////////////////////////////////////////////////////////////////
//                  Local Strategy                                            //
// /////////////////////////////////////////////////////////////////////////////

passport.use('local-login', new LocalStrategy((username, password, done) => {
	process.nextTick(() => {
		User.findOne({ $and: [{ username }, { provider: 'local' }] }, (err, user) => {
			if (err) return done(err, { status: false, details: 'Cant connect to db' });
			if (!user) return done(null, false, { status: false, details: 'user doenst exist' });
			user.comparePassword(password, (erro, isMatch) => {
				if (erro) return done(erro);
				if (!isMatch) return done(null, false, { status: false, details: 'wrong password' });
				return done(null, user);
			});
			return (false);
		});
	});
}));

// //////////////////////////////////////////////////////////////////////////////
//                  Facebook Strategy                                         //
// //////////////////////////////////////////////////////////////////////////////

passport.use('facebook', new FacebookStrategy({
    clientID: configAuth.facebookAuth.clientID,
    clientSecret: configAuth.facebookAuth.clientSecret,
    callbackURL: configAuth.facebookAuth.callbackURL,
	// profileFields: ['id', 'email', 'first_name', 'last_name'],
}, (accessToken, refreshToken, profile, done) => {
	process.nextTick(() => {
		console.log(profile);
			User.findOne({ $and: [{ username: profile.username }, { provider: 'facebook' }] }, (err, user) => {
				if (err) return done(err, { status: false, details: 'Cant connect to db' });
				if (!user) {
					const newUser = new User({
						id: profile.id,
						username: profile.username,
						mail: profile.emails[0].value,
						image: profile.photos[0].value,
						provider: 'facebook',
					});
					newUser.save((erro) => {
						if (erro) return done(erro);
						return done(null, user, { status: true, details: 'success' });
					});
				} else {
				return done(null, user, { status: true, details: 'success' });
			}
			return (false);
			});
		return (false);
	});
}));

// /////////////////////////////////////////////////////////////////////////////
//                  42 Strategy                  	                          //
// /////////////////////////////////////////////////////////////////////////////

passport.use('42', new FortyTwoStrategy({
    clientID: configAuth.schoolAuth.clientId,
    clientSecret: configAuth.schoolAuth.clientSecret,
    callbackURL: configAuth.schoolAuth.callbackURL,
}, (accessToken, refreshToken, profile, done) => {
	process.nextTick(() => {
			User.findOne({ $and: [{ username: profile.username }, { provider: '42' }] }, (err, user) => {
				if (err) return done(err, { status: false, details: 'Cant connect to db' });
				if (!user) {
					const newUser = new User({
						id: profile.id,
						username: profile.username,
						mail: profile.emails[0].value,
						image: profile.photos[0].value,
						provider: '42',
					});
					newUser.save((erro) => {
						if (erro) return done(erro);
						return done(null, user, { status: true, details: 'success' });
					});
				} else {
				return done(null, user, { status: true, details: 'success' });
			}
			return (false);
			});
		return (false);
	});
}));

// /////////////////////////////////////////////////////////////////////////////
//                  Twitter Strategy                  	                      //
// /////////////////////////////////////////////////////////////////////////////

// passport.use('twitter', new TwitterStrategy({
//     consumerKey: configAuth.twitterAuth.consumerKey,
//     consumerSecret: configAuth.twitterAuth.consumerSecret,
//     callbackURL: configAuth.twitterAuth.callbackURL,
// },function (accessToken, refreshToken, profile, done) {
//             process.nextTick(function () {
// 				console.log(profile)
// 				console.log(accessToken);
// 				console.log(refreshToken);
//             });
//         }
//     ));
//
// ////////////////////////////////////////////////////////////////////////////////
// //                  Github Strategy                  	                      //
// ////////////////////////////////////////////////////////////////////////////////
//
// passport.use('github', new gitHubStrategy({
//     clientID: configAuth.gitAuth.clientID,
//     clientSecret: configAuth.gitAuth.clientSecret,
//     callbackURL: configAuth.gitAuth.callbackURL,
// },function (accessToken, refreshToken, profile, done) {
//             process.nextTick(function () {
// 				console.log(profile)
// 				console.log(accessToken);
// 				console.log(refreshToken);
//             });
//         }
//     ));
//
// ////////////////////////////////////////////////////////////////////////////////
// //                  Linkdin Strategy                  	                      //
// ////////////////////////////////////////////////////////////////////////////////
//
// passport.use('linkedin', new LinkedInStrategy({
//     consumerKey: configAuth.linkedinAuth.consumerKey,
//     consumerSecret: configAuth.linkedinAuth.consumerSecret,
//     callbackURL: configAuth.linkedinAuth.callbackURL,
// },function (accessToken, refreshToken, profile, ) {
//             process.nextTick(function () {
// 				console.log(profile)
// 				console.log(accessToken);
// 				console.log(refreshToken);
//             });
//         }
//     ));
// ////////////////////////////////////////////////////////////////////////////////
// //                  Google Strategy                  	                      //
// ////////////////////////////////////////////////////////////////////////////////
//
// passport.use('google', new GoogleStrategy({
//     clientID: '372934468358-eoh8lkd3ijvrdq5q692bddm6vhpg4s0n.apps.googleusercontent.com',
//     clientSecret: 'hBDeYPi9f0AnaJ4Te7YMiygC',
//     callbackURL: "http://localhost:8080/auth/google/callback"
//   },
//   function(accessToken, refreshToken, profile, cb) {
//     User.findOrCreate({ googleId: profile.id }, function (err, user) {
//       return cb(err, user);
//     });
//   }
// ));
};
