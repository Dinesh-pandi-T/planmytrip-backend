const User = require("../Models/UserModel")

const SignUpUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                message: "Account already exists with this email."
            });
        }
        const NewUser = new User({
            name,
            email,
            password
        });
        const SavedUser = await NewUser.save();
        res.status(200).json({
            message: "User Register successfully",
            data: SavedUser,
        });
    }
    catch (error) {
        res.status(400).json({
            message: "user Registration Failed",
            error: error.message
        });
    }
};

const LoginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({
                message: "Invalid email or password. Please try again or create an account."
            });
        }

        if (user.password !== password) {
            return res.status(400).json({
                message: "Invalid email or password. Please try again or create an account."
            });
        }

        res.status(200).json({
            message: "Login successful",
            data: {
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    }
    catch (error) {
        res.status(400).json({
            message: "Login failed",
            error: error.message
        });
    }
};

module.exports = {
    SignUpUser,
    LoginUser
}