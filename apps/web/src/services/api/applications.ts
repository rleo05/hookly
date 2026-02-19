'use server';

import type { ApplicationItem, ApplicationList, CreateApplication, UpdateApplication } from '@hookly/api-types';
import { headers } from 'next/headers';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export async function getApplications(query: {
  search?: string;
  page: number;
  size: number;
}): Promise<{ data: ApplicationItem[]; pagination: ApplicationList['pagination'] }> {
  const url = new URL(`${BASE_URL}/app/application`);

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
    throw new Error(`Failed to fetch applications: ${res.statusText}`);
  }

  const body: ApplicationList = await res.json();
  return { data: body.applications, pagination: body.pagination };
}

export async function createApplication(data: CreateApplication): Promise<{ error?: string }> {
  const headersList = await headers();
  const res = await fetch(`${BASE_URL}/app/application`, {
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

    if (res.status === 409 || res.status === 400) {
      return { error: message };
    }

    throw new Error(message);
  }

  return res.json();
}

export async function getApplication(appId: string) {
  const headersList = await headers();
  const res = await fetch(`${BASE_URL}/app/application/${appId}`, {
    headers: {
      'Content-Type': 'application/json',
      Cookie: headersList.get('cookie') || '',
    },
  });

  if (!res.ok) {
    throw new Error(`Failed to get application: ${res.statusText}`);
  }

  return res.json();
}

export async function deleteApplication(appId: string): Promise<{ error?: string }> {
  const headersList = await headers();
  const res = await fetch(`${BASE_URL}/app/application/${appId}`, {
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

export async function updateApplication(
  appId: string,
  data: UpdateApplication,
): Promise<{ error?: string }> {
  const headersList = await headers();
  const res = await fetch(`${BASE_URL}/app/application/${appId}`, {
    method: 'PUT',
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

    if (res.status === 409 || res.status === 400) {
      return { error: message };
    }

    throw new Error(message);
  }

  return res.json();
}
