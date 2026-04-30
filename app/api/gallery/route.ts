import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import cloudinary from "@/lib/cloudinary";
import { ObjectId } from "mongodb";

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("car-style");
    const images = await db.collection("gallery").find({}).sort({ createdAt: -1 }).toArray();
    const formatted = images.map((img: any) => ({
      id: img._id?.toString(),
      title: img.title,
      category: img.category,
      imageUrl: img.imageUrl,
      publicId: img.publicId,
      width: img.width,
      height: img.height,
      createdAt: img.createdAt,
    }));
    return NextResponse.json(formatted);
  } catch (error) {
    console.error("[GET /api/gallery] Error:", error);
    return NextResponse.json({ message: "Failed to fetch gallery images" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const title = formData.get("title") as string;
    const category = formData.get("category") as string;
    if (!file) {
      return NextResponse.json({ message: "Image file is required" }, { status: 400 });
    }
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64 = `data:${file.type};base64,${buffer.toString("base64")}`;
    const uploadResult = await cloudinary.uploader.upload(base64, {
      folder: "car-style/gallery",
      resource_type: "image",
      transformation: [{ quality: "auto", fetch_format: "auto" }],
    });
    const client = await clientPromise;
    const db = client.db("car-style");
    const doc = {
      title: title || "Untitled",
      category: category || "General",
      imageUrl: uploadResult.secure_url,
      publicId: uploadResult.public_id,
      width: uploadResult.width,
      height: uploadResult.height,
      createdAt: new Date(),
    };
    const result = await db.collection("gallery").insertOne(doc);
    return NextResponse.json({ id: result.insertedId.toString(), ...doc }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/gallery] Error:", error);
    return NextResponse.json({ message: "Failed to upload image" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ message: "Image id is required" }, { status: 400 });
    }
    const client = await clientPromise;
    const db = client.db("car-style");
    const image = await db.collection("gallery").findOne({ _id: new ObjectId(id) });
    if (!image) {
      return NextResponse.json({ message: "Image not found" }, { status: 404 });
    }
    if (image.publicId) {
      await cloudinary.uploader.destroy(image.publicId);
    }
    await db.collection("gallery").deleteOne({ _id: new ObjectId(id) });
    return NextResponse.json({ message: "Image deleted successfully" });
  } catch (error) {
    console.error("[DELETE /api/gallery] Error:", error);
    return NextResponse.json({ message: "Failed to delete image" }, { status: 500 });
  }
}
