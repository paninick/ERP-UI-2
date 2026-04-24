import { useEffect, useState } from 'react';
import QRCode from 'qrcode';

interface PrintCodeStripProps {
  label: string;
  value?: string | null;
  qrValue?: string | null;
  note?: string;
}

export default function PrintCodeStrip({ label, value, qrValue, note }: PrintCodeStripProps) {
  const [dataUrl, setDataUrl] = useState('');
  const encodedValue = qrValue || value;

  useEffect(() => {
    let disposed = false;

    async function renderQr() {
      if (!encodedValue) {
        setDataUrl('');
        return;
      }

      try {
        const url = await QRCode.toDataURL(encodedValue, {
          margin: 1,
          width: 160,
          color: {
            dark: '#0f172a',
            light: '#ffffff',
          },
        });

        if (!disposed) {
          setDataUrl(url);
        }
      } catch {
        if (!disposed) {
          setDataUrl('');
        }
      }
    }

    renderQr();

    return () => {
      disposed = true;
    };
  }, [encodedValue]);

  return (
    <section className="rounded-2xl border border-dashed border-slate-300 bg-white p-4">
      <div className="text-xs text-slate-500">{label}</div>
      <div className="mt-3 flex items-center gap-4">
        <div className="flex h-28 w-28 items-center justify-center rounded-xl border border-slate-200 bg-slate-50">
          {dataUrl ? (
            <img src={dataUrl} alt={`${label} QR`} className="h-24 w-24" />
          ) : (
            <span className="text-xs text-slate-400">QR loading</span>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="rounded-xl bg-slate-950 px-4 py-3 font-mono text-sm tracking-[0.18em] text-white">
            {value || encodedValue || '-'}
          </div>
          {note && <p className="mt-2 text-xs text-slate-500">{note}</p>}
        </div>
      </div>
    </section>
  );
}
