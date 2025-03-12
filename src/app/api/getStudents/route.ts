import { NextResponse } from "next/server";
import { db } from "../../../../firebaseconfig";
import { collection, getDocs } from "firebase/firestore";

// API-Route für Schüler einer bestimmten Klasse
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const className = searchParams.get("class");

    if (!className) {
      return NextResponse.json({ error: "Klassenname fehlt" }, { status: 400 });
    }

    const studentsRef = collection(db, className);
    const snapshot = await getDocs(studentsRef);
    const students = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json({ students });
  } catch (error) {
    console.error("Fehler beim Abrufen der Schüler:", error);
    return NextResponse.json({ error: "Fehler beim Laden der Schüler" }, { status: 500 });
  }
}
