import { Octokit } from 'octokit';

// Initialize Octokit without authentication for public data
// For higher rate limits, you can use a personal access token
const octokit = new Octokit();

export interface GitHubUser {
  login: string;
  id: number;
  avatar_url: string;
  html_url: string;
}

export interface NetworkNode {
  id: string;
  avatar: string;
  url: string;
}

export interface NetworkLink {
  source: string;
  target: string;
  type: 'follower' | 'following' | 'both';
}

export interface NetworkData {
  nodes: NetworkNode[];
  links: NetworkLink[];
}

export async function fetchUser(username: string): Promise<GitHubUser | null> {
  try {
    const response = await octokit.request('GET /users/{username}', {
      username,
    });
    return response.data;
  } catch (error) {
    console.error(`Error fetching user ${username}:`, error);
    return null;
  }
}

export async function fetchFollowers(username: string): Promise<GitHubUser[]> {
  try {
    const response = await octokit.request('GET /users/{username}/followers', {
      username,
      per_page: 100,
    });
    return response.data;
  } catch (error) {
    console.error(`Error fetching followers for ${username}:`, error);
    return [];
  }
}

export async function fetchFollowing(username: string): Promise<GitHubUser[]> {
  try {
    const response = await octokit.request('GET /users/{username}/following', {
      username,
      per_page: 100,
    });
    return response.data;
  } catch (error) {
    console.error(`Error fetching following for ${username}:`, error);
    return [];
  }
}

export async function buildNetworkData(usernames: string[]): Promise<NetworkData> {
  const nodes: NetworkNode[] = [];
  const links: NetworkLink[] = [];
  const nodeMap = new Map<string, boolean>();
  
  // Process each username
  for (const username of usernames) {
    const user = await fetchUser(username);
    if (!user) continue;
    
    // Add the user to nodes if not already present
    if (!nodeMap.has(user.login)) {
      nodes.push({
        id: user.login,
        avatar: user.avatar_url,
        url: user.html_url,
      });
      nodeMap.set(user.login, true);
    }
    
    // Fetch followers and following
    const followers = await fetchFollowers(username);
    const following = await fetchFollowing(username);
    
    // Create sets for faster lookups
    const followerSet = new Set(followers.map(f => f.login));
    const followingSet = new Set(following.map(f => f.login));
    
    // Process followers
    for (const follower of followers) {
      // Add follower to nodes if not already present
      if (!nodeMap.has(follower.login)) {
        nodes.push({
          id: follower.login,
          avatar: follower.avatar_url,
          url: follower.html_url,
        });
        nodeMap.set(follower.login, true);
      }
      
      // Determine relationship type
      const linkType = followingSet.has(follower.login) ? 'both' : 'follower';
      
      // Add link
      links.push({
        source: follower.login,
        target: username,
        type: linkType,
      });
    }
    
    // Process following (only those not already processed as followers)
    for (const followed of following) {
      // Add followed user to nodes if not already present
      if (!nodeMap.has(followed.login)) {
        nodes.push({
          id: followed.login,
          avatar: followed.avatar_url,
          url: followed.html_url,
        });
        nodeMap.set(followed.login, true);
      }
      
      // Add link if not already added (as 'both' type)
      if (!followerSet.has(followed.login)) {
        links.push({
          source: username,
          target: followed.login,
          type: 'following',
        });
      }
    }
  }
  
  return { nodes, links };
} 