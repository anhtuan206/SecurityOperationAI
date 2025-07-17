# Palo Alto Policy Management MCP Server

[![smithery badge](https://smithery.ai/badge/@DynamicEndpoints/palo-alto-policy-management-mcp-server)](https://smithery.ai/server/@DynamicEndpoints/palo-alto-policy-management-mcp-server)

A Model Context Protocol (MCP) server for managing Palo Alto Networks firewall policies. This server provides a standardized interface for interacting with Palo Alto Networks firewall configurations using the Model Context Protocol.

## Features

- Integration with Palo Alto Networks API via MCP
- Policy management capabilities
- Built with TypeScript for type safety and better developer experience

## Available Tools

### Query Tools
- `get_security_rules` - Get security policy rules
- `get_nat_rules` - Get NAT policy rules
- `get_qos_rules` - Get QoS policy rules
- `get_policy_based_forwarding_rules` - Get policy-based forwarding rules
- `get_decryption_rules` - Get decryption policy rules
- `get_tunnel_inspection_rules` - Get tunnel inspection rules
- `get_application_override_rules` - Get application override rules
- `get_authentication_rules` - Get authentication policy rules
- `get_dos_rules` - Get DoS protection rules
- `get_sdwan_rules` - Get SD-WAN policy rules

### Management Tools
- `create_rule` - Create a new policy rule
- `update_rule` - Update an existing policy rule
- `delete_rule` - Delete a policy rule

## Prerequisites

- Node.js (v16 or higher recommended)
- npm or yarn package manager
- Access to a Palo Alto Networks firewall

## Installation

### Installing via Smithery

To install Palo Alto Policy Management Server for Claude Desktop automatically via [Smithery](https://smithery.ai/server/@DynamicEndpoints/palo-alto-policy-management-mcp-server):

```bash
npx -y @smithery/cli install @DynamicEndpoints/palo-alto-policy-management-mcp-server --client claude
```

1. Clone the repository:
```bash
git clone <repository-url>
cd paloalto-policy-server
```

2. Install dependencies:
```bash
npm install
```

## Usage

### Building the Project

To compile the TypeScript code:

```bash
npm run build
```

### Running the Server

To start the MCP server:

```bash
npm start
```

The server will start and listen for MCP protocol commands.

## Development

The project uses TypeScript and is structured as follows:

- `src/` - Source code directory
- `build/` - Compiled JavaScript output
- `package.json` - Project configuration and dependencies
- `tsconfig.json` - TypeScript configuration

### Dependencies

Main dependencies include:
- `@modelcontextprotocol/sdk` - For MCP protocol implementation
- `axios` - For making HTTP requests to the Palo Alto API

## License

Please add appropriate license information.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
