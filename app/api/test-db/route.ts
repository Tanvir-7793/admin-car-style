import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function GET() {
  try {
    console.log("Testing database connection...");
    
    const client = await clientPromise;
    const db = client.db("car-style");
    
    // Test basic connection
    await db.admin().ping();
    console.log("Database connection successful");
    
    // Test collection access
    const collectionCount = await db.collection("bookings").countDocuments();
    console.log("Bookings collection count:", collectionCount);
    
    // Get a sample booking
    const sampleBooking = await db.collection("bookings").findOne();
    console.log("Sample booking:", sampleBooking);
    
    return NextResponse.json({
      success: true,
      message: "Database connection working",
      collectionCount,
      sampleBooking: sampleBooking ? {
        id: sampleBooking._id,
        idType: typeof sampleBooking._id,
        hasData: true
      } : null
    });
    
  } catch (error) {
    console.error("Database test error:", error);
    return NextResponse.json(
      { 
        success: false, 
        message: "Database connection failed",
        error: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}
