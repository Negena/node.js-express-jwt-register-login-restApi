const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const User = require("./db/db")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const JWT_SECRET = "dnklslnsilgwpgpwo4ypy4pyp49yu24hrw"
mongoose.connect('mongodb+srv://user1:useronce@cluster0.txaa5.mongodb.net/authes', (err) => {
  if (err) throw err;
  else console.log("connected")
})

const app = express();

app.use(bodyParser.urlencoded({ extended: false }))
app.use("/", express.static(path.join(__dirname, "views")))
app.use(bodyParser.json());


app.post("/register", async (req,res) => {
  const {username, password: plainTextPassword} = req.body

  if (!username || typeof username != "string"){
    return res.json({status: "err", err: "must be a string"})
  }
  if (!plainTextPassword || typeof plainTextPassword != "string"){
    return res.json({status: "err", err: "must be a string"})
  }
  if (plainTextPassword.length < 5 ){
    return res.json({
      status: "err", err: "password is too short"
    })
  }

  const password = await bcrypt.hash(plainTextPassword, 10)
  // console.log(req.body)
  // console.log(password)

try{
  const response = await User.create({
    username,
    password
  })
  console.log("created", response)
}catch(err){
  if (err.code === 11000){
    return res.json({status: "err", err: "a user name already existes"})
  }
  throw err
}
res.json("ok")
});



app.post("/login", async(req,res) => {
  const {username, password} = req.body ;

  const user = await User.findOne({username}).lean()
  if (!user){
    res.json({status: "err", err: "invalid"})
  }

  if (await bcrypt.compare(password, user.password)){

    const token = jwt.sign({
      id: user._id,
      username: user.username
     }, JWT_SECRET
   )
 return res.json({status: "ok", data: token})}

  res.json({status: "ok"})
})

app.listen(3000, () => {
  console.log("works")
})
