# Palo Alto Device Server
[![smithery badge](https://smithery.ai/badge/@DynamicEndpoints/paloalto-device-server)](https://smithery.ai/server/@DynamicEndpoints/paloalto-device-server)


A Model Context Protocol (MCP) server for managing Palo Alto firewalls through their REST API. This server provides tools for system information retrieval, firewall upgrades, content updates, and certificate management.

## Features

- Get system information from Palo Alto firewalls
- Upgrade firewall PAN-OS versions
- Manage HA firewall upgrades through Panorama
- Automatically check and install content updates
- Certificate management
- Run operational mode commands

## Prerequisites

- Node.js
- TypeScript
- Palo Alto firewall with REST API access
- API key for authentication

## Installation

### Installing via Smithery

To install Palo Alto Device Server for Claude Desktop automatically via [Smithery](https://smithery.ai/server/@DynamicEndpoints/paloalto-device-server):

```bash
npx -y @smithery/cli install @DynamicEndpoints/paloalto-device-server --client claude
```

### Manual Installation
```bash
npm install
```

## Configuration

The server requires the following environment variables:

- `PANOS_API_KEY`: Your Palo Alto firewall API key (required)
- `PANOS_API_BASE_URL`: Base URL for the Palo Alto REST API (defaults to 'https://firewall.example.com/restapi/v11.0')

## Building

```bash
npm run build
```

## Running

```bash
npm start
```

## Available Tools

1. `get_system_info`: Retrieve system information from the firewall
2. `upgrade_firewall`: Upgrade the firewall to the latest PAN-OS version
3. `upgrade_ha_firewalls_from_panorama`: Upgrade PAN-OS on multiple HA firewalls through Panorama
4. `check_install_content_updates`: Check for and install content updates
5. `manage_certificates`: Manage firewall certificates
6. `run_operational_mode_command`: Execute operational mode commands

## Development

This project uses TypeScript and the Model Context Protocol SDK. The main server implementation is in `src/index.ts`.

## License

[Add your license information here]
