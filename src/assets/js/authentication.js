import Authentication from 'https://cdn.jsdelivr.net/gh/Mardens-Inc/Authentication-API@8dcd5577b4771f4e50f2c8c7d8b26aa2d9c035bb/js/authentication.js';
import {closePopup, openPopup} from "./popups.js";

const auth = new Authentication();
const loginButton = $("#login-button");
loginButton.on('click', async () => {
    if (auth.isLoggedIn) {
        auth.logout();
        window.location.reload();
    } else {
        const loginForm = await openPopup("login")
        console.log(loginForm)
        loginForm.find('form').on('submit', async (event) => {
            const email = loginForm.find('input[name="username"]').val();
            const password = loginForm.find('input[name="password"]').val();
            const response = await auth.login(email, password);
            console.log(response)
            if (response['success']) {
                closePopup("login");
            } else {
                loginForm.find('.error').text(response['message']);
            }
        });
    }
});

$(auth).on("log-out", () => {
    loginButton.find("img").attr("src", "assets/images/icons/login.svg");
    loginButton.attr('data-title', "Login");
    console.log('logged out')
});

$(auth).on("logged-in", async () => {
    loginButton.find("img").attr("src", "assets/images/icons/logout.svg");
    loginButton.attr('data-title', "Logout");
    console.log('logged in')
});

(async () => {
    try {
        const response = await auth.loginWithTokenFromCookie();
        if (typeof response === 'object') {
            $(auth).trigger('logged-in');
        } else {
            $(auth).trigger('log-out');
        }
    } catch (e) {
        $(auth).trigger('log-out');
    }
})();
