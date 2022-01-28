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

module.exports = getUserByEmail;