import { Queue, Worker, Job } from 'bullmq';
import config from '../../config';
import logger from '../../shared/utils/pinoLogger';

export interface QueueJobData {
  [key: string]: any;
}

export class QueueService {
  private static queues: Map<string, Queue> = new Map();
  private static workers: Map<string, Worker> = new Map();

  private static redisConnection = {
    host: config.queue.redis.host,
    port: config.queue.redis.port,
    password: config.queue.redis.password,
  };

  /**
   * Create or get a queue
   */
  static getQueue(queueName: string): Queue {
    if (!this.queues.has(queueName)) {
      const queue = new Queue(queueName, {
        connection: this.redisConnection,
        defaultJobOptions: {
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 2000,
          },
          removeOnComplete: {
            count: 100,
            age: 3600,
          },
          removeOnFail: {
            count: 1000,
          },
        },
      });

      this.queues.set(queueName, queue);
      logger.info(`Queue created: ${queueName}`);
    }

    return this.queues.get(queueName)!;
  }

  /**
   * Add job to queue
   */
  static async addJob(
    queueName: string,
    jobName: string,
    data: QueueJobData,
    options?: any
  ): Promise<Job> {
    const queue = this.getQueue(queueName);
    const job = await queue.add(jobName, data, options);
    logger.info(`Job added to ${queueName}: ${jobName} - ID: ${job.id}`);
    return job;
  }

  /**
   * Create a worker to process jobs
   */
  static createWorker(
    queueName: string,
    processor: (job: Job) => Promise<any>,
    concurrency: number = 1
  ): Worker {
    if (this.workers.has(queueName)) {
      logger.warn(`Worker already exists for queue: ${queueName}`);
      return this.workers.get(queueName)!;
    }

    const worker = new Worker(queueName, processor, {
      connection: this.redisConnection,
      concurrency,
    });

    // Event handlers
    worker.on('completed', (job) => {
      logger.info(`Job completed: ${job.id} in queue ${queueName}`);
    });

    worker.on('failed', (job, err) => {
      logger.error(`Job failed: ${job?.id} in queue ${queueName}`, err);
    });

    worker.on('error', (err) => {
      logger.error(`Worker error in queue ${queueName}:`, err);
    });

    this.workers.set(queueName, worker);
    logger.info(`Worker created for queue: ${queueName} with concurrency ${concurrency}`);

    return worker;
  }

  /**
   * Get job by ID
   */
  static async getJob(queueName: string, jobId: string): Promise<Job | undefined> {
    const queue = this.getQueue(queueName);
    return await queue.getJob(jobId);
  }

  /**
   * Remove job by ID
   */
  static async removeJob(queueName: string, jobId: string): Promise<void> {
    const job = await this.getJob(queueName, jobId);
    if (job) {
      await job.remove();
      logger.info(`Job removed: ${jobId} from queue ${queueName}`);
    }
  }

  /**
   * Get queue metrics
   */
  static async getQueueMetrics(queueName: string) {
    const queue = this.getQueue(queueName);
    const [waiting, active, completed, failed, delayed] = await Promise.all([
      queue.getWaitingCount(),
      queue.getActiveCount(),
      queue.getCompletedCount(),
      queue.getFailedCount(),
      queue.getDelayedCount(),
    ]);

    return {
      waiting,
      active,
      completed,
      failed,
      delayed,
      total: waiting + active + completed + failed + delayed,
    };
  }

  /**
   * Clean old jobs
   */
  static async cleanQueue(
    queueName: string,
    grace: number = 3600000,
    status: 'completed' | 'failed' = 'completed'
  ): Promise<void> {
    const queue = this.getQueue(queueName);
    await queue.clean(grace, 1000, status);
    logger.info(`Cleaned ${status} jobs older than ${grace}ms from queue ${queueName}`);
  }

  /**
   * Close all queues and workers
   */
  static async closeAll(): Promise<void> {
    const closePromises: Promise<void>[] = [];

    for (const worker of this.workers.values()) {
      closePromises.push(worker.close());
    }

    for (const queue of this.queues.values()) {
      closePromises.push(queue.close());
    }

    await Promise.all(closePromises);
    this.queues.clear();
    this.workers.clear();

    logger.info('All queues and workers closed');
  }
}
