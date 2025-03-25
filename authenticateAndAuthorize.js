export function authenticate(req, res, next) {
    if (!req.session.userID) {
        return res.redirect("/login");
    }
    next();
}
export function verifyInput(req) {
    if (req.body["regusername"].length < 3) {
        throw new Error("Username too short (3 characters at least)");
    } else if (req.body["regpassword"].length < 6) {
        throw new Error ("Password too short (6 characters at least)");
    }

    return {
        username: req.body["regusername"].trim(),
        password: req.body["regpassword"].trim(),
    }
}