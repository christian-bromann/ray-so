/**
 * Concurrency Control for Render Operations
 *
 * Limits concurrent renders to prevent memory exhaustion
 * and provides semaphore-based access control.
 */

import { logger } from "./logger";

/**
 * Configuration for concurrency limits
 */
export interface ConcurrencyConfig {
  /**
   * Maximum number of concurrent render operations
   */
  maxConcurrentRenders: number;

  /**
   * Maximum wait time to acquire a render slot (ms)
   */
  acquireTimeout: number;
}

/**
 * Default concurrency configuration
 */
const DEFAULT_CONFIG: ConcurrencyConfig = {
  maxConcurrentRenders: 3,
  acquireTimeout: 60000, // 60 seconds
};

/**
 * Current configuration
 */
let config: ConcurrencyConfig = { ...DEFAULT_CONFIG };

/**
 * Configure concurrency limits
 */
export function configureConcurrency(newConfig: Partial<ConcurrencyConfig>): void {
  config = { ...config, ...newConfig };
  logger.info("Concurrency config updated", {
    maxConcurrentRenders: config.maxConcurrentRenders,
    acquireTimeout: config.acquireTimeout,
  });
}

/**
 * Gets the current configuration
 */
export function getConcurrencyConfig(): ConcurrencyConfig {
  return { ...config };
}

/**
 * Simple semaphore implementation for limiting concurrent operations
 */
class Semaphore {
  private permits: number;
  private waiting: Array<() => void> = [];

  constructor(permits: number) {
    this.permits = permits;
  }

  /**
   * Acquire a permit, waiting if necessary
   */
  async acquire(timeout: number): Promise<boolean> {
    if (this.permits > 0) {
      this.permits--;
      return true;
    }

    // Wait for a permit to become available
    return new Promise<boolean>((resolve) => {
      const timeoutId = setTimeout(() => {
        // Remove from waiting queue on timeout
        const index = this.waiting.indexOf(onRelease);
        if (index !== -1) {
          this.waiting.splice(index, 1);
        }
        resolve(false);
      }, timeout);

      const onRelease = () => {
        clearTimeout(timeoutId);
        this.permits--;
        resolve(true);
      };

      this.waiting.push(onRelease);
    });
  }

  /**
   * Release a permit
   */
  release(): void {
    this.permits++;

    // Wake up a waiting acquirer if any
    if (this.waiting.length > 0 && this.permits > 0) {
      const next = this.waiting.shift();
      if (next) {
        next();
      }
    }
  }

  /**
   * Get current number of available permits
   */
  available(): number {
    return this.permits;
  }

  /**
   * Get number of waiting acquirers
   */
  waitingCount(): number {
    return this.waiting.length;
  }
}

/**
 * Semaphore for render operations
 */
let renderSemaphore = new Semaphore(DEFAULT_CONFIG.maxConcurrentRenders);

/**
 * Track active renders for monitoring
 */
let activeRenderCount = 0;
let totalRenderCount = 0;
let renderTimeouts = 0;

/**
 * Reset the semaphore (for testing or reconfiguration)
 */
export function resetRenderSemaphore(): void {
  renderSemaphore = new Semaphore(config.maxConcurrentRenders);
  activeRenderCount = 0;
}

/**
 * Acquire a render slot.
 * Returns a release function if successful, or null if timed out.
 */
export async function acquireRenderSlot(): Promise<(() => void) | null> {
  const acquired = await renderSemaphore.acquire(config.acquireTimeout);

  if (!acquired) {
    renderTimeouts++;
    logger.warn("Failed to acquire render slot", {
      waitingCount: renderSemaphore.waitingCount(),
      timeout: config.acquireTimeout,
    });
    return null;
  }

  activeRenderCount++;
  totalRenderCount++;

  logger.debug("Render slot acquired", {
    activeRenders: activeRenderCount,
    available: renderSemaphore.available(),
    waiting: renderSemaphore.waitingCount(),
  });

  return () => {
    activeRenderCount--;
    renderSemaphore.release();

    logger.debug("Render slot released", {
      activeRenders: activeRenderCount,
      available: renderSemaphore.available(),
    });
  };
}

/**
 * Execute a function with a render slot.
 * Automatically acquires and releases the slot.
 *
 * @throws Error if unable to acquire a slot (timeout)
 */
export async function withRenderSlot<T>(fn: () => Promise<T>): Promise<T> {
  const release = await acquireRenderSlot();

  if (!release) {
    throw new Error(`Failed to acquire render slot after ${config.acquireTimeout}ms. ` + `Server may be overloaded.`);
  }

  try {
    return await fn();
  } finally {
    release();
  }
}

/**
 * Get current render statistics
 */
export function getRenderStats(): {
  activeRenders: number;
  totalRenders: number;
  timeouts: number;
  maxConcurrent: number;
  available: number;
  waiting: number;
} {
  return {
    activeRenders: activeRenderCount,
    totalRenders: totalRenderCount,
    timeouts: renderTimeouts,
    maxConcurrent: config.maxConcurrentRenders,
    available: renderSemaphore.available(),
    waiting: renderSemaphore.waitingCount(),
  };
}

/**
 * Log current render statistics
 */
export function logRenderStats(): void {
  const stats = getRenderStats();
  logger.info("Render statistics", stats);
}
