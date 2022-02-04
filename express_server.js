const cookieSession = require('cookie-session')
const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const { getUserByEmail, urlsForUser } = require("./helpers");

app.set("view engine", "ejs"); //sets ejs as the view(templating) engine

const bodyParser = require("body-parser"); //bodyParser is need to make certain data readable to humans.
const { response } = require("express");
app.use(bodyParser.urlencoded({ extended: true }));
const bcrypt = require("bcryptjs");
const { uuid } = require("uuidv4");

app.use(cookieSession({
  name: 'session',
  keys: ["18bb8256-6b75-49d5-828f-0f17e88dd1a2", "8e1724f3-a847-4693-a2a4-b8d11e5ef825"],
}))

let urlDatabase = {
  "b2xVn2": {
    longURL: "http://www.lighthouselabs.ca",
    userID: "aJ48lW"
  },
  "9sm5xK": {
    longURL: "http://www.google.com",
    userID: "aJ48lW"
  }
};

let users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@user.com",
    password: bcrypt.hashSync("hello", 10),
  }
};

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

// route added for /urls
app.get("/urls", (req, res) => {
  if (req.session.user_id) {
    const id = req.session.user_id;
    const userURLs = urlsForUser(id, urlDatabase);
    // if the URLs match to the id in the database, then render the page with their URLs
    const templateVars = { urls: userURLs, user: users[id] };
    res.render("urls_index", templateVars); //passes the url data to our template
  } else {
    // if no user is found, they're re-directed to the login page
    res.redirect("/login");
  }
});

app.post("/urls", (req, res) => {
  const randomURL = uuid().substr(0, 6); //generates a random string as the new random shortURL
  const userID = req.session.user_id;
  urlDatabase[randomURL] = { longURL: req.body.longURL, userID }; //add the new key and value to the URLDatabase

  if (!userID) {
    res.redirect("/login");
  } else {
    res.redirect(`/urls/${randomURL}`); //redirect to the new page
  }

});

// this route renders the urls_new template in the browser and displays the form to the user
app.get("/urls/new", (req, res) => {
  // if a user doesn't exist, or isn't logged in and they try to access this page, they'll be redirected to the error page
  if (!req.session.user_id) {
    return res.send("Sorry! You need to be logged in!");
  };

  const templateVars = { urls: urlDatabase, user: users[req.session.user_id] };
  res.render("urls_new", templateVars);
});

// tinyURLs page for newly created urls
app.get("/urls/:shortURL", (req, res) => {
  const userID = req.session.user_id;
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL].longURL;

  // verifies if the user logged in has an existing account before visiting their urls page
  if (!userID) {
    return res.send("<h2>Sorry you need to be logged in!</h2>");
  }

  const userURLs = urlsForUser(userID, urlDatabase);
  // if a user is accessing another user's urls page, will be directed to this error message
  if (!Object.keys(userURLs).includes(req.params.shortURL)) {
    return res.send("<h2>Sorry access denied! Please make sure you're logged into your account!</h2>");
  }
  // registered & logged in users will be directed to their short urls page
  let templateVars = { shortURL: shortURL, longURL: longURL, user: users[userID] };
  res.render("urls_show", templateVars);
});

//clicking the shortURL link will direct users to the website of the long url
app.get("/u/:shortURL", (req, res) => {
  // if the shortURL id doesn't exist, users will see an error page
  if (!Object.keys(urlDatabase).includes(req.params.shortURL)) {
    return res.send("<h3>Sorry that short url doesn't exist!</h3>");
  };

  let longURL = urlDatabase[req.params.shortURL].longURL;

  if (!longURL.includes("http://")) { //edge case?? user may just enter a www link instead of a http://www link
    longURL = "http://" + longURL;
  };

  res.redirect(longURL);
});

// GET route will render the short urls page
app.get("/urls/:shortURL/update", (req, res) => {
  const userID = req.session.user_id;
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL].longURL;
  const templateVars = { shortURL, longURL, user: users[userID] };
  res.render("urls_show", templateVars);
});

//POST route will take users to the short urls page and allow them to update an existing url
app.post("/urls/:shortURL/update", (req, res) => {
  const shortURL = req.params.shortURL; //short URL here gets the existing shortURL (of the one that the user wants to update)
  const newLongURL = req.body.longURL; //getting the input of the new url from the user
  urlDatabase[shortURL].longURL = newLongURL; //updated urls will be displayed
  const userID = req.session.user_id;

  const userURLs = urlsForUser(userID, urlDatabase);
  //For any user who isn't logged in and tries to update another user's short urls page, they'll see this error message
  if (!Object.keys(userURLs).includes(shortURL)) {
    return res.send("Sorry permission denied. Please login to your account first!");
  }
  // after updating their urls, the user will be redirected back to the /urls (index) page
  res.redirect("/urls");
});

// Delete buttons on the /urls page will allow users to delete an url from their database
app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL;
  const userID = req.session.user_id;

  const userURLs = urlsForUser(userID, urlDatabase);

  // if the shortURL isn't found in the logged in user's own URLs database, they'll be shown an error message
  if (!Object.keys(userURLs).includes(shortURL)) {
    return res.send("Sorry permission denied. Please login first!");
  }

  delete urlDatabase[shortURL]; //should delete the shortURL resource
  res.redirect("/urls"); //after deleting, redirects back to the index page
});

// GET login route. Renders a login page to the user
app.get("/login", (req, res) => {
  const userID = req.session.user_id;

  // if a registered user is logged in, they'll be redirected back to /urls
  if (userID) {
    res.redirect("/urls");
  } else {
    //Users who aren't logged in will be directed to the login page
    const templateVars = { user: null };
    res.render("urls_login", templateVars);
  }
});

// POST route (login) receives an email and password from the user
app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  // if user with an email that can't be found, return a 403 status code
  const user = getUserByEmail(email, users);

  if (user === false) {
    return res.status(403).send("403 Error: Sorry a user with that email doesn't exist!");
  };

  // if email matches with a user, compare that the password on file matches with the existing user's password saved. If it doesn't match, return 403 status code
  if (user && bcrypt.compareSync(password, user.password)) {
    req.session.user_id = user.id;
  } else {
    return res.status(403).send("403 Error: The password doesn't match with what we have on file!");
  }

  res.redirect("/urls");
});

// POST route (logout) clears the cookie variable and redirects back to the homepage
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/urls");
});

// GET route takes users to the registration page 
app.get("/register", (req, res) => {
  // registered users will be redirected to the /urls (index) page
  if (req.session.user_id) {
    res.redirect("/urls");
  } else {
    // if a there's a user that hasn't been registered, they'll be directed to the registration page
    const templateVars = { user: null };
    res.render("urls_registration", templateVars);
  }
});

app.post("/register", (req, res) => {
  // an new ID will be generated once a user registers
  const newUserID = uuid().substr(0, 6);
  const email = req.body.email;
  const password = req.body.password;

  if (!email || !password) { //if no email or password are entered, then an error message will be returned
    res.status(400).send("Please enter in an email and a password!");
  };

  // if a user registers with an existing email, redirect to error page
  if (getUserByEmail(email, users)) {
    return res.status(400).send("That email is already registered!");
  } else {
    //newly registered user's email, password and user ID will be saved into our users obj
    users[newUserID] = { id: newUserID, email, password: bcrypt.hashSync(password, 10) }; //hashing the password
  };

  // save the user_id as a cookie and redirect back to /urls
  req.session.user_id = newUserID;
  res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});