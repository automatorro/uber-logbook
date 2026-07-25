'use client';

import { useState } from 'react';
import Link from 'next/link';

const LIME = '#D7FF4C';
const INK = '#0F0E0B';
const CREAM = '#F2EEE3';
const MUTED_DARK = 'rgba(255,255,255,0.5)';

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', padding: '18px 0' }}>
      <button onClick={() => setOpen(o => !o)} style={{ width: '100%', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
        <span style={{ fontSize: 15, fontWeight: 700, color: '#fff', lineHeight: 1.4 }}>{q}</span>
        <span style={{ fontSize: 22, color: LIME, flexShrink: 0, transition: 'transform 0.2s', display: 'inline-block', transform: open ? 'rotate(45deg)' : 'none', lineHeight: 1 }}>+</span>
      </button>
      {open && <p style={{ marginTop: 10, fontSize: 14, color: MUTED_DARK, lineHeight: 1.65 }}>{a}</p>}
    </div>
  );
}

function CalcRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
      <span style={{ fontSize: 14, color: MUTED_DARK }}>{label}</span>
      <span style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>{value}</span>
    </div>
  );
}

export default function LandingPage() {
  const [kmAn, setKmAn] = useState(30000);
  const [consum, setConsum] = useState(7);
  const [pret, setPret] = useState(7.2);
  const [regim, setRegim] = useState<'micro' | 'profit'>('micro');

  const combustibil = (kmAn / 100) * consum * pret;
  const deductibil = combustibil * 0.5;
  const economie = regim === 'micro' ? deductibil * 0.01 : deductibil * 0.16;

  const SliderField = ({ label, value, min, max, step, onChange, format }: {
    label: string; value: number; min: number; max: number; step: number;
    onChange: (v: number) => void; format: (v: number) => string;
  }) => (
    <div style={{ marginBottom: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
        <span style={{ fontSize: 13, color: MUTED_DARK, fontWeight: 600 }}>{label}</span>
        <span style={{ fontSize: 13, color: LIME, fontWeight: 700 }}>{format(value)}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={e => onChange(Number(e.target.value))}
        style={{ width: '100%', accentColor: LIME }} />
    </div>
  );

  return (
    <div style={{ fontFamily: "'Plus Jakarta Sans', -apple-system, sans-serif", WebkitFontSmoothing: 'antialiased' }}>

      {/* ── NAV — light cream ── */}
      <header style={{ background: CREAM, borderBottom: '1px solid #E7E2D3' }}>
        <div style={{ maxWidth: 1080, margin: '0 auto', padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: '#EA6842', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M4 17L10 7L14 13L20 5" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span style={{ fontWeight: 800, fontSize: 17, letterSpacing: '-0.02em', color: '#171511' }}>PFAuto</span>
          </div>
          <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
            <Link href="/login" style={{ fontSize: 14, fontWeight: 600, color: '#8C8776', textDecoration: 'none' }}>Autentificare</Link>
            <Link href="/login" style={{ background: '#171511', color: '#fff', fontWeight: 700, fontSize: 14, padding: '10px 20px', borderRadius: 100, textDecoration: 'none' }}>Încearcă gratuit</Link>
          </div>
        </div>
      </header>

      {/* ── HERO — dark with radial lime glow ── */}
      <section style={{
        background: INK,
        backgroundImage: `radial-gradient(ellipse 70% 55% at 50% 45%, rgba(139,200,0,0.18) 0%, transparent 70%)`,
        padding: '80px 24px 100px',
        textAlign: 'center',
      }}>
        {/* Badge */}
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.14)', borderRadius: 100, padding: '7px 16px', fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.75)', marginBottom: 36, letterSpacing: '0.01em' }}>
          <span style={{ width: 7, height: 7, borderRadius: '50%', background: LIME, display: 'inline-block', flexShrink: 0 }} />
          Acces anticipat pentru șoferi Uber &amp; Bolt
        </div>

        {/* H1 */}
        <h1 style={{ fontSize: 'clamp(38px, 8vw, 66px)', fontWeight: 900, letterSpacing: '-0.03em', lineHeight: 1.06, margin: '0 auto 24px', maxWidth: 760, color: '#fff' }}>
          Foaia de parcurs se face singură.<br />
          <span style={{ color: LIME }}>Tu doar conduci.</span>
        </h1>

        {/* Subtext */}
        <p style={{ fontSize: 16, color: MUTED_DARK, lineHeight: 1.7, maxWidth: 520, margin: '0 auto 44px' }}>
          Faci o poză bonului de combustibil, PFAuto calculează kilometrii și scoate documentul gata de predat la contabil. Fără Excel, fără hârtii pierdute.
        </p>

        {/* CTAs */}
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 18 }}>
          <Link href="/login" style={{ background: LIME, color: INK, fontWeight: 800, fontSize: 15, padding: '16px 30px', borderRadius: 100, textDecoration: 'none', display: 'inline-block', letterSpacing: '-0.01em' }}>
            Începe testul gratuit de 3 zile
          </Link>
          <a href="#calculator" style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', fontWeight: 700, fontSize: 15, padding: '16px 30px', borderRadius: 100, textDecoration: 'none', display: 'inline-block' }}>
            Vezi cât economisești →
          </a>
        </div>
        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)', fontWeight: 500 }}>
          Fără card bancar la înscriere · Anulezi oricând din aplicație
        </p>
      </section>

      {/* ── HOW IT WORKS — dark ── */}
      <section style={{ background: '#141210', borderTop: '1px solid rgba(255,255,255,0.06)', padding: '72px 24px' }}>
        <div style={{ maxWidth: 1080, margin: '0 auto' }}>
          <p style={{ textAlign: 'center', fontSize: 11.5, fontWeight: 700, letterSpacing: '0.12em', color: LIME, textTransform: 'uppercase', marginBottom: 14 }}>Cum funcționează</p>
          <h2 style={{ textAlign: 'center', fontSize: 'clamp(28px, 5vw, 40px)', fontWeight: 800, letterSpacing: '-0.025em', marginBottom: 52, color: '#fff' }}>Trei pași, zero bătăi de cap</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 20 }}>
            {[
              { num: '01', title: 'Adaugi ziua', desc: 'Selectezi data și aplicația preia automat kilometrajul de la ziua precedentă.' },
              { num: '02', title: 'Scanezi bonul', desc: 'Fotografiezi bonul de combustibil. AI-ul extrage litri, valoare, stație — instant.' },
              { num: '03', title: 'Generezi raportul', desc: 'La final de lună, exporți foaia de parcurs completă, gata pentru contabil sau ANAF.' },
            ].map(step => (
              <div key={step.num} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 20, padding: 28 }}>
                <div style={{ fontSize: 12, fontWeight: 800, color: LIME, marginBottom: 14, letterSpacing: '0.06em' }}>{step.num}</div>
                <h3 style={{ fontSize: 20, fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 10, color: '#fff' }}>{step.title}</h3>
                <p style={{ fontSize: 14, color: MUTED_DARK, lineHeight: 1.65 }}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CALCULATOR ── */}
      <section id="calculator" style={{ background: '#0F0E0B', borderTop: '1px solid rgba(255,255,255,0.06)', padding: '72px 24px' }}>
        <div style={{ maxWidth: 1080, margin: '0 auto' }}>
          <p style={{ textAlign: 'center', fontSize: 11.5, fontWeight: 700, letterSpacing: '0.12em', color: LIME, textTransform: 'uppercase', marginBottom: 14 }}>Calculator</p>
          <h2 style={{ textAlign: 'center', fontSize: 'clamp(28px, 5vw, 40px)', fontWeight: 800, letterSpacing: '-0.025em', marginBottom: 52, color: '#fff' }}>Cât poți deduce în fiecare an?</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24 }}>
            <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 20, padding: 28 }}>
              <SliderField label="Km/an" value={kmAn} min={5000} max={80000} step={1000} onChange={setKmAn} format={v => `${v.toLocaleString('ro-RO')} km`} />
              <SliderField label="Consum (L/100km)" value={consum} min={4} max={14} step={0.5} onChange={setConsum} format={v => `${v} L`} />
              <SliderField label="Preț combustibil (RON/L)" value={pret} min={5} max={11} step={0.1} onChange={setPret} format={v => `${v.toFixed(1)} RON`} />
              <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                {(['micro', 'profit'] as const).map(r => (
                  <button key={r} onClick={() => setRegim(r)} style={{ flex: 1, padding: '8px 0', borderRadius: 100, fontSize: 12.5, fontWeight: 700, border: '1.5px solid', borderColor: regim === r ? LIME : 'rgba(255,255,255,0.15)', background: regim === r ? 'rgba(215,255,76,0.1)' : 'transparent', color: regim === r ? LIME : MUTED_DARK, cursor: 'pointer' }}>
                    {r === 'micro' ? 'Microîntreprindere' : 'Impozit profit'}
                  </button>
                ))}
              </div>
            </div>
            <div style={{ background: 'rgba(215,255,76,0.05)', border: `1.5px solid rgba(215,255,76,0.2)`, borderRadius: 20, padding: 28, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <p style={{ fontSize: 11.5, fontWeight: 700, color: LIME, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 20 }}>Rezultat estimat</p>
                <CalcRow label="Cost combustibil/an" value={`${combustibil.toLocaleString('ro-RO', { maximumFractionDigits: 0 })} RON`} />
                <CalcRow label="Cheltuieli deductibile (50%)" value={`${deductibil.toLocaleString('ro-RO', { maximumFractionDigits: 0 })} RON`} />
                <CalcRow label="Cotă impozit" value={regim === 'micro' ? '1%' : '16%'} />
              </div>
              <div style={{ marginTop: 28, paddingTop: 24, borderTop: '1px solid rgba(215,255,76,0.15)' }}>
                <p style={{ fontSize: 13, color: MUTED_DARK, marginBottom: 6 }}>Economie estimată la impozit</p>
                <div style={{ fontSize: 42, fontWeight: 900, color: LIME, letterSpacing: '-0.03em', lineHeight: 1 }}>
                  {economie.toLocaleString('ro-RO', { maximumFractionDigits: 0 })} RON
                </div>
                <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.25)', marginTop: 8 }}>*estimativ, consultați un contabil autorizat</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section style={{ background: '#141210', borderTop: '1px solid rgba(255,255,255,0.06)', padding: '72px 24px' }}>
        <div style={{ maxWidth: 480, margin: '0 auto', textAlign: 'center' }}>
          <p style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: '0.12em', color: LIME, textTransform: 'uppercase', marginBottom: 14 }}>Prețuri</p>
          <h2 style={{ fontSize: 'clamp(28px, 5vw, 40px)', fontWeight: 800, letterSpacing: '-0.025em', marginBottom: 40, color: '#fff' }}>Un singur plan, simplu</h2>
          <div style={{ background: 'rgba(255,255,255,0.04)', border: `1.5px solid ${LIME}`, borderRadius: 24, padding: 32 }}>
            <div style={{ fontSize: 50, fontWeight: 900, letterSpacing: '-0.03em', lineHeight: 1, color: '#fff' }}>
              25 <span style={{ fontSize: 22, fontWeight: 700, color: MUTED_DARK }}>RON/lună</span>
            </div>
            <p style={{ fontSize: 14, color: MUTED_DARK, margin: '12px 0 28px' }}>Sau 200 RON/an — 2 luni gratuit</p>
            {[
              'Foaie parcurs ANAF-conformă',
              'Scanare bon cu AI (Claude Haiku)',
              'Sincronizare în cloud Supabase',
              'Rapoarte lunare export PDF',
              'Suport 7/7 pe email',
            ].map(f => (
              <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 10, textAlign: 'left', marginBottom: 12 }}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <circle cx="8" cy="8" r="8" fill={LIME}/>
                  <path d="M5 8l2.5 2.5L11 5.5" stroke={INK} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span style={{ fontSize: 14, fontWeight: 500, color: '#fff' }}>{f}</span>
              </div>
            ))}
            <Link href="/login" style={{ display: 'block', marginTop: 28, background: LIME, color: INK, fontWeight: 800, fontSize: 15, padding: '16px 0', borderRadius: 100, textDecoration: 'none' }}>
              3 zile gratuit — fără card
            </Link>
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section style={{ background: '#0F0E0B', borderTop: '1px solid rgba(255,255,255,0.06)', padding: '72px 24px' }}>
        <div style={{ maxWidth: 640, margin: '0 auto' }}>
          <p style={{ textAlign: 'center', fontSize: 11.5, fontWeight: 700, letterSpacing: '0.12em', color: LIME, textTransform: 'uppercase', marginBottom: 14 }}>FAQ</p>
          <h2 style={{ textAlign: 'center', fontSize: 'clamp(28px, 5vw, 40px)', fontWeight: 800, letterSpacing: '-0.025em', marginBottom: 40, color: '#fff' }}>Întrebări frecvente</h2>
          <FaqItem q="Este foaia generată acceptată de ANAF?" a="Da. Foaia de parcurs generată de PFAuto respectă structura cerută de ANAF pentru PFA cu autoturism parțial deductibil (50%). Include toate câmpurile obligatorii: dată, km start/final, traseu, alimentări." />
          <FaqItem q="Cum funcționează scanarea bonului?" a="Fotografiezi bonul de combustibil direct din aplicație. Imaginea este procesată cu AI (Claude Haiku 4.5) care extrage automat litrii, valoarea, stația și numărul bonului." />
          <FaqItem q="Datele mele sunt în siguranță?" a="Da. Datele sunt stocate în Supabase (PostgreSQL), acces securizat cu autentificare. Nu partajăm niciun date cu terți." />
          <FaqItem q="Funcționează și pe telefon?" a="Da, PFAuto este o Progressive Web App (PWA) optimizată pentru mobil. O poți instala pe ecranul principal ca orice aplicație nativă." />
          <FaqItem q="Ce se întâmplă după perioada de trial?" a="După 3 zile de trial gratuit poți continua cu 25 RON/lună sau 200 RON/an. Nu se cere card la înregistrare." />
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ background: '#0A0907', borderTop: '1px solid rgba(255,255,255,0.06)', padding: '36px 24px', textAlign: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center', marginBottom: 14 }}>
          <div style={{ width: 28, height: 28, borderRadius: 8, background: '#EA6842', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
              <path d="M4 17L10 7L14 13L20 5" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <span style={{ fontWeight: 800, fontSize: 15, color: '#fff' }}>PFAuto</span>
        </div>
        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.3)' }}>© 2025 PFAuto · pfauto.app · Aplicație pentru șoferi Uber &amp; Bolt PFA din România</p>
      </footer>
    </div>
  );
}
