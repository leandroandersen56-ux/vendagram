import { NextRequest, NextResponse } from 'next/server';

export const config = {
  matcher: '/listing/:id*',
};

const BOT_UA = /whatsapp|facebookexternalhit|telegrambot|twitterbot|linkedinbot|slackbot|discordbot|googlebot|bingbot/i;

export default function middleware(req: NextRequest) {
  const ua = req.headers.get('user-agent') || '';
  
  if (BOT_UA.test(ua)) {
    const url = new URL(req.url);
    const id = url.pathname.replace('/listing/', '');
    const ogUrl = `https://tqfvhfrbeolnvjpcfckl.supabase.co/functions/v1/og-listing?id=${id}`;
    return NextResponse.rewrite(new URL(ogUrl));
  }

  return NextResponse.next();
}
