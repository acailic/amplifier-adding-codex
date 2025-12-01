import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { supabase } from '../lib/supabase';
import { githubService } from '../lib/github';
import { withAuth, requireTeamMembership, requireTeamOwnership } from '../middleware/auth';
import { rateLimit } from '../middleware/rateLimit';
import { APIResponse, Team } from '../types';
import { config } from '../../config/env';
import { nanoid } from 'nanoid';

// Create a new team
export const POST = withAuth(
  rateLimit('apiCall')(
    async (request: any): Promise<NextResponse<APIResponse<Team>>> => {
      try {
        const body = await request.json();
        const { name, member_usernames } = body;

        if (!name || name.length < 2) {
          return NextResponse.json({
            success: false,
            error: {
              code: 'VALIDATION_ERROR',
              message: 'Team name must be at least 2 characters long'
            }
          }, { status: 400 });
        }

        // Check if user has team features in their subscription
        if (!request.subscription?.usage_limits?.team_members || request.subscription.usage_limits.team_members <= 1) {
          return NextResponse.json({
            success: false,
            error: {
              code: 'PREMIUM_FEATURE_REQUIRED',
              message: 'Team features require a Pro subscription or higher'
            }
          }, { status: 403 });
        }

        // Create the team
        const team = await supabase.createTeam({
          name,
          owner_id: request.user.id
        });

        // Add owner as a member
        await supabase.addTeamMember({
          team_id: team.id,
          user_id: request.user.id,
          role: 'owner'
        });

        // If additional members provided, process them
        if (member_usernames && member_usernames.length > 0) {
          await addTeamMembers(team.id, member_usernames, request.user.id);
        }

        // Get the complete team data
        const completeTeam = await supabase.getTeamById(team.id);

        // Track usage
        await supabase.trackUsage({
          user_id: request.user.id,
          event_type: 'team_analysis',
          resource_id: team.id,
          metadata: { name, member_count: member_usernames?.length || 0 }
        });

        return NextResponse.json({
          success: true,
          data: completeTeam!
        });

      } catch (error) {
        console.error('Create team error:', error);
        return NextResponse.json({
          success: false,
          error: {
            code: 'CREATE_TEAM_FAILED',
            message: 'Failed to create team',
            details: config.isDevelopment ? error.message : undefined
          }
        }, { status: 500 });
      }
    }
  )
);

// Get user's teams
export const GET = withAuth(
  rateLimit('apiCall')(
    async (request: any): Promise<NextResponse<APIResponse<Team[]>>> => {
      try {
        const teams = await supabase.getUserTeams(request.user.id);

        return NextResponse.json({
          success: true,
          data: teams
        });

      } catch (error) {
        console.error('Get teams error:', error);
        return NextResponse.json({
          success: false,
          error: {
            code: 'GET_TEAMS_FAILED',
            message: 'Failed to retrieve teams'
          }
        }, { status: 500 });
      }
    }
  )
);

// Get specific team by ID
export async function getTeamById(
  request: any,
  teamId: string
): Promise<NextResponse<APIResponse<Team>>> {
  try {
    const team = await supabase.getTeamById(teamId);

    if (!team) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'TEAM_NOT_FOUND',
          message: 'Team not found'
        }
      }, { status: 404 });
    }

    // Check if user is a member
    const isOwner = team.owner_id === request.user.id;
    const isMember = team.team_members?.some(member => member.user_id === request.user.id);

    if (!isOwner && !isMember) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'ACCESS_DENIED',
          message: 'You must be a team member to view this team'
        }
      }, { status: 403 });
    }

    return NextResponse.json({
      success: true,
      data: team
    });

  } catch (error) {
    console.error('Get team error:', error);
    return NextResponse.json({
      success: false,
      error: {
        code: 'GET_TEAM_FAILED',
        message: 'Failed to retrieve team'
      }
    }, { status: 500 });
  }
}

// Update team
export async function updateTeam(
  request: any,
  teamId: string
): Promise<NextResponse<APIResponse<Team>>> {
  try {
    const body = await request.json();
    const { name } = body;

    if (!name || name.length < 2) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Team name must be at least 2 characters long'
        }
      }, { status: 400 });
    }

    // Update team name in database
    const updatedTeam = await supabase.query(`
      UPDATE teams
      SET name = $1, updated_at = NOW()
      WHERE id = $2 AND owner_id = $3
      RETURNING *
    `, [name, teamId, request.user.id]);

    if (!updatedTeam || updatedTeam.length === 0) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'TEAM_NOT_FOUND_OR_NO_PERMISSION',
          message: 'Team not found or you do not have permission to update it'
        }
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: updatedTeam[0]
    });

  } catch (error) {
    console.error('Update team error:', error);
    return NextResponse.json({
      success: false,
      error: {
        code: 'UPDATE_TEAM_FAILED',
        message: 'Failed to update team'
      }
    }, { status: 500 });
  }
}

// Add team members
export async function addTeamMembers(
  teamId: string,
  usernames: string[],
  requestUserId: string
): Promise<NextResponse<APIResponse<{ added: string[], errors: string[] }>>> {
  try {
    const team = await supabase.getTeamById(teamId);
    if (!team) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'TEAM_NOT_FOUND',
          message: 'Team not found'
        }
      }, { status: 404 });
    }

    // Check permissions
    const isOwner = team.owner_id === requestUserId;
    const userMembership = team.team_members?.find(member => member.user_id === requestUserId);
    const isAdmin = userMembership?.role === 'admin';

    if (!isOwner && !isAdmin) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'INSUFFICIENT_PERMISSIONS',
          message: 'Only team owners and admins can add members'
        }
      }, { status: 403 });
    }

    const added: string[] = [];
    const errors: string[] = [];

    for (const username of usernames) {
      try {
        // Find user by GitHub username
        const { data: user } = await supabase.query(`
          SELECT id, username FROM users WHERE github_username = $1 LIMIT 1
        `, [username]);

        if (!user || user.length === 0) {
          errors.push(`${username}: User not found`);
          continue;
        }

        // Check if user is already a member
        const existingMember = team.team_members?.find(member => member.user_id === user[0].id);
        if (existingMember) {
          errors.push(`${username}: Already a team member`);
          continue;
        }

        // Check team size limit
        const currentSize = team.team_members?.length || 0;
        const maxMembers = team.usage_limits?.team_members || 10;
        if (currentSize >= maxMembers) {
          errors.push(`${username}: Team size limit reached`);
          continue;
        }

        // Add member
        await supabase.addTeamMember({
          team_id: teamId,
          user_id: user[0].id,
          role: 'member'
        });

        added.push(username);

      } catch (error) {
        errors.push(`${username}: Failed to add - ${error.message}`);
      }
    }

    // If members were added, regenerate team constellation
    if (added.length > 0) {
      await regenerateTeamConstellation(teamId);
    }

    return NextResponse.json({
      success: true,
      data: { added, errors }
    });

  } catch (error) {
    console.error('Add team members error:', error);
    return NextResponse.json({
      success: false,
      error: {
        code: 'ADD_MEMBERS_FAILED',
        message: 'Failed to add team members'
      }
    }, { status: 500 });
  }
}

// Remove team member
export async function removeTeamMember(
  request: any,
  teamId: string,
  memberUserId: string
): Promise<NextResponse<APIResponse<{ success: boolean }>>> {
  try {
    const team = await supabase.getTeamById(teamId);
    if (!team) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'TEAM_NOT_FOUND',
          message: 'Team not found'
        }
      }, { status: 404 });
    }

    // Check permissions
    const isOwner = team.owner_id === request.user.id;
    const isSelf = memberUserId === request.user.id;

    if (!isOwner && !isSelf) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'INSUFFICIENT_PERMISSIONS',
          message: 'Only team owners can remove members, or you can remove yourself'
        }
      }, { status: 403 });
    }

    // Cannot remove the owner
    if (memberUserId === team.owner_id) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'CANNOT_REMOVE_OWNER',
          message: 'Cannot remove the team owner'
        }
      }, { status: 400 });
    }

    // Remove member
    await supabase.query(`
      DELETE FROM team_members
      WHERE team_id = $1 AND user_id = $2
    `, [teamId, memberUserId]);

    // Regenerate team constellation
    await regenerateTeamConstellation(teamId);

    return NextResponse.json({
      success: true,
      data: { success: true }
    });

  } catch (error) {
    console.error('Remove team member error:', error);
    return NextResponse.json({
      success: false,
      error: {
        code: 'REMOVE_MEMBER_FAILED',
        message: 'Failed to remove team member'
      }
    }, { status: 500 });
  }
}

// Generate team constellation analysis
export async function generateTeamConstellation(
  request: any,
  teamId: string
): Promise<NextResponse<APIResponse<any>>> {
  try {
    const team = await supabase.getTeamById(teamId);
    if (!team) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'TEAM_NOT_FOUND',
          message: 'Team not found'
        }
      }, { status: 404 });
    }

    // Check if user is a member
    const isMember = team.team_members?.some(member => member.user_id === request.user.id);
    if (!isMember) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'ACCESS_DENIED',
          message: 'You must be a team member to generate constellation analysis'
        }
      }, { status: 403 });
    }

    // Check if user has advanced features
    if (!request.subscription?.usage_limits?.advanced_features) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'PREMIUM_FEATURE_REQUIRED',
          message: 'Team constellation analysis requires a Pro subscription or higher'
        }
      }, { status: 403 });
    }

    // Get all member usernames
    const memberUsernames = team.team_members
      ?.filter(member => member.users?.github_username)
      ?.map(member => member.users!.github_username) || [];

    if (memberUsernames.length < 2) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'INSUFFICIENT_MEMBERS',
          message: 'At least 2 team members with GitHub usernames are required for constellation analysis'
        }
      }, { status: 400 });
    }

    // Analyze team constellation
    const constellation = await githubService.analyzeTeamConstellation(memberUsernames);

    // Update team with constellation data
    await supabase.query(`
      UPDATE teams
      SET constellation_map = $1, updated_at = NOW()
      WHERE id = $2
    `, [constellation, teamId]);

    // Track usage
    await supabase.trackUsage({
      user_id: request.user.id,
      event_type: 'team_analysis',
      resource_id: teamId,
      metadata: { member_count: memberUsernames.length }
    });

    return NextResponse.json({
      success: true,
      data: constellation
    });

  } catch (error) {
    console.error('Generate team constellation error:', error);
    return NextResponse.json({
      success: false,
      error: {
        code: 'CONSTELLATION_GENERATION_FAILED',
        message: 'Failed to generate team constellation analysis'
      }
    }, { status: 500 });
  }
}

// Helper functions
async function regenerateTeamConstellation(teamId: string): Promise<void> {
  try {
    const team = await supabase.getTeamById(teamId);
    if (!team) return;

    const memberUsernames = team.team_members
      ?.filter(member => member.users?.github_username)
      ?.map(member => member.users!.github_username) || [];

    if (memberUsernames.length >= 2) {
      const constellation = await githubService.analyzeTeamConstellation(memberUsernames);
      await supabase.query(`
        UPDATE teams
        SET constellation_map = $1, updated_at = NOW()
        WHERE id = $2
      `, [constellation, teamId]);
    }
  } catch (error) {
    console.error('Error regenerating team constellation:', error);
  }
}

// Export handlers for use in Next.js API routes
export const teamHandlers = {
  POST,
  GET,
  getTeamById,
  updateTeam,
  addTeamMembers,
  removeTeamMember,
  generateTeamConstellation
};