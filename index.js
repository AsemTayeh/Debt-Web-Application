import { createUser } from "./queries.js";
import { verifyUsername } from "./queries.js";
import { verifyUserLogin } from "./queries.js";
import { getUserName } from "./queries.js";
import { getDebts } from "./queries.js";
import { setMessage } from "./queries.js";
import { insertRecord } from "./queries.js";
import { checkIfUserCanViewRecord } from "./queries.js";
import flash from "connect-flash"
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

app.use(flash());
app.use((req, res, next) => {
    res.locals.successMessage = req.flash("success");
    res.locals.errorMessage = req.flash("error");
    next();
});

// Fix styling in debts.ejs for cards, use user tees pass tees to see cards
// Add routing for /view/:id etc, which are sent also from debts.ejs
// add views for view, update, delete
// When handling view/blogID and update, make sure to query BEFORE to know if the user can see
// said blog ID

app.get("/update/:id", async (req,res) => {
    if (!req.session.userID) {
        res.redirect("/login");
    } else {
        const canSee = await checkIfUserCanViewRecord(req.params.id, req.session.userID); // handles record and user existence as well
        if (!canSee) {
            res.status(404).sendFile("Four0Four.html", {root: "public"});
        } else {
            res.render("update.ejs", {
                objArrayOneEl: canSee
            });
        }
    }
});

app.get("/view/:id", async (req,res) => {
    if (!req.session.userID) {
        res.redirect("/login");
    } else {
        const canSee = await checkIfUserCanViewRecord(req.params.id, req.session.userID); // handles record and user existence as well
        if (!canSee) {
            res.status(404).sendFile("Four0Four.html", {root: "public"});
        } else {
            res.render("view.ejs", {
                objArrayOneEl: canSee
            });
        }
    }
});

app.post("/add-debt", async (req,res) => {
    if (!req.session.userID) {
        res.redirect("/login");
    } else {
        await insertRecord(req.body["value"], req.body["note"], req.session.userID);
        req.flash("success", "Record added successfully!");
        res.redirect("/home");
    }
});

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