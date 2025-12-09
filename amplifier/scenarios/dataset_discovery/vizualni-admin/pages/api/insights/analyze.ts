import { NextApiRequest, NextApiResponse } from 'next';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as path from 'path';
import * as fs from 'fs';

const execAsync = promisify(exec);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { data, locale = 'sr', maxInsights = 5 } = req.body;

    if (!data) {
      return res.status(400).json({ error: 'No data provided' });
    }

    // Create a temporary CSV file from the provided data
    const tempDir = path.join(process.cwd(), 'temp');
    const tempFilePath = path.join(tempDir, `temp_data_${Date.now()}.csv`);

    // Write the data to a temporary file
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    fs.writeFileSync(tempFilePath, data);

    // Path to the Python script
    const pythonScriptPath = path.join(
      process.cwd(),
      '..',
      '..',
      'dataset_insights',
      'generate_insights.py'
    );

    // Execute the Python script as a module to handle relative imports
    const { stdout, stderr } = await execAsync(
      `/usr/bin/python3 -m dataset_insights.generate_insights --input "${tempFilePath}" --locale "${locale}" --max-insights ${maxInsights}`,
      {
        cwd: path.join(process.cwd(), '..', '..', 'scenarios'),
        timeout: 30000, // 30 seconds timeout
      }
    );

    // Clean up the temporary file
    fs.unlinkSync(tempFilePath);

    if (stderr && stderr.trim()) {
      console.error('Python script stderr:', stderr);
    }

    // Parse the JSON output from the Python script
    const insights = JSON.parse(stdout);

    return res.status(200).json({
      success: true,
      insights,
      count: insights.length,
    });

  } catch (error) {
    console.error('Error analyzing data:', error);

    // Clean up temporary file if it exists
    try {
      const tempDir = path.join(process.cwd(), 'temp');
      const tempFiles = fs.readdirSync(tempDir);
      tempFiles.forEach((file: string) => {
        if (file.startsWith('temp_data_')) {
          fs.unlinkSync(path.join(tempDir, file));
        }
      });
    } catch (cleanupError) {
      // Ignore cleanup errors
    }

    return res.status(500).json({
      error: 'Failed to analyze data',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}