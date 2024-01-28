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

const User = mongoose.model("user", UserSchema);

app.post("/register", (req, res) => {
  console.log(req.body);
  const user = new User(req.body);
  async function saveUser() {
    const present = await User.findOne({ email: user.email })
    if(present) {
    return console.log("User already exists");}
    else{
    const result = await User.create(user);}
  }
  saveUser();
  res.send({ message: "Data received" });
});

app.listen(3005, async () => {
  console.log("Server Started at " + 3005);
  await connect();
  console.log("Connected to database");
});
