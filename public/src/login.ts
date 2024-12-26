import { login } from "./login_method.js";
import { $, _$ } from "./lib/dom.js";

$('form').on("submit", async (e) => {
    e.preventDefault();

    const input = {
        username: $('[name="username"]').value!,
        password: $('[name="password"]').value!
    }
    
    const auth = await login(input);

    if (!auth) {
        loginError();
    }
})

function loginError () {
    _$("span.error").do(e => e.display(true));
}