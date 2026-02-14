import { z } from 'zod';

export const ItemSchema = z.object({
    id: z.string(),
    label: z.string().min(1, "Label cannot be empty"),
    checked: z.boolean().default(false),
    checkedAt: z.string().datetime().nullable().optional(),
    createdAt: z.string().datetime().optional(),
});

export const TopicSchema = z.object({
    id: z.string(),
    title: z.string().min(1, "Title cannot be empty").max(200),
    items: z.array(ItemSchema),
    notes: z.string().default(''),
    priority: z.enum(['Low', 'Medium', 'High']).default('Medium'),
    dueDate: z.string().optional().nullable(),
    collapsed: z.boolean().default(false),
    createdAt: z.string().datetime().optional(),
    templateVersion: z.number().optional(),
});

export const SubjectSchema = z.object({
    id: z.string(),
    name: z.string().min(1, "Subject name cannot be empty"),
    topics: z.array(TopicSchema),
    collapsed: z.boolean().default(false),
});

export const ClassSchema = z.object({
    id: z.string(),
    name: z.string().min(1, "Class name cannot be empty"),
    subjects: z.array(SubjectSchema),
    collapsed: z.boolean().default(false),
    archived: z.boolean().default(false),
});

export const AppStateSchema = z.object({
    version: z.number(),
    templateVersion: z.number().optional(),
    classes: z.array(ClassSchema),
    template: z.array(z.object({
        id: z.string(),
        label: z.string()
    })).optional(),
    userProfile: z.object({
        name: z.string()
    }).optional(),
    quickInbox: z.array(z.object({
        id: z.string(),
        text: z.string(),
        createdAt: z.string().datetime()
    })).optional().default([]),
});