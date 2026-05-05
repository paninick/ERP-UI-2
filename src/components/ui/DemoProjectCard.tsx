import { ExternalLink, Github, Globe } from 'lucide-react';
import { useAppStore } from '@/stores/appStore';

export interface DemoLink {
  label: string;
  url: string;
  type?: 'github' | 'gitee' | 'demo' | 'article';
}

export interface DemoProjectCardProps {
  title: string;
  subtitle?: string;
  description: string;
  techStack: string[];
  features: string[];
  links: DemoLink[];
  badge?: string;
  badgeColor?: 'amber' | 'blue' | 'green' | 'purple' | 'rose';
}

const badgeStyles: Record<string, string> = {
  amber: 'bg-amber-100 text-amber-700 border-amber-200',
  blue: 'bg-blue-100 text-blue-700 border-blue-200',
  green: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  purple: 'bg-purple-100 text-purple-700 border-purple-200',
  rose: 'bg-rose-100 text-rose-700 border-rose-200',
};

const badgeStylesNight: Record<string, string> = {
  amber: 'bg-amber-400/12 text-amber-300 border-amber-400/20',
  blue: 'bg-blue-400/12 text-blue-300 border-blue-400/20',
  green: 'bg-emerald-400/12 text-emerald-300 border-emerald-400/20',
  purple: 'bg-purple-400/12 text-purple-300 border-purple-400/20',
  rose: 'bg-rose-400/12 text-rose-300 border-rose-400/20',
};

function LinkIcon({ type }: { type?: string }) {
  if (type === 'github' || type === 'gitee') return <Github size={14} />;
  if (type === 'demo') return <Globe size={14} />;
  return <ExternalLink size={14} />;
}

export default function DemoProjectCard({
  title,
  subtitle,
  description,
  techStack,
  features,
  links,
  badge,
  badgeColor = 'amber',
}: DemoProjectCardProps) {
  const uiTheme = useAppStore((s) => s.uiTheme);
  const isNight = uiTheme === 'night';
  const isGoogle = uiTheme === 'google';

  const cardCls = isGoogle
    ? 'rounded-2xl border border-slate-200 bg-white shadow-sm'
    : isNight
      ? 'rounded-2xl border border-white/8 bg-slate-900/60 backdrop-blur-sm'
      : 'rounded-2xl border border-white/10 bg-[#1e2a3a]/60 backdrop-blur-sm';

  const titleCls = isGoogle ? 'text-slate-800' : isNight ? 'text-slate-100' : 'text-amber-300';
  const subtitleCls = isGoogle ? 'text-slate-400' : 'text-slate-500';
  const descCls = isGoogle ? 'text-slate-600' : 'text-slate-400';
  const featureCls = isGoogle ? 'text-slate-600' : 'text-slate-400';
  const dotCls = isGoogle ? 'bg-slate-300' : isNight ? 'bg-amber-400/60' : 'bg-amber-500/60';

  const techBadgeCls = isGoogle
    ? 'rounded-full border border-slate-200 bg-slate-50 px-2.5 py-0.5 text-xs text-slate-600'
    : isNight
      ? 'rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-xs text-slate-400'
      : 'rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-xs text-slate-400';

  const badgeCls = isNight
    ? badgeStylesNight[badgeColor]
    : badgeStyles[badgeColor];

  const linkBtnCls = isGoogle
    ? 'inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:border-slate-300 hover:bg-slate-100'
    : isNight
      ? 'inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-slate-300 transition hover:border-white/20 hover:bg-white/10'
      : 'inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-slate-300 transition hover:border-amber-400/30 hover:bg-amber-400/8 hover:text-amber-300';

  return (
    <div className={`${cardCls} p-6`}>
      {/* Header */}
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className={`text-lg font-semibold ${titleCls}`}>{title}</h2>
            {badge && (
              <span className={`rounded-full border px-2 py-0.5 text-[11px] font-medium ${badgeCls}`}>
                {badge}
              </span>
            )}
          </div>
          {subtitle && <p className={`mt-0.5 text-sm ${subtitleCls}`}>{subtitle}</p>}
        </div>
      </div>

      {/* Description */}
      <p className={`mb-5 text-sm leading-relaxed ${descCls}`}>{description}</p>

      {/* Tech Stack */}
      <div className="mb-5">
        <p className={`mb-2 text-xs font-medium uppercase tracking-wider ${subtitleCls}`}>技术栈</p>
        <div className="flex flex-wrap gap-1.5">
          {techStack.map((tech) => (
            <span key={tech} className={techBadgeCls}>{tech}</span>
          ))}
        </div>
      </div>

      {/* Features */}
      <div className="mb-6">
        <p className={`mb-2 text-xs font-medium uppercase tracking-wider ${subtitleCls}`}>核心功能</p>
        <ul className="space-y-1.5">
          {features.map((f) => (
            <li key={f} className={`flex items-start gap-2 text-sm ${featureCls}`}>
              <span className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${dotCls}`} />
              {f}
            </li>
          ))}
        </ul>
      </div>

      {/* Links */}
      <div className="flex flex-wrap gap-2">
        {links.map((link) => (
          <a
            key={link.url}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className={linkBtnCls}
          >
            <LinkIcon type={link.type} />
            {link.label}
          </a>
        ))}
      </div>
    </div>
  );
}
