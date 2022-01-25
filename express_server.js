const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

app.set("view engine", "ejs"); //sets ejs as the view(templating) engine

const bodyParser = require("body-parser"); //bodyParser is need to make certain data readable to humans.
const { response } = require("express");
app.use(bodyParser.urlencoded({extended: true}));

const urlDatabase = {
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
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars); //passes the url data to our template
});

app.post("/urls", (req, res) => {
  console.log(req.body); //Log the POST request body to the console
  let randomURL = generateRandomString();
  urlDatabase[randomURL] = req.body.longURL;
  console.log(urlDatabase);

  res.send(`${response.statusCode} Submission received! We will now redirect to...`);
  // res.redirect(`/urls/${randomURL}`);
})

// this route renders the urls_new template in the browser and displays the form to the user
app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] };
  res.render("urls_show", templateVars);
});

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