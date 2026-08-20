import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { BookOpen, Check, Pencil, Plus, ShieldCheck, Trash2, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function Notes() {
  const utils = trpc.useUtils();
  const notesQuery = trpc.notes.list.useQuery();
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const reset = () => {
    setSelectedId(null);
    setTitle("");
    setContent("");
  };

  const createMutation = trpc.notes.create.useMutation({
    onSuccess: () => { toast.success("Private note created"); reset(); utils.notes.list.invalidate(); },
    onError: error => toast.error(error.message || "Unable to create note"),
  });
  const updateMutation = trpc.notes.update.useMutation({
    onSuccess: () => { toast.success("Note updated"); reset(); utils.notes.list.invalidate(); },
    onError: error => toast.error(error.message || "Unable to update note"),
  });
  const deleteMutation = trpc.notes.remove.useMutation({
    onSuccess: () => { toast.success("Note deleted"); reset(); utils.notes.list.invalidate(); },
    onError: error => toast.error(error.message || "Unable to delete note"),
  });

  const startEdit = (note: { id: number; title: string; content: string }) => {
    setSelectedId(note.id);
    setTitle(note.title);
    setContent(note.content);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const submit = () => {
    if (!title.trim() || !content.trim()) {
      toast.error("Add a title and content before saving");
      return;
    }
    if (selectedId) {
      updateMutation.mutate({ id: selectedId, title, content });
    } else {
      createMutation.mutate({ title, content });
    }
  };

  const busy = createMutation.isPending || updateMutation.isPending || deleteMutation.isPending;

  return (
    <div className="min-h-[calc(100vh-2rem)] bg-[#f7fafb] -m-4 p-4 sm:p-8 lg:p-10">
      <div className="mx-auto max-w-7xl space-y-8">
        <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div><p className="text-sm font-medium uppercase tracking-[0.2em] text-cyan-700">Private workspace</p><h1 className="mt-2 text-4xl font-semibold tracking-tight text-slate-950">My notes</h1><p className="mt-2 max-w-xl text-slate-500">Personal records are scoped to your identity on every server request.</p></div>
          <div className="flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-800"><ShieldCheck className="h-4 w-4" /> Owner protected</div>
        </header>

        {notesQuery.isError && <div role="alert" className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800"><span>We could not load your private notes. Your data is unchanged.</span><Button size="sm" variant="outline" className="border-rose-300 bg-transparent text-rose-800 hover:bg-rose-100" onClick={() => notesQuery.refetch()}>Retry</Button></div>}

        <div className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
          <Card className="border-slate-200/80 bg-white shadow-sm">
            <CardHeader><CardTitle className="flex items-center gap-2 text-xl"><Plus className="h-5 w-5 text-cyan-700" /> {selectedId ? "Edit note" : "New note"}</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2"><label htmlFor="note-title" className="text-sm font-medium text-slate-700">Title</label><Input id="note-title" maxLength={160} value={title} onChange={event => setTitle(event.target.value)} placeholder="e.g. Security review notes" /></div>
              <div className="space-y-2"><label htmlFor="note-content" className="text-sm font-medium text-slate-700">Content</label><Textarea id="note-content" maxLength={10000} value={content} onChange={event => setContent(event.target.value)} placeholder="Write something worth protecting..." className="min-h-44 resize-y" /></div>
              <div className="flex gap-2"><Button onClick={submit} disabled={busy} className="flex-1">{selectedId ? <Check className="mr-2 h-4 w-4" /> : <Plus className="mr-2 h-4 w-4" />}{selectedId ? "Save changes" : "Create note"}</Button>{selectedId && <Button variant="outline" onClick={reset} disabled={busy}><X className="h-4 w-4" /></Button>}</div>
              <p className="text-xs leading-5 text-slate-400">Inputs are trimmed, length-limited, and validated again on the server with Zod.</p>
            </CardContent>
          </Card>

          <Card className="border-slate-200/80 bg-white shadow-sm">
            <CardHeader className="flex-row items-center justify-between"><CardTitle className="flex items-center gap-2 text-xl"><BookOpen className="h-5 w-5 text-cyan-700" /> Your records</CardTitle><span className="text-sm text-slate-400">{notesQuery.data?.length ?? 0} total</span></CardHeader>
            <CardContent>
              {notesQuery.isLoading ? <div className="rounded-2xl bg-slate-50 p-8 text-center text-sm text-slate-500">Loading your private records…</div> : notesQuery.data?.length ? <div className="space-y-3">{notesQuery.data.map(note => <article key={note.id} className="group rounded-2xl border border-slate-200 p-4 transition hover:border-cyan-300 hover:bg-cyan-50/30"><div className="flex items-start justify-between gap-4"><div className="min-w-0"><h2 className="truncate font-semibold text-slate-900">{note.title}</h2><p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-600">{note.content}</p><p className="mt-3 text-xs text-slate-400">Updated {new Date(note.updatedAt).toLocaleString()}</p></div><div className="flex shrink-0 gap-1 opacity-100 transition sm:opacity-0 sm:group-hover:opacity-100"><Button variant="ghost" size="icon" aria-label={`Edit ${note.title}`} onClick={() => startEdit(note)}><Pencil className="h-4 w-4" /></Button><Button variant="ghost" size="icon" aria-label={`Delete ${note.title}`} onClick={() => deleteMutation.mutate({ id: note.id })} disabled={busy}><Trash2 className="h-4 w-4 text-rose-600" /></Button></div></div></article>)}</div> : <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50/80 p-10 text-center"><BookOpen className="mx-auto h-8 w-8 text-slate-300" /><h2 className="mt-3 font-semibold text-slate-800">No private notes yet</h2><p className="mt-1 text-sm text-slate-500">Create your first protected record using the form.</p></div>}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
