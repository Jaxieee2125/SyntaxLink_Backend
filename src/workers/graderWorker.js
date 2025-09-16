const util = require('util');
const exec = util.promisify(require('child_process').exec);
const fs = require('fs/promises');

// THÊM DÒNG NÀY VÀO
const path = require('path');
const Submission = require('../models/Submission');
const Problem = require('../models/Problem');
// ... imports
const processSubmission = async (submissionId) => {
  const submission = await Submission.findById(submissionId);
  if (!submission) return;

  await submission.updateOne({ status: "Judging" });

  console.log(`[Grader] Updated status to 'Judging' for ${submissionId}.`);

  const problem = await Problem.findById(submission.problemId);
  const tempDir = path.join(__dirname, "temp", submissionId.toString());

  try {
    await fs.mkdir(tempDir, { recursive: true });

    // Tùy chỉnh file và lệnh docker dựa trên ngôn ngữ
    let codeFilePath, dockerCmd;
    if (submission.language === "python") {
      codeFilePath = path.join(tempDir, "main.py");
      dockerCmd = `docker run --rm -v "${tempDir}:/app" --memory="${problem.memoryLimit}m" --cpus="1" python-grader`;
    } else if (submission.language === "cpp") {
      codeFilePath = path.join(tempDir, "main.cpp");
      dockerCmd = `docker run --rm -v "${tempDir}:/app" --memory="${problem.memoryLimit}m" --cpus="1" cpp-grader`;
    } else {
      throw new Error(`Unsupported language: ${submission.language}`);
    }

    await fs.writeFile(codeFilePath, submission.code);

    // Lặp qua từng test case
    for (const testCase of problem.testCases) {
      const inputFilePath = path.join(tempDir, "input.txt");
      await fs.writeFile(inputFilePath, testCase.input);

      // Thực thi code
      const startTime = Date.now();
      // Lỗi biên dịch của C++ sẽ nằm trong stderr
      const { stdout, stderr } = await exec(dockerCmd, {
        timeout: problem.timeLimit * 1000 + 2000,
      }); // Thêm 2s cho việc biên dịch
      const executionTime = Date.now() - startTime;

      // Xử lý lỗi biên dịch cho C++
      if (stderr && submission.language === "cpp") {
        await submission.updateOne({ status: "Compilation Error" });
        // Có thể lưu stderr vào CSDL để user xem lỗi
        await fs.rm(tempDir, { recursive: true, force: true });
        return;
      }

      // ... (Phần so sánh output giữ nguyên)
      const userOutput = (
        await fs.readFile(path.join(tempDir, "output.txt"), "utf-8")
      )
        .trim()
        .replace(/\r\n/g, "\n");
      const expectedOutput = testCase.expectedOutput
        .trim()
        .replace(/\r\n/g, "\n");

      if (userOutput !== expectedOutput) {
        await submission.updateOne({ status: "Wrong Answer" });
        await fs.rm(tempDir, { recursive: true, force: true });
        return;
      }
    }

    await submission.updateOne({ status: "Accepted" });
  } catch (error) {
    // ... (Phần xử lý lỗi TLE, RE giữ nguyên)
    if (error.killed && error.signal === "SIGTERM") {
      await submission.updateOne({ status: "Time Limit Exceeded" });
    } else {
      await submission.updateOne({ status: "Runtime Error" });
    }
  } finally {
    await fs.rm(tempDir, { recursive: true, force: true });
  }
};

module.exports = { processSubmission };
