import User					from './schema';
import configAuth			from './auth';

const LocalStrategy 	= 		require('passport-local').Strategy;
const FacebookStrategy 	= 		require('passport-facebook').Strategy;
const FortyTwoStrategy 	= 		require('passport-42').Strategy;
const TwitterStrategy 	= 		require('passport-twitter').Strategy;
const LinkedinStrategy 	= 		require('passport-linkedin-oauth2').Strategy;
const gitHubStrategy	=		require('passport-github2').Strategy;
const SpotifyStrategy	=		require('passport-spotify').Strategy;
const GoogleStrategy	=		require('passport-google-oauth').OAuth2Strategy;

module.exports = (passport) => {
// /////////////////////////////////////////////////////////////////////////////

	passport.serializeUser((profile, done) => done(null, profile));

	passport.deserializeUser((profile, done) => done(null, profile));

// /////////////////////////////////////////////////////////////////////////////
//                  Local Strategy                                            //
// /////////////////////////////////////////////////////////////////////////////

passport.use('local-login', new LocalStrategy((username, password, done) => {
	process.nextTick(() => {
		User.findOne({
			$and:
			[
				{
					$or: [
						{ username },
						{ mail: username },
					],
				},
				{
					provider: 'local',
				},
			],
		}, (err, user) => {
			if (err) return done(err, { status: 'error', details: 'Cant connect to db' });
			if (!user) return done(null, false, { status: 'error', details: 'user doenst exist' });
			user.comparePassword(password, (erro, isMatch) => {
				if (erro) return done(erro);
				if (!isMatch) return done(null, false, { status: 'error', details: 'wrong password' });
				return done(null, user);
			});
			return (false);
		});
	});
}));

// /////////////////////////////////////////////////////////////////////////////
//                  Facebook Strategy                                         //
// /////////////////////////////////////////////////////////////////////////////

passport.use('facebook', new FacebookStrategy({
    clientID: configAuth.facebookAuth.clientID,
    clientSecret: configAuth.facebookAuth.clientSecret,
    callbackURL: 'http://localhost:8080/api/user/auth/facebook/callback',
	profileFields: ['id', 'email', 'first_name', 'last_name', 'photos'],
}, (accessToken, refreshToken, profile, done) => {
	process.nextTick(() => {
		const username = profile._json.first_name + profile._json.last_name;
		User.findOne({ $and: [{ username }, { provider: 'facebook' }] }, (err, user) => {
			if (err) return done(err, { status: 'error', details: 'Cant connect to db' });
			if (!user) {
				const newUser = new User({
					id: profile._json.id,
					username,
					mail: profile._json.email,
					image: profile.photos[0].value,
					provider: 'facebook',
				});
				newUser.save((erro, newUser) => {
					if (erro) return done(erro);
					return done(null, newUser, { status: true, details: 'success' });
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
				if (err) return done(err, { status: 'error', details: 'Cant connect to db' });
				if (!user) {
					const newUser = new User({
						id: profile.id,
						username: profile.username,
						mail: profile.emails[0].value,
						image: profile.photos[0].value,
						provider: '42',
					});
					newUser.save((erro, newUserFT) => {
						if (erro) return done(erro);
						return done(null, newUserFT, { status: 'success', details: 'success' });
					});
				} else {
				return done(null, user, { status: 'success', details: 'success' });
			}
			return (false);
			});
		return (false);
	});
}));

// /////////////////////////////////////////////////////////////////////////////
//                  Twitter Strategy                  	                      //
// /////////////////////////////////////////////////////////////////////////////

passport.use('twitter', new TwitterStrategy({
    consumerKey: configAuth.twitterAuth.consumerKey,
    consumerSecret: configAuth.twitterAuth.consumerSecret,
    callbackURL: configAuth.twitterAuth.callbackURL,
	includeEmail: true,
}, (accessToken, refreshToken, profile, done) => {
	process.nextTick(() => {
		const username = profile.username;
		User.findOne({ $and: [{ username }, { provider: 'twitter' }] }, (err, user) => {
			if (err) return done(err, { status: 'error', details: 'Cant connect to db' });
			if (!user) {
				const newUser = new User({
					id: profile.id,
					username,
					mail: profile.emails[0].value,
					image: profile.photos[0].value,
					provider: 'twitter',
				});
				newUser.save((erro, newUser) => {
					if (erro) return done(erro);
					return done(null, newUser, { status: true, details: 'success' });
				});
			} else {
				return done(null, user, { status: true, details: 'success' });
			}
			return (false);
		});
		return (false);
	});
}));

// ////////////////////////////////////////////////////////////////////////////////
// //                  Github Strategy                  	                      //
// ////////////////////////////////////////////////////////////////////////////////
//
passport.use('github', new gitHubStrategy({
    clientID: configAuth.gitAuth.clientID,
    clientSecret: configAuth.gitAuth.clientSecret,
    callbackURL: configAuth.gitAuth.callbackURL,
	scope: [ 'user:email' ],
	// profileFields: ['id', 'email', 'first_name', 'last_name', 'photos'],
}, (accessToken, refreshToken, profile, done) => {
	process.nextTick(() => {
		const username = profile._json.login;
		User.findOne({ $and: [{ username }, { provider: 'github' }] }, (err, user) => {
			if (err) return done(err, { status: 'error', details: 'Cant connect to db' });
			if (!user) {
				const newUser = new User({
					id: profile._json.id,
					username,
					mail: profile.emails[0].value,
					image: profile._json.avatar_url,
					provider: 'github',
				});
				newUser.save((erro, newUser) => {
					if (erro) return done(erro);
					return done(null, newUser, { status: true, details: 'success' });
				});
			} else {
				return done(null, user, { status: true, details: 'success' });
			}
			return (false);
		});
		return (false);
	});
}));

// ////////////////////////////////////////////////////////////////////////////////
// //                  Google Strategy                  	                      //
// ////////////////////////////////////////////////////////////////////////////////


passport.use('google', new GoogleStrategy({
    clientID: configAuth.googleAuth.clientID,
	clientSecret: configAuth.googleAuth.clientSecret,
    callbackURL: 'http://localhost:8080/api/user/auth/google/callback',
}, (accessToken, refreshToken, profile, done) => {
	process.nextTick(() => {
		const username = profile.name.familyName + profile.name.givenName;
		User.findOne({ $and: [{ username }, { provider: 'google' }] }, (err, user) => {
			if (err) return done(err, { status: 'error', details: 'Cant connect to db' });
			if (!user) {
				const newUser = new User({
					id: profile.id,
					username,
					mail: profile.emails[0].value,
					image: profile.photos[0].value,
					provider: 'google',
				});
				newUser.save((erro, newUser) => {
					if (erro) return done(erro);
					return done(null, newUser, { status: true, details: 'success' });
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
// //                  Linkedin Strategy                  	                  //
// /////////////////////////////////////////////////////////////////////////////

passport.use('linkedin', new LinkedinStrategy({
    clientID: configAuth.linkedinAuth.clientID,
	clientSecret: configAuth.linkedinAuth.clientSecret,
    callbackURL: 'http://localhost:8080/api/user/auth/linkedin/callback',
	scope: ['r_emailaddress', 'r_basicprofile'],
	// profileFields: ['id', 'first-name', 'last-name', 'email-address', 'headline', 'picture-url'],
	state: true,
}, (accessToken, refreshToken, profile, done) => {
	process.nextTick(() => {
		let photo = null;
		const username = profile.displayName;
		if (profile.photos.length > 0)
			photo = profile.photos[0].value;
		User.findOne({ $and: [{ username }, { provider: 'linkedin' }] }, (err, user) => {
			if (err) return done(err, { status: 'error', details: 'Cant connect to db' });
			if (!user) {
				const newUser = new User({
					id: profile.id,
					username,
					mail: profile.emails[0].value,
					image: photo,
					provider: 'linkedin',
				});
				newUser.save((erro, newUser) => {
					if (erro) return done(erro);
					return done(null, newUser, { status: true, details: 'success' });
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
// //                  Spotify Strategy                  	                  //
// /////////////////////////////////////////////////////////////////////////////

passport.use('spotify', new SpotifyStrategy({
    clientID: configAuth.spotifyAuth.clientID,
	clientSecret: configAuth.spotifyAuth.clientSecret,
    callbackURL: 'http://localhost:8080/api/user/auth/spotify/callback',
	scope: ['r_emailaddress', 'r_basicprofile'],
	state: true,
}, (accessToken, refreshToken, profile, done) => {
	process.nextTick(() => {
		let photo = null;
		const username = profile.username;
		if (profile.photos.length > 0)
			photo = profile.photos[0];
		User.findOne({ $and: [{ username }, { provider: 'spotify' }] }, (err, user) => {
			if (err) return done(err, { status: 'error', details: 'Cant connect to db' });
			if (!user) {
				const newUser = new User({
					id: profile.id,
					username,
					mail: profile.emails[0].value,
					image: photo,
					provider: 'spotify',
				});
				newUser.save((erro, newUser) => {
					if (erro) return done(erro);
					return done(null, newUser, { status: true, details: 'success' });
				});
			} else {
				return done(null, user, { status: true, details: 'success' });
			}
			return (false);
		});
		return (false);
	});
}));
};
