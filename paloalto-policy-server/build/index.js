#!/usr/bin/env node
import dotenv from 'dotenv';
dotenv.config();
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ErrorCode, ListToolsRequestSchema, McpError, } from '@modelcontextprotocol/sdk/types.js';
import axios, { AxiosError } from 'axios';
const API_KEY = process.env.PANOS_API_KEY;
const API_BASE_URL = process.env.PANOS_API_BASE_URL || 'https://firewall.example.com/api';
if (!API_KEY) {
    throw new Error('PANOS_API_KEY environment variable is required');
}
class PolicyServer {
    constructor() {
        this.server = new Server({
            name: 'paloalto-policy-server',
            version: '0.1.0',
        }, {
            capabilities: {
                tools: {},
            },
        });
        this.setupToolHandlers();
        // Error handling
        this.server.onerror = (error) => console.error('[MCP Error]', error);
        process.on('SIGINT', async () => {
            await this.server.close();
            process.exit(0);
        });
    }
    setupToolHandlers() {
        this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
            tools: [
                {
                    name: 'get_security_rules',
                    description: 'Get security policy rules',
                    inputSchema: {
                        type: 'object',
                        properties: {},
                    },
                },
                {
                    name: 'get_nat_rules',
                    description: 'Get NAT policy rules',
                    inputSchema: {
                        type: 'object',
                        properties: {},
                    },
                },
                {
                    name: 'get_qos_rules',
                    description: 'Get QoS policy rules',
                    inputSchema: {
                        type: 'object',
                        properties: {},
                    },
                },
                {
                    name: 'get_policy_based_forwarding_rules',
                    description: 'Get policy-based forwarding rules',
                    inputSchema: {
                        type: 'object',
                        properties: {},
                    },
                },
                {
                    name: 'get_decryption_rules',
                    description: 'Get decryption policy rules',
                    inputSchema: {
                        type: 'object',
                        properties: {},
                    },
                },
                {
                    name: 'get_tunnel_inspection_rules',
                    description: 'Get tunnel inspection rules',
                    inputSchema: {
                        type: 'object',
                        properties: {},
                    },
                },
                {
                    name: 'get_application_override_rules',
                    description: 'Get application override rules',
                    inputSchema: {
                        type: 'object',
                        properties: {},
                    },
                },
                {
                    name: 'get_authentication_rules',
                    description: 'Get authentication policy rules',
                    inputSchema: {
                        type: 'object',
                        properties: {},
                    },
                },
                {
                    name: 'get_dos_rules',
                    description: 'Get DoS protection rules',
                    inputSchema: {
                        type: 'object',
                        properties: {},
                    },
                },
                {
                    name: 'get_sdwan_rules',
                    description: 'Get SD-WAN policy rules',
                    inputSchema: {
                        type: 'object',
                        properties: {},
                    },
                },
                {
                    name: 'create_rule',
                    description: 'Create a new policy rule',
                    inputSchema: {
                        type: 'object',
                        properties: {
                            rule_type: {
                                type: 'string',
                                description: 'Type of rule (security, nat, qos, etc.)',
                            },
                            rule_data: {
                                type: 'object',
                                description: 'Rule configuration data',
                            },
                        },
                        required: ['rule_type', 'rule_data'],
                    },
                },
                {
                    name: 'update_rule',
                    description: 'Update an existing policy rule',
                    inputSchema: {
                        type: 'object',
                        properties: {
                            rule_type: {
                                type: 'string',
                                description: 'Type of rule (security, nat, qos, etc.)',
                            },
                            rule_name: {
                                type: 'string',
                                description: 'Name of the rule to update',
                            },
                            rule_data: {
                                type: 'object',
                                description: 'Updated rule configuration data',
                            },
                        },
                        required: ['rule_type', 'rule_name', 'rule_data'],
                    },
                },
                {
                    name: 'delete_rule',
                    description: 'Delete a policy rule',
                    inputSchema: {
                        type: 'object',
                        properties: {
                            rule_type: {
                                type: 'string',
                                description: 'Type of rule (security, nat, qos, etc.)',
                            },
                            rule_name: {
                                type: 'string',
                                description: 'Name of the rule to delete',
                            },
                        },
                        required: ['rule_type', 'rule_name'],
                    },
                },
            ],
        }));
        this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
            try {
                const args = request.params.arguments;
                switch (request.params.name) {
                    case 'get_security_rules':
                        return await this.getRules('Security');
                    case 'get_nat_rules':
                        return await this.getRules('NAT');
                    case 'get_qos_rules':
                        return await this.getRules('QoS');
                    case 'get_policy_based_forwarding_rules':
                        return await this.getRules('PolicyBasedForwarding');
                    case 'get_decryption_rules':
                        return await this.getRules('Decryption');
                    case 'get_tunnel_inspection_rules':
                        return await this.getRules('TunnelInspection');
                    case 'get_application_override_rules':
                        return await this.getRules('ApplicationOverride');
                    case 'get_authentication_rules':
                        return await this.getRules('Authentication');
                    case 'get_dos_rules':
                        return await this.getRules('DoS');
                    case 'get_sdwan_rules':
                        return await this.getRules('SDWAN');
                    case 'create_rule':
                        if (!args.rule_type || !args.rule_data) {
                            throw new McpError(ErrorCode.InvalidParams, 'Missing required parameters: rule_type and rule_data');
                        }
                        return await this.createRule(args.rule_type, args.rule_data);
                    case 'update_rule':
                        if (!args.rule_type || !args.rule_name || !args.rule_data) {
                            throw new McpError(ErrorCode.InvalidParams, 'Missing required parameters: rule_type, rule_name, and rule_data');
                        }
                        return await this.updateRule(args.rule_type, args.rule_name, args.rule_data);
                    case 'delete_rule':
                        if (!args.rule_type || !args.rule_name) {
                            throw new McpError(ErrorCode.InvalidParams, 'Missing required parameters: rule_type and rule_name');
                        }
                        return await this.deleteRule(args.rule_type, args.rule_name);
                    default:
                        throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${request.params.name}`);
                }
            }
            catch (error) {
                if (error instanceof McpError) {
                    throw error;
                }
                if (error instanceof AxiosError) {
                    throw new McpError(ErrorCode.InternalError, `Palo Alto API error: ${error.message}`);
                }
                throw new McpError(ErrorCode.InternalError, `Error executing tool: ${error instanceof Error ? error.message : 'Unknown error'}`);
            }
        });
    }
    async getRules(ruleType) {
        try {
            const response = await axios.get(`${API_BASE_URL}/Policies/${ruleType}Rules`, {
                headers: {
                    'X-PAN-KEY': API_KEY,
                    'Accept': 'application/json',
                },
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
            throw error;
        }
    }
    async createRule(ruleType, ruleData) {
        try {
            const response = await axios.post(`${API_BASE_URL}/Policies/${ruleType}Rules`, ruleData, {
                headers: {
                    'X-PAN-KEY': API_KEY,
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
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
            throw error;
        }
    }
    async updateRule(ruleType, ruleName, ruleData) {
        try {
            const response = await axios.put(`${API_BASE_URL}/Policies/${ruleType}Rules/${ruleName}`, ruleData, {
                headers: {
                    'X-PAN-KEY': API_KEY,
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
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
            throw error;
        }
    }
    async deleteRule(ruleType, ruleName) {
        try {
            const response = await axios.delete(`${API_BASE_URL}/Policies/${ruleType}Rules/${ruleName}`, {
                headers: {
                    'X-PAN-KEY': API_KEY,
                    'Accept': 'application/json',
                },
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
            throw error;
        }
    }
    async run() {
        const transport = new StdioServerTransport();
        await this.server.connect(transport);
        console.error('Palo Alto Policy Management MCP server running on stdio');
    }
}
const server = new PolicyServer();
server.run().catch(console.error);
//# sourceMappingURL=index.js.map