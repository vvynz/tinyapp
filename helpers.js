// a function that checks whether an email exists in our database
function getUserByEmail(userEmail, users) {
  let userIDS = Object.keys(users);
  for (let userID of userIDS) {
    if (users[userID].email === userEmail) {
      return users[userID];
    }
  }
  return undefined;
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

module.exports = { getUserByEmail, urlsForUser };