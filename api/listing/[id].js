export const config = { runtime: 'edge' };

const BOT_UA = /whatsapp|facebookexternalhit|telegrambot|twitterbot|linkedinbot|slackbot|discordbot/i;

export default async function handler(req) {
  const ua = req.headers.get('user-agent') || '';
  const url = new URL(req.url);
  const segments = url.pathname.split('/');
  const id = segments[segments.length - 1];

  if (!BOT_UA.test(ua) || !id) {
    // Regular user — serve the SPA
    const spaUrl = new URL('/', url.origin);
    const res = await fetch(spaUrl);
    const html = await res.text();
    return new Response(html, {
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    });
  }

  // Bot — fetch OG data from edge function
  const ogUrl = `https://tqfvhfrbeolnvjpcfckl.supabase.co/functions/v1/og-listing?id=${id}`;
  const ogRes = await fetch(ogUrl);
  const ogHtml = await ogRes.text();

  return new Response(ogHtml, {
    headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'public, max-age=3600' },
  });
}
