interface DocumentCodeItem {
  label: string;
  value?: string | number | null;
  helper?: string;
  tone?: 'primary' | 'secondary' | 'neutral';
}

interface DocumentCodeBoardProps {
  title: string;
  description?: string;
  items: DocumentCodeItem[];
}

function getToneClass(tone?: DocumentCodeItem['tone']) {
  if (tone === 'primary') {
    return 'border-slate-900 bg-slate-900 text-white';
  }
  if (tone === 'secondary') {
    return 'border-indigo-200 bg-indigo-50 text-indigo-950';
  }
  return 'border-slate-200 bg-white text-slate-900';
}

export default function DocumentCodeBoard({ title, description, items }: DocumentCodeBoardProps) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
        {description && <p className="mt-1 text-xs text-slate-500">{description}</p>}
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {items.map((item) => (
          <div key={item.label} className={`rounded-xl border px-4 py-3 ${getToneClass(item.tone)}`}>
            <div className={`text-xs ${item.tone === 'primary' ? 'text-white/70' : 'text-slate-500'}`}>{item.label}</div>
            <div className="mt-1 break-all text-sm font-semibold">{item.value || '-'}</div>
            {item.helper && (
              <div className={`mt-2 text-xs ${item.tone === 'primary' ? 'text-white/80' : 'text-slate-500'}`}>
                {item.helper}
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
