import { model, Schema, ObjectId } from "mongoose";

const userSchema = new Schema(
  {
    //name of the user
    username: {
      type: String, //type of the field
      trim: true, //trim the white spaces
      required: true, //required field
      max: 32, //maximum length of the field
      unique: true, //unique field
      //   index: true, //index the field
      lowercase: true, //convert the field to lowercase
    },
    name: {
      type: String,
      trim: true,
      default: "Enter your name", //default value of the field
      required: true,
      max: 32,
    },
    email: {
      type: String,
      trim: true,
      required: true,
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
      maxLenght: 256,
    },
    address: { type: String, default: "Enter your address" },
    company: { type: String, default: "Enter your company" },
    phone: { type: String, default: "" },
    photo: {},
    role: {
      type: [String],
      default: ["Subscriber"], //default value of the field
      enum: ["Subscriber", "Seller", "Admin"], //enum values of the field
    },
    enquiredProperties: [{ type: ObjectId, ref: "Ad" }], //array of object id and reference to the Property model
    wishlist: [{ type: ObjectId, ref: "Ad" }], //array of object id and reference to the Property model
    resetCode: {
      type: String, //This ensures the resetCode field is properly typed as a string
      default: "",
    },
  },
  { timestamps: true }
);

export default model("User", userSchema); //User is the name of the model and userSchema is the schema of the model
