import { supabase } from '@/lib/supabase';
import type {
  CreateProductInput,
  Product,
  UpdateProductInput,
} from '@/types/database';
import { slugify } from '@/utils/format';

function normalizeProduct(row: Record<string, unknown>): Product {
  return {
    id: String(row.id),
    name: String(row.name),
    slug: String(row.slug),
    description: String(row.description ?? ''),
    price: Number(row.price ?? 0),
    stock: Number(row.stock ?? 0),
    image_url: String(row.image_url ?? ''),
    is_active: Boolean(row.is_active),
    created_at: String(row.created_at),
    updated_at: row.updated_at ? String(row.updated_at) : undefined,
  };
}

export async function getActiveProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Gagal memuat katalog produk: ${error.message}`);
  }

  return (data ?? []).map((row) => normalizeProduct(row as Record<string, unknown>));
}

export async function getAllProductsAdmin(): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Gagal memuat daftar produk admin: ${error.message}`);
  }

  return (data ?? []).map((row) => normalizeProduct(row as Record<string, unknown>));
}

export async function createProduct(input: CreateProductInput): Promise<Product> {
  const baseSlug = input.slug?.trim() ? slugify(input.slug) : slugify(input.name);
  const uniqueSuffix = Math.random().toString(36).slice(2, 6);
  const finalSlug = baseSlug || `produk-${uniqueSuffix}`;

  const payload = {
    name: input.name.trim(),
    slug: finalSlug,
    description: input.description.trim(),
    price: Number(input.price),
    stock: Number(input.stock),
    image_url: input.image_url.trim(),
    is_active: input.is_active,
  };

  const { data, error } = await supabase
    .from('products')
    .insert(payload)
    .select('*')
    .single();

  if (error) {
    if (error.code === '23505') {
      const retryPayload = { ...payload, slug: `${finalSlug}-${uniqueSuffix}` };
      const retry = await supabase
        .from('products')
        .insert(retryPayload)
        .select('*')
        .single();

      if (retry.error) {
        throw new Error(`Gagal menambahkan produk: ${retry.error.message}`);
      }
      return normalizeProduct(retry.data as Record<string, unknown>);
    }
    throw new Error(`Gagal menambahkan produk: ${error.message}`);
  }

  return normalizeProduct(data as Record<string, unknown>);
}

export async function updateProduct(
  id: string,
  input: UpdateProductInput
): Promise<Product> {
  const payload: Record<string, unknown> = {};

  if (input.name !== undefined) payload.name = input.name.trim();
  if (input.slug !== undefined) payload.slug = slugify(input.slug);
  if (input.description !== undefined) payload.description = input.description.trim();
  if (input.price !== undefined) payload.price = Number(input.price);
  if (input.stock !== undefined) payload.stock = Number(input.stock);
  if (input.image_url !== undefined) payload.image_url = input.image_url.trim();
  if (input.is_active !== undefined) payload.is_active = input.is_active;

  const { data, error } = await supabase
    .from('products')
    .update(payload)
    .eq('id', id)
    .select('*')
    .single();

  if (error) {
    throw new Error(`Gagal memperbarui produk: ${error.message}`);
  }

  return normalizeProduct(data as Record<string, unknown>);
}

export async function deleteProduct(id: string): Promise<void> {
  const { error } = await supabase.from('products').delete().eq('id', id);

  if (error) {
    if (error.code === '23503') {
      throw new Error(
        'Produk tidak dapat dihapus karena sudah terhubung dengan riwayat pesanan. Nonaktifkan produk sebagai gantinya.'
      );
    }
    throw new Error(`Gagal menghapus produk: ${error.message}`);
  }
}
