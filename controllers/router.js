const User = require("../models/usermodel.js");

const jwt = require("jsonwebtoken");
const Profile = require("../models/userprofile.js");
const Chat = require('../models/chat.js');

exports.register = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json({ message: "All fields are mandatory" });
    }

    const isExists = await User.findOne({ email });
    if (isExists) {
      return res.status(409).json({ message: "User already exists, try a new email" });
    }

    

    const user = new User({
      username,
      email,
      password,
    });
    const profile = await Profile.create({ user: user._id });
    user.profile = profile._id;
    await user.save();

    return res.status(201).json({ user, profile });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.userlogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).send("All fields are mandatory");
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).send("User not found");
    }

    

    const token = jwt.sign(
      { id: user._id, email: user.email },
      "hahaha",
      { expiresIn: "1d" }
    );

    return res
      .status(200)
      .cookie("authtoken", token, {
        httpOnly: true,
        maxAge: 1 * 24 * 60 * 60 * 1000, // 1 day
      })
      .json({ token });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.getuser = async (req, res) => {
  try {
    const data = await User.find();
    return res.status(200).json({ data });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.updateuserinfo = async (req, res) => {
  try {
   
    const userId = req.params.id 
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    let fileName;
    if (req.file) {
        fileName = `${req.protocol}://${req.get('host')}/${req.file.filename}`;
    } else {
      fileName = "https://www.shutterstock.com/image-vector/default-avatar-profile-icon-social-600nw-1677509740.jpg";
    }

    const { bio, socialLinks, projects, reviews } = req.body;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const profileUpdate = await Profile.findOneAndUpdate(
      { user: userId },
      {
        bio,
        profilepicture: fileName,
        socialLinks,
        projects,
        reviews,
      },
      { new: true, upsert: true } 
    );

    return res.status(200).json({
      message: "User profile updated successfully",
      profile: profileUpdate,
    });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};
