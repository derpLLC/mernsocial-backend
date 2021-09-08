import express from 'express'
import mongoose from 'mongoose'
import PostMessage from '../models/postMessage.js'
const router = express.Router();

export const  getPosts = async (req,res) => {

    const {page} = req.query

    try{
        const LIMIT = 4;
        const startIndex = (Number(page) - 1) * LIMIT //get the starting index of every page

        const total = await PostMessage.countDocuments({})

        const posts = await PostMessage.find().sort({_id:-1}).limit(LIMIT).skip(startIndex)



        res.status(200).json({data:posts,currentPage:Number(page), numberOfPages:Math.ceil(total/LIMIT)});

    }   catch(error){
        res.status(404).json({message:error.message});
    }


}


export const getPost = async(req,res) => {

    const {id} = req.params;
    try {

        const post = await PostMessage.findById(id);

        res.status(200).json(post)
        
    } catch (error) {
        res.status(404).json({message:error.message});
        
    }
}


export const getPostsBySearch = async(req,res) => {
    
    const {searchQuery , tags} = req.query
    
    try {
        const title = new RegExp(searchQuery, 'i');

        const posts = await PostMessage.find({ $or:[{title}, {tags:{$in:tags.split(',')}}] }) //Find me all the posts that match one of the 2 criteria 1-> title 2-> is one of the tags in the array of tags equal to our tags
        
        res.json({ data: posts });

    } catch (error) {
        
        res.status(404).json({message:error.message});
    }
}

export const createPost = async (req,res) => {
    const post = req.body;
    const newPost = new PostMessage({...post, creator:req.userId, createdAt:new Date().toISOString()})
    try {
        await newPost.save()

        res.status(201).json(newPost);
    } catch (error) {
        res.status(409).json({message:error.message})
        
    }
    //res.send('Post Creation');
}


export const updatePost = async (req,res) => {
    const {id : _id} =  req.params;
    const post = req.body;

    if(!mongoose.Types.ObjectId.isValid(_id)) //validation check
        return res.status(404).send('No post with that id');
    
    const updatedPost = await PostMessage.findByIdAndUpdate(_id,{ ...post, _id}, {new:true});    
    
    res.json(updatedPost);
}


export const deletePost = async( req,res) => {
    const {id} = req.params;
    const post = req.body;

    if(!mongoose.Types.ObjectId.isValid(id))//validation check
        return res.status(404).send('No post with that id');

    await PostMessage.findByIdAndRemove(id);

    console.log('DELETE!');

    res.json({message: 'Post deleted successfully '});

}


export const likePost = async (req,res) => {
    const {id} = req.params;

    if(!req.userId)
        return res.json({message:'Unauthenticated User'}); 


    if(!mongoose.Types.ObjectId.isValid(id))//validation check for the post to see if it exists
        return res.status(404).send('No post with that id');

    const post = await PostMessage.findById(id);

    const index = post.likes.findIndex((id) => id === String(req.userId))

    if(index===-1)
    {
        //like the post
        post.likes.push(req.userId);
    }
    else{
        //dislike the post

        post.likes = post.likes.filter((id) => id != String(req.userId)); //Returns the array of all the likes except the current person's likes
    }

    const updatedPost = await PostMessage.findByIdAndUpdate(id, post, {new:true});
    
    res.json(updatedPost);

}


export const commentPost = async(req,res) => {
    const { id } = req.params;
    const { value } = req.body;

    const post = await PostMessage.findById(id);

    post.comments.push(value);

    const updatedPost = await PostMessage.findByIdAndUpdate(id,post,{new:true})

    res.json(updatedPost);

}


export default router;