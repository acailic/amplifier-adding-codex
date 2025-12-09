import { NextApiRequest, NextApiResponse } from 'next';
import * as fs from 'fs';
import { DatasetSearchResponse, DatasetSearchRequest, APIError } from '../../../types/datasets';
import { pythonRunner } from '../../../lib/python-runner';

// Default pagination settings
const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<DatasetSearchResponse | APIError>
) {
  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed',
      code: 'METHOD_NOT_ALLOWED'
    });
  }

  const startTime = Date.now();

  try {
    // Parse request parameters (support both GET query params and POST body)
    const params = req.method === 'POST' ? req.body : req.query;
    const {
      query,
      category,
      page = DEFAULT_PAGE,
      limit = DEFAULT_LIMIT,
      organization,
      tag,
      sortBy = 'relevance',
      sortOrder = 'desc'
    } = params as DatasetSearchRequest;

    // Validate and sanitize parameters
    const pageNum = Math.max(1, parseInt(String(page || DEFAULT_PAGE), 10));
    const limitNum = Math.min(MAX_LIMIT, Math.max(1, parseInt(String(limit || DEFAULT_LIMIT), 10)));

    // Use the Python runner to search for datasets
    const tempOutputFile = pythonRunner.createTempFile('datasets');
    const result = await pythonRunner.searchDatasets({
      query: query || undefined,
      category: category || undefined,
      minResults: limitNum * 2, // Get more results to allow for pagination
      output: tempOutputFile,
      expandDiacritics: true
    });

    if (!result.success) {
      console.error('Python script failed:', result.stderr);
      throw new Error(`Dataset search failed: ${result.stderr}`);
    }

    // Read and parse the output file
    let allDatasets: any[] = [];
    try {
      allDatasets = pythonRunner.parseJsonOutput(tempOutputFile);
    } catch (parseError) {
      console.error('Error parsing JSON output:', parseError);
      throw new Error('Failed to parse dataset search results');
    } finally {
      // Clean up temporary file
      pythonRunner.cleanupTempFiles([tempOutputFile]);
    }

    // Apply additional filters if specified
    if (organization && typeof organization === 'string') {
      allDatasets = allDatasets.filter((dataset: any) =>
        dataset.organization?.toLowerCase().includes(organization.toLowerCase())
      );
    }

    if (tag && typeof tag === 'string') {
      allDatasets = allDatasets.filter((dataset: any) =>
        dataset.tags?.some((t: string) => t.toLowerCase().includes(tag.toLowerCase()))
      );
    }

    // Sort results
    allDatasets.sort((a: any, b: any) => {
      let aValue: any = a;
      let bValue: any = b;

      switch (sortBy) {
        case 'title':
          aValue = a.title?.toLowerCase() || '';
          bValue = b.title?.toLowerCase() || '';
          break;
        case 'organization':
          aValue = a.organization?.toLowerCase() || '';
          bValue = b.organization?.toLowerCase() || '';
          break;
        case 'format':
          aValue = a.format || '';
          bValue = b.format || '';
          break;
        case 'created':
        case 'modified':
          aValue = new Date(a.created_at || 0);
          bValue = new Date(b.created_at || 0);
          break;
        case 'downloads':
          aValue = a.downloads || 0;
          bValue = b.downloads || 0;
          break;
        default: // relevance
          // For relevance, we'll use a simple scoring system
          const getRelevanceScore = (dataset: any) => {
            let score = 0;
            const searchTerms = (query || category || '').toLowerCase().split(' ');

            searchTerms.forEach(term => {
              if (term && term.length > 2) {
                if (dataset.title?.toLowerCase().includes(term)) score += 10;
                if (dataset.description?.toLowerCase().includes(term)) score += 5;
                if (dataset.tags?.some((t: string) => t.toLowerCase().includes(term))) score += 3;
                if (dataset.organization?.toLowerCase().includes(term)) score += 2;
              }
            });
            return score;
          };
          aValue = getRelevanceScore(a);
          bValue = getRelevanceScore(b);
          break;
      }

      if (typeof aValue === 'string') {
        return sortOrder === 'asc'
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      } else {
        return sortOrder === 'asc'
          ? aValue - bValue
          : bValue - aValue;
      }
    });

    // Apply pagination
    const total = allDatasets.length;
    const totalPages = Math.ceil(total / limitNum);
    const startIndex = (pageNum - 1) * limitNum;
    const endIndex = startIndex + limitNum;
    const paginatedDatasets = allDatasets.slice(startIndex, endIndex);

    // Build response
    const response: DatasetSearchResponse = {
      success: true,
      data: paginatedDatasets,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages,
        hasNext: pageNum < totalPages,
        hasPrev: pageNum > 1
      },
      searchInfo: {
        query: query || undefined,
        category: category || undefined,
        totalResults: total,
        searchTime: Date.now() - startTime
      }
    };

    return res.status(200).json(response);

  } catch (error) {
    console.error('Dataset search error:', error);

    const errorResponse: APIError = {
      success: false,
      error: 'Failed to search datasets',
      code: 'SEARCH_FAILED',
      details: error instanceof Error ? error.message : 'Unknown error'
    };

    return res.status(500).json(errorResponse);
  }
}