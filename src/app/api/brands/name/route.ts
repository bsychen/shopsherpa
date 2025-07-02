import { NextResponse } from "next/server";
import { getBrand } from "@/lib/brandUtils";

export async function GET(request: Request) {
  try {
    /* Get the brand name from query parameters */
    const { searchParams } = new URL(request.url);
    const brandName = searchParams.get("name");

    if (!brandName) {
      return NextResponse.json(
        { error: "Brand name is required" },
        { status: 400 }
      );
    }
    return NextResponse.json(await getBrand(brandName));

  } catch (error) {
    console.error("Error fetching brand:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}