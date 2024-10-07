import * as config from "../config.js";
import jwt from "jsonwebtoken";
import { emailTemplate } from "../helpers/email.js";
import { hashPassword, comparePassword } from "../helpers/auth.js";
import User from "../models/userModel.js";
import { nanoid } from "nanoid";
import validator from "email-validator";

//token and user response
const tokenAndUserRespone = (req, res, user) => {
  const token = jwt.sign({ _id: user._id }, config.JWT_SECRET, {
    expiresIn: "1h",
  });
  const refreshToken = jwt.sign({ _id: user._id }, config.JWT_SECRET, {
    expiresIn: "7d",
  });

  user.password = undefined;
  user.resetCode = undefined;

  return res.json({ token, refreshToken, user });
};

export const welcome = (req, res) => {
  res.json({
    data: "Hello from server ",
  });
};

export const preRegister = async (req, res) => {
  try {
    // console.log(req.body);

    const { email, password } = req.body;

    //validating the email
    if (!validator.validate(email)) {
      return res.json({ error: "A valid email is required" });
    }
    if (!password || password.length < 6) {
      return res.json({
        error: "Password is required and should be at least 6 characters long",
      });
    }

    const user = await User.findOne({ email });
    if (user) {
      return res.json({ error: "Email is taken" });
    }
    const token = jwt.sign({ email, password }, config.JWT_SECRET, {
      expiresIn: "1h",
    });
    config.AWSSES.sendEmail(
      emailTemplate(
        email,
        `
        <p>Please click on the link below to activate your account</p>
        <a href="${config.CLIENT_URL}/auth/account-activate/${token}">Activate my account</a>
        `,
        config.REPLY_TO,
        "Activate your account"
      ),
      (err, data) => {
        if (err) {
          console.log(err);
          return res.json({
            error: "Something went wrong. Try again.",
          });
        } else {
          console.log;
          return res.json({
            data: "Email has been sent to your email. Click on the link to complete your registration",
          });
        }
      }
    );
  } catch (error) {
    console.log(error);
    return res.json({ error: "Something went wrong. Try again." });
  }
};

export const register = async (req, res) => {
  try {
    // console.log(req.body);
    const { email, password } = jwt.verify(req.body.token, config.JWT_SECRET);

    const userExist = await User.findOne({ email });
    if (userExist) {
      return res.json({ error: "Email is taken" });
    }

    //check if the user exists in the database
    const hashedPassword = await hashPassword(password);

    const user = await new User({
      username: nanoid(6),
      email,
      password: hashPassword,
    }).save();

    tokenAndUserRespone(req, res, user);
  } catch (error) {
    console.log(error);
    return res.json({ error: "Expired link. Try again." });
  }
};

export const login = async (req, res) => {
  try {
    // console.log(req.body);
    const { email, password } = req.body;
    //check if the user exists in the database

    //find user by email
    const user = await User.findOne({ email });

    //compare password
    const match = await comparePassword(password, user.password);
    if (!match) {
      return res.json({ error: "Wrong password" });
    }

    tokenAndUserRespone(req, res, user);
  } catch (error) {
    console.log(error);
    return res.json({ error: "Something went wrong. Try again." });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.json({ error: "Email does not exist" });
    } else {
      const resetCode = nanoid();
      user.resetCode = resetCode;
      user.save();
      const jwtToken = jwt.sign({ resetCode }, config.JWT_SECRET, {
        expiresIn: "1h",
      });

      config.AWSSES.sendEmail(
        emailTemplate(
          email,
          `
            <p>Please click on the link below to access your account.</p>
            <a href="${config.CLIENT_URL}/auth/access-account/${jwtToken}">Access your account</a>
            `,
          config.REPLY_TO,
          "Access your account"
        ),
        (err, data) => {
          if (err) {
            console.log(err);
            return res.json({
              error: "Something went wrong. Try again.",
            });
          } else {
            console.log;
            return res.json({
              data: "Email has been sent to your email. Click on the link to reset your password",
            });
          }
        }
      );
    }
  } catch (error) {
    console.log(error);
    return res.json({ error: "Something went wrong. Try again." });
  }
};

//accessController account
export const accessAccount = async (req, res) => {
  try {
    // Log the incoming reset code for debugging
    console.log("Received reset code:", req.body.resetCode);

    // Verify the JWT resetCode
    const decoded = jwt.verify(req.body.resetCode, config.JWT_SECRET);

    // Log the decoded payload for debugging
    console.log("Decoded JWT payload:", decoded);

    const resetCode = decoded.resetCode;

    // Find the user with the resetCode and reset it
    const user = await User.findOneAndUpdate({ resetCode }, { resetCode: "" });

    // Handle case when user is not found
    if (!user) {
      console.log("No user found with reset code:", resetCode);
      return res
        .status(404)
        .json({ error: "User not found or invalid reset code." });
    }

    tokenAndUserRespone(req, res, user);
  } catch (error) {
    console.error("Error in accessAccount:", error);

    // Specific handling for token expiration or invalid signature
    if (error.name === "TokenExpiredError") {
      return res
        .status(401)
        .json({ error: "Reset code has expired. Please request a new one." });
    } else if (error.name === "JsonWebTokenError") {
      return res
        .status(400)
        .json({ error: "Invalid reset code. Please try again." });
    }

    return res.status(500).json({ error: "Something went wrong. Try again." });
  }
};

//refresh token
export const refreshToken = async (req, res) => {
  try {
    // Extract the refresh token from the request body
    const { refresh_token } = req.body;

    if (!refresh_token) {
      return res.status(400).json({ error: "Refresh token is required" });
    }

    // Verify the refresh token
    const decoded = jwt.verify(refresh_token, process.env.JWT_SECRET);

    const user = await User.findById(decoded._id);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Return new access and refresh tokens or whatever response is needed
    tokenAndUserResponse(req, res, user);
  } catch (error) {
    console.log(error);
    return res.status(403).json({ error: "Invalid refresh token" });
  }
};

export const currentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    user.password = undefined;
    user.resetCode = undefined;
    res.json(user);
  } catch (error) {
    console.log(error);
    return res.status(403).json({ error: " Unauthorized" });
  }
};

export const publicProfile = async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    user.password = undefined;
    user.resetCode = undefined;
    res.json(user);
  } catch (error) {
    console.log(error);
    return res.json({ error: "User not found" });
  }
};

export const updatePassword = async (req, res) => {
  try {
    const { password } = req.body;

    if (password) {
      return res.json({ error: "Password is required" });
    }
    if (password && password.length < 6) {
      return res.json({
        error: "Password is required and should be at least 6 characters long",
      });
    }

    const user = await User.findById(req.user._id, {
      paswword: await hashPassword(password),
    });
    return res.json({ data: "Password updated" });
  } catch (error) {
    console.log(error);
    return res.json({ error: "Something went wrong. Try again." });
  }
};
