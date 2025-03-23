import { createUser } from "./queries.js";
import { verifyUsername } from "./queries.js";
import { verifyUserLogin } from "./queries.js";
import { getUserName } from "./queries.js";
import bodyParser from "body-parser";
import morgan from "morgan";
import express from "express";

const PORT = 3000;
const app = express();
let loggedIn = false;

app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended: true}));
app.use(morgan("dev"));

app.get("/logout", (req,res) => {
    loggedIn = false;
    res.redirect("/login");
})

app.get("/home/:id", async (req,res) => {
    res.render("index.ejs", {
        welcome: "Welcome back " +  await getUserName(req.params.id)
    });
});

app.post("/login", async (req,res) => {
    const verifyUser = await verifyUserLogin(req.body["username"], req.body["password"]);
    if (verifyUser === false) {
        res.redirect("/login");
    }
    else {
        loggedIn = true;
        res.redirect(`/home/${verifyUser}`);
    }
});

app.get("/home", (req,res) => {
    if (loggedIn) {
        res.render("index.ejs");
    } else {
        res.redirect("/login");
    }
});

app.post("/register", async (req,res) => {
    const isUserTaken = await verifyUsername(req.body["regusername"]);
    if (isUserTaken) {
        res.redirect("/register");
    }
    createUser(req.body["regusername"], req.body["regpassword"]);
    loggedIn = true;
    res.redirect("/home");
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