import { mkdirSync, writeFileSync } from 'fs';
import path from 'path';
import type {
  FullConfig,
  Reporter,
  Suite,
  TestCase,
  TestError,
  TestResult
} from '@playwright/test/reporter';

type LLMReporterOptions = {
  outputFile?: string;
};

type TestSummary = {
  titlePath: string[];
  status: TestResult['status'];
  duration: number;
  errorMessage?: string;
};

export default class LLMReporter implements Reporter {
  private readonly summaries: TestSummary[] = [];
  private outputFile: string = 'test-results/llm-report.md';
  private runStart = Date.now();

  constructor(options: LLMReporterOptions = {}) {
    if (options.outputFile) {
      this.outputFile = options.outputFile;
    }
  }

  onBegin(config: FullConfig, suite: Suite): void {
    this.runStart = Date.now();
    const projectOutputDir = config.projects?.[0]?.outputDir;
    if (projectOutputDir && !this.outputFile.startsWith(projectOutputDir)) {
      const resolvedOutput = path.isAbsolute(this.outputFile)
        ? this.outputFile
        : path.resolve(projectOutputDir, '..', this.outputFile);
      this.outputFile = resolvedOutput;
    } else if (!path.isAbsolute(this.outputFile)) {
      this.outputFile = path.resolve(process.cwd(), this.outputFile);
    }

    const dir = path.dirname(this.outputFile);
    mkdirSync(dir, { recursive: true });

    // Pre-calculate all tests to ensure deterministic ordering.
    const walk = (s: Suite) => {
      for (const projectSuite of s.suites || []) {
        walk(projectSuite);
      }
      for (const test of s.tests || []) {
        this.summaries.push({
          titlePath: test.titlePath(),
          status: 'skipped',
          duration: 0
        });
      }
    };

    // Seed the summaries in discovery order.
    walk(suite);
  }

  onTestEnd(test: TestCase, result: TestResult): void {
    const titlePath = test.titlePath();
    const index = this.summaries.findIndex(summary =>
      summary.titlePath.length === titlePath.length &&
      summary.titlePath.every((title, idx) => title === titlePath[idx])
    );

    const target = index >= 0 ? this.summaries[index] : undefined;
    const errorText = this.formatError(result.errors?.[0] ?? result.error);

    const summary: TestSummary = {
      titlePath,
      status: result.status,
      duration: result.duration,
      errorMessage: errorText
    };

    if (target) {
      this.summaries[index] = summary;
    } else {
      this.summaries.push(summary);
    }
  }

  async onEnd(): Promise<void> {
    const totalDurationMs = Date.now() - this.runStart;
    const totalTests = this.summaries.length;
    const passed = this.summaries.filter(item => item.status === 'passed').length;
    const failed = this.summaries.filter(item => item.status === 'failed').length;
    const skipped = this.summaries.filter(item => item.status === 'skipped').length;
    const reportLines: string[] = [
      '# Playwright Test Summary',
      '',
      `- total: ${totalTests}`,
      `- passed: ${passed}`,
      `- failed: ${failed}`,
      `- skipped: ${skipped}`,
      `- duration_ms: ${totalDurationMs}`,
      '',
      '## Tests'
    ];

    for (const summary of this.summaries) {
      const testTitle = summary.titlePath.join(' › ');
      reportLines.push('');
      reportLines.push(`### ${testTitle}`);
      reportLines.push(`- status: ${summary.status}`);
      reportLines.push(`- duration_ms: ${summary.duration}`);
      if (summary.errorMessage) {
        reportLines.push('- error: |');
        for (const line of summary.errorMessage.split('\n')) {
          reportLines.push(`    ${line}`);
        }
      }
    }

    writeFileSync(this.outputFile, `${reportLines.join('\n')}\n`, 'utf-8');
  }

  private formatError(error?: TestError): string | undefined {
    if (!error) {
      return undefined;
    }
    const message = error.message || '';
    const value = error.value || '';
    const stack = error.stack || '';

    const combined = [message, value, stack]
      .filter(Boolean)
      .join('\n')
      .replace(/\u001b\[[0-9;]*m/g, '')
      .trim();

    return combined || undefined;
  }
}

