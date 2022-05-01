require("dotenv").config();
const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const User = require("./db/db")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const JWT_SECRET = process.env.JWT
mongoose.connect(process.env.DB, (err) => {
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

app.get("/login", (req,res) => {
  res.sendFile("./views/login.html", {root: __dirname})
})

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

app.post("/change-password", async(req,res) => {
  const {token, newpassword} = req.body
  try{
    const user = jwt.verify(token, JWT_SECRET)
    const _id = user.id
    const hashedPassword = await bcrypt.hash(newpassword)
    await User.updateOne({_id}, {
      $set: {
        password: hashedPassword
      }
    })
  }catch(err) {
    res.json({status: "err", err: "error occured"})
  }
  res.json({status: "ok"})
})

app.listen(3000, () => {
  console.log("works")
})
