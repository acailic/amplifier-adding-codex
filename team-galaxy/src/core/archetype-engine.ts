/**
 * Team Archetype Clustering Engine
 *
 * Analyzes team members to identify archetypes and create meaningful
 * constellation patterns that reveal team dynamics and culture.
 */

import {
  DeveloperStar,
  DeveloperArchetype,
  TeamConstellation,
  ContributionMetrics,
  ConstellationMythology,
  ConstellationStyle,
  ArchetypePattern,
  CulturalRole
} from '../types/team-galaxy';

// ==================== DEVELOPER ARCHETYPE DEFINITIONS ====================

export const DEVELOPER_ARCHETYPES: DeveloperArchetype[] = [
  {
    id: 'pioneer',
    name: 'Pioneer',
    description: 'Explores new territories and technologies, often working on cutting-edge projects.',
    color: '#FF6B6B',
    pattern: 'pioneer',
    characteristics: [
      'Early adopter of new technologies',
      'Frequently starts new projects',
      'Exploratory mindset',
      'Risk-tolerant',
      'Visionary thinking'
    ],
    complementary: ['guardian', 'specialist'],
    gravitationalProfile: {
      mass: 0.7,
      pull: 0.8,
      orbit: 0.9, // High mobility
      stability: 0.3
    }
  },
  {
    id: 'guardian',
    name: 'Guardian',
    description: 'Protects and maintains the codebase, ensuring stability and quality.',
    color: '#4ECDC4',
    pattern: 'guardian',
    characteristics: [
      'Code quality advocate',
      'Security-focused',
      'Documentation maintainer',
      'Mentor to others',
      'Stability seeker'
    ],
    complementary: ['pioneer', 'innovator'],
    gravitationalProfile: {
      mass: 0.9,
      pull: 0.6,
      orbit: 0.2, // Low mobility
      stability: 0.9
    }
  },
  {
    id: 'connector',
    name: 'Connector',
    description: 'Builds bridges between people and ideas, facilitating collaboration.',
    color: '#45B7D1',
    pattern: 'connector',
    characteristics: [
      'Cross-team collaborator',
      'Knowledge sharer',
      'Communication hub',
      'Relationship builder',
      'Network optimizer'
    ],
    complementary: ['specialist', 'mentor'],
    gravitationalProfile: {
      mass: 0.6,
      pull: 0.9,
      orbit: 0.7,
      stability: 0.6
    }
  },
  {
    id: 'innovator',
    name: 'Innovator',
    description: 'Creates novel solutions and approaches problems creatively.',
    color: '#96CEB4',
    pattern: 'innovator',
    characteristics: [
      'Creative problem-solver',
      'Pattern thinker',
      'Experimentation advocate',
      'Idea generator',
      'Solution architect'
    ],
    complementary: ['guardian', 'connector'],
    gravitationalProfile: {
      mass: 0.8,
      pull: 0.7,
      orbit: 0.6,
      stability: 0.5
    }
  },
  {
    id: 'specialist',
    name: 'Specialist',
    description: 'Deep expertise in specific domains, providing critical knowledge.',
    color: '#FFEAA7',
    pattern: 'specialist',
    characteristics: [
      'Domain expert',
      'Technical authority',
      'Deep knowledge holder',
      'Problem solver',
      'Quality validator'
    ],
    complementary: ['connector', 'pioneer'],
    gravitationalProfile: {
      mass: 0.8,
      pull: 0.8,
      orbit: 0.3,
      stability: 0.8
    }
  },
  {
    id: 'mentor',
    name: 'Mentor',
    description: 'Guides and develops other team members, fostering growth.',
    color: '#DDA0DD',
    pattern: 'mentor',
    characteristics: [
      'Knowledge transfer expert',
      'Team developer',
      'Career guide',
      'Culture builder',
      'Success multiplier'
    ],
    complementary: ['connector', 'specialist'],
    gravitationalProfile: {
      mass: 0.7,
      pull: 0.9,
      orbit: 0.4,
      stability: 0.9
    }
  }
];

// ==================== CONSTELLATION PATTERNS ====================

export interface ConstellationPattern {
  archetype: string;
  formation: FormationPattern;
  mythology: ConstellationMythology;
  visualStyle: ConstellationStyle;
  culturalSignificance: string;
  teamRole: string;
}

export interface FormationPattern {
  type: 'central' | 'cluster' | 'chain' | 'ring' | 'spiral' | 'network';
  density: number;
  connectivity: number;
  hierarchy: number;
}

export const CONSTELLATION_PATTERNS: Record<string, ConstellationPattern> = {
  pioneer: {
    archetype: 'pioneer',
    formation: {
      type: 'spiral',
      density: 0.3,
      connectivity: 0.4,
      hierarchy: 0.2
    },
    mythology: {
      story: 'The Pioneers venture into uncharted territories, lighting the way for others to follow. Like ancient explorers who navigated by the stars, they chart new courses through the technological cosmos.',
      symbolism: 'Exploration, Discovery, Innovation',
      culturalContext: 'In every culture, pioneers represent the brave souls who push boundaries and expand horizons.',
      teamInterpretation: 'These are the team members who consistently push the envelope, introducing new technologies and approaches that keep the team at the cutting edge.'
    },
    visualStyle: {
      color: '#FF6B6B',
      opacity: 0.8,
      lineWidth: 2,
      pattern: 'glowing',
      animation: {
        pulse: true,
        flow: true,
        sparkle: false,
        breathing: false,
        timing: 3000
      }
    },
    culturalSignificance: 'Pioneers drive innovation and ensure the team doesn\'t stagnate. They are the vanguard of progress.',
    teamRole: 'Innovation catalyst and technology scout'
  },
  guardian: {
    archetype: 'guardian',
    formation: {
      type: 'central',
      density: 0.8,
      connectivity: 0.7,
      hierarchy: 0.6
    },
    mythology: {
      story: 'Guardians stand as steadfast sentinels, protecting the realm from chaos and maintaining order. They are the foundation upon which great civilizations are built.',
      symbolism: 'Protection, Stability, Wisdom',
      culturalContext: 'Throughout mythology, guardians are the wise protectors who ensure continuity and safety.',
      teamInterpretation: 'Guardians are the bedrock of the team, ensuring quality, security, and stability in all endeavors.'
    },
    visualStyle: {
      color: '#4ECDC4',
      opacity: 0.9,
      lineWidth: 3,
      pattern: 'solid',
      animation: {
        pulse: true,
        flow: false,
        sparkle: false,
        breathing: true,
        timing: 5000
      }
    },
    culturalSignificance: 'Guardians provide the stability and quality foundation that allows others to innovate safely.',
    teamRole: 'Quality assurance and technical foundation'
  },
  connector: {
    archetype: 'connector',
    formation: {
      type: 'network',
      density: 0.5,
      connectivity: 0.9,
      hierarchy: 0.3
    },
    mythology: {
      story: 'Connectors weave the threads that bind the cosmos together, creating bridges between distant shores and facilitating the flow of knowledge and resources.',
      symbolism: 'Unity, Communication, Bridge-building',
      culturalContext: 'In every society, connectors are the merchants, diplomats, and storytellers who create networks of relationship.',
      teamInterpretation: 'Connectors ensure information flows freely, preventing silos and fostering collaboration across all boundaries.'
    },
    visualStyle: {
      color: '#45B7D1',
      opacity: 0.7,
      lineWidth: 1.5,
      pattern: 'dashed',
      animation: {
        pulse: true,
        flow: true,
        sparkle: true,
        breathing: false,
        timing: 2000
      }
    },
    culturalSignificance: 'Connectors are the circulatory system of the team, ensuring nutrients (information) reach all parts.',
    teamRole: 'Communication hub and collaboration facilitator'
  },
  innovator: {
    archetype: 'innovator',
    formation: {
      type: 'cluster',
      density: 0.6,
      connectivity: 0.6,
      hierarchy: 0.4
    },
    mythology: {
      story: 'Innovators are the creative spark that transforms possibility into reality, seeing patterns others miss and forging new paths through the wilderness of problems.',
      symbolism: 'Creativity, Transformation, Insight',
      culturalContext: 'Every culture honors its innovators - those who bring forth new ideas and transform the way we live and work.',
      teamInterpretation: 'Innovators bring fresh perspectives and creative solutions that solve problems in novel ways.'
    },
    visualStyle: {
      color: '#96CEB4',
      opacity: 0.8,
      lineWidth: 2,
      pattern: 'dotted',
      animation: {
        pulse: false,
        flow: false,
        sparkle: true,
        breathing: true,
        timing: 4000
      }
    },
    culturalSignificance: 'Innovators prevent groupthink and bring the creative energy needed for breakthrough solutions.',
    teamRole: 'Creative problem solver and solution architect'
  },
  specialist: {
    archetype: 'specialist',
    formation: {
      type: 'cluster',
      density: 0.7,
      connectivity: 0.5,
      hierarchy: 0.5
    },
    mythology: {
      story: 'Specialists are the master craftsmen of their domains, wielding deep knowledge with precision and expertise. They are the masters of specific arts and sciences.',
      symbolism: 'Mastery, Expertise, Precision',
      culturalContext: 'Specialists have always been valued in society for their deep knowledge and skill in specific areas.',
      teamInterpretation: 'Specialists provide the deep technical expertise required for complex challenges and quality execution.'
    },
    visualStyle: {
      color: '#FFEAA7',
      opacity: 0.8,
      lineWidth: 2.5,
      pattern: 'solid',
      animation: {
        pulse: false,
        flow: false,
        sparkle: false,
        breathing: false,
        timing: 6000
      }
    },
    culturalSignificance: 'Specialists ensure high-quality execution in their domains and provide expert guidance.',
    teamRole: 'Technical expert and domain authority'
  },
  mentor: {
    archetype: 'mentor',
    formation: {
      type: 'ring',
      density: 0.4,
      connectivity: 0.8,
      hierarchy: 0.7
    },
    mythology: {
      story: 'Mentors are the wise guides who help others navigate their journey, sharing wisdom and experience to light the path for those who follow.',
      symbolism: 'Guidance, Wisdom, Legacy',
      culturalContext: 'In mythology, mentors are the guides who help heroes on their journey, offering wisdom and support.',
      teamInterpretation: 'Mentors develop the next generation, transferring knowledge and building team capability.'
    },
    visualStyle: {
      color: '#DDA0DD',
      opacity: 0.9,
      lineWidth: 1.5,
      pattern: 'glowing',
      animation: {
        pulse: true,
        flow: true,
        sparkle: true,
        breathing: true,
        timing: 4500
      }
    },
    culturalSignificance: 'Mentors ensure team sustainability by developing talent and preserving knowledge.',
    teamRole: 'Knowledge transfer and team development'
  }
};

// ==================== ARCHETYPE ANALYSIS ENGINE ====================

export class ArchetypeAnalysisEngine {
  private archetypes: DeveloperArchetype[];
  private patterns: Record<string, ConstellationPattern>;

  constructor() {
    this.archetypes = DEVELOPER_ARCHETYPES;
    this.patterns = CONSTELLATION_PATTERNS;
  }

  /**
   * Analyze a developer and determine their primary archetype
   */
  analyzeArchetype(contributions: ContributionMetrics, languages: string[], expertise: string[]): DeveloperArchetype {
    const scores = this.archetypes.map(archetype => ({
      archetype,
      score: this.calculateArchetypeScore(archetype, contributions, languages, expertise)
    }));

    // Sort by score and return the highest scoring archetype
    scores.sort((a, b) => b.score - a.score);
    return scores[0].archetype;
  }

  private calculateArchetypeScore(
    archetype: DeveloperArchetype,
    contributions: ContributionMetrics,
    languages: string[],
    expertise: string[]
  ): number {
    let score = 0;

    switch (archetype.id) {
      case 'pioneer':
        // Score based on innovation, documentation (new tech often needs docs), and new projects
        score = (contributions.innovation * 0.4) +
                (contributions.documentation * 0.2) +
                (contributions.commits * 0.2) +
                (contributions.communication * 0.2);
        break;

      case 'guardian':
        // Score based on code quality, reviews, and reliability
        score = (contributions.codeQuality * 0.4) +
                (contributions.reviews * 0.3) +
                (contributions.reliability * 0.3);
        break;

      case 'connector':
        // Score based on communication, collaboration, and cross-domain work
        score = (contributions.communication * 0.4) +
                (contributions.mentorship * 0.3) +
                (contributions.collaborationScore * 0.3);
        break;

      case 'innovator':
        // Score based on innovation, new solutions, and creative problem-solving
        score = (contributions.innovation * 0.5) +
                (contributions.commits * 0.3) +
                (contributions.issues * 0.2);
        break;

      case 'specialist':
        // Score based on deep expertise in specific domains
        score = (contributions.codeQuality * 0.3) +
                (contributions.reviews * 0.2) +
                (contributions.reliability * 0.2) +
                (contributions.communication * 0.1) +
                (expertise.length > 0 ? 0.2 : 0);
        break;

      case 'mentor':
        // Score based on mentorship, documentation, and communication
        score = (contributions.mentorship * 0.4) +
                (contributions.communication * 0.3) +
                (contributions.documentation * 0.3);
        break;

      default:
        score = 0.5; // Default neutral score
    }

    // Normalize to 0-1 range
    return Math.max(0, Math.min(1, score));
  }

  /**
   * Determine cultural role based on archetype and contributions
   */
  determineCulturalRole(
    archetype: DeveloperArchetype,
    contributions: ContributionMetrics,
    teamSize: number
  ): CulturalRole {
    const influence = this.calculateInfluence(contributions, teamSize);
    const experience = this.calculateExperience(contributions);

    if (influence > 0.8 && experience > 0.8) {
      return 'north_star';
    } else if (influence > 0.6 && archetype.id === 'connector') {
      return 'gravational_center';
    } else if (archetype.id === 'connector') {
      return 'bridge_builder';
    } else if (experience > 0.7) {
      return 'veteran_pillar';
    } else if (influence > 0.6 && experience < 0.4) {
      return 'rising_star';
    } else {
      return 'constellation_anchor';
    }
  }

  private calculateInfluence(contributions: ContributionMetrics, teamSize: number): number {
    const totalContribution = Object.values(contributions).reduce((sum, val) => sum + val, 0);
    const normalizedContribution = Math.min(1, totalContribution / (teamSize * 10));
    return normalizedContribution;
  }

  private calculateExperience(contributions: ContributionMetrics): number {
    // Experience is approximated by the breadth and depth of contributions
    const variety = Object.values(contributions).filter(v => v > 0).length / Object.keys(contributions).length;
    const depth = Math.max(...Object.values(contributions)) / 10;
    return (variety + depth) / 2;
  }

  /**
   * Create team constellations based on archetype clusters
   */
  createConstellations(
    stars: DeveloperStar[],
    connections: CollaborationGravitationalConnection[]
  ): TeamConstellation[] {
    const constellations: TeamConstellation[] = [];
    const archetypeGroups = this.groupByArchetype(stars);

    for (const [archetypeId, groupStars] of archetypeGroups.entries()) {
      if (groupStars.length >= 2) { // Need at least 2 stars for a constellation
        const pattern = this.patterns[archetypeId];
        if (pattern) {
          const constellation = this.buildConstellation(
            archetypeId,
            groupStars,
            pattern,
            connections
          );
          constellations.push(constellation);
        }
      }
    }

    // Add mixed archetypes constellations for diverse collaboration
    const mixedConstellations = this.createMixedConstellations(stars, connections);
    constellations.push(...mixedConstellations);

    return constellations;
  }

  private groupByArchetype(stars: DeveloperStar[]): Map<string, DeveloperStar[]> {
    const groups = new Map<string, DeveloperStar[]>();

    for (const star of stars) {
      const archetypeId = star.archetype.id;
      if (!groups.has(archetypeId)) {
        groups.set(archetypeId, []);
      }
      groups.get(archetypeId)!.push(star);
    }

    return groups;
  }

  private buildConstellation(
    archetypeId: string,
    stars: DeveloperStar[],
    pattern: ConstellationPattern,
    connections: CollaborationGravitationalConnection[]
  ): TeamConstellation {
    const starIds = stars.map(s => s.id);
    const archetype = this.archetypes.find(a => a.id === archetypeId)!;

    return {
      id: `constellation-${archetypeId}`,
      name: `${archetype.name} Constellation`,
      archetypeId,
      pattern: this.generateConstellationPattern(stars, pattern.formation),
      stars: starIds,
      mythology: pattern.mythology,
      culturalSignificance: pattern.culturalSignificance,
      strengths: archetype.characteristics,
      complementaryConstellations: archetype.complementary.map(id => `constellation-${id}`),
      visualStyle: pattern.visualStyle
    };
  }

  private generateConstellationPattern(
    stars: DeveloperStar[],
    formation: FormationPattern
  ): string {
    switch (formation.type) {
      case 'central':
        return 'central_hub';
      case 'cluster':
        return 'tight_cluster';
      case 'chain':
        return 'linear_chain';
      case 'ring':
        return 'circular_ring';
      case 'spiral':
        return 'spiral_formation';
      case 'network':
        return 'distributed_network';
      default:
        return 'irregular_pattern';
    }
  }

  private createMixedConstellations(
    stars: DeveloperStar[],
    connections: CollaborationGravitationalConnection[]
  ): TeamConstellation[] {
    // Find strong cross-archetype connections
    const mixedGroups: DeveloperStar[][] = [];
    const processed = new Set<string>();

    for (const connection of connections) {
      if (connection.strength > 0.7 && connection.reciprocity > 0.6) {
        const sourceStar = stars.find(s => s.id === connection.sourceId);
        const targetStar = stars.find(s => s.id === connection.targetId);

        if (sourceStar && targetStar &&
            sourceStar.archetype.id !== targetStar.archetype.id &&
            !processed.has(sourceStar.id) && !processed.has(targetStar.id)) {

          mixedGroups.push([sourceStar, targetStar]);
          processed.add(sourceStar.id);
          processed.add(targetStar.id);
        }
      }
    }

    return mixedGroups.map((group, index) => ({
      id: `mixed-constellation-${index}`,
      name: 'Synergy Constellation',
      archetypeId: 'mixed',
      pattern: 'synergy_pattern',
      stars: group.map(s => s.id),
      mythology: {
        story: 'Where different archetypes meet and collaborate, magic happens. These constellations represent the powerful synergy that emerges when diverse talents unite.',
        symbolism: 'Synergy, Diversity, Collaboration',
        culturalContext: 'Great achievements often come from unexpected partnerships and diverse perspectives.',
        teamInterpretation: 'These represent the most effective cross-disciplinary collaborations in the team.'
      },
      culturalSignificance: 'Represents the power of diverse collaboration and complementary skills.',
      strengths: ['Cross-functional excellence', 'Innovation through diversity', 'Adaptive problem-solving'],
      complementaryConstellations: [],
      visualStyle: {
        color: '#FFD700',
        opacity: 0.6,
        lineWidth: 1,
        pattern: 'dashed',
        animation: {
          pulse: true,
          flow: true,
          sparkle: true,
          breathing: false,
          timing: 2500
        }
      }
    }));
  }

  /**
   * Get constellation recommendations based on team composition
   */
  getConstellationRecommendations(
    constellations: TeamConstellation[],
    teamSize: number
  ): string[] {
    const recommendations: string[] = [];
    const archetypeCounts = new Map<string, number>();

    // Count archetype representation
    for (const constellation of constellations) {
      if (constellation.archetypeId !== 'mixed') {
        archetypeCounts.set(
          constellation.archetypeId,
          constellation.stars.length
        );
      }
    }

    // Check for missing or underrepresented archetypes
    for (const archetype of this.archetypes) {
      const count = archetypeCounts.get(archetype.id) || 0;
      const percentage = (count / teamSize) * 100;

      if (percentage < 10) {
        recommendations.push(
          `Consider strengthening the ${archetype.name} archetype: ${archetype.description}`
        );
      }
    }

    // Check for archetype balance
    const totalArchetypes = archetypeCounts.size;
    if (totalArchetypes < 3) {
      recommendations.push(
        'The team would benefit from more archetype diversity to enhance creativity and problem-solving capabilities.'
      );
    }

    // Check for complementary pairs
    for (const [archetypeId, count] of archetypeCounts.entries()) {
      const archetype = this.archetypes.find(a => a.id === archetypeId);
      if (archetype) {
        for (const complementary of archetype.complementary) {
          const complementaryCount = archetypeCounts.get(complementary) || 0;
          if (complementaryCount === 0) {
            recommendations.push(
              `Adding ${this.archetypes.find(a => a.id === complementary)?.name} archetypes would complement existing ${archetype.name} strengths.`
            );
          }
        }
      }
    }

    return recommendations;
  }

  /**
   * Analyze archetype evolution over time
   */
  analyzeEvolution(
    currentConstellations: TeamConstellation[],
    historicalConstellations: TeamConstellation[]
  ): {
    trends: string[];
    growth: Record<string, number>;
    stability: Record<string, number>;
  } {
    const trends: string[] = [];
    const growth: Record<string, number> = {};
    const stability: Record<string, number> = {};

    // Analyze archetype growth
    for (const archetype of this.archetypes) {
      const currentCount = currentConstellations
        .filter(c => c.archetypeId === archetype.id)
        .reduce((sum, c) => sum + c.stars.length, 0);

      const historicalCount = historicalConstellations
        .filter(c => c.archetypeId === archetype.id)
        .reduce((sum, c) => sum + c.stars.length, 0);

      if (historicalCount > 0) {
        const growthRate = ((currentCount - historicalCount) / historicalCount) * 100;
        growth[archetype.id] = growthRate;

        if (growthRate > 20) {
          trends.push(`Strong growth in ${archetype.name} archetype (+${growthRate.toFixed(1)}%)`);
        } else if (growthRate < -20) {
          trends.push(`Decline in ${archetype.name} archetype (${growthRate.toFixed(1)}%)`);
        }

        // Stability based on change in constellation membership
        const currentMembers = new Set(
          currentConstellations
            .filter(c => c.archetypeId === archetype.id)
            .flatMap(c => c.stars)
        );

        const historicalMembers = new Set(
          historicalConstellations
            .filter(c => c.archetypeId === archetype.id)
            .flatMap(c => c.stars)
        );

        const intersection = new Set([...currentMembers].filter(x => historicalMembers.has(x)));
        const stabilityRate = intersection.size / Math.max(currentMembers.size, historicalMembers.size);
        stability[archetype.id] = stabilityRate;
      }
    }

    return { trends, growth, stability };
  }
}

export { DEVELOPER_ARCHETYPES, CONSTELLATION_PATTERNS };