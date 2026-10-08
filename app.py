from flask import Flask, render_template, request, jsonify
import sqlite3
import hashlib
import secrets
import string
import re
from pathlib import Path

app = Flask(__name__)

DATABASE_DIR = Path("database")
DATABASE_DIR.mkdir(exist_ok=True)

DATABASE = DATABASE_DIR / "passwords.db"


# -----------------------------
# Database Setup
# -----------------------------

def init_database():
    connection = sqlite3.connect(DATABASE)

    cursor = connection.cursor()

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS password_history (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            password_hash TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)

    connection.commit()
    connection.close()


# -----------------------------
# Password Hashing
# -----------------------------

def hash_password(password):
    """
    Creates a SHA-256 hash for demonstration purposes.
    Never store plaintext passwords.
    """

    return hashlib.sha256(
        password.encode("utf-8")
    ).hexdigest()


# -----------------------------
# Password Strength Analysis
# -----------------------------

def analyze_password(password):

    score = 0
    suggestions = []

    length = len(password)

    has_uppercase = bool(re.search(r"[A-Z]", password))
    has_lowercase = bool(re.search(r"[a-z]", password))
    has_number = bool(re.search(r"[0-9]", password))
    has_special = bool(re.search(r"[^A-Za-z0-9]", password))

    unique_characters = len(set(password))

    # Length
    if length >= 8:
        score += 15

    if length >= 12:
        score += 20

    if length >= 16:
        score += 10

    # Character complexity
    if has_uppercase:
        score += 10
    else:
        suggestions.append("Add uppercase letters.")

    if has_lowercase:
        score += 10
    else:
        suggestions.append("Add lowercase letters.")

    if has_number:
        score += 10
    else:
        suggestions.append("Add numbers.")

    if has_special:
        score += 15
    else:
        suggestions.append(
            "Add special characters such as !, @, # or $."
        )

    # Character uniqueness
    if length > 0 and unique_characters >= min(8, length):
        score += 10
    else:
        suggestions.append(
            "Use more unique characters."
        )

    # Length suggestion
    if length < 12:
        suggestions.append(
            "Use at least 12 characters."
        )

    # Repeated characters
    if re.search(r"(.)\1\1", password):
        score -= 10
        suggestions.append(
            "Avoid repeating the same character multiple times."
        )

    score = max(0, min(score, 100))

    # Strength
    if length == 0:
        strength = "Enter a password"
    elif score < 30:
        strength = "Very Weak"
    elif score < 50:
        strength = "Weak"
    elif score < 70:
        strength = "Moderate"
    elif score < 90:
        strength = "Strong"
    else:
        strength = "Very Strong"

    return {
        "score": score,
        "strength": strength,
        "length": length,
        "uppercase": has_uppercase,
        "lowercase": has_lowercase,
        "number": has_number,
        "special": has_special,
        "unique": unique_characters >= min(8, length)
        if length > 0 else False,
        "suggestions": suggestions
    }


# -----------------------------
# Generate Strong Password
# -----------------------------

def generate_password(length=18):

    uppercase = string.ascii_uppercase
    lowercase = string.ascii_lowercase
    numbers = string.digits
    special = "!@#$%^&*()-_=+"

    all_characters = (
        uppercase +
        lowercase +
        numbers +
        special
    )

    # Guarantee complexity
    password = [
        secrets.choice(uppercase),
        secrets.choice(lowercase),
        secrets.choice(numbers),
        secrets.choice(special)
    ]

    for _ in range(length - 4):
        password.append(
            secrets.choice(all_characters)
        )

    # Secure shuffle
    secrets.SystemRandom().shuffle(password)

    return "".join(password)


# -----------------------------
# Check Password Reuse
# -----------------------------

def check_password_reuse(password):

    password_hash = hash_password(password)

    connection = sqlite3.connect(DATABASE)

    cursor = connection.cursor()

    cursor.execute(
        """
        SELECT id
        FROM password_history
        WHERE password_hash = ?
        """,
        (password_hash,)
    )

    result = cursor.fetchone()

    connection.close()

    return result is not None


# -----------------------------
# Save Password Hash
# -----------------------------

def save_password_hash(password):

    password_hash = hash_password(password)

    connection = sqlite3.connect(DATABASE)

    cursor = connection.cursor()

    cursor.execute(
        """
        INSERT INTO password_history (password_hash)
        VALUES (?)
        """,
        (password_hash,)
    )

    connection.commit()
    connection.close()


# -----------------------------
# Home Page
# -----------------------------

@app.route("/")
def home():

    return render_template("index.html")


# -----------------------------
# Analyze API
# -----------------------------

@app.route("/analyze", methods=["POST"])
def analyze():

    data = request.get_json()

    password = data.get("password", "")

    if not password:
        return jsonify({
            "error": "Password cannot be empty."
        }), 400

    result = analyze_password(password)

    result["reused"] = check_password_reuse(password)

    return jsonify(result)


# -----------------------------
# Generate API
# -----------------------------

@app.route("/generate", methods=["GET"])
def generate():

    password = generate_password(18)

    return jsonify({
        "password": password
    })


# -----------------------------
# Save Password Hash API
# -----------------------------

@app.route("/save-password", methods=["POST"])
def save_password():

    data = request.get_json()

    password = data.get("password", "")

    if not password:
        return jsonify({
            "error": "Password cannot be empty."
        }), 400

    if check_password_reuse(password):

        return jsonify({
            "success": False,
            "message": "This password has been used before."
        })

    save_password_hash(password)

    return jsonify({
        "success": True,
        "message": "Password hash saved successfully."
    })


# -----------------------------
# Start Application
# -----------------------------

if __name__ == "__main__":

    init_database()

    app.run(
        debug=True,
        host="127.0.0.1",
        port=5000
    )