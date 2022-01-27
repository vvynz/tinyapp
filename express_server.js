const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

app.set("view engine", "ejs"); //sets ejs as the view(templating) engine

const bodyParser = require("body-parser"); //bodyParser is need to make certain data readable to humans.
const { response } = require("express");
app.use(bodyParser.urlencoded({extended: true}));

var cookieParser = require('cookie-parser');
app.use(cookieParser());

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
    password: "hello"
  }
};

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

// route added for /urls
app.get("/urls", (req, res) => {
  // let shortURL = ;
  // let longURL = urlDatabase;
  
  const templateVars = { urls: urlDatabase, user: users[req.cookies["user_id"]] };
  // console.log(urlDatabase["b2xVn2"]);

  res.render("urls_index", templateVars); //passes the url data to our template
});

app.post("/urls", (req, res) => {
  if (!req.cookies["user_id"]) {
    return res.send("Sorry you need to be logged in!");
  };
  // console.log(req.body); //Log the POST request body to the console
  const randomURL = generateRandomString(); //generates a random string as the new random shortURL
  const userID = req.cookies["user_id"];
  urlDatabase[randomURL] = { userID, longURL:req.body.longURL }; //add the new key and value to the URLDatabase
  
  res.redirect(`/urls/${randomURL}`); //redirect to the new page
});

app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL]; //should delete the resource
  res.redirect("/urls"); //after deleting, redirects back to the index page
});

// get route will render the update page
app.get("/urls/:shortURL/update", (req, res) => {
  let shortURL = req.params.shortURL;
  let longURL = urlDatabase[shortURL].longURL;
  const templateVars = { shortURL, longURL, user: users[req.cookies["user_id"]] };
  res.render("urls_show", templateVars);
});

// post route will take us to the update page and allow the user to update an existing link to a new one
app.post("/urls/:shortURL/update", (req, res) => {
  let shortURL = req.params.shortURL; //short URL here gets the existing shortURL (of the one that the user wants to update)
  let newLongURL = req.body.longURL; //getting the input of the new url from the user
  // urlDatabase = { ...urlDatabase, [shortURL]: newLongURL }; //will update the urlDatabase with the newLongURL, and we can see it updated since the get route has rendered the page above
  urlDatabase[shortURL].longURL = newLongURL;

  res.redirect("/urls");
});


// this route renders the urls_new template in the browser and displays the form to the user
app.get("/urls/new", (req, res) => {
  if (!req.cookies["user_id"]) {
    return res.send("Sorry! You need to be logged in!");
  };

  const templateVars = { urls: urlDatabase, user: users[req.cookies["user_id"]] };
  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {

  let templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL].longURL, user: users[req.cookies["user_id"]] };
  res.render("urls_show", templateVars);
});


app.get("/u/:shortURL", (req, res) => {
  if (!Object.keys(urlDatabase).includes(req.params.shortURL)) {
    return res.send("<h3>Sorry that short url doesn't exist!</h3>");
  };

  let longURL = urlDatabase[req.params.shortURL].longURL;

  if (!longURL.includes("http://")) { //edge case?? user may just enter a www link instead of a http://www link
    longURL = "http://" + longURL;
  };

  res.redirect(longURL);
});

// GET login route. Renders a login page to the user
app.get("/login", (req, res) => {
  if (req.cookies["user_id"]) {
    res.redirect("/urls");
  } else {
    const templateVars = { user: null };
    res.render("urls_login", templateVars);
  }
});

// POST route (login) receives an email and password from the user
app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  // uses new email & password fields and sets appropriate user_id cookie on successful login


  // if user with an email that can't be found, return a 403 status code
  const user = isUserEmailTaken(email);

  if (user === false) {
    return res.status(403).send("403 Error: Sorry a user with that email doesn't exist!");
  };

  // if email matches with a user, compare that the password on file matches with the existing user's password saved. If it doesn't match, return 403 status code
  if (user) {
    if (user.password !== password ) {
      return res.status(403).send("403 Error: The password doesn't match with what we have on file!");
    } else {
      // if both email and passwords match, set user_id cookie as the user's random id.
      res.cookie("user_id", user.id);
    };
  };

  res.redirect("/urls");
});

// POST route (logout) clears the cookie variable and redirects back to the homepage
app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/urls");
});

// GET route takes users to the registration page 
app.get("/register", (req, res) => {
  if (req.cookies["user_id"]) {
    res.redirect("/urls");
  } else {
    const templateVars = { user:null };
    res.render("urls_registration", templateVars);
  }
});

app.post("/register", (req, res) => {
  let newUserID = generateRandomString();
  const email = req.body.email;
  const password = req.body.password;
 
  if (!email || !password) { //if no email or password are entered
    res.status(400).send("Please enter in an email and a password!");
  };

  // if isUserEmailTaken is true redirect to error page
  if (isUserEmailTaken(email)) {
    return res.status(400).send("That email is already registered!");
  } else {
    // if isUserEmailTaken is false, save the email and new user into our users obj, save the user_id as a cookie and redirect back to /urls
    users[newUserID] = { id: newUserID, email, password };
  };
  
  // users[newUserID] = { id: newUserID, email, password };
  
  res.cookie("user_id", newUserID);
  res.redirect("/urls");
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

function isUserEmailTaken(userEmail) {
  let userIDS = Object.keys(users);
  for (let userID of userIDS) {
    if (users[userID].email === userEmail) {
      return users[userID];
    }
  }
  return false;
};

function generateRandomString() {
  const numCharSet = "abcdefghijklmnopqrstuvwxyz0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const length = 6;
  let randomStr = "";

  for (let i = 0; i < length; i++) {
    let output = Math.floor(Math.random() * numCharSet.length);
    randomStr += numCharSet.substring(output, output + 1);
  }
  return randomStr;
};
