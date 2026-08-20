import { useAuth } from "@/_core/hooks/useAuth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { ArrowUpRight, BookOpen, Clock3, LockKeyhole, ShieldCheck, Sparkles } from "lucide-react";
import { Link } from "wouter";

export default function Home() {
  const { user } = useAuth();
  const notesQuery = trpc.notes.list.useQuery(undefined, { enabled: Boolean(user) });
  const noteCount = notesQuery.data?.length ?? 0;

  return (
    <div className="min-h-[calc(100vh-2rem)] bg-[radial-gradient(circle_at_top_right,rgba(14,116,144,0.10),transparent_38%),linear-gradient(135deg,#f8fbfc_0%,#f5f7fb_54%,#eef4f2_100%)] -m-4 p-4 sm:p-8 lg:p-10">
      <div className="mx-auto max-w-7xl space-y-8">
        <section className="relative overflow-hidden rounded-[2rem] border border-slate-200/80 bg-slate-950 px-6 py-10 text-white shadow-2xl shadow-slate-900/10 sm:px-10 lg:px-14 lg:py-14">
          <div className="absolute -right-20 -top-24 h-72 w-72 rounded-full bg-cyan-400/20 blur-3xl" />
          <div className="absolute bottom-0 left-1/3 h-36 w-36 rounded-full bg-emerald-300/10 blur-3xl" />
          <div className="relative max-w-3xl space-y-6">
            <Badge className="border-cyan-300/30 bg-cyan-300/10 text-cyan-100 hover:bg-cyan-300/10">
              <Sparkles className="mr-2 h-3.5 w-3.5" /> Secure workspace
            </Badge>
            <div className="space-y-3">
              <p className="text-sm font-medium uppercase tracking-[0.22em] text-cyan-200/80">Sentinel Desk</p>
              <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">A calmer way to protect personal data.</h1>
              <p className="max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">
                Welcome back{user?.name ? `, ${user.name.split(" ")[0]}` : ""}. Manage private notes through a security-first interface built around authenticated access, strict ownership checks, and auditable changes.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button asChild size="lg" className="bg-cyan-300 text-slate-950 hover:bg-cyan-200">
                <Link href="/notes">Open my notes <ArrowUpRight className="ml-2 h-4 w-4" /></Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-slate-700 bg-transparent text-white hover:bg-white/10 hover:text-white">
                <Link href="/security">Review controls</Link>
              </Button>
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          <Card className="border-slate-200/80 bg-white/80 shadow-sm backdrop-blur">
            <CardHeader className="flex-row items-center justify-between pb-3">
              <CardTitle className="text-sm font-medium text-slate-500">Private records</CardTitle>
              <BookOpen className="h-5 w-5 text-cyan-700" />
            </CardHeader>
            <CardContent><p className="text-3xl font-semibold tracking-tight text-slate-950">{noteCount}</p><p className="mt-1 text-sm text-slate-500">Owned by your account</p></CardContent>
          </Card>
          <Card className="border-slate-200/80 bg-white/80 shadow-sm backdrop-blur">
            <CardHeader className="flex-row items-center justify-between pb-3">
              <CardTitle className="text-sm font-medium text-slate-500">Session posture</CardTitle>
              <LockKeyhole className="h-5 w-5 text-emerald-700" />
            </CardHeader>
            <CardContent><p className="text-3xl font-semibold tracking-tight text-slate-950">Protected</p><p className="mt-1 text-sm text-slate-500">OAuth-backed session boundary</p></CardContent>
          </Card>
          <Card className="border-slate-200/80 bg-white/80 shadow-sm backdrop-blur">
            <CardHeader className="flex-row items-center justify-between pb-3">
              <CardTitle className="text-sm font-medium text-slate-500">Audit readiness</CardTitle>
              <Clock3 className="h-5 w-5 text-violet-700" />
            </CardHeader>
            <CardContent><p className="text-3xl font-semibold tracking-tight text-slate-950">Live</p><p className="mt-1 text-sm text-slate-500">Security events are recorded</p></CardContent>
          </Card>
        </section>

        <section className="grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
          <Card className="border-slate-200/80 bg-white/85 shadow-sm">
            <CardHeader><CardTitle className="flex items-center gap-3 text-xl"><ShieldCheck className="h-5 w-5 text-cyan-700" /> Protection principles</CardTitle></CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-3">
              {[['Validate', 'Zod schemas reject malformed inputs before persistence.'], ['Authorize', 'Every note query is scoped to the authenticated owner.'], ['Observe', 'Authentication and data changes create audit events.']].map(([title, text]) => (
                <div key={title} className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4"><p className="font-semibold text-slate-900">{title}</p><p className="mt-2 text-sm leading-6 text-slate-500">{text}</p></div>
              ))}
            </CardContent>
          </Card>
          <Card className="border-cyan-100 bg-cyan-50/70 shadow-sm">
            <CardHeader><CardTitle className="text-xl text-slate-950">Built for a security portfolio</CardTitle></CardHeader>
            <CardContent className="space-y-4"><p className="text-sm leading-6 text-slate-600">Explore the implementation details and OWASP control map to understand how this project turns secure-coding principles into working product behavior.</p><Button asChild variant="secondary"><Link href="/security">Explore the security map <ArrowUpRight className="ml-2 h-4 w-4" /></Link></Button></CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}
