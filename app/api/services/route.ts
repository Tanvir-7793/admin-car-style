import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("car-style");

    const services = await db.collection("services").find({}).toArray();

    const formatted = services.map((service: any) => ({
      id: service._id?.toString(),
      title: service.title,
      subtitle: service.subtitle,
      type: service.type,
      description: service.description,
      features: service.features ?? [],
      image: service.image,
      pricing: service.pricing ?? [],
      slug: service.slug,
      status: service.status ?? "Active",
      createdAt: service.createdAt,
      updatedAt: service.updatedAt,
    }));

    return NextResponse.json(formatted);
  } catch (error) {
    console.error("[GET /api/services] Error:", error);
    return NextResponse.json(
      { message: "Failed to fetch services" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      name,
      category,
      price,
      status = "Active",
      type = "Premium",
      description = "",
      features = [],
      image = "",
    } = body;

    if (!name || !category) {
      return NextResponse.json(
        { message: "Name and category are required" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("car-style");

    const doc = {
      name,
      category,
      price,
      status,
      type,
      description,
      features,
      image,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection("services").insertOne(doc);

    return NextResponse.json(
      {
        id: result.insertedId.toString(),
        ...doc,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[POST /api/services] Error:", error);
    return NextResponse.json(
      { message: "Failed to create service" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, name, category, price, status, type, description, features, image } = body;

    if (!id) {
      return NextResponse.json(
        { message: "Service id is required" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("car-style");

    const updateFields: any = {};
    if (name !== undefined) updateFields.name = name;
    if (category !== undefined) updateFields.category = category;
    if (price !== undefined) updateFields.price = price;
    if (status !== undefined) updateFields.status = status;
    if (type !== undefined) updateFields.type = type;
    if (description !== undefined) updateFields.description = description;
    if (features !== undefined) updateFields.features = features;
    if (image !== undefined) updateFields.image = image;
    
    // Always update updatedAt when editing
    updateFields.updatedAt = new Date();

    await db
      .collection("services")
      .updateOne({ _id: new ObjectId(id) }, { $set: updateFields });

    return NextResponse.json({ message: "Service updated" });
  } catch (error) {
    console.error("[PUT /api/services] Error:", error);
    return NextResponse.json(
      { message: "Failed to update service" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { message: "Service id is required" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("car-style");

    await db
      .collection("services")
      .deleteOne({ _id: new ObjectId(id) });

    return NextResponse.json({ message: "Service deleted" });
  } catch (error) {
    console.error("[DELETE /api/services] Error:", error);
    return NextResponse.json(
      { message: "Failed to delete service" },
      { status: 500 }
    );
  }
}

