import {createUser} from "./queries.js";
import { verifyUsername } from "./queries.js";
import bodyParser from "body-parser";
import morgan from "morgan";
import express from "express";

const PORT = 3000;
const app = express();
let loggedIn = false;
let flashMessage = "";

app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended: true}));
app.use(morgan("dev"));

app.post("/register", (req,res) => {
    if (verifyUsername(req.body["regusername"])) {
        flashMessage = "Username is already in use";
        res.render("register.ejs", {
            flashMessage: flashMessage
        });
        flashMessage = "";
        return;
    }
    createUser(req.body["regusername"], req.body["regpassword"]);
    loggedIn = true;
    res.redirect("/home");
});

app.get("/home", (req,res) => {
    if (loggedIn) {
        res.render("index.ejs");
    } else {
        res.render("login.ejs");
    }
});

app.get("/login", (req,res) => { 
    res.render("login.ejs");
});

app.get("/register", (req,res) => {
    res.render("register.ejs");
    
});

app.get("/", (req,res) => {
    res.render("login.ejs");
});

app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
});