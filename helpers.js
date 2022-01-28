// a function that checks whether an email exists in our database
function getUserByEmail(userEmail, users) {
  let userIDS = Object.keys(users);
  for (let userID of userIDS) {
    if (users[userID].email === userEmail) {
      return users[userID];
    }
  }
  return false;
};

// a function that returns a user's URLs where the userID is the same to the id of the currently logged in user
function urlsForUser(ID, urlDatabase) {
  let userURLs = {};
  for (let shortURL in urlDatabase) {
    if(urlDatabase[shortURL].userID === ID) {
      userURLs[shortURL] = { longURL: urlDatabase[shortURL].longURL };
    }  
  }
  return userURLs;
};

// a function that generates a random string
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

module.exports = { getUserByEmail, generateRandomString, urlsForUser };