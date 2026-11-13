import { defineCollection, z } from 'astro:content';

const paintings = defineCollection({
  type: 'content',
  schema: z.object({
    id: z.string().min(1).optional(),
    title: z.string().min(1).default('Untitled'),
    date: z.union([z.string(), z.date()]),
    image: z.string().min(1),
    medium: z.string().optional(),
    dimensions: z.string().optional(),
    tags: z.array(z.string()).optional().default([]),
    priorityOrder: z.number().optional(),
    hidden: z.boolean().optional().default(false),
  }),
});

export const collections = {
  paintings,
};
