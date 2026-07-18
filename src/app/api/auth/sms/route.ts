import { NextResponse } from "next/server";
import { sendSmsCode } from "@/lib/users-store";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = await sendSmsCode(body.phone);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "发送失败" },
      { status: 400 }
    );
  }
}
