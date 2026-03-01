import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { status } = await request.json();
    console.log("Updating booking:", params.id, "to status:", status);
    
    const client = await clientPromise;
    const db = client.db("car-style");

    // Try to find and update the booking
    let result;
    
    // First try with string ID
    result = await db.collection("bookings").updateOne(
      { _id: params.id as any },
      { $set: { status, updatedAt: new Date() } }
    );
    
    // If no match, try with ObjectId
    if (result.matchedCount === 0 && ObjectId.isValid(params.id)) {
      result = await db.collection("bookings").updateOne(
        { _id: new ObjectId(params.id) },
        { $set: { status, updatedAt: new Date() } }
      );
    }

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { message: "Booking not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[PATCH /api/bookings/[id]] Error:", error);
    return NextResponse.json(
      { message: "Failed to update booking" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    console.log("Deleting booking:", params.id);
    
    const client = await clientPromise;
    const db = client.db("car-style");

    // Try to find and delete the booking
    let result;
    
    // First try with string ID
    result = await db.collection("bookings").deleteOne({
      _id: params.id as any
    });
    
    // If no match, try with ObjectId
    if (result.deletedCount === 0 && ObjectId.isValid(params.id)) {
      result = await db.collection("bookings").deleteOne({
        _id: new ObjectId(params.id)
      });
    }

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { message: "Booking not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[DELETE /api/bookings/[id]] Error:", error);
    return NextResponse.json(
      { message: "Failed to delete booking" },
      { status: 500 }
    );
  }
}
