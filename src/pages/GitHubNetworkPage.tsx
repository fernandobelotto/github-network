import { useState } from "react";
import { toast } from "sonner";

import { GitHubUsersForm } from "@/components/GitHubUsersForm";
import { NetworkGraph } from "@/components/NetworkGraph";
import { NetworkData, buildNetworkData } from "@/services/github-api";

export function GitHubNetworkPage() {
  const [loading, setLoading] = useState(false);
  const [networkData, setNetworkData] = useState<NetworkData>({ nodes: [], links: [] });
  const [usernames, setUsernames] = useState<string[]>([]);

  const handleFormSubmit = async (usernames: string[]) => {
    setLoading(true);
    setUsernames(usernames);
    
    try {
      const data = await buildNetworkData(usernames);
      setNetworkData(data);
      
      if (data.nodes.length === 0) {
        toast.error("No data found for the provided usernames");
      } else {
        toast.success(`Network graph generated with ${data.nodes.length} users and ${data.links.length} connections`);
      }
    } catch (error) {
      console.error("Error building network data:", error);
      toast.error("Failed to generate network graph");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">GitHub Network Visualizer</h1>
        <p className="text-gray-600">
          Visualize the follower and following relationships between GitHub users
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Enter GitHub Usernames</h2>
          <GitHubUsersForm onSubmit={handleFormSubmit} isLoading={loading} />
          
          {networkData.nodes.length > 0 && (
            <div className="mt-6">
              <h3 className="text-lg font-medium mb-2">Network Statistics</h3>
              <ul className="space-y-1 text-sm">
                <li>Users: {networkData.nodes.length}</li>
                <li>Connections: {networkData.links.length}</li>
                <li>Seed Users: {usernames.length}</li>
              </ul>
            </div>
          )}
        </div>

        <div className="lg:col-span-2">
          {networkData.nodes.length > 0 ? (
            <div className="bg-white p-4 rounded-lg shadow-md">
              <NetworkGraph 
                data={networkData} 
                loading={loading} 
                width={800} 
                height={600} 
              />
            </div>
          ) : (
            <div className="bg-white p-8 rounded-lg shadow-md flex flex-col items-center justify-center h-full">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="64"
                height="64"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-gray-300 mb-4"
              >
                <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z" />
                <path d="M17 14h.01" />
                <path d="M13 14h.01" />
                <path d="M9 14h.01" />
              </svg>
              <h3 className="text-xl font-semibold mb-2">No Network Data</h3>
              <p className="text-gray-500 text-center">
                Enter GitHub usernames and click "Generate Network Graph" to visualize the network
              </p>
            </div>
          )}
        </div>
      </div>
      
      <div className="mt-8 text-center text-sm text-gray-500">
        <p>
          Note: GitHub API has rate limits. For unauthenticated requests, the rate limit is 60 requests per hour.
        </p>
      </div>
    </div>
  );
} 