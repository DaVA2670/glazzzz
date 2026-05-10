import { NextResponse } from 'next/server';
import { z } from 'zod';

const LeadSchema = z.object({
  name: z.string().min(2),
  phone: z.string().min(5),
  company: z.string().optional(),
  screen: z.string().optional(),
  comment: z.string().optional()
});

export async function POST(request: Request) {
  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ ok: false, message: 'Некорректный JSON' }, { status: 400 });
  }
  const parsed = LeadSchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json({ ok: false, message: 'Проверьте поля формы' }, { status: 400 });
  }

  const message = [
    'Новая заявка с сайта Глаз Города',
    `Имя: ${parsed.data.name}`,
    `Телефон: ${parsed.data.phone}`,
    `Компания: ${parsed.data.company || '-'}`,
    `Экран: ${parsed.data.screen || '-'}`,
    `Комментарий: ${parsed.data.comment || '-'}`
  ].join('\n');

  if (process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID) {
    await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: process.env.TELEGRAM_CHAT_ID, text: message })
    });
  }

  console.log(message);
  return NextResponse.json({ ok: true });
}
