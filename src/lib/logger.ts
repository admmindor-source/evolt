export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export const PII_KEYS: readonly string[] = [
  'email',
  'e_mail',
  'whatsapp',
  'phone',
  'telefone',
  'password',
  'senha',
  'token',
  'access_token',
  'refresh_token',
  'authorization',
];

const PII_KEY_SET = new Set(PII_KEYS.map((k) => k.toLowerCase()));
const REDACTED = '[REDACTED]';

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

export function redact(input: unknown): unknown {
  if (input === null || input === undefined) return input;
  if (Array.isArray(input)) return input.map((item) => redact(item));
  if (isPlainObject(input)) {
    const out: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(input)) {
      if (PII_KEY_SET.has(key.toLowerCase())) {
        out[key] = REDACTED;
      } else {
        out[key] = redact(value);
      }
    }
    return out;
  }
  // Primitives (string, number, boolean) returned as-is.
  return input;
}

function emit(level: LogLevel, message: string, meta?: Record<string, unknown>) {
  const payload: Record<string, unknown> = {
    level,
    msg: message,
    ts: new Date().toISOString(),
  };
  if (meta !== undefined) payload.meta = redact(meta);
  // Single JSON line per log; goes to stdout for `info`/`debug`, stderr for `warn`/`error`.
  const line = JSON.stringify(payload);
  if (level === 'error' || level === 'warn') {
    process.stderr.write(line + '\n');
  } else {
    process.stdout.write(line + '\n');
  }
}

export const logger = {
  debug(msg: string, meta?: Record<string, unknown>) { emit('debug', msg, meta); },
  info(msg: string, meta?: Record<string, unknown>) { emit('info', msg, meta); },
  warn(msg: string, meta?: Record<string, unknown>) { emit('warn', msg, meta); },
  error(msg: string, meta?: Record<string, unknown>) { emit('error', msg, meta); },
};
