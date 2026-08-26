import { jsPDF } from "jspdf";

import homeHero from "@/assets/cms-template/home_hero.png";
import homeWhyChoose from "@/assets/cms-template/home_why_choose.png";
import homeTestimonials from "@/assets/cms-template/home_testimonials.png";
import aboutTop from "@/assets/cms-template/about_top.png";
import aboutValues from "@/assets/cms-template/about_values.png";
import contactPage from "@/assets/cms-template/contact_page.png";
import footer from "@/assets/cms-template/footer.png";

const IMG_W = 1280;
const IMG_H = 900;

// Each page: a real screenshot of the live public site, plus numbered labels
// pointing at the region each label names — matching a CMS.jsx field name
// 1:1, so an owner can look up "③ Homepage Highlights — Card 1" on the page
// and find the exact same label in the dashboard.
const PAGES = [
  {
    title: "Homepage — Banner",
    image: homeHero,
    labels: [
      { x: 167, y: 32, text: "Brand — Site Name" },
      { x: 260, y: 425, text: "Homepage Banner — Headline" },
      { x: 300, y: 571, text: "Homepage Banner — Subheadline" },
      { x: 975, y: 515, text: "Homepage Banner — Photo" },
    ],
  },
  {
    title: "Homepage — Highlights",
    image: homeWhyChoose,
    labels: [
      { x: 640, y: 415, text: "Homepage Highlights — Heading" },
      { x: 640, y: 470, text: "Homepage Highlights — Subheading" },
      { x: 420, y: 625, text: "Homepage Highlights — Card 1" },
      { x: 855, y: 625, text: "Homepage Highlights — Card 2" },
      { x: 420, y: 805, text: "Homepage Highlights — Card 3" },
      { x: 855, y: 805, text: "Homepage Highlights — Card 4" },
    ],
  },
  {
    title: "Homepage — Testimonials",
    image: homeTestimonials,
    labels: [
      { x: 343, y: 745, text: "Testimonials — Featured Review" },
    ],
    note: "The Testimonials section itself is shown/hidden with the \"Show testimonials\" switch, and each review is chosen with the star toggle on the Website Feedback widget — both in the dashboard's Testimonials area.",
  },
  {
    title: "About — Story",
    image: aboutTop,
    labels: [
      { x: 640, y: 335, text: "Our Story — Title" },
      { x: 640, y: 403, text: "Our Story — Subtitle" },
      { x: 640, y: 595, text: "Our Story — Story text" },
      { x: 640, y: 815, text: "Our Values — Heading" },
    ],
  },
  {
    title: "About — Values",
    image: aboutValues,
    labels: [
      { x: 440, y: 190, text: "Our Values — Card 1" },
      { x: 840, y: 190, text: "Our Values — Card 2" },
      { x: 440, y: 363, text: "Our Values — Card 3" },
      { x: 840, y: 363, text: "Our Values — Card 4" },
      { x: 440, y: 553, text: "Our Values — Card 5" },
      { x: 840, y: 553, text: "Our Values — Card 6" },
    ],
  },
  {
    title: "Contact Page",
    image: contactPage,
    labels: [
      { x: 222, y: 470, text: "Contact Details — Address" },
      { x: 640, y: 470, text: "Contact Details — Phone" },
      { x: 1055, y: 470, text: "Contact Details — Email" },
      { x: 640, y: 725, text: "Contact Details — Business Hours" },
    ],
  },
  {
    title: "Footer",
    image: footer,
    labels: [
      { x: 117, y: 586, text: "Brand — Site Name (Footer)" },
      { x: 773, y: 650, text: "Contact Details — Business Hours" },
      { x: 640, y: 840, text: "Brand — Site Name (Copyright)" },
    ],
  },
];

function drawLabel(doc, num, x, y, text) {
  doc.setFillColor(225, 29, 72); // rose-600
  doc.circle(x, y, 12, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text(String(num), x, y + 4, { align: "center" });

  const tx = Math.min(x + 18, IMG_W - 10);
  const tw = doc.getTextWidth(text) + 10;
  const boxX = tx + tw + 10 > IMG_W ? x - 18 - tw : tx;
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(225, 29, 72);
  doc.roundedRect(boxX, y - 10, tw, 20, 4, 4, "FD");
  doc.setTextColor(60, 30, 20);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.text(text, boxX + 5, y + 4);
}

export function generateCmsTemplatePdf() {
  // unit "pt" with our screenshot pixel dimensions used directly as point
  // values (i.e. each page is a plain 1280x900 custom page size) — jsPDF's
  // "px" unit applies an internal DPI scale factor that isn't applied
  // consistently between the constructor and addPage(), which silently
  // produced mismatched page sizes; "pt" has no such scaling, so image and
  // label coordinates map 1:1 with the screenshots' actual pixels.
  const doc = new jsPDF({ unit: "pt", orientation: "landscape", format: [IMG_W, IMG_H] });

  // Cover page
  doc.setFillColor(251, 247, 244);
  doc.rect(0, 0, IMG_W, IMG_H, "F");
  doc.setTextColor(60, 30, 20);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(36);
  doc.text("Website Content Reference Guide", IMG_W / 2, 140, { align: "center" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(16);
  doc.text(
    "Each numbered label below points at part of your live website, matching the field name in the",
    IMG_W / 2, 190, { align: "center" }
  );
  doc.text("dashboard's Website Content page one-to-one.", IMG_W / 2, 214, { align: "center" });

  let y = 280;
  doc.setFontSize(15);
  PAGES.forEach((p, i) => {
    doc.setFont("helvetica", "bold");
    doc.text(`Page ${i + 2}`, 140, y);
    doc.setFont("helvetica", "normal");
    doc.text(p.title, 230, y);
    y += 32;
  });

  y += 20;
  doc.setFont("helvetica", "italic");
  doc.setFontSize(13);
  doc.setTextColor(120, 100, 90);
  const coverNote = [
    "Colors, fonts, and the newsletter form aren't tied to one spot on the page — they apply site-wide.",
    "Adjust them from the Brand Colors and Typography sections of Website Content; the Newsletter",
    "page under Growth lists everyone who has subscribed.",
  ];
  coverNote.forEach((line) => { doc.text(line, IMG_W / 2, y, { align: "center" }); y += 22; });

  PAGES.forEach((p) => {
    doc.addPage([IMG_W, IMG_H], "landscape");
    doc.addImage(p.image, "PNG", 0, 0, IMG_W, IMG_H);
    p.labels.forEach((label, i) => drawLabel(doc, i + 1, label.x, label.y, label.text));
    if (p.note) {
      doc.setFillColor(255, 255, 255);
      doc.roundedRect(20, IMG_H - 60, IMG_W - 40, 44, 6, 6, "F");
      doc.setDrawColor(225, 29, 72);
      doc.roundedRect(20, IMG_H - 60, IMG_W - 40, 44, 6, 6, "S");
      doc.setTextColor(60, 30, 20);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(11);
      const lines = doc.splitTextToSize(p.note, IMG_W - 70);
      doc.text(lines, 35, IMG_H - 44);
    }
  });

  doc.save("rosaville-cms-template.pdf");
}
