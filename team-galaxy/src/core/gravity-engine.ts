/**
 * Gravitational Connections Engine
 *
 * Analyzes collaboration patterns to create meaningful gravitational
 * connections that reveal team dynamics and cultural relationships.
 */

import {
  DeveloperStar,
  CollaborationGravitationalConnection,
  ConnectionType,
  ContributionMetrics,
  TeamConstellation
} from '../types/team-galaxy';

// ==================== COLLABORATION ANALYSIS ====================

export interface CollaborationData {
  sourceId: string;
  targetId: string;
  commits: number;
  pullRequests: number;
  codeReviews: number;
  issues: number;
  comments: number;
  sharedProjects: string[];
  timeframe: {
    start: Date;
    end: Date;
  };
  quality: {
    prMergeRate: number;
    reviewQuality: number;
    issueResolutionTime: number;
  };
}

export interface GravitationalMetrics {
  frequency: number; // How often they collaborate
  reciprocity: number; // How balanced the relationship is (0-1)
  consistency: number; // How consistent the collaboration is over time
  impact: number; // The impact/value of their collaboration
  synergy: number; // How well their skills complement each other
  velocity: number; // How quickly they work together
}

export class GravitationalAnalysisEngine {
  /**
   * Analyze collaboration data to determine gravitational connections
   */
  analyzeCollaboration(
    collaborationData: CollaborationData[],
    developerStars: DeveloperStar[]
  ): CollaborationGravitationalConnection[] {
    const connections: CollaborationGravitationalConnection[] = [];
    const starMap = new Map(developerStars.map(s => [s.id, s]));

    for (const data of collaborationData) {
      const sourceStar = starMap.get(data.sourceId);
      const targetStar = starMap.get(data.targetId);

      if (!sourceStar || !targetStar) continue;

      const metrics = this.calculateGravitationalMetrics(data, sourceStar, targetStar);
      const connectionType = this.determineConnectionType(metrics, sourceStar, targetStar);
      const strength = this.calculateConnectionStrength(metrics);

      // Avoid duplicate connections
      const existingConnection = connections.find(
        c => (c.sourceId === data.sourceId && c.targetId === data.targetId) ||
             (c.sourceId === data.targetId && c.targetId === data.sourceId)
      );

      if (!existingConnection && strength > 0.1) { // Only include meaningful connections
        connections.push({
          id: `connection-${data.sourceId}-${data.targetId}`,
          sourceId: data.sourceId,
          targetId: data.targetId,
          strength,
          type: connectionType,
          frequency: metrics.frequency,
          reciprocity: metrics.reciprocity,
          energy: metrics.velocity,
          duration: this.calculateDuration(data.timeframe),
          lastInteraction: data.timeframe.end,
          projects: data.sharedProjects
        });
      }
    }

    return connections;
  }

  private calculateGravitationalMetrics(
    data: CollaborationData,
    source: DeveloperStar,
    target: DeveloperStar
  ): GravitationalMetrics {
    // Calculate total collaboration volume
    const totalInteractions = data.commits + data.pullRequests + data.codeReviews +
                            data.issues + data.comments;

    // Frequency (normalized interactions per day)
    const daysActive = Math.max(1, (data.timeframe.end.getTime() - data.timeframe.start.getTime()) / (1000 * 60 * 60 * 24));
    const frequency = Math.min(1, totalInteractions / daysActive / 10); // Normalize to 0-1

    // Reciprocity (balance of give-and-take)
    const sourceContributions = source.contributions.commits + source.contributions.reviews;
    const targetContributions = target.contributions.commits + target.contributions.reviews;
    const contributionRatio = Math.min(sourceContributions, targetContributions) /
                             Math.max(sourceContributions, targetContributions);
    const reciprocity = contributionRatio;

    // Consistency (based on regularity of interactions)
    const consistency = this.calculateConsistency(data);

    // Impact (based on quality metrics and project importance)
    const impact = (data.quality.prMergeRate * 0.4) +
                   (data.quality.reviewQuality * 0.3) +
                   (data.sharedProjects.length * 0.3);

    // Synergy (how well their archetypes and skills complement)
    const synergy = this.calculateSynergy(source, target);

    // Velocity (how quickly they work together)
    const velocity = this.calculateVelocity(data);

    return {
      frequency,
      reciprocity,
      consistency,
      impact,
      synergy,
      velocity
    };
  }

  private calculateConsistency(data: CollaborationData): number {
    // Simple consistency calculation based on distribution of interactions
    // In a real implementation, this would analyze temporal patterns
    const dailyAverage = (data.commits + data.pullRequests + data.codeReviews) /
                        Math.max(1, (data.timeframe.end.getTime() - data.timeframe.start.getTime()) / (1000 * 60 * 60 * 24));

    // Higher consistency for steady daily interactions
    return Math.min(1, dailyAverage / 5);
  }

  private calculateSynergy(source: DeveloperStar, target: DeveloperStar): number {
    // Calculate archetype synergy
    const archetypeSynergy = this.getArchetypeSynergy(source.archetype.id, target.archetype.id);

    // Calculate skill complementarity
    const sourceSkills = new Set(source.languages.map(l => l.name));
    const targetSkills = new Set(target.languages.map(l => l.name));
    const overlap = new Set([...sourceSkills].filter(s => targetSkills.has(s)));
    const uniqueSkills = new Set([...sourceSkills, ...targetSkills]);
    const skillComplementarity = 1 - (overlap.size / uniqueSkills.size);

    // Calculate expertise complementarity
    const sourceDomains = new Set(source.expertise.map(e => e.domain));
    const targetDomains = new Set(target.expertise.map(e => e.domain));
    const domainOverlap = new Set([...sourceDomains].filter(d => targetDomains.has(d)));
    const uniqueDomains = new Set([...sourceDomains, ...targetDomains]);
    const domainComplementarity = 1 - (domainOverlap.size / uniqueDomains.size);

    return (archetypeSynergy * 0.4) + (skillComplementarity * 0.3) + (domainComplementarity * 0.3);
  }

  private getArchetypeSynergy(sourceArchetype: string, targetArchetype: string): number {
    // Define synergy scores between archetypes
    const synergyMatrix: Record<string, Record<string, number>> = {
      'pioneer': {
        'guardian': 0.8,
        'connector': 0.9,
        'innovator': 0.7,
        'specialist': 0.6,
        'mentor': 0.5
      },
      'guardian': {
        'pioneer': 0.8,
        'connector': 0.7,
        'innovator': 0.9,
        'specialist': 0.8,
        'mentor': 0.9
      },
      'connector': {
        'pioneer': 0.9,
        'guardian': 0.7,
        'innovator': 0.8,
        'specialist': 0.9,
        'mentor': 0.8
      },
      'innovator': {
        'pioneer': 0.7,
        'guardian': 0.9,
        'connector': 0.8,
        'specialist': 0.6,
        'mentor': 0.7
      },
      'specialist': {
        'pioneer': 0.6,
        'guardian': 0.8,
        'connector': 0.9,
        'innovator': 0.6,
        'mentor': 0.8
      },
      'mentor': {
        'pioneer': 0.5,
        'guardian': 0.9,
        'connector': 0.8,
        'innovator': 0.7,
        'specialist': 0.8
      }
    };

    return synergyMatrix[sourceArchetype]?.[targetArchetype] || 0.5;
  }

  private calculateVelocity(data: CollaborationData): number {
    // Calculate how quickly they work together
    const totalWork = data.commits + data.pullRequests + data.issues;
    const daysActive = Math.max(1, (data.timeframe.end.getTime() - data.timeframe.start.getTime()) / (1000 * 60 * 60 * 24));

    // Normalize velocity based on quality
    const baseVelocity = totalWork / daysActive;
    const qualityMultiplier = data.quality.prMergeRate * data.quality.reviewQuality;

    return Math.min(1, (baseVelocity * qualityMultiplier) / 10);
  }

  private determineConnectionType(
    metrics: GravitationalMetrics,
    source: DeveloperStar,
    target: DeveloperStar
  ): ConnectionType {
    const { strength, reciprocity, frequency, consistency, synergy } = metrics;

    // Strong gravity - frequent, balanced, consistent collaboration
    if (strength > 0.8 && reciprocity > 0.7 && consistency > 0.7) {
      return 'strong_gravity';
    }

    // Tidal force - periodic but strong project-based collaboration
    if (frequency > 0.6 && consistency < 0.5 && synergy > 0.7) {
      return 'tidal_force';
    }

    // Quantum entanglement - unexpected but highly effective pairings
    if (synergy > 0.8 && frequency < 0.5 && strength > 0.6) {
      return 'quantum_entangle';
    }

    // Gravitational lens - connectors who bring others together
    if ((source.archetype.id === 'connector' || target.archetype.id === 'connector') &&
        source.contributions.communication > 0.7 &&
        target.contributions.communication > 0.7) {
      return 'gravitational_lens';
    }

    // Orbital sync - similar working patterns
    if (reciprocity > 0.8 && consistency > 0.6) {
      return 'orbital_sync';
    }

    // Comet trajectory - occasional but impactful interactions
    if (frequency < 0.3 && strength > 0.5) {
      return 'comet_trajectory';
    }

    // Default to tidal force
    return 'tidal_force';
  }

  private calculateConnectionStrength(metrics: GravitationalMetrics): number {
    // Combine all metrics into a single strength score
    return (
      (metrics.frequency * 0.25) +
      (metrics.reciprocity * 0.20) +
      (metrics.consistency * 0.20) +
      (metrics.impact * 0.20) +
      (metrics.synergy * 0.15)
    );
  }

  private calculateDuration(timeframe: { start: Date; end: Date }): number {
    return (timeframe.end.getTime() - timeframe.start.getTime()) / (1000 * 60 * 60 * 24); // days
  }

  // ==================== GRAVITATIONAL NETWORK ANALYSIS ====================

  /**
   * Analyze the overall gravitational network structure
   */
  analyzeNetworkStructure(
    connections: CollaborationGravitationalConnection[],
    stars: DeveloperStar[]
  ): {
    density: number;
    clusters: string[][];
    bridges: string[];
    isolates: string[];
    centrality: Record<string, number>;
  } {
    const starIds = stars.map(s => s.id);
    const maxConnections = (starIds.length * (starIds.length - 1)) / 2;
    const actualConnections = connections.length;

    // Network density
    const density = actualConnections / maxConnections;

    // Find clusters using simple community detection
    const clusters = this.findClusters(connections, stars);

    // Find bridges (nodes that connect different clusters)
    const bridges = this.findBridges(connections, clusters);

    // Find isolates (nodes with no strong connections)
    const isolates = this.findIsolates(connections, stars);

    // Calculate centrality for each node
    const centrality = this.calculateCentrality(connections, stars);

    return {
      density,
      clusters,
      bridges,
      isolates,
      centrality
    };
  }

  private findClusters(
    connections: CollaborationGravitationalConnection[],
    stars: DeveloperStar[]
  ): string[][] {
    // Simple clustering based on strong connections
    const threshold = 0.6; // Minimum connection strength for clustering
    const strongConnections = connections.filter(c => c.strength >= threshold);
    const clusters: string[][] = [];
    const processed = new Set<string>();

    for (const star of stars) {
      if (processed.has(star.id)) continue;

      const cluster = [star.id];
      processed.add(star.id);

      // Find all stars connected to this star
      const queue = strongConnections
        .filter(c => c.sourceId === star.id || c.targetId === star.id)
        .map(c => c.sourceId === star.id ? c.targetId : c.sourceId);

      while (queue.length > 0) {
        const nextStar = queue.pop()!;
        if (!processed.has(nextStar)) {
          cluster.push(nextStar);
          processed.add(nextStar);

          // Add its connections to the queue
          const nextConnections = strongConnections
            .filter(c => c.sourceId === nextStar || c.targetId === nextStar)
            .map(c => c.sourceId === nextStar ? c.targetId : c.sourceId)
            .filter(id => !processed.has(id));

          queue.push(...nextConnections);
        }
      }

      if (cluster.length > 1) {
        clusters.push(cluster);
      }
    }

    return clusters;
  }

  private findBridges(
    connections: CollaborationGravitationalConnection[],
    clusters: string[][]
  ): string[] {
    const bridges: string[] = [];
    const clusterMap = new Map<string, number>();

    clusters.forEach((cluster, index) => {
      cluster.forEach(starId => clusterMap.set(starId, index));
    });

    for (const connection of connections) {
      const sourceCluster = clusterMap.get(connection.sourceId);
      const targetCluster = clusterMap.get(connection.targetId);

      // If this connects different clusters, mark both as bridges
      if (sourceCluster !== undefined && targetCluster !== undefined && sourceCluster !== targetCluster) {
        if (!bridges.includes(connection.sourceId)) {
          bridges.push(connection.sourceId);
        }
        if (!bridges.includes(connection.targetId)) {
          bridges.push(connection.targetId);
        }
      }
    }

    return bridges;
  }

  private findIsolates(
    connections: CollaborationGravitationalConnection[],
    stars: DeveloperStar[]
  ): string[] {
    const connectedStars = new Set<string>();

    connections.forEach(connection => {
      connectedStars.add(connection.sourceId);
      connectedStars.add(connection.targetId);
    });

    return stars
      .filter(s => !connectedStars.has(s.id))
      .map(s => s.id);
  }

  private calculateCentrality(
    connections: CollaborationGravitationalConnection[],
    stars: DeveloperStar[]
  ): Record<string, number> {
    const centrality: Record<string, number> = {};

    // Initialize all stars with 0 centrality
    stars.forEach(star => {
      centrality[star.id] = 0;
    });

    // Calculate degree centrality weighted by connection strength
    connections.forEach(connection => {
      centrality[connection.sourceId] += connection.strength;
      centrality[connection.targetId] += connection.strength;
    });

    // Normalize centrality scores
    const maxCentrality = Math.max(...Object.values(centrality));
    if (maxCentrality > 0) {
      Object.keys(centrality).forEach(starId => {
        centrality[starId] = centrality[starId] / maxCentrality;
      });
    }

    return centrality;
  }

  // ==================== COLLABORATION PATTERNS ====================

  /**
   * Identify collaboration patterns and relationships
   */
  identifyPatterns(
    connections: CollaborationGravitationalConnection[],
    constellations: TeamConstellation[]
  ): {
    mentorshipPairs: string[][];
    innovationClusters: string[][];
    qualityTriangles: string[][][];
    communicationHubs: string[];
  } {
    const mentorshipPairs = this.findMentorshipPairs(connections);
    const innovationClusters = this.findInnovationClusters(connections, constellations);
    const qualityTriangles = this.findQualityTriangles(connections);
    const communicationHubs = this.findCommunicationHubs(connections);

    return {
      mentorshipPairs,
      innovationClusters,
      qualityTriangles,
      communicationHubs
    };
  }

  private findMentorshipPairs(connections: CollaborationGravitationalConnection[]): string[][] {
    return connections
      .filter(c => c.type === 'strong_gravity' && c.reciprocity < 0.5)
      .map(c => [c.sourceId, c.targetId]);
  }

  private findInnovationClusters(
    connections: CollaborationGravitationalConnection[],
    constellations: TeamConstellation[]
  ): string[] {
    // Look for quantum entanglement connections within innovator constellations
    const innovatorConstellation = constellations.find(c => c.archetypeId === 'innovator');
    if (!innovatorConstellation) return [];

    return connections
      .filter(c =>
        c.type === 'quantum_entangle' &&
        innovatorConstellation.stars.includes(c.sourceId) &&
        innovatorConstellation.stars.includes(c.targetId)
      )
      .flatMap(c => [c.sourceId, c.targetId])
      .filter((star, index, arr) => arr.indexOf(star) === index);
  }

  private findQualityTriangles(connections: CollaborationGravitationalConnection[]): string[][][] {
    // Find triangles of strong collaborations
    const triangles: string[][][] = [];
    const strongConnections = connections.filter(c => c.strength > 0.7);

    for (let i = 0; i < strongConnections.length; i++) {
      for (let j = i + 1; j < strongConnections.length; j++) {
        for (let k = j + 1; k < strongConnections.length; k++) {
          const c1 = strongConnections[i];
          const c2 = strongConnections[j];
          const c3 = strongConnections[k];

          // Check if these three connections form a triangle
          const nodes = new Set([
            c1.sourceId, c1.targetId,
            c2.sourceId, c2.targetId,
            c3.sourceId, c3.targetId
          ]);

          if (nodes.size === 3) {
            const triangle = Array.from(nodes);
            triangles.push(triangle);
          }
        }
      }
    }

    return triangles;
  }

  private findCommunicationHubs(connections: CollaborationGravitationalConnection[]): string[] {
    const connectionCounts: Record<string, number> = {};

    connections.forEach(connection => {
      connectionCounts[connection.sourceId] = (connectionCounts[connection.sourceId] || 0) + 1;
      connectionCounts[connection.targetId] = (connectionCounts[connection.targetId] || 0) + 1;
    });

    // Find nodes with many connections (top 20%)
    const sortedNodes = Object.entries(connectionCounts)
      .sort(([, a], [, b]) => b - a);

    const threshold = Math.ceil(sortedNodes.length * 0.2);
    return sortedNodes.slice(0, threshold).map(([starId]) => starId);
  }

  // ==================== COLLABORATION RECOMMENDATIONS ====================

  /**
   * Generate collaboration recommendations based on gravitational analysis
   */
  generateRecommendations(
    connections: CollaborationGravitationalConnection[],
    stars: DeveloperStar[],
    networkStructure: any
  ): string[] {
    const recommendations: string[] = [];

    // Low density recommendations
    if (networkStructure.density < 0.3) {
      recommendations.push(
        'Consider increasing cross-team collaboration to strengthen the gravitational network'
      );
    }

    // Isolated members
    if (networkStructure.isolates.length > 0) {
      recommendations.push(
        `${networkStructure.isolates.length} team member(s) appear to be isolated. Consider fostering more inclusive collaboration practices.`
      );
    }

    // Bridge strengthening
    if (networkStructure.bridges.length > 0) {
      recommendations.push(
        'Strengthen bridge connections between clusters to improve knowledge flow and innovation.'
      );
    }

    // Asymmetric relationships
    const asymmetricConnections = connections.filter(c => c.reciprocity < 0.3 && c.strength > 0.5);
    if (asymmetricConnections.length > 0) {
      recommendations.push(
        'Some collaboration relationships show imbalance. Consider mentoring programs to create more reciprocal partnerships.'
      );
    }

    // Innovation opportunities
    const innovationConnections = connections.filter(c => c.type === 'quantum_entangle');
    if (innovationConnections.length > 0) {
      recommendations.push(
        `Found ${innovationConnections.length} unexpected but effective collaborations. Consider formalizing these partnerships for innovation initiatives.`
      );
    }

    return recommendations;
  }
}

export default GravitationalAnalysisEngine;