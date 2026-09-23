const loginForm = document.getElementById("login-form");
const createAccountForm = document.getElementById("create-account-form");

const loginScreen = document.getElementById("login-screen");
const createAccountScreen = document.getElementById("create-account-screen");

const createAccountLink = document.getElementById("create-account-link");
const backToLogin = document.getElementById("back-to-login");

loginForm.addEventListener("submit", function(event) {
event.preventDefault();


const username = document.getElementById("username").value;

document.getElementById("login-message").textContent =
    "Welcome, " + username + "!";


});

createAccountLink.addEventListener("click", function(event) {
event.preventDefault();


loginScreen.style.display = "none";
createAccountScreen.style.display = "block";


});

backToLogin.addEventListener("click", function(event) {
event.preventDefault();


createAccountScreen.style.display = "none";
loginScreen.style.display = "block";


});

createAccountForm.addEventListener("submit", function(event) {
event.preventDefault();


const fullName = document.getElementById("full-name").value;

document.getElementById("account-message").textContent =
    "Account created for " + fullName + "!";


});


