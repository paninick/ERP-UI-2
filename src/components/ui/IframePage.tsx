import { useEffect, useRef, useState } from 'react';
import { useAppStore } from '@/stores/appStore';

interface IframePageProps {
  title: string;
  subtitle?: string;
  localUrl: string;
  onlineUrl?: string;
  startCmd?: string;
  workDir?: string;
}

type ServiceStatus = 'checking' | 'online' | 'offline';

/**
 * 通过 ERP 后端的 /erp/probe 接口探测本地端口是否可达。
 * 服务端做 TCP 连接，绕过浏览器跨域限制，结果准确可靠。
 */
async function probeUrl(url: string): Promise<boolean> {
  try {
    const res = await fetch(
      `/erp/probe?url=${encodeURIComponent(url)}`,
      { cache: 'no-store' }
    );
    if (!res.ok) return false;
    const data = await res.json();
    // AjaxResult 结构：{ code: 200, data: { reachable: true/false } }
    return data?.data?.reachable === true;
  } catch {
    return false;
  }
}

export default function IframePage({
  title,
  subtitle,
  localUrl,
  onlineUrl,
  startCmd,
  workDir,
}: IframePageProps) {
  const uiTheme = useAppStore((s) => s.uiTheme);
  const isGoogle = uiTheme === 'google';
  const isNight = uiTheme === 'night';

  const headingCls = isGoogle ? 'text-slate-800' : isNight ? 'text-slate-100' : 'text-amber-300';
  const subCls = 'text-slate-500';
  const cardBg = isGoogle
    ? 'bg-white border border-slate-200'
    : 'bg-slate-800 border border-slate-700';
  const codeBg = isGoogle ? 'bg-slate-100 text-slate-700' : 'bg-slate-900 text-slate-300';
  const labelCls = isGoogle ? 'text-slate-600' : 'text-slate-400';

  const [useOnline, setUseOnline] = useState(false);
  const [localStatus, setLocalStatus] = useState<ServiceStatus>('checking');
  const probeTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  const runProbe = async () => {
    const ok = await probeUrl(localUrl);
    setLocalStatus(ok ? 'online' : 'offline');
  };

  useEffect(() => {
    if (useOnline) return;
    setLocalStatus('checking');
    runProbe();
    probeTimer.current = setInterval(runProbe, 5000);
    return () => {
      if (probeTimer.current) clearInterval(probeTimer.current);
    };
  }, [localUrl, useOnline]);

  const showIframe = useOnline || localStatus === 'online';
  const activeUrl = useOnline && onlineUrl ? onlineUrl : localUrl;

  return (
    <div className="flex flex-col h-full gap-3">
      {/* Header */}
      <div className="flex items-center justify-between flex-shrink-0">
        <div>
          <h1 className={`text-xl font-semibold ${headingCls}`}>{title}</h1>
          {subtitle && <p className={`text-sm ${subCls}`}>{subtitle}</p>}
        </div>
        <div className="flex items-center gap-2">
          {!useOnline && (
            <span className="flex items-center gap-1.5 text-xs">
              <span className={`w-2 h-2 rounded-full ${
                localStatus === 'checking' ? 'bg-yellow-400 animate-pulse' :
                localStatus === 'online'   ? 'bg-green-400' :
                                             'bg-red-400'
              }`} />
              <span className={labelCls}>
                {localStatus === 'checking' ? '检测中…' :
                 localStatus === 'online'   ? '服务运行中' :
                                             '未启动'}
              </span>
            </span>
          )}
          {onlineUrl && (
            <button
              onClick={() => setUseOnline(!useOnline)}
              className={`px-3 py-1.5 text-xs rounded-md border transition-colors ${
                useOnline
                  ? 'bg-blue-500 text-white border-blue-500'
                  : isGoogle
                    ? 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'
                    : 'bg-slate-700 text-slate-300 border-slate-600 hover:bg-slate-600'
              }`}
            >
              {useOnline ? '切回本地' : '在线 Demo'}
            </button>
          )}
          <a
            href={activeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 text-xs rounded-md bg-blue-500 text-white hover:bg-blue-600 transition-colors"
          >
            新标签打开 ↗
          </a>
        </div>
      </div>

      {/* 主体区域 */}
      <div
        className={`flex-1 rounded-lg overflow-hidden ${cardBg} min-h-0`}
        style={{ minHeight: 500 }}
      >
        {showIframe ? (
          <iframe
            key={activeUrl}
            src={activeUrl}
            className="w-full h-full border-0"
            style={{ minHeight: 500 }}
            title={title}
            sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-modals"
          />
        ) : localStatus === 'checking' ? (
          <div className="flex flex-col items-center justify-center h-full gap-3">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            <span className={`text-sm ${subCls}`}>正在检测本地服务…</span>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full gap-4 p-8">
            <div className="text-4xl">🔌</div>
            <p className={`text-base font-medium ${headingCls}`}>本地服务未启动</p>
            <p className={`text-sm text-center ${subCls}`}>
              启动服务后页面将自动刷新（每 5 秒检测一次）
            </p>

            {(workDir || startCmd) && (
              <div className={`w-full max-w-lg rounded-lg p-4 ${cardBg} space-y-3`}>
                {workDir && (
                  <div>
                    <span className={`text-xs ${labelCls}`}>工作目录</span>
                    <pre className={`mt-1 text-xs rounded px-3 py-2 ${codeBg} overflow-x-auto`}>{workDir}</pre>
                  </div>
                )}
                {startCmd && (
                  <div>
                    <span className={`text-xs ${labelCls}`}>启动命令</span>
                    <pre className={`mt-1 text-xs rounded px-3 py-2 ${codeBg} overflow-x-auto`}>{startCmd}</pre>
                  </div>
                )}
              </div>
            )}

            <div className="flex gap-2">
              {onlineUrl && (
                <button
                  onClick={() => setUseOnline(true)}
                  className="px-4 py-2 text-sm rounded-md bg-blue-500 text-white hover:bg-blue-600 transition-colors"
                >
                  切换到在线 Demo
                </button>
              )}
              <button
                onClick={runProbe}
                className={`px-4 py-2 text-sm rounded-md border transition-colors ${
                  isGoogle
                    ? 'border-slate-300 text-slate-600 hover:bg-slate-50'
                    : 'border-slate-600 text-slate-300 hover:bg-slate-700'
                }`}
              >
                立即重试
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 底部启动命令（服务在线时也显示，方便参考） */}
      {showIframe && (workDir || startCmd) && (
        <div className={`flex-shrink-0 rounded-lg p-3 ${cardBg} flex flex-wrap gap-4 text-xs`}>
          {workDir && (
            <div className="flex items-center gap-2">
              <span className={labelCls}>目录：</span>
              <code className={`rounded px-2 py-0.5 ${codeBg}`}>{workDir}</code>
            </div>
          )}
          {startCmd && (
            <div className="flex items-center gap-2">
              <span className={labelCls}>启动：</span>
              <code className={`rounded px-2 py-0.5 ${codeBg}`}>{startCmd}</code>
            </div>
          )}
        </div>
      )}
    </div>
  );
}


