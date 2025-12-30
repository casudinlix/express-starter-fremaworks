import { Request, Response, NextFunction } from 'express';
import xss, { type IFilterXSSOptions } from 'xss';

const xssOptions: IFilterXSSOptions = {
  whiteList: {
    p: [],
    br: [],
    strong: [],
    em: [],
    u: [],
    a: ['href', 'title', 'target'],
    ul: [],
    ol: [],
    li: [],
  },
  stripIgnoreTag: true,
  stripIgnoreTagBody: ['script', 'style'],
};

const sanitizeObject = (value: unknown): unknown => {
  if (typeof value === 'string') {
    return xss(value, xssOptions);
  }

  if (Array.isArray(value)) {
    return value.map(sanitizeObject);
  }

  if (value !== null && typeof value === 'object') {
    return Object.entries(value).reduce<Record<string, unknown>>((acc, [key, entry]) => {
      acc[key] = sanitizeObject(entry);
      return acc;
    }, {});
  }

  return value;
};

/**
 * Sanitizes body, query, and params to mitigate XSS payloads.
 */
export const xssProtection = (req: Request, _res: Response, next: NextFunction) => {
  if (req.body) {
    req.body = sanitizeObject(req.body);
  }

  if (req.query) {
    req.query = sanitizeObject(req.query) as any;
  }

  if (req.params) {
    req.params = sanitizeObject(req.params) as any;
  }

  next();
};

export default xssProtection;
