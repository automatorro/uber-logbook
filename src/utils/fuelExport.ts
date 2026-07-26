import type { Fueling, Settings } from '@/types';

interface ExportRow {
  Data: string;
  Statie: string;
  CIF_Statie: string;
  Nr_Bon: string;
  Plata: string;
  Litri: number;
  Valoare_RON: number;
}

function buildRows(fuelings: Fueling[]): ExportRow[] {
  return fuelings
    .slice()
    .sort((a, b) => a.date.localeCompare(b.date))
    .map(f => ({
      Data: f.date,
      Statie: f.station || '',
      CIF_Statie: f.stationCif || '',
      Nr_Bon: f.bill || '',
      Plata: f.paymentMethod || '',
      Litri: f.liters,
      Valoare_RON: f.value,
    }));
}

function xmlEsc(s: string) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function triggerDownload(content: string, filename: string, mime: string) {
  const a = document.createElement('a');
  const blob = new Blob([content], { type: mime + ';charset=utf-8;' });
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(a.href);
}

export async function exportToExcel(fuelings: Fueling[], filename: string) {
  const { utils, writeFile } = await import('xlsx');
  const rows = buildRows(fuelings);
  const ws = utils.json_to_sheet(rows);

  // Adjust column widths
  ws['!cols'] = [
    { wch: 12 }, { wch: 18 }, { wch: 14 }, { wch: 14 }, { wch: 8 }, { wch: 8 }, { wch: 12 },
  ];

  const wb = utils.book_new();
  utils.book_append_sheet(wb, ws, 'Alimentari combustibil');
  writeFile(wb, `${filename}.xlsx`);
}

export function exportToXML(fuelings: Fueling[], settings: Settings, filename: string) {
  const rows = buildRows(fuelings);
  const items = rows.map(r => `
  <Alimentare>
    <Data>${r.Data}</Data>
    <Statie>${xmlEsc(r.Statie)}</Statie>
    <CIF_Statie>${xmlEsc(r.CIF_Statie)}</CIF_Statie>
    <NrBon>${xmlEsc(r.Nr_Bon)}</NrBon>
    <Plata>${r.Plata}</Plata>
    <Litri>${r.Litri.toFixed(3)}</Litri>
    <ValoareRON>${r.Valoare_RON.toFixed(2)}</ValoareRON>
  </Alimentare>`).join('');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<AlimentariCombustibil>
  <Entitate>
    <Denumire>${xmlEsc(settings.pfaName)}</Denumire>
    <CIF>${xmlEsc(settings.pfaCif)}</CIF>
    <NumarInmatriculare>${xmlEsc(settings.carPlate)}</NumarInmatriculare>
  </Entitate>
  <Inregistrari>${items}
  </Inregistrari>
</AlimentariCombustibil>`;

  triggerDownload(xml, `${filename}.xml`, 'application/xml');
}

export function exportToPDF(fuelings: Fueling[], settings: Settings, period: string) {
  const rows = buildRows(fuelings);
  const totalLiters = rows.reduce((s, r) => s + r.Litri, 0);
  const totalValue  = rows.reduce((s, r) => s + r.Valoare_RON, 0);

  const tableRows = rows.map(r => `
    <tr>
      <td>${r.Data}</td>
      <td>${xmlEsc(r.Statie)}</td>
      <td>${xmlEsc(r.CIF_Statie)}</td>
      <td>${xmlEsc(r.Nr_Bon)}</td>
      <td>${r.Plata}</td>
      <td class="num">${r.Litri.toFixed(3)}</td>
      <td class="num">${r.Valoare_RON.toFixed(2)}</td>
    </tr>`).join('');

  const html = `<!DOCTYPE html>
<html lang="ro">
<head>
  <meta charset="UTF-8">
  <title>Bonuri combustibil – ${period}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: Arial, sans-serif; font-size: 8.5pt; padding: 1.2cm; color: #111; }
    h2 { font-size: 13pt; font-weight: 700; margin-bottom: 3px; }
    .meta { font-size: 8pt; color: #555; margin-bottom: 14px; }
    table { width: 100%; border-collapse: collapse; }
    th { background: #1a1a1a; color: #fff; font-size: 7.5pt; padding: 5px 6px; text-align: left; }
    td { border: 1px solid #ddd; padding: 4px 6px; font-size: 8pt; }
    tr:nth-child(even) td { background: #f7f7f7; }
    td.num, th.num { text-align: right; }
    tfoot td { background: #eee; font-weight: 700; }
    @media print {
      @page { margin: 1cm; size: A4 landscape; }
      body { padding: 0; }
    }
  </style>
</head>
<body>
  <h2>Bonuri combustibil &mdash; ${period}</h2>
  <p class="meta">${xmlEsc(settings.pfaName)} &nbsp;|&nbsp; CIF ${xmlEsc(settings.pfaCif)} &nbsp;|&nbsp; ${xmlEsc(settings.carPlate)} &nbsp;|&nbsp; ${xmlEsc(settings.driverName)}</p>
  <table>
    <thead>
      <tr>
        <th>Data</th>
        <th>Stație combustibil</th>
        <th>CIF stație</th>
        <th>Nr. bon</th>
        <th>Plată</th>
        <th class="num">Litri</th>
        <th class="num">Valoare (RON)</th>
      </tr>
    </thead>
    <tbody>${tableRows}</tbody>
    <tfoot>
      <tr>
        <td colspan="5" style="text-align:right; padding-right:10px">TOTAL</td>
        <td class="num">${totalLiters.toFixed(3)}</td>
        <td class="num">${totalValue.toFixed(2)}</td>
      </tr>
    </tfoot>
  </table>
</body>
</html>`;

  const w = window.open('', '_blank');
  if (!w) return;
  w.document.write(html);
  w.document.close();
  w.focus();
  setTimeout(() => w.print(), 350);
}
