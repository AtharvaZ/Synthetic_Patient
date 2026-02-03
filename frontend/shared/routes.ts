import { z } from 'zod';
import { insertMessageSchema, insertUserSchema, cases, chats, messages } from './schema';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

export const api = {
  cases: {
    list: {
      method: 'GET' as const,
      path: '/api/cases',
      responses: {
        200: z.array(z.custom<typeof cases.$inferSelect>()),
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/cases/:id',
      responses: {
        200: z.custom<typeof cases.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
  },
  chats: {
    create: {
      method: 'POST' as const,
      path: '/api/chats',
      input: z.object({ caseId: z.number() }),
      responses: {
        201: z.custom<typeof chats.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/chats/:id',
      responses: {
        200: z.custom<typeof chats.$inferSelect & { messages: typeof messages.$inferSelect[] }>(),
        404: errorSchemas.notFound,
      },
    },
  },
  messages: {
    create: {
      method: 'POST' as const,
      path: '/api/chats/:id/messages',
      input: insertMessageSchema.omit({ chatId: true }),
      responses: {
        201: z.custom<typeof messages.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
  },
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
