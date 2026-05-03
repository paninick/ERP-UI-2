import { ChangeEvent, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ImagePlus, LoaderCircle, Paperclip, Trash2, UploadCloud } from 'lucide-react';
import * as api from '@/api/notice';
import { toast } from '@/components/ui/Toast';

type NoticeAttachment = {
  id?: number;
  fileName: string;
  fileUrl: string;
  uploaded?: boolean;
};

interface ProofingNoticeFormProps {
  initialValues?: any;
  initialAttachments?: NoticeAttachment[];
  onSubmit: (values: any) => Promise<void> | void;
  onCancel: () => void;
}

type ProofingNoticeFormState = {
  id?: number;
  version?: number;
  sampleNo: string;
  roundNumber: string;
  sampleType: string;
  customerName: string;
  salesName: string;
  bulkOrderNo: string;
  styleCode: string;
  styleCategory: string;
  styleSubCategory: string;
  styleType: string;
  sampleCategoryType: string;
  dueDate: string;
  emergencyType: string;
  customerApproved: string;
  customerFeedback: string;
  factoryConfirmed: string;
  factoryConfirmDate: string;
  pictureUrl: string;
  colorConfirmStatus: string;
  colorConfirmImages: string;
  lightSourceType: string;
  customerAcceptDeltaE: string;
  remark: string;
};

const EMPTY_FORM: ProofingNoticeFormState = {
  sampleNo: '',
  roundNumber: '1',
  sampleType: '',
  customerName: '',
  salesName: '',
  bulkOrderNo: '',
  styleCode: '',
  styleCategory: '',
  styleSubCategory: '',
  styleType: '',
  sampleCategoryType: '',
  dueDate: '',
  emergencyType: '',
  customerApproved: '',
  customerFeedback: '',
  factoryConfirmed: '',
  factoryConfirmDate: '',
  pictureUrl: '',
  colorConfirmStatus: '',
  colorConfirmImages: '',
  lightSourceType: '',
  customerAcceptDeltaE: '',
  remark: '',
};

function normalizeDate(value: any) {
  if (!value) {
    return '';
  }
  return String(value).slice(0, 10);
}

function parseAttachmentInput(value: string): NoticeAttachment[] {
  if (!value) {
    return [];
  }
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
    .map((url, index) => ({
      fileName: `color-confirm-${index + 1}`,
      fileUrl: url,
      uploaded: true,
    }));
}

function joinAttachmentUrls(list: NoticeAttachment[]) {
  return list.map((item) => item.fileUrl).filter(Boolean).join(',');
}

export default function ProofingNoticeForm({
  initialValues,
  initialAttachments = [],
  onSubmit,
  onCancel,
}: ProofingNoticeFormProps) {
  const { t } = useTranslation();
  const [form, setForm] = useState<ProofingNoticeFormState>(EMPTY_FORM);
  const [loading, setLoading] = useState(false);
  const [uploadingPicture, setUploadingPicture] = useState(false);
  const [uploadingColorImages, setUploadingColorImages] = useState(false);
  const [uploadingAttachments, setUploadingAttachments] = useState(false);
  const [attachments, setAttachments] = useState<NoticeAttachment[]>([]);
  const [colorImageFiles, setColorImageFiles] = useState<NoticeAttachment[]>([]);

  useEffect(() => {
    if (initialValues) {
      setForm({
        id: initialValues.id,
        version: initialValues.version,
        sampleNo: initialValues.sampleNo || '',
        roundNumber: initialValues.roundNumber != null ? String(initialValues.roundNumber) : '1',
        sampleType: initialValues.sampleType || '',
        customerName: initialValues.customerName || '',
        salesName: initialValues.salesName || '',
        bulkOrderNo: initialValues.bulkOrderNo || '',
        styleCode: initialValues.styleCode || '',
        styleCategory: initialValues.styleCategory || '',
        styleSubCategory: initialValues.styleSubCategory || '',
        styleType: initialValues.styleType || '',
        sampleCategoryType: initialValues.sampleCategoryType || '',
        dueDate: normalizeDate(initialValues.dueDate),
        emergencyType: initialValues.emergencyType || '',
        customerApproved: initialValues.customerApproved || '',
        customerFeedback: initialValues.customerFeedback || '',
        factoryConfirmed: initialValues.factoryConfirmed || '',
        factoryConfirmDate: normalizeDate(initialValues.factoryConfirmDate),
        pictureUrl: initialValues.pictureUrl || '',
        colorConfirmStatus: initialValues.colorConfirmStatus || '',
        colorConfirmImages: initialValues.colorConfirmImages || '',
        lightSourceType: initialValues.lightSourceType || '',
        customerAcceptDeltaE:
          initialValues.customerAcceptDeltaE != null ? String(initialValues.customerAcceptDeltaE) : '',
        remark: initialValues.remark || '',
      });
      setAttachments(initialAttachments);
      setColorImageFiles(parseAttachmentInput(initialValues.colorConfirmImages || ''));
      return;
    }
    setForm(EMPTY_FORM);
    setAttachments([]);
    setColorImageFiles([]);
  }, [initialAttachments, initialValues]);

  const setField = (name: keyof ProofingNoticeFormState, value: string | number | undefined) => {
    setForm((prev) => ({ ...prev, [name]: value as never }));
  };

  const uploadSingleFile = async (file: File) => {
    const res: any = await api.uploadCommonFile(file);
    return {
      fileName: res.originalFilename || res.newFileName || file.name,
      fileUrl: res.url,
      uploaded: true,
    } as NoticeAttachment;
  };

  const handlePictureUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }
    setUploadingPicture(true);
    try {
      const uploaded = await uploadSingleFile(file);
      setField('pictureUrl', uploaded.fileUrl);
      toast.success(t('page.proofingNotice.form.messages.pictureUploaded'));
    } catch (error: any) {
      toast.error(error.message || t('page.proofingNotice.form.messages.uploadFailed'));
    } finally {
      setUploadingPicture(false);
      event.target.value = '';
    }
  };

  const handleColorImageUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (!files.length) {
      return;
    }
    setUploadingColorImages(true);
    try {
      const uploaded = await Promise.all(files.map(uploadSingleFile));
      setColorImageFiles((prev) => {
        const next = [...prev, ...uploaded];
        setField('colorConfirmImages', joinAttachmentUrls(next));
        return next;
      });
      toast.success(t('page.proofingNotice.form.messages.colorImagesUploaded'));
    } catch (error: any) {
      toast.error(error.message || t('page.proofingNotice.form.messages.uploadFailed'));
    } finally {
      setUploadingColorImages(false);
      event.target.value = '';
    }
  };

  const handleAttachmentUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (!files.length) {
      return;
    }
    setUploadingAttachments(true);
    try {
      const uploaded = await Promise.all(files.map(uploadSingleFile));
      setAttachments((prev) => [...prev, ...uploaded]);
      toast.success(t('page.proofingNotice.form.messages.attachmentsUploaded'));
    } catch (error: any) {
      toast.error(error.message || t('page.proofingNotice.form.messages.uploadFailed'));
    } finally {
      setUploadingAttachments(false);
      event.target.value = '';
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, currentIndex) => currentIndex !== index));
  };

  const removeColorImage = (index: number) => {
    setColorImageFiles((prev) => {
      const next = prev.filter((_, currentIndex) => currentIndex !== index);
      setField('colorConfirmImages', joinAttachmentUrls(next));
      return next;
    });
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    try {
      await onSubmit({
        ...form,
        roundNumber: form.roundNumber ? Number(form.roundNumber) : undefined,
        dueDate: form.dueDate || undefined,
        factoryConfirmDate: form.factoryConfirmDate || undefined,
        customerAcceptDeltaE:
          form.customerAcceptDeltaE !== '' ? Number(form.customerAcceptDeltaE) : undefined,
        pictureUrl: form.pictureUrl || undefined,
        colorConfirmImages: form.colorConfirmImages || undefined,
        attachments,
      });
    } finally {
      setLoading(false);
    }
  };

  const labelClassName = 'text-sm font-medium text-slate-700';
  const inputClassName =
    'w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-fuchsia-400';
  const textareaClassName =
    'h-24 w-full resize-none rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-fuchsia-400';

  const Field = ({
    label,
    name,
    type = 'text',
    placeholder,
    step,
  }: {
    label: string;
    name: keyof ProofingNoticeFormState;
    type?: string;
    placeholder?: string;
    step?: string;
  }) => (
    <label className="space-y-2">
      <span className={labelClassName}>{label}</span>
      <input
        aria-label={label}
        type={type}
        value={(form[name] as string | number | undefined) ?? ''}
        onChange={(event) => setField(name, event.target.value)}
        className={inputClassName}
        placeholder={placeholder}
        step={step}
      />
    </label>
  );

  const SelectField = ({
    label,
    name,
    options,
  }: {
    label: string;
    name: keyof ProofingNoticeFormState;
    options: Array<{ value: string; label: string }>;
  }) => (
    <label className="space-y-2">
      <span className={labelClassName}>{label}</span>
      <select
        aria-label={label}
        value={(form[name] as string | number | undefined) ?? ''}
        onChange={(event) => setField(name, event.target.value)}
        className={inputClassName}
      >
        <option value="">{t('common.pleaseSelect')}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );

  const UploadCard = ({
    label,
    hint,
    onChange,
    uploading,
    accept,
    multiple = false,
    icon,
  }: {
    label: string;
    hint: string;
    onChange: (event: ChangeEvent<HTMLInputElement>) => void;
    uploading: boolean;
    accept?: string;
    multiple?: boolean;
    icon: 'image' | 'file';
  }) => (
    <label className="flex cursor-pointer flex-col rounded-2xl border border-dashed border-fuchsia-200 bg-fuchsia-50/40 px-4 py-4 transition hover:border-fuchsia-300 hover:bg-fuchsia-50">
      <input type="file" className="hidden" onChange={onChange} accept={accept} multiple={multiple} />
      <div className="flex items-start gap-3">
        <div className="rounded-2xl bg-white p-2 text-fuchsia-700 shadow-sm">
          {icon === 'image' ? <ImagePlus size={18} /> : <Paperclip size={18} />}
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-slate-900">{label}</p>
          <p className="mt-1 text-xs leading-5 text-slate-500">{hint}</p>
        </div>
        {uploading ? (
          <LoaderCircle size={18} className="animate-spin text-fuchsia-600" />
        ) : (
          <UploadCloud size={18} className="text-fuchsia-600" />
        )}
      </div>
    </label>
  );

  const LinkChip = ({
    item,
    onRemove,
  }: {
    item: NoticeAttachment;
    onRemove: () => void;
  }) => (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2">
      <a
        href={item.fileUrl}
        target="_blank"
        rel="noreferrer"
        className="min-w-0 flex-1 truncate text-sm text-fuchsia-700 underline-offset-4 hover:underline"
      >
        {item.fileName || item.fileUrl}
      </a>
      <button
        type="button"
        onClick={onRemove}
        className="rounded-lg p-1 text-slate-400 hover:bg-red-50 hover:text-red-500"
        aria-label={t('common.delete')}
      >
        <Trash2 size={16} />
      </button>
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="rounded-2xl border border-fuchsia-100 bg-gradient-to-r from-fuchsia-50 via-white to-slate-50 px-5 py-4">
        <p className="text-base font-semibold text-slate-900">{t('page.proofingNotice.form.quickTitle')}</p>
        <p className="mt-2 text-sm leading-6 text-slate-600">{t('page.proofingNotice.form.quickHint')}</p>
      </div>

      <section className="space-y-3">
        <div>
          <h4 className="text-sm font-semibold text-slate-900">{t('page.proofingNotice.form.sections.sampleTask')}</h4>
          <p className="mt-1 text-xs text-slate-500">{t('page.proofingNotice.form.sectionHints.sampleTask')}</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <Field label={t('page.proofingNotice.form.fields.sampleNo')} name="sampleNo" />
          <Field label={t('page.proofingNotice.form.fields.roundNumber')} name="roundNumber" type="number" />
          <Field label={t('page.proofingNotice.form.fields.customerName')} name="customerName" />
          <Field label={t('page.proofingNotice.form.fields.salesName')} name="salesName" />
          <Field label={t('page.proofingNotice.form.fields.bulkOrderNo')} name="bulkOrderNo" />
          <Field label={t('page.proofingNotice.form.fields.styleCode')} name="styleCode" />
          <Field label={t('page.proofingNotice.form.fields.styleCategory')} name="styleCategory" />
          <Field label={t('page.proofingNotice.form.fields.styleSubCategory')} name="styleSubCategory" />
          <Field label={t('page.proofingNotice.form.fields.styleType')} name="styleType" />
          <Field label={t('page.proofingNotice.form.fields.sampleCategoryType')} name="sampleCategoryType" />
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <UploadCard
            label={t('page.proofingNotice.form.fields.pictureUrl')}
            hint={t('page.proofingNotice.form.hints.pictureUrl')}
            onChange={handlePictureUpload}
            uploading={uploadingPicture}
            accept="image/*"
            icon="image"
          />
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm font-semibold text-slate-900">{t('page.proofingNotice.form.previewTitle')}</p>
            {form.pictureUrl ? (
              <div className="mt-3 space-y-3">
                <a
                  href={form.pictureUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="block truncate text-sm text-fuchsia-700 underline-offset-4 hover:underline"
                >
                  {form.pictureUrl}
                </a>
                <img
                  src={form.pictureUrl}
                  alt={t('page.proofingNotice.form.fields.pictureUrl')}
                  className="h-36 w-full rounded-xl border border-slate-200 object-cover"
                />
              </div>
            ) : (
              <p className="mt-3 text-sm text-slate-500">{t('page.proofingNotice.form.empty.pictureUrl')}</p>
            )}
          </div>
        </div>
      </section>

      <section className="space-y-3">
        <div>
          <h4 className="text-sm font-semibold text-slate-900">{t('page.proofingNotice.form.sections.flowControl')}</h4>
          <p className="mt-1 text-xs text-slate-500">{t('page.proofingNotice.form.sectionHints.flowControl')}</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <SelectField
            label={t('page.proofingNotice.form.fields.sampleType')}
            name="sampleType"
            options={[
              { value: '一次打样', label: t('page.proofingNotice.form.options.sampleType.first') },
              { value: '二次打样', label: t('page.proofingNotice.form.options.sampleType.second') },
              { value: '三次打样', label: t('page.proofingNotice.form.options.sampleType.third') },
              { value: '摄影样', label: t('page.proofingNotice.form.options.sampleType.photo') },
            ]}
          />
          <SelectField
            label={t('page.proofingNotice.form.fields.emergencyType')}
            name="emergencyType"
            options={[
              { value: '普通', label: t('page.proofingNotice.form.options.emergency.normal') },
              { value: '加急', label: t('page.proofingNotice.form.options.emergency.urgent') },
              { value: '特急', label: t('page.proofingNotice.form.options.emergency.critical') },
            ]}
          />
          <Field label={t('page.proofingNotice.form.fields.dueDate')} name="dueDate" type="date" />
          <Field label={t('page.proofingNotice.form.fields.factoryConfirmDate')} name="factoryConfirmDate" type="date" />
          <SelectField
            label={t('page.proofingNotice.form.fields.customerApproved')}
            name="customerApproved"
            options={[
              { value: 'Y', label: t('page.proofingNotice.form.options.boolean.yes') },
              { value: 'N', label: t('page.proofingNotice.form.options.boolean.no') },
            ]}
          />
          <SelectField
            label={t('page.proofingNotice.form.fields.factoryConfirmed')}
            name="factoryConfirmed"
            options={[
              { value: 'Y', label: t('page.proofingNotice.form.options.boolean.yes') },
              { value: 'N', label: t('page.proofingNotice.form.options.boolean.no') },
            ]}
          />
          <SelectField
            label={t('page.proofingNotice.form.fields.colorConfirmStatus')}
            name="colorConfirmStatus"
            options={[
              { value: '01待提交', label: t('page.proofingNotice.form.options.colorConfirmStatus.pending') },
              { value: '02客户签样', label: t('page.proofingNotice.form.options.colorConfirmStatus.customerSigned') },
              { value: '03车间比对', label: t('page.proofingNotice.form.options.colorConfirmStatus.workshopCompared') },
              { value: '04允许生产', label: t('page.proofingNotice.form.options.colorConfirmStatus.productionApproved') },
            ]}
          />
          <Field
            label={t('page.proofingNotice.form.fields.lightSourceType')}
            name="lightSourceType"
            placeholder={t('page.proofingNotice.form.placeholders.lightSourceType')}
          />
          <Field
            label={t('page.proofingNotice.form.fields.customerAcceptDeltaE')}
            name="customerAcceptDeltaE"
            type="number"
            step="0.01"
            placeholder={t('page.proofingNotice.form.placeholders.customerAcceptDeltaE')}
          />
        </div>
      </section>

      <section className="space-y-3">
        <div>
          <h4 className="text-sm font-semibold text-slate-900">{t('page.proofingNotice.form.sections.confirmAssets')}</h4>
          <p className="mt-1 text-xs text-slate-500">{t('page.proofingNotice.form.sectionHints.confirmAssets')}</p>
        </div>
        <div className="grid gap-4 lg:grid-cols-[1.2fr_1fr]">
          <div className="space-y-3">
            <UploadCard
              label={t('page.proofingNotice.form.fields.colorConfirmImages')}
              hint={t('page.proofingNotice.form.hints.colorConfirmImages')}
              onChange={handleColorImageUpload}
              uploading={uploadingColorImages}
              accept="image/*"
              multiple
              icon="image"
            />
            <div className="grid gap-2">
              {colorImageFiles.length ? (
                colorImageFiles.map((item, index) => (
                  <LinkChip key={`${item.fileUrl}-${index}`} item={item} onRemove={() => removeColorImage(index)} />
                ))
              ) : (
                <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm text-slate-500">
                  {t('page.proofingNotice.form.empty.colorConfirmImages')}
                </div>
              )}
            </div>
          </div>
          <div className="space-y-3">
            <UploadCard
              label={t('page.proofingNotice.form.fields.attachments')}
              hint={t('page.proofingNotice.form.hints.attachments')}
              onChange={handleAttachmentUpload}
              uploading={uploadingAttachments}
              multiple
              icon="file"
            />
            <div className="grid gap-2">
              {attachments.length ? (
                attachments.map((item, index) => (
                  <LinkChip key={`${item.id ?? item.fileUrl}-${index}`} item={item} onRemove={() => removeAttachment(index)} />
                ))
              ) : (
                <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm text-slate-500">
                  {t('page.proofingNotice.form.empty.attachments')}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-3">
        <div>
          <h4 className="text-sm font-semibold text-slate-900">{t('page.proofingNotice.form.sections.feedback')}</h4>
          <p className="mt-1 text-xs text-slate-500">{t('page.proofingNotice.form.sectionHints.feedback')}</p>
        </div>
        <div className="grid gap-4">
          <label className="space-y-2">
            <span className={labelClassName}>{t('page.proofingNotice.form.fields.customerFeedback')}</span>
            <textarea
              aria-label={t('page.proofingNotice.form.fields.customerFeedback')}
              value={form.customerFeedback}
              onChange={(event) => setField('customerFeedback', event.target.value)}
              className={textareaClassName}
            />
          </label>
          <label className="space-y-2">
            <span className={labelClassName}>{t('page.proofingNotice.form.fields.remark')}</span>
            <textarea
              aria-label={t('page.proofingNotice.form.fields.remark')}
              value={form.remark}
              onChange={(event) => setField('remark', event.target.value)}
              className={textareaClassName}
            />
          </label>
        </div>
      </section>

      <div className="flex justify-end gap-3 border-t border-slate-200 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-xl px-4 py-2 text-sm text-slate-600 hover:bg-slate-100"
        >
          {t('common.cancel')}
        </button>
        <button
          type="submit"
          disabled={loading}
          className="rounded-xl bg-fuchsia-600 px-5 py-2 text-sm text-white hover:bg-fuchsia-700 disabled:opacity-50"
        >
          {loading ? t('common.submitting') : t('common.confirm')}
        </button>
      </div>
    </form>
  );
}
