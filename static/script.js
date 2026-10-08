const passwordInput =
    document.getElementById("password");

const strengthBar =
    document.getElementById("strengthBar");

const strengthText =
    document.getElementById("strengthText");

const scoreDisplay =
    document.getElementById("score");

const reuseStatus =
    document.getElementById("reuseStatus");


// -------------------------
// Analyze Password
// -------------------------

passwordInput.addEventListener(
    "input",
    analyzePassword
);


async function analyzePassword() {

    const password = passwordInput.value;

    if (!password) {

        resetAnalyzer();

        return;
    }

    try {

        const response = await fetch(
            "/analyze",
            {
                method: "POST",

                headers: {
                    "Content-Type":
                        "application/json"
                },

                body: JSON.stringify({
                    password: password
                })
            }
        );

        const data = await response.json();

        displayResult(data);

    } catch (error) {

        console.error(error);

    }
}


// -------------------------
// Display Results
// -------------------------

function displayResult(data) {

    scoreDisplay.textContent =
        data.score;

    strengthText.textContent =
        data.strength;

    strengthBar.style.width =
        data.score + "%";


    updateRequirement(
        "length",
        data.length >= 12,
        "At least 12 characters"
    );

    updateRequirement(
        "uppercase",
        data.uppercase,
        "Uppercase letter"
    );

    updateRequirement(
        "lowercase",
        data.lowercase,
        "Lowercase letter"
    );

    updateRequirement(
        "number",
        data.number,
        "Number"
    );

    updateRequirement(
        "special",
        data.special,
        "Special character"
    );

    updateRequirement(
        "unique",
        data.unique,
        "Character variety"
    );


    displaySuggestions(
        data.suggestions
    );


    if (data.reused) {

        reuseStatus.textContent =
            "⚠️ This password exists in your password history.";

    } else {

        reuseStatus.textContent =
            "✅ This password has not been found in your local password history.";

    }
}


// -------------------------
// Requirement UI
// -------------------------

function updateRequirement(
    id,
    valid,
    text
) {

    const element =
        document.getElementById(id);

    if (valid) {

        element.classList.add("valid");

        element.textContent =
            "✅ " + text;

    } else {

        element.classList.remove("valid");

        element.textContent =
            "❌ " + text;
    }
}


// -------------------------
// Suggestions
// -------------------------

function displaySuggestions(
    suggestions
) {

    const list =
        document.getElementById(
            "suggestions"
        );

    list.innerHTML = "";

    if (
        !suggestions ||
        suggestions.length === 0
    ) {

        const li =
            document.createElement("li");

        li.textContent =
            "Excellent! Your password meets the recommended requirements.";

        list.appendChild(li);

        return;
    }


    suggestions.forEach(
        function (suggestion) {

            const li =
                document.createElement("li");

            li.textContent =
                suggestion;

            list.appendChild(li);

        }
    );
}


// -------------------------
// Show / Hide Password
// -------------------------

document
    .getElementById("togglePassword")
    .addEventListener(
        "click",
        function () {

            if (
                passwordInput.type ===
                "password"
            ) {

                passwordInput.type =
                    "text";

                this.textContent =
                    "🙈";

            } else {

                passwordInput.type =
                    "password";

                this.textContent =
                    "👁";
            }
        }
    );


// -------------------------
// Generate Password
// -------------------------

document
    .getElementById(
        "generatePassword"
    )
    .addEventListener(
        "click",
        generatePassword
    );


async function generatePassword() {

    try {

        const response =
            await fetch("/generate");

        const data =
            await response.json();

        document
            .getElementById(
                "generatedPassword"
            )
            .value =
            data.password;

    } catch (error) {

        console.error(error);

    }
}


// -------------------------
// Copy Password
// -------------------------

document
    .getElementById("copyPassword")
    .addEventListener(
        "click",
        async function () {

            const password =
                document.getElementById(
                    "generatedPassword"
                ).value;

            if (!password) {

                alert(
                    "Generate a password first."
                );

                return;
            }

            await navigator.clipboard
                .writeText(password);

            this.textContent =
                "Copied!";

            setTimeout(
                () => {

                    this.textContent =
                        "Copy";

                },
                1500
            );
        }
    );


// -------------------------
// Save Password Hash
// -------------------------

document
    .getElementById("savePassword")
    .addEventListener(
        "click",
        savePassword
    );


async function savePassword() {

    const password =
        passwordInput.value;

    if (!password) {

        alert(
            "Enter a password first."
        );

        return;
    }


    try {

        const response =
            await fetch(
                "/save-password",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({
                        password: password
                    })
                }
            );

        const data =
            await response.json();


        reuseStatus.textContent =
            data.message;

    } catch (error) {

        console.error(error);

    }
}


// -------------------------
// Reset
// -------------------------

function resetAnalyzer() {

    scoreDisplay.textContent = "0";

    strengthText.textContent =
        "Enter a password";

    strengthBar.style.width =
        "0%";

    reuseStatus.textContent =
        "Password reuse status will appear here.";


    updateRequirement(
        "length",
        false,
        "At least 12 characters"
    );

    updateRequirement(
        "uppercase",
        false,
        "Uppercase letter"
    );

    updateRequirement(
        "lowercase",
        false,
        "Lowercase letter"
    );

    updateRequirement(
        "number",
        false,
        "Number"
    );

    updateRequirement(
        "special",
        false,
        "Special character"
    );

    updateRequirement(
        "unique",
        false,
        "Character variety"
    );
}