import { NextResponse } from "next/server";
import { db } from "../../../../firebaseconfig";
import { collection, getDocs } from "firebase/firestore";

// API-Route zum Abrufen der Klassen
export async function GET() {
  try {
    const classesRef = collection(db, "classes");
    const snapshot = await getDocs(classesRef);
    const classList = snapshot.docs.map(doc => doc.id);

    return NextResponse.json({ classes: classList });
  } catch (error) {
    console.error("Error fetching classes:", error);
    return NextResponse.json({ error: "Failed to fetch classes" }, { status: 500 });
  }
}
