/**
 * Team Galaxy Visualization Types
 *
 * Transforms team analytics into beautiful cultural artifacts that
 * teams would be proud to display for culture building.
 */

export interface DeveloperStar {
  id: string;
  userId: string;
  name: string;
  username: string;
  // Position in galaxy
  x: number;
  y: number;
  z: number; // For 3D effects
  // Star properties based on developer data
  archetype: DeveloperArchetype;
  magnitude: number; // Star brightness (0-10)
  spectralClass: SpectralClass; // Star color/type
  radius: number; // Star size
  temperature: number; // Based on activity level
  // Metadata
  contributions: ContributionMetrics;
  collaborationScore: number;
  influenceRadius: number;
  joinedDate: Date;
  lastActive: Date;
  languages: Language[];
  expertise: ExpertiseArea[];
  // Cultural properties
  constellation: string; // Which archetype constellation they belong to
  culturalRole: CulturalRole;
  teamSpirit: number; // 0-1, based on collaboration patterns
}

export interface DeveloperArchetype {
  id: string;
  name: string;
  description: string;
  color: string;
  pattern: ArchetypePattern;
  characteristics: string[];
  complementary: string[]; // Other archetype IDs that work well
  gravitationalProfile: GravitationalProfile;
}

export type SpectralClass = 'O' | 'B' | 'A' | 'F' | 'G' | 'K' | 'M';
export type ArchetypePattern = 'pioneer' | 'guardian' | 'connector' | 'innovator' | 'specialist' | 'mentor';
export type CulturalRole = 'north_star' | 'gravational_center' | 'bridge_builder' | 'constellation_anchor' | 'rising_star' | 'veteran_pillar';

export interface GravitationalProfile {
  mass: number; // Influence on others
  pull: number; // Attraction strength
  orbit: number; // How they move within team
  stability: number; // Consistency of presence
}

export interface ContributionMetrics {
  commits: number;
  pullRequests: number;
  reviews: number;
  issues: number;
  documentation: number;
  mentorship: number;
  codeQuality: number;
  innovation: number;
  reliability: number;
  communication: number;
}

export interface Language {
  name: string;
  proficiency: number; // 0-1
  contribution: number; // % of their contributions
}

export interface ExpertiseArea {
  domain: string;
  level: number; // 0-1
  impact: number; // Impact on team in this domain
}

export interface CollaborationGravitationalConnection {
  id: string;
  sourceId: string;
  targetId: string;
  strength: number; // 0-1, gravitational pull
  type: ConnectionType;
  frequency: number; // How often they collaborate
  reciprocity: number; // 0-1, how balanced the collaboration is
  energy: number; // Activity level on this connection
  duration: number; // How long they've been collaborating
  lastInteraction: Date;
  projects: string[]; // Shared projects
}

export type ConnectionType =
  | 'strong_gravity'     // Core collaborators, high frequency
  | 'tidal_force'        // Periodic, project-based collaboration
  | 'quantum_entangle'   // Unexpected but effective pairings
  | 'gravitational_lens' // Connects others through them
  | 'orbital_sync'       // Work in similar patterns/spheres
  | 'comet_trajectory'   // Occasional but impactful interactions;

export interface TeamGalaxy {
  id: string;
  teamId: string;
  name: string;
  // Galaxy properties
  classification: GalaxyClassification;
  totalMass: number; // Combined team influence
  luminosity: number; // Overall team output
  age: number; // Team age in months
  diameter: number; // Span of collaboration network
  // Composition
  stars: DeveloperStar[];
  connections: CollaborationGravitationalConnection[];
  constellations: TeamConstellation[];
  nebulae: TeamNebula[];
  blackHoles: TeamBlackHole[]; // Growth areas/unknown territories
  // Cultural properties
  coreTemperature: number; // Team energy/activity level
  metallicity: number; // Experience density
  spiralArms: SpiralArm[]; // Team structure patterns
  halo: TeamHalo; // Outer collaboration network
  // Evolution
  formation: Date;
  evolution: GalaxyEvolution[];
  currentPhase: GalaxyPhase;
}

export type GalaxyClassification =
  | 'spiral'           // Well-structured, growing team
  | 'elliptical'       // Mature, stable team
  | 'irregular'        // Flexible, adaptive team
  | 'lenticular'       // Mixed structure team
  | 'ring_galaxy'      // Team with clear specialty boundary
  | 'merger_galaxy';   // Recently combined teams

export interface TeamConstellation {
  id: string;
  name: string;
  archetypeId: string;
  pattern: string; // Visual pattern they form
  stars: string[]; // Developer star IDs
  mythology: ConstellationMythology;
  culturalSignificance: string;
  strengths: string[];
  complementaryConstellations: string[];
  visualStyle: ConstellationStyle;
}

export interface ConstellationMythology {
  story: string;
  symbolism: string;
  culturalContext: string;
  teamInterpretation: string;
}

export interface ConstellationStyle {
  color: string;
  opacity: number;
  lineWidth: number;
  pattern: 'solid' | 'dashed' | 'dotted' | 'glowing';
  animation: ConstellationAnimation;
}

export interface ConstellationAnimation {
  pulse: boolean;
  flow: boolean;
  sparkle: boolean;
  breathing: boolean;
  timing: number; // ms
}

export interface TeamNebula {
  id: string;
  type: NebulaType;
  x: number;
  y: number;
  radius: number;
  density: number;
  color: string;
  description: string;
  represents: GrowthArea;
  developers: string[]; // IDs of developers involved
}

export type NebulaType =
  | 'stellar_nursery'    // Area of new talent/skills emerging
  | 'planetary_nebula'   // Specialization development
  | 'supernova_remnant'  // Recent major achievement/impact
  | 'dark_nebula'        // Unknown potential/growth area
  | 'emission_nebula'    // Active innovation/experimentation
  | 'reflection_nebula'; // Learning/knowledge sharing area

export interface GrowthArea {
  domain: string;
  description: string;
  potential: number; // 0-1, growth potential
  currentInvestment: number; // 0-1, current focus
  recommendations: string[];
}

export interface TeamBlackHole {
  id: string;
  x: number;
  y: number;
  mass: number; // Challenge severity
  eventHorizon: number; // Impact radius
  type: BlackHoleType;
  description: string;
  challenge: string;
  opportunity: string;
  developers: string[]; // IDs affected/involved
}

export type BlackHoleType =
  | 'skill_gap'          // Missing capabilities
  | 'communication_void' // Information flow problem
  | 'process_singularity' // Bottleneck in workflow
  | 'knowledge_event_horizon' // Knowledge siloing
  | 'innovation_vacuum';  // Lack of new ideas

export interface SpiralArm {
  id: string;
  name: string;
  startAngle: number;
  endAngle: number;
  tightness: number; // How tightly wound
  developers: string[];
  purpose: string; // Why this structure exists
  strength: number; // 0-1, how strong this pattern is
}

export interface TeamHalo {
  radius: number;
  density: number;
  collaborators: ExternalCollaborator[];
  communities: Community[];
  influence: number; // 0-1, external influence
  reach: number; // Number of external connections
}

export interface ExternalCollaborator {
  name: string;
  organization: string;
  type: 'user' | 'contributor' | 'maintainer' | 'supporter';
  connectionStrength: number;
  areas: string[];
}

export interface Community {
  name: string;
  type: 'open_source' | 'industry' | 'research' | 'learning';
  involvement: number; // 0-1
  impact: number; // 0-1
}

export interface GalaxyEvolution {
  date: Date;
  phase: GalaxyPhase;
  event: EvolutionEvent;
  impact: string;
  metrics: EvolutionMetrics;
  visualization: EvolutionSnapshot;
}

export type GalaxyPhase =
  | 'protogalactic_cloud'  // Team formation
  | 'star_formation'      // Team structure emerging
  | 'main_sequence'       // Productive period
  | 'giant_phase'         // Rapid growth/expansion
  | 'stable_maturity'     // Peak efficiency
  | 'transformation'      // Major changes
  | 'merger'             // Team combination
  | 'renewal'            // Reinvigoration/new direction;

export interface EvolutionEvent {
  type: 'new_member' | 'project_complete' | 'structure_change' | 'skill_development' | 'achievement' | 'challenge_overcome';
  description: string;
  significance: number; // 0-1
}

export interface EvolutionMetrics {
  size: number;
  productivity: number;
  collaboration: number;
  innovation: number;
  satisfaction: number;
  learning: number;
}

export interface EvolutionSnapshot {
  imageUrl?: string;
  svgData?: string;
  description: string;
  highlights: string[];
}

// Museum/Display properties
export interface MuseumFrame {
  style: FrameStyle;
  material: FrameMaterial;
  title: string;
  subtitle: string;
  artist: string; // The team
  date: string;
  description: string;
  qrCode?: string; // Link to interactive version
  metadata: ExhibitionMetadata;
}

export type FrameStyle = 'classical' | 'modern' | 'minimalist' | 'ornate' | 'museum' | 'digital';
export type FrameMaterial = 'gold' | 'silver' | 'bronze' | 'wood' | 'black' | 'white' | 'transparent';

export interface ExhibitionMetadata {
  medium: string;
  dimensions: string;
  period: string;
  provenance: string;
  curator: string;
  references: string[];
  interpretations: string[];
}

// Cultural insights
export interface CulturalInsights {
  diversity: DiversityMetrics;
  collaborationPatterns: CollaborationPatterns;
  growthTrajectory: GrowthTrajectory;
  technicalExcellence: TechnicalExcellence;
  teamIdentity: TeamIdentity;
  culturalHighlights: CulturalHighlight[];
}

export interface DiversityMetrics {
  skills: SkillDiversity;
  experience: ExperienceDiversity;
  backgrounds: BackgroundDiversity;
  perspectives: PerspectiveDiversity;
}

export interface SkillDiversity {
  languages: string[];
  domains: string[];
  specialties: string[];
  coverage: number; // 0-1, how well-rounded
}

export interface ExperienceDiversity {
  junior: number;
  mid: number;
  senior: number;
  principal: number;
  balance: number; // 0-1, ideal distribution
}

export interface BackgroundDiversity {
  education: string[];
  previousCompanies: string[];
  industries: string[];
  cultures: string[];
}

export interface PerspectiveDiversity {
  thinkingStyles: string[];
  problemSolving: string[];
  communication: string[];
  innovation: string[];
}

export interface CollaborationPatterns {
  density: number; // 0-1
  efficiency: number; // 0-1
  balance: number; // 0-1
  bridges: CollaborationBridge[];
  silos: CollaborationSilo[];
}

export interface CollaborationBridge {
  from: string;
  to: string;
  strength: number;
  type: string;
  importance: string;
}

export interface CollaborationSilo {
  group: string[];
  isolation: number; // 0-1
  risk: string;
  opportunity: string;
}

export interface GrowthTrajectory {
  current: GrowthPoint;
  projected: GrowthPoint[];
  catalysts: GrowthCatalyst[];
  obstacles: GrowthObstacle[];
  recommendations: string[];
}

export interface GrowthPoint {
  date: Date;
  skills: string[];
  capabilities: string[];
  maturity: number; // 0-1
}

export interface GrowthCatalyst {
  type: string;
  description: string;
  impact: number; // 0-1
  timeline: string;
}

export interface GrowthObstacle {
  type: string;
  description: string;
  severity: number; // 0-1
  strategy: string;
}

export interface TechnicalExcellence {
  qualityScore: number; // 0-1
  innovation: InnovationMetrics;
  craftsmanship: CraftsmanshipMetrics;
  learning: LearningMetrics;
  practices: EngineeringPractice[];
}

export interface InnovationMetrics {
  patentableIdeas: number;
  novelSolutions: number;
  processInnovations: number;
  experimentRate: number;
}

export interface CraftsmanshipMetrics {
  codeQuality: number;
  designExcellence: number;
  documentation: number;
  testing: number;
  maintainability: number;
}

export interface LearningMetrics {
  skillAcquisition: number;
  knowledgeSharing: number;
  mentorship: number;
  adaptationSpeed: number;
}

export interface EngineeringPractice {
  name: string;
  adoption: number; // 0-1
  maturity: number; // 0-1
  impact: number; // 0-1
}

export interface TeamIdentity {
  values: TeamValue[];
  rituals: TeamRitual[];
  artifacts: TeamArtifact[];
  stories: TeamStory[];
  symbols: TeamSymbol[];
}

export interface TeamValue {
  name: string;
  importance: number; // 0-1
  manifestation: string;
  evidence: string[];
}

export interface TeamRitual {
  name: string;
  frequency: string;
  purpose: string;
  participants: string[];
}

export interface TeamArtifact {
  name: string;
  type: string;
  significance: string;
  location: string;
}

export interface TeamStory {
  title: string;
  narrative: string;
  moral: string;
  date: Date;
  participants: string[];
}

export interface TeamSymbol {
  icon: string;
  meaning: string;
  usage: string[];
}

export interface CulturalHighlight {
  type: 'achievement' | 'collaboration' | 'innovation' | 'growth' | 'challenge_overcome';
  title: string;
  description: string;
  impact: string;
  date: Date;
  participants: string[];
  significance: number; // 0-1
}

// Premium features
export interface CustomizationOptions {
  theme: GalaxyTheme;
  colorPalette: ColorPalette;
  visualStyle: VisualStyle;
  framing: MuseumFrame;
  labels: LabelOptions;
  effects: EffectOptions;
  interactions: InteractionOptions;
}

export interface GalaxyTheme {
  name: string;
  background: string;
  starColors: string[];
  nebulaColors: string[];
  connectionColors: string[];
  style: 'realistic' | 'artistic' | 'abstract' | 'minimalist' | 'ornate';
}

export interface ColorPalette {
  primary: string[];
  secondary: string[];
  accent: string[];
  background: string[];
  text: string[];
}

export interface VisualStyle {
  realism: number; // 0-1
  abstraction: number; // 0-1
  ornamentation: number; // 0-1
  density: number; // 0-1
  animation: number; // 0-1
}

export interface LabelOptions {
  showNames: boolean;
  showRoles: boolean;
  showConnections: boolean;
  showMetrics: boolean;
  fontSize: number;
  font: string;
  placement: 'floating' | 'fixed' | 'hover' | 'interactive';
}

export interface EffectOptions {
  particles: boolean;
  gravitationalLens: boolean;
  supernovae: boolean;
  pulsing: boolean;
  rotation: boolean;
  depth: boolean;
}

export interface InteractionOptions {
  hoverEffects: boolean;
  clickActions: boolean;
  zoom: boolean;
  pan: boolean;
  filter: boolean;
  search: boolean;
  timeline: boolean;
}

// Comparison features
export interface GalaxyComparison {
  galaxies: TeamGalaxy[];
  metrics: ComparisonMetrics;
  similarities: Similarity[];
  differences: Difference[];
  insights: ComparisonInsight[];
  recommendations: ComparisonRecommendation[];
}

export interface ComparisonMetrics {
  size: MetricComparison;
  productivity: MetricComparison;
  collaboration: MetricComparison;
  diversity: MetricComparison;
  growth: MetricComparison;
  culture: MetricComparison;
}

export interface MetricComparison {
  values: number[];
  average: number;
  median: number;
  range: number;
  outliers: number[];
}

export interface Similarity {
  aspect: string;
  description: string;
  strength: number; // 0-1
  evidence: string[];
}

export interface Difference {
  aspect: string;
  description: string;
  magnitude: number; // 0-1
  implications: string[];
}

export interface ComparisonInsight {
  category: string;
  observation: string;
  significance: string;
  actionable: boolean;
}

export interface ComparisonRecommendation {
  priority: 'high' | 'medium' | 'low';
  action: string;
  rationale: string;
  expectedOutcome: string;
  timeline: string;
}

// Export formats
export interface ExportOptions {
  format: 'png' | 'svg' | 'pdf' | 'print' | 'interactive' | 'video';
  resolution: number;
  quality: 'draft' | 'standard' | 'high' | 'museum';
  framing: boolean;
  metadata: boolean;
  interactivity: boolean;
}

export interface TeamPortrait {
  format: 'physical' | 'digital' | 'mixed';
  dimensions: {
    width: number;
    height: number;
    unit: 'px' | 'in' | 'cm' | 'mm';
  };
  quality: 'standard' | 'premium' | 'museum';
  features: PortraitFeature[];
  price: PortraitPricing;
}

export interface PortraitFeature {
  name: string;
  included: boolean;
  description: string;
  value: string;
}

export interface PortraitPricing {
  base: number;
  currency: string;
  features: Record<string, number>;
  discounts: DiscountOption[];
  total: number;
}

export interface DiscountOption {
  type: string;
  value: number;
  condition: string;
}

// API responses
export interface TeamGalaxyResponse {
  success: boolean;
  data?: TeamGalaxy;
  insights?: CulturalInsights;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  metadata?: {
    generatedAt: string;
    version: string;
    processingTime: number;
    dataSource: string;
  };
}