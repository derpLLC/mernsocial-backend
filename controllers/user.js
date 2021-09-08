import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

import User from '../models/user.js'


export const signin = async(req,res) => {

    const {email, password} = req.body; //Extracting the form details via the POST request from the front end

    try {
        
        const existingUser = await User.findOne({email});   //Searching for the user in the database
        
        if(!existingUser)
            return res.status(404).json({message:"User doesn't exist."});
        
        const isPasswordcorrect = await bcrypt.compare(password,existingUser.password)    

        if(!isPasswordcorrect)
            return res.status(404).json({message:"Invalid credentials."})

        const token = jwt.sign({email: existingUser.email, id:existingUser._id} , 'sounav201', {expiresIn:"1h"})


        res.status(200).json({result:existingUser,token})

    } catch (error) {

        res.status(500).json({message:"Something went wrong"});
        
    }

}


export const signup = async(req,res) => {


    const {email,password, confirmPassword, firstName,lastName} = req.body;

    try {
        
        const existingUser = await User.findOne({email});   //Searching for the user in the database
        
        if(existingUser)
            return res.status(404).json({message:"User already exists."});

        if(password != confirmPassword)
            return res.status(404).json({message:"Passwords don't match"});


        const hashedPassword = await bcrypt.hash(password,12); 
        
        
        const result = await User.create({email, password:hashedPassword, name:`${firstName} ${lastName}`})

        const token = jwt.sign({email: result.email, id:result._id} , 'sounav201', {expiresIn:"1h"})

        res.status(200).json({result,token});

    } catch (error) {
        res.status(500).json({message:"Something went wrong"});

    }



}

