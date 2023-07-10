const express = require("express")
const app = express()
const passport = require("passport")
PORT = 5000
const db = require("./models/db")
const session = require('express-session')
app.use(express.urlencoded({ extended: true }))
app.use(express.json())
app.set("view engine", "ejs")
require("./passport")



app.set('trust proxy', 1) // trust first proxy

// var SequelizeStore = require("connect-session-sequelize")(session.Store);
app.use(session({
    secret: 'keyboard cat',
    // store: new SequelizeStore({
    //     db: db.sequelize,
    // }),
    resave: false,
    saveUninitialized: true,
    cookie: {
        maxAge: 1000 * 60 * 60 * 24
    }
}))

app.use(passport.initialize())
app.use(passport.session())

app.get("/login", (req, res) => {
    res.render("login")
})
app.post("/login", (req, res) => {
    res.send("Login post")
})
app.get("/signup", (req, res) => {
    res.render("signup")
})
app.post("/signup", async (req, res) => {
    const { username, password } = req.body
    if (!username || !password) {
        res.send("Invallid input!")
    }
    const user = await db.users.create({
        username: username,
        password: password
    })
    res.send(user)

})

app.get(
    "/auth/google",
    passport.authenticate("google", { scope: ["profile", "email"] })
);


app.get('/auth/callback',
    passport.authenticate('google', { failureRedirect: '/login', successRedirect: '/protected' }),

);

app.get("/", (req, res) => {
    res.send({ message: "Home" })
})
app.get("/protected", (req, res) => {
    res.send("Protected Route")
})



app.listen(PORT, (req, res) => {
    console.log("Server running on http://localhost:5000")
})