import { NextResponse } from "next/server";
import { adb } from "../../../../firebaseAdminConfig";

export async function GET() {
  try {
    const collections = await adb.listCollections();
    
    // Filter collections where the ID starts with a number
    const collectionNames = collections
      .map((col) => col.id)
      .filter((id) => /^\d/.test(id));  // Regex to check if it starts with a digit

    return NextResponse.json({ collections: collectionNames });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
