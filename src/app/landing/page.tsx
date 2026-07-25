'use client';

import { useState } from 'react';
import Link from 'next/link';

const LIME = '#D7FF4C';
const INK = '#121014';
const CREAM = '#F6F1E4';
const OLIVE = '#4A5A0F';
const MUTED_DARK = 'rgba(255,255,255,0.5)';
const BORDER_LIGHT = '#E7E2D3';

function FaqItem({ q, a, open, onToggle }: { q: string; a: string; open: boolean; onToggle: () => void }) {
  return (
    <div style={{ background: '#fff', border: `1px solid ${BORDER_LIGHT}`, borderRadius: 16, padding: '20px 22px', marginBottom: 10 }}>
      <button onClick={onToggle} style={{ width: '100%', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, padding: 0 }}>
        <span style={{ fontSize: 15, fontWeight: 700, color: INK, lineHeight: 1.4 }}>{q}</span>
        <span style={{ fontSize: 22, color: OLIVE, flexShrink: 0, transition: 'transform 0.2s', display: 'inline-block', transform: open ? 'rotate(45deg)' : 'none', lineHeight: 1 }}>+</span>
      </button>
      {open && <p style={{ marginTop: 12, fontSize: 14, color: '#6B6455', lineHeight: 1.65 }}>{a}</p>}
    </div>
  );
}

export default function LandingPage() {
  const [kmAn, setKmAn] = useState(30000);
  const [consum, setConsum] = useState(7);
  const [pret, setPret] = useState(7.2);
  const [regim, setRegim] = useState<'micro' | 'profit'>('micro');
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const fuelCostYear = (kmAn / 100) * consum * pret;
  const vatLost = fuelCostYear * 0.19 * 0.5;
  const profitLost = regim === 'profit' ? fuelCostYear * 0.5 * 0.16 : fuelCostYear * 0.5 * 0.01;
  const lostPerYear = vatLost + profitLost;
  const lost3 = lostPerYear * 3;

  const SliderField = ({ label, value, min, max, step, onChange, format }: {
    label: string; value: number; min: number; max: number; step: number;
    onChange: (v: number) => void; format: (v: number) => string;
  }) => (
    <div style={{ marginBottom: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
        <span style={{ fontSize: 13, color: '#6B6455', fontWeight: 600 }}>{label}</span>
        <span style={{ fontSize: 13, color: OLIVE, fontWeight: 700 }}>{format(value)}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={e => onChange(Number(e.target.value))}
        style={{ width: '100%', accentColor: INK }} />
    </div>
  );

  const faqs = [
    { q: 'Ce este o foaie de parcurs și de ce am nevoie de ea?', a: 'Foaia de parcurs este documentul contabil obligatoriu pentru PFA-urile care deduc cheltuielile cu combustibilul. Fără ea, fiscul poate respinge deducerile și poți plăti penalități. PFAuto generează automat documentul conform cerințelor ANAF.' },
    { q: 'Cum scanează PFAuto bonul de combustibil?', a: 'Fotografiezi bonul direct din aplicație. Imaginea este procesată cu AI (Claude Haiku) care extrage automat litrii, valoarea totală, stația și data alimentării — totul în câteva secunde, fără tastare manuală.' },
    { q: 'Pot anula oricând abonamentul?', a: 'Da, poți anula oricând din secțiunea Setări a aplicației. Nu există perioadă minimă de contract. Datele tale rămân accesibile până la expirarea perioadei plătite.' },
    { q: 'Funcționează dacă am mai multe mașini sau lucrez pe mai multe platforme?', a: 'Poți adăuga oricâte mașini și înregistra curse pe orice platformă (Uber, Bolt, altele). Rapoartele sunt generate separat pentru fiecare vehicul.' },
    { q: 'Ce primesc după cele 3 zile de testare gratuită?', a: 'Dacă nu activezi un abonament, contul trece în modul citire — poți vedea datele deja introduse, dar nu mai poți adăuga zile noi. Nu ștergem nimic. Reactivezi oricând cu 25 RON/lună.' },
  ];

  return (
    <div style={{ fontFamily: "'Plus Jakarta Sans', -apple-system, sans-serif", WebkitFontSmoothing: 'antialiased' }}>

      {/* ── NAV ── */}
      <header style={{ background: CREAM, borderBottom: `1px solid ${BORDER_LIGHT}`, position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ maxWidth: 1080, margin: '0 auto', padding: '14px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: INK, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M4 17L10 7L14 13L20 5" stroke={LIME} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span style={{ fontWeight: 800, fontSize: 17, letterSpacing: '-0.02em', color: INK }}>PFAuto</span>
          </div>
          <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
            <Link href="/login" style={{ fontSize: 14, fontWeight: 600, color: '#4B4738', textDecoration: 'none' }}>Autentificare</Link>
            <Link href="/login" style={{ background: INK, color: '#fff', fontWeight: 700, fontSize: 14, padding: '10px 20px', borderRadius: 100, textDecoration: 'none' }}>Începe gratuit</Link>
          </div>
        </div>
      </header>

      {/* ── HERO ── */}
      <section style={{ background: INK, padding: '80px 24px 100px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -120, right: -80, width: 420, height: 420, borderRadius: '50%', background: 'radial-gradient(circle, rgba(215,255,76,0.18), transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'relative' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.14)', borderRadius: 100, padding: '7px 16px', fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.75)', marginBottom: 36, letterSpacing: '0.01em' }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: LIME, display: 'inline-block', flexShrink: 0 }} />
            Acces anticipat pentru șoferi Uber &amp; Bolt
          </div>
          <h1 style={{ fontSize: 'clamp(38px, 8vw, 66px)', fontWeight: 900, letterSpacing: '-0.03em', lineHeight: 1.06, margin: '0 auto 24px', maxWidth: 760, color: '#fff' }}>
            Foaia de parcurs se face singură.<br />
            <span style={{ color: LIME }}>Tu doar conduci.</span>
          </h1>
          <p style={{ fontSize: 16, color: MUTED_DARK, lineHeight: 1.7, maxWidth: 520, margin: '0 auto 44px' }}>
            Faci o poză bonului de combustibil, PFAuto calculează kilometrii și scoate documentul gata de predat la contabil. Fără Excel, fără hârtii pierdute.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 18 }}>
            <Link href="/login" style={{ background: LIME, color: INK, fontWeight: 800, fontSize: 15, padding: '16px 30px', borderRadius: 100, textDecoration: 'none', display: 'inline-block', letterSpacing: '-0.01em' }}>
              Începe testul gratuit de 3 zile
            </Link>
            <a href="#calculator" style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', fontWeight: 700, fontSize: 15, padding: '16px 30px', borderRadius: 100, textDecoration: 'none', display: 'inline-block' }}>
              Vezi cât pierzi →
            </a>
          </div>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)', fontWeight: 500 }}>
            Fără card bancar la înscriere · Anulezi oricând din aplicație
          </p>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section style={{ background: CREAM, padding: '72px 24px' }}>
        <div style={{ maxWidth: 1080, margin: '0 auto' }}>
          <p style={{ textAlign: 'center', fontSize: 11.5, fontWeight: 700, letterSpacing: '0.12em', color: OLIVE, textTransform: 'uppercase', marginBottom: 14 }}>Cum funcționează</p>
          <h2 style={{ textAlign: 'center', fontSize: 'clamp(28px, 5vw, 40px)', fontWeight: 800, letterSpacing: '-0.025em', marginBottom: 52, color: INK }}>Trei pași, zero bătăi de cap</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 20 }}>
            {[
              {
                icon: <path d="M8 2H6a2 2 0 00-2 2v14a2 2 0 002 2h12a2 2 0 002-2V8l-6-6H8z" stroke={LIME} strokeWidth="1.8" strokeLinejoin="round"/>,
                title: 'Adaugi ziua',
                desc: 'Selectezi data și aplicația preia automat kilometrajul de la ziua precedentă.',
              },
              {
                icon: <><path d="M4 8h3l2-3h6l2 3h3a1 1 0 011 1v9a1 1 0 01-1 1H4a1 1 0 01-1-1V9a1 1 0 011-1z" stroke={LIME} strokeWidth="1.8" strokeLinejoin="round"/><circle cx="12" cy="13.5" r="3" stroke={LIME} strokeWidth="1.8"/></>,
                title: 'Scanezi bonul',
                desc: 'Fotografiezi bonul de combustibil. AI-ul extrage litri, valoare, stație — instant.',
              },
              {
                icon: <><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" stroke={LIME} strokeWidth="1.8" strokeLinejoin="round"/><path d="M9 13h6M9 17h4" stroke={LIME} strokeWidth="1.8" strokeLinecap="round"/></>,
                title: 'Generezi raportul',
                desc: 'La final de lună, exporți foaia de parcurs completă, gata pentru contabil sau ANAF.',
              },
            ].map((step, i) => (
              <div key={i} style={{ background: '#fff', border: `1px solid ${BORDER_LIGHT}`, borderRadius: 20, padding: 28 }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: INK, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 18 }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">{step.icon}</svg>
                </div>
                <h3 style={{ fontSize: 18, fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 10, color: INK }}>{step.title}</h3>
                <p style={{ fontSize: 14, color: '#6B6455', lineHeight: 1.65 }}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CALCULATOR ── */}
      <section id="calculator" style={{ background: CREAM, borderTop: `1px solid ${BORDER_LIGHT}`, padding: '72px 24px' }}>
        <div style={{ maxWidth: 1080, margin: '0 auto' }}>
          <p style={{ textAlign: 'center', fontSize: 11.5, fontWeight: 700, letterSpacing: '0.12em', color: OLIVE, textTransform: 'uppercase', marginBottom: 14 }}>Calculator</p>
          <h2 style={{ textAlign: 'center', fontSize: 'clamp(28px, 5vw, 40px)', fontWeight: 800, letterSpacing: '-0.025em', marginBottom: 52, color: INK }}>Cât pierzi fără documente corecte?</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24, alignItems: 'start' }}>
            {/* Left card — white */}
            <div style={{ background: '#fff', border: `1px solid ${BORDER_LIGHT}`, borderRadius: 20, padding: 28 }}>
              <SliderField label="Km/an" value={kmAn} min={5000} max={80000} step={1000} onChange={setKmAn} format={v => `${v.toLocaleString('ro-RO')} km`} />
              <SliderField label="Consum (L/100km)" value={consum} min={4} max={14} step={0.5} onChange={setConsum} format={v => `${v} L`} />
              <SliderField label="Preț combustibil (RON/L)" value={pret} min={5} max={11} step={0.1} onChange={setPret} format={v => `${v.toFixed(1)} RON`} />
              <div style={{ display: 'flex', gap: 0, marginTop: 8, border: `1.5px solid ${INK}`, borderRadius: 100, overflow: 'hidden' }}>
                {(['micro', 'profit'] as const).map(r => (
                  <button key={r} onClick={() => setRegim(r)} style={{ flex: 1, padding: '9px 0', fontSize: 12.5, fontWeight: 700, border: 'none', background: regim === r ? INK : 'transparent', color: regim === r ? LIME : '#6B6455', cursor: 'pointer', transition: 'all 0.15s' }}>
                    {r === 'micro' ? 'Microîntreprindere' : 'Impozit profit'}
                  </button>
                ))}
              </div>
            </div>
            {/* Right card — dark */}
            <div style={{ background: INK, borderRadius: 20, padding: 28 }}>
              <p style={{ fontSize: 11.5, fontWeight: 700, color: MUTED_DARK, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 24 }}>Ce pierzi pe an</p>
              <div style={{ marginBottom: 8 }}>
                <span style={{ fontSize: 13, color: MUTED_DARK }}>TVA nededusă</span>
                <div style={{ fontSize: 15, fontWeight: 700, color: '#fff', marginTop: 2 }}>{vatLost.toLocaleString('ro-RO', { maximumFractionDigits: 0 })} RON</div>
              </div>
              <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: 10, marginTop: 10, marginBottom: 8 }}>
                <span style={{ fontSize: 13, color: MUTED_DARK }}>Impozit nededus ({regim === 'micro' ? '1%' : '16%'})</span>
                <div style={{ fontSize: 15, fontWeight: 700, color: '#fff', marginTop: 2 }}>{profitLost.toLocaleString('ro-RO', { maximumFractionDigits: 0 })} RON</div>
              </div>
              <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: 18, marginTop: 8 }}>
                <p style={{ fontSize: 13, color: MUTED_DARK, marginBottom: 6 }}>Total pierdut pe an</p>
                <div style={{ fontSize: 34, fontWeight: 900, color: LIME, letterSpacing: '-0.03em', lineHeight: 1 }}>
                  {lostPerYear.toLocaleString('ro-RO', { maximumFractionDigits: 0 })} RON
                </div>
                <p style={{ fontSize: 13, color: MUTED_DARK, marginTop: 14, marginBottom: 4 }}>Pe 3 ani:</p>
                <div style={{ fontSize: 22, fontWeight: 800, color: 'rgba(215,255,76,0.65)', letterSpacing: '-0.02em' }}>
                  {lost3.toLocaleString('ro-RO', { maximumFractionDigits: 0 })} RON
                </div>
              </div>
              <p style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.2)', marginTop: 16, lineHeight: 1.5 }}>*estimativ · consultați un contabil autorizat</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section style={{ background: CREAM, borderTop: `1px solid ${BORDER_LIGHT}`, padding: '72px 24px' }}>
        <div style={{ maxWidth: 420, margin: '0 auto', textAlign: 'center' }}>
          <p style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: '0.12em', color: OLIVE, textTransform: 'uppercase', marginBottom: 14 }}>Prețuri</p>
          <h2 style={{ fontSize: 'clamp(28px, 5vw, 40px)', fontWeight: 800, letterSpacing: '-0.025em', marginBottom: 40, color: INK }}>Un singur plan, simplu</h2>
          <div style={{ position: 'relative', background: '#fff', border: `2px solid ${INK}`, borderRadius: 28, padding: '40px 32px 32px' }}>
            <div style={{ position: 'absolute', top: -14, left: '50%', transform: 'translateX(-50%)', background: LIME, color: INK, fontSize: 12, fontWeight: 800, padding: '5px 14px', borderRadius: 100, letterSpacing: '0.04em', whiteSpace: 'nowrap' }}>
              CEL MAI POPULAR
            </div>
            <div style={{ fontSize: 50, fontWeight: 900, letterSpacing: '-0.03em', lineHeight: 1, color: INK }}>
              25 <span style={{ fontSize: 22, fontWeight: 700, color: '#8C8776' }}>RON/lună</span>
            </div>
            <p style={{ fontSize: 14, color: '#8C8776', margin: '12px 0 28px' }}>Sau 200 RON/an — 2 luni gratuit</p>
            {[
              'Foaie parcurs ANAF-conformă',
              'Scanare bon cu AI',
              'Sincronizare în cloud',
              'Rapoarte lunare export PDF',
              'Suport 7/7 pe email',
            ].map(f => (
              <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 10, textAlign: 'left', marginBottom: 12 }}>
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" style={{ flexShrink: 0 }}>
                  <circle cx="9" cy="9" r="9" fill={INK}/>
                  <path d="M5.5 9l2.5 2.5L12.5 6" stroke={LIME} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span style={{ fontSize: 14, fontWeight: 500, color: INK }}>{f}</span>
              </div>
            ))}
            <Link href="/login" style={{ display: 'block', marginTop: 28, background: INK, color: '#fff', fontWeight: 800, fontSize: 15, padding: '17px 0', borderRadius: 100, textDecoration: 'none' }}>
              3 zile gratuit — fără card
            </Link>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section style={{ background: '#EFEADA', borderTop: `1px solid ${BORDER_LIGHT}`, padding: '72px 24px' }}>
        <div style={{ maxWidth: 1080, margin: '0 auto' }}>
          <p style={{ textAlign: 'center', fontSize: 11.5, fontWeight: 700, letterSpacing: '0.12em', color: OLIVE, textTransform: 'uppercase', marginBottom: 14 }}>Testimoniale</p>
          <h2 style={{ textAlign: 'center', fontSize: 'clamp(28px, 5vw, 40px)', fontWeight: 800, letterSpacing: '-0.025em', marginBottom: 52, color: INK }}>Ce spun șoferii</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 20 }}>
            {[
              { name: 'Marius D.', city: 'Cluj', platform: 'Uber', text: 'Înainte pierdeam ore întregi la final de lună cu foile de parcurs. Acum le generez în 2 minute. Contabilul meu e surprins cât de ordonat sunt documentele.' },
              { name: 'Ionela R.', city: 'București', platform: 'Bolt', text: 'Scanarea bonului chiar funcționează! Am testat cu bonuri mototolite și tot le-a citit. M-a convins din prima zi de trial.' },
              { name: 'Cătălin S.', city: 'Timișoara', platform: 'Uber', text: 'Calculatorul de pe site m-a șocat — pierdeam 1.800 RON pe an fără să știu. Acum deduc tot ce am dreptul.' },
            ].map((t, i) => (
              <div key={i} style={{ background: '#fff', border: `1px solid ${BORDER_LIGHT}`, borderRadius: 20, padding: 26 }}>
                <p style={{ fontSize: 14, color: '#4B4738', lineHeight: 1.7, marginBottom: 20 }}>&ldquo;{t.text}&rdquo;</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: INK, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 800, color: LIME, flexShrink: 0 }}>
                    {t.name[0]}
                  </div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: INK }}>{t.name}</div>
                    <div style={{ fontSize: 12, color: '#8C8776' }}>{t.city} · {t.platform}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section style={{ background: CREAM, borderTop: `1px solid ${BORDER_LIGHT}`, padding: '72px 24px' }}>
        <div style={{ maxWidth: 640, margin: '0 auto' }}>
          <p style={{ textAlign: 'center', fontSize: 11.5, fontWeight: 700, letterSpacing: '0.12em', color: OLIVE, textTransform: 'uppercase', marginBottom: 14 }}>FAQ</p>
          <h2 style={{ textAlign: 'center', fontSize: 'clamp(28px, 5vw, 40px)', fontWeight: 800, letterSpacing: '-0.025em', marginBottom: 40, color: INK }}>Întrebări frecvente</h2>
          {faqs.map((faq, i) => (
            <FaqItem key={i} q={faq.q} a={faq.a} open={openFaq === i} onToggle={() => setOpenFaq(openFaq === i ? null : i)} />
          ))}
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ background: INK, padding: '40px 24px', textAlign: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center', marginBottom: 16 }}>
          <div style={{ width: 32, height: 32, borderRadius: 9, background: 'rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
              <path d="M4 17L10 7L14 13L20 5" stroke={LIME} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <span style={{ fontWeight: 800, fontSize: 15, color: '#fff' }}>PFAuto</span>
        </div>
        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.3)', lineHeight: 1.6 }}>
          © 2025 PFAuto · pfauto.app<br />
          Aplicație pentru șoferi Uber &amp; Bolt PFA din România
        </p>
      </footer>
    </div>
  );
}
