/**
 * Elite-Grade Security Monitoring for Vizualni-Admin
 * Implements real-time threat detection, incident response, and compliance monitoring
 */

interface SecurityEvent {
  id: string;
  type: SecurityEventType;
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: string;
  source: {
    ip?: string;
    userAgent?: string;
    userId?: string;
    sessionId?: string;
  };
  details: Record<string, any>;
  resolved?: boolean;
  resolvedAt?: string;
  resolvedBy?: string;
}

interface SecurityMetrics {
  timestamp: string;
  totalEvents: number;
  eventsByType: Record<SecurityEventType, number>;
  eventsBySeverity: Record<string, number>;
  uniqueIPs: number;
  blockedIPs: number;
  threatScore: number;
}

interface SecurityAlert {
  id: string;
  type: AlertType;
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  timestamp: string;
  events: SecurityEvent[];
  status: 'open' | 'investigating' | 'resolved' | 'false_positive';
  assignedTo?: string;
  metadata: Record<string, any>;
}

type SecurityEventType = 
  | 'auth_failure'
  | 'rate_limit_exceeded'
  | 'xss_attempt'
  | 'injection_attempt'
  | 'suspicious_request'
  | 'privilege_escalation'
  | 'data_exfiltration'
  | 'malicious_upload'
  | 'brute_force_attack'
  | 'unauthorized_access'
  | 'anomalous_behavior';

type AlertType = 
  | 'security_breach'
  | 'policy_violation'
  | 'performance_anomaly'
  | 'compliance_issue'
  | 'system_compromise';

export class SecurityMonitor {
  private events: SecurityEvent[] = [];
  private alerts: SecurityAlert[] = [];
  private blockedIPs = new Set<string>();
  private suspiciousIPs = new Map<string, { count: number; lastSeen: number }>();
  private metrics: SecurityMetrics[] = [];
  private maxEvents = 10000;
  private maxMetrics = 10080;
  
  constructor() {
    this.startBackgroundTasks();
  }
  
  logEvent(event: Omit<SecurityEvent, 'id' | 'timestamp'>): void {
    const securityEvent: SecurityEvent = {
      ...event,
      id: this.generateEventId(),
      timestamp: new Date().toISOString()
    };
    
    this.events.push(securityEvent);
    
    if (this.events.length > this.maxEvents) {
      this.events = this.events.slice(-this.maxEvents);
    }
    
    if (event.source.ip) {
      this.updateSuspiciousIP(event.source.ip, event.type);
    }
    
    this.analyzeEvent(securityEvent);
    this.updateMetrics();
    
    console.log('Security Event Logged:', {
      id: securityEvent.id,
      type: securityEvent.type,
      severity: securityEvent.severity,
      ip: securityEvent.source.ip
    });
  }
  
  getRecentEvents(hours: number = 24, filters?: {
    type?: SecurityEventType;
    severity?: string;
    ip?: string;
    userId?: string;
  }): SecurityEvent[] {
    const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000);
    
    let filteredEvents = this.events.filter(event => 
      new Date(event.timestamp) >= cutoff
    );
    
    if (filters) {
      if (filters.type) {
        filteredEvents = filteredEvents.filter(e => e.type === filters.type);
      }
      if (filters.severity) {
        filteredEvents = filteredEvents.filter(e => e.severity === filters.severity);
      }
      if (filters.ip) {
        filteredEvents = filteredEvents.filter(e => e.source.ip === filters.ip);
      }
      if (filters.userId) {
        filteredEvents = filteredEvents.filter(e => e.source.userId === filters.userId);
      }
    }
    
    return filteredEvents.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }
  
  getActiveAlerts(): SecurityAlert[] {
    return this.alerts.filter(alert => 
      alert.status === 'open' || alert.status === 'investigating'
    ).sort((a, b) => {
      const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
      const severityDiff = (severityOrder[b.severity as keyof typeof severityOrder] || 0) - 
                         (severityOrder[a.severity as keyof typeof severityOrder] || 0);
      
      if (severityDiff !== 0) return severityDiff;
      
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    });
  }
  
  getCurrentMetrics(): SecurityMetrics {
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    
    const recentEvents = this.events.filter(event => 
      new Date(event.timestamp) >= oneHourAgo
    );
    
    const eventsByType = recentEvents.reduce((acc, event) => {
      acc[event.type] = (acc[event.type] || 0) + 1;
      return acc;
    }, {} as Record<SecurityEventType, number>);
    
    const eventsBySeverity = recentEvents.reduce((acc, event) => {
      acc[event.severity] = (acc[event.severity] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const uniqueIPs = new Set(recentEvents.map(e => e.source.ip).filter(Boolean)).size;
    
    return {
      timestamp: now.toISOString(),
      totalEvents: recentEvents.length,
      eventsByType,
      eventsBySeverity,
      uniqueIPs,
      blockedIPs: this.blockedIPs.size,
      threatScore: this.calculateThreatScore(recentEvents)
    };
  }
  
  blockIP(ip: string, duration: number = 24 * 60 * 60 * 1000, reason?: string): void {
    this.blockedIPs.add(ip);
    
    this.logEvent({
      type: 'unauthorized_access',
      severity: 'medium',
      source: { ip },
      details: {
        action: 'ip_blocked',
        duration,
        reason: reason || 'Security policy violation'
      }
    });
    
    console.warn('IP blocked:', ip, 'Reason:', reason || 'Security violation');
    
    setTimeout(() => {
      this.blockedIPs.delete(ip);
      console.log('IP unblocked:', ip);
    }, duration);
  }
  
  isIPBlocked(ip: string): boolean {
    return this.blockedIPs.has(ip);
  }
  
  createAlert(alert: Omit<SecurityAlert, 'id' | 'timestamp' | 'events'>): void {
    const securityAlert: SecurityAlert = {
      ...alert,
      id: this.generateAlertId(),
      timestamp: new Date().toISOString(),
      events: []
    };
    
    this.alerts.push(securityAlert);
    
    console.error('Security Alert Created:', {
      id: securityAlert.id,
      type: securityAlert.type,
      severity: securityAlert.severity,
      title: securityAlert.title
    });
    
    if (process.env.NODE_ENV === 'production') {
      this.sendSecurityNotification(securityAlert);
    }
  }
  
  private analyzeEvent(event: SecurityEvent): void {
    if (event.type === 'auth_failure') {
      const recentFailures = this.events.filter(e =>
        e.type === 'auth_failure' &&
        e.source.ip === event.source.ip &&
        new Date(e.timestamp).getTime() > Date.now() - 5 * 60 * 1000
      );
      
      if (recentFailures.length >= 5) {
        this.createAlert({
          type: 'security_breach',
          severity: 'high',
          title: 'Brute Force Attack Detected',
          description: 'Multiple authentication failures from IP ' + event.source.ip,
          status: 'open',
          metadata: {
            ip: event.source.ip,
            failureCount: recentFailures.length,
            timeWindow: '5 minutes'
          }
        });
        
        this.blockIP(event.source.ip!, 60 * 60 * 1000, 'Brute force attack');
      }
    }
    
    if (event.type === 'xss_attempt') {
      this.createAlert({
        type: 'security_breach',
        severity: 'critical',
        title: 'XSS Attack Attempt Detected',
        description: 'Cross-site scripting attempt detected from IP ' + event.source.ip,
        status: 'open',
        metadata: {
          ip: event.source.ip,
          payload: event.details.payload
        }
      });
      
      this.blockIP(event.source.ip!, 24 * 60 * 60 * 1000, 'XSS attack attempt');
    }
    
    this.detectAnomalousPatterns(event);
  }
  
  private detectAnomalousPatterns(event: SecurityEvent): void {
    const timeWindow = 60 * 60 * 1000;
    const recentEvents = this.events.filter(e =>
      new Date(e.timestamp).getTime() > Date.now() - timeWindow
    );
    
    if (event.type === 'suspicious_request') {
      const ipEvents = recentEvents.filter(e => e.source.ip === event.source.ip);
      
      if (ipEvents.length > 1000) {
        this.createAlert({
          type: 'security_breach',
          severity: 'medium',
          title: 'Unusual Request Frequency',
          description: 'High frequency of requests from IP ' + event.source.ip,
          status: 'open',
          metadata: {
            ip: event.source.ip,
            requestCount: ipEvents.length,
            timeWindow: '1 hour'
          }
        });
      }
    }
  }
  
  private updateSuspiciousIP(ip: string, eventType: SecurityEventType): void {
    if (!ip) return;
    
    const suspiciousTypes = [
      'auth_failure',
      'xss_attempt',
      'injection_attempt',
      'suspicious_request',
      'privilege_escalation'
    ];
    
    if (suspiciousTypes.includes(eventType)) {
      const current = this.suspiciousIPs.get(ip) || { count: 0, lastSeen: Date.now() };
      current.count++;
      current.lastSeen = Date.now();
      this.suspiciousIPs.set(ip, current);
      
      if (current.count >= 20) {
        this.blockIP(ip, 12 * 60 * 60 * 1000, 'High suspicious activity count');
        this.suspiciousIPs.delete(ip);
      }
    }
  }
  
  private calculateThreatScore(events: SecurityEvent[]): number {
    if (events.length === 0) return 0;
    
    const severityWeights = {
      critical: 10,
      high: 5,
      medium: 2,
      low: 1
    };
    
    const threatScore = events.reduce((score, event) => {
      return score + (severityWeights[event.severity as keyof typeof severityWeights] || 0);
    }, 0);
    
    return Math.min(100, Math.round((threatScore / events.length) * 10));
  }
  
  private updateMetrics(): void {
    const metrics = this.getCurrentMetrics();
    this.metrics.push(metrics);
    
    if (this.metrics.length > this.maxMetrics) {
      this.metrics = this.metrics.slice(-this.maxMetrics);
    }
  }
  
  private startBackgroundTasks(): void {
    setInterval(() => {
      this.cleanupOldData();
    }, 60 * 60 * 1000);
    
    setInterval(() => {
      this.generateHourlyReport();
    }, 60 * 60 * 1000);
  }
  
  private cleanupOldData(): void {
    const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    
    this.events = this.events.filter(event =>
      new Date(event.timestamp).getTime() > oneWeekAgo
    );
    
    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
    this.alerts = this.alerts.filter(alert =>
      alert.status === 'open' || 
      alert.status === 'investigating' ||
      (alert.status === 'resolved' && new Date(alert.timestamp).getTime() > thirtyDaysAgo)
    );
    
    for (const [ip, data] of this.suspiciousIPs.entries()) {
      if (Date.now() - data.lastSeen > 24 * 60 * 60 * 1000) {
        this.suspiciousIPs.delete(ip);
      }
    }
  }
  
  private generateHourlyReport(): void {
    const metrics = this.getCurrentMetrics();
    const activeAlerts = this.getActiveAlerts();
    
    const report = {
      timestamp: metrics.timestamp,
      threatScore: metrics.threatScore,
      totalEvents: metrics.totalEvents,
      activeAlerts: activeAlerts.length,
      blockedIPs: metrics.blockedIPs,
      criticalAlerts: activeAlerts.filter(a => a.severity === 'critical').length
    };
    
    console.log('Hourly Security Report:', report);
  }
  
  private sendSecurityNotification(alert: SecurityAlert): void {
    console.error('SECURITY NOTIFICATION:', {
      alert: alert.title,
      severity: alert.severity,
      timestamp: alert.timestamp
    });
  }
  
  private generateEventId(): string {
    return 'evt_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }
  
  private generateAlertId(): string {
    return 'alert_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }
}

export const securityMonitor = new SecurityMonitor();
export default SecurityMonitor;