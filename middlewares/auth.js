import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config.js";

export const requireSignin = (req, res, next) => {
  try {
    const decoded = jwt.verify(req.headers.authorization, JWT_SECRET); //verify token
    req.user = decoded; //add user to the request object req.user._id(we have access to the user id)
    next(); //proceed to the next middleware
  } catch (error) {
    console.log(error);
    return res.status(401).json({ error: "Invalid or expired token" });
  }
};
