/**
 * Utility functions for running Python scripts from the dataset discovery tool
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import * as path from 'path';
import * as fs from 'fs';

const execAsync = promisify(exec);

export interface PythonExecutionOptions {
  timeout?: number;
  cwd?: string;
  env?: NodeJS.ProcessEnv;
  pythonPath?: string;
}

export interface PythonExecutionResult {
  stdout: string;
  stderr: string;
  success: boolean;
  tempFiles?: string[];
}

export class PythonRunner {
  private basePythonPath: string;
  private scenariosCwd: string;

  constructor() {
    // Path to the scenarios directory where dataset_discovery is located
    this.scenariosCwd = path.join(process.cwd(), '..', '..', 'scenarios');
    this.basePythonPath = '/usr/bin/python3'; // Default Python path
  }

  /**
   * Execute the dataset discovery Python script
   */
  async runDatasetDiscovery(
    args: string[],
    options: PythonExecutionOptions = {}
  ): Promise<PythonExecutionResult> {
    const tempFiles: string[] = [];
    const {
      timeout = 30000,
      cwd = this.scenariosCwd,
      env = process.env,
      pythonPath = this.basePythonPath
    } = options;

    try {
      // Path to the discover_datasets.py script
      const scriptPath = path.join(
        this.scenariosCwd,
        'dataset_discovery',
        'discover_datasets.py'
      );

      // Build the Python command
      const pythonCmd = `${pythonPath} ${scriptPath} ${args.join(' ')}`;

      // Execute the Python script
      const { stdout, stderr } = await execAsync(pythonCmd, {
        cwd,
        timeout,
        env: {
          ...env,
          PYTHONPATH: path.join(this.scenariosCwd, 'dataset_discovery')
        }
      });

      return {
        stdout,
        stderr,
        success: true,
        tempFiles
      };

    } catch (error: any) {
      return {
        stdout: error.stdout || '',
        stderr: error.stderr || error.message,
        success: false,
        tempFiles
      };
    }
  }

  /**
   * Create a temporary file and return its path
   */
  createTempFile(prefix: string, suffix: string = '.json'): string {
    const tempDir = path.join(process.cwd(), 'temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2);
    const filename = `${prefix}_${timestamp}_${random}${suffix}`;
    const filePath = path.join(tempDir, filename);

    return filePath;
  }

  /**
   * Clean up temporary files
   */
  cleanupTempFiles(files: string[]): void {
    files.forEach(file => {
      try {
        if (fs.existsSync(file)) {
          fs.unlinkSync(file);
        }
      } catch (error) {
        console.warn(`Failed to cleanup temp file ${file}:`, error);
      }
    });
  }

  /**
   * Search datasets by query or category
   */
  async searchDatasets(options: {
    query?: string;
    category?: string;
    minResults?: number;
    expandDiacritics?: boolean;
    output?: string;
  }): Promise<PythonExecutionResult> {
    const args: string[] = [];
    const tempFiles: string[] = [];

    // Determine search type and build arguments
    if (options.category) {
      args.push('--category', options.category);
    } else if (options.query) {
      args.push('--query', `"${options.query.replace(/"/g, '\\"')}"`);
      if (!options.expandDiacritics) {
        args.push('--no-expand-diacritics');
      }
    } else {
      throw new Error('Either query or category must be provided');
    }

    // Add output file
    const outputFile = options.output || this.createTempFile('datasets');
    args.push('--output', outputFile);
    tempFiles.push(outputFile);

    // Add minimum results
    if (options.minResults) {
      args.push('--min-results', String(options.minResults));
    }

    const result = await this.runDatasetDiscovery(args, {
      cwd: this.scenariosCwd
    });

    result.tempFiles = tempFiles;
    return result;
  }

  /**
   * Parse JSON output from Python script
   */
  parseJsonOutput(filePath: string): any[] {
    if (!fs.existsSync(filePath)) {
      throw new Error(`Output file not found: ${filePath}`);
    }

    const content = fs.readFileSync(filePath, 'utf8');
    try {
      return JSON.parse(content);
    } catch (error) {
      throw new Error(`Failed to parse JSON output: ${error}`);
    }
  }

  /**
   * List available categories from the discovery tool
   */
  async listCategories(): Promise<PythonExecutionResult> {
    return this.runDatasetDiscovery(['--list-categories']);
  }
}

// Export a singleton instance
export const pythonRunner = new PythonRunner();