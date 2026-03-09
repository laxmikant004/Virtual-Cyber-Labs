const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const pool = require("../config/db");
const transporter = require("../config/mailer");

function generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

//
// REGISTER
//
exports.register = async (req, res) => {

    const { username, email, password } = req.body;

    if (!username || !email || !password) {
        return res.status(400).json({ message: "All fields are required" });
    }

    try {

        const checkUser = await pool.query(
            "SELECT id FROM users WHERE username=$1 OR email=$2",
            [username, email]
        );

        if (checkUser.rows.length > 0) {
            return res.status(400).json({ message: "User already exists" });
        }

        const hash = await bcrypt.hash(password, 12);

        const otp = generateOTP();
        const expiry = new Date(Date.now() + 10 * 60 * 1000);

        await pool.query(
            `INSERT INTO users 
            (username,email,password_hash,otp_code,otp_expiry)
            VALUES($1,$2,$3,$4,$5)`,
            [username, email, hash, otp, expiry]
        );

        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: "CyberLab Verification Code",
            text: `Your OTP is ${otp}`
        });

        res.json({
            message: "OTP sent to email"
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Server error"
        });

    }
};


//
// VERIFY OTP
//
exports.verifyOTP = async (req, res) => {

    const { email, otp } = req.body;

    if (!email || !otp) {
        return res.status(400).json({ message: "Email and OTP required" });
    }

    try {

        const user = await pool.query(
            "SELECT * FROM users WHERE email=$1",
            [email]
        );

        if (user.rows.length === 0) {
            return res.status(400).json({ message: "User not found" });
        }

        const dbUser = user.rows[0];

        if (dbUser.otp_code !== otp) {
            return res.status(400).json({ message: "Invalid OTP" });
        }

        if (new Date() > dbUser.otp_expiry) {
            return res.status(400).json({ message: "OTP expired" });
        }

        await pool.query(
            `UPDATE users 
             SET is_verified=TRUE,
                 otp_code=NULL,
                 otp_expiry=NULL
             WHERE email=$1`,
            [email]
        );

        res.json({
            message: "Account verified successfully"
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Server error"
        });

    }

};


//
// LOGIN
//
exports.login = async (req, res) => {

    const { identifier, password } = req.body;

    if (!identifier || !password) {
        return res.status(400).json({ message: "Missing credentials" });
    }

    try {

        const user = await pool.query(
            "SELECT * FROM users WHERE username=$1 OR email=$1",
            [identifier]
        );

        if (user.rows.length === 0) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        const dbUser = user.rows[0];

        if (!dbUser.is_verified) {
            return res.status(403).json({ message: "Email not verified" });
        }

        const validPassword = await bcrypt.compare(
            password,
            dbUser.password_hash
        );

        if (!validPassword) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        const token = jwt.sign(
            { id: dbUser.id, role: dbUser.role },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        );

        res.cookie("token", token, {
            httpOnly: true,
            sameSite: "Strict",
            secure: process.env.NODE_ENV === "production",
            maxAge: 86400000
        });

        res.json({
            message: "Login successful"
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Server error"
        });

    }

};


//
// LOGOUT
//
exports.logout = (req, res) => {

    res.clearCookie("token", {
        httpOnly: true,
        sameSite: "Strict",
        secure: process.env.NODE_ENV === "production"
    });

    res.json({
        message: "Logged out successfully"
    });

};


//
// FORGOT PASSWORD
//
exports.forgotPassword = async (req, res) => {

    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ message: "Email required" });
    }

    try {

        const user = await pool.query(
            "SELECT * FROM users WHERE email=$1",
            [email]
        );

        if (user.rows.length === 0) {
            return res.status(404).json({ message: "User not found" });
        }

        const token = crypto.randomBytes(32).toString("hex");

        const expiry = new Date(Date.now() + 15 * 60 * 1000);

        await pool.query(
            `UPDATE users 
             SET reset_token=$1,
                 reset_token_expiry=$2
             WHERE email=$3`,
            [token, expiry, email]
        );

        const resetLink = `http://localhost:3000/reset-password/${token}`;

        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: "Password Reset",
            text: `Reset your password: ${resetLink}`
        });

        res.json({
            message: "Password reset email sent"
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Server error"
        });

    }

};


//
// RESET PASSWORD
//
exports.resetPassword = async (req, res) => {

    const { token } = req.params;
    const { password } = req.body;

    if (!password) {
        return res.status(400).json({ message: "Password required" });
    }

    try {

        const user = await pool.query(
            "SELECT * FROM users WHERE reset_token=$1",
            [token]
        );

        if (user.rows.length === 0) {
            return res.status(400).json({ message: "Invalid token" });
        }

        const dbUser = user.rows[0];

        if (new Date() > dbUser.reset_token_expiry) {
            return res.status(400).json({ message: "Token expired" });
        }

        const hashedPassword = await bcrypt.hash(password, 12);

        await pool.query(
            `UPDATE users
             SET password_hash=$1,
                 reset_token=NULL,
                 reset_token_expiry=NULL
             WHERE id=$2`,
            [hashedPassword, dbUser.id]
        );

        res.json({
            message: "Password reset successful"
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Server error"
        });

    }

};