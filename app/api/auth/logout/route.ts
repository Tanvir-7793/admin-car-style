import { NextResponse } from "next/server";

export async function POST() {
    try {
        // Create a response that clears the auth cookies
        const response = NextResponse.json({
            message: "Logout successful"
        });

        // Clear the auth cookies
        response.cookies.delete("adminToken");
        response.cookies.delete("adminUser");

        return response;
    } catch (error) {
        console.error("[POST /api/auth/logout] Error:", error);
        return NextResponse.json(
            { message: "Logout failed" },
            { status: 500 }
        );
    }
}
