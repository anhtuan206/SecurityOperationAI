# Palo Alto Networks MCP Server Suite

[![smithery badge](https://smithery.ai/badge/@DynamicEndpoints/paloalto-mcp-server)](https://smithery.ai/server/@DynamicEndpoints/paloalto-mcp-server)

A comprehensive suite of Model Context Protocol (MCP) servers for managing Palo Alto Networks firewalls and services through a unified API interface.

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Installation](#installation)
- [Server Details](#server-details)
  - [Core Server](#core-server-paloalto-server)
  - [Policy Server](#policy-server-paloalto-policy-server)
  - [Config Server](#config-server-paloalto-config-server)
  - [Objects Server](#objects-server-paloalto-objects-server)
  - [Device Server](#device-server-paloalto-device-server)
- [Integration Patterns](#integration-patterns)
- [Advanced Usage](#advanced-usage)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)

## Overview

The Palo Alto Networks MCP Server Suite provides a modular approach to firewall management through specialized servers:

- **Core Server**: Base firewall operations and shared functionality
- **Policy Server**: Security policy and rule management
- **Config Server**: System configuration and settings
- **Objects Server**: Network objects and address management
- **Device Server**: Device operations and monitoring

## Architecture

```
┌─────────────────┐     ┌──────────────────┐
│    Core Server  │◄────┤  Policy Server   │
│                 │     └──────────────────┘
│  (Base Services)│     ┌──────────────────┐
│                 │◄────┤  Config Server   │
│                 │     └──────────────────┘
│                 │     ┌──────────────────┐
│                 │◄────┤  Objects Server  │
│                 │     └──────────────────┘
│                 │     ┌──────────────────┐
│                 │◄────┤  Device Server   │
└────────┬────────┘     └──────────────────┘
         │
         ▼
┌─────────────────┐
│  Palo Alto API  │
└─────────────────┘
```

## Installation

### Installing via Smithery

To install Palo Alto Networks MCP Server Suite for Claude Desktop automatically via [Smithery](https://smithery.ai/server/@DynamicEndpoints/paloalto-mcp-server):

```bash
npx -y @smithery/cli install @DynamicEndpoints/paloalto-mcp-server --client claude
```

### Manual Installation
1. Clone the repository:
```bash
git clone https://github.com/your-org/paloalto-mcp-servers.git
cd paloalto-mcp-servers
```

2. Install dependencies for each server:
```bash
# Install core server
cd paloalto-server
npm install

# Install policy server
cd ../paloalto-policy-server
npm install

# Install config server
cd ../paloalto-config-server
npm install

# Install objects server
cd ../paloalto-objects-server
npm install

# Install device server
cd ../paloalto-device-server
npm install
```

3. Configure environment variables:
```bash
# Create .env files in each server directory
PANOS_API_KEY=your-api-key
PANOS_API_BASE_URL=https://your-firewall.example.com/api

# Optional configurations
PANOS_VERIFY_SSL=true
PANOS_TIMEOUT=30000
PANOS_DEBUG=false
```

## Server Details

### Core Server (paloalto-server)

Base server providing shared functionality and core operations.

#### Key Features
- Authentication and session management
- API rate limiting and retry logic
- Shared utility functions
- Error handling framework

#### Example: Basic Authentication
```typescript
const result = await useMcpTool("paloalto-server", "verify_credentials", {
  api_key: process.env.PANOS_API_KEY
});

console.log(result.content[0].text); // Authentication status
```

### Policy Server (paloalto-policy-server)

Comprehensive policy and rule management.

#### Available Tools

1. **get_security_rules**
```typescript
// Get all security rules
const rules = await useMcpTool("paloalto-policy", "get_security_rules", {});

// Get rules with filtering
const webRules = await useMcpTool("paloalto-policy", "get_security_rules", {
  filter: {
    service: ["http", "https"],
    action: "allow"
  }
});
```

2. **create_security_rule**
```typescript
// Create a basic security rule
await useMcpTool("paloalto-policy", "create_rule", {
  rule_type: "security",
  rule_data: {
    name: "allow-internal-web",
    source: ["internal-network"],
    destination: ["web-servers"],
    service: ["http", "https"],
    action: "allow",
    log_setting: "default",
    profile_setting: {
      group: ["default-protection"]
    }
  }
});

// Create a more complex rule with zones and applications
await useMcpTool("paloalto-policy", "create_rule", {
  rule_type: "security",
  rule_data: {
    name: "restrict-social-media",
    source_zone: ["trust"],
    destination_zone: ["untrust"],
    source: ["internal-users"],
    destination: ["any"],
    application: ["facebook-base", "twitter-base"],
    service: ["application-default"],
    action: "deny",
    log_setting: "detailed-logging",
    description: "Block social media access"
  }
});
```

3. **update_security_rule**
```typescript
// Update an existing rule
await useMcpTool("paloalto-policy", "update_rule", {
  rule_type: "security",
  rule_name: "allow-internal-web",
  rule_data: {
    service: ["http", "https", "ssh"],
    description: "Updated to allow SSH access"
  }
});
```

### Config Server (paloalto-config-server)

System configuration and settings management.

#### Example: Network Configuration
```typescript
// Update DNS settings
await useMcpTool("paloalto-config", "update_network_settings", {
  dns_primary: "8.8.8.8",
  dns_secondary: "8.8.4.4",
  dns_search_domain: "example.com"
});

// Configure interfaces
await useMcpTool("paloalto-config", "configure_interface", {
  name: "ethernet1/1",
  config: {
    mode: "layer3",
    ip: ["10.0.1.1/24"],
    zone: "trust",
    enable: true
  }
});
```

### Objects Server (paloalto-objects-server)

Network object and address management.

#### Example: Address Object Management
```typescript
// Create address objects
await useMcpTool("paloalto-objects", "create_address_object", {
  name: "web-server-1",
  type: "ip-netmask",
  value: "10.0.1.100/32",
  description: "Primary web server",
  tags: ["production", "web"]
});

// Create address group
await useMcpTool("paloalto-objects", "create_address_group", {
  name: "web-servers",
  description: "All web servers",
  members: ["web-server-1", "web-server-2"],
  tags: ["production", "web"]
});

// Create dynamic address group
await useMcpTool("paloalto-objects", "create_dynamic_address_group", {
  name: "active-web-servers",
  description: "Web servers currently in use",
  filter: "tag.production and tag.web and state.up"
});
```

### Device Server (paloalto-device-server)

Device operations and monitoring.

#### Example: Device Management
```typescript
// Get device status
const status = await useMcpTool("paloalto-device", "get_device_status", {});

// Commit changes
await useMcpTool("paloalto-device", "commit_changes", {
  description: "Updated security policies",
  admins: ["admin1"], // Optional: Specify which admin's changes to commit
});

// Backup configuration
await useMcpTool("paloalto-device", "backup_config", {
  filename: "backup-2024-01-20.xml",
  include_shared: true
});
```

## Integration Patterns

### 1. Security Policy Deployment
```typescript
async function deploySecurityPolicy() {
  // 1. Create address objects
  await useMcpTool("paloalto-objects", "create_address_object", {
    name: "internal-subnet",
    type: "ip-netmask",
    value: "192.168.1.0/24"
  });

  // 2. Create security rules
  await useMcpTool("paloalto-policy", "create_rule", {
    rule_type: "security",
    rule_data: {
      name: "allow-outbound",
      source: ["internal-subnet"],
      destination: ["any"],
      service: ["web-browsing"],
      action: "allow"
    }
  });

  // 3. Verify configuration
  const rules = await useMcpTool("paloalto-policy", "get_security_rules", {});
  
  // 4. Commit changes
  await useMcpTool("paloalto-device", "commit_changes", {
    description: "Deployed new security policy"
  });
}
```

### 2. High Availability Configuration
```typescript
async function configureHA() {
  // 1. Configure HA interfaces
  await useMcpTool("paloalto-config", "configure_ha", {
    mode: "active-passive",
    group: {
      id: 1,
      description: "Primary HA Group"
    },
    interfaces: {
      ha1: {
        port: "ethernet1/3",
        ip: "10.0.0.1/24"
      },
      ha2: {
        port: "ethernet1/4",
        ip: "10.0.1.1/24"
      }
    }
  });

  // 2. Configure HA policy
  await useMcpTool("paloalto-config", "configure_ha_policy", {
    preemptive: true,
    heartbeat_interval: 2000,
    heartbeat_threshold: 3
  });

  // 3. Commit changes
  await useMcpTool("paloalto-device", "commit_changes", {
    description: "Configured HA settings"
  });
}
```

## Advanced Usage

### 1. Custom Rule Templates
```typescript
const ruleTemplate = {
  base: {
    log_setting: "default",
    profile_setting: {
      group: ["default-protection"]
    }
  },
  web: {
    service: ["web-browsing"],
    application: ["web-browsing"],
    profile_setting: {
      group: ["strict-web-protection"]
    }
  }
};

async function createRuleFromTemplate(type, customData) {
  const template = {...ruleTemplate.base, ...ruleTemplate[type]};
  await useMcpTool("paloalto-policy", "create_rule", {
    rule_type: "security",
    rule_data: {...template, ...customData}
  });
}
```

### 2. Batch Operations
```typescript
async function batchCreateObjects(objects) {
  const results = [];
  for (const obj of objects) {
    try {
      const result = await useMcpTool("paloalto-objects", "create_address_object", obj);
      results.push({status: "success", name: obj.name});
    } catch (error) {
      results.push({status: "error", name: obj.name, error: error.message});
    }
  }
  return results;
}
```

## Troubleshooting

### Common Issues

1. **API Connection Issues**
```typescript
// Test API connectivity
const status = await useMcpTool("paloalto-server", "test_connection", {
  timeout: 5000,
  verify_ssl: true
});

if (!status.success) {
  console.error(`Connection failed: ${status.error}`);
  // Check firewall accessibility
  // Verify API key permissions
  // Validate SSL certificates
}
```

2. **Rule Conflicts**
```typescript
// Analyze rule conflicts
const analysis = await useMcpTool("paloalto-policy", "analyze_rules", {
  rule_type: "security",
  checks: ["shadowing", "redundancy", "conflicts"]
});

if (analysis.issues.length > 0) {
  console.log("Found rule issues:", analysis.issues);
}
```

3. **Commit Failures**
```typescript
try {
  await useMcpTool("paloalto-device", "commit_changes", {
    description: "Policy update"
  });
} catch (error) {
  if (error.code === "ConfigurationLocked") {
    // Handle locked configuration
    await useMcpTool("paloalto-device", "release_config_lock", {});
  } else if (error.code === "ValidationError") {
    // Handle validation errors
    console.error("Configuration validation failed:", error.details);
  }
}
```

## Contributing

1. Fork the repository
2. Create a feature branch
```bash
git checkout -b feature/new-feature
```
3. Commit your changes
```bash
git commit -m "Add new feature"
```
4. Push to the branch
```bash
git push origin feature/new-feature
```
5. Create a Pull Request

## License

MIT License - see LICENSE file for details
