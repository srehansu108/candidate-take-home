import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const message = searchParams.get('message');

  if (!message) {
    return NextResponse.json({ error: 'Missing message query' }, { status: 400 });
  }

  switch (message.toLowerCase()) {
    case 'hello':
      return NextResponse.json({ response: 'Hello! How can I help you today?' });
    case 'what is your name?':
      return NextResponse.json({ response: "I'm a chatbot built by MAS." });
    case 'error':
      return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
    default:
      return NextResponse.json({ response: "Sorry, I didn't understand that." });
  }
}
