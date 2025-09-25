# MCP (Model Context Protocol) Setup Guide

## What is MCP?
Model Context Protocol (MCP) is a standard for connecting AI assistants to data sources and tools. It allows AI models to interact with your application's data and functionality in a structured way.

## Setup Instructions

### 1. Install MCP Dependencies
```bash
npm install @modelcontextprotocol/sdk
```

### 2. Create MCP Server
Create a new file `src/mcp/server.js`:

```javascript
import { Server } from '@modelcontextprotocol/sdk/server/index.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import { InventoryService } from '../services/inventoryService.js'

const server = new Server(
  {
    name: 'sparesmart-mcp',
    version: '1.0.0',
  },
  {
    capabilities: {
      resources: {},
      tools: {},
    },
  }
)

// Add tools for inventory management
server.setRequestHandler('tools/list', async () => {
  return {
    tools: [
      {
        name: 'get_inventory_summary',
        description: 'Get a summary of all inventory items',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'search_parts',
        description: 'Search for parts by name, part number, or description',
        inputSchema: {
          type: 'object',
          properties: {
            query: {
              type: 'string',
              description: 'Search query',
            },
          },
          required: ['query'],
        },
      },
      {
        name: 'get_low_stock_items',
        description: 'Get items that are below minimum stock level',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
    ],
  }
})

// Handle tool calls
server.setRequestHandler('tools/call', async (request) => {
  const { name, arguments: args } = request.params

  try {
    switch (name) {
      case 'get_inventory_summary':
        const [parts, machines, lines, checkweighers] = await Promise.all([
          InventoryService.getParts(),
          InventoryService.getMachines(),
          InventoryService.getLines(),
          InventoryService.getCheckweighers(),
        ])
        
        return {
          content: [
            {
              type: 'text',
              text: `Inventory Summary:
- Parts: ${parts.length} items
- Machines: ${machines.length} items
- Lines: ${lines.length} items
- Checkweighers: ${checkweighers.length} items`,
            },
          ],
        }

      case 'search_parts':
        const searchResults = await InventoryService.globalSearch(args.query)
        return {
          content: [
            {
              type: 'text',
              text: `Search results for "${args.query}":
${JSON.stringify(searchResults, null, 2)}`,
            },
          ],
        }

      case 'get_low_stock_items':
        const allParts = await InventoryService.getParts()
        const lowStockItems = allParts.filter(part => 
          part.stock_quantity <= part.min_stock_level
        )
        
        return {
          content: [
            {
              type: 'text',
              text: `Low Stock Items:
${lowStockItems.map(item => 
  `- ${item.name} (${item.part_number}): ${item.stock_quantity}/${item.min_stock_level}`
).join('\n')}`,
            },
          ],
        }

      default:
        throw new Error(`Unknown tool: ${name}`)
    }
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: `Error: ${error.message}`,
        },
      ],
      isError: true,
    }
  }
})

// Start the server
async function main() {
  const transport = new StdioServerTransport()
  await server.connect(transport)
  console.error('MCP server running on stdio')
}

main().catch(console.error)
```

### 3. Update package.json
Add MCP scripts to your `package.json`:

```json
{
  "scripts": {
    "mcp:server": "node src/mcp/server.js",
    "mcp:dev": "nodemon src/mcp/server.js"
  }
}
```

### 4. Environment Configuration
Add MCP configuration to your environment:

```javascript
// src/config/mcp.js
export const MCP_CONFIG = {
  server: {
    name: 'sparesmart-mcp',
    version: '1.0.0',
    description: 'SpareSmart Inventory Management MCP Server'
  },
  capabilities: {
    resources: true,
    tools: true,
    prompts: false
  }
}
```

### 5. Integration with AI Assistants
To use this MCP server with AI assistants like Claude Desktop:

1. Add to your Claude Desktop configuration:
```json
{
  "mcpServers": {
    "sparesmart": {
      "command": "node",
      "args": ["path/to/your/project/src/mcp/server.js"],
      "cwd": "path/to/your/project"
    }
  }
}
```

### 6. Testing MCP Server
Test your MCP server:

```bash
# Start the server
npm run mcp:server

# In another terminal, test with MCP client
npx @modelcontextprotocol/inspector
```

## Benefits of MCP Integration

1. **AI-Powered Insights**: AI assistants can analyze your inventory data
2. **Natural Language Queries**: Ask questions about your inventory in plain English
3. **Automated Reporting**: Generate reports and summaries automatically
4. **Smart Recommendations**: Get AI suggestions for inventory optimization
5. **Integration**: Works with various AI tools and platforms

## Security Considerations

- Ensure proper authentication and authorization
- Validate all inputs from MCP clients
- Implement rate limiting for MCP endpoints
- Use environment variables for sensitive configuration
- Regularly update MCP dependencies

## Next Steps

1. Set up your Supabase project
2. Run the database schema
3. Configure your environment variables
4. Test the MCP server
5. Integrate with your preferred AI assistant
