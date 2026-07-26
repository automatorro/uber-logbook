'use client';

import { useState } from 'react';
import { useSupabase } from '@/hooks/useSupabase';
import { useLanguage } from '@/i18n/LanguageContext';
import { exportToExcel, exportToXML, exportToPDF } from '@/utils/fuelExport';
import './report.css';

export default function ReportPage() {
  const { entries, settings, isLoaded } = useSupabase();
  const { t } = useLanguage();

  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [exportScope, setExportScope] = useState<'month' | 'year'>('month');
  const [exporting, setExporting] = useState(false);

  const monthEntries = entries.filter(e => {
    const d = new Date(e.date);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const totalKm = monthEntries.reduce((acc, curr) => acc + (curr.kmEnd - curr.kmStart), 0);
  const totalTrips = monthEntries.reduce((acc, curr) => acc + curr.tripCount, 0);

  const allFuelings = monthEntries.flatMap(e => e.fuelings);
  const totalLiters = allFuelings.reduce((acc, f) => acc + f.liters, 0);
  const totalFuelVal = allFuelings.reduce((acc, f) => acc + f.value, 0);

  const yearEntries = entries.filter(e => new Date(e.date).getFullYear() === currentYear);
  const yearFuelings = yearEntries.flatMap(e => e.fuelings);

  const exportFuelings = exportScope === 'month' ? allFuelings : yearFuelings;
  const exportPeriod = exportScope === 'month'
    ? new Intl.DateTimeFormat('ro-RO', { month: 'long', year: 'numeric' }).format(new Date(currentYear, currentMonth))
    : `Anul ${currentYear}`;
  const exportFilename = exportScope === 'month'
    ? `bonuri-combustibil-${currentYear}-${String(currentMonth + 1).padStart(2, '0')}`
    : `bonuri-combustibil-${currentYear}`;

  const handleExport = async (format: 'excel' | 'xml' | 'pdf') => {
    if (exportFuelings.length === 0) return;
    setExporting(true);
    try {
      if (format === 'excel') await exportToExcel(exportFuelings, exportFilename);
      else if (format === 'xml') exportToXML(exportFuelings, settings, exportFilename);
      else exportToPDF(exportFuelings, settings, exportPeriod);
    } finally {
      setExporting(false);
    }
  };

  const consumptionNormed = (totalKm * settings.fuelNorm) / 100;
  const savings = Math.max(0, consumptionNormed - totalLiters);

  const monthName = new Intl.DateTimeFormat('ro-RO', { month: 'long' }).format(new Date(currentYear, currentMonth)).toUpperCase();

  if (!isLoaded) return <div className="container" style={{ paddingTop: '4rem', textAlign: 'center' }}><div style={{ fontSize: '2rem', marginBottom: '1rem' }}>📄</div><p style={{ color: 'var(--muted)', fontWeight: 500 }}>{t.report.loading}</p></div>;

  return (
    <div className="report-container">
      <div className="report-controls no-print">
        <div className="card" style={{ marginBottom: 0 }}>
          <h3>{t.report.filterTitle}</h3>
          <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
            <select
              className="form-control"
              value={currentMonth}
              onChange={(e) => setCurrentMonth(parseInt(e.target.value))}
            >
              {Array.from({ length: 12 }).map((_, i) => (
                <option key={i} value={i}>
                  {new Intl.DateTimeFormat('ro-RO', { month: 'long' }).format(new Date(0, i))}
                </option>
              ))}
            </select>
            <input
              className="form-control"
              type="number"
              value={currentYear}
              onChange={(e) => setCurrentYear(parseInt(e.target.value))}
            />
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', marginTop: '1rem' }}>
            <button className="btn btn-primary" onClick={() => window.print()} style={{ flex: 1 }}>
              {t.report.printBtn}
            </button>
          </div>
          <p style={{ fontSize: '0.72rem', color: 'var(--muted)', marginTop: '0.5rem', textAlign: 'center' }}>
            ← Foaia A4 se poate derula orizontal mai jos →
          </p>
        </div>
      </div>

      {/* Export bonuri combustibil */}
      <div className="card" style={{ margin: '0 1rem 1rem', borderRadius: 20 }}>
        <p className="section-label" style={{ marginBottom: '0.75rem' }}>Export bonuri combustibil</p>

        {/* Scope toggle */}
        <div style={{ display: 'flex', gap: 6, marginBottom: '0.875rem' }}>
          {(['month', 'year'] as const).map(s => (
            <button key={s} onClick={() => setExportScope(s)} style={{
              flex: 1, padding: '8px 0', borderRadius: 100, border: '1.5px solid',
              fontSize: 13, fontWeight: 700, cursor: 'pointer', transition: 'all 0.12s',
              borderColor: exportScope === s ? '#171511' : 'var(--border)',
              background: exportScope === s ? '#171511' : 'transparent',
              color: exportScope === s ? '#D7FF4C' : 'var(--muted)',
            }}>
              {s === 'month' ? `Luna selectată` : `Tot ${currentYear}`}
            </button>
          ))}
        </div>

        {/* Summary */}
        <div style={{ background: 'var(--bg)', borderRadius: 12, padding: '8px 14px', marginBottom: '0.875rem', fontSize: 13, color: 'var(--muted)', display: 'flex', justifyContent: 'space-between' }}>
          <span>{exportPeriod}</span>
          <span style={{ fontWeight: 700, color: 'var(--text)' }}>
            {exportFuelings.length} {exportFuelings.length === 1 ? 'bon' : 'bonuri'}
            {exportFuelings.length > 0 && ` · ${exportFuelings.reduce((s, f) => s + f.value, 0).toFixed(2)} RON`}
          </span>
        </div>

        {exportFuelings.length === 0 ? (
          <p style={{ fontSize: 13, color: 'var(--muted)', textAlign: 'center', padding: '8px 0' }}>
            Nu există bonuri înregistrate pentru perioada selectată.
          </p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
            {([
              { fmt: 'excel' as const, label: '📊 Excel', sub: '.xlsx' },
              { fmt: 'pdf'   as const, label: '🖨️ PDF',   sub: 'printabil' },
              { fmt: 'xml'   as const, label: '🗂️ XML',   sub: 'contabilitate' },
            ]).map(({ fmt, label, sub }) => (
              <button key={fmt} onClick={() => handleExport(fmt)} disabled={exporting} style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
                padding: '10px 6px', borderRadius: 14,
                border: '1.5px solid var(--border)', background: 'var(--card-bg)',
                cursor: exporting ? 'not-allowed' : 'pointer', opacity: exporting ? 0.6 : 1,
                transition: 'opacity 0.12s',
              }}>
                <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>{label}</span>
                <span style={{ fontSize: 10.5, color: 'var(--muted)' }}>{sub}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="document-scroll-area">
      <div className="document-page fata">
        <div className="header-grid">
          <div className="unitatea-box">
            <div className="unitatea-title">{settings.pfaName} CIF {settings.pfaCif}</div>
            <div className="unitatea-subtitle">(unitatea, subunitatea)</div>
          </div>
          <div className="form-title-box">
            <div className="doc-type">FOAIA DE PARCURS</div>
            <div className="doc-details">
                <span>seria 1</span>
                <span>Nr. 1</span>
            </div>
            <div className="period-box">
                Pentru luna: <strong>{monthName}</strong> {currentYear}
            </div>
          </div>
        </div>

        <div className="info-grid">
          <div className="vehicul-box">
             <table>
                <thead>
                    <tr><th colSpan={2}>Autovehiculul este in stare buna</th></tr>
                </thead>
                <tbody>
                    <tr><td>Data</td><td>Semnatura conducatorului auto</td></tr>
                    <tr><td>&nbsp;</td><td>&nbsp;</td></tr>
                    <tr><td>&nbsp;</td><td>&nbsp;</td></tr>
                </tbody>
             </table>
          </div>
          <div className="expiry-box">
             <div className="row"><span>Eliberata la</span> <strong>{new Date(currentYear, currentMonth, 1).toLocaleDateString()}</strong></div>
             <div className="row"><span>Valabila pana la</span> <strong>{new Date(currentYear, currentMonth + 1, 0).toLocaleDateString()}</strong></div>
             <div className="vehicle-details">
                Auto: <strong>{settings.carBrand}</strong> Marca: <strong>{settings.carModel}</strong><br/>
                Nr. Inmatriculare: <strong>{settings.carPlate}</strong>
             </div>
             <div className="driver-details">
                Conducatori auto: <strong>{settings.driverName}</strong>
             </div>
          </div>
          <div className="stamp-box">
             <div className="warning-text">
                ATENTIUNE!<br/>
                - Aici important, se completeaza si se pastreaza cu deosebita grija;<br/>
                - La sfarsitul zilei de lucru se preda la unitate (subunitate);<br/>
                Pentru pierdere sau completari gresite, vinovatii vor fi facuti raspunzatori.
             </div>
          </div>
        </div>

        <div className="tables-grid">
          <div className="fuel-table-container">
            <h3>Alimentat</h3>
            <table className="doc-table">
              <thead>
                <tr>
                  <th rowSpan={2}>Data</th>
                  <th colSpan={2}>COMBUSTIBIL</th>
                  <th rowSpan={2}>Statie carburanti</th>
                  <th rowSpan={2}>Nr. Bonului de combustibil</th>
                </tr>
                <tr>
                  <th>Litri</th>
                  <th>Valoare</th>
                </tr>
              </thead>
              <tbody>
                {allFuelings.map((f, idx) => (
                  <tr key={idx}>
                    <td>{new Date(f.date).toLocaleDateString('ro-RO', { day: '2-digit', month: '2-digit' })}</td>
                    <td>{f.liters}</td>
                    <td>{f.value}</td>
                    <td>{f.station}</td>
                    <td>{f.bill || '-'}</td>
                  </tr>
                ))}
                {Array.from({ length: Math.max(0, 15 - allFuelings.length) }).map((_, i) => (
                  <tr key={i}><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td></tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                    <td>TOTAL</td>
                    <td>{totalLiters.toFixed(2)}</td>
                    <td>{totalFuelVal.toFixed(2)}</td>
                    <td colSpan={2}>&nbsp;</td>
                </tr>
              </tfoot>
            </table>
          </div>

          <div className="km-table-container">
             <h3>Kilometri la</h3>
             <table className="doc-table">
                <thead>
                    <tr>
                        <th rowSpan={2}>Data</th>
                        <th colSpan={2}>Kilometri la</th>
                        <th rowSpan={2}>Total kilometri parcursi</th>
                        <th rowSpan={2}>Total numar curse</th>
                    </tr>
                    <tr>
                        <th>Plecare</th>
                        <th>Iesire</th>
                    </tr>
                </thead>
                <tbody>
                    {monthEntries.map((e, idx) => (
                        <tr key={idx}>
                            <td>{new Date(e.date).toLocaleDateString('ro-RO', { day: '2-digit', month: '2-digit' })}</td>
                            <td>{e.kmStart}</td>
                            <td>{e.kmEnd}</td>
                            <td>{e.kmEnd - e.kmStart}</td>
                            <td>{e.tripCount}</td>
                        </tr>
                    ))}
                    {Array.from({ length: Math.max(0, 20 - monthEntries.length) }).map((_, i) => (
                        <tr key={i}><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td></tr>
                    ))}
                </tbody>
                <tfoot>
                    <tr>
                        <td colSpan={3}>TOTAL KM SI CURSE / LUNA</td>
                        <td>{totalKm}</td>
                        <td>{totalTrips}</td>
                    </tr>
                </tfoot>
             </table>
          </div>
        </div>

        <div className="summary-section">
            <div className="control-box">
                AUTOVEHICULUL ESTE CONTROLAT, ALIMENTAT SI PARCAT<br/>
                (certificarea facuta de persoana de serviciu pe parc)*
            </div>
            <table className="consumption-table">
                <thead>
                    <tr>
                        <th>Consum carburanti</th>
                        <th>Consum real</th>
                        <th>Consum normat LITRI/100 KM</th>
                        <th>Economii</th>
                        <th>Consum peste norma</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>LITRI</td>
                        <td>{totalLiters.toFixed(2)}</td>
                        <td>{settings.fuelNorm}</td>
                        <td>{savings.toFixed(2)}</td>
                        <td>0.00</td>
                    </tr>
                </tbody>
            </table>
            <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'space-between' }}>
                <div>Intocmit ** <strong>{settings.driverName}</strong></div>
                <div>L.S. (Stampila)</div>
            </div>
        </div>
      </div>

      <div className="document-page verso">
        <h2 className="verso-title">LUCRUL AUTOVEHICULULUI</h2>
        <table className="verso-table">
            <thead>
                <tr>
                    <th colSpan={2}>PLECARE</th>
                    <th colSpan={2}>SOSIRE</th>
                    <th rowSpan={2}>DE UNDE PANA UNDE (ruta)</th>
                    <th colSpan={2}>Km efectivi parcursi</th>
                    <th rowSpan={2}>Beneficiar**</th>
                    <th colSpan={2}>PERSOANA CARE A FOLOSIT...</th>
                </tr>
                <tr>
                    <th>Data</th>
                    <th>Ora</th>
                    <th>Data</th>
                    <th>Ora</th>
                    <th>Total</th>
                    <th>neamenajate</th>
                    <th>Pana la ora</th>
                    <th>Nume si prenume</th>
                </tr>
            </thead>
            <tbody>
                {monthEntries.map((e, idx) => (
                    <tr key={idx}>
                        <td>{new Date(e.date).toLocaleDateString('ro-RO', { day: '2-digit', month: '2-digit', year: 'numeric' })}</td>
                        <td>{e.startTime}</td>
                        <td>{new Date(e.date).toLocaleDateString('ro-RO', { day: '2-digit', month: '2-digit', year: 'numeric' })}</td>
                        <td>{e.endTime}</td>
                        <td>{e.route}</td>
                        <td>{e.kmEnd - e.kmStart}</td>
                        <td>0</td>
                        <td>Client Uber app</td>
                        <td>{e.endTime}</td>
                        <td>{settings.driverName}</td>
                    </tr>
                ))}
                {Array.from({ length: Math.max(0, 31 - monthEntries.length) }).map((_, i) => (
                    <tr key={i}><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td></tr>
                ))}
            </tbody>
            <tfoot>
                <tr>
                    <td colSpan={5} style={{ textAlign: 'right', fontWeight: 'bold', padding: '0.2rem 1rem' }}>Total</td>
                    <td>{totalKm}</td>
                    <td>0</td>
                    <td colSpan={3}>&nbsp;</td>
                </tr>
            </tfoot>
        </table>

        <div className="verso-footer">
            <div className="sign-box">
                Certific exactitatea si realitatea<br/>scrierilor din prezenta foaie de parcurs<br/><br/>
                Conducatorul autovehiculului: ________________
            </div>
            <div className="sign-box">
                VERIFICAT<br/>Reprezentant oficial firma<br/><br/>
                (semnatura): ________________
            </div>
            <div className="sign-box obs">
                Observatii speciale:<br/><hr/><hr/><hr/>
            </div>
        </div>
      </div>
      </div>
    </div>
  );
}
