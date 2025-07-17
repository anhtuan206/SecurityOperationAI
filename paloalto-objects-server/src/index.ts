#!/usr/bin/env node
import dotenv from 'dotenv';
dotenv.config();
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
    CallToolRequestSchema,
    ListToolsRequestSchema,
    McpError,
    ErrorCode
} from '@modelcontextprotocol/sdk/types.js';
import axios, { AxiosError } from 'axios';
import https from 'https';

const API_KEY = process.env.PANOS_API_KEY;
const API_BASE_URL = process.env.PANOS_API_BASE_URL || 'https://firewall.example.com/restapi/v11.0';

if (!API_KEY) {
    throw new Error('PANOS_API_KEY environment variable is required');
}

const server = new Server(
    {
        name: 'paloalto-objects-server',
        version: '0.1.0',
    },
    {
        capabilities: {
            resources: {},
            tools: {},
        },
    }
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: [
        {
            name: 'get_address_objects',
            description: 'Get address objects from the Palo Alto firewall',
            inputSchema: {
                type: 'object',
                properties: {},
            },
        },
        {
            name: 'get_address_groups',
            description: 'Get address groups from the Palo Alto firewall',
            inputSchema: {
                type: 'object',
                properties: {},
            },
        },
        {
            name: 'get_service_objects',
            description: 'Get service objects from the Palo Alto firewall',
            inputSchema: {
                type: 'object',
                properties: {},
            },
        },
        {
            name: 'get_service_groups',
            description: 'Get service groups from the Palo Alto firewall',
            inputSchema: {
                type: 'object',
                properties: {},
            },
        },
        {
            name: 'get_application_objects',
            description: 'Get application objects from the Palo Alto firewall',
            inputSchema: {
                type: 'object',
                properties: {},
            },
        },
        {
            name: 'get_application_groups',
            description: 'Get application groups from the Palo Alto firewall',
            inputSchema: {
                type: 'object',
                properties: {},
            },
        },
        {
            name: 'get_application_filters',
            description: 'Get application filters from the Palo Alto firewall',
            inputSchema: {
                type: 'object',
                properties: {},
            },
        },
        {
            name: 'create_object',
            description: 'Create a new object on the Palo Alto firewall',
            inputSchema: {
                type: 'object',
                properties: {
                    object_type: {
                        type: 'string',
                        enum: ['address', 'address-group', 'service', 'service-group', 'application', 'application-group', 'application-filter'],
                        description: 'Type of object to create'
                    },
                    object_data: {
                        type: 'object',
                        description: 'Object configuration data'
                    }
                },
                required: ['object_type', 'object_data']
            },
        },
        {
            name: 'update_object',
            description: 'Update an existing object on the Palo Alto firewall',
            inputSchema: {
                type: 'object',
                properties: {
                    object_type: {
                        type: 'string',
                        enum: ['address', 'address-group', 'service', 'service-group', 'application', 'application-group', 'application-filter'],
                        description: 'Type of object to update'
                    },
                    object_name: {
                        type: 'string',
                        description: 'Name of the object to update'
                    },
                    object_data: {
                        type: 'object',
                        description: 'Updated object configuration data'
                    }
                },
                required: ['object_type', 'object_name', 'object_data']
            },
        },
        {
            name: 'delete_object',
            description: 'Delete an object from the Palo Alto firewall',
            inputSchema: {
                type: 'object',
                properties: {
                    object_type: {
                        type: 'string',
                        enum: ['address', 'address-group', 'service', 'service-group', 'application', 'application-group', 'application-filter'],
                        description: 'Type of object to delete'
                    },
                    object_name: {
                        type: 'string',
                        description: 'Name of the object to delete'
                    }
                },
                required: ['object_type', 'object_name']
            },
        }
    ],
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const getObjects = async (objectType: string) => {
        try {
            const response = await axios.get(
                `${API_BASE_URL}/Objects/${objectType}`,
                {
                    headers: {
                        'X-PAN-KEY': API_KEY,
                        'Accept': 'application/json'
                    },
                    httpsAgent: new https.Agent({
                        rejectUnauthorized: false
                    })
                }
            );

            return {
                content: [
                    {
                        type: 'text',
                        text: JSON.stringify(response.data, null, 2),
                    },
                ],
            };
        } catch (error) {
            const axiosError = error as AxiosError;
            throw new McpError(
                ErrorCode.InternalError,
                `Palo Alto API error: ${axiosError.message}`
            );
        }
    };

    switch (request.params.name) {
        case 'get_address_objects':
            return getObjects('Addresses');
        case 'get_address_groups':
            return getObjects('AddressGroups');
        case 'get_service_objects':
            return getObjects('Services');
        case 'get_service_groups':
            return getObjects('ServiceGroups');
        case 'get_application_objects':
            return getObjects('Applications');
        case 'get_application_groups':
            return getObjects('ApplicationGroups');
        case 'get_application_filters':
            return getObjects('ApplicationFilters');
        case 'create_object': {
            const { object_type, object_data } = request.params.arguments as { object_type: string, object_data: object };
            try {
                const objectTypeMap: { [key: string]: string } = {
                    'address': 'Addresses',
                    'address-group': 'AddressGroups',
                    'service': 'Services',
                    'service-group': 'ServiceGroups',
                    'application': 'Applications',
                    'application-group': 'ApplicationGroups',
                    'application-filter': 'ApplicationFilters'
                };

                const response = await axios.post(
                    `${API_BASE_URL}/Objects/${objectTypeMap[object_type]}`,
                    object_data,
                    {
                        headers: {
                            'X-PAN-KEY': API_KEY,
                            'Accept': 'application/json'
                        },
                        httpsAgent: new https.Agent({
                            rejectUnauthorized: false
                        })
                    }
                );

                return {
                    content: [
                        {
                            type: 'text',
                            text: JSON.stringify(response.data, null, 2),
                        },
                    ],
                };
            } catch (error) {
                const axiosError = error as AxiosError;
                throw new McpError(
                    ErrorCode.InternalError,
                    `Palo Alto API error: ${axiosError.message}`
                );
            }
        }
        case 'update_object': {
            const { object_type, object_name, object_data } = request.params.arguments as { object_type: string, object_name: string, object_data: object };
            try {
                const objectTypeMap: { [key: string]: string } = {
                    'address': 'Addresses',
                    'address-group': 'AddressGroups',
                    'service': 'Services',
                    'service-group': 'ServiceGroups',
                    'application': 'Applications',
                    'application-group': 'ApplicationGroups',
                    'application-filter': 'ApplicationFilters'
                };

                const response = await axios.put(
                    `${API_BASE_URL}/Objects/${objectTypeMap[object_type]}/${object_name}`,
                    object_data,
                    {
                        headers: {
                            'X-PAN-KEY': API_KEY,
                            'Accept': 'application/json'
                        },
                        httpsAgent: new https.Agent({
                            rejectUnauthorized: false
                        })
                    }
                );

                return {
                    content: [
                        {
                            type: 'text',
                            text: JSON.stringify(response.data, null, 2),
                        },
                    ],
                };
            } catch (error) {
                const axiosError = error as AxiosError;
                throw new McpError(
                    ErrorCode.InternalError,
                    `Palo Alto API error: ${axiosError.message}`
                );
            }
        }
        case 'delete_object': {
            const { object_type, object_name } = request.params.arguments as { object_type: string, object_name: string };
            try {
                const objectTypeMap: { [key: string]: string } = {
                    'address': 'Addresses',
                    'address-group': 'AddressGroups',
                    'service': 'Services',
                    'service-group': 'ServiceGroups',
                    'application': 'Applications',
                    'application-group': 'ApplicationGroups',
                    'application-filter': 'ApplicationFilters'
                };

                const response = await axios.delete(
                    `${API_BASE_URL}/Objects/${objectTypeMap[object_type]}/${object_name}`,
                    {
                        headers: {
                            'X-PAN-KEY': API_KEY,
                            'Accept': 'application/json'
                        },
                        httpsAgent: new https.Agent({
                            rejectUnauthorized: false
                        })
                    }
                );

                return {
                    content: [
                        {
                            type: 'text',
                            text: JSON.stringify(response.data, null, 2),
                        },
                    ],
                };
            } catch (error) {
                const axiosError = error as AxiosError;
                throw new McpError(
                    ErrorCode.InternalError,
                    `Palo Alto API error: ${axiosError.message}`
                );
            }
        }
        default:
            throw new McpError(
                ErrorCode.MethodNotFound,
                `Unknown tool: ${request.params.name}`
            );
    }
});

async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error('Palo Alto Objects Management MCP server running on stdio');
}

main().catch(console.error);
