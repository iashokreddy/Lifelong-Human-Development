#!/usr/bin/env node
// Generates one PDF per authored phase from the structured content, into dist/pdf/.
// The PDF is derived entirely from phase.json — the content is the single source of truth.
import PDFDocument from "pdfkit";
import { createWriteStream, mkdirSync } from "node:fs";
import { join } from "node:path";
import { loadPhases, repoRoot } from "./lib.mjs";

const outDir = join(repoRoot, "dist", "pdf");
mkdirSync(outDir, { recursive: true });

const DOMAIN_LABELS = {
  "physical-and-motor": "Physical & motor",
  "safety-and-awareness": "Safety & awareness",
  "health-hygiene-self-care": "Health, hygiene & self-care",
  "play-exploration-creativity": "Play, exploration & creativity",
  "communication-and-language": "Communication & language",
  "emotional-and-resilience": "Emotional & resilience",
  "respect-empathy-relationships": "Respect, empathy & relationships",
  "practical-life-skills": "Practical life skills",
  "scientific-thinking": "Scientific thinking",
  "technology-and-digital": "Technology & digital",
  "critical-thinking-problem-solving": "Critical thinking & problem-solving",
  "ethics-responsibility-citizenship": "Ethics, responsibility & citizenship",
  "financial-and-professional": "Financial & professional",
  "innovation-entrepreneurship-leadership": "Innovation, entrepreneurship & leadership",
  "contribution-to-society": "Contribution to society",
};

function renderPhase(phase, path) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: "A4", margin: 56, info: { Title: phase.title } });
    const stream = createWriteStream(path);
    doc.pipe(stream);
    stream.on("finish", resolve);
    stream.on("error", reject);

    const H1 = (t) => doc.moveDown(0.6).fontSize(20).fillColor("#1a2b4a").text(t).fillColor("black");
    const H2 = (t) => doc.moveDown(0.5).fontSize(14).fillColor("#2b5178").text(t).fillColor("black").moveDown(0.2);
    const P = (t) => doc.fontSize(10.5).fillColor("#222").text(t, { align: "left" }).fillColor("black");
    const bullet = (items) => doc.fontSize(10.5).fillColor("#222").list(items, { bulletRadius: 1.6, textIndent: 10 }).fillColor("black");

    // Cover
    doc.fontSize(12).fillColor("#6b7280").text("Lifelong Human Development Platform");
    doc.moveDown(0.3).fontSize(26).fillColor("#1a2b4a").text(phase.title);
    doc.moveDown(0.2).fontSize(13).fillColor("#2b5178").text(`Age range: ${phase.ageRange.label}${phase.ageRange.indicative === false ? "" : " (indicative)"}`);
    doc.moveDown(0.4).fontSize(11).fillColor("#374151").text(`Primary objective: ${phase.primaryObjective}`);
    doc.moveDown(0.6).fontSize(10.5).fillColor("#222").text(phase.summary);
    if (phase.guidingPrinciple) {
      doc.moveDown(0.5).fontSize(10).fillColor("#6b7280").text(`Guiding principle: ${phase.guidingPrinciple}`, { oblique: true });
    }
    doc.fillColor("black");

    H1("1. Development domains");
    for (const d of phase.developmentDomains) {
      H2(DOMAIN_LABELS[d.domain] || d.domain);
      P(d.focus);
    }

    H1("2. Year-wise plans");
    for (const y of phase.yearPlans) {
      H2(y.label);
      P("Objectives:");
      bullet(y.objectives);
      doc.moveDown(0.2);
      P("Capabilities that emerge:");
      bullet(y.capabilities);
    }

    if (phase.activities && (phase.activities.daily?.length || phase.activities.weekly?.length)) {
      H1("3. Practical activities");
      if (phase.activities.daily?.length) {
        H2("Daily");
        bullet(phase.activities.daily.map((a) => `${a.title} — ${a.description}`));
      }
      if (phase.activities.weekly?.length) {
        H2("Weekly");
        bullet(phase.activities.weekly.map((a) => `${a.title} — ${a.description}`));
      }
    }

    if (phase.parentGuidance?.length) {
      H1("4. Parent & caregiver guidance");
      for (const g of phase.parentGuidance) {
        H2(g.topic);
        P(g.guidance);
      }
    }

    H1("5. Developmental milestones (awareness)");
    bullet(phase.milestones.map((m) => `${m.area}: ${m.description}${m.typicalBy ? ` (${m.typicalBy})` : ""}`));

    H1("6. Safety & wellbeing");
    for (const s of phase.safety) {
      H2(s.topic);
      P(s.guidance);
    }

    H1("7. Learning outcomes");
    bullet(phase.outcomes);

    H1("8. Projects & idea development");
    for (const p of phase.projects) {
      H2(p.title);
      P(p.description);
      if (p.skillsPractised?.length) P(`Skills practised: ${p.skillsPractised.join(", ")}`);
    }

    H1("9. Application features & user journeys");
    for (const f of phase.appFeatures) {
      H2(`${f.feature}${f.audience ? ` (${f.audience})` : ""}`);
      P(f.userJourney);
    }

    H1("10. Research foundations");
    bullet(phase.sources.map((s) => `${s.title}${s.org ? ` — ${s.org}` : ""}: ${s.url}`));

    doc.moveDown(1).fontSize(8.5).fillColor("#9ca3af").text(
      "This platform supports — and never replaces — parents, teachers, doctors and human relationships.",
      { align: "center" }
    );

    doc.end();
  });
}

const phases = loadPhases().filter((p) => p.phase);
if (phases.length === 0) {
  console.log("No authored phases found. Author a phase.json first, then re-run.");
  process.exit(0);
}

for (const { phase } of phases) {
  const out = join(outDir, `${phase.id}-${phase.slug}.pdf`);
  await renderPhase(phase, out);
  console.log(`✓ wrote ${out}`);
}
console.log(`\nGenerated ${phases.length} PDF(s) into ${outDir}`);
