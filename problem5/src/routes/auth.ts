import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { firebaseDB } from "../config/firebase";
import {
  User,
  CreateUserRequest,
  LoginRequest,
  AuthResponse,
  ApiResponse,
} from "../types/common";

const router = express.Router();

// Register a new user
router.post(
  "/register",
  async (req: express.Request, res: express.Response) => {
    try {
      const { email, password, name }: CreateUserRequest = req.body;

      // Validate input
      if (!email || !password || !name) {
        return res.status(400).json({
          success: false,
          message: "Email, password, and name are required",
        } as ApiResponse);
      }

      // Check if user already exists
      const usersRef = firebaseDB.collection("users");
      const snapshot = await usersRef.where("email", "==", email).get();

      if (!snapshot.empty) {
        return res.status(400).json({
          success: false,
          message: "User with this email already exists",
        } as ApiResponse);
      }

      // Hash password
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      // Create new user
      const newUser: User = {
        id: "", // Will be set by Firestore
        email,
        password: hashedPassword,
        name,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const docRef = await usersRef.add(newUser);
      newUser.id = docRef.id;

      // Generate JWT token
      const token = jwt.sign(
        {
          id: newUser.id,
          email: newUser.email,
          name: newUser.name,
        },
        process.env.JWT_SECRET as string,
        { expiresIn: process.env.JWT_EXPIRES_IN || "7d" } as jwt.SignOptions
      );

      const response: AuthResponse = {
        token,
        user: {
          id: newUser.id,
          email: newUser.email,
          name: newUser.name,
          createdAt: newUser.createdAt,
          updatedAt: newUser.updatedAt,
        },
      };

      res.status(201).json({
        success: true,
        message: "User registered successfully",
        data: response,
      } as ApiResponse<AuthResponse>);
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      } as ApiResponse);
    }
  }
);

// Login user
router.post("/login", async (req: express.Request, res: express.Response) => {
  try {
    const { email, password }: LoginRequest = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      } as ApiResponse);
    }

    // Find user by email
    const usersRef = firebaseDB.collection("users");
    const snapshot = await usersRef.where("email", "==", email).get();

    if (snapshot.empty) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      } as ApiResponse);
    }

    const userDoc = snapshot.docs[0];
    if (!userDoc) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      } as ApiResponse);
    }
    const user = { id: userDoc.id, ...userDoc.data() } as User;

    // Compare passwords
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      } as ApiResponse);
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        name: user.name,
      },
      process.env.JWT_SECRET as string,
      { expiresIn: process.env.JWT_EXPIRES_IN || "7d" } as jwt.SignOptions
    );

    const response: AuthResponse = {
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    };

    res.status(200).json({
      success: true,
      message: "Login successful",
      data: response,
    } as ApiResponse<AuthResponse>);
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error instanceof Error ? error.message : "Unknown error",
    } as ApiResponse);
  }
});

export default router;
