# GitHub Network Visualizer

A React application that visualizes the follower and following relationships between GitHub users as an interactive network graph.

![CleanShot 2025-03-04 at 09 44 51@2x](https://github.com/user-attachments/assets/066796ea-3d6a-4919-aaac-5f9b08688629)


## Features

- Input multiple GitHub usernames to analyze
- Visualize connections between users in an interactive network graph
- Distinguish between follower, following, and mutual relationships
- View user profile information on hover
- Zoom and pan functionality for exploring large networks
- Responsive design for different screen sizes

## Technologies Used

- React
- TypeScript
- D3.js for network visualization
- Octokit for GitHub API integration
- TailwindCSS for styling
- React Hook Form with Zod for form validation
- Sonner for toast notifications

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/github-network-visualizer.git
cd github-network-visualizer
```

2. Install dependencies
```bash
npm install
# or
yarn install
```

3. Start the development server
```bash
npm run dev
# or
yarn dev
```

4. Open your browser and navigate to `http://localhost:5173`

## Usage

1. Enter one or more GitHub usernames in the form
2. Click "Generate Network Graph" to visualize the network
3. Interact with the graph:
   - Hover over nodes to see user information
   - Click on nodes to open the user's GitHub profile
   - Drag nodes to rearrange the network
   - Scroll to zoom in/out
   - Drag the background to pan

## GitHub API Rate Limits

This application uses the GitHub API, which has rate limits:
- For unauthenticated requests: 60 requests per hour
- For authenticated requests: 5,000 requests per hour

The current implementation uses unauthenticated requests. For higher rate limits, you would need to implement GitHub authentication.

## Future Enhancements

- Add GitHub authentication for higher API rate limits
- Implement more network analysis metrics
- Add filters to show specific types of relationships
- Support for organizations and repositories
- Export network data as JSON or CSV

## License

MIT
