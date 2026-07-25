'use client';

import { useState } from 'react';
import Link from 'next/link';

const LIME = '#D7FF4C';
const INK = '#171511';
const MUTED = 'rgba(255,255,255,0.55)';

function CalcRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
      <span style={{ fontSize: 14, color: MUTED }}>{label}</span>
      <span style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>{value}</span>
    </div>
  );
}

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', padding: '16px 0' }}>
      <button onClick={() => setOpen(o => !o)} style={{ width: '100%', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
        <span style={{ fontSize: 15, fontWeight: 700, color: '#fff', lineHeight: 1.4 }}>{q}</span>
        <span style={{ fontSize: 20, color: LIME, flexShrink: 0, transition: 'transform 0.2s', display: 'inline-block', transform: open ? 'rotate(45deg)' : 'none' }}>+</span>
      </button>
      {open && <p style={{ marginTop: 10, fontSize: 14, color: MUTED, lineHeight: 1.6 }}>{a}</p>}
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

  const SliderField = ({ label, value, min, max, step, onChange, format }: { label: string; value: number; min: number; max: number; step: number; onChange: (v: number) => void; format: (v: number) => string }) => (
    <div style={{ marginBottom: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
        <span style={{ fontSize: 13, color: MUTED, fontWeight: 600 }}>{label}</span>
        <span style={{ fontSize: 13, color: LIME, fontWeight: 700 }}>{format(value)}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value} onChange={e => onChange(Number(e.target.value))} style={{ width: '100%', accentColor: LIME }} />
    </div>
  );

  return (
    <div style={{ background: INK, color: '#fff', fontFamily: "'Plus Jakarta Sans', -apple-system, sans-serif", WebkitFontSmoothing: 'antialiased', minHeight: '100vh' }}>

      {/* Nav */}
      <nav style={{ maxWidth: 1080, margin: '0 auto', padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 34, height: 34, borderRadius: 10, background: '#EA6842', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M4 17L10 7L14 13L20 5" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <span style={{ fontWeight: 800, fontSize: 17, letterSpacing: '-0.02em' }}>PFAuto</span>
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <Link href="/login" style={{ fontSize: 14, fontWeight: 600, color: 'rgba(255,255,255,0.7)', textDecoration: 'none' }}>Conectare</Link>
          <Link href="/login" style={{ background: LIME, color: INK, fontWeight: 700, fontSize: 14, padding: '8px 18px', borderRadius: 100, textDecoration: 'none' }}>Încearcă gratuit</Link>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ maxWidth: 640, margin: '0 auto', padding: '60px 24px 80px', textAlign: 'center' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(215,255,76,0.12)', border: '1px solid rgba(215,255,76,0.25)', borderRadius: 100, padding: '6px 14px', fontSize: 12.5, fontWeight: 700, color: LIME, marginBottom: 28, letterSpacing: '0.04em' }}>
          PENTRU ȘOFERI UBER & BOLT PFA
        </div>
        <h1 style={{ fontSize: 'clamp(36px, 8vw, 58px)', fontWeight: 900, letterSpacing: '-0.03em', lineHeight: 1.08, margin: '0 0 24px' }}>
          Foaia de parcurs<br />
          <span style={{ color: LIME }}>se face singură.</span><br />
          Tu doar conduci.
        </h1>
        <p style={{ fontSize: 17, color: MUTED, lineHeight: 1.65, maxWidth: 480, margin: '0 auto 40px' }}>
          PFAuto generează automat foile de parcurs ANAF-conforme. Scanezi bonul de combustibil, aplicația face restul.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/login" style={{ background: LIME, color: INK, fontWeight: 800, fontSize: 16, padding: '16px 32px', borderRadius: 100, textDecoration: 'none', display: 'inline-block' }}>
            3 zile gratuit — fără card
          </Link>
          <a href="#cum-functioneaza" style={{ background: 'rgba(255,255,255,0.08)', color: '#fff', fontWeight: 700, fontSize: 16, padding: '16px 32px', borderRadius: 100, textDecoration: 'none', display: 'inline-block' }}>
            Cum funcționează?
          </a>
        </div>
      </section>

      {/* How it works */}
      <section id="cum-functioneaza" style={{ maxWidth: 1080, margin: '0 auto', padding: '60px 24px' }}>
        <p style={{ textAlign: 'center', fontSize: 12, fontWeight: 700, letterSpacing: '0.1em', color: LIME, textTransform: 'uppercase', marginBottom: 14 }}>Cum funcționează</p>
        <h2 style={{ textAlign: 'center', fontSize: 'clamp(28px, 5vw, 40px)', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 48 }}>Trei pași, zero bătăi de cap</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 20 }}>
          {[
            { num: '01', title: 'Adaugi ziua', desc: 'Selectezi data și aplicația preia automat kilometrajul de la ziua precedentă.' },
            { num: '02', title: 'Scanezi bonul', desc: 'Fotografiezi bonul de combustibil. AI-ul extrage litri, valoare, stație — instant.' },
            { num: '03', title: 'Generezi raportul', desc: 'La final de lună, exporți foaia de parcurs completă, gata pentru contabil sau ANAF.' },
          ].map(step => (
            <div key={step.num} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 20, padding: 28 }}>
              <div style={{ fontSize: 13, fontWeight: 800, color: LIME, marginBottom: 14, letterSpacing: '0.04em' }}>{step.num}</div>
              <h3 style={{ fontSize: 20, fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 10 }}>{step.title}</h3>
              <p style={{ fontSize: 14, color: MUTED, lineHeight: 1.6 }}>{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Calculator */}
      <section style={{ maxWidth: 1080, margin: '0 auto', padding: '60px 24px' }}>
        <p style={{ textAlign: 'center', fontSize: 12, fontWeight: 700, letterSpacing: '0.1em', color: LIME, textTransform: 'uppercase', marginBottom: 14 }}>Calculator</p>
        <h2 style={{ textAlign: 'center', fontSize: 'clamp(28px, 5vw, 40px)', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 48 }}>Cât poți deduce în fiecare an?</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24 }}>
          <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 20, padding: 28 }}>
            <SliderField label="Km/an" value={kmAn} min={5000} max={80000} step={1000} onChange={setKmAn} format={v => `${v.toLocaleString('ro-RO')} km`} />
            <SliderField label="Consum (L/100km)" value={consum} min={4} max={14} step={0.5} onChange={setConsum} format={v => `${v} L`} />
            <SliderField label="Preț combustibil (RON/L)" value={pret} min={5} max={11} step={0.1} onChange={setPret} format={v => `${v.toFixed(1)} RON`} />
            <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
              {(['micro', 'profit'] as const).map(r => (
                <button key={r} onClick={() => setRegim(r)} style={{ flex: 1, padding: '8px 0', borderRadius: 100, fontSize: 13, fontWeight: 700, border: '1.5px solid', borderColor: regim === r ? LIME : 'rgba(255,255,255,0.15)', background: regim === r ? 'rgba(215,255,76,0.12)' : 'transparent', color: regim === r ? LIME : MUTED, cursor: 'pointer' }}>
                  {r === 'micro' ? 'Microîntreprindere' : 'Impozit pe profit'}
                </button>
              ))}
            </div>
          </div>
          <div style={{ background: 'rgba(215,255,76,0.06)', border: '1px solid rgba(215,255,76,0.2)', borderRadius: 20, padding: 28, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <p style={{ fontSize: 12, fontWeight: 700, color: LIME, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 20 }}>Rezultat estimat</p>
              <CalcRow label="Cost combustibil/an" value={`${combustibil.toLocaleString('ro-RO', { maximumFractionDigits: 0 })} RON`} />
              <CalcRow label="Cheltuieli deductibile (50%)" value={`${deductibil.toLocaleString('ro-RO', { maximumFractionDigits: 0 })} RON`} />
              <CalcRow label="Cotă impozit" value={regim === 'micro' ? '1%' : '16%'} />
            </div>
            <div style={{ marginTop: 28, padding: '20px 0', borderTop: '1px solid rgba(215,255,76,0.2)' }}>
              <p style={{ fontSize: 13, color: MUTED, marginBottom: 4 }}>Economie estimată la impozit</p>
              <div style={{ fontSize: 38, fontWeight: 900, color: LIME, letterSpacing: '-0.03em', lineHeight: 1 }}>
                {economie.toLocaleString('ro-RO', { maximumFractionDigits: 0 })} RON
              </div>
              <p style={{ fontSize: 12, color: MUTED, marginTop: 6 }}>*estimativ, consultați un contabil</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section style={{ maxWidth: 480, margin: '0 auto', padding: '60px 24px' }}>
        <p style={{ textAlign: 'center', fontSize: 12, fontWeight: 700, letterSpacing: '0.1em', color: LIME, textTransform: 'uppercase', marginBottom: 14 }}>Prețuri</p>
        <h2 style={{ textAlign: 'center', fontSize: 'clamp(28px, 5vw, 40px)', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 36 }}>Un singur plan, simplu</h2>
        <div style={{ background: 'rgba(255,255,255,0.04)', border: `1.5px solid ${LIME}`, borderRadius: 24, padding: 32, textAlign: 'center' }}>
          <div style={{ fontSize: 46, fontWeight: 900, letterSpacing: '-0.03em', lineHeight: 1 }}>25 <span style={{ fontSize: 22, fontWeight: 700, color: MUTED }}>RON/lună</span></div>
          <p style={{ fontSize: 14, color: MUTED, margin: '12px 0 28px' }}>Sau 200 RON/an — 2 luni gratuit</p>
          {['Foaie parcurs ANAF-conformă', 'Scanare bon cu AI (Haiku 4.5)', 'Sincronizare în cloud', 'Rapoarte lunare export PDF', 'Suport 7/7 pe email'].map(f => (
            <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 10, textAlign: 'left', marginBottom: 12 }}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="8" fill={LIME}/><path d="M5 8l2.5 2.5L11 5.5" stroke={INK} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
              <span style={{ fontSize: 14, fontWeight: 500 }}>{f}</span>
            </div>
          ))}
          <Link href="/login" style={{ display: 'block', marginTop: 28, background: LIME, color: INK, fontWeight: 800, fontSize: 16, padding: '16px 0', borderRadius: 100, textDecoration: 'none' }}>
            3 zile gratuit — fără card
          </Link>
        </div>
      </section>

      {/* FAQ */}
      <section style={{ maxWidth: 640, margin: '0 auto', padding: '40px 24px 60px' }}>
        <p style={{ textAlign: 'center', fontSize: 12, fontWeight: 700, letterSpacing: '0.1em', color: LIME, textTransform: 'uppercase', marginBottom: 14 }}>FAQ</p>
        <h2 style={{ textAlign: 'center', fontSize: 'clamp(28px, 5vw, 40px)', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 36 }}>Întrebări frecvente</h2>
        <FaqItem q="Este foaia generată acceptată de ANAF?" a="Da. Foaia de parcurs generată de PFAuto respectă structura cerută de ANAF pentru PFA cu autoturism parțial deductibil (50%). Include toate câmpurile obligatorii: dată, km start/final, traseu, alimentări." />
        <FaqItem q="Cum funcționează scanarea bonului?" a="Fotografiezi bonul de combustibil direct din aplicație. Imaginea este procesată cu AI (Claude Haiku 4.5) care extrage automat litrii, valoarea, stația și numărul bonului." />
        <FaqItem q="Datele mele sunt în siguranță?" a="Da. Datele sunt stocate în Supabase (PostgreSQL), acces securizat cu autentificare. Nu partajăm niciun date cu terți." />
        <FaqItem q="Funcționează și pe telefon?" a="Da, PFAuto este o Progressive Web App (PWA) optimizată pentru mobil. O poți instala pe ecranul principal ca orice aplicație nativă." />
        <FaqItem q="Ce se întâmplă după perioada de trial?" a="După 3 zile de trial gratuit poți continua cu 25 RON/lună sau 200 RON/an. Nu se cere card la înregistrare." />
      </section>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid rgba(255,255,255,0.08)', padding: '32px 24px', textAlign: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center', marginBottom: 12 }}>
          <div style={{ width: 28, height: 28, borderRadius: 8, background: '#EA6842', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
              <path d="M4 17L10 7L14 13L20 5" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <span style={{ fontWeight: 800, fontSize: 15 }}>PFAuto</span>
        </div>
        <p style={{ fontSize: 13, color: MUTED }}>© 2025 PFAuto · Aplicație pentru șoferi Uber & Bolt PFA din România</p>
      </footer>

    </div>
  );
}
