import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, Cookie, Database, FileCheck2, KeyRound, ShieldCheck } from "lucide-react";

const controls = [
  { icon: KeyRound, title: "Authentication & session management", status: "Implemented", body: "OAuth provides the identity flow, while the existing server infrastructure issues signed, secure, HTTP-only session cookies. The client never manages session secrets directly." },
  { icon: ShieldCheck, title: "Authorization & ownership", status: "Implemented", body: "Protected procedures require an authenticated user. Every note read, update, and delete operation scopes the database query to the current user ID, and admin procedures enforce the admin role on the server." },
  { icon: FileCheck2, title: "Input validation", status: "Implemented", body: "Note fields use strict Zod schemas with trimming, type checks, and length limits. Audit events also pass through a shared strict schema before persistence." },
  { icon: Cookie, title: "Cookie and CSRF posture", status: "Documented", body: "Session cookies use secure, HTTP-only, same-site settings supplied by the authentication infrastructure. State-changing operations are routed through the authenticated application boundary rather than accepting ad hoc browser credentials." },
  { icon: Database, title: "Data protection & auditability", status: "Implemented", body: "Private records are stored server-side, never in client storage. Login, logout, and note changes produce timestamped audit events available to authorized administrators." },
];

export default function Security() {
  return (
    <div className="min-h-[calc(100vh-2rem)] bg-[#f7fafb] -m-4 p-4 sm:p-8 lg:p-10">
      <div className="mx-auto max-w-6xl space-y-8">
        <header className="relative overflow-hidden rounded-[2rem] bg-emerald-950 px-6 py-10 text-white shadow-xl shadow-emerald-950/10 sm:px-10 lg:px-14"><div className="absolute right-0 top-0 h-64 w-64 translate-x-1/3 -translate-y-1/3 rounded-full bg-emerald-300/20 blur-3xl" /><div className="relative max-w-3xl"><Badge className="border-emerald-300/30 bg-emerald-300/10 text-emerald-100 hover:bg-emerald-300/10"><ShieldCheck className="mr-2 h-3.5 w-3.5" /> OWASP control map</Badge><h1 className="mt-5 text-4xl font-semibold tracking-tight sm:text-5xl">Security is a product behavior, not a claim.</h1><p className="mt-4 max-w-2xl text-base leading-7 text-emerald-100/80">This page documents the controls implemented in Sentinel Desk, where they are enforced, and what remains outside the scope of this internship demonstration.</p></div></header>
        <div className="grid gap-4 md:grid-cols-2">{controls.map(control => { const Icon = control.icon; return <Card key={control.title} className="border-slate-200/80 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"><CardHeader className="flex-row items-start justify-between gap-4"><div className="flex gap-3"><div className="rounded-xl bg-emerald-50 p-2.5 text-emerald-700"><Icon className="h-5 w-5" /></div><div><CardTitle className="text-lg">{control.title}</CardTitle><Badge variant="outline" className="mt-2 border-emerald-200 text-emerald-700">{control.status}</Badge></div></div><CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" /></CardHeader><CardContent><p className="text-sm leading-7 text-slate-600">{control.body}</p></CardContent></Card>; })}</div>
        <Card className="border-amber-200 bg-amber-50/70 shadow-sm"><CardHeader><CardTitle className="text-lg text-amber-950">Scope and limitations</CardTitle></CardHeader><CardContent><p className="text-sm leading-7 text-amber-900/80">This application demonstrates secure design patterns; it is not a substitute for a production threat model, penetration test, dependency review, managed secret rotation, or organization-specific compliance assessment. Security controls should be reviewed continuously as the application and its deployment environment evolve.</p></CardContent></Card>
      </div>
    </div>
  );
}
