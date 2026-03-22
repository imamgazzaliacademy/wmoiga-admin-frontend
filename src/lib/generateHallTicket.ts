// lib/generateHallTicket.ts

export interface HallTicketData {
    examinationCentre: string;
    registerNumber: string;
    nameOfCandidate: string;
    dateOfBirth: string;
    fatherName: string;
    motherName: string;
    photoUrl: string;
}

/**
 * Returns a fully-populated hall ticket HTML string.
 * Pass the result straight into downloadHallTicketAsPDF().
 */
export function generateHallTicketHTML(data: HallTicketData): string {
    const {
        examinationCentre,
        registerNumber,
        nameOfCandidate,
        dateOfBirth,
        fatherName,
        motherName,
        photoUrl,
    } = data;

    const photoContent = photoUrl
        ? `<img src="${photoUrl}" alt="Candidate Photo"
            style="width:100%;height:100%;object-fit:cover;border-radius:2px;" />`
        : `<div class="photo-icon">&#128247;</div><span>Affix Photo</span>`;

    return /* html */ `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Entrance Examination – Hall Ticket</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }

    body {
      font-family: 'Times New Roman', Times, serif;
      background: #fff;
    }

    .page {
      width: 210mm;
      min-height: 297mm;
      background: #fff;
      border: 2px solid #1a1a2e;
      padding: 14mm 14mm 10mm 14mm;
      position: relative;
    }

    /* ── HEADER ── */
    .header {
      text-align: center;
      border-bottom: 2.5px double #1a1a2e;
      padding-bottom: 20px;
      margin-bottom: 20px;
    }
    .logo-wrap { margin-bottom: 4px; }
    
    .logo-circle {
      width: 200px; height: 50px;
      display: inline-block;
      object-fit: contain;
      align-items: center; justify-content: center;
    }
    .academy-name {
      font-size: 17px; font-weight: bold;
      color: #1a1a2e; letter-spacing: 0.5px; margin-top: 2px;
    }
    .sub-name { font-size: 11px; color: #3a3a3a; margin-top: 1px; }
    .exam-title {
      font-size: 13px; font-weight: bold; margin-top: 4px;
      color: #1a1a2e; text-transform: uppercase; letter-spacing: 1px;
    }
    .ticket-label {
      display: inline-block; margin-top: 5px;
      background: #1a1a2e; color: #fff;
      font-size: 11px; font-weight: bold;
      padding: 2px 18px; letter-spacing: 1.5px; border-radius: 2px;
    }

    /* ── CANDIDATE SECTION ── */
    .candidate-section {
      display: flex; gap: 10px;
      margin-bottom: 10px;
      border: 1.5px solid #1a1a2e;
      border-radius: 3px;
      padding: 10px 12px;
    }
    .candidate-details { flex: 1; }
    .detail-row {
      display: flex; align-items: flex-start;
      margin-bottom: 7px; font-size: 11.5px;
    }
    .detail-label {
      min-width: 130px; font-weight: bold;
      color: #1a1a2e; flex-shrink: 0;
    }
    .detail-colon { margin: 0 6px; font-weight: bold; }
    .detail-value {
      flex: 1; min-height: 16px;
      color: #222; padding-bottom: 1px;
    }
    .photo-box {
      width: 90px; height: 110px;
      border: 1.5px solid #1a1a2e;
      display: flex; flex-direction: column;
      align-items: center; justify-content: center;
      flex-shrink: 0; border-radius: 2px;
      background: #f9f7f3; overflow: hidden;
    }
    .photo-box span { font-size: 11px; color: #777; font-style: italic; }
    .photo-icon { font-size: 28px; color: #bbb; margin-bottom: 4px; }

    /* ── EXAM TABLE ── */
    .exam-section { margin-bottom: 10px; }
    .section-title {
      font-size: 11px; font-weight: bold;
      color: #1a1a2e; margin-bottom: 5px;
      border-left: 3px solid #1a1a2e;
      padding-left: 6px; line-height: 1.4;
    }
    .exam-table { width: 100%; border-collapse: collapse; font-size: 11px; }
    .exam-table th {
      background: #1a1a2e; color: #fff;
      padding: 5px 8px; text-align: left;
      font-weight: bold; font-size: 10.5px; letter-spacing: 0.3px;
    }
    .exam-table td {
      border: 1px solid #aaa; padding: 7px 8px; vertical-align: middle;
    }
    .exam-table tr:nth-child(even) td { background: #f9f7f3; }
    .sig-cell { width: 34%; height: 32px; }

    /* ── SIGNATURES ── */
    .signature-section {
      display: flex; justify-content: space-between;
      margin-bottom: 10px; margin-top: 100px;
    }
    .sig-block { text-align: center; width: 44%; }
    .sig-line {
      border-top: 1.5px solid #1a1a2e;
      margin-bottom: 4px; margin-top: 28px;
    }
    .sig-label { font-size: 10.5px; font-weight: bold; color: #1a1a2e; }

    /* ── INSTRUCTIONS ── */
    .instructions-section {
      border: 1.5px solid #1a1a2e; border-radius: 3px;
      padding: 8px 12px; background: #faf8f4;
    }
    .instructions-title {
      font-size: 12px; font-weight: bold;
      text-transform: uppercase; letter-spacing: 1px;
      color: #1a1a2e; margin-bottom: 6px;
      border-bottom: 1px solid #ccc; 
      padding-bottom: 10px;
    }
    .instructions-list { list-style: none; padding: 0; }
    .instructions-list li {
      font-size: 10px; color: #333;
      line-height: 1.55; padding-left: 14px;
      position: relative; margin-bottom: 2px;
    }
    .instructions-list li::before {
      content: "•"; position: absolute; left: 3px;
      color: #1a1a2e; font-size: 11px;
    }

    /* ── FOOTER ── */
    .footer-note {
      text-align: center; font-size: 9px;
      color: #888; margin-top: 8px; font-style: italic;
    }

    @media print {
      body { background: none; padding: 0; margin: 0; }
      .page {
        width: 210mm; min-height: 297mm;
        box-shadow: none; border: 2px solid #000;
        padding: 12mm 12mm 8mm 12mm;
      }
    }
  </style>
</head>
<body>
  <div class="page">

    <!-- HEADER -->
    <div class="header">
      <div class="logo-wrap">
        <img class="logo-circle" src="/fullLogo.png" alt="..." />
      </div>
      <div class="academy-name">WMO IMAM GAZZALI ACADEMY</div>
      <div class="sub-name">Kooliyangal</div>
      <div class="exam-title">Entrance Examination – April 2026</div>
      <span class="exam-title">Hall Ticket</span>
    </div>

    <!-- CANDIDATE DETAILS -->
    <div class="candidate-section">
      <div class="candidate-details">
        <div class="detail-row">
          <span class="detail-label">Examination Centre</span>
          <span class="detail-colon">:</span>
          <span class="detail-value">${examinationCentre}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Register Number</span>
          <span class="detail-colon">:</span>
          <span class="detail-value">${registerNumber}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Name of Candidate</span>
          <span class="detail-colon">:</span>
          <span class="detail-value">${nameOfCandidate}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Date of Birth</span>
          <span class="detail-colon">:</span>
          <span class="detail-value">${dateOfBirth}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Father Name</span>
          <span class="detail-colon">:</span>
          <span class="detail-value">${fatherName}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Mother Name</span>
          <span class="detail-colon">:</span>
          <span class="detail-value">${motherName}</span>
        </div>
      </div>
      <div class="photo-box">
        ${photoContent}
      </div>
    </div>

    <!-- EXAM TABLE -->
    <div class="exam-section">
      <table class="exam-table">
        <thead>
          <tr>
            <th style="width:26%;">Date &amp; Time</th>
            <th>Type</th>
            <th class="sig-cell" style="text-align:center;">Invigilator Signature</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>12/04/2026<br /><span style="font-size:10px;color:#555;">10:00 AM</span></td>
            <td>Entrance Examination</td>
            <td class="sig-cell"></td>
          </tr>
          <tr>
            <td>15/04/2026<br /><span style="font-size:10px;color:#555;">10:00 AM</span></td>
            <td>Interview</td>
            <td class="sig-cell"></td>
          </tr>
        </tbody>
      </table>
    </div>

    

    <!-- INSTRUCTIONS -->
    <div class="instructions-section">
      <div class="instructions-title">Instructions</div>
      <ul class="instructions-list">
        <li>പരീക്ഷക്ക് നിശ്ചിത സമയത്തിന് 30 മിനിറ്റ് മുൻപ് പരീക്ഷ ഹാളിൽ പ്രാവേശിക്കേണ്ടതാണ്.</li>
        <li>അഡ്മിഷൻ ടിക്കറ്റ് ഇല്ലാത്തവരെ ഒരു കാരണവശാലും പരീക്ഷ ഹാളിൽ പ്രവേശിപ്പിക്കുന്നതല്ല.</li>
        <li>നിർദ്ദേശങ്ങൾ കൃത്യമായി വായിക്കേണ്ടതാണ്.</li>
        <li>മൊബൈൽ ഫോൺ, ഇലക്ട്രോണിക് ഉപകരണങ്ങൾ, കൈക്കുറിപ്പുകൾ എന്നിവ പരീക്ഷ ഹാളിൽ കൊണ്ടുവരുന്നത് കർശനമായി നിരോധിച്ചിരിക്കുന്നു.</li>
        <li>പരീക്ഷ ആരംഭിച്ച് 30 മിനിറ്റ് കഴിഞ്ഞു പ്രവേശിക്കാനും പരീക്ഷ അവസാനിക്കുന്നതിന് 30 മിനിറ്റ് മുൻപ് ഹാൾ വിട്ട് പോകാനും അനുവദിക്കുന്നതല്ല.</li>
        <li>പരീക്ഷ ഹാളിൽ കോപ്പി അടിക്കുന്നത് ശ്രദ്ധയിൽ പെട്ടാൽ മാന്വൽ പ്രകാരം അച്ചടക്ക നടപടി സ്വീകരിക്കുന്നതാണ് </li>
        <li>പരീക്ഷ ഹാളിൽ ശാന്തവും അച്ചടക്കവുമുള്ള പെരുമാറ്റം പുലർത്തേണ്ടത് ഓരോ ഉദ്യോഗാർഥിയുടെയും ഉത്തരവാദിത്തമാണ്.</li>
      </ul>
    </div>

    <!-- SIGNATURES -->
    <div class="signature-section">
      <div class="sig-block">
        <div class="sig-label">Signature of Candidate</div>
      </div>
      <div class="sig-block">
        <div class="sig-label">Signature of Admission Coordinator</div>
      </div>
    </div>

  </div>
</body>
</html>`;
}


export async function downloadHallTicketAsPDF(
    htmlString: string,
    candidateName: string
): Promise<void> {
    const safeName = candidateName
        .trim()
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "");
    const fileName = `${safeName}-hallticket.pdf`;

    // ── 1. Dynamically import libraries (client-only, no SSR bundle) ──────────
    const [{ default: jsPDF }, { default: html2canvas }] = await Promise.all([
        import("jspdf"),
        import("html2canvas"),
    ]);

    // ── 2. Create a fully isolated iframe ─────────────────────────────────────
    // "sandbox" with allow-same-origin lets us read the contentDocument but
    // completely blocks the host page's stylesheets from leaking in.
    const iframe = document.createElement("iframe");
    iframe.setAttribute("sandbox", "allow-same-origin");
    iframe.style.cssText =
        "position:fixed;top:-9999px;left:-9999px;width:794px;height:1123px;" +
        "border:none;visibility:hidden;";
    document.body.appendChild(iframe);

    await new Promise<void>((resolve) => {
        iframe.onload = () => resolve();
        // Write the self-contained HTML (all styles are inline in the template)
        const doc = iframe.contentDocument!;
        doc.open();
        doc.write(htmlString);
        doc.close();
        // If onload already fired (some browsers), resolve immediately
        if (iframe.contentDocument?.readyState === "complete") resolve();
    });

    // Give fonts / images a moment to paint
    await new Promise((r) => setTimeout(r, 300));

    const iframeDoc = iframe.contentDocument!;
    const target = iframeDoc.querySelector<HTMLElement>(".page") ?? iframeDoc.body;

    try {
        // ── 3. Render to canvas inside the isolated iframe ─────────────────────
        const canvas = await html2canvas(target, {
            scale: 2,
            useCORS: true,
            logging: false,
            backgroundColor: "#ffffff",
            // windowWidth / windowHeight scoped to the iframe — no host styles
            windowWidth: 794,
            windowHeight: 1123,
        });

        // ── 4. Build the PDF ────────────────────────────────────────────────────
        const imgData = canvas.toDataURL("image/jpeg", 0.98);
        const pdf = new jsPDF({ unit: "mm", format: "a4", orientation: "portrait" });
        const pdfW = pdf.internal.pageSize.getWidth();
        const pdfH = pdf.internal.pageSize.getHeight();
        pdf.addImage(imgData, "JPEG", 0, 0, pdfW, pdfH);
        pdf.save(fileName);
    } finally {
        document.body.removeChild(iframe);
    }
}
