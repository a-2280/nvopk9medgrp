import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get("session_id");

    if (!sessionId) {
      return NextResponse.json({ error: "No session ID" }, { status: 400 });
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId);

    console.log("Session ID:", sessionId);
    console.log("Session amount_total:", session.amount_total);
    console.log("Session status:", session.status);

    return NextResponse.json({
      status: session.status,
      amount_total: session.amount_total,
      currency: session.currency,
    });
  } catch (error: any) {
    console.error("Error retrieving session:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
