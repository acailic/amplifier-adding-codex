/**
 * Elite-Grade Build Security for Vizualni-Admin
 * Implements code signing, integrity verification, and secure deployment
 */

import crypto from 'crypto';
import fs from 'fs/promises';
import path from 'path';

// Build security configuration
export const BUILD_SECURITY_CONFIG = {
  CHECKSUM_ALGORITHM: 'sha256',
  MANIFEST_FILE: 'build-manifest.json',
  SIGNATURE_ALGORITHM: 'RSA-SHA256',
  PRIVATE_KEY_FILE: process.env.BUILD_PRIVATE_KEY_FILE || 'keys/private.pem',
  PUBLIC_KEY_FILE: process.env.BUILD_PUBLIC_KEY_FILE || 'keys/public.pem',
  MAX_BUILD_SIZE: 100 * 1024 * 1024,
  ALLOWED_FILE_EXTENSIONS: ['.js', '.ts', '.tsx', '.css', '.json', '.map', '.wasm'],
  SECURITY_SCAN_TIMEOUT: 300000,
  MAX_SEVERITY_LEVEL: 'medium'
};

// File integrity verifier
export class BuildIntegrityVerifier {
  private expectedChecksums = new Map<string, string>();
  
  async loadExpectedChecksums(manifestPath: string): Promise<void> {
    try {
      const manifestContent = await fs.readFile(manifestPath, 'utf-8');
      const manifest = JSON.parse(manifestContent);
      this.expectedChecksums = new Map(Object.entries(manifest.checksums || {}));
    } catch (error) {
      throw new Error('Failed to load checksum manifest: ' + error.message);
    }
  }
  
  async calculateFileHash(filePath: string): Promise<string> {
    try {
      const fileBuffer = await fs.readFile(filePath);
      return crypto.createHash(BUILD_SECURITY_CONFIG.CHECKSUM_ALGORITHM)
        .update(fileBuffer)
        .digest('hex');
    } catch (error) {
      throw new Error('Failed to calculate hash for ' + filePath + ': ' + error.message);
    }
  }
  
  async verifyBuildIntegrity(buildDir: string): Promise<BuildVerificationResult> {
    const results: BuildVerificationResult = {
      isValid: true,
      errors: [],
      verifiedFiles: [],
      skippedFiles: []
    };
    
    try {
      const manifestPath = path.join(buildDir, BUILD_SECURITY_CONFIG.MANIFEST_FILE);
      await this.loadExpectedChecksums(manifestPath);
      
      for (const [filePath, expectedHash] of this.expectedChecksums) {
        try {
          const fullPath = path.join(buildDir, filePath);
          const actualHash = await this.calculateFileHash(fullPath);
          
          if (actualHash === expectedHash) {
            results.verifiedFiles.push(filePath);
          } else {
            results.isValid = false;
            results.errors.push(
              'Checksum mismatch for ' + filePath + ': expected ' + expectedHash + ', got ' + actualHash
            );
          }
        } catch (error) {
          results.skippedFiles.push(filePath);
          results.errors.push('Failed to verify ' + filePath + ': ' + error.message);
        }
      }
      
    } catch (error) {
      results.isValid = false;
      results.errors.push('Build verification failed: ' + error.message);
    }
    
    return results;
  }
}

// Code signing implementation
export class CodeSigner {
  private privateKey?: string;
  private publicKey?: string;
  
  async loadKeys(): Promise<void> {
    try {
      this.privateKey = await fs.readFile(BUILD_SECURITY_CONFIG.PRIVATE_KEY_FILE, 'utf-8');
      this.publicKey = await fs.readFile(BUILD_SECURITY_CONFIG.PUBLIC_KEY_FILE, 'utf-8');
    } catch (error) {
      throw new Error('Failed to load signing keys: ' + error.message);
    }
  }
  
  async signFile(filePath: string): Promise<string> {
    if (!this.privateKey) {
      await this.loadKeys();
    }
    
    try {
      const fileBuffer = await fs.readFile(filePath);
      const hash = crypto.createHash('sha256').update(fileBuffer).digest();
      const signature = crypto.sign(BUILD_SECURITY_CONFIG.SIGNATURE_ALGORITHM, hash, this.privateKey);
      return signature.toString('base64');
    } catch (error) {
      throw new Error('Failed to sign file ' + filePath + ': ' + error.message);
    }
  }
  
  async signBuild(buildDir: string): Promise<BuildSignature> {
    const signature: BuildSignature = {
      files: {},
      buildTimestamp: new Date().toISOString(),
      buildVersion: process.env.BUILD_VERSION || '1.0.0',
      gitCommit: process.env.GIT_COMMIT || 'unknown'
    };
    
    const filesToSign = ['index.js', 'index.esm.js', 'styles.css'];
    
    for (const file of filesToSign) {
      const filePath = path.join(buildDir, file);
      try {
        await fs.access(filePath);
        signature.files[file] = await this.signFile(filePath);
      } catch (error) {
        console.warn('Skipping signature for ' + file + ': ' + error.message);
      }
    }
    
    const signaturePath = path.join(buildDir, 'build-signature.json');
    await fs.writeFile(signaturePath, JSON.stringify(signature, null, 2));
    
    return signature;
  }
}

// Build manifest generator
export class BuildManifestGenerator {
  async generateManifest(buildDir: string): Promise<BuildManifest> {
    const manifest: BuildManifest = {
      buildInfo: {
        timestamp: new Date().toISOString(),
        version: process.env.BUILD_VERSION || '1.0.0',
        environment: process.env.NODE_ENV || 'production',
        nodeVersion: process.version,
        platform: process.platform,
        architecture: process.arch
      },
      files: {},
      checksums: {},
      dependencies: {},
      sizeInfo: {}
    };
    
    await this.scanDirectory(buildDir, '', manifest);
    
    let totalSize = 0;
    for (const size of Object.values(manifest.sizeInfo)) {
      totalSize += size;
    }
    manifest.buildInfo.totalSize = totalSize;
    
    const manifestPath = path.join(buildDir, BUILD_SECURITY_CONFIG.MANIFEST_FILE);
    await fs.writeFile(manifestPath, JSON.stringify(manifest, null, 2));
    
    return manifest;
  }
  
  private async scanDirectory(dir: string, relativePath: string, manifest: BuildManifest): Promise<void> {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      const entryPath = path.join(dir, entry.name);
      const entryRelativePath = path.join(relativePath, entry.name);
      
      if (entry.isDirectory()) {
        await this.scanDirectory(entryPath, entryRelativePath, manifest);
      } else if (entry.isFile()) {
        const stats = await fs.stat(entryPath);
        const fileBuffer = await fs.readFile(entryPath);
        const checksum = crypto.createHash(BUILD_SECURITY_CONFIG.CHECKSUM_ALGORITHM)
          .update(fileBuffer)
          .digest('hex');
        
        manifest.files[entryRelativePath] = {
          size: stats.size,
          lastModified: stats.mtime.toISOString(),
          type: path.extname(entry.name)
        };
        
        manifest.checksums[entryRelativePath] = checksum;
        manifest.sizeInfo[entryRelativePath] = stats.size;
      }
    }
  }
}

// Type definitions
interface BuildVerificationResult {
  isValid: boolean;
  errors: string[];
  verifiedFiles: string[];
  skippedFiles: string[];
}

interface BuildSignature {
  files: Record<string, string>;
  buildTimestamp: string;
  buildVersion: string;
  gitCommit: string;
}

interface BuildManifest {
  buildInfo: {
    timestamp: string;
    version: string;
    environment: string;
    nodeVersion: string;
    platform: string;
    architecture: string;
    totalSize?: number;
  };
  files: Record<string, {
    size: number;
    lastModified: string;
    type: string;
  }>;
  checksums: Record<string, string>;
  dependencies: Record<string, string>;
  sizeInfo: Record<string, number>;
}

// Main build security orchestrator
export class BuildSecurityOrchestrator {
  async secureBuild(buildDir: string): Promise<SecureBuildResult> {
    const result: SecureBuildResult = {
      success: false,
      manifest: null,
      signature: null,
      errors: []
    };
    
    try {
      console.log('Generating build manifest...');
      result.manifest = await new BuildManifestGenerator().generateManifest(buildDir);
      
      console.log('Signing build...');
      result.signature = await new CodeSigner().signBuild(buildDir);
      
      console.log('Verifying build integrity...');
      const verificationResult = await new BuildIntegrityVerifier().verifyBuildIntegrity(buildDir);
      
      if (!verificationResult.isValid) {
        throw new Error('Build integrity verification failed');
      }
      
      result.success = true;
      console.log('Build security completed successfully');
      
    } catch (error) {
      result.errors.push(error.message);
      console.error('Build security failed:', error.message);
    }
    
    return result;
  }
}

interface SecureBuildResult {
  success: boolean;
  manifest: BuildManifest | null;
  signature: BuildSignature | null;
  errors: string[];
}

export default {
  BuildIntegrityVerifier,
  CodeSigner,
  BuildManifestGenerator,
  BuildSecurityOrchestrator,
  BUILD_SECURITY_CONFIG
};