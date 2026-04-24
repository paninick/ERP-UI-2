import {useEffect, useMemo, useState} from 'react';
import * as dictApi from '@/api/dict';
import {useAppStore} from '@/stores/appStore';

interface DictOption {
  value: string;
  label: string;
  raw?: any;
}

function normalizeValue(value: any) {
  if (value === undefined || value === null) {
    return '';
  }
  return String(value);
}

export function useDictOptions(dictType?: string, fallbackOptions: DictOption[] = []) {
  const dictCache = useAppStore((state) => state.dictCache);
  const setDict = useAppStore((state) => state.setDict);
  const [loading, setLoading] = useState(false);

  const cachedRows = dictType ? (dictCache[dictType] || []) : [];

  useEffect(() => {
    if (!dictType || cachedRows.length > 0) {
      return;
    }

    let cancelled = false;

    async function load() {
      setLoading(true);
      try {
        const res: any = await dictApi.listDictData({
          dictType,
          pageNum: 1,
          pageSize: 999,
        });
        if (!cancelled) {
          setDict(dictType, res.rows || []);
        }
      } catch {
        if (!cancelled) {
          setDict(dictType, []);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [cachedRows.length, dictType, setDict]);

  const options = useMemo<DictOption[]>(() => {
    if (cachedRows.length === 0) {
      return fallbackOptions;
    }
    return cachedRows.map((item) => ({
      value: normalizeValue(item.dictValue),
      label: item.dictLabel || normalizeValue(item.dictValue),
      raw: item,
    }));
  }, [cachedRows, fallbackOptions]);

  const labelMap = useMemo(() => {
    const nextMap: Record<string, string> = {};
    options.forEach((item) => {
      nextMap[item.value] = item.label;
    });
    return nextMap;
  }, [options]);

  const toTag = (value: any, fallbackColor = 'bg-slate-100 text-slate-600') => {
    const key = normalizeValue(value);
    const matched = options.find((item) => item.value === key);
    return {
      label: labelMap[key] || key || '-',
      color: matched?.raw?.cssClass || fallbackColor,
    };
  };

  return {
    loading,
    options,
    labelMap,
    toTag,
  };
}
