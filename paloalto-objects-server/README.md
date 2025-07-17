# Palo Alto Objects Management MCP Server

A Model Context Protocol (MCP) server that provides tools for managing objects in a Palo Alto Networks firewall, including address objects, service objects, application objects, and their respective groups.

## Features

- Get, create, update, and delete various Palo Alto firewall objects:
  - Address Objects and Groups
  - Service Objects and Groups
  - Application Objects and Groups
  - Application Filters

## Prerequisites

- Node.js
- Access to a Palo Alto Networks firewall
- API key for the Palo Alto firewall

## Installation

1. Clone this repository
2. Install dependencies:
```bash
npm install
```

## Configuration

The server requires the following environment variables:

- `PANOS_API_KEY`: Your Palo Alto Networks API key (required)
- `PANOS_API_BASE_URL`: Base URL of your Palo Alto firewall's API (defaults to 'https://firewall.example.com/restapi/v11.0')

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

- `get_address_objects`: Retrieve all address objects
- `get_address_groups`: Retrieve all address groups
- `get_service_objects`: Retrieve all service objects
- `get_service_groups`: Retrieve all service groups
- `get_application_objects`: Retrieve all application objects
- `get_application_groups`: Retrieve all application groups
- `get_application_filters`: Retrieve all application filters
- `create_object`: Create a new object
- `update_object`: Update an existing object
- `delete_object`: Delete an existing object

## Error Handling

The server provides proper error handling for API requests and returns appropriate MCP error codes when issues occur.

## License

This project is built using the Model Context Protocol SDK (@modelcontextprotocol/sdk).