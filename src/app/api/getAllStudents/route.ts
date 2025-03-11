import { NextResponse } from "next/server";
import { adb } from "../../../../firebaseAdminConfig";

export async function GET() {
  try {
    const collections = await adb.listCollections();

    // Filter collections where the ID starts with a number
    const collectionNames = collections
      .map((col) => col.id)
      .filter((id) => /^\d/.test(id));

    // Array to store all student data
    const studentData: any[] = [];

    for (let i = 0; i < collectionNames.length; i++) {
      const collectionName = collectionNames[i];
      

      try {
        const snapshot = await adb.collection(collectionName).get();

        // Add each document's data to the studentData array
        snapshot.docs.forEach((doc) => {
          const docData = doc.data();

          studentData.push({
            className: collectionName,
            id: doc.id,
            firstName: docData.name,  // Ensure `firstName` exists in the document
            lastName: docData.lastName,    // Ensure `lastName` exists in the document
            
          });
        });
      } catch (err) {
        console.error(`Error fetching documents from ${collectionName}:`, err);
      }
    }

    // Return the result as a JSON response
    return NextResponse.json(studentData);
  } catch (error: any) {
    console.error("Error in API route:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
