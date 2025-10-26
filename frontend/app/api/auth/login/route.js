import { NextResponse } from "next/server";

export async function POST(params) {
  const { username, password } = await params.json();
  console.log(username, password);
  try {
    const res = await fetch(`${process.env.BACKEND_URL}/api/login`, {
      method: "POST",
      body: JSON.stringify({ username, password }),
    });
    const data = await res.json();
    return NextResponse.json(data);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ e: e.message });
  }
}
