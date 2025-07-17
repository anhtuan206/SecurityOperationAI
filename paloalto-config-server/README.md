# Palo Alto Config Server

A Model Context Protocol (MCP) server for managing Palo Alto firewall configurations. This server provides a standardized interface for reading and manipulating PAN-OS configurations through the REST API.

## Features

- Get configuration from specific XPath locations
- Set configuration values
- Delete configuration nodes
- Move configuration elements
- Rename configuration nodes
- Clone configuration elements
- Full integration with Model Context Protocol

## Prerequisites

- Node.js (v16 or higher recommended)
- Access to a Palo Alto Networks firewall with REST API enabled
- API key for authentication

## Installation

```bash
npm install
```

## Configuration

The server requires the following environment variables:

- `PANOS_API_KEY`: Your Palo Alto Networks API key (required)
- `PANOS_API_BASE_URL`: Base URL for your firewall's REST API (defaults to 'https://firewall.example.com/restapi/v11.0')

## Building

To build the project:

```bash
npm run build
```

## Running

To start the server:

```bash
npm start
```

## Available Tools

The server provides the following MCP tools:

### get_configuration
Gets configuration from a specific XPath in PAN-OS.
- Input: `xpath` (string) - XPath to the configuration node

### set_configuration
Sets configuration at a specific XPath in PAN-OS.
- Input: 
  - `xpath` (string) - XPath to the configuration node
  - `element` (string) - XML configuration element to set

### delete_configuration
Deletes configuration at a specific XPath in PAN-OS.
- Input: `xpath` (string) - XPath to the configuration node to delete

### move_configuration
Moves configuration from one location to another in PAN-OS.
- Input:
  - `xpath` (string) - XPath to the configuration node to move
  - `where` (string) - Where to move the node ('before', 'after', 'top', 'bottom')
  - `dst` (string) - Destination XPath (not required for top/bottom)

### rename_configuration
Renames a configuration node in PAN-OS.
- Input:
  - `xpath` (string) - XPath to the configuration node to rename
  - `newname` (string) - New name for the node

### clone_configuration
Clones a configuration node in PAN-OS.
- Input:
  - `xpath` (string) - XPath to the configuration node to clone
  - `newname` (string) - Name for the cloned node

## Error Handling

The server includes comprehensive error handling for API requests and returns appropriate MCP error codes when issues occur.

## Contributing

Please ensure any pull requests or contributions adhere to the existing code style and include appropriate tests.

## License

This project is proprietary software. All rights reserved.