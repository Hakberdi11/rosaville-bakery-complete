import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { FileBarChart, Download, Calendar } from "lucide-react";
import PageHeader from "@/components/admin/PageHeader";
import { Button } from "@/components/ui/button";
import { jsPDF } from "jspdf";

export default function Reports() {
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(true);
  const [month, setMonth] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  });

  useEffect(() => {
    (async () => {
      try {
        const [o, c, i, f] = await Promise.all([
          base44.entities.Order.list("-created_date", 1000),
          base44.entities.Customer.list("-created_date", 500),
          base44.entities.InventoryItem.list("-created_date", 500),
          base44.entities.Feedback.list("-created_date", 500),
        ]);
        setOrders(o); setCustomers(c); setInventory(i); setFeedback(f);
      } catch (e) { console.error(e); }
      setLoading(false);
    })();
  }, []);

  const [year, mon] = month.split("-").map(Number);
  const inMonth = (dateStr) => {
    if (!dateStr) return false;
    const d = new Date(dateStr);
    return d.getFullYear() === year && d.getMonth() + 1 === mon;
  };
  const monthOrders = orders.filter((o) => inMonth(o.delivery_date) || inMonth(o.created_date));
  const monthRevenue = monthOrders.reduce((s, o) => s + (o.total_value || 0), 0);
  const completedOrders = monthOrders.filter((o) => ["Completed", "Delivered"].includes(o.status));
  const cancelledOrders = monthOrders.filter((o) => o.status === "Cancelled");
  const monthFeedback = feedback.filter((f) => inMonth(f.created_date));
  const avgRating = monthFeedback.length
    ? (monthFeedback.reduce((s, f) => s + (f.rating || 0), 0) / monthFeedback.length).toFixed(1)
    : "—";

  const dessertSales = {};
  monthOrders.forEach((o) => (o.items || []).forEach((it) => {
    const name = it.name || "Unknown";
    dessertSales[name] = (dessertSales[name] || 0) + (it.quantity || 1);
  }));
  const topDesserts = Object.entries(dessertSales).sort((a, b) => b[1] - a[1]).slice(0, 5);

  const lowStock = inventory.filter((i) => i.current_stock <= i.minimum_stock);
  const monthName = new Date(year, mon - 1, 1).toLocaleString("default", { month: "long" });

  const generatePDF = () => {
    const doc = new jsPDF({ unit: "pt", format: "a4" });
    const W = doc.internal.pageSize.getWidth();
    const M = 40;
    let y = 50;

    doc.setFillColor(244, 63, 94);
    doc.rect(0, 0, W, 8, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.setTextColor(30, 30, 30);
    doc.text("Rosaville Desserts", M, y);
    y += 18;
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(110, 110, 110);
    doc.text(`Monthly Operations Report — ${monthName} ${year}`, M, y);
    y += 14;
    doc.text(`Generated ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`, M, y);
    y += 26;

    const section = (title) => {
      if (y > 720) { doc.addPage(); y = 50; }
      doc.setFillColor(248, 240, 242);
      doc.rect(M, y - 14, W - M * 2, 22, "F");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.setTextColor(190, 30, 60);
      doc.text(title.toUpperCase(), M + 8, y);
      y += 26;
    };
    const row = (label, value) => {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10.5);
      doc.setTextColor(90, 90, 90);
      doc.text(label, M, y);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(30, 30, 30);
      doc.text(String(value), M + 200, y);
      y += 18;
    };

    section("Sales Summary");
    row("Total Orders", monthOrders.length);
    row("Completed Orders", completedOrders.length);
    row("Cancelled Orders", cancelledOrders.length);
    row("Total Revenue", `$${monthRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}`);
    row("Avg Order Value", monthOrders.length ? `$${(monthRevenue / monthOrders.length).toFixed(2)}` : "$0.00");
    y += 10;

    section("Top Selling Desserts");
    if (topDesserts.length === 0) {
      doc.setFont("helvetica", "normal"); doc.setFontSize(10); doc.setTextColor(120, 120, 120);
      doc.text("No sales recorded for this month.", M, y); y += 18;
    } else {
      doc.setFont("helvetica", "bold"); doc.setFontSize(10); doc.setTextColor(90, 90, 90);
      doc.text("Dessert", M, y); doc.text("Units Sold", M + 300, y); y += 16;
      topDesserts.forEach(([name, qty], idx) => {
        doc.setFont("helvetica", "normal"); doc.setFontSize(10.5); doc.setTextColor(40, 40, 40);
        doc.text(`${idx + 1}. ${name}`, M, y);
        doc.text(String(qty), M + 300, y);
        y += 16;
      });
    }
    y += 10;

    section("Customer Insights");
    row("Total Customers", customers.length);
    row("New This Month", customers.filter((c) => inMonth(c.created_date)).length);
    row("VIP Customers", customers.filter((c) => c.segment === "VIP").length);
    y += 10;

    section("Inventory Status");
    row("Total Items", inventory.length);
    row("Low Stock Alerts", lowStock.length);
    row("Inventory Value", `$${inventory.reduce((s, i) => s + (i.current_stock || 0) * (i.cost_per_unit || 0), 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}`);
    if (lowStock.length) {
      y += 4;
      doc.setFont("helvetica", "bold"); doc.setFontSize(10); doc.setTextColor(190, 30, 60);
      doc.text("Items needing restock:", M, y); y += 16;
      lowStock.forEach((it) => {
        doc.setFont("helvetica", "normal"); doc.setFontSize(10); doc.setTextColor(60, 60, 60);
        doc.text(`• ${it.name} — ${it.current_stock} ${it.unit} (min ${it.minimum_stock})`, M + 8, y);
        y += 15;
      });
    }
    y += 10;

    section("Customer Feedback");
    row("Reviews This Month", monthFeedback.length);
    row("Average Rating", `${avgRating} / 5`);
    if (monthFeedback.length) {
      y += 4;
      monthFeedback.slice(0, 4).forEach((f) => {
        if (y > 740) { doc.addPage(); y = 50; }
        doc.setFont("helvetica", "bold"); doc.setFontSize(10); doc.setTextColor(40, 40, 40);
        doc.text(`${f.customer_name} — ${"★".repeat(f.rating || 0)}${"☆".repeat(5 - (f.rating || 0))}`, M, y); y += 14;
        if (f.message) {
          doc.setFont("helvetica", "normal"); doc.setFontSize(9.5); doc.setTextColor(110, 110, 110);
          const lines = doc.splitTextToSize(`"${f.message}"`, W - M * 2 - 16);
          doc.text(lines, M + 8, y); y += lines.length * 12 + 6;
        }
      });
    }

    const pages = doc.internal.getNumberOfPages();
    for (let p = 1; p <= pages; p++) {
      doc.setPage(p);
      doc.setFont("helvetica", "normal"); doc.setFontSize(8); doc.setTextColor(150, 150, 150);
      doc.text("Rosaville Desserts OS · Confidential", M, doc.internal.pageSize.getHeight() - 20);
      doc.text(`Page ${p} of ${pages}`, W - M, doc.internal.pageSize.getHeight() - 20, { align: "right" });
    }

    doc.save(`Rosaville-Report-${month}.pdf`);
  };

  return (
    <div className="p-5 lg:p-8 max-w-[1100px] mx-auto">
      <PageHeader
        title="Reports"
        description="Generate a branded, downloadable PDF report for any month."
        icon={FileBarChart}
        actions={
          <Button size="sm" className="gap-2 bg-rose-600 hover:bg-rose-700" onClick={generatePDF} disabled={loading}>
            <Download className="w-4 h-4" /> Download PDF
          </Button>
        }
      />

      <div className="rounded-2xl border border-border/60 bg-card p-5 mb-5 flex items-center gap-3">
        <Calendar className="w-4 h-4 text-muted-foreground" />
        <label className="text-[12px] font-medium text-muted-foreground">Report Month</label>
        <input type="month" value={month} onChange={(e) => setMonth(e.target.value)} className="h-9 px-3 rounded-lg border border-input bg-card text-[14px] font-medium" />
      </div>

      <div className="rounded-2xl border border-border/60 bg-white text-slate-800 overflow-hidden shadow-sm">
        <div className="h-2 bg-rose-500" />
        <div className="p-8">
          <div className="flex items-center justify-between border-b border-slate-200 pb-4 mb-6">
            <div>
              <h2 className="text-[22px] font-bold text-slate-900">Rosaville Desserts</h2>
              <p className="text-[13px] text-slate-500">Monthly Operations Report — {monthName} {year}</p>
            </div>
            <div className="text-right text-[11px] text-slate-400">Generated {new Date().toLocaleDateString()}</div>
          </div>

          <ReportSection title="Sales Summary">
            <PreviewRow label="Total Orders" value={monthOrders.length} />
            <PreviewRow label="Completed Orders" value={completedOrders.length} />
            <PreviewRow label="Cancelled Orders" value={cancelledOrders.length} />
            <PreviewRow label="Total Revenue" value={`$${monthRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}`} />
            <PreviewRow label="Avg Order Value" value={monthOrders.length ? `$${(monthRevenue / monthOrders.length).toFixed(2)}` : "$0.00"} />
          </ReportSection>

          <ReportSection title="Top Selling Desserts">
            {topDesserts.length === 0 ? <p className="text-slate-400 text-[13px]">No sales recorded for this month.</p> : (
              <div className="space-y-1.5">
                {topDesserts.map(([name, qty], i) => (
                  <div key={name} className="flex justify-between text-[13px]"><span>{i + 1}. {name}</span><span className="font-semibold">{qty} units</span></div>
                ))}
              </div>
            )}
          </ReportSection>

          <ReportSection title="Customer Insights">
            <PreviewRow label="Total Customers" value={customers.length} />
            <PreviewRow label="New This Month" value={customers.filter((c) => inMonth(c.created_date)).length} />
            <PreviewRow label="VIP Customers" value={customers.filter((c) => c.segment === "VIP").length} />
          </ReportSection>

          <ReportSection title="Inventory Status">
            <PreviewRow label="Total Items" value={inventory.length} />
            <PreviewRow label="Low Stock Alerts" value={lowStock.length} />
            <PreviewRow label="Inventory Value" value={`$${inventory.reduce((s, i) => s + (i.current_stock || 0) * (i.cost_per_unit || 0), 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}`} />
          </ReportSection>

          <ReportSection title="Customer Feedback">
            <PreviewRow label="Reviews This Month" value={monthFeedback.length} />
            <PreviewRow label="Average Rating" value={`${avgRating} / 5`} />
          </ReportSection>
        </div>
      </div>
    </div>
  );
}

function ReportSection({ title, children }) {
  return (
    <div className="mb-6">
      <h3 className="text-[11px] font-bold uppercase tracking-wide text-rose-600 bg-rose-50 px-3 py-1.5 rounded mb-3">{title}</h3>
      <div className="pl-1">{children}</div>
    </div>
  );
}
function PreviewRow({ label, value }) {
  return <div className="flex justify-between text-[13px] py-1 border-b border-slate-100 last:border-0"><span className="text-slate-500">{label}</span><span className="font-semibold text-slate-800">{value}</span></div>;
}