import { v2 as cloudinary } from "cloudinary";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const base64File = body.file; // This will be a Base64 string
    const currentUser = body.currentUser;

    if (currentUser) {
      const result = await cloudinary.uploader.upload(base64File, {
        upload_preset: "UserImage",
        invalidate: true,
        public_id: currentUser.uid, // Use UID for unique file identification
      });

      return new Response(JSON.stringify({ result }), { status: 200 });
    } else {
      return new Response("Unauthorized", { status: 401 });
    }
  } catch (error) {
    console.error("Error uploading to Cloudinary:", error);
    return new Response("Server error", { status: 500 });
  }
}
