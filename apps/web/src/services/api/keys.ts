'use server';

import type { ApiKeyCreate, ApiKeyListItem, ApiKeyListResponse, ApiKeyResponse } from '@hookly/api-types';
import { headers } from 'next/headers';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export async function getApiKeys(query: {
  search?: string;
  page: number;
  size: number;
}): Promise<{ data: ApiKeyListItem[]; pagination: ApiKeyListResponse['pagination'] }> {
  const url = new URL(`${BASE_URL}/app/api-key`);

  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined) {
      url.searchParams.append(key, String(value));
    }
  });

  const headersList = await headers();
  const res = await fetch(url.toString(), {
    headers: {
      'Content-Type': 'application/json',
      Cookie: headersList.get('cookie') || '',
    },
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch API keys: ${res.statusText}`);
  }

  const body: ApiKeyListResponse = await res.json();
  return { data: body.keys, pagination: body.pagination };
}

export async function createApiKey(
  data: ApiKeyCreate,
): Promise<{ error?: string; key?: ApiKeyResponse['key'] }> {
  const headersList = await headers();
  const res = await fetch(`${BASE_URL}/app/api-key`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Cookie: headersList.get('cookie') || '',
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    let message = 'Unexpected error';

    try {
      const errorBody = await res.json();
      message = errorBody.message ?? message;
    } catch { }

    if (res.status === 403 || res.status === 400) {
      return { error: message };
    }

    throw new Error(message);
  }

  const body: ApiKeyResponse = await res.json();
  return { key: body.key };
}

export async function revokeApiKey(id: string): Promise<{ error?: string }> {
  const headersList = await headers();
  const res = await fetch(`${BASE_URL}/app/api-key/${id}`, {
    method: 'DELETE',
    headers: {
      Cookie: headersList.get('cookie') || '',
    },
  });

  if (!res.ok) {
    let message = 'Unexpected error';

    try {
      const errorBody = await res.json();
      message = errorBody.message ?? message;
    } catch { }

    return { error: message };
  }

  return {};
}
