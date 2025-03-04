import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { NetworkData, NetworkLink, NetworkNode } from '@/services/github-api';

interface NetworkGraphProps {
  data: NetworkData;
  width?: number;
  height?: number;
  loading?: boolean;
}

export function NetworkGraph({ data, width = 800, height = 600, loading = false }: NetworkGraphProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [hoveredNode, setHoveredNode] = useState<NetworkNode | null>(null);

  useEffect(() => {
    if (!svgRef.current || loading || !data.nodes.length) return;

    // Clear previous graph
    d3.select(svgRef.current).selectAll('*').remove();

    const svg = d3.select(svgRef.current);
    
    // Create a group for the graph
    const g = svg.append('g');
    
    // Add zoom functionality
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 4])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
      });
    
    svg.call(zoom);
    
    // Reset zoom to center the graph
    svg.call(zoom.transform, d3.zoomIdentity.translate(width / 2, height / 2).scale(0.8));

    // Create a force simulation
    const simulation = d3.forceSimulation<d3.SimulationNodeDatum & NetworkNode>(data.nodes as any)
      .force('link', d3.forceLink<d3.SimulationNodeDatum, d3.SimulationLinkDatum<d3.SimulationNodeDatum>>(data.links as any)
        .id((d: any) => d.id)
        .distance(100))
      .force('charge', d3.forceManyBody().strength(-300))
      .force('center', d3.forceCenter(0, 0))
      .force('collision', d3.forceCollide().radius(40));

    // Create links
    const link = g.append('g')
      .attr('class', 'links')
      .selectAll('line')
      .data(data.links)
      .enter()
      .append('line')
      .attr('stroke-width', 2)
      .attr('stroke', (d: NetworkLink) => {
        switch (d.type) {
          case 'follower': return '#ff9800';
          case 'following': return '#2196f3';
          case 'both': return '#4caf50';
          default: return '#999';
        }
      });

    // Create node groups
    const node = g.append('g')
      .attr('class', 'nodes')
      .selectAll('.node')
      .data(data.nodes)
      .enter()
      .append('g')
      .attr('class', 'node')
      .call(d3.drag<any, any>()
        .on('start', dragstarted)
        .on('drag', dragged)
        .on('end', dragended))
      .on('mouseover', (event, d: NetworkNode) => {
        setHoveredNode(d);
      })
      .on('mouseout', () => {
        setHoveredNode(null);
      })
      .on('click', (event, d: NetworkNode) => {
        window.open(d.url, '_blank');
      });

    // Add circles for nodes
    node.append('circle')
      .attr('r', 20)
      .attr('fill', 'white')
      .attr('stroke', '#333')
      .attr('stroke-width', 2);

    // Add avatar images
    node.append('clipPath')
      .attr('id', (d: NetworkNode) => `clip-${d.id}`)
      .append('circle')
      .attr('r', 18);

    node.append('image')
      .attr('xlink:href', (d: NetworkNode) => d.avatar)
      .attr('x', -18)
      .attr('y', -18)
      .attr('width', 36)
      .attr('height', 36)
      .attr('clip-path', (d: NetworkNode) => `url(#clip-${d.id})`);

    // Add labels
    node.append('text')
      .attr('dy', 30)
      .attr('text-anchor', 'middle')
      .text((d: NetworkNode) => d.id)
      .attr('font-size', '10px');

    // Update positions on simulation tick
    simulation.on('tick', () => {
      link
        .attr('x1', (d: any) => d.source.x)
        .attr('y1', (d: any) => d.source.y)
        .attr('x2', (d: any) => d.target.x)
        .attr('y2', (d: any) => d.target.y);

      node
        .attr('transform', (d: any) => `translate(${d.x},${d.y})`);
    });

    // Drag functions
    function dragstarted(event: any, d: any) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }

    function dragged(event: any, d: any) {
      d.fx = event.x;
      d.fy = event.y;
    }

    function dragended(event: any, d: any) {
      if (!event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    }

    // Cleanup
    return () => {
      simulation.stop();
    };
  }, [data, width, height, loading]);

  return (
    <div className="relative">
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-20 z-10">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      )}
      <svg ref={svgRef} width={width} height={height} className="border border-gray-200 rounded-lg">
        <defs>
          <marker
            id="arrowhead"
            viewBox="0 -5 10 10"
            refX={25}
            refY={0}
            orient="auto"
            markerWidth={6}
            markerHeight={6}
          >
            <path d="M0,-5L10,0L0,5" fill="#999" />
          </marker>
        </defs>
      </svg>
      {hoveredNode && (
        <div className="absolute top-2 left-2 bg-white p-2 rounded shadow-md">
          <p className="font-bold">{hoveredNode.id}</p>
          <p className="text-sm text-blue-500">
            <a href={hoveredNode.url} target="_blank" rel="noopener noreferrer">
              View Profile
            </a>
          </p>
        </div>
      )}
      <div className="mt-4 flex justify-center space-x-4">
        <div className="flex items-center">
          <div className="w-4 h-4 bg-orange-500 rounded-full mr-2"></div>
          <span className="text-sm">Follower</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 bg-blue-500 rounded-full mr-2"></div>
          <span className="text-sm">Following</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 bg-green-500 rounded-full mr-2"></div>
          <span className="text-sm">Both</span>
        </div>
      </div>
    </div>
  );
} 