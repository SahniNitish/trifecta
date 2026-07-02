import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, type WorkoutTemplate, type TemplateExercise } from '../../db/db';
import { Sheet } from '../../components/Sheet';
import { EmptyState } from '../../components/EmptyState';

export function TemplateEditor() {
  const [editing, setEditing] = useState<WorkoutTemplate | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [name, setName] = useState('');
  const [exercises, setExercises] = useState<TemplateExercise[]>([]);

  const templates = useLiveQuery(() =>
    db.workoutTemplates.orderBy('order').toArray()
  );

  const openNew = () => {
    setEditing(null);
    setName('');
    setExercises([{ name: '', targetSets: 3, targetReps: '8-12' }]);
    setSheetOpen(true);
  };

  const openEdit = (t: WorkoutTemplate) => {
    setEditing(t);
    setName(t.name);
    setExercises([...t.exercises]);
    setSheetOpen(true);
  };

  const save = async () => {
    if (!name.trim()) return;
    const valid = exercises.filter((e) => e.name.trim());
    if (valid.length === 0) return;

    if (editing?.id) {
      await db.workoutTemplates.update(editing.id, { name: name.trim(), exercises: valid });
    } else {
      const count = await db.workoutTemplates.count();
      await db.workoutTemplates.add({ name: name.trim(), exercises: valid, order: count });
    }
    setSheetOpen(false);
  };

  const remove = async (id: number | undefined) => {
    if (!id) return;
    await db.workoutTemplates.delete(id);
  };

  return (
    <div>
      {templates?.length === 0 && (
        <EmptyState message="No templates yet" action="Create template →" onAction={openNew} />
      )}
      <div className="space-y-2">
        {templates?.map((t) => (
          <div key={t.id} className="flex items-center gap-3 p-3 bg-surface rounded-xl">
            <button onClick={() => openEdit(t)} className="flex-1 text-left">
              <p className="font-medium">{t.name}</p>
              <p className="text-xs text-muted">{t.exercises.length} exercises</p>
            </button>
            <button onClick={() => remove(t.id)} className="text-muted text-xs px-2 active:scale-95">✕</button>
          </div>
        ))}
      </div>
      <button
        onClick={openNew}
        className="mt-4 w-full py-3 rounded-xl bg-surface2 text-accent font-medium active:scale-95"
      >
        + New Template
      </button>

      <Sheet open={sheetOpen} onClose={() => setSheetOpen(false)} title={editing ? 'Edit Template' : 'New Template'}>
        <div className="space-y-4">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Template name"
            className="w-full bg-surface rounded-xl px-4 py-3 outline-none"
          />
          {exercises.map((ex, i) => (
            <div key={i} className="flex gap-2">
              <input
                value={ex.name}
                onChange={(e) => {
                  const copy = [...exercises];
                  copy[i] = { ...copy[i], name: e.target.value };
                  setExercises(copy);
                }}
                placeholder="Exercise"
                className="flex-1 bg-surface rounded-lg px-3 py-2 text-sm outline-none"
              />
              <input
                type="number"
                value={ex.targetSets}
                onChange={(e) => {
                  const copy = [...exercises];
                  copy[i] = { ...copy[i], targetSets: parseInt(e.target.value) || 3 };
                  setExercises(copy);
                }}
                className="w-12 bg-surface rounded-lg px-2 py-2 text-sm text-center outline-none"
              />
            </div>
          ))}
          <button
            onClick={() => setExercises([...exercises, { name: '', targetSets: 3, targetReps: '8-12' }])}
            className="text-sm text-accent active:scale-95"
          >
            + Add exercise
          </button>
          <button onClick={save} className="w-full py-3 rounded-xl bg-accent text-bg font-semibold active:scale-95">
            Save
          </button>
        </div>
      </Sheet>
    </div>
  );
}