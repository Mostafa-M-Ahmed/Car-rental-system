import { User } from '../../../DB/Models/user.model.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import { ObjectId } from 'mongodb';
dotenv.config();


// ============================ sign up ===============================
export const signUp = async (req, res, next) => {
    const { name, email, password, phone } = req.body

    // hard requirements
    if (!name || !email || !password || !phone) {
        return res.json({ message: 'All fields are required' })
    }

    // check email is unique
    const isEmailExist = await User.findOne({ email });
    if (isEmailExist) {
        return res.json({ message: 'Email already exists' })
    }

    const user = {
        name,
        email,
        password,
        phone
    };

    if (user.password) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
    }

    // create a new user
    const newUser = await User.insertOne(user);

    res.json({ message: 'User signed up successfully', data: newUser })
}


// ================================ sign in ===================================
export const signIn = async (req, res, next) => {
    const { email, password } = req.body


    // find email
    const user = await User.findOne({ email })
    const validPassword = await bcrypt.compare(password, user.password)
    if (user && validPassword ) {
        // Token
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        return res.json({ message: 'User signed in successfully', token });
    } else {
        return res.json({ error: 'Invalid email or password', user, password });
    }
}


// ========================== Get a specific user ==============================
export const getUser = async (req, res, next) => {
    try {
        const { _id } = req.params;
        const user = await User.findOne({ _id: new ObjectId(_id) });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({ data: user });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


// ============================== Get all users ==============================
export const getAllUsers = async (req, res, next) => {
    try {
        const users = await User.find().toArray();
        res.json({ message: "Total number of registered users " + users.length, data: users })
    } catch (error) {
        res.json({ message: "Error in listing users", error })
    }
};


// =============================== Update a user ===============================
export const updateUser = async (req, res, next) => {
    try {
        const { name, email, phone } = req.body;
        const userId = req.user.id;


        // check email is unique
        const isEmailExist = await User.findOne({ email });
        if (isEmailExist) {
            return res.json({ message: 'Email already exists' })
        }


        // Check if the new value is provided and not null
        const updateFields = {};
        if (name !== null && name !== undefined) {
            updateFields.name = name;
        }
        if (email !== null && email !== undefined) {
            updateFields.email = email;
        }
        if (phone !== null && phone !== undefined) {
            updateFields.phone = phone;
        }

        // update user
        const updatedUser = await User.updateOne(
            { _id: new ObjectId(userId) },
            { $set: updateFields }
        );
        res.json({ message: "User updated successfully", data: updatedUser })
    } catch (error) {
        res.json({ message: "Error in deleting user" })
    }
}


// =============================== Delete a user ===============================
export const deleteUser = async (req, res, next) => {
    try {
        const userId = req.user.id;
        // delete user
        const deletedUser = await User.deleteOne({ _id: new ObjectId(userId) });
        res.json({ message: "User deleted successfully", data: deletedUser })
    } catch (error) {
        res.json({ message: "Error in deleting user" })
    }
}