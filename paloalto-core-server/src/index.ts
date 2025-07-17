#!/usr/bin/env node
import dotenv from 'dotenv';
dotenv.config();
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from '@modelcontextprotocol/sdk/types.js';
import axios, { AxiosError } from 'axios';
import https from 'https';

const API_KEY = process.env.PANOS_API_KEY;
const API_BASE_URL = process.env.PANOS_API_BASE_URL || 'https://firewall.example.com/restapi/v11.0';

if (!API_KEY) {
    throw new Error('PANOS_API_KEY environment variable is required');
}

type ResourceCategories = {
    OBJECTS: string[];
    POLICIES: string[];
    NETWORK: string[];
    DEVICES: string[];
}

const RESOURCE_CATEGORIES: ResourceCategories = {
    OBJECTS: [
        'Addresses', 'AddressGroups', 'Regions', 'DynamicUserGroups', 
        'Applications', 'ApplicationGroups', 'ApplicationFilters', 
        'Services', 'ServiceGroups', 'Tags', 'GlobalProtectHIPObjects',
        'GlobalProtectHIPProfiles', 'ExternalDynamicLists', 
        'CustomDataPatterns', 'CustomSpywareSignatures', 
        'CustomVulnerabilitySignatures', 'CustomURLCategories',
        'AntivirusSecurityProfiles', 'AntiSpywareSecurityProfiles',
        'VulnerabilityProtectionSecurityProfiles', 
        'URLFilteringSecurityProfiles', 'FileBlockingSecurityProfiles',
        'WildFireAnalysisSecurityProfiles', 'DataFilteringSecurityProfiles',
        'DoSProtectionSecurityProfiles', 'SecurityProfileGroups',
        'LogForwardingProfiles', 'AuthenticationEnforcements', 
        'DecryptionProfiles', 'PacketBrokerProfiles', 
        'SDWANPathQualityProfiles', 'SDWANTrafficDistributionProfiles',
        'SDWANSaasQualityProfiles', 'SDWANErrorCorrection', 'Schedules'
    ],
    POLICIES: [
        'SecurityRules', 'NATRules', 'QoSRules', 
        'PolicyBasedForwardingRules', 'DecryptionRules', 
        'NetworkPacketBrokerRules', 'TunnelInspectionRules', 
        'ApplicationOverrideRules', 'AuthenticationRules', 
        'DoSRules', 'SDWANRules'
    ],
    NETWORK: [
        'EthernetInterfaces', 'AggregateEthernetInterfaces', 
        'VLANInterfaces', 'LoopbackInterfaces', 'TunnelIntefaces', 
        'SDWANInterfaces', 'Zones', 'VLANs', 'VirtualWires', 
        'VirtualRouters', 'IPSecTunnels', 'GRETunnels', 
        'DHCPServers', 'DHCPRelays', 'DNSProxies', 
        'GlobalProtectPortals', 'GlobalProtectGateways', 
        'GlobalProtectGatewayAgentTunnels', 
        'GlobalProtectGatewaySatelliteTunnels', 
        'GlobalProtectGatewayMDMServers', 
        'GlobalProtectClientlessApps', 
        'GlobalProtectClientlessAppGroups', 
        'QoSInterfaces', 'LLDP', 
        'GlobalProtectIPSecCryptoNetworkProfiles', 
        'IKEGatewayNetworkProfiles', 'IKECryptoNetworkProfiles', 
        'MonitorNetworkProfiles', 
        'InterfaceManagementNetworkProfiles', 
        'ZoneProtectionNetworkProfiles', 'QoSNetworkProfiles', 
        'LLDPNetworkProfiles', 'BFDNetworkProfiles', 
        'SDWANInterfaceProfiles'
    ],
    DEVICES: [
        'VirtualSystems', 'SNMPTrapServerProfiles', 
        'SyslogServerProfiles', 'EmailServerProfiles', 
        'HttpServerProfiles', 'LDAPServerProfiles'
    ]
};

interface ListResourcesArgs {
    category: keyof ResourceCategories;
    resource_type: string;
}

function isListResourcesArgs(args: unknown): args is ListResourcesArgs {
    if (typeof args !== 'object' || args === null) return false;
    const typedArgs = args as Record<string, unknown>;
    return (
        typeof typedArgs.category === 'string' && 
        typeof typedArgs.resource_type === 'string' &&
        Object.keys(RESOURCE_CATEGORIES).includes(typedArgs.category as string)
    );
}

class PaloAltoServer {
    private server: Server;
    private axiosInstance;

    constructor() {
        this.server = new Server(
            {
                name: 'paloalto-server',
                version: '0.1.0',
            },
            {
                capabilities: {
                    tools: {},
                },
            }
        );

        this.axiosInstance = axios.create({
            baseURL: API_BASE_URL,
            headers: {
                'X-PAN-KEY': API_KEY,
                'Accept': 'application/json'
            },
            httpsAgent: new https.Agent({
                rejectUnauthorized: false
            })
        });

        this.setupToolHandlers();
        
        // Error handling
        this.server.onerror = (error) => console.error('[MCP Error]', error);
        process.on('SIGINT', async () => {
            await this.server.close();
            process.exit(0);
        });
    }

    private setupToolHandlers() {
        this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
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
                    name: 'list_resources',
                    description: 'List resources from a specific category',
                    inputSchema: {
                        type: 'object',
                        properties: {
                            category: {
                                type: 'string',
                                enum: Object.keys(RESOURCE_CATEGORIES),
                                description: 'Resource category to list'
                            },
                            resource_type: {
                                type: 'string',
                                description: 'Specific resource type within the category'
                            }
                        },
                        required: ['category', 'resource_type']
                    }
                },
                {
                    name: 'view_config_node_values',
                    description: 'View configuration node values for XPath on the Palo Alto firewall',
                    inputSchema: {
                        type: 'object',
                        properties: {
                            xpath: {
                                type: 'string',
                                description: 'XPath to the configuration node'
                            }
                        },
                        required: ['xpath']
                    }
                },
                {
                    name: 'multi_move_clone_configuration',
                    description: 'Multi-Move or Multi-Clone the configuration of the Palo Alto firewall',
                    inputSchema: {
                        type: 'object',
                        properties: {
                            config_paths: {
                                type: 'array',
                                items: {
                                    type: 'string'
                                },
                                description: 'Paths to the configurations to move or clone'
                            },
                            new_location: {
                                type: 'string',
                                description: 'New location for the configurations'
                            },
                            action: {
                                type: 'string',
                                enum: ['move', 'clone'],
                                description: 'Action to perform'
                            }
                        },
                        required: ['config_paths', 'new_location', 'action']
                    }
                }
            ]
        }));

        this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
            try {
                switch (request.params.name) {
                    case 'get_system_info': {
                        const response = await this.axiosInstance.get('/Device/VirtualSystems');
                        return {
                            content: [
                                {
                                    type: 'text',
                                    text: JSON.stringify(response.data, null, 2),
                                },
                            ],
                        };
                    }

                    case 'list_resources': {
                        const rawArgs = request.params.arguments;
                        if (!isListResourcesArgs(rawArgs)) {
                            throw new McpError(
                                ErrorCode.InvalidParams, 
                                'Invalid arguments for list_resources'
                            );
                        }

                        const { category, resource_type } = rawArgs;

                        const categoryResources = RESOURCE_CATEGORIES[category];
                        if (!categoryResources.includes(resource_type)) {
                            throw new McpError(
                                ErrorCode.InvalidParams, 
                                `Invalid resource type for category ${category}: ${resource_type}`
                            );
                        }

                        const response = await this.axiosInstance.get(`/Objects/${resource_type}`);
                        return {
                            content: [
                                {
                                    type: 'text',
                                    text: JSON.stringify(response.data, null, 2),
                                },
                            ],
                        };
                    }

                    case 'view_config_node_values': {
                        const { xpath } = request.params.arguments as { xpath: string };
                        const response = await this.axiosInstance.get('/config/xpath', {
                            params: { xpath }
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

                    case 'multi_move_clone_configuration': {
                        const { config_paths, new_location, action } = request.params.arguments as { 
                            config_paths: string[], 
                            new_location: string, 
                            action: 'move' | 'clone' 
                        };

                        const endpoint = action === 'move' ? 'MultiMove' : 'MultiClone';
                        const response = await this.axiosInstance.post(
                            `/Configuration/${endpoint}`,
                            { config_paths, new_location }
                        );

                        return {
                            content: [
                                {
                                    type: 'text',
                                    text: JSON.stringify(response.data, null, 2),
                                },
                            ],
                        };
                    }

                    default:
                        throw new McpError(
                            ErrorCode.MethodNotFound,
                            `Unknown tool: ${request.params.name}`
                        );
                }
            } catch (error) {
                const axiosError = error as AxiosError;
                throw new McpError(
                    ErrorCode.InternalError,
                    `Palo Alto API error: ${axiosError.message}`
                );
            }
        });
    }

    async run() {
        const transport = new StdioServerTransport();
        await this.server.connect(transport);
        console.error('Palo Alto MCP server running on stdio');
    }
}

const server = new PaloAltoServer();
server.run().catch(console.error);
