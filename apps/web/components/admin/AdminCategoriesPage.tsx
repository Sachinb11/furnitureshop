'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { categoriesApi } from '@/lib/api/categories';
import { getApiErrorMessage } from '@/lib/api/client';
import { slugify } from '@/lib/utils/format';
import toast from 'react-hot-toast';
import { Plus, Edit2, Trash2, X, Loader2, Check } from 'lucide-react';

interface Category { id: string; name: string; slug: string; isActive: boolean; parent?: any; children?: any[] }

interface FormState {
  name:        string;
  slug:        string;
  description: string;
  parentId:    string;
  sortOrder:   string;
}

const EMPTY_FORM: FormState = { name: '', slug: '', description: '', parentId: '', sortOrder: '0' };

export function AdminCategoriesPage() {
  const qc = useQueryClient();
  const [form,    setForm]    = useState<FormState>(EMPTY_FORM);
  const [editId,  setEditId]  = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey:  ['admin-categories'],
    queryFn:   () => categoriesApi.getAll(),
    staleTime: 30_000,
  });

  const categories: Category[] = (() => {
    const raw = data?.data ?? data;
    return Array.isArray(raw) ? raw : [];
  })();

  const saveMutation = useMutation({
    mutationFn: (d: any) =>
      editId ? categoriesApi.update(editId, d) : categoriesApi.create(d),
    onSuccess: () => {
      toast.success(editId ? 'Category updated' : 'Category created');
      qc.invalidateQueries({ queryKey: ['admin-categories'] });
      resetForm();
    },
    onError: (e: any) => toast.error(getApiErrorMessage(e)),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => categoriesApi.delete(id),
    onSuccess:  () => {
      toast.success('Category deleted');
      qc.invalidateQueries({ queryKey: ['admin-categories'] });
    },
    onError: (e: any) => toast.error(getApiErrorMessage(e)),
  });

  const resetForm = () => {
    setForm(EMPTY_FORM);
    setEditId(null);
    setShowForm(false);
  };

  const startEdit = (cat: Category) => {
    setForm({
      name:        cat.name,
      slug:        cat.slug,
      description: '',
      parentId:    cat.parent?.id ?? '',
      sortOrder:   '0',
    });
    setEditId(cat.id);
    setShowForm(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) { toast.error('Name is required'); return; }
    saveMutation.mutate({
      name:        form.name.trim(),
      slug:        form.slug.trim() || slugify(form.name),
      description: form.description,
      parentId:    form.parentId || undefined,
      sortOrder:   parseInt(form.sortOrder) || 0,
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-medium">Categories</h1>
        <button
          onClick={() => { resetForm(); setShowForm(true); }}
          className="flex items-center gap-1.5 bg-[#0058A3] text-white text-sm px-4 py-2 rounded-lg hover:bg-[#004f93] transition"
        >
          <Plus size={14} /> Add category
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-medium">{editId ? 'Edit category' : 'New category'}</h2>
            <button onClick={resetForm} className="text-gray-400 hover:text-gray-600">
              <X size={16} />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="form-label">Name *</label>
              <input
                required
                className="form-input"
                value={form.name}
                onChange={(e) => {
                  const name = e.target.value;
                  setForm((f) => ({ ...f, name, slug: f.slug || slugify(name) }));
                }}
              />
            </div>
            <div>
              <label className="form-label">Slug *</label>
              <input
                required
                className="form-input font-mono text-sm"
                value={form.slug}
                onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
                placeholder="auto-generated"
              />
            </div>
            <div>
              <label className="form-label">Description</label>
              <input
                className="form-input"
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              />
            </div>
            <div>
              <label className="form-label">Parent category</label>
              <select
                className="form-input"
                value={form.parentId}
                onChange={(e) => setForm((f) => ({ ...f, parentId: e.target.value }))}
              >
                <option value="">None (top-level)</option>
                {categories
                  .filter((c) => c.id !== editId)
                  .map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
              </select>
            </div>
            <div className="sm:col-span-2 flex gap-3">
              <button
                type="submit"
                disabled={saveMutation.isPending}
                className="flex items-center gap-1.5 bg-[#0058A3] text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-[#004f93] disabled:opacity-60"
              >
                {saveMutation.isPending
                  ? <><Loader2 size={14} className="animate-spin" /> Saving...</>
                  : <><Check size={14} /> {editId ? 'Update' : 'Create'}</>}
              </button>
              <button type="button" onClick={resetForm} className="text-sm text-gray-500 hover:text-gray-700 px-3">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
              <th className="px-5 py-3 text-left">Name</th>
              <th className="px-5 py-3 text-left">Slug</th>
              <th className="px-5 py-3 text-left">Parent</th>
              <th className="px-5 py-3 text-left">Status</th>
              <th className="px-5 py-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {isLoading ? (
              [...Array(4)].map((_, i) => (
                <tr key={i}><td colSpan={5} className="px-5 py-4">
                  <div className="h-4 bg-gray-100 rounded animate-pulse" />
                </td></tr>
              ))
            ) : categories.length === 0 ? (
              <tr><td colSpan={5} className="px-5 py-12 text-center text-gray-400">
                No categories. Click "Add category" to create one.
              </td></tr>
            ) : (
              categories.map((cat) => (
                <tr key={cat.id} className="hover:bg-gray-50 transition">
                  <td className="px-5 py-3 font-medium">{cat.name}</td>
                  <td className="px-5 py-3 font-mono text-xs text-gray-400">{cat.slug}</td>
                  <td className="px-5 py-3 text-gray-500 text-xs">{cat.parent?.name ?? '—'}</td>
                  <td className="px-5 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${cat.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {cat.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => startEdit(cat)}
                        className="flex items-center gap-1 text-xs border border-gray-200 px-2 py-1 rounded hover:bg-gray-50"
                      >
                        <Edit2 size={11} /> Edit
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Delete "${cat.name}"?`)) deleteMutation.mutate(cat.id);
                        }}
                        className="flex items-center gap-1 text-xs text-red-500 border border-red-200 px-2 py-1 rounded hover:bg-red-50"
                      >
                        <Trash2 size={11} /> Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
