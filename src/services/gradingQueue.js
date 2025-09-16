// Đây là một phiên bản giả lập hàng đợi (in-memory queue)
// Trong thực tế, bạn sẽ dùng RabbitMQ hoặc Redis
const { processSubmission } = require('../workers/graderWorker');

const submissionQueue = [];
let isWorkerBusy = false;

const addSubmissionToQueue = (submissionId) => {
    submissionQueue.push(submissionId);
    console.log(`[Queue] Added ${submissionId}. Queue size: ${submissionQueue.length}.`);
    triggerWorker();
};

const triggerWorker = async () => {
    if (isWorkerBusy || submissionQueue.length === 0) {
        return;
    }

    isWorkerBusy = true;
    const submissionId = submissionQueue.shift();
    console.log(`[Worker Trigger] Starting job for ${submissionId}.`);
    
    try {
        await processSubmission(submissionId);
    } catch (error) {
        console.error(`[Worker Trigger] CRITICAL ERROR processing ${submissionId}:`, error);
    } finally {
        isWorkerBusy = false;
        console.log(`[Worker Trigger] Worker finished job for ${submissionId}. Now free.`);
        triggerWorker();
    }
};

module.exports = { addSubmissionToQueue };