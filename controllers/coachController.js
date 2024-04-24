const coachModel =require('../models/coachModel');
const mongoose=require('mongoose');
const jwt=require('jsonwebtoken')

const maxAge=3 * 24 * 60 * 60;//3 days
createToken=(id)=>{
  return jwt.sign({id},process.env.JWT,{
    expiresIn: maxAge
  })
}

const signup= async(req,res)=>{

 
  const {emailID,password}=req.body;
  const coach=await coachModel.findOne({emailID})

  if(!coach){
    try{
      const coach=await coachModel.create({emailID,password})
      console.log(coach);
      const token=createToken(coach._id)
      res.cookie('coachid',token, { httpOnly: true, maxAge: maxAge * 1000 })
      res.status(200).json(coach);
    }
    catch(err){
      return res.status(400).json({error:err});
    }
    
  }
  else{
    res.status(400).json({error:"already exists"});
  }

}

const login= async(req,res)=>{
  const {emailID,password}=req.body;
  try{
    coach=await coachModel.login(emailID,password)
  }
  catch(e){
    return res.status(400).json({error:e.message});
  }

  const token=createToken(coach._id)
  res.cookie('coachid',token, { httpOnly: true, maxAge: maxAge * 1000 })
  res.status(200).json(coach);
}

//we set lifetime to 1 ms so it goes
const logout= async(req,res)=>{
  console.log("okkk")
  res.cookie('coachid','',{maxAge:1});
  return res.status(200).json('')
}


module.exports={
  signup,
  login,
  logout,
}