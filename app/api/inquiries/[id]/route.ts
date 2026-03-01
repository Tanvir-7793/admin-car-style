import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    console.log("Attempting to delete inquiry with ID:", id);
    
    const client = await clientPromise;
    const db = client.db("car-style");

    // Try to find and delete the inquiry
    let result;
    
    // First try with string ID
    console.log("Trying to delete with string ID:", id);
    result = await db.collection("inquiries").deleteOne({
      _id: id as any
    });
    console.log("String ID delete result:", result);
    
    // If no match, try with ObjectId
    if (result.deletedCount === 0 && ObjectId.isValid(id)) {
      console.log("Trying to delete with ObjectId:", id);
      result = await db.collection("inquiries").deleteOne({
        _id: new ObjectId(id)
      });
      console.log("ObjectId delete result:", result);
    }

    // Let's also check what inquiry exists with this ID
    let existingInquiry;
    if (ObjectId.isValid(id)) {
      existingInquiry = await db.collection("inquiries").findOne({
        _id: new ObjectId(id)
      });
    }
    if (!existingInquiry) {
      existingInquiry = await db.collection("inquiries").findOne({
        _id: id as any
      });
    }
    console.log("Existing inquiry found:", existingInquiry);

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { message: "Inquiry not found" },
        { status: 404 }
      );
    }

    console.log("Inquiry deleted successfully");
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[DELETE /api/inquiries/[id]] Error:", error);
    return NextResponse.json(
      { message: "Failed to delete inquiry" },
      { status: 500 }
    );
  }
}
