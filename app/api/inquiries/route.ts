import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("car-style");

    // Use `contactmessages` collection as requested
    const inquiries = await db.collection("contactmessages").find({}).toArray();

    const formatted = inquiries.map((inq: any) => {
      // Flexible mapping to handle different field names in your collection
      const name =
        inq.name ??
        inq.fullName ??
        inq.username ??
        "";

      const phone =
        inq.phone ??
        inq.phoneNumber ??
        inq.mobile ??
        "";

      const subject =
        inq.subject ??
        inq.reason ??
        inq.topic ??
        "General Inquiry";

      const message =
        inq.message ??
        inq.description ??
        inq.notes ??
        "";

      // Try to format any kind of date field into a readable string
      const rawDate = inq.date ?? inq.createdAt ?? inq.created_at ?? null;
      let dateStr: string | undefined;
      if (rawDate) {
        try {
          const d = new Date(rawDate);
          if (!isNaN(d.getTime())) {
            dateStr = d.toLocaleString("en-IN", {
              day: "2-digit",
              month: "short",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            });
          }
        } catch {
          dateStr = String(rawDate);
        }
      }

      const status = inq.status ?? "New";
      const isCallback =
        inq.isCallback ??
        inq.callbackRequested ??
        inq.callback ??
        false;

      return {
        id: inq._id?.toString(),
        name,
        phone,
        subject,
        message,
        date: dateStr,
        status,
        isCallback,
      };
    });

    return NextResponse.json(formatted);
  } catch (error) {
    console.error("[GET /api/inquiries] Error:", error);
    return NextResponse.json(
      { message: "Failed to fetch inquiries" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const { id, status } = await request.json();

    if (!id || !status) {
      return NextResponse.json(
        { message: "Missing required fields: id and status" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("car-style");

    // Convert string id back to ObjectId for MongoDB query
    const { ObjectId } = require("mongodb");
    const result = await db.collection("contactmessages").updateOne(
      { _id: new ObjectId(id) },
      { $set: { status } }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { message: "Inquiry not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "Status updated successfully" });
  } catch (error) {
    console.error("[PATCH /api/inquiries] Error:", error);
    return NextResponse.json(
      { message: "Failed to update inquiry status" },
      { status: 500 }
    );
  }
}

