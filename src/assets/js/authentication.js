import Authentication from 'https://cdn.jsdelivr.net/gh/Mardens-Inc/Authentication-API@9dde338199189bf8bdec2faff12f11229c798c83/js/authentication.js';
import {isDedicatedClient} from "./crossplatform-utility.js";
import {startLoading, stopLoading, updateLoadingOptions} from "./loading.js";
import {alert, closePopup, confirm, openPopup} from "./popups.js";

const auth = new Authentication();
const loginButton = $("#login-button");
const expiration = window.location.protocol === "https:" ? -1 : 365; // If the site is running in debug mode (http), the cookie will expire in 365 days, otherwise it will expire when the browser is closed.
loginButton.on('click', async () => {
    if (!isDedicatedClient) {
        if (["Android", "IOS"].includes(window.os)) {
            alert('This feature is not available on mobile devices <b>Yet</b>.<br><b><i><u>Please use a desktop device to download the dedicated client.</u></i></b>');

            // redirect to google play or ios app store based on the operating system
        } else if (window.os === "Windows") {
            confirm("Are you sure you want to download the dedicated client?<br>This is only used for pricers and administrators and is not intended for store use.", "Download", "Cancel", (value) => {
                if (value) {

                    let url = "";

                    if (["Android", "IOS"].includes(window.os)) {
                        // TODO: Implement mobile version of the pricing app.
                        // redirect to google play or ios app store based on the operating system
                        url = window.os === "Android" ? "https://play.google.com/store/apps/details?id=com.example.app" : "https://itunes.apple.com/app/id123456789";
                        window.open(url, "_blank")
                    } else {
                        // download os specific application
                        const a = document.createElement('a');
                        a.href = "/api/clients/installer";
                        a.click();
                        console.log('downloading...')
                    }
                }

            });
        } else {
            alert('This feature is only available on Windows platforms.<br><b><i><u>Please use a Windows device to download the dedicated client.</u></i></b>');
        }
        return;
    }

    if (auth.isLoggedIn) {
        alert("Are you sure you want to log out?", null, () => {
            auth.logout();
            window.location.reload();
        });
    } else {
        const loginForm = await openPopup("login")
        console.log(loginForm)
        loginForm.find('form').on('submit', async () => {
            startLoading()
            const isRegister = loginForm.hasClass('register');
            const email = loginForm.find('input[name="username"]').val();
            const password = loginForm.find('input[name="password"]').val();
            let response;
            if (isRegister) {
                updateLoadingOptions({message: "Creating account..."})
                response = await auth.register(email, password);
                console.log(response)
            }

            updateLoadingOptions({message: "Logging in..."})
            response = await auth.login(email, password, expiration);
            console.log(response)
            if (response['success']) {
                closePopup("login");
                window.location.reload();
            } else {
                loginForm.find('.error').css('display', "").text(response['message']);
            }
            stopLoading()
        });
    }
});

$(auth).on("log-out", () => {
    loginButton.find("img").attr("src", "assets/images/icons/login.svg");
    loginButton.attr('data-title', "Login");
    $("[authorized-access]").remove();
    console.log('logged out')
    window.localStorage.removeItem("loginPrompt");
});

$(auth).on("logged-in", async () => {
    loginButton.find("img").attr("src", "assets/images/icons/logout.svg");
    loginButton.attr('data-title', "Logout");
    console.log('logged in')

    if (!auth.getUserProfile().admin) {
        $("[authorized-access]").remove();
    }
});
let timeout = 0;
$(document).on('mousemove', () => {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
        auth.logout();
    }, 60 * 60 * 1000) // 1 hour
});


(async () => {
    if (!isDedicatedClient) {
        const button = $("#login-button");
        const icon = window.os === "Windows" ? "fa-brands fa-windows" : window.os === "MacOS" || window.os === "IOS" ? "fa-brands fa-apple" : window.os === "Android" ? "fa-brands fa-android" : window.os === "Linux" ? "fa-brands fa-linux" : "fa-solid fa-download";
        const downloadText = window.os === "IOS" ? "Visit App Store" : window.os === "Android" ? "Visit Google Play" : `Download for ${window.os}`;
        button.html(`<i class="${icon}" style="margin-right: 1rem"></i> ${downloadText}`);
        button.css('aspect-ratio', 'unset')
        button.attr('data-title', "Download app");

        $("[authorized-access]").remove();
    } else {
        try {
            const response = await auth.loginWithTokenFromCookie(expiration);
            if (typeof response !== 'object') {
                $(auth).trigger('log-out');
            }
        } catch (e) {
            $(auth).trigger('log-out');
        }
    }
})();

export default auth;
