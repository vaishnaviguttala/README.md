import React, { useState, useMemo } from "react";
import {
  Search, MapPin, Briefcase, Building2, Users, FileText, Calendar,
  ChevronRight, ChevronLeft, Plus, Trash2, Pencil, X, Check, Bell,
  LayoutDashboard, LogOut, Sun, Moon, Bookmark, Clock, TrendingUp,
  ArrowRight, Filter, Star
} from "lucide-react";
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";

// ---------- design tokens ----------
const INDIGO = "#4F46E5";
const INDIGO_DEEP = "#3730A3";
const EMERALD = "#059669";
const AMBER = "#D97706";
const ROSE = "#E11D48";
const SLATE900 = "#0F172A";

// ---------- mock data ----------
const COMPANIES = ["Northwind Labs", "Cobalt Systems", "Fernwood Health", "Arcadia Robotics", "Lumen Analytics", "Basecamp Freight"];

const JOB_TITLES = [
  ["Senior Frontend Engineer", "Engineering"],
  ["Product Designer", "Design"],
  ["Backend Engineer (Node.js)", "Engineering"],
  ["Data Analyst", "Data"],
  ["DevOps Engineer", "Engineering"],
  ["Customer Success Manager", "Customer Success"],
  ["QA Automation Engineer", "Engineering"],
  ["Marketing Manager", "Marketing"],
  ["HR Business Partner", "People"],
  ["Sales Development Rep", "Sales"],
];

function seedJobs() {
  return JOB_TITLES.map((([title, dept], i) => ({
    id: `J${1000 + i}`,
    title,
    dept,
    company: COMPANIES[i % COMPANIES.length],
    location: ["Remote", "Austin, TX", "Seattle, WA", "New York, NY", "Bengaluru, IN"][i % 5],
    type: ["Full-time", "Full-time", "Contract", "Full-time", "Part-time"][i % 5],
    salary: 70000 + i * 8500,
    salaryMax: 95000 + i * 9500,
    experience: `${1 + (i % 5)}-${3 + (i % 5)} yrs`,
    skills: [["React", "TypeScript", "CSS"], ["Figma", "User Research"], ["Node.js", "Postgres"], ["SQL", "Python"], ["AWS", "Docker", "Terraform"]][i % 5],
    posted: `${(i % 6) + 1}d ago`,
    status: i === 7 ? "Closed" : "Active",
    applicants: 8 + i * 3,
    description: "We're looking for someone who thrives on solving real problems for real users, and who enjoys working closely with a small, senior team.",
    responsibilities: ["Own features end to end", "Partner with design and product", "Mentor junior teammates", "Improve reliability and performance"],
    qualifications: ["Solid fundamentals in the role's core stack", "Comfortable with ambiguity", "Clear written communication"],
    deadline: "Oct 15, 2026",
  })));
}

const CANDIDATE_NAMES = ["Priya Nair", "Marcus Webb", "Elena Torres", "Sam O'Keefe", "Jae-won Lim", "Fatima Al-Sayed", "Diego Ramos", "Wren Castillo"];

function seedApplications(jobs) {
  const statuses = ["Applied", "Under Review", "Shortlisted", "Interview Scheduled", "Selected", "Rejected"];
  const apps = [];
  let n = 0;
  jobs.slice(0, 8).forEach((job, ji) => {
    const count = 2 + (ji % 3);
    for (let k = 0; k < count; k++) {
      apps.push({
        id: `A${2000 + n}`,
        jobId: job.id,
        jobTitle: job.title,
        company: job.company,
        candidate: CANDIDATE_NAMES[n % CANDIDATE_NAMES.length],
        status: statuses[n % statuses.length],
        appliedAt: `${(n % 20) + 1} Sep 2026`,
      });
      n++;
    }
  });
  return apps;
}

const STATUS_COLOR = {
  Applied: { bg: "#EEF2FF", fg: "#3730A3" },
  "Under Review": { bg: "#FEF3C7", fg: "#92400E" },
  Shortlisted: { bg: "#E0E7FF", fg: "#3730A3" },
  "Interview Scheduled": { bg: "#DBEAFE", fg: "#1E40AF" },
  Selected: { bg: "#D1FAE5", fg: "#065F46" },
  Rejected: { bg: "#FEE2E2", fg: "#991B1B" },
  Active: { bg: "#D1FAE5", fg: "#065F46" },
  Closed: { bg: "#F1F5F9", fg: "#475569" },
  Scheduled: { bg: "#DBEAFE", fg: "#1E40AF" },
  Completed: { bg: "#F1F5F9", fg: "#475569" },
  Passed: { bg: "#D1FAE5", fg: "#065F46" },
  Failed: { bg: "#FEE2E2", fg: "#991B1B" },
};

function StatusBadge({ status }) {
  const c = STATUS_COLOR[status] || { bg: "#F1F5F9", fg: "#334155" };
  return (
    <span
      className="text-xs font-medium px-2.5 py-1 rounded-full whitespace-nowrap"
      style={{ background: c.bg, color: c.fg }}
    >
      {status}
    </span>
  );
}

// ---------- shared bits ----------
function Logo({ dark }) {
  return (
    <div className="flex items-center gap-2">
      <div
        className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-white text-sm"
        style={{ background: `linear-gradient(135deg, ${INDIGO}, ${INDIGO_DEEP})` }}
      >
        H
      </div>
      <span className={`font-bold text-lg tracking-tight ${dark ? "text-white" : "text-slate-900"}`} style={{ fontFamily: "Sora, sans-serif" }}>
        HireHub
      </span>
    </div>
  );
}

function PrimaryButton({ children, onClick, className = "", type = "button", full }) {
  return (
    <button
      type={type}
      onClick={onClick}
      className={`px-4 py-2.5 rounded-lg text-white text-sm font-semibold transition-transform active:scale-[0.98] hover:brightness-110 ${full ? "w-full" : ""} ${className}`}
      style={{ background: INDIGO }}
    >
      {children}
    </button>
  );
}

function GhostButton({ children, onClick, className = "" }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2.5 rounded-lg text-sm font-semibold border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors ${className}`}
    >
      {children}
    </button>
  );
}

function JobCard({ job, onView, onSave, saved, onApply }) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start gap-3">
        <div className="flex gap-3">
          <div className="w-11 h-11 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold shrink-0">
            {job.company.charAt(0)}
          </div>
          <div>
            <h3 className="font-semibold text-slate-900 leading-snug">{job.title}</h3>
            <p className="text-sm text-slate-500">{job.company} · {job.location}</p>
          </div>
        </div>
        <button onClick={() => onSave(job.id)} aria-label="Save job">
          <Bookmark size={18} className={saved ? "fill-indigo-600 text-indigo-600" : "text-slate-300"} />
        </button>
      </div>
      <div className="flex flex-wrap gap-1.5 mt-3">
        {job.skills.map((s) => (
          <span key={s} className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-md">{s}</span>
        ))}
      </div>
      <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100">
        <div className="text-sm">
          <p className="font-semibold text-slate-900">${(job.salary / 1000).toFixed(0)}k – ${(job.salaryMax / 1000).toFixed(0)}k</p>
          <p className="text-xs text-slate-400">{job.experience} · {job.posted}</p>
        </div>
        <div className="flex gap-2">
          <GhostButton onClick={() => onView(job)} className="!px-3 !py-2">Details</GhostButton>
          <PrimaryButton onClick={() => onApply(job)} className="!px-3 !py-2">Apply</PrimaryButton>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ label, value, icon: Icon, tint }) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 flex items-center gap-3">
      <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ background: tint + "1A", color: tint }}>
        <Icon size={19} />
      </div>
      <div>
        <p className="text-xs text-slate-500">{label}</p>
        <p className="text-xl font-bold text-slate-900" style={{ fontFamily: "Sora, sans-serif" }}>{value}</p>
      </div>
    </div>
  );
}

function Modal({ title, onClose, children, wide }) {
  return (
    <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div
        className={`bg-white rounded-2xl p-6 w-full ${wide ? "max-w-2xl" : "max-w-md"} max-h-[85vh] overflow-y-auto`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-lg text-slate-900" style={{ fontFamily: "Sora, sans-serif" }}>{title}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

function Field({ label, ...props }) {
  return (
    <label className="block mb-3">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      <input
        {...props}
        className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500"
      />
    </label>
  );
}

// ---------- sidebar layout for app screens ----------
function AppShell({ role, active, onNav, onLogout, children, name }) {
  const navs = {
    candidate: [
      ["dashboard", "Dashboard", LayoutDashboard],
      ["jobs", "Find jobs", Search],
      ["applications", "My applications", FileText],
      ["interviews", "Interviews", Calendar],
      ["profile", "Profile", Users],
    ],
    recruiter: [
      ["dashboard", "Dashboard", LayoutDashboard],
      ["jobs", "Job postings", Briefcase],
      ["applications", "Applications", FileText],
      ["interviews", "Interviews", Calendar],
    ],
    admin: [
      ["dashboard", "Dashboard", LayoutDashboard],
      ["users", "Users", Users],
      ["jobs", "Jobs", Briefcase],
      ["applications", "Applications", FileText],
      ["reports", "Reports", TrendingUp],
    ],
  }[role];

  return (
    <div className="min-h-screen flex bg-slate-50">
      <aside className="w-60 bg-white border-r border-slate-200 flex flex-col shrink-0">
        <div className="p-5 border-b border-slate-100"><Logo /></div>
        <nav className="flex-1 p-3 space-y-1">
          {navs.map(([key, label, Icon]) => (
            <button
              key={key}
              onClick={() => onNav(key)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                active === key ? "bg-indigo-50 text-indigo-700" : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              <Icon size={18} />
              {label}
            </button>
          ))}
        </nav>
        <div className="p-3 border-t border-slate-100">
          <div className="flex items-center gap-2 px-2 py-2">
            <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-bold">
              {name.split(" ").map((p) => p[0]).join("").slice(0, 2)}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-slate-800 truncate">{name}</p>
              <p className="text-xs text-slate-400 capitalize">{role}</p>
            </div>
          </div>
          <button onClick={onLogout} className="w-full flex items-center gap-2 px-3 py-2 mt-1 text-sm text-slate-500 hover:bg-slate-50 rounded-lg">
            <LogOut size={16} /> Log out
          </button>
        </div>
      </aside>
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-6xl mx-auto p-8">{children}</div>
      </main>
    </div>
  );
}

function PageHeader({ title, subtitle, action }) {
  return (
    <div className="flex items-start justify-between mb-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900" style={{ fontFamily: "Sora, sans-serif" }}>{title}</h1>
        {subtitle && <p className="text-sm text-slate-500 mt-1">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

// ---------- LANDING ----------
function Landing({ goto }) {
  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Logo />
          <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-600">
            <a href="#jobs" className="hover:text-slate-900">Find jobs</a>
            <a href="#companies" className="hover:text-slate-900">Companies</a>
            <a href="#how" className="hover:text-slate-900">How it works</a>
          </nav>
          <div className="flex items-center gap-2">
            <GhostButton onClick={() => goto("login")}>Log in</GhostButton>
            <PrimaryButton onClick={() => goto("register")}>Post a job</PrimaryButton>
          </div>
        </div>
      </header>

      <section className="max-w-4xl mx-auto px-6 pt-20 pb-14 text-center">
        <h1 className="text-5xl font-bold text-slate-900 leading-[1.1] mb-5" style={{ fontFamily: "Sora, sans-serif" }}>
          Find your dream job today
        </h1>
        <p className="text-lg text-slate-500 max-w-xl mx-auto mb-9">
          HireHub connects candidates with roles that fit, and helps recruiters find talent worth hiring.
        </p>
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-2 flex flex-col sm:flex-row gap-2 max-w-2xl mx-auto">
          <div className="flex items-center gap-2 flex-1 px-3">
            <Search size={18} className="text-slate-400" />
            <input placeholder="Job title or skill" className="w-full py-3 text-sm focus:outline-none" />
          </div>
          <div className="hidden sm:block w-px bg-slate-200" />
          <div className="flex items-center gap-2 flex-1 px-3">
            <MapPin size={18} className="text-slate-400" />
            <input placeholder="Location" className="w-full py-3 text-sm focus:outline-none" />
          </div>
          <PrimaryButton onClick={() => goto("login")} className="sm:!px-6">Search jobs</PrimaryButton>
        </div>
        <div className="flex justify-center gap-8 mt-8 text-sm text-slate-400">
          <span>Popular: Frontend Engineer</span>
          <span>Product Designer</span>
          <span>Data Analyst</span>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 py-14 grid grid-cols-2 sm:grid-cols-4 gap-6 text-center border-y border-slate-100">
        {[["12,400+", "Active jobs"], ["3,200+", "Companies hiring"], ["58,000+", "Candidates"], ["9,100+", "Hires made"]].map(([n, l]) => (
          <div key={l}>
            <p className="text-3xl font-bold text-slate-900" style={{ fontFamily: "Sora, sans-serif" }}>{n}</p>
            <p className="text-sm text-slate-500 mt-1">{l}</p>
          </div>
        ))}
      </section>

      <section id="jobs" className="max-w-6xl mx-auto px-6 py-16">
        <div className="flex items-center justify-between mb-7">
          <h2 className="text-2xl font-bold text-slate-900" style={{ fontFamily: "Sora, sans-serif" }}>Featured jobs</h2>
          <button onClick={() => goto("login")} className="text-sm font-semibold text-indigo-600 flex items-center gap-1">
            View all <ArrowRight size={15} />
          </button>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {seedJobs().slice(0, 6).map((j) => (
            <div key={j.id} className="border border-slate-200 rounded-xl p-5">
              <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold mb-3">
                {j.company.charAt(0)}
              </div>
              <h3 className="font-semibold text-slate-900">{j.title}</h3>
              <p className="text-sm text-slate-500 mb-3">{j.company} · {j.location}</p>
              <p className="text-sm font-medium text-slate-700">${(j.salary / 1000).toFixed(0)}k – ${(j.salaryMax / 1000).toFixed(0)}k</p>
            </div>
          ))}
        </div>
      </section>

      <section id="how" className="bg-slate-50 py-16">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-2xl font-bold text-slate-900 text-center mb-10" style={{ fontFamily: "Sora, sans-serif" }}>How it works</h2>
          <div className="grid sm:grid-cols-3 gap-6">
            {[
              ["Create a profile", "Add your skills, experience and resume in minutes."],
              ["Apply with one click", "Search roles that match, and track every application."],
              ["Get hired", "Recruiters shortlist, schedule interviews, and make offers."],
            ].map(([t, d], i) => (
              <div key={t} className="bg-white rounded-xl p-6 border border-slate-200">
                <div className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm mb-4" style={{ background: INDIGO }}>{i + 1}</div>
                <h3 className="font-semibold text-slate-900 mb-1.5">{t}</h3>
                <p className="text-sm text-slate-500">{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-6 py-16 text-center">
        <h2 className="text-2xl font-bold text-slate-900 mb-3" style={{ fontFamily: "Sora, sans-serif" }}>Ready to get started?</h2>
        <p className="text-slate-500 mb-6">Join thousands of candidates and recruiters already using HireHub.</p>
        <div className="flex justify-center gap-3">
          <PrimaryButton onClick={() => goto("register")}>Create free account</PrimaryButton>
          <GhostButton onClick={() => goto("login")}>Log in</GhostButton>
        </div>
      </section>

      <footer className="border-t border-slate-100 py-8">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <Logo />
          <p className="text-sm text-slate-400">© 2026 HireHub. Demo interface — sample data shown.</p>
        </div>
      </footer>
    </div>
  );
}

// ---------- AUTH ----------
function Auth({ mode, goto, onLogin }) {
  const [role, setRole] = useState("candidate");
  const [name, setName] = useState("");

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-6"><Logo /></div>
        <div className="bg-white border border-slate-200 rounded-2xl p-7 shadow-sm">
          <h1 className="text-xl font-bold text-slate-900 mb-1" style={{ fontFamily: "Sora, sans-serif" }}>
            {mode === "login" ? "Welcome back" : "Create your account"}
          </h1>
          <p className="text-sm text-slate-500 mb-5">
            {mode === "login" ? "Log in to continue to HireHub." : "Join HireHub as a candidate or recruiter."}
          </p>

          {mode === "register" && (
            <div className="flex gap-2 mb-4">
              {["candidate", "recruiter"].map((r) => (
                <button
                  key={r}
                  onClick={() => setRole(r)}
                  className={`flex-1 py-2.5 rounded-lg text-sm font-semibold capitalize border ${
                    role === r ? "border-indigo-600 bg-indigo-50 text-indigo-700" : "border-slate-200 text-slate-500"
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          )}

          <form
            onSubmit={(e) => {
              e.preventDefault();
              onLogin(role, name || (role === "recruiter" ? "Jordan Lee" : "Alex Rivera"));
            }}
          >
            {mode === "register" && (
              <Field label="Full name" placeholder="Alex Rivera" value={name} onChange={(e) => setName(e.target.value)} />
            )}
            <Field label="Email" type="email" placeholder="you@example.com" defaultValue="you@example.com" />
            <Field label="Password" type="password" placeholder="••••••••" defaultValue="password" />
            {mode === "login" && (
              <div className="flex justify-end mb-2">
                <button type="button" onClick={() => goto("forgot")} className="text-xs font-medium text-indigo-600">Forgot password?</button>
              </div>
            )}
            <PrimaryButton type="submit" full className="mt-2">{mode === "login" ? "Log in" : "Create account"}</PrimaryButton>
          </form>

          <div className="my-4 border-t border-slate-100" />
          <p className="text-sm text-center text-slate-500">
            {mode === "login" ? (
              <>New here? <button onClick={() => goto("register")} className="text-indigo-600 font-semibold">Create an account</button></>
            ) : (
              <>Already have an account? <button onClick={() => goto("login")} className="text-indigo-600 font-semibold">Log in</button></>
            )}
          </p>
          <p className="text-xs text-center text-slate-400 mt-3">
            Try admin access: <button onClick={() => onLogin("admin", "Morgan Blake")} className="text-indigo-600 font-medium">continue as admin</button>
          </p>
        </div>
        <button onClick={() => goto("landing")} className="w-full text-center text-sm text-slate-400 mt-5">← Back to home</button>
      </div>
    </div>
  );
}

// ---------- CANDIDATE ----------
function CandidateDashboard({ user, applications, jobs, goto }) {
  const mine = applications.filter((a) => a.candidate === user.name || true).slice(0, 5);
  return (
    <>
      <PageHeader title={`Welcome back, ${user.name.split(" ")[0]}`} subtitle="Here's what's happening with your job search." />
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <MetricCard label="Applied jobs" value="6" icon={FileText} tint={INDIGO} />
        <MetricCard label="Saved jobs" value="4" icon={Bookmark} tint={AMBER} />
        <MetricCard label="Interviews" value="2" icon={Calendar} tint={EMERALD} />
        <MetricCard label="Profile views" value="18" icon={TrendingUp} tint={ROSE} />
      </div>
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-slate-900">Recent applications</h3>
            <button onClick={() => goto("applications")} className="text-xs font-semibold text-indigo-600">View all</button>
          </div>
          <div className="divide-y divide-slate-100">
            {mine.map((a) => (
              <div key={a.id} className="flex items-center justify-between py-3">
                <div>
                  <p className="text-sm font-medium text-slate-800">{a.jobTitle}</p>
                  <p className="text-xs text-slate-400">{a.company} · Applied {a.appliedAt}</p>
                </div>
                <StatusBadge status={a.status} />
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <h3 className="font-semibold text-slate-900 mb-3">Upcoming interviews</h3>
          <div className="space-y-3">
            <div className="p-3 bg-slate-50 rounded-lg">
              <p className="text-sm font-medium text-slate-800">Backend Engineer — Cobalt Systems</p>
              <p className="text-xs text-slate-400 mt-0.5">Sep 16, 2026 · 3:00 PM · Video call</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg">
              <p className="text-sm font-medium text-slate-800">Data Analyst — Lumen Analytics</p>
              <p className="text-xs text-slate-400 mt-0.5">Sep 19, 2026 · 11:30 AM · Video call</p>
            </div>
          </div>
          <button onClick={() => goto("jobs")} className="w-full mt-4 text-sm font-semibold text-indigo-600 flex items-center justify-center gap-1">
            Browse recommended jobs <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </>
  );
}

function JobsBrowse({ jobs, savedIds, onSave, onView, onApply }) {
  const [q, setQ] = useState("");
  const [loc, setLoc] = useState("all");
  const filtered = jobs.filter((j) =>
    (j.title.toLowerCase().includes(q.toLowerCase()) || j.skills.some((s) => s.toLowerCase().includes(q.toLowerCase()))) &&
    (loc === "all" || j.location === loc)
  );
  const locations = ["all", ...new Set(jobs.map((j) => j.location))];

  return (
    <>
      <PageHeader title="Find jobs" subtitle={`${filtered.length} open roles matching your search`} />
      <div className="bg-white border border-slate-200 rounded-xl p-3 flex flex-col sm:flex-row gap-2 mb-6">
        <div className="flex items-center gap-2 flex-1 px-2">
          <Search size={16} className="text-slate-400" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Job title or skill" className="w-full py-2 text-sm focus:outline-none" />
        </div>
        <select value={loc} onChange={(e) => setLoc(e.target.value)} className="border border-slate-200 rounded-lg px-3 py-2 text-sm">
          {locations.map((l) => <option key={l} value={l}>{l === "all" ? "All locations" : l}</option>)}
        </select>
        <GhostButton className="flex items-center gap-1.5 !py-2"><Filter size={14} /> More filters</GhostButton>
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        {filtered.map((j) => (
          <JobCard key={j.id} job={j} onView={onView} onSave={onSave} saved={savedIds.includes(j.id)} onApply={onApply} />
        ))}
      </div>
      {filtered.length === 0 && <p className="text-center text-slate-400 py-16">No jobs match your search — try a different keyword.</p>}
    </>
  );
}

function JobDetails({ job, onBack, onApply, saved, onSave }) {
  if (!job) return null;
  return (
    <>
      <button onClick={onBack} className="flex items-center gap-1 text-sm text-slate-500 mb-5"><ChevronLeft size={16} /> Back to jobs</button>
      <div className="bg-white border border-slate-200 rounded-xl p-7">
        <div className="flex items-start justify-between gap-4">
          <div className="flex gap-4">
            <div className="w-14 h-14 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold text-xl shrink-0">
              {job.company.charAt(0)}
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900" style={{ fontFamily: "Sora, sans-serif" }}>{job.title}</h1>
              <p className="text-slate-500 mt-1">{job.company} · {job.location} · {job.type}</p>
              <div className="flex flex-wrap gap-1.5 mt-3">
                {job.skills.map((s) => <span key={s} className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-md">{s}</span>)}
              </div>
            </div>
          </div>
          <div className="flex gap-2 shrink-0">
            <GhostButton onClick={() => onSave(job.id)}>{saved ? "Saved" : "Save job"}</GhostButton>
            <PrimaryButton onClick={() => onApply(job)}>Apply now</PrimaryButton>
          </div>
        </div>

        <div className="grid sm:grid-cols-3 gap-4 my-6 py-5 border-y border-slate-100">
          <div><p className="text-xs text-slate-400">Salary range</p><p className="font-semibold text-slate-800">${(job.salary/1000).toFixed(0)}k – ${(job.salaryMax/1000).toFixed(0)}k</p></div>
          <div><p className="text-xs text-slate-400">Experience</p><p className="font-semibold text-slate-800">{job.experience}</p></div>
          <div><p className="text-xs text-slate-400">Application deadline</p><p className="font-semibold text-slate-800">{job.deadline}</p></div>
        </div>

        <h3 className="font-semibold text-slate-900 mb-2">About the role</h3>
        <p className="text-sm text-slate-600 mb-5">{job.description}</p>

        <h3 className="font-semibold text-slate-900 mb-2">Responsibilities</h3>
        <ul className="text-sm text-slate-600 space-y-1.5 mb-5 list-disc pl-5">
          {job.responsibilities.map((r) => <li key={r}>{r}</li>)}
        </ul>

        <h3 className="font-semibold text-slate-900 mb-2">Qualifications</h3>
        <ul className="text-sm text-slate-600 space-y-1.5 list-disc pl-5">
          {job.qualifications.map((r) => <li key={r}>{r}</li>)}
        </ul>
      </div>
    </>
  );
}

function CandidateApplications({ applications }) {
  return (
    <>
      <PageHeader title="My applications" subtitle={`${applications.length} applications tracked`} />
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-500 text-xs uppercase">
            <tr>
              <th className="text-left px-5 py-3 font-medium">Job</th>
              <th className="text-left px-5 py-3 font-medium">Company</th>
              <th className="text-left px-5 py-3 font-medium">Applied</th>
              <th className="text-left px-5 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {applications.map((a) => (
              <tr key={a.id}>
                <td className="px-5 py-3.5 font-medium text-slate-800">{a.jobTitle}</td>
                <td className="px-5 py-3.5 text-slate-500">{a.company}</td>
                <td className="px-5 py-3.5 text-slate-500">{a.appliedAt}</td>
                <td className="px-5 py-3.5"><StatusBadge status={a.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

function CandidateProfile({ user }) {
  return (
    <>
      <PageHeader title="Profile" subtitle="Keep your profile up to date to get matched with better roles." />
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="bg-white border border-slate-200 rounded-xl p-6 text-center h-fit">
          <div className="w-20 h-20 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-2xl font-bold mx-auto mb-3">
            {user.name.split(" ").map((p) => p[0]).join("")}
          </div>
          <h3 className="font-semibold text-slate-900">{user.name}</h3>
          <p className="text-sm text-slate-500">Frontend Engineer</p>
          <GhostButton className="w-full mt-4 flex items-center justify-center gap-1.5"><FileText size={14} /> Upload resume</GhostButton>
        </div>
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <h3 className="font-semibold text-slate-900 mb-3">Personal information</h3>
            <div className="grid sm:grid-cols-2 gap-3">
              <Field label="Full name" defaultValue={user.name} />
              <Field label="Location" defaultValue="Austin, TX" />
              <Field label="Phone" defaultValue="+1 (512) 555-0134" />
              <Field label="Email" defaultValue="alex.rivera@example.com" />
            </div>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <h3 className="font-semibold text-slate-900 mb-3">Skills</h3>
            <div className="flex flex-wrap gap-2">
              {["React", "TypeScript", "Tailwind CSS", "Node.js", "GraphQL"].map((s) => (
                <span key={s} className="text-xs bg-indigo-50 text-indigo-700 px-2.5 py-1.5 rounded-md flex items-center gap-1">
                  {s} <X size={12} className="cursor-pointer" />
                </span>
              ))}
              <button className="text-xs text-indigo-600 font-semibold flex items-center gap-1"><Plus size={13} /> Add skill</button>
            </div>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <h3 className="font-semibold text-slate-900 mb-3">Experience</h3>
            <div className="border-l-2 border-indigo-100 pl-4 space-y-4">
              <div>
                <p className="text-sm font-medium text-slate-800">Frontend Engineer — Basecamp Freight</p>
                <p className="text-xs text-slate-400">2023 – Present</p>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-800">UI Developer — Fernwood Health</p>
                <p className="text-xs text-slate-400">2020 – 2023</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// ---------- RECRUITER ----------
function RecruiterDashboard({ jobs, applications }) {
  const chartData = [
    { name: "Apr", jobs: 4, apps: 22 }, { name: "May", jobs: 6, apps: 31 },
    { name: "Jun", jobs: 5, apps: 27 }, { name: "Jul", jobs: 8, apps: 44 },
    { name: "Aug", jobs: 7, apps: 39 }, { name: "Sep", jobs: 9, apps: 51 },
  ];
  return (
    <>
      <PageHeader title="Recruiter dashboard" subtitle="Overview of your job postings and pipeline." />
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
        <MetricCard label="Total jobs" value={jobs.length} icon={Briefcase} tint={INDIGO} />
        <MetricCard label="Active jobs" value={jobs.filter((j) => j.status === "Active").length} icon={TrendingUp} tint={EMERALD} />
        <MetricCard label="Applications" value={applications.length} icon={FileText} tint={AMBER} />
        <MetricCard label="Shortlisted" value={applications.filter((a) => a.status === "Shortlisted").length} icon={Star} tint={ROSE} />
        <MetricCard label="Interviews" value="5" icon={Calendar} tint={INDIGO} />
        <MetricCard label="Selected" value={applications.filter((a) => a.status === "Selected").length} icon={Check} tint={EMERALD} />
      </div>
      <div className="bg-white border border-slate-200 rounded-xl p-5">
        <h3 className="font-semibold text-slate-900 mb-4">Applications over time</h3>
        <div style={{ width: "100%", height: 260 }}>
          <ResponsiveContainer>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="#94A3B8" />
              <YAxis tick={{ fontSize: 12 }} stroke="#94A3B8" />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="apps" name="Applications" stroke={INDIGO} strokeWidth={2.5} dot={false} />
              <Line type="monotone" dataKey="jobs" name="Jobs posted" stroke={EMERALD} strokeWidth={2.5} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </>
  );
}

function RecruiterJobs({ jobs, setJobs }) {
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({ title: "", company: "", location: "", type: "Full-time", salary: "", experience: "", skills: "" });

  const openNew = () => { setForm({ title: "", company: "", location: "", type: "Full-time", salary: "", experience: "", skills: "" }); setModal("new"); };

  const save = () => {
    const newJob = {
      id: `J${1000 + jobs.length + Math.floor(Math.random() * 900)}`,
      title: form.title || "Untitled role",
      company: form.company || "Your company",
      location: form.location || "Remote",
      type: form.type,
      salary: Number(form.salary) || 60000,
      salaryMax: (Number(form.salary) || 60000) + 20000,
      experience: form.experience || "1-3 yrs",
      skills: form.skills.split(",").map((s) => s.trim()).filter(Boolean),
      posted: "Just now",
      status: "Active",
      applicants: 0,
      dept: "General",
      description: "Newly posted role — description coming soon.",
      responsibilities: ["To be defined"],
      qualifications: ["To be defined"],
      deadline: "TBD",
    };
    setJobs([newJob, ...jobs]);
    setModal(null);
  };

  const toggleClose = (id) => setJobs(jobs.map((j) => j.id === id ? { ...j, status: j.status === "Active" ? "Closed" : "Active" } : j));
  const remove = (id) => setJobs(jobs.filter((j) => j.id !== id));

  return (
    <>
      <PageHeader title="Job postings" subtitle="Create and manage your open roles." action={
        <PrimaryButton onClick={openNew} className="flex items-center gap-1.5"><Plus size={16} /> Post a job</PrimaryButton>
      } />
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-500 text-xs uppercase">
            <tr>
              <th className="text-left px-5 py-3 font-medium">Title</th>
              <th className="text-left px-5 py-3 font-medium">Location</th>
              <th className="text-left px-5 py-3 font-medium">Applicants</th>
              <th className="text-left px-5 py-3 font-medium">Status</th>
              <th className="text-right px-5 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {jobs.map((j) => (
              <tr key={j.id}>
                <td className="px-5 py-3.5 font-medium text-slate-800">{j.title}</td>
                <td className="px-5 py-3.5 text-slate-500">{j.location}</td>
                <td className="px-5 py-3.5 text-slate-500">{j.applicants}</td>
                <td className="px-5 py-3.5"><StatusBadge status={j.status} /></td>
                <td className="px-5 py-3.5">
                  <div className="flex justify-end gap-3 text-slate-400">
                    <button onClick={() => toggleClose(j.id)} title="Toggle status"><Pencil size={15} /></button>
                    <button onClick={() => remove(j.id)} title="Delete"><Trash2 size={15} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modal === "new" && (
        <Modal title="Post a new job" onClose={() => setModal(null)} wide>
          <div className="grid sm:grid-cols-2 gap-x-3">
            <Field label="Job title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Senior Frontend Engineer" />
            <Field label="Company name" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} placeholder="Acme Inc." />
            <Field label="Location" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="Remote" />
            <Field label="Experience required" value={form.experience} onChange={(e) => setForm({ ...form, experience: e.target.value })} placeholder="2-4 yrs" />
            <Field label="Salary (min, USD)" type="number" value={form.salary} onChange={(e) => setForm({ ...form, salary: e.target.value })} placeholder="80000" />
            <Field label="Skills (comma separated)" value={form.skills} onChange={(e) => setForm({ ...form, skills: e.target.value })} placeholder="React, TypeScript" />
          </div>
          <div className="flex justify-end gap-2 mt-2">
            <GhostButton onClick={() => setModal(null)}>Cancel</GhostButton>
            <PrimaryButton onClick={save}>Publish job</PrimaryButton>
          </div>
        </Modal>
      )}
    </>
  );
}

function RecruiterApplications({ applications, setApplications }) {
  const [scheduling, setScheduling] = useState(null);
  const updateStatus = (id, status) => setApplications(applications.map((a) => a.id === id ? { ...a, status } : a));

  return (
    <>
      <PageHeader title="Applications" subtitle="Review, shortlist, and move candidates forward." />
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-500 text-xs uppercase">
            <tr>
              <th className="text-left px-5 py-3 font-medium">Candidate</th>
              <th className="text-left px-5 py-3 font-medium">Job</th>
              <th className="text-left px-5 py-3 font-medium">Applied</th>
              <th className="text-left px-5 py-3 font-medium">Status</th>
              <th className="text-right px-5 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {applications.map((a) => (
              <tr key={a.id}>
                <td className="px-5 py-3.5 font-medium text-slate-800">{a.candidate}</td>
                <td className="px-5 py-3.5 text-slate-500">{a.jobTitle}</td>
                <td className="px-5 py-3.5 text-slate-500">{a.appliedAt}</td>
                <td className="px-5 py-3.5"><StatusBadge status={a.status} /></td>
                <td className="px-5 py-3.5">
                  <div className="flex justify-end gap-2">
                    <select
                      value={a.status}
                      onChange={(e) => updateStatus(a.id, e.target.value)}
                      className="text-xs border border-slate-200 rounded-md px-2 py-1"
                    >
                      {["Applied", "Under Review", "Shortlisted", "Interview Scheduled", "Selected", "Rejected"].map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                    <button onClick={() => setScheduling(a)} className="text-xs font-semibold text-indigo-600">Schedule</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {scheduling && (
        <Modal title={`Schedule interview — ${scheduling.candidate}`} onClose={() => setScheduling(null)}>
          <Field label="Date" type="date" defaultValue="2026-09-18" />
          <Field label="Time" type="time" defaultValue="14:00" />
          <Field label="Meeting link" placeholder="https://meet.example.com/..." />
          <label className="block mb-3">
            <span className="text-sm font-medium text-slate-700">Notes</span>
            <textarea className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" rows={3} placeholder="Interview focus, panel members..." />
          </label>
          <div className="flex justify-end gap-2">
            <GhostButton onClick={() => setScheduling(null)}>Cancel</GhostButton>
            <PrimaryButton onClick={() => { updateStatus(scheduling.id, "Interview Scheduled"); setScheduling(null); }}>Confirm interview</PrimaryButton>
          </div>
        </Modal>
      )}
    </>
  );
}

function InterviewsList({ role }) {
  const rows = [
    { candidate: "Priya Nair", job: "Senior Frontend Engineer", date: "Sep 16, 2026", time: "3:00 PM", status: "Scheduled" },
    { candidate: "Marcus Webb", job: "Data Analyst", date: "Sep 19, 2026", time: "11:30 AM", status: "Scheduled" },
    { candidate: "Elena Torres", job: "Backend Engineer (Node.js)", date: "Sep 10, 2026", time: "2:00 PM", status: "Completed" },
    { candidate: "Sam O'Keefe", job: "Product Designer", date: "Sep 8, 2026", time: "10:00 AM", status: "Passed" },
  ];
  return (
    <>
      <PageHeader title="Interviews" subtitle="Track scheduled and completed interviews." />
      <div className="grid sm:grid-cols-2 gap-4">
        {rows.map((r) => (
          <div key={r.candidate + r.job} className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="flex justify-between items-start mb-2">
              <div>
                <p className="font-semibold text-slate-900">{role === "candidate" ? r.job : r.candidate}</p>
                <p className="text-sm text-slate-500">{role === "candidate" ? r.candidate : r.job}</p>
              </div>
              <StatusBadge status={r.status} />
            </div>
            <div className="flex items-center gap-4 text-sm text-slate-500 mt-3 pt-3 border-t border-slate-100">
              <span className="flex items-center gap-1.5"><Calendar size={14} /> {r.date}</span>
              <span className="flex items-center gap-1.5"><Clock size={14} /> {r.time}</span>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

// ---------- ADMIN ----------
function AdminDashboard({ jobs, applications }) {
  const pie = [
    { name: "Candidates", value: 4210, color: INDIGO },
    { name: "Recruiters", value: 380, color: EMERALD },
    { name: "Admins", value: 6, color: AMBER },
  ];
  const growth = [
    { m: "Apr", users: 3200 }, { m: "May", users: 3520 }, { m: "Jun", users: 3810 },
    { m: "Jul", users: 4120 }, { m: "Aug", users: 4390 }, { m: "Sep", users: 4596 },
  ];
  return (
    <>
      <PageHeader title="Admin dashboard" subtitle="Platform-wide activity at a glance." />
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <MetricCard label="Total users" value="4,596" icon={Users} tint={INDIGO} />
        <MetricCard label="Total recruiters" value="380" icon={Building2} tint={EMERALD} />
        <MetricCard label="Total candidates" value="4,210" icon={Users} tint={AMBER} />
        <MetricCard label="Total jobs" value={jobs.length} icon={Briefcase} tint={ROSE} />
        <MetricCard label="Applications" value={applications.length} icon={FileText} tint={INDIGO} />
        <MetricCard label="Selected" value={applications.filter((a) => a.status === "Selected").length} icon={Check} tint={EMERALD} />
        <MetricCard label="Rejected" value={applications.filter((a) => a.status === "Rejected").length} icon={X} tint={ROSE} />
        <MetricCard label="Interviews" value="128" icon={Calendar} tint={AMBER} />
      </div>
      <div className="grid lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3 bg-white border border-slate-200 rounded-xl p-5">
          <h3 className="font-semibold text-slate-900 mb-4">User growth</h3>
          <div style={{ width: "100%", height: 240 }}>
            <ResponsiveContainer>
              <BarChart data={growth}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="m" tick={{ fontSize: 12 }} stroke="#94A3B8" />
                <YAxis tick={{ fontSize: 12 }} stroke="#94A3B8" />
                <Tooltip />
                <Bar dataKey="users" fill={INDIGO} radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-5">
          <h3 className="font-semibold text-slate-900 mb-4">User composition</h3>
          <div style={{ width: "100%", height: 240 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie data={pie} dataKey="value" nameKey="name" innerRadius={55} outerRadius={85} paddingAngle={3}>
                  {pie.map((p) => <Cell key={p.name} fill={p.color} />)}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </>
  );
}

function AdminUsers() {
  const users = [
    ...CANDIDATE_NAMES.map((n, i) => ({ name: n, email: n.toLowerCase().replace(/[^a-z]/g, ".") + "@mail.com", role: "Candidate", joined: `Sep ${i + 1}, 2026` })),
    { name: "Jordan Lee", email: "jordan.lee@cobalt.com", role: "Recruiter", joined: "Jan 4, 2026" },
    { name: "Priyanka Shah", email: "priyanka@northwind.com", role: "Recruiter", joined: "Feb 19, 2026" },
    { name: "Morgan Blake", email: "morgan@hirehub.com", role: "Admin", joined: "Jan 1, 2026" },
  ];
  return (
    <>
      <PageHeader title="Manage users" subtitle={`${users.length} accounts across the platform`} />
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-500 text-xs uppercase">
            <tr>
              <th className="text-left px-5 py-3 font-medium">Name</th>
              <th className="text-left px-5 py-3 font-medium">Email</th>
              <th className="text-left px-5 py-3 font-medium">Role</th>
              <th className="text-left px-5 py-3 font-medium">Joined</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {users.map((u) => (
              <tr key={u.email}>
                <td className="px-5 py-3.5 font-medium text-slate-800">{u.name}</td>
                <td className="px-5 py-3.5 text-slate-500">{u.email}</td>
                <td className="px-5 py-3.5 text-slate-500">{u.role}</td>
                <td className="px-5 py-3.5 text-slate-500">{u.joined}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

function AdminJobs({ jobs }) {
  return (
    <>
      <PageHeader title="Manage jobs" subtitle={`${jobs.length} jobs posted across all recruiters`} />
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-500 text-xs uppercase">
            <tr>
              <th className="text-left px-5 py-3 font-medium">Title</th>
              <th className="text-left px-5 py-3 font-medium">Company</th>
              <th className="text-left px-5 py-3 font-medium">Applicants</th>
              <th className="text-left px-5 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {jobs.map((j) => (
              <tr key={j.id}>
                <td className="px-5 py-3.5 font-medium text-slate-800">{j.title}</td>
                <td className="px-5 py-3.5 text-slate-500">{j.company}</td>
                <td className="px-5 py-3.5 text-slate-500">{j.applicants}</td>
                <td className="px-5 py-3.5"><StatusBadge status={j.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

function AdminApplications({ applications }) {
  return (
    <>
      <PageHeader title="Manage applications" subtitle={`${applications.length} applications platform-wide`} />
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-500 text-xs uppercase">
            <tr>
              <th className="text-left px-5 py-3 font-medium">Candidate</th>
              <th className="text-left px-5 py-3 font-medium">Job</th>
              <th className="text-left px-5 py-3 font-medium">Company</th>
              <th className="text-left px-5 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {applications.map((a) => (
              <tr key={a.id}>
                <td className="px-5 py-3.5 font-medium text-slate-800">{a.candidate}</td>
                <td className="px-5 py-3.5 text-slate-500">{a.jobTitle}</td>
                <td className="px-5 py-3.5 text-slate-500">{a.company}</td>
                <td className="px-5 py-3.5"><StatusBadge status={a.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

function AdminReports({ jobs, applications }) {
  const byStatus = ["Applied", "Under Review", "Shortlisted", "Interview Scheduled", "Selected", "Rejected"].map((s) => ({
    name: s, value: applications.filter((a) => a.status === s).length,
  }));
  return (
    <>
      <PageHeader title="Reports" subtitle="Recruitment funnel across the platform." />
      <div className="bg-white border border-slate-200 rounded-xl p-5">
        <h3 className="font-semibold text-slate-900 mb-4">Applications by stage</h3>
        <div style={{ width: "100%", height: 280 }}>
          <ResponsiveContainer>
            <BarChart data={byStatus} layout="vertical" margin={{ left: 40 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis type="number" tick={{ fontSize: 12 }} stroke="#94A3B8" />
              <YAxis type="category" dataKey="name" width={130} tick={{ fontSize: 12 }} stroke="#94A3B8" />
              <Tooltip />
              <Bar dataKey="value" fill={INDIGO} radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </>
  );
}

// ---------- ROOT APP ----------
export default function App() {
  const [screen, setScreen] = useState("landing"); // landing | login | register | forgot | app
  const [user, setUser] = useState(null);
  const [tab, setTab] = useState("dashboard");
  const [jobs, setJobs] = useState(seedJobs);
  const [applications, setApplications] = useState(() => seedApplications(seedJobs()));
  const [savedIds, setSavedIds] = useState([]);
  const [viewingJob, setViewingJob] = useState(null);
  const [applyModal, setApplyModal] = useState(null);
  const [toast, setToast] = useState(null);

  const notify = (msg) => { setToast(msg); setTimeout(() => setToast(null), 2200); };

  const handleLogin = (role, name) => {
    setUser({ role, name });
    setTab("dashboard");
    setScreen("app");
  };

  const handleLogout = () => { setUser(null); setScreen("landing"); };

  const toggleSave = (id) => setSavedIds((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);

  const submitApplication = () => {
    if (!applyModal) return;
    setApplications((prev) => [
      { id: `A${3000 + prev.length}`, jobId: applyModal.id, jobTitle: applyModal.title, company: applyModal.company, candidate: user?.name || "You", status: "Applied", appliedAt: "Just now" },
      ...prev,
    ]);
    setApplyModal(null);
    notify("Application submitted");
  };

  if (screen === "landing") return <Landing goto={setScreen} />;
  if (screen === "login" || screen === "register") return <Auth mode={screen} goto={setScreen} onLogin={handleLogin} />;
  if (screen === "forgot") {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl p-7 text-center">
          <h1 className="text-xl font-bold text-slate-900 mb-2" style={{ fontFamily: "Sora, sans-serif" }}>Reset your password</h1>
          <p className="text-sm text-slate-500 mb-5">Enter your email and we'll send you a reset link.</p>
          <Field label="Email" placeholder="you@example.com" />
          <PrimaryButton full onClick={() => { notify("Reset link sent"); setScreen("login"); }}>Send reset link</PrimaryButton>
          <button onClick={() => setScreen("login")} className="w-full text-center text-sm text-slate-400 mt-4">← Back to login</button>
        </div>
      </div>
    );
  }

  const goto = (t) => { setTab(t); setViewingJob(null); };

  let body;
  if (user.role === "candidate") {
    if (tab === "dashboard") body = <CandidateDashboard user={user} applications={applications} jobs={jobs} goto={goto} />;
    else if (tab === "jobs") body = viewingJob
      ? <JobDetails job={viewingJob} onBack={() => setViewingJob(null)} onApply={setApplyModal} saved={savedIds.includes(viewingJob.id)} onSave={toggleSave} />
      : <JobsBrowse jobs={jobs} savedIds={savedIds} onSave={toggleSave} onView={setViewingJob} onApply={setApplyModal} />;
    else if (tab === "applications") body = <CandidateApplications applications={applications} />;
    else if (tab === "interviews") body = <InterviewsList role="candidate" />;
    else if (tab === "profile") body = <CandidateProfile user={user} />;
  } else if (user.role === "recruiter") {
    if (tab === "dashboard") body = <RecruiterDashboard jobs={jobs} applications={applications} />;
    else if (tab === "jobs") body = <RecruiterJobs jobs={jobs} setJobs={setJobs} />;
    else if (tab === "applications") body = <RecruiterApplications applications={applications} setApplications={setApplications} />;
    else if (tab === "interviews") body = <InterviewsList role="recruiter" />;
  } else if (user.role === "admin") {
    if (tab === "dashboard") body = <AdminDashboard jobs={jobs} applications={applications} />;
    else if (tab === "users") body = <AdminUsers />;
    else if (tab === "jobs") body = <AdminJobs jobs={jobs} />;
    else if (tab === "applications") body = <AdminApplications applications={applications} />;
    else if (tab === "reports") body = <AdminReports jobs={jobs} applications={applications} />;
  }

  return (
    <div style={{ fontFamily: "Inter, sans-serif" }}>
      <AppShell role={user.role} active={tab} onNav={goto} onLogout={handleLogout} name={user.name}>
        {body}
      </AppShell>

      {applyModal && (
        <Modal title={`Apply — ${applyModal.title}`} onClose={() => setApplyModal(null)}>
          <Field label="Full name" defaultValue={user.name} />
          <Field label="Email" defaultValue="you@example.com" />
          <label className="block mb-3">
            <span className="text-sm font-medium text-slate-700">Cover letter</span>
            <textarea className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" rows={4} placeholder="Why you're a fit for this role..." />
          </label>
          <div className="flex items-center gap-2 mb-4 p-3 bg-slate-50 rounded-lg text-sm text-slate-500">
            <FileText size={16} /> resume.pdf attached
          </div>
          <PrimaryButton full onClick={submitApplication}>Submit application</PrimaryButton>
        </Modal>
      )}

      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-sm px-4 py-2.5 rounded-lg shadow-lg flex items-center gap-2 z-50">
          <Check size={15} /> {toast}
        </div>
      )}
    </div>
  );
}
