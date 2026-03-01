import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { sign } from "jsonwebtoken";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
    try {
        const { username, password } = await request.json();

        if (!username || !password) {
            return NextResponse.json(
                { message: "Username and password are required" },
                { status: 400 }
            );
        }

        const client = await clientPromise;
        const db = client.db("car-style");

        // Find admin user
        const admin = await db.collection("admins").findOne({ username });

        if (!admin) {
            return NextResponse.json(
                { message: "Invalid credentials" },
                { status: 401 }
            );
        }

        // Compare password
        const isPasswordValid = await bcrypt.compare(password, admin.password);

        if (!isPasswordValid) {
            return NextResponse.json(
                { message: "Invalid credentials" },
                { status: 401 }
            );
        }

        // Create JWT token
        const token = sign(
            { 
                userId: admin._id.toString(),
                username: admin.username 
            },
            process.env.JWT_SECRET!,
            { expiresIn: "7d" }
        );

        return NextResponse.json({
            message: "Login successful",
            token,
            user: {
                id: admin._id.toString(),
                username: admin.username,
            }
        });

    } catch (error) {
        console.error("[POST /api/auth/login] Error:", error);
        return NextResponse.json(
            { message: "Internal server error" },
            { status: 500 }
        );
    }
}
