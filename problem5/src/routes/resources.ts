import express from "express";
import { firebaseDB as db } from "../config/firebase";
import { authenticateToken } from "../middleware/auth";
import { QueryDocumentSnapshot } from "firebase-admin/firestore";
import {
  Resource,
  CreateResourceRequest,
  UpdateResourceRequest,
  ApiResponse,
  RequestWithUser,
} from "../types/common";

const router = express.Router();

// All resource routes require authentication
router.use(authenticateToken);

// Create a new resource
router.post("/", async (req: RequestWithUser, res: express.Response) => {
  try {
    const { title, description }: CreateResourceRequest = req.body;

    // Validate input
    if (!title || !description) {
      return res.status(400).json({
        success: false,
        message: "Title and description are required",
      } as ApiResponse);
    }
    const docRef = db.collection("resources").doc();
    const newResource: Resource = {
      id: docRef.id,
      title,
      description,
      createdBy: req.user!.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await docRef.set(newResource);

    res.status(201).json({
      success: true,
      message: "Resource created successfully",
      data: newResource,
    } as ApiResponse<Resource>);
  } catch (error) {
    console.error("Create resource error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error instanceof Error ? error.message : "Unknown error",
    } as ApiResponse);
  }
});

// Get all resources for the authenticated user
router.get("/", async (req: RequestWithUser, res: express.Response) => {
  try {
    const resourcesRef = db.collection("resources");
    const snapshot = await resourcesRef
      .where("createdBy", "==", req.user!.id)
      .orderBy("createdAt", "desc")
      .get();

    const resources: Resource[] = [];
    snapshot.forEach((doc: QueryDocumentSnapshot) => {
      const resource = { id: doc.id, ...doc.data() } as Resource;
      resources.push(resource);
    });

    res.status(200).json({
      success: true,
      message: "Resources retrieved successfully",
      data: resources,
    } as ApiResponse<Resource[]>);
  } catch (error) {
    console.error("Get resources error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error instanceof Error ? error.message : "Unknown error",
    } as ApiResponse);
  }
});

// Get a specific resource by ID
router.get("/:id", async (req: RequestWithUser, res: express.Response) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Resource ID is required",
      } as ApiResponse);
    }

    const docRef = db.collection("resources").doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return res.status(404).json({
        success: false,
        message: "Resource not found",
      } as ApiResponse);
    }

    const resource = { id: doc.id, ...doc.data() } as Resource;

    // Check if the resource belongs to the authenticated user
    if (resource.createdBy !== req.user!.id) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      } as ApiResponse);
    }

    res.status(200).json({
      success: true,
      message: "Resource retrieved successfully",
      data: resource,
    } as ApiResponse<Resource>);
  } catch (error) {
    console.error("Get resource error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error instanceof Error ? error.message : "Unknown error",
    } as ApiResponse);
  }
});

// Update a resource
router.put("/:id", async (req: RequestWithUser, res: express.Response) => {
  try {
    const { id } = req.params;
    const { title, description }: UpdateResourceRequest = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Resource ID is required",
      } as ApiResponse);
    }

    const docRef = db.collection("resources").doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return res.status(404).json({
        success: false,
        message: "Resource not found",
      } as ApiResponse);
    }

    const resource = { id: doc.id, ...doc.data() } as Resource;

    // Check if the resource belongs to the authenticated user
    if (resource.createdBy !== req.user!.id) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      } as ApiResponse);
    }

    // Update resource
    const updateData: Partial<Resource> = {
      updatedAt: new Date(),
    };

    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;

    await docRef.update(updateData);

    // Get updated resource
    const updatedDoc = await docRef.get();
    const updatedResource = {
      id: updatedDoc.id,
      ...updatedDoc.data(),
    } as Resource;

    res.status(200).json({
      success: true,
      message: "Resource updated successfully",
      data: updatedResource,
    } as ApiResponse<Resource>);
  } catch (error) {
    console.error("Update resource error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error instanceof Error ? error.message : "Unknown error",
    } as ApiResponse);
  }
});

// Delete a resource
router.delete("/:id", async (req: RequestWithUser, res: express.Response) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Resource ID is required",
      } as ApiResponse);
    }

    const docRef = db.collection("resources").doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return res.status(404).json({
        success: false,
        message: "Resource not found",
      } as ApiResponse);
    }

    const resource = { id: doc.id, ...doc.data() } as Resource;

    // Check if the resource belongs to the authenticated user
    if (resource.createdBy !== req.user!.id) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      } as ApiResponse);
    }

    await docRef.delete();

    res.status(200).json({
      success: true,
      message: "Resource deleted successfully",
    } as ApiResponse);
  } catch (error) {
    console.error("Delete resource error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error instanceof Error ? error.message : "Unknown error",
    } as ApiResponse);
  }
});

export default router;
