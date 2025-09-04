import { z } from 'zod';
import { FormField } from './types';

const parseBounds = (range?: string | null): { min?: number; max?: number } => {
  if (!range) return {};
  const [minRaw, maxRaw] = range.split(':');
  const min = minRaw !== undefined && minRaw !== '' ? Number(minRaw) : undefined;
  const max = maxRaw !== undefined && maxRaw !== '' ? Number(maxRaw) : undefined;
  return { min: isNaN(Number(min)) ? undefined : min, max: isNaN(Number(max)) ? undefined : max } as any;
};

const alphaRegex = /^[a-zA-Z\s]*$/;
const alphanumRegex = /^[a-zA-Z0-9\s]*$/;

const schemaForField = (field: FormField) => {
  const label = field.label;
  const isRequired = !!field.required;

  // Helper to handle optional empty strings gracefully
  const optionalize = (schema: z.ZodTypeAny) =>
    isRequired
      ? schema
      : z
          .union([schema, z.literal('')])
          .transform((v) => (v === '' ? '' : v));

  switch (field.field_type) {
    case 'Text':
    case 'LongText': {
      const { min, max } = parseBounds(field.text_bounds);
      let base: z.ZodString = z.string();
      if (min) base = base.min(min, `${label} must be at least ${min} characters`);
      if (max) base = base.max(max, `${label} must be no more than ${max} characters`);
      let schema: z.ZodTypeAny = base;
      if (isRequired) schema = schema.refine((v: string) => v.trim() !== '', `${label} is required`);
      return optionalize(schema);
    }
    case 'Alpha': {
      const { min, max } = parseBounds(field.text_bounds);
  let base: z.ZodString = z
        .string()
        .regex(alphaRegex, `${label} must contain only letters and spaces`);
  if (min) base = base.min(min, `${label} must be at least ${min} characters`);
  if (max) base = base.max(max, `${label} must be no more than ${max} characters`);
  let schema: z.ZodTypeAny = base;
  if (isRequired) schema = schema.refine((v: string) => v.trim() !== '', `${label} is required`);
  return optionalize(schema);
    }
    case 'Alphanum': {
      const { min, max } = parseBounds(field.text_bounds);
  let base: z.ZodString = z
        .string()
        .regex(
          alphanumRegex,
          `${label} must contain only letters, numbers, and spaces`
        );
  if (min) base = base.min(min, `${label} must be at least ${min} characters`);
  if (max) base = base.max(max, `${label} must be no more than ${max} characters`);
  let schema: z.ZodTypeAny = base;
  if (isRequired) schema = schema.refine((v: string) => v.trim() !== '', `${label} is required`);
  return optionalize(schema);
    }
    case 'Numerical':
    case 'Currency': {
      const { min, max } = parseBounds(field.number_bounds);
  let s: z.ZodTypeAny = z
        .string()
        .refine((v) => v === '' || !isNaN(Number(v)), `${label} must be a valid number`)
        .refine((v) => (v === '' ? true : field.field_type !== 'Currency' || Number(v) >= 0), `${label} must be a positive value`)
        .refine((v) => (v === '' || min === undefined ? true : Number(v) >= (min as number)), `${label} must be at least ${min}`)
        .refine((v) => (v === '' || max === undefined ? true : Number(v) <= (max as number)), `${label} must be no more than ${max}`);
  if (isRequired) s = s.refine((v: string) => v.trim() !== '', `${label} is required`);
      return optionalize(s);
    }
    case 'Email': {
  let base: z.ZodString = z.string().email(`${label} must be a valid email address`);
  let schema: z.ZodTypeAny = base;
  if (isRequired) schema = schema.refine((v: string) => v.trim() !== '', `${label} is required`);
  return optionalize(schema);
    }
    case 'Phone': {
      // Basic E.164-like validation
    let s: z.ZodTypeAny = z
        .string()
        .refine((v) => v === '' || v.startsWith('+'), `${label} must be a valid international phone number`)
        .refine((v) => {
      const digits = v.replace(/\D/g, '');
          return v === '' || (digits.length >= 10 && digits.length <= 15);
        }, `${label} must be a valid phone number`);
    if (isRequired) s = s.refine((v: string) => v.trim() !== '', `${label} is required`);
      return optionalize(s);
    }
    case 'URL': {
  let base: z.ZodString = z.string().url(`${label} must be a valid URL`);
  let schema: z.ZodTypeAny = base;
  if (isRequired) schema = schema.refine((v: string) => v.trim() !== '', `${label} is required`);
  return optionalize(schema);
    }
    case 'Date': {
  let s: z.ZodTypeAny = z
        .string()
        .refine((v) => v === '' || !isNaN(new Date(v).getTime()), `${label} must be a valid date`);
  if (isRequired) s = s.refine((v: string) => v.trim() !== '', `${label} is required`);
      return optionalize(s);
    }
    case 'Select': {
      const options = (field.possible_answers?.split('\\') || []).map((o) => o.trim());
      // Allow empty when optional
  const s: z.ZodTypeAny = z.string().refine((v: string) => v === '' || options.includes(v), `Please select an option for ${label}`);
      return optionalize(s);
    }
    case 'Multiselect': {
      const options = (field.possible_answers?.split('\\') || []).map((o) => o.trim());
      // Values are comma-separated
      let s: z.ZodTypeAny = z
        .string()
        .refine((v) => {
          if (v === '') return true;
          const parts = v
            .split(',')
            .map((p: string) => p.trim())
            .filter((x: string) => Boolean(x));
          return parts.every((p) => options.includes(p));
        }, `Please select valid options for ${label}`);
      if (isRequired)
        s = s.refine((v: string) => v.split(',').map((p: string) => p.trim()).filter((x: string) => Boolean(x)).length > 0, `Please select at least one option for ${label}`);
      return optionalize(s);
    }
    case 'Boolean': {
      // Boolean is represented as '1' | '0' | ''
  let s: z.ZodTypeAny = z.string().refine((v: string) => v === '' || v === '1' || v === '0', `Please select an option for ${label}`);
  if (isRequired) s = s.refine((v: string) => v === '1' || v === '0', `Please select an option for ${label}`);
      return optionalize(s);
    }
    default:
      return optionalize(z.string());
  }
};

export const validateField = (field: FormField, value: string): string | null => {
  const schema = schemaForField(field);
  const res = schema.safeParse(value ?? '');
  if (res.success) return null;
  return res.error.issues[0]?.message || 'Invalid value';
};
