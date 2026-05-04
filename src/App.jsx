import { useState, useCallback, useEffect } from "react";

const DISPOSITIONS = ["Retain", "Upgrade", "Replace", "Retire"];
const TIME_ASSESS = ["Tolerate", "Invest", "Migrate", "Eliminate"];
const EFFORT = ["Low", "Medium", "High"];
const STATUS = ["Not Started", "In Progress", "On Hold", "Complete"];
const HEALTH = ["Healthy", "Attention", "Critical"];

const MONTHS_SHORT = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const buildMonthOptions = () => {
  const opts = [];
  for (let y = 2026; y <= 2029; y++)
    for (let m = 0; m < 12; m++) opts.push(`${MONTHS_SHORT[m]} ${y}`);
  return opts;
};
const MONTH_OPTIONS = buildMonthOptions();

const parseMonth = (s) => {
  if (!s) return null;
  const parts = s.split(" ");
  if (parts.length !== 2) return null;
  const mi = MONTHS_SHORT.indexOf(parts[0]);
  const yr = parseInt(parts[1]);
  if (mi < 0 || isNaN(yr)) return null;
  return yr * 12 + mi;
};

const emptyAction = () => ({
  id: Date.now() + Math.random(),
  component: "",
  startMonth: "Jul 2026",
  endMonth: "Jul 2026",
  effort: "Medium",
  status: "Not Started",
  notes: "",
});

const emptyRisk = () => ({
  id: Date.now() + Math.random(),
  description: "",
  eolDate: "",
  severity: "Attention",
});

const emptyRoadmap = () => ({
  serviceName: "",
  serviceOwner: "",
  serviceExists: true,
  purpose: "",
  consumers: "",
  currentStack: "",
  currentHealth: "Healthy",
  constraints: "",
  targetState: "",
  targetDrivers: "",
  disposition: "Retain",
  timeAssessment: "Tolerate",
  risks: [emptyRisk()],
  actions: [emptyAction()],
  lastUpdated: new Date().toISOString().split("T")[0],
});

const COLORS = {
  bg: "#0f1117",
  surface: "#1a1d27",
  surfaceAlt: "#22262f",
  border: "#2e3340",
  borderFocus: "#4a7cff",
  text: "#e0e2e8",
  textMuted: "#8a8f9d",
  accent: "#4a7cff",
  green: "#34d399",
  amber: "#fbbf24",
  red: "#f87171",
  greenBg: "rgba(52,211,153,0.12)",
  amberBg: "rgba(251,191,36,0.12)",
  redBg: "rgba(248,113,113,0.12)",
  accentBg: "rgba(74,124,255,0.12)",
  purpleBg: "rgba(167,139,250,0.12)",
};

const healthColor = (h) => h === "Healthy" ? COLORS.green : h === "Attention" ? COLORS.amber : COLORS.red;
const healthBg = (h) => h === "Healthy" ? COLORS.greenBg : h === "Attention" ? COLORS.amberBg : COLORS.redBg;
const statusColor = (s) => s === "Complete" ? COLORS.green : s === "In Progress" ? COLORS.accent : s === "On Hold" ? COLORS.amber : COLORS.textMuted;
const dispColor = (d) => d === "Retain" ? COLORS.green : d === "Upgrade" ? COLORS.accent : d === "Replace" ? COLORS.amber : COLORS.red;
const dispBgFn = (d) => d === "Retain" ? COLORS.greenBg : d === "Upgrade" ? COLORS.accentBg : d === "Replace" ? COLORS.amberBg : COLORS.redBg;

const fontStack = "'DM Sans', 'Segoe UI', system-ui, sans-serif";
const monoStack = "'DM Mono', 'Consolas', monospace";

const styles = {
  app: { fontFamily: fontStack, color: COLORS.text, background: COLORS.bg, minHeight: "100vh", padding: 0 },
  header: { padding: "24px 32px", borderBottom: `1px solid ${COLORS.border}`, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" },
  title: { fontSize: "18px", fontWeight: 700, letterSpacing: "-0.3px", margin: 0, color: COLORS.text },
  subtitle: { fontSize: "12px", color: COLORS.textMuted, fontFamily: monoStack, marginTop: "2px" },
  main: { padding: "24px 32px", maxWidth: "1100px" },
  section: { marginBottom: "32px" },
  sectionTitle: { fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1.5px", color: COLORS.textMuted, marginBottom: "14px", paddingBottom: "8px", borderBottom: `1px solid ${COLORS.border}` },
  grid2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" },
  grid3: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "14px" },
  fieldGroup: { display: "flex", flexDirection: "column", gap: "4px" },
  label: { fontSize: "11px", fontWeight: 600, color: COLORS.textMuted, textTransform: "uppercase", letterSpacing: "0.5px" },
  input: { background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: "6px", padding: "8px 10px", color: COLORS.text, fontSize: "13px", fontFamily: fontStack, outline: "none", transition: "border-color 0.15s" },
  textarea: { background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: "6px", padding: "8px 10px", color: COLORS.text, fontSize: "13px", fontFamily: fontStack, outline: "none", resize: "vertical", minHeight: "140px", transition: "border-color 0.15s" },
  select: { background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: "6px", padding: "8px 10px", color: COLORS.text, fontSize: "13px", fontFamily: fontStack, outline: "none", cursor: "pointer", appearance: "none", backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' fill='%238a8f9d' viewBox='0 0 16 16'%3E%3Cpath d='M8 11L3 6h10z'/%3E%3C/svg%3E")`, backgroundRepeat: "no-repeat", backgroundPosition: "right 10px center", paddingRight: "28px" },
  badge: (color, bg) => ({ display: "inline-block", fontSize: "11px", fontWeight: 600, fontFamily: monoStack, padding: "2px 8px", borderRadius: "4px", color, background: bg }),
  btn: { background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: "6px", padding: "7px 14px", color: COLORS.text, fontSize: "12px", fontWeight: 600, fontFamily: fontStack, cursor: "pointer", transition: "all 0.15s" },
  btnPrimary: { background: COLORS.accent, border: `1px solid ${COLORS.accent}`, borderRadius: "6px", padding: "7px 14px", color: "#fff", fontSize: "12px", fontWeight: 600, fontFamily: fontStack, cursor: "pointer" },
  btnDanger: { background: "transparent", border: "none", color: COLORS.red, fontSize: "12px", cursor: "pointer", padding: "4px 8px", fontFamily: fontStack, fontWeight: 600, opacity: 0.7 },
  table: { width: "100%", borderCollapse: "collapse", fontSize: "13px" },
  th: { textAlign: "left", padding: "8px 10px", fontSize: "11px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px", color: COLORS.textMuted, borderBottom: `1px solid ${COLORS.border}`, whiteSpace: "nowrap" },
  td: { padding: "6px 10px", borderBottom: `1px solid ${COLORS.border}`, verticalAlign: "top" },
  card: { background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: "8px", padding: "16px" },
  tabs: { display: "flex", gap: 0, marginBottom: "24px", borderBottom: `1px solid ${COLORS.border}` },
  tab: (active) => ({ padding: "10px 20px", fontSize: "13px", fontWeight: 600, fontFamily: fontStack, color: active ? COLORS.accent : COLORS.textMuted, background: "transparent", border: "none", borderBottom: active ? `2px solid ${COLORS.accent}` : "2px solid transparent", cursor: "pointer", transition: "all 0.15s", marginBottom: "-1px" }),
};

const Field = ({ label, children, span }) => (
  <div style={{ ...styles.fieldGroup, gridColumn: span ? `span ${span}` : undefined }}>
    <label style={styles.label}>{label}</label>
    {children}
  </div>
);
const Input = ({ value, onChange, placeholder, ...rest }) => (
  <input style={styles.input} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
    onFocus={(e) => (e.target.style.borderColor = COLORS.borderFocus)} onBlur={(e) => (e.target.style.borderColor = COLORS.border)} {...rest} />
);
const TextArea = ({ value, onChange, placeholder, style: overrideStyle }) => (
  <textarea style={{ ...styles.textarea, ...overrideStyle }} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
    onFocus={(e) => (e.target.style.borderColor = COLORS.borderFocus)} onBlur={(e) => (e.target.style.borderColor = COLORS.border)} />
);
const Select = ({ value, onChange, options }) => (
  <select style={styles.select} value={value} onChange={(e) => onChange(e.target.value)}>
    {options.map((o) => <option key={o} value={o}>{o}</option>)}
  </select>
);

// ── Edit View ──
function EditView({ data, setData }) {
  const update = (field, val) => setData((d) => ({ ...d, [field]: val }));
  const updateRisk = (idx, field, val) => setData((d) => { const r = [...d.risks]; r[idx] = { ...r[idx], [field]: val }; return { ...d, risks: r }; });
  const updateAction = (idx, field, val) => setData((d) => {
    const a = [...d.actions];
    a[idx] = { ...a[idx], [field]: val };
    if (field === "startMonth") {
      a.sort((x, y) => {
        const xv = parseMonth(x.startMonth); const yv = parseMonth(y.startMonth);
        if (xv === null || yv === null) return 0;
        return xv - yv;
      });
    }
    return { ...d, actions: a };
  });
  const addRisk = () => setData((d) => ({ ...d, risks: [...d.risks, emptyRisk()] }));
  const removeRisk = (idx) => setData((d) => ({ ...d, risks: d.risks.filter((_, i) => i !== idx) }));
  const addAction = () => setData((d) => {
    const newAction = emptyAction();
    const actions = [...d.actions, newAction].sort((a, b) => {
      const av = parseMonth(a.startMonth); const bv = parseMonth(b.startMonth);
      if (av === null || bv === null) return 0;
      return av - bv;
    });
    return { ...d, actions };
  });
  const insertAction = (idx) => setData((d) => {
    const ref = d.actions[idx];
    const newAction = emptyAction();
    if (ref) { newAction.startMonth = ref.startMonth; newAction.endMonth = ref.endMonth; }
    const actions = [...d.actions];
    actions.splice(idx + 1, 0, newAction);
    return { ...d, actions };
  });
  const removeAction = (idx) => setData((d) => ({ ...d, actions: d.actions.filter((_, i) => i !== idx) }));
  const sortActions = () => setData((d) => ({
    ...d,
    actions: [...d.actions].sort((a, b) => {
      const av = parseMonth(a.startMonth); const bv = parseMonth(b.startMonth);
      if (av === null || bv === null) return 0;
      return av - bv;
    }),
  }));

  return (
    <div>
      <div style={styles.section}>
        <div style={styles.sectionTitle}>1 {"\u2014"} Service Identity</div>
        <div style={{ marginBottom: "14px" }}>
          <Field label="Does this service currently exist?">
            <div style={{ display: "flex", gap: "8px" }}>
              {[{ label: "Yes", val: true }, { label: "No \u2014 New Capability", val: false }].map(({ label, val }) => (
                <button key={label} onClick={() => update("serviceExists", val)} style={{
                  ...styles.btn,
                  background: (data.serviceExists !== false) === val ? COLORS.accentBg : "transparent",
                  borderColor: (data.serviceExists !== false) === val ? COLORS.accent : COLORS.border,
                  color: (data.serviceExists !== false) === val ? COLORS.accent : COLORS.textMuted,
                }}>{label}</button>
              ))}
            </div>
          </Field>
        </div>
        <div style={styles.grid2}>
          <Field label="Service Name"><Input value={data.serviceName} onChange={(v) => update("serviceName", v)} placeholder="e.g. Managed Endpoint Protection" /></Field>
          <Field label="Service Owner"><Input value={data.serviceOwner} onChange={(v) => update("serviceOwner", v)} placeholder="e.g. Jane Smith, Security Lead" /></Field>
        </div>
        <div style={{ marginTop: "14px" }}>
          <Field label="Purpose"><TextArea value={data.purpose} onChange={(v) => update("purpose", v)} style={{ minHeight: "110px" }} placeholder={data.serviceExists === false ? "What should this service do? e.g. East-west traffic segmentation within the data centre to limit lateral movement and meet APRA CPS 234 requirements." : "What does this service do today? e.g. Provides centralised endpoint detection and response across all managed customer environments."} /></Field>
        </div>
        <div style={{ marginTop: "14px" }}>
          <Field label="Consumers">
            <div style={{ display: "flex", gap: "8px", alignItems: "flex-start", flexWrap: "wrap" }}>
              {["Experteq", "Customers", "Other"].map((opt) => {
                const isOther = opt === "Other";
                const active = isOther
                  ? (data.consumersOther || "").length > 0 || data._otherActive
                  : (data.consumers || "").split(", ").filter(Boolean).includes(opt);
                return (
                  <button key={opt} onClick={() => {
                    if (isOther) {
                      if (active && !data.consumersOther) { update("_otherActive", !data._otherActive); }
                      else if (!active) { update("_otherActive", true); }
                      else { update("consumersOther", ""); update("_otherActive", false); }
                    } else {
                      const parts = (data.consumers || "").split(", ").filter(Boolean);
                      if (active) { update("consumers", parts.filter((p) => p !== opt).join(", ")); }
                      else { update("consumers", [...parts, opt].join(", ")); }
                    }
                  }} style={{
                    ...styles.btn,
                    background: active ? COLORS.accentBg : "transparent",
                    borderColor: active ? COLORS.accent : COLORS.border,
                    color: active ? COLORS.accent : COLORS.textMuted,
                  }}>{opt}</button>
                );
              })}
              {(data._otherActive || (data.consumersOther || "").length > 0) && (
                <Input
                  value={data.consumersOther || ""}
                  onChange={(v) => update("consumersOther", v)}
                  placeholder="e.g. SOC team, Application owners"
                  style={{ ...styles.input, flex: 1, minWidth: "200px" }}
                />
              )}
            </div>
          </Field>
        </div>
      </div>

      <div style={styles.section}>
        <div style={styles.sectionTitle}>2 {"\u2014"} {data.serviceExists === false ? "Proposed Technology" : "Current State"}</div>
        {data.serviceExists !== false && (
          <div style={{ ...styles.grid3, marginBottom: "14px" }}>
            <Field label="Service Health" span={1}><Select value={data.currentHealth} onChange={(v) => update("currentHealth", v)} options={HEALTH} /></Field>
          </div>
        )}
        <Field label={data.serviceExists === false ? "Proposed Technology Stack" : "Technology Stack"}><TextArea value={data.currentStack} onChange={(v) => update("currentStack", v)} placeholder={data.serviceExists === false ? "What technologies are being evaluated or proposed? e.g. Illumio Core for workload segmentation, Azure NSG flow logs for visibility, integration with Sentinel for policy monitoring." : "Key technologies underpinning this service today, including versions."} /></Field>
        <div style={{ marginTop: "14px" }}>
          <Field label="Constraints / Dependencies"><TextArea value={data.constraints} onChange={(v) => update("constraints", v)} placeholder={data.serviceExists === false ? "What could block or delay adoption? e.g. Budget approval, skill gaps, prerequisite projects, vendor selection process." : "What limits change? e.g. Contractual lock-in, dependency on legacy systems, budget constraints."} /></Field>
        </div>
      </div>

      <div style={styles.section}>
        <div style={styles.sectionTitle}>3 {"\u2014"} Lifecycle & Risk</div>
        <div style={{ overflowX: "auto" }}>
        <table style={{ ...styles.table, minWidth: "700px" }}>
          <thead><tr>
            <th style={{ ...styles.th, width: "55%" }}>Risk / Lifecycle Item</th>
            <th style={{ ...styles.th, width: "18%" }}>EOL / Key Date</th>
            <th style={{ ...styles.th, width: "15%" }}>Severity</th>
            <th style={{ ...styles.th, width: "12%" }}></th>
          </tr></thead>
          <tbody>
            {data.risks.map((r, i) => (
              <tr key={r.id}>
                <td style={styles.td}><Input value={r.description} onChange={(v) => updateRisk(i, "description", v)} placeholder="e.g. Windows Server 2016 EOS" style={{ ...styles.input, width: "100%", minWidth: "300px" }} /></td>
                <td style={styles.td}><Input value={r.eolDate} onChange={(v) => updateRisk(i, "eolDate", v)} placeholder="e.g. Jan 2027" style={{ ...styles.input, width: "100%" }} /></td>
                <td style={styles.td}><Select value={r.severity} onChange={(v) => updateRisk(i, "severity", v)} options={HEALTH} /></td>
                <td style={{ ...styles.td, textAlign: "right" }}>{data.risks.length > 1 && <button style={styles.btnDanger} onClick={() => removeRisk(i)}>Remove</button>}</td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
        <button style={{ ...styles.btn, marginTop: "10px" }} onClick={addRisk}>+ Add Risk</button>
      </div>

      <div style={styles.section}>
        <div style={styles.sectionTitle}>4 {"\u2014"} Target State</div>
        <Field label="Future State Description"><TextArea value={data.targetState} onChange={(v) => update("targetState", v)} placeholder="What does the target architecture look like? For new services, describe the desired end-state design. For existing services, describe what changes." /></Field>
        <div style={{ marginTop: "14px" }}>
          <Field label="Drivers"><TextArea value={data.targetDrivers} onChange={(v) => update("targetDrivers", v)} placeholder="Why are we doing this? e.g. Cost consolidation, vendor rationalisation, APRA CPS 234 compliance, capability gap, customer demand, risk reduction." /></Field>
        </div>
      </div>

      <div style={styles.section}>
        <div style={styles.sectionTitle}>5 {"\u2014"} Strategic Posture</div>
        <div style={{ fontSize: "12px", color: COLORS.textMuted, marginBottom: "14px", lineHeight: "1.5" }}>
          The service-level strategic posture. <strong style={{ color: COLORS.text }}>Disposition</strong> describes what happens to the service (Retain / Upgrade / Replace / Retire). <strong style={{ color: COLORS.text }}>TIME</strong> describes the current strategic approach (Tolerate / Invest / Migrate / Eliminate).
        </div>
        <div style={styles.grid2}>
          <Field label="Disposition"><Select value={data.disposition} onChange={(v) => update("disposition", v)} options={DISPOSITIONS} /></Field>
          <Field label="TIME Assessment"><Select value={data.timeAssessment} onChange={(v) => update("timeAssessment", v)} options={TIME_ASSESS} /></Field>
        </div>
      </div>

      <div style={styles.section}>
        <div style={styles.sectionTitle}>6 {"\u2014"} Roadmap Actions</div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ ...styles.table, minWidth: "850px" }}>
            <thead><tr>
              <th style={{ ...styles.th, width: "4%" }}>#</th>
              <th style={{ ...styles.th, width: "26%" }}>Action</th>
              <th style={styles.th}>Start</th>
              <th style={styles.th}>End</th>
              <th style={styles.th}>Effort</th>
              <th style={styles.th}>Status</th>
              <th style={{ ...styles.th, width: "16%" }}>Notes</th>
              <th style={{ ...styles.th, width: "12%", textAlign: "right" }}></th>
            </tr></thead>
            <tbody>
              {data.actions.map((a, i) => (
                <tr key={a.id}>
                  <td style={{ ...styles.td, color: COLORS.textMuted, fontFamily: monoStack, fontSize: "11px" }}>{i + 1}</td>
                  <td style={styles.td}><Input value={a.component} onChange={(v) => updateAction(i, "component", v)} placeholder="e.g. Migrate SIEM connectors" /></td>
                  <td style={styles.td}><Select value={a.startMonth} onChange={(v) => updateAction(i, "startMonth", v)} options={MONTH_OPTIONS} /></td>
                  <td style={styles.td}><Select value={a.endMonth} onChange={(v) => updateAction(i, "endMonth", v)} options={MONTH_OPTIONS} /></td>
                  <td style={styles.td}><Select value={a.effort} onChange={(v) => updateAction(i, "effort", v)} options={EFFORT} /></td>
                  <td style={styles.td}><Select value={a.status} onChange={(v) => updateAction(i, "status", v)} options={STATUS} /></td>
                  <td style={styles.td}><Input value={a.notes} onChange={(v) => updateAction(i, "notes", v)} placeholder="Key detail" /></td>
                  <td style={{ ...styles.td, textAlign: "right", whiteSpace: "nowrap" }}>
                    <button style={{ ...styles.btn, padding: "3px 8px", fontSize: "11px", marginRight: "4px" }} onClick={() => insertAction(i)} title="Insert action after this row">+</button>
                    {data.actions.length > 1 && <button style={{ ...styles.btnDanger, padding: "3px 8px" }} onClick={() => removeAction(i)} title="Remove this action">{"\u00D7"}</button>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{ display: "flex", gap: "8px", marginTop: "10px" }}>
          <button style={styles.btn} onClick={addAction}>+ Add Action</button>
          <button style={{ ...styles.btn, color: COLORS.textMuted }} onClick={sortActions}>Sort by Date</button>
        </div>
      </div>
    </div>
  );
}

// ── Summary View ──
function SummaryView({ data }) {
  const hBadge = (h) => <span style={styles.badge(healthColor(h), healthBg(h))}>{h}</span>;
  const sBadge = (s) => <span style={styles.badge(statusColor(s), "transparent")}>{s}</span>;
  const completePct = data.actions.length ? Math.round((data.actions.filter((a) => a.status === "Complete").length / data.actions.length) * 100) : 0;
  const fmtRange = (a) => a.startMonth === a.endMonth ? a.startMonth : `${a.startMonth} \u2192 ${a.endMonth}`;

  return (
    <div>
      <div style={{ ...styles.card, marginBottom: "24px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px" }}>
          <div>
            <h2 style={{ fontSize: "20px", fontWeight: 700, margin: "0 0 4px 0" }}>{data.serviceName || "Untitled Service"}</h2>
            <div style={{ fontSize: "13px", color: COLORS.textMuted }}>Owner: {data.serviceOwner || "\u2014"} &nbsp;|&nbsp; Updated: {data.lastUpdated}</div>
          </div>
          <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
            {data.serviceExists === false ? (
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: "11px", color: COLORS.textMuted, marginBottom: "4px" }}>STATUS</div>
                <span style={styles.badge(COLORS.purple, COLORS.purpleBg)}>New Capability</span>
              </div>
            ) : (
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: "11px", color: COLORS.textMuted, marginBottom: "4px" }}>HEALTH</div>
                {hBadge(data.currentHealth)}
              </div>
            )}
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "11px", color: COLORS.textMuted, marginBottom: "4px" }}>DISPOSITION</div>
              <span style={styles.badge(dispColor(data.disposition), dispBgFn(data.disposition))}>{data.disposition}</span>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "11px", color: COLORS.textMuted, marginBottom: "4px" }}>TIME</div>
              <span style={styles.badge(COLORS.accent, COLORS.accentBg)}>{data.timeAssessment}</span>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "11px", color: COLORS.textMuted, marginBottom: "4px" }}>PROGRESS</div>
              <span style={{ fontSize: "18px", fontWeight: 700, fontFamily: monoStack, color: COLORS.accent }}>{completePct}%</span>
            </div>
          </div>
        </div>
        {data.purpose && <p style={{ fontSize: "13px", color: COLORS.textMuted, marginTop: "12px", lineHeight: "1.5" }}>{data.purpose}</p>}
        {(() => { const parts = [data.consumers, data.consumersOther].filter(Boolean).join(", "); return parts ? <div style={{ fontSize: "12px", color: COLORS.textMuted, marginTop: "6px" }}><strong style={{ color: COLORS.text }}>Consumers:</strong> {parts}</div> : null; })()}
      </div>

      <div style={{ ...styles.grid2, marginBottom: "24px" }}>
        <div style={styles.card}>
          <div style={{ ...styles.sectionTitle, marginTop: 0 }}>{data.serviceExists === false ? "Proposed Technology" : "Current State"}</div>
          {data.serviceExists === false ? (
            <>
              <div style={{ fontSize: "12px", color: COLORS.purple, marginBottom: "10px", padding: "6px 10px", background: COLORS.purpleBg, borderRadius: "4px", fontWeight: 600 }}>This service does not currently exist</div>
              <pre style={{ fontSize: "12px", fontFamily: monoStack, color: COLORS.text, whiteSpace: "pre-wrap", margin: 0, lineHeight: "1.6" }}>{data.currentStack || "Not specified"}</pre>
            </>
          ) : (
            <pre style={{ fontSize: "12px", fontFamily: monoStack, color: COLORS.text, whiteSpace: "pre-wrap", margin: 0, lineHeight: "1.6" }}>{data.currentStack || "Not specified"}</pre>
          )}
          {data.constraints && <div style={{ marginTop: "12px", fontSize: "12px", color: COLORS.amber, lineHeight: "1.5" }}><strong>Constraints:</strong> {data.constraints}</div>}
        </div>
        <div style={styles.card}>
          <div style={{ ...styles.sectionTitle, marginTop: 0 }}>Target State</div>
          <pre style={{ fontSize: "12px", fontFamily: monoStack, color: COLORS.text, whiteSpace: "pre-wrap", margin: 0, lineHeight: "1.6" }}>{data.targetState || "Not specified"}</pre>
          {data.targetDrivers && <div style={{ marginTop: "12px", fontSize: "12px", color: COLORS.accent, lineHeight: "1.5" }}><strong>Drivers:</strong> {data.targetDrivers}</div>}
        </div>
      </div>

      {data.risks.some((r) => r.description) && (
        <div style={{ ...styles.card, marginBottom: "24px" }}>
          <div style={{ ...styles.sectionTitle, marginTop: 0 }}>Lifecycle & Risk</div>
          <table style={styles.table}>
            <thead><tr><th style={styles.th}>Risk</th><th style={styles.th}>Date</th><th style={styles.th}>Severity</th></tr></thead>
            <tbody>{data.risks.filter((r) => r.description).map((r) => (
              <tr key={r.id}><td style={styles.td}>{r.description}</td><td style={{ ...styles.td, fontFamily: monoStack, fontSize: "12px" }}>{r.eolDate || "\u2014"}</td><td style={styles.td}>{hBadge(r.severity)}</td></tr>
            ))}</tbody>
          </table>
        </div>
      )}

      <div style={styles.card}>
        <div style={{ ...styles.sectionTitle, marginTop: 0 }}>Roadmap Actions</div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ ...styles.table, minWidth: "550px" }}>
            <thead><tr><th style={styles.th}>Action</th><th style={styles.th}>Timeline</th><th style={styles.th}>Effort</th><th style={styles.th}>Status</th><th style={styles.th}>Notes</th></tr></thead>
            <tbody>
              {data.actions.filter((a) => a.component).map((a) => (
                <tr key={a.id}>
                  <td style={{ ...styles.td, fontWeight: 600 }}>{a.component}</td>
                  <td style={{ ...styles.td, fontFamily: monoStack, fontSize: "12px" }}>{fmtRange(a)}</td>
                  <td style={styles.td}>{a.effort}</td>
                  <td style={styles.td}>{sBadge(a.status)}</td>
                  <td style={{ ...styles.td, fontSize: "12px", color: COLORS.textMuted }}>{a.notes}</td>
                </tr>
              ))}
              {!data.actions.some((a) => a.component) && (
                <tr><td colSpan={5} style={{ ...styles.td, textAlign: "center", color: COLORS.textMuted, padding: "20px" }}>No actions defined yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ── Timeline View ──
function TimelineView({ data }) {
  const actions = data.actions.filter((a) => a.component);
  const dColor = dispColor(data.disposition);

  const parsed = actions.map((a) => {
    const startStr = a.startMonth || a.targetMonth || null;
    const endStr = a.endMonth || a.targetMonth || startStr;
    const sv = parseMonth(startStr);
    const ev = parseMonth(endStr);
    if (sv === null) return null;
    return { ...a, startVal: sv, endVal: ev !== null && ev >= sv ? ev : sv, isSpan: ev !== null && ev > sv };
  }).filter(Boolean);

  const sorted = [...parsed].sort((a, b) => a.startVal - b.startVal || a.endVal - b.endVal);

  if (sorted.length === 0) {
    return (
      <div style={{ ...styles.card, textAlign: "center", padding: "60px 20px" }}>
        <div style={{ fontSize: "14px", color: COLORS.textMuted, marginBottom: "8px" }}>No roadmap actions to visualise</div>
        <div style={{ fontSize: "12px", color: COLORS.textMuted }}>Add actions in the Edit tab to see them on the timeline</div>
      </div>
    );
  }

  const allVals = sorted.flatMap((a) => [a.startVal, a.endVal]);
  const minVal = Math.min(...allVals) - 1;
  const maxVal = Math.max(...allVals) + 1;
  const range = Math.max(maxVal - minVal, 3);

  const axisMonths = [];
  for (let v = minVal; v <= maxVal; v++) {
    const yr = Math.floor(v / 12);
    const mo = v - yr * 12;
    axisMonths.push({ val: v, label: MONTHS_SHORT[mo], year: yr, isJan: mo === 0 });
  }

  const leftPad = 50;
  const rightPad = 50;
  const colWidth = Math.max(60, Math.min(110, 900 / range));
  const timelineWidth = range * colWidth;
  const svgWidth = leftPad + timelineWidth + rightPad;
  const nodeRadius = 18;
  const baseOffset = 55;
  const labelSpacing = 75;
  const minHorizDist = 100;

  const aboveSlots = [];
  const belowSlots = [];

  sorted.forEach((action, idx) => {
    const startX = leftPad + (action.startVal - minVal) * colWidth;
    const endX = leftPad + (action.endVal - minVal) * colWidth;
    action.startX = startX;
    action.endX = endX;
    action.midX = (startX + endX) / 2;
    action.above = idx % 2 === 0;

    const slots = action.above ? aboveSlots : belowSlots;
    let tier = 0;
    for (let t = 0; t <= 10; t++) {
      const conflict = slots.some((s) => {
        const aLeft = Math.min(startX, endX) - minHorizDist / 2;
        const aRight = Math.max(startX, endX) + minHorizDist / 2;
        const sLeft = Math.min(s.startX, s.endX) - minHorizDist / 2;
        const sRight = Math.max(s.startX, s.endX) + minHorizDist / 2;
        return s.tier === t && aLeft < sRight && aRight > sLeft;
      });
      if (!conflict) { tier = t; break; }
      tier = t + 1;
    }
    action.tier = tier;
    slots.push({ startX, endX, tier });
  });

  const maxAboveTier = sorted.filter((a) => a.above).reduce((m, a) => Math.max(m, a.tier), 0);
  const maxBelowTier = sorted.filter((a) => !a.above).reduce((m, a) => Math.max(m, a.tier), 0);

  const topSpace = baseOffset + (maxAboveTier + 1) * labelSpacing + 30;
  const bottomSpace = baseOffset + (maxBelowTier + 1) * labelSpacing + 30;
  const mainLineY = topSpace;
  const svgHeight = mainLineY + bottomSpace;

  return (
    <div>
      <div style={{ ...styles.card, marginBottom: "24px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h2 style={{ fontSize: "20px", fontWeight: 700, margin: "0 0 4px 0" }}>
            {data.serviceName || "Untitled Service"} {"\u2014"} Timeline
          </h2>
          <div style={{ display: "flex", gap: "12px", alignItems: "center", marginTop: "6px" }}>
            <span style={styles.badge(dispColor(data.disposition), dispBgFn(data.disposition))}>{data.disposition}</span>
            <span style={styles.badge(COLORS.accent, COLORS.accentBg)}>{data.timeAssessment}</span>
            <span style={{ fontSize: "12px", color: COLORS.textMuted }}>{sorted.length} action{sorted.length !== 1 ? "s" : ""}</span>
          </div>
        </div>
        <div style={{ display: "flex", gap: "14px", flexWrap: "wrap" }}>
          {STATUS.map((s) => (
            <div key={s} style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "11px", color: COLORS.textMuted }}>
              <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: statusColor(s) }} />
              {s}
            </div>
          ))}
        </div>
      </div>

      <div style={{ overflowX: "auto", background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: "8px", padding: "12px 0" }}>
        <svg width={svgWidth} height={svgHeight} style={{ display: "block" }}>
          {axisMonths.map((m, i) => {
            const x = leftPad + (m.val - minVal) * colWidth;
            return (
              <g key={i}>
                {i % 2 === 0 && <rect x={x} y={0} width={colWidth} height={svgHeight} fill="rgba(255,255,255,0.012)" />}
                <line x1={x} y1={mainLineY - 8} x2={x} y2={mainLineY + 8} stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
                <text x={x + colWidth / 2} y={mainLineY + 28} textAnchor="middle" fill={m.isJan ? "#e0e2e8" : "#8a8f9d"} fontSize={m.isJan ? "11" : "10"} fontFamily={monoStack} fontWeight={m.isJan ? "700" : "400"}>{m.label}</text>
                {m.isJan && <text x={x + colWidth / 2} y={mainLineY + 42} textAnchor="middle" fill="#8a8f9d" fontSize="10" fontFamily={monoStack}>{m.year}</text>}
              </g>
            );
          })}

          <line x1={leftPad - 10} y1={mainLineY} x2={leftPad + timelineWidth + 10} y2={mainLineY} stroke={dColor} strokeWidth="3" strokeLinecap="round" />
          <polygon points={`${leftPad + timelineWidth + 20},${mainLineY} ${leftPad + timelineWidth + 10},${mainLineY - 6} ${leftPad + timelineWidth + 10},${mainLineY + 6}`} fill={dColor} />

          {sorted.map((action) => {
            const tierDist = baseOffset + action.tier * labelSpacing;
            const cy = action.above ? mainLineY - tierDist : mainLineY + tierDist;
            const sColor = statusColor(action.status);
            const isComplete = action.status === "Complete";
            const startCx = action.startX + colWidth / 2;
            const endCx = action.endX + colWidth / 2;
            const startConnY = action.above ? cy + nodeRadius + 2 : cy - nodeRadius - 2;
            const labelY = action.above ? cy - nodeRadius - 10 : cy + nodeRadius + 16;

            return (
              <g key={action.id}>
                {/* Connector from timeline to start node */}
                <line x1={startCx} y1={mainLineY} x2={startCx} y2={startConnY} stroke={dColor} strokeWidth="2" strokeOpacity="0.5" strokeDasharray={action.status === "Not Started" ? "4,3" : "0"} />

                {/* Span: dashed line between start and end + end connector */}
                {action.isSpan && (
                  <>
                    <line x1={startCx + nodeRadius + 4} y1={cy} x2={endCx - nodeRadius - 4} y2={cy} stroke={dColor} strokeWidth="3" strokeDasharray="8,5" strokeOpacity="0.7" strokeLinecap="round" />
                    <line x1={endCx} y1={mainLineY} x2={endCx} y2={startConnY} stroke={dColor} strokeWidth="2" strokeOpacity="0.3" strokeDasharray="4,3" />
                  </>
                )}

                {/* Start node — outer ring */}
                <circle cx={startCx} cy={cy} r={nodeRadius} fill="#1a1d27" stroke={dColor} strokeWidth="3" />
                {/* Start node — inner status ring */}
                <circle cx={startCx} cy={cy} r={nodeRadius - 6} fill={isComplete ? sColor : "transparent"} stroke={sColor} strokeWidth={isComplete ? 0 : 2.5} strokeOpacity={isComplete ? 1 : 0.8} />
                {/* Effort letter */}
                <text x={startCx} y={cy + 4} textAnchor="middle" fill={isComplete ? "#1a1d27" : sColor} fontSize="10" fontFamily={monoStack} fontWeight="700">
                  {action.effort === "Low" ? "L" : action.effort === "Medium" ? "M" : "H"}
                </text>

                {/* End node (if span) */}
                {action.isSpan && (
                  <>
                    <circle cx={endCx} cy={cy} r={nodeRadius - 2} fill="#1a1d27" stroke={dColor} strokeWidth="2.5" strokeDasharray="5,3" />
                    <circle cx={endCx} cy={cy} r={nodeRadius - 8} fill={isComplete ? sColor : "transparent"} stroke={sColor} strokeWidth={isComplete ? 0 : 2} strokeOpacity={isComplete ? 1 : 0.6} />
                  </>
                )}

                {/* Action label — centred between start and end */}
                <text x={(startCx + endCx) / 2} y={labelY} textAnchor="middle" fill="#e0e2e8" fontSize="11" fontFamily={fontStack} fontWeight="600">
                  {action.component.length > 26 ? action.component.slice(0, 24) + "\u2026" : action.component}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      <div style={{ marginTop: "16px", padding: "12px 16px", background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: "8px" }}>
        <div style={{ fontSize: "11px", color: COLORS.textMuted, lineHeight: "1.7" }}>
          <strong style={{ color: COLORS.text }}>How to read:</strong> Each action shows a start node (solid ring) at its start month. Multi-month actions show a dashed line connecting to a smaller end node at the completion month. Ring colour reflects disposition ({data.disposition}). Inner colour shows status. Letter inside shows effort (L/M/H). Filled nodes are complete.
        </div>
      </div>
    </div>
  );
}

// ── Main App ──
const STORAGE_KEY = "service-roadmaps";

export default function App() {
  const [roadmaps, setRoadmaps] = useState([]);
  const [activeIdx, setActiveIdx] = useState(0);
  const [view, setView] = useState("edit");
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) { setRoadmaps(parsed); setLoaded(true); return; }
      }
    } catch (e) {}
    setRoadmaps([emptyRoadmap()]);
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    const t = setTimeout(async () => {
      try { setSaving(true); localStorage.setItem(STORAGE_KEY, JSON.stringify(roadmaps)); setTimeout(() => setSaving(false), 600); } catch (e) { setSaving(false); }
    }, 800);
    return () => clearTimeout(t);
  }, [roadmaps, loaded]);

  const data = roadmaps[activeIdx] || emptyRoadmap();
  const setData = useCallback((updater) => {
    setRoadmaps((prev) => {
      const next = [...prev];
      next[activeIdx] = typeof updater === "function" ? updater(next[activeIdx]) : updater;
      next[activeIdx].lastUpdated = new Date().toISOString().split("T")[0];
      return next;
    });
  }, [activeIdx]);

  const [modal, setModal] = useState(null); // null | "export" | "import"
  const [importText, setImportText] = useState("");
  const [copyFeedback, setCopyFeedback] = useState(false);

  const addRoadmap = () => { setRoadmaps((prev) => [...prev, emptyRoadmap()]); setActiveIdx(roadmaps.length); setView("edit"); };
  const deleteRoadmap = () => { if (roadmaps.length <= 1) return; if (!confirm("Delete this roadmap?")) return; setRoadmaps((prev) => prev.filter((_, i) => i !== activeIdx)); setActiveIdx(Math.max(0, activeIdx - 1)); };

  const exportJSON = () => { setModal("export"); setCopyFeedback(false); };
  const handleCopy = () => {
    const text = JSON.stringify(data, null, 2);
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(() => { setCopyFeedback(true); setTimeout(() => setCopyFeedback(false), 2000); }).catch(() => { setCopyFeedback(false); });
    }
  };

  const importJSON = () => { setModal("import"); setImportText(""); };
  const handleImport = () => {
    try {
      const imported = JSON.parse(importText);
      if (imported.serviceName !== undefined) {
        setRoadmaps((prev) => [...prev, imported]);
        setActiveIdx(roadmaps.length);
        setView("edit");
        setModal(null);
        setImportText("");
      } else { alert("Invalid roadmap JSON: missing serviceName"); }
    } catch (err) { alert("Invalid JSON: " + err.message); }
  };
  const handleImportAll = () => {
    try {
      const imported = JSON.parse(importText);
      if (Array.isArray(imported) && imported.length > 0 && imported[0].serviceName !== undefined) {
        setRoadmaps((prev) => [...prev, ...imported]);
        setActiveIdx(roadmaps.length);
        setView("edit");
        setModal(null);
        setImportText("");
      } else { handleImport(); }
    } catch (err) { handleImport(); }
  };
  const exportAllJSON = () => {
    setModal("exportAll");
    setCopyFeedback(false);
  };
  const handleCopyAll = () => {
    const text = JSON.stringify(roadmaps, null, 2);
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(() => { setCopyFeedback(true); setTimeout(() => setCopyFeedback(false), 2000); }).catch(() => { setCopyFeedback(false); });
    }
  };

  if (!loaded) return <div style={{ ...styles.app, display: "flex", alignItems: "center", justifyContent: "center", height: "100vh" }}><div style={{ color: COLORS.textMuted, fontSize: "13px" }}>Loading roadmaps...</div></div>;

  return (
    <div style={styles.app}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Service Roadmap Builder</h1>
          <div style={styles.subtitle}>{roadmaps.length} roadmap{roadmaps.length !== 1 ? "s" : ""}{saving && <span style={{ marginLeft: "12px", color: COLORS.green }}>Saving...</span>}</div>
        </div>
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          <button style={styles.btn} onClick={importJSON}>Import</button>
          <button style={styles.btn} onClick={exportJSON}>Export Current</button>
          <button style={styles.btn} onClick={exportAllJSON}>Export All</button>
          <button style={styles.btnPrimary} onClick={addRoadmap}>+ New Roadmap</button>
        </div>
      </div>

      {/* Modal overlay */}
      {modal && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "20px" }} onClick={() => setModal(null)}>
          <div style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: "10px", padding: "24px", maxWidth: "640px", width: "100%", maxHeight: "80vh", display: "flex", flexDirection: "column" }} onClick={(e) => e.stopPropagation()}>
            {(modal === "export" || modal === "exportAll") && (
              <>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                  <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 700 }}>{modal === "exportAll" ? "Export All Roadmaps" : `Export: ${data.serviceName || "Roadmap"}`}</h3>
                  <button style={styles.btnDanger} onClick={() => setModal(null)}>Close</button>
                </div>
                <div style={{ fontSize: "12px", color: COLORS.textMuted, marginBottom: "12px" }}>Copy the JSON below. You can paste it into the Import dialog on another session, or save it as a .json file.</div>
                <textarea readOnly value={modal === "exportAll" ? JSON.stringify(roadmaps, null, 2) : JSON.stringify(data, null, 2)} style={{ ...styles.textarea, minHeight: "200px", flex: 1, fontFamily: monoStack, fontSize: "11px" }} onFocus={(e) => e.target.select()} />
                <div style={{ display: "flex", gap: "8px", marginTop: "12px" }}>
                  <button style={styles.btnPrimary} onClick={modal === "exportAll" ? handleCopyAll : handleCopy}>{copyFeedback ? "Copied!" : "Copy to Clipboard"}</button>
                </div>
              </>
            )}
            {modal === "import" && (
              <>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                  <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 700 }}>Import Roadmap</h3>
                  <button style={styles.btnDanger} onClick={() => setModal(null)}>Close</button>
                </div>
                <div style={{ fontSize: "12px", color: COLORS.textMuted, marginBottom: "12px" }}>Paste exported JSON below. Accepts a single roadmap object or an array of roadmaps.</div>
                <textarea value={importText} onChange={(e) => setImportText(e.target.value)} placeholder='Paste JSON here...' style={{ ...styles.textarea, minHeight: "200px", flex: 1, fontFamily: monoStack, fontSize: "11px" }} onFocus={(e) => (e.target.style.borderColor = COLORS.borderFocus)} onBlur={(e) => (e.target.style.borderColor = COLORS.border)} />
                <div style={{ display: "flex", gap: "8px", marginTop: "12px" }}>
                  <button style={styles.btnPrimary} onClick={handleImportAll} disabled={!importText.trim()}>Import</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {roadmaps.length > 1 && (
        <div style={{ padding: "0 32px", marginTop: "16px", display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center" }}>
          {roadmaps.map((rm, i) => (
            <button key={i} style={{ ...styles.btn, background: i === activeIdx ? COLORS.surfaceAlt : "transparent", borderColor: i === activeIdx ? COLORS.accent : COLORS.border, color: i === activeIdx ? COLORS.text : COLORS.textMuted, fontSize: "12px" }} onClick={() => setActiveIdx(i)}>
              {rm.serviceName || `Roadmap ${i + 1}`}
            </button>
          ))}
          {roadmaps.length > 1 && <button style={{ ...styles.btnDanger, marginLeft: "8px" }} onClick={deleteRoadmap}>Delete Current</button>}
        </div>
      )}

      <div style={{ padding: "0 32px", marginTop: "20px" }}>
        <div style={styles.tabs}>
          <button style={styles.tab(view === "edit")} onClick={() => setView("edit")}>Edit</button>
          <button style={styles.tab(view === "summary")} onClick={() => setView("summary")}>Summary</button>
          <button style={styles.tab(view === "timeline")} onClick={() => setView("timeline")}>Timeline</button>
        </div>
      </div>

      <div style={styles.main}>
        {view === "edit" ? <EditView data={data} setData={setData} /> : view === "summary" ? <SummaryView data={data} /> : <TimelineView data={data} />}
      </div>
    </div>
  );
}
