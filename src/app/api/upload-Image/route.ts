import { v2 as cloudinary } from "cloudinary";


cloudinary.config({
    cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(req: Request) {
    try {
      const body = await req.json();
      
      const base64File = body.file;
      const currentUser = body.currentUser;
  
      if (!base64File || !currentUser) {
        console.error("Missing required fields: base64File or currentUser");
        return new Response("Bad Request", { status: 400 });
      }
  
      const result = await cloudinary.uploader.upload(base64File, {
        upload_preset: "UserImage",
        invalidate: true,
        public_id: currentUser.uid,
      });
  
      
      return new Response(JSON.stringify({ result }), { status: 200 });
    } catch (error) {
      console.error("Error uploading to Cloudinary:", error);
      return new Response("Server error", { status: 500 });
    }
  }
  