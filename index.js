import { createUser } from "./queries.js";
import { verifyUsername } from "./queries.js";
import { verifyUserLogin } from "./queries.js";
import { getUserName } from "./queries.js";
import { getDebts } from "./queries.js";
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

app.get("/home", async (req,res) => {
    if (!loggedIn) {
        res.redirect("/login");
    } else {
        const userDebts = getDebts(req.params.id);
        res.render("index.ejs", {
            welcome: "Welcome back " +  await getUserName(req.params.id),
            userDebts: userDebts
        });
    }
});

app.post("/login", async (req,res) => {
    const verifyUser = await verifyUserLogin(req.body["username"], req.body["password"]);
    if (verifyUser === false) {
        res.redirect("/login");
    }
});

app.post("/register", async (req,res) => {
    const isUserTaken = await verifyUsername(req.body["regusername"]);
    if (isUserTaken) {
        res.redirect("/register");
    }
    const userID = await createUser(req.body["regusername"], req.body["regpassword"]);
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