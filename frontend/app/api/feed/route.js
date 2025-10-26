import { NextResponse } from "next/server";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const page = searchParams.get("page");
  const res = await fetch(`${process.env.BACKEND_URL}/api/feed?page=${page}`, {
    method: "GET",
  });
  const data = await res.json();
  return NextResponse.json(data);
}
