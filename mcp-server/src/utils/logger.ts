/**
 * Structured Logger for MCP Server
 *
 * Provides consistent, structured logging with timing support.
 * All logs are written to stderr to avoid interfering with MCP protocol on stdout.
 */

/**
 * Log levels supported by the logger
 */
export type LogLevel = "debug" | "info" | "warn" | "error";

/**
 * Structured log entry
 */
export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: string;
  duration_ms?: number;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
  data?: Record<string, unknown>;
}

/**
 * Logger configuration
 */
export interface LoggerConfig {
  /**
   * Minimum log level to output
   */
  minLevel: LogLevel;

  /**
   * Whether to output as JSON (for production) or pretty-print (for development)
   */
  jsonOutput: boolean;

  /**
   * Context prefix for all log messages (e.g., "mcp-server")
   */
  context: string;
}

/**
 * Log level priority for filtering
 */
const LOG_LEVEL_PRIORITY: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

/**
 * Default logger configuration
 */
const DEFAULT_CONFIG: LoggerConfig = {
  minLevel: (process.env.LOG_LEVEL as LogLevel) || "info",
  jsonOutput: process.env.NODE_ENV === "production",
  context: "ray-so-mcp",
};

/**
 * Current logger configuration
 */
let config: LoggerConfig = { ...DEFAULT_CONFIG };

/**
 * Configure the logger
 */
export function configureLogger(newConfig: Partial<LoggerConfig>): void {
  config = { ...config, ...newConfig };
}

/**
 * Gets the current configuration (for testing)
 */
export function getLoggerConfig(): LoggerConfig {
  return { ...config };
}

/**
 * Formats a log entry for output
 */
function formatLogEntry(entry: LogEntry): string {
  if (config.jsonOutput) {
    return JSON.stringify(entry);
  }

  // Pretty-print for development
  const parts: string[] = [`[${entry.timestamp}]`, `[${entry.level.toUpperCase()}]`];

  if (entry.context) {
    parts.push(`[${entry.context}]`);
  }

  parts.push(entry.message);

  if (entry.duration_ms !== undefined) {
    parts.push(`(${entry.duration_ms}ms)`);
  }

  let output = parts.join(" ");

  if (entry.data && Object.keys(entry.data).length > 0) {
    output += "\n  " + JSON.stringify(entry.data);
  }

  if (entry.error) {
    output += `\n  Error: ${entry.error.name}: ${entry.error.message}`;
    if (entry.error.stack) {
      output += `\n  Stack: ${entry.error.stack}`;
    }
  }

  return output;
}

/**
 * Writes a log entry to stderr
 */
function writeLog(entry: LogEntry): void {
  // Check if log level meets minimum
  if (LOG_LEVEL_PRIORITY[entry.level] < LOG_LEVEL_PRIORITY[config.minLevel]) {
    return;
  }

  const formatted = formatLogEntry(entry);
  process.stderr.write(formatted + "\n");
}

/**
 * Creates a log entry with common fields
 */
function createEntry(
  level: LogLevel,
  message: string,
  options?: {
    context?: string;
    duration_ms?: number;
    error?: Error;
    data?: Record<string, unknown>;
  },
): LogEntry {
  const entry: LogEntry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    context: options?.context || config.context,
  };

  if (options?.duration_ms !== undefined) {
    entry.duration_ms = options.duration_ms;
  }

  if (options?.error) {
    entry.error = {
      name: options.error.name,
      message: options.error.message,
      stack: options.error.stack,
    };
  }

  if (options?.data) {
    entry.data = options.data;
  }

  return entry;
}

/**
 * Log a debug message
 */
export function debug(message: string, data?: Record<string, unknown>): void {
  writeLog(createEntry("debug", message, { data }));
}

/**
 * Log an info message
 */
export function info(message: string, data?: Record<string, unknown>): void {
  writeLog(createEntry("info", message, { data }));
}

/**
 * Log a warning message
 */
export function warn(message: string, data?: Record<string, unknown>): void {
  writeLog(createEntry("warn", message, { data }));
}

/**
 * Log an error message with optional error object and stack trace
 */
export function error(message: string, err?: Error, data?: Record<string, unknown>): void {
  writeLog(createEntry("error", message, { error: err, data }));
}

/**
 * Log a timed operation. Returns a function to call when the operation completes.
 *
 * @example
 * const done = logger.time("Processing request", { requestId: "123" });
 * await processRequest();
 * done(); // Logs with duration
 */
export function time(
  message: string,
  data?: Record<string, unknown>,
): (additionalData?: Record<string, unknown>) => void {
  const startTime = Date.now();

  return (additionalData?: Record<string, unknown>) => {
    const duration_ms = Date.now() - startTime;
    writeLog(
      createEntry("info", message, {
        duration_ms,
        data: { ...data, ...additionalData },
      }),
    );
  };
}

/**
 * Creates a child logger with additional context
 */
export function createLogger(context: string): {
  debug: (message: string, data?: Record<string, unknown>) => void;
  info: (message: string, data?: Record<string, unknown>) => void;
  warn: (message: string, data?: Record<string, unknown>) => void;
  error: (message: string, err?: Error, data?: Record<string, unknown>) => void;
  time: (message: string, data?: Record<string, unknown>) => (additionalData?: Record<string, unknown>) => void;
} {
  return {
    debug: (message, data) => writeLog(createEntry("debug", message, { context, data })),
    info: (message, data) => writeLog(createEntry("info", message, { context, data })),
    warn: (message, data) => writeLog(createEntry("warn", message, { context, data })),
    error: (message, err, data) => writeLog(createEntry("error", message, { context, error: err, data })),
    time: (message, data) => {
      const startTime = Date.now();
      return (additionalData) => {
        const duration_ms = Date.now() - startTime;
        writeLog(createEntry("info", message, { context, duration_ms, data: { ...data, ...additionalData } }));
      };
    },
  };
}

/**
 * Gets current memory usage statistics
 */
export function getMemoryUsage(): {
  heapUsed: number;
  heapTotal: number;
  external: number;
  rss: number;
} {
  const usage = process.memoryUsage();
  return {
    heapUsed: Math.round(usage.heapUsed / 1024 / 1024), // MB
    heapTotal: Math.round(usage.heapTotal / 1024 / 1024), // MB
    external: Math.round(usage.external / 1024 / 1024), // MB
    rss: Math.round(usage.rss / 1024 / 1024), // MB
  };
}

/**
 * Logs current memory usage
 */
export function logMemoryUsage(context?: string): void {
  const memory = getMemoryUsage();
  writeLog(
    createEntry("debug", "Memory usage", {
      context: context || config.context,
      data: {
        heap_used_mb: memory.heapUsed,
        heap_total_mb: memory.heapTotal,
        external_mb: memory.external,
        rss_mb: memory.rss,
      },
    }),
  );
}

// Export default logger instance
export const logger = {
  debug,
  info,
  warn,
  error,
  time,
  createLogger,
  configureLogger,
  getMemoryUsage,
  logMemoryUsage,
};

export default logger;
