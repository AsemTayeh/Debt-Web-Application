import { createUser, verifyUsername, verifyUserLogin, getUserName, getDebts, insertRecord, checkIfUserCanViewRecord, updateRecord, deleteRecord, getTotalDebt, pay } from "./queries.js";
import { authenticate, verifyLoginInput, verifyRecordInput, setMessage } from "./middleware/authenticateAndAuthorize.js";
import flash from "connect-flash"
import bodyParser from "body-parser";
import dotenv from "dotenv";
import morgan from "morgan";
import express from "express";
import session from "express-session";

dotenv.config();
const PORT = 3000;
const app = express();

app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended: true}));
app.use(morgan("dev"));

app.use([session({
    secret: process.env.SESSION_SECRET,
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

app.post("/pay/:id", authenticate, async (req,res) => {
    const canPay = await pay(req.params.id, req.session.userID);
    if (!canPay) {
        res.status(404).sendFile("Four0Four.html", {root: "public"});
    } else {
        req.flash("success", "Debt paid off successfully!");
        res.redirect("/debts/home");
    }
});

app.post("/debts/:id/delete", authenticate, async (req,res) => {
    const canDelete = await deleteRecord(req.params.id, req.session.userID);
    if (!canDelete) {
        res.status(404).sendFile("Four0Four.html", {root: "public"});
    } else {
        req.flash("success", "Record deleted successfully!");
        res.redirect("/debts/home");
    }
});

app.post("/debts/:id/update", authenticate, async (req,res) => {
    let validatedRecord;
    try {
        validatedRecord = verifyRecordInput(req.body["updAmount"], req.body["updNote"]); 
    } catch (error) {
        req.flash("error", error.message);
        return res.redirect("/debts/home");
    }
    let canUpdate;
    try {
        canUpdate = await updateRecord(validatedRecord.amount, validatedRecord.note, req.session.userID, req.params.id);
    } catch (error) {
        req.flash("error", error.message);
        return res.redirect("/debts/home");
    }

    if (!canUpdate) {
        req.flash("error", "Error updating record");
    } else {
        req.flash("success", "Updated record successfully!");
    }
    res.redirect("/debts/home");
});
app.get("/update/:id", authenticate, async (req,res) => {
    const canSee = await checkIfUserCanViewRecord(req.params.id, req.session.userID); // handles record and user existence as well

    if (!canSee) {
        res.status(404).sendFile("Four0Four.html", {root: "public"});
    } else {
        res.render("update.ejs", {
        objArrayOneEl: canSee,
        debtID: req.params.id
        });
    }
});

app.get("/view/:id", authenticate, async (req,res) => {
    const canSee = await checkIfUserCanViewRecord(req.params.id, req.session.userID); // handles record and user existence as well
    if (!canSee) {
        res.status(404).sendFile("Four0Four.html", {root: "public"});
    } else {
        res.render("view.ejs", {
        objArrayOneEl: canSee
        });
    }
});

app.post("/debts/create", authenticate, async (req,res) => {
    let validatedRecordInput;
    try {
        validatedRecordInput = verifyRecordInput(req.body["value"], req.body["note"]);
    } catch (error) {
        req.flash("error", error.message);
        return res.redirect("/debts/home");
    }

    try {
        await insertRecord(validatedRecordInput.amount, validatedRecordInput.note, req.session.userID);
        req.flash("success", "Record added successfully!");
    } catch (error) {
        req.flash("error", error.message);
    }

    res.redirect("/debts/home");
});

app.get("/debts/add", authenticate, (req,res) => {
    res.render("add.ejs");
});

app.get("/logout", authenticate, (req,res) => {
    req.session.destroy(err => {
        if (err) return res.send("Error logging out");
        res.redirect("/login");
    });
});

app.get("/debts/home", authenticate, async (req,res) => {
    let message = setMessage(req.session.loginType);
    let debtsArray = await getDebts(req.session.userID);
    let totalDebt = await getTotalDebt(req.session.userID);
    res.render("index.ejs", {
        welcome: message +  await getUserName(req.session.userID) + "!",
        debtsArray: debtsArray,
        totalDebt: totalDebt.totalamount
    });
});

app.post("/login", async (req,res) => {
    let user;
    try {
        user = verifyLoginInput(req);
    } catch (error) {
        req.flash("error", error.message);
        return res.redirect("/login");
    }

    const verifyUser = await verifyUserLogin(user.username, user.password);
    if (verifyUser === false) {
        req.flash("error","Incorrect username or password");
        res.redirect("/login");
    } else {
        req.session.userID = verifyUser;
        req.session.loginType = "login";
        res.redirect("/debts/home");
    }
});

app.post("/register", async (req,res) => {
    let newUser;
    try {
        newUser = verifyLoginInput(req);
    } catch (error) {
        req.flash("error", error.message);
        return res.redirect("/register");
    }

    const isUserTaken = await verifyUsername(newUser.username);
    if (isUserTaken) {
        req.flash("error", "Username is taken");
        res.redirect("/register");
    } else {
        const userID = await createUser(newUser.username, newUser.password);
        req.session.userID = userID;
        req.session.loginType = "register";
        res.redirect("/debts/home");
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