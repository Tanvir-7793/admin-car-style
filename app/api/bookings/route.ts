import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("car-style");

    const bookings = await db.collection("bookings").find({}).toArray();

    const formatted = bookings.map((b: any) => {
      const customerName =
        b.customerName ??
        b.name ??
        b.fullName ??
        b.username ??
        "";

      const phone =
        b.phone ??
        b.phoneNumber ??
        b.mobile ??
        "";

      const service =
        b.service ??
        b.serviceName ??
        b.service_type ??
        "Service";

      const car =
        b.car ??
        b.carModel ??
        b.vehicle ??
        "";

      const status = b.status ?? "Scheduled";

      const amount =
        b.amount ??
        b.price ??
        b.total ??
        null;

      const rawDate =
        b.date ??
        b.bookingDate ??
        b.appointmentDate ??
        null;

      const rawCreatedAt =
        b.createdAt ??
        b.created_at ??
        b.timestamp ??
        null;

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

      let createdAtStr: string | undefined;
      if (rawCreatedAt) {
        try {
          const d = new Date(rawCreatedAt);
          if (!isNaN(d.getTime())) {
            createdAtStr = d.toISOString();
          }
        } catch {
          createdAtStr = String(rawCreatedAt);
        }
      }

      return {
        id: b._id?.toString(),
        customerName,
        phone,
        service,
        car,
        status,
        date: dateStr,
        amount,
        createdAt: createdAtStr,
      };
    });

    return NextResponse.json(formatted);
  } catch (error) {
    console.error("[GET /api/bookings] Error:", error);
    return NextResponse.json(
      { message: "Failed to fetch bookings" },
      { status: 500 }
    );
  }
}

