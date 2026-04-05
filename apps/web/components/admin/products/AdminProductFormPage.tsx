'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productsApi } from '@/lib/api/products';
import { categoriesApi } from '@/lib/api/categories';
import { apiClient, getApiErrorMessage } from '@/lib/api/client';
import { slugify } from '@/lib/utils/format';
import toast from 'react-hot-toast';
import {
  Upload, X, Loader2, Check, ArrowLeft, ImageIcon,
  AlertCircle, Bug,
} from 'lucide-react';

interface Props { productId?: string }

// ── Form state — all strings so inputs work naturally ──────────────────────
interface FormState {
  name:            string;
  slug:            string;
  categoryId:      string;
  description:     string;
  basePrice:       string;
  salePrice:       string;
  stockQuantity:   string;
  sku:             string;
  isFeatured:      boolean;
  isActive:        boolean;
  metaTitle:       string;
  metaDescription: string;
  specs:           string;
}

const EMPTY: FormState = {
  name: '', slug: '', categoryId: '', description: '',
  basePrice: '', salePrice: '', stockQuantity: '0', sku: '',
  isFeatured: false, isActive: true,
  metaTitle: '', metaDescription: '',
  specs: '{}',
};

export function AdminProductFormPage({ productId }: Props) {
  const router = useRouter();
  const qc     = useQueryClient();
  const fileRef = useRef<HTMLInputElement>(null);
  const isEdit  = Boolean(productId);

  const [form,       setForm]       = useState<FormState>(EMPTY);
  const [images,     setImages]     = useState<{ url: string; isPrimary: boolean }[]>([]);
  const [uploading,  setUploading]  = useState(false);
  const [specsError, setSpecsError] = useState('');
  const [showDebug,  setShowDebug]  = useState(false);

  // ── Load categories ───────────────────────────────────────────────────────
  const { data: catData, isLoading: catsLoading } = useQuery({
    queryKey:  ['categories-form'],
    queryFn:   () => categoriesApi.getAll(),
    staleTime: 60_000,
  });
  const categories: any[] = (() => {
    const raw = catData?.data ?? catData;
    return Array.isArray(raw) ? raw : [];
  })();

  // ── Load product for edit ─────────────────────────────────────────────────
  const { data: productData, isLoading: productLoading } = useQuery({
    queryKey: ['product-edit', productId],
    queryFn:  () => productsApi.getBySlug(productId!),
    enabled:  isEdit,
  });

  useEffect(() => {
    if (!productData) return;
    const p = (productData as any)?.data ?? productData;
    setForm({
      name:            p.name            ?? '',
      slug:            p.slug            ?? '',
      categoryId:      p.categoryId      ?? '',
      description:     p.description     ?? '',
      basePrice:       String(p.basePrice ?? ''),
      salePrice:       p.salePrice ? String(p.salePrice) : '',
      stockQuantity:   String(p.stockQuantity ?? 0),
      sku:             p.sku             ?? '',
      isFeatured:      p.isFeatured      ?? false,
      isActive:        p.isActive        ?? true,
      metaTitle:       p.metaTitle       ?? '',
      metaDescription: p.metaDescription ?? '',
      specs:           JSON.stringify(p.specs ?? {}, null, 2),
    });
    setImages(
      p.images?.map((img: any) => ({ url: img.url, isPrimary: img.isPrimary })) ?? []
    );
  }, [productData]);

  // ── Generic field setter ──────────────────────────────────────────────────
  const set = (k: keyof FormState) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value }));

  const setCheck = (k: keyof FormState) =>
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.checked }));

  // ── Build payload — converts strings → correct types ─────────────────────
  function buildPayload() {
    let specs: Record<string, any> = {};
    try {
      specs = form.specs.trim() ? JSON.parse(form.specs) : {};
    } catch {
      throw new Error('Invalid JSON in specifications');
    }

    return {
      name:            form.name.trim(),
      slug:            form.slug.trim() || slugify(form.name.trim()),
      categoryId:      form.categoryId,           // UUID string
      description:     form.description.trim() || undefined,
      basePrice:       Number(form.basePrice),    // string → number
      salePrice:       form.salePrice ? Number(form.salePrice) : undefined,
      stockQuantity:   Number(form.stockQuantity),
      sku:             form.sku.trim() || undefined,
      specs,
      isFeatured:      form.isFeatured,
      isActive:        form.isActive,
      metaTitle:       form.metaTitle.trim() || undefined,
      metaDescription: form.metaDescription.trim() || undefined,
      images:          images.map((img, i) => ({
        url:       img.url,
        isPrimary: i === 0,
        sortOrder: i,
      })),
    };
  }

  // ── Image upload ──────────────────────────────────────────────────────────
  const handleImageUpload = async (files: FileList | null) => {
    if (!files?.length) return;
    setUploading(true);
    const uploaded: { url: string; isPrimary: boolean }[] = [];

    for (const file of Array.from(files)) {
      if (!file.type.startsWith('image/')) { toast.error(`${file.name} is not an image`); continue; }
      if (file.size > 5 * 1024 * 1024)    { toast.error(`${file.name} exceeds 5MB`);       continue; }

      const fd = new FormData();
      fd.append('file', file);
      try {
        const res = await apiClient.post('/upload/image', fd, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        const url = res.data?.data?.url ?? res.data?.url;
        if (url) uploaded.push({ url, isPrimary: images.length === 0 && uploaded.length === 0 });
      } catch (err: any) {
        toast.error(`Failed to upload ${file.name}: ${getApiErrorMessage(err)}`);
      }
    }

    if (uploaded.length) {
      setImages((prev) => [...prev, ...uploaded]);
      toast.success(`${uploaded.length} image(s) uploaded`);
    }
    setUploading(false);
  };

  // ── Save mutation ─────────────────────────────────────────────────────────
  const saveMutation = useMutation({
    mutationFn: (payload: any) =>
      isEdit && productId
        ? productsApi.update(productId, payload)
        : productsApi.create(payload),
    onSuccess: () => {
      toast.success(isEdit ? 'Product updated!' : 'Product created!');
      qc.invalidateQueries({ queryKey: ['admin-products'] });
      router.push('/admin/products');
    },
    onError: (e: any) => {
      const msg = getApiErrorMessage(e);
      toast.error(msg, { duration: 6000 });
      console.error('[Product save error]', e?.response?.data ?? e);
    },
  });

  // ── Submit handler ────────────────────────────────────────────────────────
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate category
    if (!form.categoryId) {
      toast.error('Please select a category');
      return;
    }
    // Validate price
    if (!form.basePrice || Number(form.basePrice) <= 0) {
      toast.error('Base price must be greater than 0');
      return;
    }
    // Validate specs JSON
    setSpecsError('');
    let payload: any;
    try {
      payload = buildPayload();
    } catch (err: any) {
      setSpecsError(err.message);
      return;
    }

    // ── CONSOLE DEBUG — always logged so you can inspect in browser DevTools ──
    console.group('[Furnishop] Product form submit');
    console.log('Form state:', form);
    console.log('Payload sent to API:', payload);
    console.log('Category selected:', categories.find((c) => c.id === form.categoryId));
    console.groupEnd();
    // ─────────────────────────────────────────────────────────────────────────

    saveMutation.mutate(payload);
  };

  // ── Validation helpers ────────────────────────────────────────────────────
  const validationErrors: string[] = [];
  if (!form.categoryId)                 validationErrors.push('Category is required');
  if (!form.name.trim())                validationErrors.push('Product name is required');
  if (!form.basePrice || Number(form.basePrice) <= 0) validationErrors.push('Base price must be > 0');

  const canSubmit = validationErrors.length === 0 && !saveMutation.isPending;

  if (isEdit && productLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={24} className="animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="text-gray-400 hover:text-gray-600 transition"
        >
          <ArrowLeft size={18} />
        </button>
        <h1 className="text-xl font-medium">
          {isEdit ? 'Edit product' : 'Add new product'}
        </h1>

        {/* Debug toggle — helpful during development */}
        <button
          type="button"
          onClick={() => setShowDebug(!showDebug)}
          title="Toggle debug panel"
          className="ml-auto flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600"
        >
          <Bug size={12} />
          Debug
        </button>
      </div>

      {/* Debug panel */}
      {showDebug && (
        <div className="bg-gray-900 text-green-400 rounded-xl p-4 text-xs font-mono overflow-auto max-h-60">
          <p className="text-gray-500 mb-2">// Live form state — updates as you type</p>
          <pre>{JSON.stringify({ ...form, categories_loaded: categories.length }, null, 2)}</pre>
        </div>
      )}

      {/* Validation summary */}
      {validationErrors.length > 0 && form.name && (
        <div className="flex items-start gap-2 rounded-xl bg-amber-50 border border-amber-200 p-3 text-sm text-amber-800">
          <AlertCircle size={15} className="flex-shrink-0 mt-0.5" />
          <ul className="space-y-0.5">
            {validationErrors.map((err) => <li key={err}>• {err}</li>)}
          </ul>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">

        {/* ── Basic information ───────────────────────────────────────────── */}
        <section className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="font-medium mb-4">Basic information</h2>
          <div className="grid gap-4 sm:grid-cols-2">

            {/* Name */}
            <div>
              <label className="form-label">Product name *</label>
              <input
                required
                className="form-input"
                placeholder="e.g. KLIPPAN Sofa"
                value={form.name}
                onChange={(e) => {
                  const name = e.target.value;
                  setForm((f) => ({
                    ...f,
                    name,
                    // Auto-fill slug only if user hasn't manually edited it
                    slug: f.slug === slugify(f.name) || f.slug === ''
                      ? slugify(name)
                      : f.slug,
                  }));
                }}
              />
            </div>

            {/* Slug */}
            <div>
              <label className="form-label">URL slug *</label>
              <input
                required
                className="form-input font-mono text-sm"
                placeholder="klippan-sofa"
                value={form.slug}
                onChange={set('slug')}
              />
              <p className="text-xs text-gray-400 mt-1">
                URL: /products/<span className="text-gray-600">{form.slug || 'your-slug'}</span>
              </p>
            </div>

            {/* Category */}
            <div>
              <label className="form-label">Category *</label>
              <select
                required
                className={`form-input ${!form.categoryId ? 'border-amber-300' : ''}`}
                value={form.categoryId}
                onChange={set('categoryId')}
              >
                <option value="">
                  {catsLoading ? 'Loading categories...' : '— Select a category —'}
                </option>
                {categories.map((c: any) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              {!catsLoading && categories.length === 0 && (
                <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                  <AlertCircle size={11} />
                  No categories found.{' '}
                  <a href="/admin/categories" className="underline font-medium">
                    Create one first
                  </a>
                </p>
              )}
              {form.categoryId && (
                <p className="mt-1 text-xs text-green-600">
                  ✓ {categories.find((c) => c.id === form.categoryId)?.name}
                </p>
              )}
            </div>

            {/* SKU */}
            <div>
              <label className="form-label">SKU</label>
              <input
                className="form-input font-mono text-sm"
                placeholder="e.g. KLP-GRY-2S"
                value={form.sku}
                onChange={set('sku')}
              />
            </div>

            {/* Description */}
            <div className="sm:col-span-2">
              <label className="form-label">Description</label>
              <textarea
                rows={3}
                className="form-input resize-none"
                placeholder="Describe this product..."
                value={form.description}
                onChange={set('description')}
              />
            </div>
          </div>
        </section>

        {/* ── Pricing & inventory ─────────────────────────────────────────── */}
        <section className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="font-medium mb-4">Pricing & inventory</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="form-label">Base price (₹) *</label>
              <input
                required
                type="number"
                min="1"
                step="1"
                className={`form-input ${!form.basePrice || Number(form.basePrice) <= 0 ? 'border-amber-300' : ''}`}
                placeholder="14999"
                value={form.basePrice}
                onChange={set('basePrice')}
              />
            </div>
            <div>
              <label className="form-label">Sale price (₹)</label>
              <input
                type="number"
                min="0"
                step="1"
                className="form-input"
                placeholder="Leave blank for no sale"
                value={form.salePrice}
                onChange={set('salePrice')}
              />
              {form.salePrice && form.basePrice && Number(form.salePrice) >= Number(form.basePrice) && (
                <p className="text-xs text-amber-600 mt-1">Sale price should be less than base price</p>
              )}
            </div>
            <div>
              <label className="form-label">Stock quantity *</label>
              <input
                required
                type="number"
                min="0"
                step="1"
                className="form-input"
                value={form.stockQuantity}
                onChange={set('stockQuantity')}
              />
            </div>
          </div>

          {/* Price preview */}
          {form.basePrice && Number(form.basePrice) > 0 && (
            <div className="mt-3 p-3 bg-gray-50 rounded-lg text-sm text-gray-600">
              <span>Customer sees: </span>
              {form.salePrice && Number(form.salePrice) > 0 ? (
                <>
                  <span className="font-medium text-green-700">
                    ₹{Number(form.salePrice).toLocaleString('en-IN')}
                  </span>
                  <span className="ml-2 line-through text-gray-400">
                    ₹{Number(form.basePrice).toLocaleString('en-IN')}
                  </span>
                  <span className="ml-2 text-green-600 font-medium">
                    ({Math.round((1 - Number(form.salePrice) / Number(form.basePrice)) * 100)}% off)
                  </span>
                </>
              ) : (
                <span className="font-medium">₹{Number(form.basePrice).toLocaleString('en-IN')}</span>
              )}
            </div>
          )}
        </section>

        {/* ── Product images ──────────────────────────────────────────────── */}
        <section className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="font-medium mb-4">Product images</h2>
          <div
            onClick={() => fileRef.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => { e.preventDefault(); handleImageUpload(e.dataTransfer.files); }}
            className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center cursor-pointer hover:border-[#0058A3] transition"
          >
            <input
              ref={fileRef}
              type="file"
              multiple
              accept="image/*"
              className="hidden"
              onChange={(e) => handleImageUpload(e.target.files)}
            />
            {uploading ? (
              <div className="flex flex-col items-center gap-2">
                <Loader2 size={24} className="animate-spin text-[#0058A3]" />
                <p className="text-sm text-gray-500">Uploading...</p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <Upload size={24} className="text-gray-400" />
                <p className="text-sm text-gray-500">Drag & drop or click to upload</p>
                <p className="text-xs text-gray-400">JPG, PNG, WEBP · Max 5MB each</p>
              </div>
            )}
          </div>

          {images.length > 0 && (
            <div className="mt-4 grid grid-cols-4 gap-3">
              {images.map((img, i) => (
                <div
                  key={i}
                  className={`relative rounded-lg overflow-hidden border-2 ${
                    i === 0 ? 'border-[#0058A3]' : 'border-transparent'
                  }`}
                >
                  <div className="aspect-square bg-gray-100">
                    <img src={img.url} alt="" className="w-full h-full object-cover" />
                  </div>
                  {i === 0 && (
                    <span className="absolute top-1 left-1 bg-[#0058A3] text-white text-[9px] px-1.5 py-0.5 rounded">
                      Primary
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => setImages((prev) => prev.filter((_, j) => j !== i))}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-0.5 hover:bg-red-600"
                  >
                    <X size={10} />
                  </button>
                </div>
              ))}
            </div>
          )}
          {images.length === 0 && (
            <p className="mt-2 text-xs text-gray-400 flex items-center gap-1">
              <ImageIcon size={11} /> Images are optional — first uploaded becomes primary
            </p>
          )}
        </section>

        {/* ── Specifications ──────────────────────────────────────────────── */}
        <section className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="font-medium mb-1">Specifications (JSON)</h2>
          <p className="text-xs text-gray-400 mb-3">
            Optional. Example: {`{"material":"oak","width":"180cm","color":"grey"}`}
          </p>
          <textarea
            rows={4}
            className={`form-input font-mono text-xs resize-none ${specsError ? 'border-red-400' : ''}`}
            value={form.specs}
            onChange={(e) => { set('specs')(e); setSpecsError(''); }}
          />
          {specsError && (
            <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
              <AlertCircle size={11} /> {specsError}
            </p>
          )}
        </section>

        {/* ── SEO ────────────────────────────────────────────────────────── */}
        <section className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="font-medium mb-4">SEO (optional)</h2>
          <div className="space-y-3">
            <div>
              <label className="form-label">
                Meta title <span className="text-gray-400">({form.metaTitle.length}/160)</span>
              </label>
              <input
                className="form-input"
                maxLength={160}
                placeholder={form.name || 'Product meta title'}
                value={form.metaTitle}
                onChange={set('metaTitle')}
              />
            </div>
            <div>
              <label className="form-label">
                Meta description <span className="text-gray-400">({form.metaDescription.length}/320)</span>
              </label>
              <textarea
                rows={2}
                className="form-input resize-none"
                maxLength={320}
                value={form.metaDescription}
                onChange={set('metaDescription')}
              />
            </div>
          </div>
        </section>

        {/* ── Visibility ─────────────────────────────────────────────────── */}
        <section className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="font-medium mb-3">Visibility</h2>
          <div className="flex flex-wrap gap-6">
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                className="w-4 h-4 rounded accent-[#0058A3]"
                checked={form.isActive}
                onChange={setCheck('isActive')}
              />
              Active (visible to customers)
            </label>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                className="w-4 h-4 rounded accent-[#0058A3]"
                checked={form.isFeatured}
                onChange={setCheck('isFeatured')}
              />
              Featured (shown on homepage)
            </label>
          </div>
        </section>

        {/* ── Actions ────────────────────────────────────────────────────── */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="border border-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm hover:bg-gray-50 transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!canSubmit}
            className="flex items-center gap-2 bg-[#0058A3] text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-[#004f93] transition disabled:opacity-50 disabled:cursor-not-allowed"
            title={validationErrors.length > 0 ? validationErrors.join(', ') : ''}
          >
            {saveMutation.isPending ? (
              <><Loader2 size={14} className="animate-spin" /> Saving...</>
            ) : (
              <><Check size={14} /> {isEdit ? 'Update product' : 'Create product'}</>
            )}
          </button>

          {/* What will be sent — visible on hover in debug mode */}
          {showDebug && (
            <button
              type="button"
              onClick={() => {
                try {
                  const p = buildPayload();
                  console.log('[Debug] Payload preview:', p);
                  toast.success('Payload logged to console (F12)');
                } catch (err: any) {
                  toast.error(err.message);
                }
              }}
              className="text-xs text-gray-400 hover:text-gray-600 border border-dashed border-gray-300 px-3 py-2 rounded-lg"
            >
              Log payload
            </button>
          )}
        </div>

        {/* Error state from mutation */}
        {saveMutation.isError && (
          <div className="flex items-start gap-2 rounded-xl bg-red-50 border border-red-200 p-4 text-sm text-red-800">
            <AlertCircle size={15} className="flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium mb-1">Product save failed</p>
              <p>{getApiErrorMessage(saveMutation.error)}</p>
              <p className="text-xs text-red-600 mt-1">
                Open browser DevTools → Console for full details.
              </p>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
