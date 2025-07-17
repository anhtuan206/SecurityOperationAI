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

interface ConfigurationResponse {
  status: string;
  result: any;
}

class PaloAltoConfigServer {
  private server: Server;
  private axiosInstance;

  constructor() {
    this.server = new Server(
      {
        name: 'paloalto-config-server',
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
        'Content-Type': 'application/json',
      },
      httpsAgent: new https.Agent({
        rejectUnauthorized: false,
      }),
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
          name: 'get_configuration',
          description: 'Get configuration from a specific XPath in PAN-OS',
          inputSchema: {
            type: 'object',
            properties: {
              xpath: {
                type: 'string',
                description: 'XPath to the configuration node',
              },
            },
            required: ['xpath'],
          },
        },
        {
          name: 'set_configuration',
          description: 'Set configuration at a specific XPath in PAN-OS',
          inputSchema: {
            type: 'object',
            properties: {
              xpath: {
                type: 'string',
                description: 'XPath to the configuration node',
              },
              element: {
                type: 'string',
                description: 'XML configuration element to set',
              },
            },
            required: ['xpath', 'element'],
          },
        },
        {
          name: 'delete_configuration',
          description: 'Delete configuration at a specific XPath in PAN-OS',
          inputSchema: {
            type: 'object',
            properties: {
              xpath: {
                type: 'string',
                description: 'XPath to the configuration node to delete',
              },
            },
            required: ['xpath'],
          },
        },
        {
          name: 'move_configuration',
          description: 'Move configuration from one location to another in PAN-OS',
          inputSchema: {
            type: 'object',
            properties: {
              xpath: {
                type: 'string',
                description: 'XPath to the configuration node to move',
              },
              where: {
                type: 'string',
                enum: ['before', 'after', 'top', 'bottom'],
                description: 'Where to move the node relative to dst',
              },
              dst: {
                type: 'string',
                description: 'Destination XPath (not required for top/bottom)',
              },
            },
            required: ['xpath', 'where'],
          },
        },
        {
          name: 'rename_configuration',
          description: 'Rename a configuration node in PAN-OS',
          inputSchema: {
            type: 'object',
            properties: {
              xpath: {
                type: 'string',
                description: 'XPath to the configuration node to rename',
              },
              newname: {
                type: 'string',
                description: 'New name for the node',
              },
            },
            required: ['xpath', 'newname'],
          },
        },
        {
          name: 'clone_configuration',
          description: 'Clone a configuration node in PAN-OS',
          inputSchema: {
            type: 'object',
            properties: {
              xpath: {
                type: 'string',
                description: 'XPath to the configuration node to clone',
              },
              newname: {
                type: 'string',
                description: 'Name for the cloned node',
              },
            },
            required: ['xpath', 'newname'],
          },
        },
      ],
    }));

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      try {
        switch (request.params.name) {
          case 'get_configuration': {
            const { xpath } = request.params.arguments as { xpath: string };
            const response = await this.axiosInstance.get<ConfigurationResponse>('/config/get', {
              params: { xpath },
            });
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(response.data.result, null, 2),
                },
              ],
            };
          }

          case 'set_configuration': {
            const { xpath, element } = request.params.arguments as { xpath: string; element: string };
            const response = await this.axiosInstance.post<ConfigurationResponse>('/config/set', {
              xpath,
              element,
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

          case 'delete_configuration': {
            const { xpath } = request.params.arguments as { xpath: string };
            const response = await this.axiosInstance.delete<ConfigurationResponse>('/config/delete', {
              params: { xpath },
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

          case 'move_configuration': {
            const { xpath, where, dst } = request.params.arguments as {
              xpath: string;
              where: 'before' | 'after' | 'top' | 'bottom';
              dst?: string;
            };
            const response = await this.axiosInstance.post<ConfigurationResponse>('/config/move', {
              xpath,
              where,
              dst,
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

          case 'rename_configuration': {
            const { xpath, newname } = request.params.arguments as {
              xpath: string;
              newname: string;
            };
            const response = await this.axiosInstance.post<ConfigurationResponse>('/config/rename', {
              xpath,
              newname,
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

          case 'clone_configuration': {
            const { xpath, newname } = request.params.arguments as {
              xpath: string;
              newname: string;
            };
            const response = await this.axiosInstance.post<ConfigurationResponse>('/config/clone', {
              xpath,
              newname,
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
    console.error('Palo Alto Config MCP server running on stdio');
  }
}

const server = new PaloAltoConfigServer();
server.run().catch(console.error);
