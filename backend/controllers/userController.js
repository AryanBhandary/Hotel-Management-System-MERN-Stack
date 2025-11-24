const bcrypt = require ("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require ("../models/userModel");

const register = async (req, res) => {
    try{
        const {username, phone, email, password, role} = req.body;
        
        //Input validation
        if (!username || !phone || !email || !password){
            return res.status(400).json({ message: "Fill in all the fields" });
        }

        //If the user already exists
        const userExists = await User.findOne({ email });
        if( userExists){
            return res.status(400).json({message: `User with ${email} already exists`})
        }


        //Hashed password
        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            username, 
            phone, 
            email, 
            password: hashedPassword, 
            role
        });

        await newUser.save();

        res.status(201).json({message: `${username} registered as ${role}`});
    }
    catch (err){
        res.status(500).json({message: "Something went wrong"});
    }
};

const login = async (req, res) => {
    try{
        const {email, password} = req.body;

        //Input validation
        if (!email || !password){
            return res.status(400).json({ message: "Fill in all the fields" });
        }

        //Checking user existence
        const user = await User.findOne({email});
        if(!user){
            return res.status(404).json({message: `User with ${email} not found`});
        }


        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch)
        {
            return res.status(400).json({message: "Invalid password"});
        }

        const token = jwt.sign(
            {id: user._id, role: user.role}, 
            process.env.JWT_SECRET,
            {expiresIn: "1h"}
        );
        res.status(200).json({token})
    }
    catch (err){
        res.status(500).json({message: "Something went wrong"});
    }
};

module.exports = {
    register,
    login,
}