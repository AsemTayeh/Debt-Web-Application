function authenticate(req, res, next) {
    if (!req.session.userID) {
        return res.redirect("/login");
    }
    next();
}

function verifyLoginInput(req) {
    if (req.body["username"].length < 3) {
        throw new Error("Username too short (3 characters at least)");
    } else if (req.body["password"].length < 6) {
        throw new Error ("Password too short (6 characters at least)");
    }

    return {
        username: req.body["username"].trim(),
        password: req.body["password"].trim(),
    }
}

function verifyRecordInput(amount, note) {
    if (amount.length === 0) {
        throw new Error("Note can't be empty");
    }

    return {
        amount: parseFloat(amount.trim()),
        note: note.trim()
    }
}
function setMessage(loginType) {
    let message = "";
    if (loginType === "login") {
        message = "Welcome back ";
    } else {
      message = "Welcome ";
    }
    return message;
  }

export { authenticate, verifyLoginInput, verifyRecordInput, setMessage};