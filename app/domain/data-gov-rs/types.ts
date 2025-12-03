/**
 * Data.gov.rs API Types
 * 
 * Tipovi za integraciju sa srpskim državnim portalom otvorenih podataka
 * Types for integration with Serbian open data government portal
 */

// ============================================================================
// OSNOVNI TIPOVI / BASIC TYPES
// ============================================================================

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface Address {
  street: string;
  number: string;
  city: string;
  municipality?: string;
  postalCode: string;
  country: string;
  coordinates?: Coordinates;
}

export interface ContactInfo {
  phone?: string;
  email?: string;
  website?: string;
  fax?: string;
}

// ============================================================================
// METADATA PODACI / METADATA
// ============================================================================

export interface DatasetMetadata {
  id: string;
  name: string;
  nameSr?: string;
  description: string;
  descriptionSr?: string;
  keywords: string[];
  keywordsSr?: string[];
  theme: string;
  themeSr?: string;
  publisher: string;
  publisherSr?: string;
  modified: string;
  created: string;
  identifier: string;
  language: string[];
  spatial?: string;
  temporal?: {
    start: string;
    end: string;
  };
  frequency: string;
  frequencySr?: string;
  accrualPeriodicity?: string;
  license?: string;
  rights?: string;
  accessRights?: string;
  conformsTo?: string[];
  provenance?: string;
  issued: string;
  seeAlso?: string[];
  isVersionOf?: string;
  hasVersion?: string;
  versionInfo?: string;
  status: 'active' | 'inactive' | 'archived' | 'draft';
  quality: QualityMetrics;
}

export interface ResourceMetadata {
  id: string;
  name: string;
  nameSr?: string;
  description: string;
  descriptionSr?: string;
  format: string;
  mimeType: string;
  size: number;
  checksum?: string;
  checksumAlgorithm?: string;
  created: string;
  modified: string;
  url: string;
  downloadURL?: string;
  accessURL?: string;
  language: string[];
  status: 'available' | 'unavailable' | 'processing';
  datasetId: string;
  distributionId?: string;
  mediaType: string;
  compression?: string;
  packaging?: string;
  structure?: DataStructure;
  schema?: string;
  conformsto?: string[];
  documentation?: string;
  sample?: string;
}

// ============================================================================
// STRUKTURA PODATAKA / DATA STRUCTURE
// ============================================================================

export interface DataStructure {
  fields: DataField[];
  primaryKey?: string[];
  foreignKeys?: ForeignKey[];
  relationships?: Relationship[];
  constraints?: Constraint[];
  indexes?: Index[];
}

export interface DataField {
  name: string;
  type: FieldType;
  description: string;
  descriptionSr?: string;
  required: boolean;
  unique: boolean;
  nullable: boolean;
  defaultValue?: any;
  validation?: ValidationRule[];
  format?: string;
  unit?: string;
  unitSr?: string;
  example?: any;
  enum?: any[];
  range?: {
    min?: number;
    max?: number;
  };
  length?: {
    min?: number;
    max?: number;
  };
  pattern?: string;
  sensitive: boolean;
  classification: DataClassification;
}

export type FieldType = 
  | 'string' 
  | 'text' 
  | 'integer' 
  | 'float' 
  | 'decimal' 
  | 'boolean' 
  | 'date' 
  | 'datetime' 
  | 'time' 
  | 'json' 
  | 'array' 
  | 'object' 
  | 'binary' 
  | 'geopoint' 
  | 'geoshape' 
  | 'url' 
  | 'email' 
  | 'phone' 
  | 'jmbg' // SRPSKI SPECIFIČNI / SERBIAN SPECIFIC
  | 'pib' // SRPSKI SPECIFIČNI / SERBIAN SPECIFIC
  | 'maticniBroj'; // SRPSKI SPECIFIČNI / SERBIAN SPECIFIC

export type DataClassification = 
  | 'public' 
  | 'internal' 
  | 'confidential' 
  | 'restricted' 
  | 'personal-data';

export interface ValidationRule {
  type: string;
  rule: string;
  message: string;
  messageSr?: string;
}

export interface ForeignKey {
  field: string;
  references: {
    table: string;
    field: string;
  };
  onDelete?: 'cascade' | 'restrict' | 'set null';
  onUpdate?: 'cascade' | 'restrict';
}

export interface Relationship {
  type: 'one-to-one' | 'one-to-many' | 'many-to-many';
  source: {
    table: string;
    field: string;
  };
  target: {
    table: string;
    field: string;
  };
}

export interface Constraint {
  name: string;
  type: 'unique' | 'check' | 'not null';
  fields: string[];
  definition?: string;
}

export interface Index {
  name: string;
  fields: string[];
  unique: boolean;
  type: 'btree' | 'hash' | 'gist' | 'gin';
}

// ============================================================================
// KVALITET PODATAKA / DATA QUALITY
// ============================================================================

export interface QualityMetrics {
  completeness: number; // 0-100
  accuracy: number; // 0-100
  consistency: number; // 0-100
  timeliness: number; // 0-100
  validity: number; // 0-100
  uniqueness: number; // 0-100
  accessibility: number; // 0-100
  relevance: number; // 0-100
  overall: number; // 0-100
  lastAssessed: string;
  issues: QualityIssue[];
  recommendations: string[];
  recommendationsSr?: string[];
}

export interface QualityIssue {
  severity: 'low' | 'medium' | 'high' | 'critical';
  type: string;
  description: string;
  descriptionSr?: string;
  field?: string;
  count: number;
  percentage: number;
  suggestion?: string;
  suggestionSr?: string;
}

// ============================================================================
// ORGANIZACIJA / ORGANIZATION
// ============================================================================

export interface Organization {
  id: string;
  name: string;
  nameSr?: string;
  description: string;
  descriptionSr?: string;
  abbreviation?: string;
  type: OrganizationType;
  parent?: string;
  children?: string[];
  address: Address;
  contact: ContactInfo;
  established?: string;
  status: 'active' | 'inactive' | 'merged' | 'split';
  website?: string;
  socialMedia?: {
    facebook?: string;
    twitter?: string;
    linkedin?: string;
    youtube?: string;
  };
  logo?: string;
  jurisdiction: string;
  jurisdictionSr?: string;
  responsibilities?: string[];
  responsibilitiesSr?: string[];
  statistics?: OrganizationStats;
}

export type OrganizationType = 
  | 'ministry'
  | 'agency'
  | 'institution'
  | 'public-company'
  | 'municipality'
  | 'city'
  | 'region'
  | 'court'
  | 'police'
  | 'healthcare'
  | 'education'
  | 'culture'
  | 'other';

export interface OrganizationStats {
  datasetsCount: number;
  resourcesCount: number;
  downloads: number;
  views: number;
  lastUpdated: string;
  quality: number;
}

// ============================================================================
// API RESPONSE TIPOVI / API RESPONSE TYPES
// ============================================================================

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: ApiError;
  meta?: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
    requestId: string;
    timestamp: string;
    version: string;
    rateLimit?: RateLimitInfo;
  };
  warnings?: string[];
  warningsSr?: string[];
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    currentPage: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
    nextPage?: number;
    prevPage?: number;
  };
}

export interface RateLimitInfo {
  limit: number;
  remaining: number;
  reset: number;
  retryAfter?: number;
}

export interface ApiError {
  code: string;
  codeSr?: string;
  message: string;
  messageSr?: string;
  details?: any;
  timestamp: string;
  requestId: string;
  stack?: string;
  fields?: ValidationError[];
}

export interface ValidationError {
  field: string;
  message: string;
  messageSr?: string;
  value?: any;
  rule?: string;
}

// ============================================================================
// PRETRAŽIVANJE / SEARCH
// ============================================================================

export interface SearchRequest {
  query?: string;
  querySr?: string;
  filters?: SearchFilters;
  sort?: SortOptions[];
  facets?: string[];
  page?: number;
  pageSize?: number;
  include?: string[];
  exclude?: string[];
  highlight?: boolean;
  suggestions?: boolean;
}

export interface SearchFilters {
  theme?: string[];
  publisher?: string[];
  format?: string[];
  language?: string[];
  created?: DateRange;
  modified?: DateRange;
  spatial?: string[];
  quality?: {
    min?: number;
    max?: number;
  };
  size?: {
    min?: number;
    max?: number;
  };
  status?: string[];
  license?: string[];
  accessibility?: boolean;
  hasGeoData?: boolean;
  hasTimeSeries?: boolean;
  classification?: DataClassification[];
}

export interface DateRange {
  start?: string;
  end?: string;
}

export interface SortOptions {
  field: string;
  direction: 'asc' | 'desc';
  priority?: number;
}

export interface SearchResponse {
  datasets: DatasetMetadata[];
  resources: ResourceMetadata[];
  organizations: Organization[];
  total: {
    datasets: number;
    resources: number;
    organizations: number;
  };
  facets: {
    themes: FacetResult[];
    publishers: FacetResult[];
    formats: FacetResult[];
    languages: FacetResult[];
    spatial: FacetResult[];
    quality: FacetResult[];
  };
  suggestions?: string[];
  suggestionsSr?: string[];
  searchTime: number;
  meta: {
    query: string;
    filters: SearchFilters;
    page: number;
    pageSize: number;
  };
}

export interface FacetResult {
  value: string;
  valueSr?: string;
  count: number;
  selected: boolean;
}

// ============================================================================
// CACHE TIPOVI / CACHE TYPES
// ============================================================================

export interface CacheEntry<T> {
  key: string;
  data: T;
  timestamp: number;
  expiresAt: number;
  size: number;
  hits: number;
  lastAccessed: number;
  etag?: string;
  version?: number;
  source: string;
  metadata?: {
    ttl: number;
    tags: string[];
    priority: number;
    dependencies?: string[];
  };
}

export interface CacheStats {
  size: number;
  itemCount: number;
  hitRate: number;
  missRate: number;
  evictionCount: number;
  memoryUsage: number;
  oldestEntry: number;
  newestEntry: number;
  hitsByTag: Record<string, number>;
  popularKeys: Array<{
    key: string;
    hits: number;
    lastAccessed: number;
  }>;
}

// ============================================================================
// WEBOOK TIPOVI / WEBHOOK TYPES
// ============================================================================

export interface Webhook {
  id: string;
  url: string;
  events: WebhookEvent[];
  secret?: string;
  active: boolean;
  created: string;
  updated: string;
  lastTriggered?: string;
  retryPolicy: RetryPolicy;
  filters?: WebhookFilters;
  headers?: Record<string, string>;
  rateLimit?: {
    max: number;
    window: number;
  };
}

export type WebhookEvent = 
  | 'dataset.created'
  | 'dataset.updated'
  | 'dataset.deleted'
  | 'resource.created'
  | 'resource.updated'
  | 'resource.deleted'
  | 'organization.created'
  | 'organization.updated'
  | 'organization.deleted'
  | 'quality.assessment.completed'
  | 'bulk.import.completed'
  | 'system.maintenance'
  | 'data.refresh.completed';

export interface WebhookFilters {
  datasets?: string[];
  organizations?: string[];
  themes?: string[];
  formats?: string[];
  quality?: {
    min?: number;
    max?: number;
  };
}

export interface RetryPolicy {
  maxRetries: number;
  backoffStrategy: 'exponential' | 'linear' | 'fixed';
  initialDelay: number;
  maxDelay: number;
  multiplier?: number;
  jitter?: boolean;
}

export interface WebhookPayload {
  id: string;
  event: WebhookEvent;
  timestamp: string;
  data: any;
  version: string;
  signature?: string;
  retryCount: number;
  attemptId: string;
}

// ============================================================================
// KONFIGURACIJA / CONFIGURATION
// ============================================================================

export interface DataGovRsConfig {
  baseURL: string;
  apiKey?: string;
  timeout: number;
  retries: number;
  retryDelay: number;
  cache: CacheConfig;
  rateLimit: RateLimitConfig;
  webhooks: WebhookConfig;
  quality: QualityConfig;
  localization: LocalizationConfig;
  security: SecurityConfig;
  monitoring: MonitoringConfig;
}

export interface CacheConfig {
  enabled: boolean;
  defaultTTL: number;
  maxSize: number;
  strategy: 'lru' | 'lfu' | 'ttl' | 'custom';
  storage: 'memory' | 'redis' | 'file';
  compression: boolean;
  compressionThreshold: number;
  redis?: {
    url: string;
    keyPrefix: string;
    ttl: number;
  };
  file?: {
    path: string;
    maxFiles: number;
  };
}

export interface RateLimitConfig {
  enabled: boolean;
  requestsPerMinute: number;
  requestsPerHour: number;
  requestsPerDay: number;
  burstLimit: number;
  backoffStrategy: 'exponential' | 'linear';
  retryAfterBase: number;
  maxRetryDelay: number;
}

export interface WebhookConfig {
  enabled: boolean;
  secret: string;
  endpointURL?: string;
  maxRetries: number;
  timeout: number;
  batchSize: number;
  flushInterval: number;
  queueSize: number;
}

export interface QualityConfig {
  enabled: boolean;
  thresholds: {
    completeness: number;
    accuracy: number;
    consistency: number;
    timeliness: number;
    validity: number;
    overall: number;
  };
  assessmentInterval: number;
  autoReject: boolean;
  notifications: boolean;
}

export interface LocalizationConfig {
  defaultLanguage: 'en' | 'sr';
  fallbackLanguage: 'en' | 'sr';
  dateFormat: string;
  numberFormat: string;
  currency: string;
  timezone: string;
  translationCache: boolean;
}

export interface SecurityConfig {
  validateSSLCertificates: boolean;
  allowedHosts: string[];
  encryptionKey?: string;
  dataRetentionDays: number;
  auditLogging: boolean;
  sensitiveDataMasking: boolean;
  apiKeyRotation: number;
  rateLimiting: boolean;
}

export interface MonitoringConfig {
  enabled: boolean;
  metricsEndpoint?: string;
  loggingLevel: 'debug' | 'info' | 'warn' | 'error';
  performanceTracking: boolean;
  healthCheckInterval: number;
  alertThresholds: {
    responseTime: number;
    errorRate: number;
    cacheHitRate: number;
    memoryUsage: number;
  };
  dashboards?: {
    url?: string;
    apiKey?: string;
  };
}

// ============================================================================
// BULK OPERATIONS / MASOVNE OPERACIJE
// ============================================================================

export interface BulkOperation {
  id: string;
  type: BulkOperationType;
  status: BulkOperationStatus;
  created: string;
  started?: string;
  completed?: string;
  progress: BulkProgress;
  items: BulkItem[];
  config: BulkConfig;
  errors: BulkError[];
  result?: BulkResult;
  metadata?: Record<string, any>;
}

export type BulkOperationType = 
  | 'import'
  | 'export'
  | 'update'
  | 'delete'
  | 'validate'
  | 'transform'
  | 'quality-check'
  | 'index-rebuild';

export type BulkOperationStatus = 
  | 'pending'
  | 'running'
  | 'paused'
  | 'completed'
  | 'failed'
  | 'cancelled';

export interface BulkProgress {
  total: number;
  completed: number;
  failed: number;
  skipped: number;
  percentage: number;
  estimatedRemaining?: number;
  speed?: number;
}

export interface BulkItem {
  id: string;
  type: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'skipped';
  data?: any;
  error?: string;
  timestamp: string;
}

export interface BulkConfig {
  batchSize: number;
  concurrency: number;
  retryCount: number;
  retryDelay: number;
  timeout: number;
  validation: boolean;
  notifications: boolean;
  dryRun: boolean;
  filters?: Record<string, any>;
}

export interface BulkError {
  item: string;
  error: string;
  details?: any;
  timestamp: string;
  retryable: boolean;
}

export interface BulkResult {
  total: number;
  processed: number;
  successful: number;
  failed: number;
  skipped: number;
  duration: number;
  summary: Record<string, number>;
  artifacts?: string[];
}

// ============================================================================
// SERBIAN SPECIFIC TIPOVI / SRPSKI SPECIFIČNI TIPOVI
// ============================================================================

export interface SerbianMunicipality {
  id: string;
  name: string;
  nameSr: string;
  district: string;
  districtSr: string;
  region: string;
  regionSr: string;
  postalCode: string;
  areaCode: string;
  coordinates: Coordinates;
  population?: number;
  website?: string;
}

export interface SerbianInstitution {
  id: string;
  name: string;
  nameSr: string;
  abbreviation: string;
  type: SerbianInstitutionType;
  municipality: string;
  municipalitySr: string;
  address: Address;
  contact: ContactInfo;
  jurisdiction: string;
  pib?: string; // PDV broj / Tax ID
  maticniBroj?: string; // Matični broj / Registry Number
  established: string;
  status: 'active' | 'inactive' | 'merged';
  website?: string;
  email?: string;
  phone?: string;
  services?: string[];
  servicesSr?: string[];
}

export type SerbianInstitutionType = 
  | 'opstina'
  | 'grad'
  | 'skupstina'
  | 'ministarstvo'
  | 'agencija'
  | 'uprava'
  | 'direkcija'
  | 'javno-preduzece'
  | 'zavod'
  | 'ustanova'
  | 'komisija'
  | 'savet'
  | 'fond'
  | 'other';

export interface SerbianDocument {
  id: string;
  type: SerbianDocumentType;
  number: string;
  year: number;
  date: string;
  issuer: string;
  issuerSr?: string;
  title: string;
  titleSr?: string;
  summary: string;
  summarySr?: string;
  keywords: string[];
  keywordsSr?: string[];
  category: string;
  categorySr?: string;
  status: 'draft' | 'published' | 'archived' | 'cancelled';
  language: 'sr' | 'en' | 'both';
  format: string;
  size: number;
  url: string;
  downloadUrl?: string;
  attachments?: SerbianDocument[];
  tags: string[];
  tagsSr?: string[];
  metadata?: Record<string, any>;
}

export type SerbianDocumentType = 
  | 'zakon' // Law
  | 'uredba' // Regulation
  | 'odluka' // Decision
  | 'pravilnik' // Rulebook
  | 'nalog' // Order
  | 'resenje' // Resolution
  | 'zakljucak' // Conclusion
  | 'dogovor' // Agreement
  | 'protokol' // Protocol
  | 'izvestaj' // Report
  | 'analiza' // Analysis
  | 'strategija' // Strategy
  | 'plan' // Plan
  | 'program' // Program
  | 'akt' // Act
  | 'other';

export interface SerbianRegulation {
  id: string;
  number: string;
  year: number;
  date: string;
  type: SerbianRegulationType;
  title: string;
  titleSr?: string;
  issuer: string;
  issuerSr?: string;
  publishedIn: string; // Sluzbeni glasnik / Official Gazette
  pages?: string;
  effectiveDate: string;
  expirationDate?: string;
  status: 'active' | 'expired' | 'superseded' | 'cancelled';
  summary: string;
  summarySr?: string;
  text: string;
  textSr?: string;
  attachments: SerbianDocument[];
  references: string[];
  supersededBy?: string;
  supersedes?: string[];
  amendments: string[];
  keywords: string[];
  keywordsSr?: string[];
  category: string;
  categorySr?: string;
  url: string;
}

export type SerbianRegulationType = 
  | 'zakon' // Law
  | 'ustav' // Constitution
  | 'uredba' // Regulation
  | 'odluka' // Decision
  | 'pravilnik' // Rulebook
  | 'nalog' // Order
  | 'resenje' // Resolution
  | 'zakljucak' // Conclusion
  | 'dogovor' // Agreement
  | 'konvencija' // Convention
  | 'protokol' // Protocol
  | 'sporazum' // Agreement/Treaty
  | 'inicijativa' // Initiative
  | 'preporuka' // Recommendation
  | 'izjava' // Declaration
  | 'opsti-akt' // General Act
  | 'other';

// ============================================================================
// VALIDATION HELPERS / POMOĆNE FUNKCIJE ZA VALIDACIJU
// ============================================================================

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  score: number; // 0-100
}

export interface ValidationWarning {
  field: string;
  message: string;
  messageSr?: string;
  value?: any;
  severity: 'low' | 'medium' | 'high';
  suggestion?: string;
  suggestionSr?: string;
}

export interface SerbianValidators {
  jmbg: (jmbg: string) => ValidationResult;
  pib: (pib: string) => ValidationResult;
  maticniBroj: (maticniBroj: string) => ValidationResult;
  postalCode: (postalCode: string) => ValidationResult;
  phoneNumber: (phone: string) => ValidationResult;
  licensePlate: (plate: string) => ValidationResult;
  oib?: (oib: string) => ValidationResult; // For compatibility with Croatian systems
}

// ============================================================================
// EXPORT TYPES
// ============================================================================

export type {
  // Main types that will be commonly used
  DatasetMetadata as Dataset,
  ResourceMetadata as Resource,
  Organization as Org,
  SearchResponse as SearchResults,
  ApiResponse as Response,
  PaginatedResponse as Paginated,
  SerbianInstitution as Institution,
  SerbianDocument as Document,
  SerbianRegulation as Regulation,
};

// Re-export commonly used utility types
export type {
  Coordinates,
  Address,
  ContactInfo,
  QualityMetrics,
  ApiError,
  ValidationError,
  ValidationResult,
  CacheEntry,
  Webhook,
  BulkOperation,
  DataGovRsConfig,
};
