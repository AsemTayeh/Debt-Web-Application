import { createUser } from "./queries.js";
import { verifyUsername } from "./queries.js";
import { verifyUserLogin } from "./queries.js";
import { getUserName } from "./queries.js";
import { getDebts } from "./queries.js";
import { setMessage } from "./queries.js";
import bodyParser from "body-parser";
import morgan from "morgan";
import express from "express";
import session from "express-session";

const PORT = 3000;
const app = express();

app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended: true}));
app.use(morgan("dev"));

app.use([session({
    secret: 'SFDdGWEG56##%^GHG$H46234GHS4254Y5G2D37Hh&5BJNVBDF5%%',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }
})]);

// To-do:
// Implement addForm.ejs to have a form that allows you to add a new note.
// Implement debts.ejs in the else block to show you all your debt records
// Which should be cards that have 3 buttons in them -> refer to Abood design, make sure
// Each step is validated by sessionID.

app.get("/add", (req,res) => {
    if (!req.session.userID) {
        res.redirect("/login");
    } else {
        res.render("add.ejs");
    }
});

app.get("/logout", (req,res) => {
    req.session.destroy(err => {
        if (err) return res.send("Error logging out");
        res.redirect("/login");
    });
});

app.get("/home", async (req,res) => {
    if (!req.session.userID) {
        res.redirect("/login");
    } else {
        let message = setMessage(req.session.loginType);
        let debtsArray = await getDebts(req.session.userID);
        res.render("index.ejs", {
            welcome: message +  await getUserName(req.session.userID) + "!",
            debtsArray: debtsArray
        });
    }
});

app.post("/login", async (req,res) => {
    const verifyUser = await verifyUserLogin(req.body["username"], req.body["password"]);
    if (verifyUser === false) {
        res.redirect("/login");
    } else {
        req.session.userID = verifyUser;
        req.session.loginType = "login";
        res.redirect("/home");
    }
});

app.post("/register", async (req,res) => {
    const isUserTaken = await verifyUsername(req.body["regusername"]);
    if (isUserTaken) {
        res.redirect("/register");
    } else {
        const userID = await createUser(req.body["regusername"], req.body["regpassword"]);
        req.session.userID = userID;
        req.session.loginType = "register";
        res.redirect("/home");
    }
});

app.get("/login", (req,res) => { 
    res.render("login.ejs");
});

app.get("/register", (req,res) => {
    res.render("register.ejs");
    
});

app.get("/", (req,res) => {
    res.render("register.ejs");
});

app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
});