'use client';

import { useState } from 'react';
import { useAppwrite } from '@/hooks/useAppwrite';
import './report.css';

export default function ReportPage() {
  const { entries, settings, isLoaded } = useAppwrite();
  
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  const monthEntries = entries.filter(e => {
    const d = new Date(e.date);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const totalKm = monthEntries.reduce((acc, curr) => acc + (curr.kmEnd - curr.kmStart), 0);
  const totalTrips = monthEntries.reduce((acc, curr) => acc + curr.tripCount, 0);
  const totalLiters = monthEntries.reduce((acc, curr) => acc + (curr.fueling?.liters || 0), 0);
  const totalFuelVal = monthEntries.reduce((acc, curr) => acc + (curr.fueling?.value || 0), 0);
  
  const consumptionNormed = (totalKm * settings.fuelNorm) / 100;
  const savings = Math.max(0, consumptionNormed - totalLiters);

  const monthName = new Intl.DateTimeFormat('ro-RO', { month: 'long' }).format(new Date(currentYear, currentMonth)).toUpperCase();

  if (!isLoaded) return <div className="container">Incarcare...</div>;

  return (
    <div className="report-container">
      <div className="no-print controls card">
        <h3>Filtrare Raport</h3>
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
        <button className="btn btn-primary" onClick={() => window.print()} style={{ marginTop: '1rem' }}>
          🖨️ Imprimă Raportul (A4)
        </button>
      </div>

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
                  <th rowSpan={2}>Litri comb in rezervor</th>
                  <th rowSpan={2}>Nr. Bonului de combustibil</th>
                </tr>
                <tr>
                  <th>Litri</th>
                  <th>Valoare</th>
                </tr>
              </thead>
              <tbody>
                {monthEntries.filter(e => e.fueling).map((e, idx) => (
                  <tr key={idx}>
                    <td>{new Date(e.date).toLocaleDateString('ro-RO', { day: '2-digit', month: '2-digit' })}</td>
                    <td>{e.fueling?.liters}</td>
                    <td>{e.fueling?.value}</td>
                    <td>{e.fueling?.station}</td>
                    <td>{e.kmEnd}</td>
                    <td>#</td>
                  </tr>
                ))}
                {Array.from({ length: Math.max(0, 15 - monthEntries.filter(e => e.fueling).length) }).map((_, i) => (
                  <tr key={i}><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td></tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                    <td>TOTAL</td>
                    <td>{totalLiters.toFixed(2)}</td>
                    <td>{totalFuelVal.toFixed(2)}</td>
                    <td colSpan={3}>&nbsp;</td>
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
  );
}
