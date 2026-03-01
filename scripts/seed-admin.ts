import clientPromise from "@/lib/mongodb";
import bcrypt from "bcryptjs";

async function seedAdmin() {
    try {
        const client = await clientPromise;
        const db = client.db("car-style");

        // Check if admin already exists
        const existingAdmin = await db.collection("admins").findOne({ username: "admin" });
        
        if (existingAdmin) {
            console.log("Admin user already exists");
            return;
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash("admin123", 10);

        // Create admin user
        const result = await db.collection("admins").insertOne({
            username: "admin",
            password: hashedPassword,
            createdAt: new Date(),
        });

        console.log("Admin user created successfully:", result);
        console.log("Username: admin");
        console.log("Password: admin123");

    } catch (error) {
        console.error("Error creating admin user:", error);
    } finally {
        process.exit(0);
    }
}

seedAdmin();
