import express, { Request, Response } from "express";
import { supabase } from "../supabaseClient";
import requireAuth from "../middleware/requireAuth";
import puppeteer from "puppeteer";
import fs from "fs";
import path from "path";

const router = express.Router();

function buildStyledReportHTML(title: string, contentHTML: string) {
  
  const logoFile = path.join(process.cwd(), "src/public/team_logo.jpg"); 
  if (!fs.existsSync(logoFile)) {
    console.error("Logo file not found at:", logoFile);
  }
  const logoBase64 = fs.readFileSync(logoFile, { encoding: "base64" });
  const logoURL = `data:image/jpeg;base64,${logoBase64}`;

  return `
  <html>
    <head>
      <style>
        body {
          font-family: 'Segoe UI', Arial, sans-serif;
          margin: 40px;
          color: #222;
          font-size: 13px;
        }
        header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 2px solid #000000;
          padding-bottom: 10px;
        }
        h1 {
          color: #000000;
          margin: 0;
        }
        img.logo {
          height: 50px;
        }
        section {
          margin-top: 20px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 15px;
        }
        th, td {
          border: 1px solid #ddd;
          padding: 8px;
          text-align: left;
        }
        th {
          background: #007bff; /* tables keep original color */
          color: white;
        }
        tr:nth-child(even) {
          background: #f9f9f9;
        }
        .summary {
          background: #e8f5e9;
          padding: 10px;
          border-left: 5px solid #2e7d32;
          margin-bottom: 10px;
        }
        .chart {
          text-align: center;
          margin-top: 20px;
        }
      </style>
    </head>
    <body>
      <header>
        <h1>${title}</h1>
        <img src="${logoURL}" class="logo" />
      </header>
      <p style="text-align:center; color:#555;">Generated on ${new Date().toLocaleString()}</p>
      ${contentHTML}
    </body>
  </html>`;
}

// Generate PDF
async function generatePDF(html: string, res: Response, filename: string) {
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: "networkidle0" });
  const pdf = await page.pdf({
    format: "A4",
    printBackground: true,
    margin: { top: "40px", bottom: "40px", left: "40px", right: "40px" },
  });
  await browser.close();

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
  res.end(pdf);
}

// Route
router.get("/:type", requireAuth, async (req: Request, res: Response) => {
  const { type } = req.params;
  const { month, year } = req.query as { month?: string; year?: string };

  if (!type || !month || !year)
    return res.status(400).json({ error: "Missing report type, month, or year" });

  const m = month.padStart(2, "0");
  const monthStart = `${year}-${m}-01`;
  const monthEnd = `${year}-${m}-31`;

  try {
    let htmlContent = "";
    let title = `${type.charAt(0).toUpperCase() + type.slice(1)} Report (${m}/${year})`;

    // Maintenance Report
    if (type === "maintenance") {
      const { data: allMaint, error } = await supabase
        .from("maintenance")
        .select("*")
        .gte("created_at", monthStart)
        .lte("created_at", monthEnd);
      if (error) throw error;

      const total = allMaint.length;
      const byCategory: Record<string, number> = {};
      const byStatus: Record<string, number> = {};
      let totalResolution = 0;
      let resolvedCount = 0;

      allMaint.forEach((r: any) => {
        byCategory[r.category] = (byCategory[r.category] || 0) + 1;
        byStatus[r.status] = (byStatus[r.status] || 0) + 1;
        if (r.status === "completed" && r.updated_at) {
          const created = new Date(r.created_at).getTime();
          const updated = new Date(r.updated_at).getTime();
          totalResolution += updated - created;
          resolvedCount++;
        }
      });

      const avgResolutionHours =
        resolvedCount > 0 ? (totalResolution / resolvedCount / 3600000).toFixed(2) : "N/A";
      const mostCommon = Object.entries(byCategory).sort((a, b) => b[1] - a[1])[0]?.[0] || "N/A";

      htmlContent = `
        <section>
          <div class="summary"><strong>Total Requests:</strong> ${total}</div>
          <div class="summary"><strong>Average Resolution Time:</strong> ${avgResolutionHours} hours</div>
          <div class="summary"><strong>Most Common Issue:</strong> ${mostCommon}</div>

          <h3>Requests by Category</h3>
          <table><tr><th>Category</th><th>Count</th></tr>
            ${Object.entries(byCategory)
              .map(([cat, count]) => `<tr><td>${cat}</td><td>${count}</td></tr>`)
              .join("") || "<tr><td colspan='2'>No data</td></tr>"}
          </table>

          <h3>Requests by Status</h3>
          <table><tr><th>Status</th><th>Count</th></tr>
            ${Object.entries(byStatus)
              .map(([st, count]) => `<tr><td>${st}</td><td>${count}</td></tr>`)
              .join("") || "<tr><td colspan='2'>No data</td></tr>"}
          </table>
        </section>`;
    }

    // Financial Report
    else if (type === "financial") {
      const { data: rentals, error } = await supabase
        .from("rentals")
        .select("*, property(price)")
        .gte("start_date", monthStart)
        .lte("start_date", monthEnd);
      if (error) throw error;

      const totalIncome = rentals.reduce((sum, r: any) => sum + (r.property?.price || 0), 0);
      const avgPrice = rentals.length > 0 ? (totalIncome / rentals.length).toFixed(2) : "N/A";

      // past 6 months trend
      const trendData: Record<string, number> = {};
      const now = new Date(parseInt(year), parseInt(month) - 1);
      for (let i = 5; i >= 0; i--) {
        const d = new Date(now);
        d.setMonth(now.getMonth() - i);
        const ym = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
        trendData[ym] = 0;
      }

      const { data: allRentals } = await supabase.from("rentals").select("start_date, property(price)");
      allRentals?.forEach((r: any) => {
        const d = new Date(r.start_date);
        const ym = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
        if (trendData[ym] !== undefined) trendData[ym] += r.property?.price || 0;
      });

      const chartLabels = Object.keys(trendData);
      const chartValues = Object.values(trendData);

      htmlContent = `
        <section>
          <div class="summary"><strong>Total Rental Income:</strong> R${totalIncome.toFixed(2)}</div>
          <div class="summary"><strong>Average Rental Price:</strong> R${avgPrice}</div>

          <div class="chart">
            <h3>Rental Income Trend (Past 6 Months)</h3>
            <img src="https://quickchart.io/chart?c=${encodeURIComponent(JSON.stringify({
              type: "line",
              data: {
                labels: chartLabels,
                datasets: [{
                  label: "Rental Income",
                  data: chartValues,
                  borderColor: "#28a745",
                  fill: false
                }]
              }
            }))}" width="500"/>
          </div>
        </section>`;
    }

    // Occupancy Report
    else if (type === "occupancy") {
      const { count: totalProps } = await supabase.from("property").select("id", { count: "exact", head: true });
      const { count: activeRentals } = await supabase
        .from("rentals")
        .select("id", { count: "exact", head: true })
        .eq("status", "active");
      const { count: totalApps } = await supabase.from("applications").select("id", { count: "exact", head: true });
      const { count: approvedApps } = await supabase
        .from("applications")
        .select("id", { count: "exact", head: true })
        .eq("status", "approved");

      const occupied = activeRentals || 0;
      const vacant = (totalProps || 0) - occupied;
      const appToRentRatio = totalApps && totalApps > 0 ? ((approvedApps! / totalApps) * 100).toFixed(1) : "N/A";

      const pieChartURL = `https://quickchart.io/chart?c=${encodeURIComponent(JSON.stringify({
        type: "pie",
        data: {
          labels: ["Occupied", "Vacant"],
          datasets: [{
            data: [occupied, vacant],
            backgroundColor: ["#28a745", "#007bff"]
          }]
        }
      }))}`;

      htmlContent = `
        <section>
          <div class="summary"><strong>Total Properties:</strong> ${totalProps}</div>
          <div class="summary"><strong>Occupied:</strong> ${occupied}</div>
          <div class="summary"><strong>Vacant:</strong> ${vacant}</div>
          <div class="summary"><strong>Applications → Rentals Ratio:</strong> ${appToRentRatio}%</div>

          <div class="chart">
            <h3>Occupancy Distribution</h3>
            <img src="${pieChartURL}" width="300"/>
          </div>
        </section>`;
    }

    // Perfromance Report
    else if (type === "performance") {
      const { count: totalProps } = await supabase.from("property").select("id", { count: "exact", head: true });
      const { count: activeRentals } = await supabase
        .from("rentals")
        .select("id", { count: "exact", head: true })
        .lte("start_date", monthEnd)
        .eq("status", "active");
      const { count: openMaint } = await supabase
        .from("maintenance")
        .select("id", { count: "exact", head: true })
        .eq("status", "pending");
      const { data: allMaint } = await supabase.from("maintenance").select("status");
      const completed = allMaint?.filter((r) => r.status === "completed").length || 0;
      const efficiency = allMaint && allMaint.length > 0 ? ((completed / allMaint.length) * 100).toFixed(1) : "N/A";

      const { data: approvedApps } = await supabase
        .from("applications")
        .select("submitted_at, approved_at")
        .not("approved_at", "is", null);
      const avgApprovalTime =
        approvedApps && approvedApps.length > 0
          ? (
              approvedApps.reduce((sum, r) => {
                const sub = new Date(r.submitted_at).getTime();
                const app = new Date(r.approved_at).getTime();
                return sum + (app - sub);
              }, 0) /
              approvedApps.length /
              86400000
            ).toFixed(1)
          : "N/A";

      const { data: rentalIncome } = await supabase
        .from("rentals")
        .select("property_id, property(price)");
      const incomeByProp: Record<string, number> = {};
      rentalIncome?.forEach((r: any) => {
        incomeByProp[r.property_id] = (incomeByProp[r.property_id] || 0) + (r.property?.price || 0);
      });

      const sorted = Object.entries(incomeByProp).sort((a, b) => b[1] - a[1]);
      const highest = sorted[0] ? `#${sorted[0][0]} (R${sorted[0][1]})` : "N/A";
      const lowest = sorted[sorted.length - 1] ? `#${sorted[sorted.length - 1][0]} (R${sorted[sorted.length - 1][1]})` : "N/A";

      htmlContent = `
        <section>
          <div class="summary"><strong>Total Properties:</strong> ${totalProps}</div>
          <div class="summary"><strong>Active Rentals:</strong> ${activeRentals}</div>
          <div class="summary"><strong>Open Maintenance Requests:</strong> ${openMaint}</div>
          <div class="summary"><strong>Caretaker Efficiency:</strong> ${efficiency}%</div>
          <div class="summary"><strong>Avg Application Approval Time:</strong> ${avgApprovalTime} days</div>
          <div class="summary"><strong>Highest Income Property:</strong> ${highest}</div>
          <div class="summary"><strong>Lowest Income Property:</strong> ${lowest}</div>
        </section>`;
    }

    // Build and send the PDF
    const fullHTML = buildStyledReportHTML(title, htmlContent);
    await generatePDF(fullHTML, res, `${type}-report-${year}-${m}.pdf`);
  } catch (err: any) {
    console.error("Error generating report:", err.message);
    if (!res.headersSent) res.status(500).json({ error: "Error generating report" });
  }
});

export default router;
