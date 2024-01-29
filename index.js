const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const cors = require("cors");
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();
const mongoUrl = process.env.mongoUrl;
const connect = async () => {
  await mongoose.connect(mongoUrl);
};

const UserSchema = new mongoose.Schema({
  family_name: String,
  given_name: String,
  picure: {
    type: String,
    default: null,
  },
  email: String,
  id: String,
});
const FriendRequestSchema = new mongoose.Schema({
  to: String,
  from: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});
const User = mongoose.model("user", UserSchema);
const FrRequest = mongoose.model("friendrequest", FriendRequestSchema);
const isValidEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};
async function checkFriendRequest(email) {
  if (!isValidEmail(email.to)) {
    return "Invalid_Email";
  }
  console.log(isValidEmail(email.to) + "email");
  const UserPresent = await User.findOne({ email: email.to });
  if (!UserPresent) {
    return "User_Not_Found";
  }
  if (email.from === email.to) {
    return "Same_Email";
  }
  const result = await FrRequest.create(email);
  return "Success";
}

app.post("/register", (req, res) => {
  console.log(req.body);
  const user = new User(req.body);
  async function saveUser() {
    const present = await User.findOne({ email: user.email });
    if (present) {
      return console.log("User already exists");
    } else {
      const result = await User.create(user);
    }
  }
  saveUser();
  res.send({ message: "Data received" });
});
app.post("/addfriend", (req, res) => {
  async function check() {
    console.log(req.body);
    const result = await checkFriendRequest(req.body);
    console.log(result + "result");
    if (result === "Invalid_Email") {
      return res.json({ message: "Invalid Email", result: false });
    }
    if (result === "User_Not_Found") {
      return res.json({ message: "User not found", result: false });
    }
    if (result === "Same_Email") {
      return res.json({
        message: "You cannot send request to yourself",
        result: false,
      });
    }
    if (result === "Success") {
      return res.json({ message: "Friend Request Sent", result: true });
    }
  }
  check();
});

app.listen(3005, async () => {
  console.log("Server Started at " + 3005);
  await connect();
  console.log("Connected to database");
});
