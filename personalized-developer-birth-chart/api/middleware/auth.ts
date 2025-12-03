import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { config } from '../../config/env';
import { supabase } from '../lib/supabase';
import { User, Subscription, SubscriptionTier } from '../types';

export interface AuthenticatedRequest extends NextRequest {
  user?: User;
  subscription?: Subscription;
}

interface JWTPayload {
  userId: string;
  email: string;
  iat?: number;
  exp?: number;
}

// JWT token handling
export function generateJWT(user: User): string {
  const payload: JWTPayload = {
    userId: user.id,
    email: user.email
  };

  return jwt.sign(payload, config.jwtSecret, {
    expiresIn: '7d'
  });
}

export function verifyJWT(token: string): JWTPayload {
  try {
    return jwt.verify(token, config.jwtSecret) as JWTPayload;
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
}

export async function authenticate(request: NextRequest): Promise<AuthenticatedRequest> {
  const authRequest = request as AuthenticatedRequest;

  try {
    // Get token from Authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new Error('No valid authorization header');
    }

    const token = authHeader.substring(7);
    const decoded = verifyJWT(token);

    // Get user from database
    const user = await supabase.getUserById(decoded.userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Get user subscription
    const subscription = await supabase.getUserSubscription(user.id);

    authRequest.user = user;
    authRequest.subscription = subscription || undefined;

    return authRequest;
  } catch (error) {
    throw new Error(`Authentication failed: ${error.message}`);
  }
}

// Middleware wrapper for API routes
export function withAuth(handler: (req: AuthenticatedRequest, ...args: any[]) => Promise<Response>) {
  return async (request: NextRequest, ...args: any[]): Promise<Response> => {
    try {
      const authenticatedRequest = await authenticate(request);
      return await handler(authenticatedRequest, ...args);
    } catch (error) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: error.message
          }
        },
        { status: 401 }
      );
    }
  };
}

// Optional authentication (doesn't fail if no auth)
export async function optionalAuthenticate(request: NextRequest): Promise<AuthenticatedRequest> {
  const authRequest = request as AuthenticatedRequest;

  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return authRequest;
    }

    const token = authHeader.substring(7);
    const decoded = verifyJWT(token);

    const user = await supabase.getUserById(decoded.userId);
    if (user) {
      const subscription = await supabase.getUserSubscription(user.id);
      authRequest.user = user;
      authRequest.subscription = subscription || undefined;
    }
  } catch (error) {
    // Ignore errors in optional authentication
  }

  return authRequest;
}

// Middleware wrapper for optional auth
export function withOptionalAuth(handler: (req: AuthenticatedRequest, ...args: any[]) => Promise<Response>) {
  return async (request: NextRequest, ...args: any[]): Promise<Response> => {
    const authenticatedRequest = await optionalAuthenticate(request);
    return await handler(authenticatedRequest, ...args);
  };
}

// Check if user has specific subscription tier or higher
export function hasRequiredTier(currentTier: SubscriptionTier, requiredTier: SubscriptionTier): boolean {
  const tierHierarchy = {
    [SubscriptionTier.FREE]: 0,
    [SubscriptionTier.STARTER]: 1,
    [SubscriptionTier.PRO]: 2,
    [SubscriptionTier.TEAM]: 3,
    [SubscriptionTier.ENTERPRISE]: 4
  };

  return tierHierarchy[currentTier] >= tierHierarchy[requiredTier];
}

// Feature gating middleware
export function requireFeature(feature: keyof ReturnType<typeof supabase.getUserSubscription>) {
  return function(handler: (req: AuthenticatedRequest, ...args: any[]) => Promise<Response>) {
    return withAuth(async (request: AuthenticatedRequest, ...args: any[]): Promise<Response> => {
      if (!request.subscription) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'FEATURE_REQUIRED',
              message: 'This feature requires a premium subscription'
            }
          },
          { status: 403 }
        );
      }

      const subscription = request.subscription;
      const usageLimits = subscription.usage_limits;

      if (usageLimits && usageLimits[feature] === false) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'FEATURE_NOT_AVAILABLE',
              message: `This feature is not available in your current subscription tier`,
              currentTier: subscription.tier
            }
          },
          { status: 403 }
        );
      }

      return await handler(request, ...args);
    });
  };
}

// Team ownership middleware
export function requireTeamOwnership() {
  return withAuth(async (request: AuthenticatedRequest, ...args: any[]): Promise<Response> => {
    const url = new URL(request.url);
    const teamId = url.pathname.split('/')[3]; // Assuming /api/teams/:teamId/...

    if (!teamId) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_REQUEST',
            message: 'Team ID is required'
          }
        },
        { status: 400 }
      );
    }

    const team = await supabase.getTeamById(teamId);
    if (!team) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'TEAM_NOT_FOUND',
            message: 'Team not found'
          }
        },
        { status: 404 }
      );
    }

    const userMembership = team.team_members?.find(member => member.user_id === request.user?.id);
    const isOwner = team.owner_id === request.user?.id;
    const isAdmin = userMembership?.role === 'admin';

    if (!isOwner && !isAdmin) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INSUFFICIENT_PERMISSIONS',
            message: 'You must be a team owner or admin to perform this action'
          }
        },
        { status: 403 }
      );
    }

    // Add team to request for use in handler
    (request as any).team = team;
    return await (args[0] as any)(request, ...args.slice(1));
  });
}

// Team membership middleware (less restrictive than ownership)
export function requireTeamMembership() {
  return withAuth(async (request: AuthenticatedRequest, ...args: any[]): Promise<Response> => {
    const url = new URL(request.url);
    const teamId = url.pathname.split('/')[3];

    if (!teamId) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_REQUEST',
            message: 'Team ID is required'
          }
        },
        { status: 400 }
      );
    }

    const team = await supabase.getTeamById(teamId);
    if (!team) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'TEAM_NOT_FOUND',
            message: 'Team not found'
          }
        },
        { status: 404 }
      );
    }

    const isOwner = team.owner_id === request.user?.id;
    const isMember = team.team_members?.some(member => member.user_id === request.user?.id);

    if (!isOwner && !isMember) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INSUFFICIENT_PERMISSIONS',
            message: 'You must be a team member to access this resource'
          }
        },
        { status: 403 }
      );
    }

    (request as any).team = team;
    return await (args[0] as any)(request, ...args.slice(1));
  });
}

// Admin middleware (for future admin features)
export function requireAdmin(handler: (req: AuthenticatedRequest, ...args: any[]) => Promise<Response>) {
  return withAuth(async (request: AuthenticatedRequest, ...args: any[]): Promise<Response> => {
    // For now, we'll use a simple check - in production, you'd want a proper admin system
    const adminEmails = ['admin@devbirthchart.com']; // Move to config/env

    if (!request.user || !adminEmails.includes(request.user.email)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INSUFFICIENT_PERMISSIONS',
            message: 'Admin access required'
          }
        },
        { status: 403 }
      );
    }

    return await handler(request, ...args);
  });
}

// Utility to get user's current tier
export function getUserTier(subscription?: Subscription): SubscriptionTier {
  if (!subscription) return SubscriptionTier.FREE;

  // Return free tier if subscription is not active
  if (subscription.status !== 'active') return SubscriptionTier.FREE;

  return subscription.tier as SubscriptionTier;
}