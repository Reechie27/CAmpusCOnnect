import React, { useState } from "react";
import "./App.css";

/* ---------- images (remote; they load in your own project) ---------- */
const LOGO = "https://upload.wikimedia.org/wikipedia/en/b/b7/Western_Mindanao_State_University.png";
const U = (id) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=900&q=80`;
const IMG = {
  campus: U("photo-1523580494863-6f3031224c94"),
  volunteer: U("photo-1559027615-cd4628902d4a"),
  environment: U("photo-1518531933037-91b2f5f229cc"),
  education: U("photo-1509062522246-3755977927d7"),
};
const PHOTO = { "Community Service": IMG.volunteer, Environment: IMG.environment, Education: IMG.education, "Health and Wellness": IMG.campus };
const CATEGORIES = Object.keys(PHOTO);
const COLLEGES = ["College of Agriculture", "College of Architecture", "College of Asian and Islamic Studies", "College of Computing Studies", "College of Criminal Justice Education", "College of Engineering", "College of Forestry and Environmental Studies", "College of Home Economics", "College of Law", "College of Liberal Arts", "College of Medicine", "College of Nursing", "College of Public Administration and Development Studies", "College of Science and Mathematics", "College of Social Work and Community Development", "College of Sports Science and Physical Education", "College of Teacher Education"];
const DEMO_PW = "demo1234";

/* ---------- seed data ---------- */
const seedUsers = [
  { id: 1, role: "Super Admin", last: "Admin", first: "System", mi: "S", idno: "SA-0001", email: "superadmin@wmsu.edu.ph", college: "University Administration", pw: DEMO_PW, status: "Active" },
  { id: 2, role: "Admin", last: "Santos", first: "Maria", mi: "L", idno: "OFF-0001", email: "admin@wmsu.edu.ph", college: "Office of Student Affairs", pw: DEMO_PW, status: "Active" },
  { id: 3, role: "User", last: "Volunteer", first: "Student", mi: "", idno: "2026-00001", email: "student@wmsu.edu.ph", college: "College of Engineering", pw: DEMO_PW, status: "Active" },
  { id: 4, role: "User", last: "Reyes", first: "Juan", mi: "D", idno: "2026-00002", email: "juan.reyes@wmsu.edu.ph", college: "College of Nursing", pw: DEMO_PW, status: "Active" },
];
const seedActs = [
  { id: 1, title: "Campus Community Outreach", desc: "Distribute school supplies and hygiene kits to partner barangays around Zamboanga City.", category: "Community Service", date: "2026-11-08", time: "08:00", endTime: "12:00", location: "WMSU Main Campus", hours: 4, slots: 30, status: "Open", by: 2 },
  { id: 2, title: "Green Campus Initiative", desc: "Tree planting and campus clean-up to keep WMSU green.", category: "Environment", date: "2026-11-15", time: "07:30", endTime: "10:30", location: "WMSU Main Campus", hours: 3, slots: 25, status: "Open", by: 2 },
  { id: 3, title: "Learning Support Program", desc: "Tutor public elementary learners in reading and mathematics.", category: "Education", date: "2026-11-22", time: "13:00", endTime: "18:00", location: "Zamboanga City", hours: 5, slots: 20, status: "Pending", by: 2 },
  { id: 4, title: "Coastal Clean-up Drive", desc: "Shoreline clean-up and waste segregation awareness.", category: "Environment", date: "2026-10-18", time: "06:30", endTime: "10:30", location: "Paseo del Mar", hours: 4, slots: 40, status: "Completed", by: 2 },
];
const seedEnr = [
  { id: 1, actId: 4, userId: 3, status: "Accepted", attended: true, hours: 4, logDate: "2026-10-18", verified: true },
  { id: 2, actId: 1, userId: 3, status: "Pending", attended: false, hours: 0 },
  { id: 3, actId: 1, userId: 4, status: "Accepted", attended: false, hours: 0 },
];

/* ---------- helpers ---------- */
function useStored(key, initial) {
  const [value, setValue] = useState(() => {
    try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : initial; } catch { return initial; }
  });
  const set = (next) => { setValue(next); try { localStorage.setItem(key, JSON.stringify(next)); } catch { /* ignore */ } };
  return [value, set];
}
const nid = (list) => Math.max(0, ...list.map((x) => x.id)) + 1;
const fullName = (u) => `${u.first} ${u.mi ? u.mi.toUpperCase() + ". " : ""}${u.last}`;
const initials = (u) => (u.first[0] + u.last[0]).toUpperCase();
const fmtDate = (d) => new Date(d + "T00:00:00").toLocaleDateString("en-PH", { year: "numeric", month: "short", day: "numeric" });
const fmtTime = (t) => { const [h, m] = t.split(":").map(Number); return `${h % 12 || 12}:${String(m).padStart(2, "0")} ${h < 12 ? "AM" : "PM"}`; };
const timeRange = (a) => (a.time ? (a.endTime ? `${fmtTime(a.time)} – ${fmtTime(a.endTime)}` : fmtTime(a.time)) : "");
const calcHours = (s, e) => { if (!s || !e) return 0; const [h1, m1] = s.split(":").map(Number), [h2, m2] = e.split(":").map(Number); const mins = h2 * 60 + m2 - (h1 * 60 + m1); return mins > 0 ? Math.max(0.5, Math.round(mins / 30) / 2) : 0; };
const BCLS = { Open: "ok", Accepted: "ok", Ongoing: "gold", Pending: "gold", Rejected: "no", Declined: "no", Verified: "ok", Logged: "gold" };
const Badge = ({ s }) => <span className={`bd ${BCLS[s] || ""}`}>{s}</span>;
const accepted = (enr, a) => enr.filter((e) => e.actId === a.id && e.status === "Accepted").length;
const hoursOf = (enr, uid) => enr.filter((e) => e.userId === uid && e.attended).reduce((s, e) => s + Number(e.hours || 0), 0);

function Logo({ big }) {
  const [bad, setBad] = useState(false);
  if (bad) return <div className="mark">W</div>;
  return <img className={`logo ${big ? "big" : ""}`} src={LOGO} alt="WMSU logo" onError={() => setBad(true)} />;
}
function Stat({ label, value, detail, icon }) {
  return (
    <article className="card stat">
      <div className="st"><span>{label}</span><span className="si">{icon}</span></div>
      <div className="sv">{value}</div><div className="sd">{detail}</div>
    </article>
  );
}
function Gallery() {
  const t = [["Campus life", IMG.campus], ["Community outreach", IMG.volunteer], ["Green initiatives", IMG.environment], ["Education for all", IMG.education]];
  return <section className="gallery noprint">{t.map(([n, i]) => <div key={n} className="gal" style={{ backgroundImage: `url(${i})` }}><span>{n}</span></div>)}</section>;
}
function Hero({ title, text, children }) {
  return (
    <section className="hero photo">
      <Logo big />
      <span className="kick">✦ COMMUNITY • SERVICE • EXCELLENCE</span>
      <h2>{title}</h2><p>{text}</p>{children}
    </section>
  );
}
function Panel({ eyebrow, title, sub, action, children }) {
  return (
    <section className="card panel">
      <div className="ph"><div><span className="eb">{eyebrow}</span><h2>{title}</h2>{sub && <p>{sub}</p>}</div>{action}</div>
      {children}
    </section>
  );
}
const Empty = ({ cols, text }) => <tr><td colSpan={cols} className="empty">{text}</td></tr>;

/* ---------- certificate (canvas -> PDF / print) ---------- */
const loadImg = (src) => new Promise((res) => {
  const i = new Image(); i.crossOrigin = "anonymous";
  i.onload = () => res(i); i.onerror = () => res(null); i.src = src; setTimeout(() => res(null), 4000);
});
function wrapText(ctx, text, maxWidth) {
  const lines = []; let line = "";
  text.split(" ").forEach((w) => { const t = line ? line + " " + w : w; if (ctx.measureText(t).width > maxWidth && line) { lines.push(line); line = w; } else line = t; });
  if (line) lines.push(line); return lines;
}
async function drawCertificate(name, college, heading, body) {
  const W = 1600, H = 1131, c = document.createElement("canvas"); c.width = W; c.height = H;
  const x = c.getContext("2d");
  x.fillStyle = "#fffdfd"; x.fillRect(0, 0, W, H);
  x.strokeStyle = "#B5122B"; x.lineWidth = 8; x.strokeRect(40, 40, W - 80, H - 80);
  x.strokeStyle = "#e9bdc6"; x.lineWidth = 2; x.strokeRect(64, 64, W - 128, H - 128);
  x.save(); x.translate(W / 2, H / 2); x.rotate(-Math.PI / 12); x.fillStyle = "rgba(121,9,27,.05)";
  x.font = "900 400px sans-serif"; x.textAlign = "center"; x.textBaseline = "middle"; x.fillText("WMSU", 0, 0); x.restore();
  x.textAlign = "center"; x.textBaseline = "alphabetic";
  const logo = await loadImg(LOGO);
  if (logo) x.drawImage(logo, W / 2 - 62, 110, 124, 124);
  else { x.fillStyle = "#B5122B"; x.beginPath(); x.arc(W / 2, 172, 52, 0, Math.PI * 2); x.fill(); x.fillStyle = "#fff"; x.font = "bold 50px Georgia"; x.fillText("W", W / 2, 190); }
  x.fillStyle = "#B5122B"; x.font = "800 24px sans-serif"; x.letterSpacing = "5px"; x.fillText("WESTERN MINDANAO STATE UNIVERSITY", W / 2, 300); x.letterSpacing = "0px";
  x.fillStyle = "#79091B"; x.font = "bold 80px Georgia, serif"; x.fillText(heading, W / 2, 408);
  x.fillStyle = "#776A6E"; x.font = "28px sans-serif"; x.fillText("Presented to", W / 2, 490);
  x.fillStyle = "#20151A"; x.font = "italic 70px Georgia, serif"; x.fillText(name, W / 2, 580);
  x.strokeStyle = "#bda6ab"; x.lineWidth = 1.5; x.beginPath(); x.moveTo(W / 2 - 380, 610); x.lineTo(W / 2 + 380, 610); x.stroke();
  x.fillStyle = "#776A6E"; x.font = "28px sans-serif"; x.fillText(college, W / 2, 665);
  wrapText(x, body, 900).forEach((l, i) => x.fillText(l, W / 2, 745 + i * 46));
  x.fillText("Issued on " + new Date().toLocaleDateString("en-PH", { year: "numeric", month: "long", day: "numeric" }), W / 2, 890);
  x.strokeStyle = "#bda6ab"; x.beginPath(); x.moveTo(W / 2 - 190, 975); x.lineTo(W / 2 + 190, 975); x.stroke();
  x.fillStyle = "#20151A"; x.font = "22px sans-serif"; x.fillText("Authorized Signature", W / 2, 1010);
  return c;
}
function pdfFromCanvas(canvas) {
  const jpg = Uint8Array.from(atob(canvas.toDataURL("image/jpeg", 0.95).split(",")[1]), (ch) => ch.charCodeAt(0));
  const enc = new TextEncoder(), parts = [], off = []; let len = 0;
  const push = (d) => { const b = typeof d === "string" ? enc.encode(d) : d; parts.push(b); len += b.length; };
  const obj = (n, body) => { off[n] = len; push(`${n} 0 obj\n${body}\nendobj\n`); };
  push("%PDF-1.4\n");
  obj(1, "<< /Type /Catalog /Pages 2 0 R >>");
  obj(2, "<< /Type /Pages /Kids [3 0 R] /Count 1 >>");
  obj(3, "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 842 595] /Resources << /XObject << /Im0 4 0 R >> >> /Contents 5 0 R >>");
  off[4] = len;
  push(`4 0 obj\n<< /Type /XObject /Subtype /Image /Width ${canvas.width} /Height ${canvas.height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${jpg.length} >>\nstream\n`);
  push(jpg); push("\nendstream\nendobj\n");
  const content = "q 842 0 0 595 0 0 cm /Im0 Do Q";
  obj(5, `<< /Length ${content.length} >>\nstream\n${content}\nendstream`);
  const xref = len;
  push("xref\n0 6\n0000000000 65535 f \n" + [1, 2, 3, 4, 5].map((n) => String(off[n]).padStart(10, "0") + " 00000 n \n").join("") + `trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`);
  return new Blob(parts, { type: "application/pdf" });
}
function saveBlob(blob, filename) {
  const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = filename;
  document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 2000);
}

/* ---------- sign in / create account ---------- */
function AuthScreen({ d }) {
  const { users, setUsers, setMeId } = d;
  const [tab, setTab] = useState("login");
  const [error, setError] = useState("");
  const isLogin = tab === "login";

  function login(e) {
    e.preventDefault();
    const f = Object.fromEntries(new FormData(e.target));
    const u = users.find((x) => x.email.toLowerCase() === f.email.trim().toLowerCase() && x.pw === f.pw);
    if (!u) return setError("Incorrect email or password.");
    if (u.status !== "Active") return setError("This account is inactive. Please contact the Super Admin.");
    setMeId(u.id);
  }
  function register(e) {
    e.preventDefault();
    const f = Object.fromEntries(new FormData(e.target));
    const email = f.email.trim().toLowerCase(), idno = f.idno.trim();
    if (!/^[^\s@]+@wmsu\.edu\.ph$/.test(email)) return setError("Please use your WMSU email (name@wmsu.edu.ph).");
    if (!f.college) return setError("Please select your college.");
    if (f.pw !== f.pw2) return setError("Passwords do not match.");
    if (users.some((x) => x.email.toLowerCase() === email)) return setError("An account with this email already exists.");
    if (users.some((x) => x.idno.toLowerCase() === idno.toLowerCase())) return setError("An account with this ID number already exists.");
    const n = { id: nid(users), role: "User", last: f.last.trim(), first: f.first.trim(), mi: f.mi.trim().replace(/\./g, ""), idno, email, college: f.college, pw: f.pw, status: "Active" };
    setUsers([...users, n]); setMeId(n.id);
  }

  return (
    <div className="auth">
      <section className="auth-art photo">
        <div className="brand"><Logo /><div><b>WMSU IMPACT</b><small>Western Mindanao State University · Zamboanga City</small></div></div>
        <div>
          <span className="kick">✦ COMMUNITY • SERVICE • EXCELLENCE</span>
          <h1>Serve. Log hours.<br />Make an impact.</h1>
          <p>Campus offices post volunteer and community service activities. Students sign up, earn verified hours, and generate completion records.</p>
        </div>
        <small style={{ opacity: 0.75, position: "relative", zIndex: 1 }}>A Smart Research University by 2040</small>
      </section>
      <section className="auth-side">
        <div className="card auth-box">
          <div className="tabs">
            <button type="button" className={isLogin ? "on" : ""} onClick={() => { setTab("login"); setError(""); }}>Log in</button>
            <button type="button" className={!isLogin ? "on" : ""} onClick={() => { setTab("register"); setError(""); }}>Student sign-up</button>
          </div>
          {isLogin ? (
            <>
              <h2>Welcome back</h2>
              <p className="sub">Log in with your WMSU email. Your portal (Super Admin, Admin or Student) opens automatically.</p>
              <form className="f" onSubmit={login}>
                <label className="w">WMSU email<input name="email" type="email" placeholder="name@wmsu.edu.ph" autoComplete="username" required /></label>
                <label className="w">Password<input name="pw" type="password" autoComplete="current-password" required /></label>
                {error && <div className="err">{error}</div>}
                <button className="btn full" style={{ gridColumn: "1 / -1" }}>Log in</button>
              </form>
              <div className="hint"><b>Demo accounts</b> (password <code>{DEMO_PW}</code>)<br /><code>superadmin@wmsu.edu.ph</code> · <code>admin@wmsu.edu.ph</code> · <code>student@wmsu.edu.ph</code></div>
            </>
          ) : (
            <>
              <h2>Create your student account</h2>
              <p className="sub">Your name and college are saved to your profile and printed automatically on your certificates. Admin accounts are created by the Super Admin.</p>
              <form className="f" onSubmit={register}>
                <label>Last name<input name="last" required /></label>
                <label>First name<input name="first" required /></label>
                <label>Middle initial <span className="opt">(optional)</span><input name="mi" maxLength={2} /></label>
                <label>ID number<input name="idno" required placeholder="e.g. 2026-00123" /></label>
                <label className="w">WMSU email<input name="email" type="email" required placeholder="name@wmsu.edu.ph" /></label>
                <label className="w">College<select name="college" defaultValue="" required><option value="">Select your college</option>{COLLEGES.map((c) => <option key={c}>{c}</option>)}</select></label>
                <label>Password<input name="pw" type="password" minLength={8} required /></label>
                <label>Confirm password<input name="pw2" type="password" minLength={8} required /></label>
                {error && <div className="err">{error}</div>}
                <button className="btn full" style={{ gridColumn: "1 / -1" }}>Create account</button>
              </form>
            </>
          )}
        </div>
      </section>
    </div>
  );
}

/* ---------- sidebar shell (Super Admin + Admin) ---------- */
function Shell({ d, nav, page, setPage, children }) {
  const u = d.me, sa = u.role === "Super Admin";
  return (
    <div className="app">
      <aside className={`side ${sa ? "sa" : ""}`}>
        <div className="brand"><Logo /><div><b>WMSU IMPACT</b><small>{u.role} Portal</small></div></div>
        <div className="prof" role="button" tabIndex={0} title="Open my profile" style={{ cursor: "pointer" }} onClick={() => setPage("My Profile")}><div className="av">{initials(u)}</div><div><b>{fullName(u)}</b><small>{u.college}</small></div></div>
        <nav className="nav"><span className="nh">WORKSPACE</span>
          {nav.map(([label, icon, count]) => (
            <button key={label} type="button" className={`ni ${page === label ? "on" : ""}`} onClick={() => setPage(label)}>
              <span>{icon}</span>{label}{count > 0 && <em>{count}</em>}
            </button>
          ))}
        </nav>
        <div className="sb">
          <div className="sidepic" style={{ backgroundImage: `url(${IMG.campus})` }}><b>Make an impact</b><small>Every activity is a step toward a stronger community.</small></div>
          <button type="button" className="btn out sm full" style={{ marginTop: 12 }} onClick={d.logout}>Log out</button>
        </div>
      </aside>
      <main className="main">
        <header className="top"><div><div className="bc">WMSU IMPACT / {u.role} / {page}</div><h1>{page}</h1></div><div className="av" title={fullName(u)}>{initials(u)}</div></header>
        {children}
        <footer className="foot"><span>WMSU IMPACT</span><span>Western Mindanao State University · {new Date().getFullYear()}</span></footer>
      </main>
    </div>
  );
}

/* ---------- profile (all roles) ---------- */
function Profile({ d }) {
  const { me, users, setUsers, flash } = d;
  const [f, setF] = useState({ last: me.last, first: me.first, mi: me.mi || "", idno: me.idno, email: me.email, college: me.college, phone: me.phone || "" });
  const stu = me.role === "User";
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  function save(e) {
    e.preventDefault();
    const email = f.email.trim().toLowerCase(), idno = f.idno.trim();
    if (!f.last.trim() || !f.first.trim()) return flash("Last name and first name are required.", true);
    if (!/^[^\s@]+@wmsu\.edu\.ph$/.test(email)) return flash("Use your WMSU email (name@wmsu.edu.ph).", true);
    if (!idno || !f.college.trim()) return flash(stu ? "ID number and college are required." : "ID number and office are required.", true);
    if (users.some((u) => u.id !== me.id && u.email.toLowerCase() === email)) return flash("Another account already uses this email.", true);
    if (users.some((u) => u.id !== me.id && u.idno.toLowerCase() === idno.toLowerCase())) return flash("Another account already uses this ID number.", true);
    setUsers(users.map((u) => (u.id === me.id ? { ...u, last: f.last.trim(), first: f.first.trim(), mi: f.mi.trim().replace(/\./g, ""), idno, email, college: f.college.trim(), phone: f.phone.trim() } : u)));
    flash(stu ? "Profile updated. Your certificates now use these details." : "Profile updated.");
  }
  function changePw(e) {
    e.preventDefault();
    const p = Object.fromEntries(new FormData(e.target));
    if (p.cur !== me.pw) return flash("Current password is incorrect.", true);
    if (p.next.length < 8) return flash("New password must be at least 8 characters.", true);
    if (p.next !== p.next2) return flash("New passwords do not match.", true);
    setUsers(users.map((u) => (u.id === me.id ? { ...u, pw: p.next } : u)));
    e.target.reset(); flash("Password changed.");
  }
  return (
    <>
      <section className="card pcard">
        <div className="pbanner" style={{ backgroundImage: `linear-gradient(120deg,rgba(77,6,18,.85),rgba(181,18,43,.45)),url(${IMG.campus})` }} />
        <div className="pbody">
          <div className="av lg">{initials(me)}</div>
          <div className="pname"><h2>{fullName(me)}</h2><span className={`bd ${me.role === "Super Admin" ? "gold" : "ok"}`}>{me.role}</span></div>
          <div className="pinfo"><span>🎓 {me.college}</span><span>✉ {me.email}</span><span>🪪 {me.idno}</span>{me.phone && <span>☎ {me.phone}</span>}</div>
        </div>
      </section>
      <div className="two eq">
        <Panel eyebrow="MY PROFILE" title="Edit details" sub={stu ? "Certificates read your name and college from here automatically." : "Keep your contact details up to date."}>
          <form className="form" onSubmit={save}>
            <label>Last name<input value={f.last} onChange={set("last")} /></label>
            <label>First name<input value={f.first} onChange={set("first")} /></label>
            <label>Middle initial<input value={f.mi} maxLength={2} onChange={set("mi")} /></label>
            <label>{stu ? "ID number" : "Employee / ID number"}<input value={f.idno} onChange={set("idno")} /></label>
            <label className="w">WMSU email<input type="email" value={f.email} onChange={set("email")} /></label>
            {stu
              ? <label className="w">College<select value={f.college} onChange={set("college")}>{COLLEGES.map((c) => <option key={c}>{c}</option>)}</select></label>
              : <label className="w">Office / department<input value={f.college} onChange={set("college")} /></label>}
            <label className="w">Contact number (optional)<input value={f.phone} onChange={set("phone")} placeholder="09XX XXX XXXX" /></label>
            <button className="btn sm" type="submit">Save profile</button>
          </form>
        </Panel>
        <Panel eyebrow="SECURITY" title="Change password">
          <form className="form" onSubmit={changePw}>
            <label className="w">Current password<input name="cur" type="password" required autoComplete="current-password" /></label>
            <label>New password<input name="next" type="password" minLength={8} required autoComplete="new-password" /></label>
            <label>Confirm new password<input name="next2" type="password" minLength={8} required autoComplete="new-password" /></label>
            <button className="btn sm" type="submit">Update password</button>
          </form>
        </Panel>
      </div>
    </>
  );
}

/* ================= SUPER ADMIN ================= */
function SuperAdminApp({ d, start }) {
  const { users, setUsers, acts, setActs, enr, flash } = d;
  const [page, setPage] = useState(start || "Overview");
  const admins = users.filter((u) => u.role === "Admin"), students = users.filter((u) => u.role === "User");
  const pending = acts.filter((a) => a.status === "Pending");
  const owner = (a) => users.find((u) => u.id === a.by);
  const totalHours = enr.filter((e) => e.attended).reduce((s, e) => s + Number(e.hours || 0), 0);

  function decide(id, status) {
    setActs(acts.map((a) => (a.id === id ? { ...a, status } : a)));
    flash(status === "Open" ? "Activity approved and published to students." : "Activity request rejected.", status !== "Open");
  }
  function addAdmin(e) {
    e.preventDefault();
    const f = Object.fromEntries(new FormData(e.target)); const email = f.email.trim().toLowerCase();
    if (!/^[^\s@]+@wmsu\.edu\.ph$/.test(email)) return flash("Use a WMSU email (name@wmsu.edu.ph).", true);
    if (users.some((u) => u.email.toLowerCase() === email)) return flash("An account with this email already exists.", true);
    setUsers([...users, { id: nid(users), role: "Admin", last: f.last.trim(), first: f.first.trim(), mi: f.mi.trim().replace(/\./g, ""), idno: "OFF-" + String(nid(users)).padStart(4, "0"), email, college: f.office.trim(), pw: f.pw, status: "Active" }]);
    e.target.reset(); flash("Admin account created. Share the temporary password securely.");
  }
  function toggle(id) { setUsers(users.map((u) => (u.id === id ? { ...u, status: u.status === "Active" ? "Inactive" : "Active" } : u))); flash("Account status updated."); }

  const Pending = ({ list }) => (
    <div className="tw"><table><thead><tr><th>ACTIVITY</th><th>REQUESTED BY</th><th>SCHEDULE</th><th>HOURS / SLOTS</th><th>DECISION</th></tr></thead><tbody>
      {list.map((a) => (
        <tr key={a.id}><td><strong>{a.title}</strong><small>{a.category}</small></td><td>{owner(a) ? fullName(owner(a)) : "—"}<small>{owner(a)?.college}</small></td><td>{fmtDate(a.date)} · {timeRange(a)}<small>{a.location}</small></td><td>{a.hours} h<small>{a.slots} slots</small></td>
          <td><button type="button" className="tb" onClick={() => decide(a.id, "Open")}>✓ Approve</button><button type="button" className="tb bad" onClick={() => decide(a.id, "Rejected")}>✕ Reject</button></td></tr>
      ))}
      {list.length === 0 && <Empty cols={5} text="No pending requests. You’re all caught up." />}
    </tbody></table></div>
  );

  return (
    <Shell d={d} page={page} setPage={setPage} nav={[["Overview", "▦"], ["Approvals", "✓", pending.length], ["Admin Accounts", "♙"], ["Monitoring", "◉"], ["Students", "♧"], ["My Profile", "☺"]]}>
      {page === "Overview" && (
        <>
          <Hero title="Oversee every service, everywhere." text="Review activity requests from campus offices, create Admin accounts, and monitor volunteer engagement across WMSU." />
          <section className="stats">
            <Stat label="Pending approvals" value={pending.length} detail="Activity requests to review" icon="✓" />
            <Stat label="Admin accounts" value={admins.length} detail="Campus offices" icon="♙" />
            <Stat label="Students" value={students.length} detail="Registered volunteers" icon="♧" />
            <Stat label="Logged hours" value={totalHours} detail="Across all activities" icon="◷" />
          </section>
          <Gallery />
          <div className="two">
            <Panel eyebrow="NEEDS YOUR ATTENTION" title="Awaiting approval" action={<button type="button" className="btn out sm" onClick={() => setPage("Approvals")}>Open approvals →</button>}>
              <Pending list={pending.slice(0, 3)} />
            </Panel>
            <Panel eyebrow="ACTIVITY STATUS" title="Programs at a glance">
              <div className="bars">
                {["Open", "Ongoing", "Completed", "Pending", "Rejected"].map((s) => {
                  const n = acts.filter((a) => a.status === s).length;
                  return <div key={s}><div className="row"><span>{s}</span><b>{n}</b></div><div className="bar"><i style={{ width: `${acts.length ? (n / acts.length) * 100 : 0}%` }} /></div></div>;
                })}
              </div>
            </Panel>
          </div>
        </>
      )}
      {page === "Approvals" && <Panel eyebrow="REVIEW QUEUE" title="Activity requests" sub="Approved activities are published so students can enroll."><Pending list={pending} /></Panel>}
      {page === "Admin Accounts" && (
        <Panel eyebrow="SUPER ADMIN CONSOLE" title="Admin accounts" sub="Only the Super Admin can create accounts for campus offices.">
          <form className="form" onSubmit={addAdmin}>
            <label>Last name<input name="last" required /></label>
            <label>First name<input name="first" required /></label>
            <label>Middle initial (optional)<input name="mi" maxLength={2} /></label>
            <label>Office / department<input name="office" required placeholder="e.g. Office of Student Affairs" /></label>
            <label>WMSU email<input name="email" type="email" required placeholder="office@wmsu.edu.ph" /></label>
            <label>Temporary password<input name="pw" type="text" minLength={8} required /></label>
            <button className="btn sm" type="submit">＋ Create Admin</button>
          </form>
          <div className="tw"><table><thead><tr><th>ADMIN</th><th>OFFICE</th><th>ACTIVITIES</th><th>STATUS</th><th>ACCOUNT</th></tr></thead><tbody>
            {admins.map((u) => <tr key={u.id}><td><strong>{fullName(u)}</strong><small>{u.email}</small></td><td>{u.college}</td><td>{acts.filter((a) => a.by === u.id).length}</td><td><Badge s={u.status === "Active" ? "Open" : "Rejected"} /></td><td><button type="button" className="tb" onClick={() => toggle(u.id)}>{u.status === "Active" ? "Deactivate" : "Activate"}</button></td></tr>)}
            {admins.length === 0 && <Empty cols={5} text="No admin accounts yet." />}
          </tbody></table></div>
        </Panel>
      )}
      {page === "Monitoring" && (
        <Panel eyebrow="LIVE MONITORING" title="All volunteer activities" sub="Track status, enrollment and attendance for every office.">
          <div className="tw"><table><thead><tr><th>ACTIVITY</th><th>OFFICE</th><th>DATE</th><th>ENROLLED</th><th>REQUESTS</th><th>ATTENDED</th><th>STATUS</th></tr></thead><tbody>
            {acts.map((a) => <tr key={a.id}><td><strong>{a.title}</strong><small>{a.category}</small></td><td>{owner(a)?.college}</td><td>{fmtDate(a.date)}</td><td>{accepted(enr, a)} / {a.slots}</td><td>{enr.filter((e) => e.actId === a.id && e.status === "Pending").length}</td><td>{enr.filter((e) => e.actId === a.id && e.attended).length}</td><td><Badge s={a.status} /></td></tr>)}
          </tbody></table></div>
        </Panel>
      )}
      {page === "Students" && (
        <Panel eyebrow="VOLUNTEER REGISTRY" title="Students" sub="Verified volunteer hours per student.">
          <div className="tw"><table><thead><tr><th>STUDENT</th><th>ID NUMBER</th><th>COLLEGE</th><th>ACTIVITIES</th><th>HOURS</th><th>ACCOUNT</th></tr></thead><tbody>
            {students.map((u) => <tr key={u.id}><td><strong>{fullName(u)}</strong><small>{u.email}</small></td><td>{u.idno}</td><td>{u.college}</td><td>{enr.filter((e) => e.userId === u.id && e.status === "Accepted").length}</td><td><b>{hoursOf(enr, u.id)}</b></td><td><button type="button" className="tb" onClick={() => toggle(u.id)}>{u.status === "Active" ? "Deactivate" : "Activate"}</button></td></tr>)}
            {students.length === 0 && <Empty cols={6} text="No students registered yet." />}
          </tbody></table></div>
        </Panel>
      )}
      {page === "My Profile" && <Profile d={d} />}
    </Shell>
  );
}

/* ================= ADMIN ================= */
const blank = { title: "", desc: "", category: CATEGORIES[0], date: "", time: "", endTime: "", location: "", hours: 3, slots: 20 };
function AdminApp({ d, start }) {
  const { users, acts, setActs, enr, setEnr, flash, me } = d;
  const [page, setPage] = useState(start || "Dashboard");
  const [form, setForm] = useState(null);
  const [editId, setEditId] = useState(null);
  const [q, setQ] = useState(""); const [sf, setSf] = useState("All");
  const mine = acts.filter((a) => a.by === me.id);
  const myEnr = enr.filter((e) => mine.some((a) => a.id === e.actId));
  const reqs = myEnr.filter((e) => e.status === "Pending");
  const stu = (id) => users.find((u) => u.id === id);
  const act = (id) => acts.find((a) => a.id === id);
  const shown = mine.filter((a) => (sf === "All" || a.status === sf) && [a.title, a.category, a.location].some((f) => f.toLowerCase().includes(q.trim().toLowerCase())));
  const setF = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  const setTime = (k) => (e) => { const next = { ...form, [k]: e.target.value }; const h = calcHours(next.time, next.endTime); if (h) next.hours = h; setForm(next); };

  function save(e) {
    e.preventDefault();
    if (!form.title.trim() || !form.date || !form.time || !form.endTime || !form.location.trim()) return flash("Please complete the title, date, starting time, ending time and location.", true);
    if (form.endTime <= form.time) return flash("The ending time must be later than the starting time.", true);
    const data = { ...form, title: form.title.trim(), location: form.location.trim(), hours: Number(form.hours) || 1, slots: Number(form.slots) || 1 };
    if (editId) { setActs(acts.map((a) => (a.id === editId ? { ...a, ...data, status: a.status === "Rejected" ? "Pending" : a.status } : a))); flash("Activity updated."); }
    else { setActs([...acts, { ...data, id: nid(acts), status: "Pending", by: me.id }]); flash("Activity submitted to the Super Admin for approval."); }
    setForm(null); setEditId(null);
  }
  function remove(a) {
    if (!window.confirm(`Delete “${a.title}”? Enrollments will be removed too.`)) return;
    setActs(acts.filter((x) => x.id !== a.id)); setEnr(enr.filter((e) => e.actId !== a.id)); flash("Activity deleted.");
  }
  const setStatus = (a, status) => { setActs(acts.map((x) => (x.id === a.id ? { ...x, status } : x))); flash(`Activity marked ${status.toLowerCase()}.`); };
  function respond(e, status) {
    const a = act(e.actId);
    if (status === "Accepted" && accepted(enr, a) >= a.slots) return flash("This activity is already full.", true);
    setEnr(enr.map((x) => (x.id === e.id ? { ...x, status } : x))); flash(`Request ${status.toLowerCase()}.`, status === "Declined");
  }
  const verify = (e) => { setEnr(enr.map((x) => (x.id === e.id ? { ...x, verified: true } : x))); flash("Attendance verified."); };
  const rejectLog = (e) => { setEnr(enr.map((x) => (x.id === e.id ? { ...x, attended: false, hours: 0, verified: false, logDate: "" } : x))); flash("Log rejected. The student can submit it again.", true); };

  return (
    <Shell d={d} page={page} setPage={setPage} nav={[["Dashboard", "▦"], ["My Activities", "◈"], ["Requests", "✉", reqs.length], ["Attendance & Hours", "◷"], ["My Profile", "☺"]]}>
      {page === "Dashboard" && (
        <>
          <Hero title={`Welcome, ${me.first}.`} text="Create volunteer activities, accept student requests, and confirm attendance to log hours.">
            <button type="button" className="btn sm" style={{ position: "relative", zIndex: 1 }} onClick={() => { setForm({ ...blank }); setEditId(null); setPage("My Activities"); }}>＋ Create an activity</button>
          </Hero>
          <section className="stats">
            <Stat label="My activities" value={mine.length} detail="Posted by your office" icon="◈" />
            <Stat label="Awaiting approval" value={mine.filter((a) => a.status === "Pending").length} detail="Sent to Super Admin" icon="⏳" />
            <Stat label="Student requests" value={reqs.length} detail="Waiting for your reply" icon="✉" />
            <Stat label="Hours logged" value={myEnr.filter((e) => e.attended).reduce((s, e) => s + Number(e.hours || 0), 0)} detail="Across your activities" icon="◷" />
          </section>
          <Gallery />
        </>
      )}
      {page === "My Activities" && (
        <Panel eyebrow="PROGRAM MANAGEMENT" title="Volunteer activities" sub="New activities are reviewed by the Super Admin before students can see them."
          action={<button type="button" className="btn sm" onClick={() => { setForm(form ? null : { ...blank }); setEditId(null); }}>{form ? (editId ? "Cancel editing" : "Cancel") : "＋ Add activity"}</button>}>
          {form && (
            <form className="form" onSubmit={save}>
              {editId && <div className="editbar">✎ Editing “{acts.find((a) => a.id === editId)?.title}” — change any detail below, then save.</div>}
              <label className="w">Title<input value={form.title} onChange={setF("title")} placeholder="e.g. Coastal clean-up" /></label>
              <label className="w">Description<textarea value={form.desc} onChange={setF("desc")} placeholder="What will volunteers do?" /></label>
              <label>Category<select value={form.category} onChange={setF("category")}>{CATEGORIES.map((c) => <option key={c}>{c}</option>)}</select></label>
              <label>Location<input value={form.location} onChange={setF("location")} /></label>
              <label>Date<input type="date" value={form.date} onChange={setF("date")} /></label>
              <label>Starting time<input type="time" value={form.time} onChange={setTime("time")} /></label>
              <label>Ending time<input type="time" value={form.endTime} onChange={setTime("endTime")} /></label>
              <label>Service hours (auto from times)<input type="number" min="0.5" step="0.5" value={form.hours} onChange={setF("hours")} /></label>
              <label>Volunteer slots<input type="number" min="1" value={form.slots} onChange={setF("slots")} /></label>
              <button className="btn sm" type="submit">{editId ? "Save changes" : "Submit for approval"}</button>
            </form>
          )}
          <div className="filters"><input aria-label="Search" placeholder="Search activities…" value={q} onChange={(e) => setQ(e.target.value)} />
            <select value={sf} onChange={(e) => setSf(e.target.value)}>{["All", "Pending", "Open", "Ongoing", "Completed", "Rejected"].map((s) => <option key={s}>{s}</option>)}</select></div>
          <div className="tw"><table><thead><tr><th>ACTIVITY</th><th>SCHEDULE</th><th>HOURS</th><th>ENROLLED</th><th>STATUS</th><th>ACTIONS</th></tr></thead><tbody>
            {shown.map((a) => (
              <tr key={a.id}><td><strong>{a.title}</strong><small>{a.category}</small></td><td>{fmtDate(a.date)} · {timeRange(a)}<small>{a.location}</small></td><td>{a.hours}</td><td>{accepted(enr, a)} / {a.slots}</td><td><Badge s={a.status} /></td>
                <td>
                  {a.status === "Open" && <button type="button" className="tb" onClick={() => setStatus(a, "Ongoing")}>Start</button>}
                  {a.status === "Ongoing" && <button type="button" className="tb" onClick={() => setStatus(a, "Completed")}>Complete</button>}
                  <button type="button" className="tb" onClick={() => { setForm({ title: a.title, desc: a.desc, category: a.category, date: a.date, time: a.time, endTime: a.endTime || "", location: a.location, hours: a.hours, slots: a.slots }); setEditId(a.id); window.scrollTo({ top: 0, behavior: "smooth" }); }}>✎ Edit</button>
                  <button type="button" className="tb bad" onClick={() => remove(a)}>Delete</button>
                </td></tr>
            ))}
            {shown.length === 0 && <Empty cols={6} text="No activities found." />}
          </tbody></table></div>
        </Panel>
      )}
      {page === "Requests" && (
        <Panel eyebrow="ENROLLMENT REQUESTS" title="Student requests" sub="Accept or decline students who want to join your activities.">
          <div className="tw"><table><thead><tr><th>STUDENT</th><th>COLLEGE</th><th>ACTIVITY</th><th>STATUS</th><th>DECISION</th></tr></thead><tbody>
            {myEnr.map((e) => (
              <tr key={e.id}><td><strong>{fullName(stu(e.userId))}</strong><small>{stu(e.userId).idno}</small></td><td>{stu(e.userId).college}</td><td>{act(e.actId).title}<small>{fmtDate(act(e.actId).date)}</small></td><td><Badge s={e.status} /></td>
                <td>{e.status === "Pending" ? <><button type="button" className="tb" onClick={() => respond(e, "Accepted")}>✓ Accept</button><button type="button" className="tb bad" onClick={() => respond(e, "Declined")}>✕ Decline</button></> : "—"}</td></tr>
            ))}
            {myEnr.length === 0 && <Empty cols={5} text="No student requests yet." />}
          </tbody></table></div>
        </Panel>
      )}
      {page === "Attendance & Hours" && (
        <Panel eyebrow="ATTENDANCE LOGS" title="Student attendance & hours" sub="Students log their own attendance and hours. Verify each entry, or reject it so the student can resubmit.">
          <div className="tw"><table><thead><tr><th>STUDENT</th><th>ACTIVITY</th><th>LOG DATE</th><th>HOURS</th><th>STATUS</th><th>REVIEW</th></tr></thead><tbody>
            {myEnr.filter((e) => e.status === "Accepted").map((e) => {
              const a = act(e.actId);
              return (
                <tr key={e.id}><td><strong>{fullName(stu(e.userId))}</strong><small>{stu(e.userId).college}</small></td><td>{a.title}<small>{a.status}</small></td>
                  <td>{e.attended ? fmtDate(e.logDate) : "—"}</td><td>{e.attended ? `${e.hours} / ${a.hours}` : "—"}</td>
                  <td>{e.attended ? <Badge s={e.verified ? "Verified" : "Logged"} /> : <small>Not logged yet</small>}</td>
                  <td>{e.attended && !e.verified ? <><button type="button" className="tb" onClick={() => verify(e)}>✓ Verify</button><button type="button" className="tb bad" onClick={() => rejectLog(e)}>✕ Reject</button></> : "—"}</td></tr>
              );
            })}
            {myEnr.filter((e) => e.status === "Accepted").length === 0 && <Empty cols={6} text="No accepted volunteers yet." />}
          </tbody></table></div>
        </Panel>
      )}
      {page === "My Profile" && <Profile d={d} />}
    </Shell>
  );
}

/* ================= STUDENT ================= */
function StudentApp({ d, start }) {
  const { acts, enr, setEnr, flash, me } = d;
  const [page, setPage] = useState(start || "Home");
  const [q, setQ] = useState(""); const [cat, setCat] = useState("All"); const [st, setSt] = useState("All");
  const [logId, setLogId] = useState(null);
  const [log, setLog] = useState({ date: "", hours: "" });
  const [certKey, setCertKey] = useState(null);
  const act = (id) => acts.find((a) => a.id === id);
  const mine = enr.filter((e) => e.userId === me.id && act(e.actId));
  const visible = acts.filter((a) => ["Open", "Ongoing", "Completed"].includes(a.status));
  const logged = mine.filter((e) => e.attended);
  const total = logged.reduce((s, e) => s + Number(e.hours || 0), 0);
  const done = (e) => { const a = act(e.actId); return e.status === "Accepted" && e.attended && a.status === "Completed" && e.hours >= a.hours; };
  const released = mine.filter(done);
  const doneHours = released.reduce((s, e) => s + Number(e.hours), 0);
  const plural = (n, w) => `${n} ${w}${n === 1 ? "" : "s"}`;
  const certs = [
    ...released.map((e) => { const a = act(e.actId); return { key: "e" + e.id, label: a.title, heading: "Certificate of Completion", body: `has successfully completed the volunteer activity “${a.title}”, rendering ${plural(e.hours, "hour")} of service on ${fmtDate(e.logDate || a.date)}.` }; }),
    ...(released.length ? [{ key: "all", label: `Accumulated hours (${doneHours} h)`, heading: "Certificate of Volunteer Service", body: `has rendered ${plural(doneHours, "hour")} of volunteer and community service across ${plural(released.length, "completed activity").replace("activitys", "activities")}.` }] : []),
  ];
  const cert = certs.find((c) => c.key === certKey) || certs[0];
  const list = visible.filter((a) => (cat === "All" || a.category === cat) && (st === "All" || a.status === st) && [a.title, a.desc, a.location].some((f) => f.toLowerCase().includes(q.trim().toLowerCase())));

  function enroll(a) { setEnr([...enr, { id: nid(enr), actId: a.id, userId: me.id, status: "Pending", attended: false, hours: 0 }]); flash("Request sent! The office will review your enrollment."); }
  function cancel(e) { setEnr(enr.filter((x) => x.id !== e.id)); flash("Enrollment request cancelled."); }
  function openLog(e) { const a = act(e.actId); setLogId(e.id); setLog({ date: e.logDate || a.date, hours: e.hours || a.hours }); }
  function submitLog(ev) {
    ev.preventDefault();
    const e = enr.find((x) => x.id === logId), a = act(e.actId), h = Number(log.hours);
    if (!log.date || !(h > 0)) return flash("Enter the date you attended and the hours you worked.", true);
    if (h > a.hours) return flash(`Hours can’t exceed the activity’s ${a.hours} service hour(s).`, true);
    setEnr(enr.map((x) => (x.id === e.id ? { ...x, attended: true, hours: h, logDate: log.date, verified: false } : x)));
    setLogId(null);
    const ok = a.status === "Completed" && h >= a.hours;
    flash(ok ? "Attendance logged — your certificate has been released! 🎓" : "Attendance and hours logged.");
    if (ok) setCertKey("e" + e.id);
  }
  async function pdf() { const c = await drawCertificate(fullName(me), me.college, cert.heading, cert.body); saveBlob(pdfFromCanvas(c), `WMSU-${cert.key}-${me.last}-${me.first}.pdf`.replace(/[^\w.-]+/g, "_")); flash("Certificate PDF downloaded."); }

  const Card = ({ a }) => {
    const e = mine.find((x) => x.actId === a.id), left = a.slots - accepted(enr, a);
    return (
      <article className="card acard">
        <div className="aimg" style={{ backgroundImage: `url(${PHOTO[a.category]})` }}><Badge s={a.status} /></div>
        <div className="abody">
          <span className="eb">{a.category.toUpperCase()}</span><h3>{a.title}</h3><p>{a.desc}</p>
          <div className="meta"><span>📅 {fmtDate(a.date)} · {timeRange(a)}</span><span>📍 {a.location}</span><span>⏱ {plural(a.hours, "service hour")} · {Math.max(left, 0)} slot(s) left</span></div>
          <div className="foot-row">
            {e ? <Badge s={e.status} /> : <span />}
            {e ? (e.status === "Pending" && <button type="button" className="tb bad" onClick={() => cancel(e)}>Cancel</button>)
              : <button type="button" className="btn sm" disabled={a.status !== "Open" || left <= 0} onClick={() => enroll(a)}>{a.status !== "Open" ? "Closed" : left <= 0 ? "Full" : "Enroll"}</button>}
          </div>
        </div>
      </article>
    );
  };

  const logE = logId && enr.find((x) => x.id === logId);
  const logA = logE && act(logE.actId);

  return (
    <div className="stu">
      <nav className="snav noprint" aria-label="Main navigation">
        <div className="brand"><Logo /><div><b>WMSU IMPACT</b><small>Student Portal</small></div></div>
        <div className="tabsbar">{[["Home", "⌂"], ["Activities", "◈"], ["My Enrollments", "✉"], ["Hours & Certificate", "🎓"], ["My Profile", "☺"]].map(([l, i]) => <button key={l} type="button" className={`ni ${page === l ? "on" : ""}`} onClick={() => setPage(l)}><span>{i}</span>{l}</button>)}</div>
        <button type="button" className="av avbtn" title="My profile" onClick={() => setPage("My Profile")}>{initials(me)}</button>
        <button type="button" className="btn out sm" onClick={d.logout}>Log out</button>
      </nav>
      <main className="stu-main">
        {page === "Home" && (
          <>
            <Hero title={`Hello, ${me.first}! Ready to serve?`} text="Browse volunteer activities from campus offices, enroll, log your attendance and hours, and receive your certificate automatically once you finish.">
              <button type="button" className="btn sm" style={{ position: "relative", zIndex: 1 }} onClick={() => setPage("Activities")}>Find an activity →</button>
            </Hero>
            <section className="stats">
              <Stat label="Hours logged" value={total} detail="Your recorded service" icon="◷" />
              <Stat label="Activities joined" value={mine.filter((e) => e.status === "Accepted").length} detail="Accepted enrollments" icon="◈" />
              <Stat label="Pending requests" value={mine.filter((e) => e.status === "Pending").length} detail="Waiting for approval" icon="⏳" />
              <Stat label="Certificates" value={released.length} detail="Released automatically" icon="🎓" />
            </section>
            <div className="sh"><div><span className="eb">OPEN FOR SIGN-UP</span><h2 style={{ fontSize: 20, letterSpacing: "-.04em", margin: "5px 0" }}>Featured activities</h2></div></div>
            <div className="acts">{visible.filter((a) => a.status === "Open").slice(0, 3).map((a) => <Card key={a.id} a={a} />)}</div>
            <div style={{ height: 24 }} /><Gallery />
          </>
        )}
        {page === "Activities" && (
          <Panel eyebrow="VOLUNTEER OPPORTUNITIES" title="Browse activities" sub="Search and filter, then enroll in the services you want to join.">
            <div className="filters"><input aria-label="Search activities" placeholder="Search by title, description or location…" value={q} onChange={(e) => setQ(e.target.value)} />
              <select aria-label="Category" value={cat} onChange={(e) => setCat(e.target.value)}>{["All", ...CATEGORIES].map((c) => <option key={c}>{c}</option>)}</select>
              <select aria-label="Status" value={st} onChange={(e) => setSt(e.target.value)}>{["All", "Open", "Ongoing", "Completed"].map((c) => <option key={c}>{c}</option>)}</select></div>
            <div className="acts">{list.map((a) => <Card key={a.id} a={a} />)}</div>
            {list.length === 0 && <p className="note">No activities match your filters.</p>}
          </Panel>
        )}
        {page === "My Enrollments" && (
          <Panel eyebrow="MY SERVICES" title="My enrollments" sub="Once an activity starts, enter your attendance date and the hours you worked. Your certificate is released automatically after the activity is completed and the full hours are logged.">
            {logE && (
              <form className="form" onSubmit={submitLog}>
                <label className="w">Logging attendance for<input value={logA.title} disabled /></label>
                <label>Date attended<input type="date" value={log.date} onChange={(e) => setLog({ ...log, date: e.target.value })} /></label>
                <label>Hours worked (max {logA.hours})<input type="number" min="0.5" max={logA.hours} step="0.5" value={log.hours} onChange={(e) => setLog({ ...log, hours: e.target.value })} /></label>
                <button className="btn sm" type="submit">Save attendance</button>
                <button className="btn out sm" type="button" onClick={() => setLogId(null)}>Cancel</button>
              </form>
            )}
            <div className="tw"><table><thead><tr><th>ACTIVITY</th><th>SCHEDULE</th><th>REQUEST</th><th>MY ATTENDANCE</th><th>CERTIFICATE</th><th>ACTION</th></tr></thead><tbody>
              {mine.map((e) => {
                const a = act(e.actId), can = a.status === "Ongoing" || a.status === "Completed";
                return (
                  <tr key={e.id}><td><strong>{a.title}</strong><small>{a.category}</small></td><td>{fmtDate(a.date)} · {timeRange(a)}<small>{a.location}</small></td>
                    <td><Badge s={e.status} /><small>Activity: {a.status}</small></td>
                    <td>{e.attended ? <>{e.hours} / {a.hours} h<small>{fmtDate(e.logDate)} · {e.verified ? "Verified" : "Awaiting review"}</small></> : "—"}</td>
                    <td>{done(e) ? <span className="bd ok">🎓 Released</span> : e.status === "Accepted" ? <small>{a.status !== "Completed" ? "Released after completion" : `Log ${a.hours} h to qualify`}</small> : "—"}</td>
                    <td>
                      {e.status === "Pending" && <button type="button" className="tb bad" onClick={() => cancel(e)}>Cancel</button>}
                      {e.status === "Accepted" && !can && <small>Not started</small>}
                      {e.status === "Accepted" && can && !e.verified && <button type="button" className="tb" onClick={() => openLog(e)}>{e.attended ? "Edit log" : "Log attendance"}</button>}
                      {done(e) && <button type="button" className="tb" onClick={() => { setCertKey("e" + e.id); setPage("Hours & Certificate"); }}>View certificate</button>}
                    </td></tr>
                );
              })}
              {mine.length === 0 && <Empty cols={6} text="You haven’t enrolled in any activity yet." />}
            </tbody></table></div>
          </Panel>
        )}
        {page === "Hours & Certificate" && (
          <Panel eyebrow="COMPLETION RECORDS" title="Hours report & certificates" sub={`Total logged: ${plural(total, "hour")} across ${plural(logged.length, "activity").replace("activitys", "activities")}. Certificates use the name and college saved in your profile.`}>
            <div className="tw noprint"><table><thead><tr><th>ACTIVITY</th><th>DATE</th><th>HOURS</th><th>REVIEW</th><th>CERTIFICATE</th></tr></thead><tbody>
              {logged.map((e) => <tr key={e.id}><td><strong>{act(e.actId).title}</strong></td><td>{fmtDate(e.logDate)}</td><td>{e.hours} / {act(e.actId).hours}</td><td><Badge s={e.verified ? "Verified" : "Logged"} /></td><td>{done(e) ? <span className="bd ok">🎓 Released</span> : "—"}</td></tr>)}
              {logged.length === 0 && <Empty cols={5} text="No hours logged yet. Log your attendance under My Enrollments." />}
            </tbody></table></div>
            {cert ? (
              <>
                <div className="chips noprint">{certs.map((c) => <button key={c.key} type="button" className={`chip ${c.key === cert.key ? "on" : ""}`} onClick={() => setCertKey(c.key)}>{c.label}</button>)}</div>
                <div className="cert-bar noprint"><div className="cert-actions">
                  <button type="button" className="btn sm" onClick={() => window.print()}>🖨 Print</button>
                  <button type="button" className="btn out sm" onClick={pdf}>⬇ Download PDF</button></div></div>
                <div className="cert" id="certificate">
                  <div className="wm">WMSU</div><Logo big />
                  <span className="eb">WESTERN MINDANAO STATE UNIVERSITY</span>
                  <h2>{cert.heading}</h2><p>Presented to</p>
                  <div className="nm">{fullName(me)}</div>
                  <p>{me.college}<br />{cert.body}</p>
                  <p>Issued on {new Date().toLocaleDateString("en-PH", { year: "numeric", month: "long", day: "numeric" })}</p>
                  <div className="line">Authorized Signature</div>
                </div>
                <p className="note noprint">Use Print and choose “Save as PDF”, or download the PDF directly.</p>
              </>
            ) : (
              <p className="note" style={{ marginTop: 18 }}>🎓 No certificate yet. It is released automatically once an activity you joined is completed and you have logged its full service hours.</p>
            )}
          </Panel>
        )}
        {page === "My Profile" && <Profile d={d} />}
      </main>
    </div>
  );
}

/* ================= ROOT ================= */
export default function App() {
  const [users, setUsers] = useStored("wmsu_users", seedUsers);
  const [acts, setActs] = useStored("wmsu_acts", seedActs);
  const [enr, setEnr] = useStored("wmsu_enr", seedEnr);
  const [meId, setMeId] = useStored("wmsu_me", null);
  const [notice, setNotice] = useState(null);
  const flash = (message, bad = false) => { setNotice({ message, bad }); window.setTimeout(() => setNotice(null), 3200); };
  const me = users.find((u) => u.id === meId && u.status === "Active");
  const d = { users, setUsers, acts, setActs, enr, setEnr, flash, me, setMeId, logout: () => setMeId(null) };
  return (
    <>
      {notice && <div className={`toast fx ${notice.bad ? "bad" : ""}`} role="status">{notice.message}</div>}
      {!me ? <AuthScreen d={d} /> : me.role === "Super Admin" ? <SuperAdminApp d={d} /> : me.role === "Admin" ? <AdminApp d={d} /> : <StudentApp d={d} />}
    </>
  );
}
