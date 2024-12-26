import { $ } from "./lib/dom";
import { displayAlert } from "./lib/popup";
import { checkUsername, login } from "./login_method";

async function availableName(name: string): Promise<availableName> {
    try {
        const res = await fetch('/api/nameavailable?name=' + name);

        if (res.status !== 200) {
            console.error('Internal server error');
            return { error: true, exists: false };
        }

        const data: availableName = JSON.parse(await res.text());
        return data;
    } catch (error) {
        console.error(error);
        return { error: true, exists: false };
    }
}

$('form').on('submit', async (e) => {
    e.preventDefault();

    // create signup shema
    const inputs: singupInput = {
        username: $('input[name="username"]').value!,
        password: $('input[name="password"]').value!,
        rePassword: $('input[name="re-password"]').value!,
        email: $('input[name="mail"]').value,
    };

    // validate inputs
    validatePassword(inputs.password);

    diplicatePassCheck(inputs.password, inputs.rePassword);

    const validName = await validateName(inputs.username);

    if (!validName) {
        return;
    }

    if ($('span.error#wp').e.style.display !== 'none' ||
        $('span.error#dp').e.style.display !== 'none' ||
        $('span.error#wn').e.style.display !== 'none') {
            return;
    }

    const req = JSON.stringify(inputs);
    const res = await fetch('/api/signup', {
        method: "POST",
        headers: {
            'content-type': 'application/json',
            'content-length': req.length.toString()
        },
        body: req
    });

    if (res.status === 200) {
        login(inputs);
    } else {
        displayAlert("An error occured, please try again later");
        (<HTMLFormElement>$('form').e).reset();
    }
});

// some herlpers
async function validateName(name: string) {
    $('span.error#wn').display(false);
    
    if (name === '') {
        return;
    }

    if (!checkUsername(name)) {
        $('span.error#wn').text('please use letters from a-z A-Z, numbers and ". _" only').display(true);
        return false;
    }

    const existsName = await availableName(name);

    if (existsName.error) {
        displayAlert('an Error Occured, please try again.');
        $('body').once('click', () => location.reload());
        $('body').once('keydown', () => location.reload());
        return false;
    }

    if (existsName.exists) {
        $('span.error#wn').text('unavailable username').display(true);
    }

    if (name.length > 30) {
        $('span.error#wn').text('username too long').display(true);
    }

    return true;
}

function validatePassword (password: string) {
    $('span.error#wp').display(false);

    const passInfo = zxcvbn(password);
    
    if (passInfo.score < 3) {
        $('span.error#wp').text(`${passInfo.feedback.warning}, ${passInfo.feedback.suggestions[0]}`).display(true);
    }

    // check password length
    if (password.length < 8) {
        $('span.error#wp').text('the password is so short!').display(true);
    }

    if (password.length > 100) {
        $('span.error#wp').text('the password is so long!').display(true);
    }
}

function diplicatePassCheck(pass: string, pass2: string) {
    $('span.error#dp').display(false);

    if (pass !== pass2) {
        $('span.error#dp').display(true);
    }
}

// check inputs in real time

// username input
$('input[name="username"]').on('input', async (e) => {
    const self = <HTMLInputElement>e.target;
    validateName(self.value);
})

// password input
$('input[name="password"]').on('input', async (e) => {
    const self = <HTMLInputElement>e.target;
    validatePassword(self.value);
});

// re-entering password
$('input[name="re-password"]').on('input', async (e) => {
    const self = <HTMLInputElement>e.target;
    diplicatePassCheck(self.value, $('input[name="password"]').value || '');
});