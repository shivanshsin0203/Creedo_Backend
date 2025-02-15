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
const PostSchema = new mongoose.Schema({
  creator: String,
  title: String,
  discription: String,
  image: [String],
  likes: {
    type: Number,
    default: 0,
  },
});
const CommnetSchema = new mongoose.Schema({
  postid: String,
  comment: String,
  creator: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});
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
  name: String,
  picture: { type: String, default: null },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});
const ConnectionSchema = new mongoose.Schema({
  user: String,
  freind_name: String,
  freind_picture: {
    type: String,
    default: null,
  },
  freind_email: String,
});
const User = mongoose.model("user", UserSchema);
const FrRequest = mongoose.model("friendrequest", FriendRequestSchema);
const Connection = mongoose.model("connection", ConnectionSchema);
const Post = mongoose.model("post", PostSchema);
const Comment = mongoose.model("comment", CommnetSchema);
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
  const IsConnection = await Connection.findOne({
    freind_email: email.to,
    user: email.from,
  });
  if (IsConnection) {
    return "Already_Friends";
  }
  const IsRequestSent = await FrRequest.findOne({
    to: email.to,
    from: email.from,
  });
  if (IsRequestSent) {
    return "Request_Already_Sent";
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
    if (result === "Already_Friends") {
      return res.json({ message: "You are already friends", result: false });
    }
    if (result === "Request_Already_Sent") {
      return res.json({
        message: "Friend Request already sent",
        result: false,
      });
    }
    if (result === "Success") {
      return res.json({ message: "Friend Request Sent", result: true });
    }
  }
  check();
});
app.post("/getfriendrequests", async (req, res) => {
  const result = await FrRequest.find({ to: req.body.email });
  res.json({ result: result });
});
app.post("/acceptfriendrequest", async (req, res) => {
  const destroy = await FrRequest.deleteOne({ _id: req.body.requestid });
  const result1 = await Connection.create({
    user: req.body.user1_email,
    freind_name: req.body.user2_name,
    freind_picture: req.body.user2_picture,
    freind_email: req.body.user2_email,
  });
  const result2 = await Connection.create({
    user: req.body.user2_email,
    freind_name: req.body.user1_name,
    freind_picture: req.body.user1_picture,
    freind_email: req.body.user1_email,
  });
  res.json({ message: "Friend Request Accepted" });
});
app.post("/deletefriendrequest", async (req, res) => {
  const destroy = await FrRequest.deleteOne({ _id: req.body.requestid });
});
app.post("/getconnections", async (req, res) => {
  const result = await Connection.find({ user: req.body.email });
  res.json({ result: result });
});
app.post("/createpost", async (req, res) => {
  const result = await Post.create(req.body);
  res.json({ message: "Post Created" });
});
app.post("/posts", async (req, res) => {
  const result = await Post.find();
  result.reverse();
  if (result.length < req.body.posts + 2) {
    res.json({ data: "No More Posts" });
  } else {
    res.json({ data: result.slice(req.body.posts, req.body.posts + 2) });
  }
});
app.post("/finduser", async (req, res) => {
  const result = await User.find({ email: req.body.email });
  res.json({ result: result });
});
app.post("/updatelike", async (req, res) => {
  const result = await Post.findByIdAndUpdate(req.body.id, {
    $inc: { likes: 1 },
  });
  res.json({ message: "Like Updated" });
});
app.post("/getpostbyid", async (req, res) => {
  const result = await Post.findById(req.body.id);
  res.json({ result: result });
});
app.post("/addcomment", async (req, res) => {
  const result = await Comment.create(req.body);
  res.json({ message: "Comment Added" });
});
app.post("/getcomments", async (req, res) => {
  const result = await Comment.find({ postid: req.body.postid });
  res.json({ result: result });
});
app.post("/isfriend", async (req, res) => {
  const result = await Connection.findOne({
    user: req.body.user,
    freind_email: req.body.freind,
  });
  if (result) {
    res.json({ result: true });
  } else {
    res.json({ result: false });
  }
});
app.post("/getpostbymail", async (req, res) => {
  const result = await Post.find({ creator: req.body.email });
  res.json({ result: result });
});
app.get("/test",async(req,res)=>{
 res.json({message:"Hello World"})
})
app.listen(3005, async () => {
  console.log("Server Started at " + 3005);
  await connect();
  console.log("Connected to database");
});
