import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const FAILED = { ocrFailed: true, liters: null, value: null, station: null, stationCif: null, date: null, bill: null, paymentMethod: null };

export async function POST(req: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(FAILED, { status: 500 });
  }

  let imageBase64: string;
  let mediaType: string;

  try {
    const body = await req.json();
    imageBase64 = body.imageBase64;
    mediaType = body.mediaType || 'image/jpeg';
    if (!imageBase64) return NextResponse.json(FAILED);
  } catch {
    return NextResponse.json(FAILED);
  }

  try {
    const client = new Anthropic({ apiKey });

    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 300,
      messages: [{
        role: 'user',
        content: [
          {
            type: 'image',
            source: { type: 'base64', media_type: mediaType as any, data: imageBase64 },
          },
          {
            type: 'text',
            text: `Ești un asistent care extrage date din bonuri de combustibil românești.
Returnează DOAR un obiect JSON valid, fără alt text, cu exact aceste câmpuri:
{
  "liters": număr zecimal sau null,
  "value": număr zecimal sau null (suma totală plătită în RON),
  "station": string sau null (numele stației: OMV, Rompetrol, MOL, Petrom etc.),
  "stationCif": string sau null (CIF-ul sau codul fiscal al stației, de obicei precedat de RO pe bon),
  "date": string sau null (format YYYY-MM-DD),
  "bill": string sau null (numărul bonului fiscal sau chitanței),
  "paymentMethod": "cash" sau "card" sau null (modalitatea de plată vizibilă pe bon)
}
Dacă un câmp nu este vizibil sau lizibil, pune null.`,
          },
        ],
      }],
    });

    const text = response.content[0].type === 'text' ? response.content[0].text.trim() : '';
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return NextResponse.json(FAILED);

    const data = JSON.parse(jsonMatch[0]);
    return NextResponse.json({
      ocrFailed: false,
      liters: typeof data.liters === 'number' ? data.liters : null,
      value: typeof data.value === 'number' ? data.value : null,
      station: typeof data.station === 'string' ? data.station : null,
      stationCif: typeof data.stationCif === 'string' ? data.stationCif : null,
      date: typeof data.date === 'string' ? data.date : null,
      bill: typeof data.bill === 'string' ? data.bill : null,
      paymentMethod: data.paymentMethod === 'cash' || data.paymentMethod === 'card' ? data.paymentMethod : null,
    });
  } catch (err) {
    console.error('OCR error:', err);
    return NextResponse.json(FAILED);
  }
}
