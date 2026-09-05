const passwordInput = document.getElementById("password");
const strengthBar = document.getElementById("strengthBar");
const strengthText = document.getElementById("strengthText");
const scoreDisplay = document.getElementById("score");

const commonPasswords = [
    "password",
    "password123",
    "123456",
    "12345678",
    "123456789",
    "qwerty",
    "qwerty123",
    "admin",
    "admin123",
    "welcome",
    "letmein",
    "iloveyou"
];

passwordInput.addEventListener("input", analyzePassword);

function analyzePassword() {

    const password = passwordInput.value;

    let score = 0;
    let suggestions = [];

    const hasLength = password.length >= 12;
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecial = /[^A-Za-z0-9]/.test(password);

    const uniqueCharacters =
        new Set(password).size >= Math.min(8, password.length);

    const isCommon =
        commonPasswords.includes(password.toLowerCase());

    // Length
    if (password.length >= 8) {
        score += 15;
    }

    if (password.length >= 12) {
        score += 20;
    }

    if (password.length >= 16) {
        score += 10;
    }

    // Complexity
    if (hasUppercase) {
        score += 10;
    }

    if (hasLowercase) {
        score += 10;
    }

    if (hasNumber) {
        score += 10;
    }

    if (hasSpecial) {
        score += 15;
    }

    // Character variety
    if (uniqueCharacters) {
        score += 10;
    }

    // Common password penalty
    if (isCommon) {
        score -= 50;
        suggestions.push(
            "Avoid common passwords such as password123 or 123456."
        );
    }

    // Repeated characters
    if (/(.)\1\1/.test(password)) {
        score -= 10;
        suggestions.push(
            "Avoid using the same character repeatedly."
        );
    }

    score = Math.max(0, Math.min(score, 100));

    updateRequirement("length", hasLength);
    updateRequirement("uppercase", hasUppercase);
    updateRequirement("lowercase", hasLowercase);
    updateRequirement("number", hasNumber);
    updateRequirement("special", hasSpecial);
    updateRequirement("unique", uniqueCharacters);

    if (password.length < 12) {
        suggestions.push(
            "Use at least 12 characters."
        );
    }

    if (!hasUppercase) {
        suggestions.push(
            "Add uppercase letters."
        );
    }

    if (!hasLowercase) {
        suggestions.push(
            "Add lowercase letters."
        );
    }

    if (!hasNumber) {
        suggestions.push(
            "Add numbers."
        );
    }

    if (!hasSpecial) {
        suggestions.push(
            "Add special characters such as !, @, # or $."
        );
    }

    if (uniqueCharacters === false && password.length > 0) {
        suggestions.push(
            "Use more unique characters."
        );
    }

    updateStrength(score, password);

    displaySuggestions(suggestions);
}


function updateRequirement(id, valid) {

    const element = document.getElementById(id);

    if (valid) {
        element.classList.add("valid");
        element.textContent =
            "✅ " + element.textContent.substring(2);
    } else {
        element.classList.remove("valid");

        if (element.textContent.startsWith("✅")) {
            element.textContent =
                "❌ " + element.textContent.substring(2);
        }
    }
}


function updateStrength(score, password) {

    scoreDisplay.textContent = score;

    strengthBar.style.width = score + "%";

    if (password.length === 0) {

        strengthText.textContent = "Enter a password";

    } else if (score < 30) {

        strengthText.textContent = "Very Weak";

    } else if (score < 50) {

        strengthText.textContent = "Weak";

    } else if (score < 70) {

        strengthText.textContent = "Moderate";

    } else if (score < 90) {

        strengthText.textContent = "Strong";

    } else {

        strengthText.textContent = "Very Strong";
    }
}


function displaySuggestions(suggestions) {

    const list = document.getElementById("suggestionList");

    list.innerHTML = "";

    if (suggestions.length === 0) {

        const li = document.createElement("li");

        li.textContent =
            "Excellent! Your password meets the recommended requirements.";

        list.appendChild(li);

        return;
    }

    suggestions.forEach(function(suggestion) {

        const li = document.createElement("li");

        li.textContent = suggestion;

        list.appendChild(li);

    });
}


// Show / Hide Password

document
    .getElementById("togglePassword")
    .addEventListener("click", function() {

        if (passwordInput.type === "password") {

            passwordInput.type = "text";
            this.textContent = "🙈";

        } else {

            passwordInput.type = "password";
            this.textContent = "👁";
        }

    });


// Generate Strong Password

document
    .getElementById("generatePassword")
    .addEventListener("click", function() {

        const generated = generateStrongPassword(18);

        document.getElementById("generatedPassword").value =
            generated;

    });


function generateStrongPassword(length) {

    const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const lowercase = "abcdefghijklmnopqrstuvwxyz";
    const numbers = "0123456789";
    const special = "!@#$%^&*()-_=+";

    const all =
        uppercase +
        lowercase +
        numbers +
        special;

    let password = "";

    // Ensure complexity requirements

    password += randomCharacter(uppercase);
    password += randomCharacter(lowercase);
    password += randomCharacter(numbers);
    password += randomCharacter(special);

    for (let i = password.length; i < length; i++) {

        password += randomCharacter(all);

    }

    return shuffle(password);
}


function randomCharacter(characters) {

    const index =
        Math.floor(Math.random() * characters.length);

    return characters[index];
}


function shuffle(string) {

    return string
        .split("")
        .sort(() => Math.random() - 0.5)
        .join("");
}


// Copy Generated Password

document
    .getElementById("copyPassword")
    .addEventListener("click", async function() {

        const generated =
            document.getElementById("generatedPassword").value;

        if (!generated) {
            alert("Generate a password first.");
            return;
        }

        await navigator.clipboard.writeText(generated);

        this.textContent = "Copied!";

        setTimeout(() => {

            this.textContent = "Copy";

        }, 1500);

    });