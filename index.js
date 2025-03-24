import { createUser } from "./queries.js";
import { verifyUsername } from "./queries.js";
import { verifyUserLogin } from "./queries.js";
import { getUserName } from "./queries.js";
import { getDebts } from "./queries.js";
import { setMessage } from "./queries.js";
import { insertRecord } from "./queries.js";
import { checkIfUserCanViewRecord } from "./queries.js";
import { updateRecord } from "./queries.js";
import { deleteRecord } from "./queries.js";
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

// Review

app.post("/debts/:id", async (req,res) => {
    if (!req.session.userID) {
        res.redirect("/login");
    } else {
        const canDelete = await deleteRecord(req.params.id, req.session.userID);
        if (!canDelete) {
            res.status(404).sendFile("Four0Four.html", {root: "public"});
        } else {
            req.flash("success", "Record deleted successfully!");
            res.redirect("/home");
        }
    }
});
app.post("/update-record", async (req,res) => {
    if (!req.session.userID) {
        res.redirect("/login");
    } else {
        const canUpdate = await updateRecord(parseFloat(req.body["updAmount"].trim()), req.body["updNote"].trim(), req.session.userID, parseInt(req.body["updID"]));
        if (!canUpdate) {
            req.flash("error", "Error updating record");
            res.redirect("/home");
        } else {
            req.flash("success", "Updated record successfully!");
            res.redirect("/home");
        }
    }
});
app.get("/update/:id", async (req,res) => {
    if (!req.session.userID) {
        res.redirect("/login");
    } else {
        const debtID = req.params.id;
        const canSee = await checkIfUserCanViewRecord(debtID, req.session.userID); // handles record and user existence as well
        if (!canSee) {
            res.status(404).sendFile("Four0Four.html", {root: "public"});
        } else {
            res.render("update.ejs", {
                objArrayOneEl: canSee,
                debtID: debtID
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
        await insertRecord(parseFloat(req.body["value"].trim()), req.body["note"], req.session.userID);
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
    const verifyUser = await verifyUserLogin(req.body["username"].trim(), req.body["password"].trim());
    if (verifyUser === false) {
        req.flash("error","Incorrect username or password");
        res.redirect("/login");
    } else {
        req.session.userID = verifyUser;
        req.session.loginType = "login";
        res.redirect("/home");
    }
});

app.post("/register", async (req,res) => {
    const isUserTaken = await verifyUsername(req.body["regusername"].trim());
    if (isUserTaken) {
        req.flash("error", "Username is taken");
        res.redirect("/register");
    } else {
        if (req.body["regusername"].length < 3) {
            req.flash("error", "Username too short (3 characters at least)");
            res.redirect("/register");
        } else if (req.body["regpassword"].length < 6) {
            req.flash("error", "Password too short (6 characters at least)");
            res.redirect("/register");
        } else {
            const userID = await createUser(req.body["regusername"].trim(), req.body["regpassword"].trim());
            req.session.userID = userID;
            req.session.loginType = "register";
            res.redirect("/home");
        }
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