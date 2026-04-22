import { useState } from "react";

const C = {
  bg: "#FFFFFF",
  surface: "#F4F6F9",
  surfaceEl: "#EBF0F7",
  border: "#D4DCE8",
  navy: "#002B5C",
  navyLight: "#003F88",
  blue: "#0066CC",
  text: "#1A1F36",
  muted: "#6B7A99",
  red: "#C8293A",
  green: "#1A7A4A",
  gold: "#B8962E",
  white: "#FFFFFF",
};

const REAL_WORLD = {
  usReciprocity: 5,
  fatcaPenalty: 30,
  crsCompliance: 92,
  capitalMobility: 78,
  delawareAnonymity: 85,
};

function calcPayoffs(p) {
  const r = p.usReciprocity / 100;
  const pen = p.fatcaPenalty / 100;
  const c = p.crsCompliance / 100;
  const m = p.capitalMobility / 100;
  const d = p.delawareAnonymity / 100;
  return {
    crs: {
      RR: Math.round(50 + r * 40 - m * 15),
      RN: Math.round(20 - m * 35 + pen * 5),
      DR: Math.round(-30 - pen * 60 + r * 5),
      DN: Math.round(-10 - pen * 20 + d * 5),
    },
    us: {
      RR: Math.round(40 + c * 20 - 20),
      NR: Math.round(70 + m * 25 + d * 10),
      RD: Math.round(15 + c * 5),
      ND: Math.round(45 + d * 15),
    },
  };
}

function getNash(pf) {
  const { crs, us } = pf;
  const crsBR_R = crs.RR >= crs.DR ? "R" : "D";
  const crsBR_N = crs.RN >= crs.DN ? "R" : "D";
  const usBR_R = us.RR >= us.NR ? "R" : "N";
  const usBR_D = us.RD >= us.ND ? "R" : "N";
  const eq = [];
  if (crsBR_R === "R" && usBR_R === "R") eq.push({ crsS: "Share Data", usS: "Share Back", type: "cooperative" });
  if (crsBR_N === "R" && usBR_R === "N") eq.push({ crsS: "Share Data", usS: "Keep Silent", type: "paradox" });
  if (crsBR_R === "D" && usBR_D === "R") eq.push({ crsS: "Stay Silent", usS: "Share Back", type: "defection" });
  if (crsBR_N === "D" && usBR_D === "N") eq.push({ crsS: "Stay Silent", usS: "Keep Silent", type: "chaos" });
  return eq;
}

function Slider({ label, value, min, max, onChange, desc, hi }) {
  return (
    <div style={{ marginBottom: "1.3rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.4rem" }}>
        <span style={{ fontSize: "0.75rem", color: hi ? C.navy : C.text, fontWeight: 700, lineHeight: 1.3, maxWidth: "75%" }}>{label}</span>
        <span style={{ fontSize: "1rem", color: hi ? C.navy : C.blue, fontWeight: 800, minWidth: 44, textAlign: "right" }}>{value}%</span>
      </div>
      <input type="range" min={min} max={max} value={value} onChange={e => onChange(+e.target.value)}
        style={{ width: "100%", accentColor: hi ? C.navy : C.blue, cursor: "pointer", display: "block", margin: "0.3rem 0" }} />
      <p style={{ fontSize: "0.68rem", color: C.muted, lineHeight: 1.55 }}>{desc}</p>
    </div>
  );
}

function FlowBar({ label, sublabel, value, color }) {
  return (
    <div style={{ marginBottom: "1.1rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.2rem" }}>
        <div>
          <div style={{ fontSize: "0.75rem", fontWeight: 700, color: C.text }}>{label}</div>
          {sublabel && <div style={{ fontSize: "0.65rem", color: C.muted }}>{sublabel}</div>}
        </div>
        <span style={{ fontSize: "1.1rem", fontWeight: 800, color }}>{value}%</span>
      </div>
      <div style={{ height: 8, background: C.border, borderRadius: 4, overflow: "hidden", marginTop: "0.4rem" }}>
        <div style={{ height: "100%", width: `${value}%`, background: color, borderRadius: 4, transition: "width 0.5s ease" }} />
      </div>
    </div>
  );
}

function Cell({ crsV, usV, nash, paradox }) {
  const bg = nash ? (paradox ? "#FEF2F2" : "#F0FDF4") : C.surface;
  const bd = nash ? (paradox ? C.red : C.green) : C.border;
  const bw = nash ? 2 : 1;
  return (
    <div style={{ padding: "1rem 0.75rem", background: bg, border: `${bw}px solid ${bd}`, borderRadius: 6, textAlign: "center", position: "relative", transition: "all 0.3s" }}>
      {nash && (
        <div style={{ position: "absolute", top: -10, left: "50%", transform: "translateX(-50%)", background: paradox ? C.red : C.green, color: "#fff", fontSize: "0.5rem", fontWeight: 800, textTransform: "uppercase", padding: "2px 8px", borderRadius: 10, whiteSpace: "nowrap" }}>
          {paradox ? "★ Real World" : "✓ Ideal"}
        </div>
      )}
      <div style={{ fontSize: "0.6rem", color: C.muted, marginBottom: "0.3rem", marginTop: nash ? "0.2rem" : 0 }}>Rest of World / US</div>
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "0.4rem" }}>
        <span style={{ fontSize: "1.1rem", fontWeight: 800, color: crsV >= 50 ? C.green : crsV >= 10 ? C.gold : C.red }}>{crsV}</span>
        <span style={{ color: C.muted }}>/</span>
        <span style={{ fontSize: "1.1rem", fontWeight: 800, color: usV >= 60 ? C.green : usV >= 40 ? C.gold : C.red }}>{usV}</span>
      </div>
    </div>
  );
}

function InfoBox({ icon, title, children, color, onClick, clickable }) {
  return (
    <div onClick={onClick} style={{ background: `${color}08`, border: `1px solid ${color}30`, borderLeft: `4px solid ${color}`, borderRadius: 6, padding: "1rem 1.1rem", marginBottom: "1rem", cursor: clickable ? "pointer" : "default" }}>
      <div style={{ fontSize: "0.72rem", fontWeight: 800, color, marginBottom: "0.4rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>{icon} {title}</div>
      <div style={{ fontSize: "0.76rem", color: C.text, lineHeight: 1.75 }}>{children}</div>
    </div>
  );
}

export default function FATCAGame() {
  const [p, setP] = useState(REAL_WORLD);
  const [tab, setTab] = useState("intro");
  const upd = k => v => setP(prev => ({ ...prev, [k]: v }));
  const pf = calcPayoffs(p);
  const eq = getNash(pf);
  const gap = p.crsCompliance - p.usReciprocity;
  const capitalFlight = Math.round((p.capitalMobility + p.delawareAnonymity + (100 - p.usReciprocity)) / 3);
  const card = { background: C.white, border: `1px solid ${C.border}`, borderRadius: 10, padding: "1.4rem", boxShadow: "0 1px 4px rgba(0,43,92,0.06)" };

  const TABS = [
    { id: "intro", label: "Start Here" },
    { id: "sim", label: "Simulator" },
    { id: "matrix", label: "Payoff Matrix" },
    { id: "delaware", label: "Delaware Case" },
    { id: "method", label: "About the Model" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: C.bg, color: C.text, fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif", fontSize: "14px" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=Inter:wght@400;500;600;700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        input[type=range] { -webkit-appearance: none; appearance: none; height: 4px; border-radius: 2px; background: #D4DCE8; outline: none; cursor: pointer; width: 100%; display: block; }
        input[type=range]::-webkit-slider-thumb { -webkit-appearance: none; width: 16px; height: 16px; border-radius: 50%; background: #002B5C; cursor: pointer; border: 2px solid #fff; box-shadow: 0 1px 4px rgba(0,43,92,0.3); }
        .tbtn { background: none; border: none; cursor: pointer; transition: all 0.2s; font-family: 'Inter', sans-serif; }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        .fade { animation: fadeUp 0.3s ease forwards; }
        .step-card { transition: all 0.2s; cursor: default; }
        .step-card:hover { box-shadow: 0 4px 16px rgba(0,43,92,0.1); transform: translateY(-1px); }
        .clickable-box:hover { filter: brightness(0.97); }
      `}</style>

      {/* HEADER */}
      <div style={{ background: C.navy, padding: "2rem 2.5rem" }}>
        <div style={{ maxWidth: 1060, margin: "0 auto" }}>
          <div style={{ fontSize: "0.6rem", color: "rgba(255,255,255,0.5)", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: "0.5rem", fontWeight: 600 }}>
            Interactive Game Theory Analysis
          </div>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(1.6rem, 3.5vw, 2.4rem)", fontWeight: 900, color: "#FFFFFF", lineHeight: 1.15, marginBottom: "0.6rem" }}>
            The FATCA Game: Why the US Makes the Rules and Breaks Them Too
          </h1>
          <p style={{ fontSize: "0.82rem", color: "rgba(255,255,255,0.75)", maxWidth: 620, lineHeight: 1.85 }}>
            FATCA and CRS are two of the most important financial agreements in the world, yet almost nobody outside of banking knows they exist. This interactive tool explains both of them in simple terms and connects them to game theory, a way of understanding why people and countries make the decisions they make. The goal is straightforward: by the time you leave this page, you should be able to explain what FATCA is, why the system is unfair, and what a Nash Equilibrium means, even if you have never heard any of those words before.
          </p>
          <div style={{ display: "flex", gap: "2rem", marginTop: "1.6rem", flexWrap: "wrap" }}>
            {[
              { label: "Countries sharing data with the US", val: "100+", color: "#60A5FA" },
              { label: "US sharing data back", val: "~5%", color: "#F87171" },
              { label: "US shell companies without owner ID", val: "85%+", color: "#FCD34D" },
            ].map((s, i) => (
              <div key={i} style={{ borderLeft: `3px solid ${s.color}`, paddingLeft: "0.75rem" }}>
                <div style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.4rem", fontWeight: 700, color: s.color }}>{s.val}</div>
                <div style={{ fontSize: "0.6rem", color: "rgba(255,255,255,0.5)", marginTop: "0.1rem", lineHeight: 1.4 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* TABS */}
      <div style={{ borderBottom: `2px solid ${C.border}`, background: C.white, padding: "0 2.5rem", position: "sticky", top: 0, zIndex: 10, boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
        <div style={{ maxWidth: 1060, margin: "0 auto", display: "flex", gap: "0.2rem" }}>
          {TABS.map(t => (
            <button key={t.id} className="tbtn" onClick={() => setTab(t.id)} style={{
              padding: "0.85rem 1.1rem", fontSize: "0.72rem", fontWeight: tab === t.id ? 700 : 500,
              color: tab === t.id ? C.navy : C.muted,
              borderBottom: tab === t.id ? `3px solid ${C.navy}` : "3px solid transparent",
              marginBottom: -2,
            }}>{t.label}</button>
          ))}
        </div>
      </div>

      {/* CONTENT */}
      <div style={{ maxWidth: 1060, margin: "0 auto", padding: "2rem 2.5rem" }}>

        {/* START HERE */}
        {tab === "intro" && (
          <div className="fade">
            <div style={{ maxWidth: 740 }}>
              <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.5rem", fontWeight: 700, color: C.navy, marginBottom: "0.5rem" }}>
                What is this about?
              </h2>
              <p style={{ fontSize: "0.82rem", color: C.muted, marginBottom: "2rem", lineHeight: 1.75 }}>
                You do not need to know anything about taxes or finance to understand this. Start here and we will walk you through everything step by step.
              </p>

              <InfoBox icon="💡" title="The simple version" color={C.navy}>
                Imagine two neighbors agree to both leave their curtains open so they can keep an eye on each other's houses. One neighbor follows through completely. The other one keeps their curtains shut and it turns out their house is full of things the first neighbor cannot see. That is basically what happened with FATCA and the United States.
              </InfoBox>

              <InfoBox icon="🌍" title="What is FATCA?" color={C.blue}>
                <strong>FATCA</strong> stands for Foreign Account Tax Compliance Act. It is a US law passed in 2010. It tells every bank in the world: "If you want access to the US financial system, you must tell us about any American clients you have." Over 100 countries agreed. Banks that do not follow this rule get hit with a 30% tax on all their income coming from the US. That is a huge amount of money, so basically everyone had to sign.
              </InfoBox>

              <InfoBox icon="🤝" title="What is CRS?" color={C.blue}>
                <strong>CRS</strong> stands for Common Reporting Standard. It is the rest of the world's version of FATCA, created in 2014. Over 100 countries agreed to share bank account information with each other automatically every year. The idea was simple: no more hiding money in other countries. If you have a secret account in Switzerland, your home country finds out about it automatically.
              </InfoBox>

              <InfoBox icon="⚠️" title="So what is the problem?" color={C.red}>
                FATCA was supposed to be a two-way street. The US gets information from foreign banks, and in return, the US shares information back. But in real life, the US sends back almost <strong>nothing</strong>. The rest of the world shares everything, and the US is not even a member of CRS.
                <br /><br />
                In fact, two US states, Delaware and Nevada, allow anyone in the world to create a company for just a few hundred dollars without ever listing who the real owner is. Think of it like buying a locker at a train station. You put your stuff inside, lock it, and nobody knows it belongs to you. People do this for many reasons. Some want to pay less in taxes. Some want to keep their wealth private. And some, honestly, want to hide money they were not supposed to have in the first place.
                <br /><br />
                These companies do not even need a Tax Identification Number, known as a TIN. A TIN is basically a code that governments use to track who owns what and make sure taxes are being paid. No TIN means no trace. A Panamanian investor, for example, can use one of these companies to hold millions of dollars inside the US and their home government will never find out. Meanwhile, that same investor's bank account back in Panama gets automatically reported to the government every year. Later in this page, we will walk through a real step by step example of exactly how this works in Delaware.
                <br /><br />
                <span onClick={() => setTab("delaware")} style={{ color: C.blue, fontWeight: 700, cursor: "pointer", textDecoration: "underline", fontSize: "0.74rem" }}>
                  Go to the Delaware Case to see the full breakdown.
                </span>
              </InfoBox>

              <InfoBox icon="🎮" title="Where does game theory come in?" color={C.gold}>
                <strong>Game theory</strong> is the study of how people or countries make decisions when the result depends on what others do too. Think of it like chess: your next move depends on what your opponent might do. A key idea in game theory is the <strong>Nash Equilibrium</strong>, named after mathematician John Nash. It describes a situation where nobody wants to change what they are doing, because changing would only make things worse for them.
                <br /><br />
                Here is an easy example. Two drivers arrive at a 4-way stop at the same time. Once they both agree to take turns, neither one benefits from breaking that agreement. That stable, logical outcome is a Nash Equilibrium.
                <br /><br />
                In the FATCA situation, the stable outcome is this: the rest of the world keeps sharing all their data, and the US keeps sharing almost none. Neither side has a strong reason to change. The simulator in this tool lets you explore what would need to happen to break that pattern.
              </InfoBox>

              <button onClick={() => setTab("sim")} style={{
                marginTop: "0.5rem", padding: "0.85rem 2rem", background: C.navy, color: "#fff",
                border: "none", borderRadius: 6, cursor: "pointer", fontSize: "0.8rem",
                fontFamily: "'Inter', sans-serif", fontWeight: 700, letterSpacing: "0.03em",
              }}>
                Go to the Simulator
              </button>
            </div>
          </div>
        )}

        {/* SIMULATOR */}
        {tab === "sim" && (
          <div className="fade">
            <div style={{ maxWidth: 740, marginBottom: "1.5rem" }}>
              <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.4rem", fontWeight: 700, color: C.navy, marginBottom: "0.4rem" }}>
                Play with the rules
              </h2>
              <p style={{ fontSize: "0.78rem", color: C.muted, lineHeight: 1.75 }}>
                The sliders below represent the key factors in this situation. Move them and watch how the information flow and the stable outcome change in real time. The starting values reflect what is actually happening in the world today.
              </p>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "300px 1fr", gap: "1.5rem" }}>
              <div style={card}>
                <div style={{ fontSize: "0.65rem", fontWeight: 800, color: C.navy, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "1.2rem" }}>Adjust the Parameters</div>
                <Slider label="US Reciprocity Rate" value={p.usReciprocity} min={0} max={100} onChange={upd("usReciprocity")} hi
                  desc="How much data is the US actually sharing back with other countries? Real world today: about 5%. Try moving this to 100% to see what a fair system would look like." />
                <Slider label="FATCA Penalty" value={p.fatcaPenalty} min={0} max={50} onChange={upd("fatcaPenalty")}
                  desc="The penalty banks face if they do not report American clients. Try setting this to 0% and see if countries would still bother reporting." />
                <Slider label="CRS Compliance Rate" value={p.crsCompliance} min={0} max={100} onChange={upd("crsCompliance")}
                  desc="What percentage of countries are actually following through and sharing data under CRS?" />
                <Slider label="Capital Mobility" value={p.capitalMobility} min={0} max={100} onChange={upd("capitalMobility")}
                  desc="How easy is it for money to move into US structures like Delaware or Nevada companies?" />
                <Slider label="Delaware Anonymity" value={p.delawareAnonymity} min={0} max={100} onChange={upd("delawareAnonymity")} hi
                  desc="What percentage of US shell companies do not disclose who actually owns them? This is the key gap in the system." />
                <button onClick={() => setP(REAL_WORLD)} style={{
                  width: "100%", padding: "0.6rem", background: C.surface, color: C.navy,
                  border: `1px solid ${C.border}`, borderRadius: 6, cursor: "pointer",
                  fontSize: "0.68rem", fontFamily: "'Inter', sans-serif", fontWeight: 700, marginTop: "0.5rem",
                }}>Reset to Today's Real-World Values</button>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "1.2rem" }}>
                <div style={card}>
                  <div style={{ fontSize: "0.65rem", fontWeight: 800, color: C.navy, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "1.1rem" }}>Information Flow</div>
                  <FlowBar label="Rest of World sharing with the US" sublabel="Countries sending bank data to the IRS" value={p.crsCompliance} color={C.blue} />
                  <FlowBar label="US sharing back with the world" sublabel="Data the US actually sends in return" value={p.usReciprocity} color={C.red} />
                  <div style={{ marginTop: "0.9rem", padding: "0.75rem 1rem", background: "#FEF2F2", border: `1px solid #FECACA`, borderRadius: 6 }}>
                    <span style={{ fontSize: "0.7rem", color: C.muted }}>The gap between what goes in and what comes out: </span>
                    <span style={{ fontSize: "1rem", fontWeight: 800, color: gap > 50 ? C.red : C.gold }}>{gap} percentage points</span>
                    <p style={{ fontSize: "0.65rem", color: C.muted, marginTop: "0.3rem", lineHeight: 1.5 }}>
                      {gap > 60 ? "This is a very one-sided arrangement. The US knows a great deal about accounts held abroad. Other countries know almost nothing about what is hidden inside the US." : gap > 20 ? "There is still a big imbalance. The US is receiving far more information than it is giving." : "The system is close to being balanced. This would represent a fair two-way agreement."}
                    </p>
                  </div>
                </div>

                <div style={card}>
                  <div style={{ fontSize: "0.65rem", fontWeight: 800, color: C.navy, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "1rem" }}>What is the Stable Outcome?</div>
                  <p style={{ fontSize: "0.72rem", color: C.muted, lineHeight: 1.7, marginBottom: "1rem" }}>
                    Remember the Nash Equilibrium from the Start Here section? It is the point the system naturally settles into, where nobody wants to change what they are doing. Here is what it looks like right now based on your slider settings.
                  </p>
                  {eq.length === 0 ? (
                    <p style={{ fontSize: "0.72rem", color: C.muted }}>No stable outcome found with these settings. The system would be unstable.</p>
                  ) : eq.map((e, i) => {
                    const tc = { paradox: C.red, cooperative: C.green, defection: C.gold, chaos: C.muted }[e.type];
                    const desc = {
                      paradox: "This is what is happening right now. Other countries have no real choice but to share data with the US, otherwise they lose access to US markets and face a huge tax penalty. The US has no similar pressure to share back, so it does not. Both sides are stuck: one forced to share, one with no reason to.",
                      cooperative: "Both sides are sharing information fairly. This would be the best possible outcome for global transparency. But the current rules do not push things in this direction.",
                      defection: "Countries stop sharing data. This would happen if the FATCA penalty disappeared. The US would then face real pressure to finally share information back.",
                      chaos: "Nobody shares anything. This is what the world looked like before FATCA, when everyone could hide money everywhere with no consequences.",
                    }[e.type];
                    const label = {
                      paradox: "★ The Real-World Outcome Right Now",
                      cooperative: "✓ The Ideal Outcome: Full Fair Sharing",
                      defection: "The System Breaks Down",
                      chaos: "Everyone Hides Everything: The Pre-FATCA World",
                    }[e.type];
                    return (
                      <div key={i} style={{ padding: "1rem", background: `${tc}08`, border: `1px solid ${tc}30`, borderLeft: `4px solid ${tc}`, borderRadius: 6, marginBottom: "0.7rem" }}>
                        <div style={{ fontSize: "0.65rem", fontWeight: 800, color: tc, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.4rem" }}>{label}</div>
                        <div style={{ fontSize: "0.76rem", color: C.text, marginBottom: "0.4rem" }}>
                          Other Countries: <strong>{e.crsS}</strong> and the United States: <strong>{e.usS}</strong>
                        </div>
                        <p style={{ fontSize: "0.7rem", color: C.muted, lineHeight: 1.65 }}>{desc}</p>
                      </div>
                    );
                  })}
                </div>

                <div style={card}>
                  <div style={{ fontSize: "0.65rem", fontWeight: 800, color: C.navy, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "0.9rem" }}>Why Would Money Move to the US?</div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0.8rem" }}>
                    {[
                      { label: "Delaware Advantage", sublabel: "How easy it is to hide ownership in a US company", val: `${p.delawareAnonymity}%`, c: p.delawareAnonymity > 70 ? C.red : C.green },
                      { label: "Information Gap", sublabel: "How much more the US knows vs. what it shares", val: `${gap}pp`, c: gap > 50 ? C.red : C.green },
                      { label: "Incentive to Move Money Here", sublabel: "Overall pressure score", val: `${capitalFlight}/100`, c: capitalFlight > 65 ? C.red : C.gold },
                    ].map((m, i) => (
                      <div key={i} style={{ textAlign: "center", padding: "0.9rem 0.5rem", background: C.surface, borderRadius: 8, border: `1px solid ${C.border}` }}>
                        <div style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.3rem", fontWeight: 700, color: m.c }}>{m.val}</div>
                        <div style={{ fontSize: "0.62rem", fontWeight: 700, color: C.text, marginTop: "0.25rem" }}>{m.label}</div>
                        <div style={{ fontSize: "0.58rem", color: C.muted, marginTop: "0.15rem", lineHeight: 1.4 }}>{m.sublabel}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* PAYOFF MATRIX */}
        {tab === "matrix" && (
          <div className="fade" style={{ maxWidth: 740 }}>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.4rem", fontWeight: 700, color: C.navy, marginBottom: "0.4rem" }}>The Payoff Matrix</h2>
            <p style={{ fontSize: "0.78rem", color: C.muted, lineHeight: 1.8, marginBottom: "1.5rem" }}>
              In game theory, a payoff matrix is like a scoreboard that shows every possible combination of choices and what each player gets as a result. Higher numbers mean a better outcome. Each box shows two numbers: the <span style={{ color: C.blue, fontWeight: 600 }}>Rest of World score</span> on the left and the <span style={{ color: C.navy, fontWeight: 600 }}>US score</span> on the right.
            </p>

            <InfoBox icon="📖" title="How to read this" color={C.navy}>
              There are 4 possible situations depending on what each side decides to do. Each box shows what both players get out of that situation, scored from -100 (very bad) to +100 (ideal). The highlighted boxes are the stable outcomes, where nobody wants to switch. The <span style={{ color: C.red, fontWeight: 700 }}>red box</span> is where the world actually sits right now.
            </InfoBox>

            <div style={{ display: "grid", gridTemplateColumns: "160px 1fr 1fr", gap: "0.8rem", marginTop: "1.5rem", maxWidth: 560 }}>
              <div />
              <div style={{ textAlign: "center", padding: "0.65rem 0.4rem", fontSize: "0.68rem", fontWeight: 700, color: C.green, background: "#F0FDF4", border: `1px solid #BBF7D0`, borderRadius: 6 }}>🤝 US Shares Back</div>
              <div style={{ textAlign: "center", padding: "0.65rem 0.4rem", fontSize: "0.68rem", fontWeight: 700, color: C.red, background: "#FEF2F2", border: `1px solid #FECACA`, borderRadius: 6 }}>🔒 US Stays Silent</div>

              <div style={{ display: "flex", alignItems: "center", fontSize: "0.68rem", fontWeight: 700, color: C.blue }}>🌍 World Shares Data</div>
              <Cell crsV={pf.crs.RR} usV={pf.us.RR} nash={eq.some(e => e.crsS === "Share Data" && e.usS === "Share Back")} paradox={false} />
              <Cell crsV={pf.crs.RN} usV={pf.us.NR} nash={eq.some(e => e.crsS === "Share Data" && e.usS === "Keep Silent")} paradox={eq.some(e => e.type === "paradox")} />

              <div style={{ display: "flex", alignItems: "center", fontSize: "0.68rem", fontWeight: 700, color: C.muted }}>🙈 World Stays Silent</div>
              <Cell crsV={pf.crs.DR} usV={pf.us.RD} nash={eq.some(e => e.crsS === "Stay Silent" && e.usS === "Share Back")} paradox={false} />
              <Cell crsV={pf.crs.DN} usV={pf.us.ND} nash={eq.some(e => e.crsS === "Stay Silent" && e.usS === "Keep Silent")} paradox={false} />
            </div>

            <div style={{ ...card, marginTop: "1.5rem" }}>
              <div style={{ fontSize: "0.65rem", fontWeight: 800, color: C.navy, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "0.75rem" }}>Why Does the US Always Choose to Stay Silent?</div>
              <p style={{ fontSize: "0.76rem", color: C.muted, lineHeight: 1.8 }}>
                Look at the US scores in each column. Whether the rest of the world shares data or not, the US always gets a higher score by <strong style={{ color: C.text }}>not sharing back</strong>. In game theory, this is called a <strong style={{ color: C.text }}>dominant strategy</strong>. It simply means: one option is better no matter what the other person does. Think of it like always ordering the same dish at a restaurant because it genuinely tastes better than everything else on the menu, every single time.
              </p>
              <p style={{ fontSize: "0.76rem", color: C.muted, lineHeight: 1.8, marginTop: "0.75rem" }}>
                The rest of the world does not have that option. If they stop sharing data, the US applies a 30% tax on all their income connected to the US. For a major bank, that can mean billions of dollars in losses. So they keep sharing, even though they get almost nothing back. Head to the Simulator tab and use the sliders to see what it would take to change this.
              </p>
            </div>
          </div>
        )}

        {/* DELAWARE */}
        {tab === "delaware" && (
          <div className="fade" style={{ maxWidth: 720 }}>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.4rem", fontWeight: 700, color: C.navy, marginBottom: "0.4rem" }}>The Delaware Case</h2>
            <p style={{ fontSize: "0.78rem", color: C.muted, lineHeight: 1.8, marginBottom: "1.5rem" }}>
              This is where the theory meets real life. Delaware is a small US state with almost no requirements for disclosing who actually owns a company. It has become one of the most popular places in the world for creating shell companies. And because of a gap in FATCA's rules, those companies are basically invisible to the rest of the world.
            </p>

            <InfoBox icon="🤔" title="What is a shell company?" color={C.navy}>
              A shell company is a legal business with no real operations. No employees, no office, no product. It exists only on paper, usually to hold money or assets. They are legal and many have perfectly normal uses, like organizing a family's real estate. But they are also commonly used to hide money, because the real owner is often not listed anywhere publicly.
            </InfoBox>

            <div style={{ marginTop: "1.3rem" }}>
              <div style={{ fontSize: "0.65rem", fontWeight: 800, color: C.navy, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "1rem" }}>A Real-World Scenario, Step by Step</div>
              {[
                {
                  n: "01", color: C.gold, tag: "The Setup",
                  title: "A Panamanian investor creates a Delaware company",
                  body: "It costs about $500 and takes less than a week. The state of Delaware does not ask who the real owner is. There is no requirement to put the owner's name anywhere public. The company might be called something generic like Atlantic Holdings LLC. On top of that, the company does not need a Tax Identification Number, known as a TIN. A TIN is basically a code that governments use to track who owns what and make sure people are paying their taxes. Without one, the company is nearly impossible to connect to a real person in any official system. No trail leads back to the investor.",
                },
                {
                  n: "02", color: C.blue, tag: "The Gap",
                  title: "The company opens a US bank account and deposits money",
                  body: "Now the investor's money is sitting inside the US under the company's name. Under FATCA's rules, this counts as a US domestic account because it is held by a US company. So FATCA does not flag it as a foreign account. No report gets sent to Panama's tax authority. The investor's home country has no idea this money exists.",
                },
                {
                  n: "03", color: C.muted, tag: "The Unfairness",
                  title: "Meanwhile, Panama reports everything on their end",
                  body: "Under CRS, if that same investor has a regular brokerage account at a Panamanian bank, even a small one, that bank automatically sends the full account details to the OECD, which passes them to the investor's home country. Full transparency. But only flowing in one direction.",
                },
                {
                  n: "04", color: C.red, tag: "The Conclusion",
                  title: "This situation is stable and unlikely to change on its own",
                  body: "The US benefits from this setup. Money flows in, tax income stays domestic, and there is no international organization with the power to force the US to adopt CRS-style rules. As long as the FATCA penalty keeps other countries reporting, and as long as the US faces no similar pressure in return, this stays exactly as it is. The game theory predicts it. The real-world data confirms it.",
                },
              ].map((s, i) => (
                <div key={i} className="step-card" style={{ display: "flex", gap: "1.1rem", marginBottom: "0.9rem", padding: "1.1rem 1.2rem", background: C.white, border: `1px solid ${C.border}`, borderLeft: `4px solid ${s.color}`, borderRadius: 8 }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "0.35rem" }}>
                      <span style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.1rem", fontWeight: 900, color: s.color, opacity: 0.4 }}>{s.n}</span>
                      <span style={{ fontSize: "0.56rem", fontWeight: 800, color: s.color, textTransform: "uppercase", letterSpacing: "0.07em", background: `${s.color}15`, padding: "2px 8px", borderRadius: 10 }}>{s.tag}</span>
                    </div>
                    <div style={{ fontSize: "0.78rem", fontWeight: 700, color: C.text, marginBottom: "0.35rem" }}>{s.title}</div>
                    <div style={{ fontSize: "0.72rem", color: C.muted, lineHeight: 1.75 }}>{s.body}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ABOUT THE MODEL */}
        {tab === "method" && (
          <div className="fade" style={{ maxWidth: 680, display: "flex", flexDirection: "column", gap: "1rem" }}>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.4rem", fontWeight: 700, color: C.navy, marginBottom: "0.2rem" }}>About the Model</h2>
            <p style={{ fontSize: "0.78rem", color: C.muted, lineHeight: 1.8, marginBottom: "0.5rem" }}>
              For those who want to understand the mechanics behind the simulator.
            </p>
            {[
              {
                title: "The Game Theory Setup",
                body: "This is a two-player simultaneous game. Player 1 is the rest of the world, which decides whether to share financial data or not. Player 2 is the United States, which decides whether to share information back or not. Neither player knows what the other will do when they make their decision. The payoffs, meaning the scores each player gets, are calculated using five adjustable factors that reflect real dynamics in the international tax system.",
              },
              {
                title: "Why Not Sharing Back Is the Best Move for the US",
                body: "When you look at the US scores in the payoff matrix, you see the same pattern every time: staying silent always gives the US a higher score, no matter what the rest of the world does. This is what makes it a dominant strategy, the single best option regardless of what anyone else chooses. Without an international agreement that comes with real penalties for the US, this outcome is mathematically stable and will not change on its own.",
              },
              {
                title: "Where the Numbers Come From",
                body: "The starting values for the sliders come from the OECD CRS Peer Review Reports from 2023, IRS FATCA compliance data, and the Financial Secrecy Index published by the Tax Justice Network in 2022. The roughly 5% US reciprocity figure is based on documented partial information-sharing agreements in practice. The scores in the payoff matrix are simplified for educational purposes and are not meant to be exact financial measurements.",
              },
              {
                title: "A Personal Note",
                body: "This project is grounded in real professional experience. During a compliance internship at MMG Bank in Panama City in 2025, FATCA and CRS reporting cycles were conducted firsthand, including classifying accounts, checking tax ID numbers, and submitting reports to Panama's tax authority. One of the most surprising things observed during that time was that many client structures involving Delaware and Nevada companies came in with no TIN at all. Under the existing rules, that was completely legal. The account existed, money moved through it, and yet there was no identification number tying it to a real owner anywhere in the system. That was the moment that made me want to understand why this was allowed, and how deep the rabbit hole actually went.",
              },
            ].map((s, i) => (
              <div key={i} style={card}>
                <div style={{ fontSize: "0.68rem", fontWeight: 800, color: C.navy, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "0.7rem" }}>{s.title}</div>
                <p style={{ fontSize: "0.76rem", color: C.muted, lineHeight: 1.8 }}>{s.body}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* FOOTER */}
      <div style={{ borderTop: `1px solid ${C.border}`, padding: "1.2rem 2.5rem", marginTop: "1.5rem", background: C.surface }}>
        <div style={{ maxWidth: 1060, margin: "0 auto", display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "0.5rem", alignItems: "center" }}>
          <div>
            <div style={{ fontSize: "0.7rem", fontWeight: 700, color: C.navy }}>Winston Spadafora</div>
            <div style={{ fontSize: "0.6rem", color: C.muted }}>Finance and International Business · Penn State Smeal College of Business</div>
          </div>
          <div style={{ fontSize: "0.6rem", color: C.muted, textAlign: "right" }}>
            Built with the assistance of AI · Game Theory · Regulatory Finance · FATCA / CRS Analysis
          </div>
        </div>
      </div>
    </div>
  );
}
