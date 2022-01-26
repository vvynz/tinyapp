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
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

// route added for /urls
app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase, username: req.cookies['username'] };
  res.render("urls_index", templateVars); //passes the url data to our template
});

app.post("/urls", (req, res) => {
  // console.log(req.body); //Log the POST request body to the console
  const randomURL = generateRandomString(); //generates a random string as the new random shortURL
  urlDatabase[randomURL] = req.body.longURL; //add the new key and value to the URLDatabase
  // console.log(urlDatabase);

  res.redirect(`/urls/${randomURL}`); //redirect to the new page
});

app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL]; //should delete the resource
  res.redirect("/urls"); //after deleting, redirects back to the index page
});

// get route will render the update page
app.get("/urls/:shortURL/update", (req, res) => {
  let shortURL = req.params.shortURL;
  let longURL = urlDatabase[shortURL];
  let username = req.cookies['username'];
  const templateVars = { shortURL, longURL, username: username };
  res.render("urls_show", templateVars);
});

// post route will take us to the update page and allow the user to update an existing link to a new one
app.post("/urls/:shortURL/update", (req, res) => {
  let shortURL = req.params.shortURL; //short URL here gets the existing shortURL (of the one that the user wants to update)
  let newLongURL = req.body.longURL; //getting the input of the new url from the user
  urlDatabase = { ...urlDatabase, [shortURL]: newLongURL }; //will update the urlDatabase with the newLongURL, and we can see it updated since the get route has rendered the page above
  res.redirect("/urls");
});


// this route renders the urls_new template in the browser and displays the form to the user
app.get("/urls/new", (req, res) => {
  const templateVars = { urls: urlDatabase, username: req.cookies["username"] };
  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  let username = req.cookies["username"];
  let templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL], username };
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  let longURL = urlDatabase[req.params.shortURL];

  if (!longURL.includes("http://")) { //edge case?? user may just enter a www link instead of a http://www link
    longURL = "http://" + longURL;
  };

  res.redirect(longURL);
});

app.post("/login", (req, res) => {
  let username = req.body.username;
  res.cookie("username", username);
  res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  res.clearCookie("username");
  res.redirect("/urls");
})

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

function generateRandomString() {
  const numCharSet = "abcdefghijklmnopqrstuvwxyz0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const length = 6;
  let randomStr = "";

  for (let i = 0; i < length; i++) {
    let output = Math.floor(Math.random() * numCharSet.length);
    randomStr += numCharSet.substring(output, output + 1);
  }
  //  console.log(randomStr);
  return randomStr;
};
// console.log(generateRandomString());