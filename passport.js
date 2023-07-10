const passport = require("passport")

const db = require("./models/db")

const GoogleStrategy = require('passport-google-oauth20').Strategy;

passport.use(new GoogleStrategy({
    clientID: "858571916851-57pdo6vbohqkqtha508oohhpr7bbkp73.apps.googleusercontent.com",
    clientSecret: "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",
    callbackURL: "http://localhost:5000/auth/callback"
},
    async function (accessToken, refreshToken, profile, cb) {
        console.log(profile, "HELELELEL")
        const user = await db.users.findOne({ where: { username: profile.displayName } });
        if (!user) {
            let newUser = await db.users.create({
                username: profile.displayName,
                password: profile.id
            })
            newUser.save()
            redirect('/');

            return cb(null, newUser)
        } else {
            return cb(null, user)
        }
    }
));

passport.serializeUser(function (user, done) {
    done(null, user.id)
})

passport.deserializeUser(function (id, done) {
    db.users.findByPk(id, function (err, user) {
        done(err, user)
    })
})

// module.exports = passport