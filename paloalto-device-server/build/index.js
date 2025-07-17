#!/usr/bin/env node
import dotenv from 'dotenv';
dotenv.config();
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema, McpError, ErrorCode } from '@modelcontextprotocol/sdk/types.js';
import axios from 'axios';
import https from 'https';
const API_KEY = process.env.PANOS_API_KEY;
const API_BASE_URL = process.env.PANOS_API_BASE_URL || 'https://firewall.example.com/restapi/v11.0';
if (!API_KEY) {
    throw new Error('PANOS_API_KEY environment variable is required');
}
const httpsAgent = new https.Agent({
    rejectUnauthorized: false,
});
const server = new Server({
    name: 'paloalto-device-server',
    version: '0.1.0',
}, {
    capabilities: {
        resources: {},
        tools: {},
    },
});
server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: [
        {
            name: 'get_system_info',
            description: 'Get system information from the Palo Alto firewall',
            inputSchema: {
                type: 'object',
                properties: {},
            },
        },
        {
            name: 'upgrade_firewall',
            description: 'Upgrade the Palo Alto firewall to the latest PAN-OS version',
            inputSchema: {
                type: 'object',
                properties: {},
            },
        },
        {
            name: 'upgrade_ha_firewalls_from_panorama',
            description: 'Upgrade PAN-OS on Multiple HA Firewalls through Panorama',
            inputSchema: {
                type: 'object',
                properties: {},
            },
        },
        {
            name: 'check_install_content_updates',
            description: 'Automatically Check for and Install Content Updates',
            inputSchema: {
                type: 'object',
                properties: {},
            },
        },
        {
            name: 'manage_certificates',
            description: 'Manage certificates on the Palo Alto firewall',
            inputSchema: {
                type: 'object',
                properties: {},
            },
        },
        {
            name: 'run_operational_mode_command',
            description: 'Run an operational mode command on the Palo Alto firewall',
            inputSchema: {
                type: 'object',
                properties: {
                    command: {
                        type: 'string',
                        description: 'Command to run'
                    }
                },
                required: ['command']
            },
        }
    ],
}));
server.setRequestHandler(CallToolRequestSchema, async (request) => {
    switch (request.params.name) {
        case 'get_system_info': {
            try {
                const response = await axios.get(`${API_BASE_URL}/Device/VirtualSystems`, {
                    headers: {
                        'X-PAN-KEY': API_KEY,
                        'Accept': 'application/json'
                    },
                    httpsAgent: new https.Agent({
                        rejectUnauthorized: false
                    })
                });
                return {
                    content: [
                        {
                            type: 'text',
                            text: JSON.stringify(response.data, null, 2),
                        },
                    ],
                };
            }
            catch (error) {
                const axiosError = error;
                throw new McpError(ErrorCode.InternalError, `Palo Alto API error: ${axiosError.message}`);
            }
        }
        case 'upgrade_firewall': {
            try {
                const response = await axios.post(`${API_BASE_URL}/Device/Upgrade`, {}, {
                    headers: {
                        'X-PAN-KEY': API_KEY,
                        'Accept': 'application/json'
                    },
                    httpsAgent: new https.Agent({
                        rejectUnauthorized: false
                    })
                });
                return {
                    content: [
                        {
                            type: 'text',
                            text: JSON.stringify(response.data, null, 2),
                        },
                    ],
                };
            }
            catch (error) {
                const axiosError = error;
                throw new McpError(ErrorCode.InternalError, `Palo Alto API error: ${axiosError.message}`);
            }
        }
        case 'upgrade_ha_firewalls_from_panorama': {
            try {
                const response = await axios.post(`${API_BASE_URL}/Panorama/UpgradeHA`, {}, {
                    headers: {
                        'X-PAN-KEY': API_KEY,
                        'Accept': 'application/json'
                    },
                    httpsAgent: new https.Agent({
                        rejectUnauthorized: false
                    })
                });
                return {
                    content: [
                        {
                            type: 'text',
                            text: JSON.stringify(response.data, null, 2),
                        },
                    ],
                };
            }
            catch (error) {
                const axiosError = error;
                throw new McpError(ErrorCode.InternalError, `Palo Alto API error: ${axiosError.message}`);
            }
        }
        case 'check_install_content_updates': {
            try {
                const response = await axios.post(`${API_BASE_URL}/Device/ContentUpdates`, {}, {
                    headers: {
                        'X-PAN-KEY': API_KEY,
                        'Accept': 'application/json'
                    },
                    httpsAgent: new https.Agent({
                        rejectUnauthorized: false
                    })
                });
                return {
                    content: [
                        {
                            type: 'text',
                            text: JSON.stringify(response.data, null, 2),
                        },
                    ],
                };
            }
            catch (error) {
                const axiosError = error;
                throw new McpError(ErrorCode.InternalError, `Palo Alto API error: ${axiosError.message}`);
            }
        }
        case 'manage_certificates': {
            try {
                const response = await axios.get(`${API_BASE_URL}/Device/Certificates`, {
                    headers: {
                        'X-PAN-KEY': API_KEY,
                        'Accept': 'application/json'
                    },
                    httpsAgent: new https.Agent({
                        rejectUnauthorized: false
                    })
                });
                return {
                    content: [
                        {
                            type: 'text',
                            text: JSON.stringify(response.data, null, 2),
                        },
                    ],
                };
            }
            catch (error) {
                const axiosError = error;
                throw new McpError(ErrorCode.InternalError, `Palo Alto API error: ${axiosError.message}`);
            }
        }
        case 'run_operational_mode_command': {
            const { command } = request.params.arguments;
            try {
                const response = await axios.post(`${API_BASE_URL}/Device/Op`, { command }, {
                    headers: {
                        'X-PAN-KEY': API_KEY,
                        'Accept': 'application/json'
                    },
                    httpsAgent: new https.Agent({
                        rejectUnauthorized: false
                    })
                });
                return {
                    content: [
                        {
                            type: 'text',
                            text: JSON.stringify(response.data, null, 2),
                        },
                    ],
                };
            }
            catch (error) {
                const axiosError = error;
                throw new McpError(ErrorCode.InternalError, `Palo Alto API error: ${axiosError.message}`);
            }
        }
        default:
            throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${request.params.name}`);
    }
});
async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error('Palo Alto Device Management MCP server running on stdio');
}
main().catch(console.error);
