#!/usr/bin/env node

const { spawnSync } = require('child_process');
const path = require('path');
const fs = require('fs');

// Display help text
function showHelp() {
  console.log(`
Pulumi Policy Check Wrapper

Usage:
  node run-with-policy.js [options] [command] [args]

Options:
  --policy-dir <dir>   Path to the policy pack directory
  --project-dir <dir>  Path to the Pulumi project directory
  --stack <stack>      Pulumi stack name
  --help               Show this help text

Features:
  - Automatically builds the policy pack using pnpm workspace
  - Supports configuration via environment variables
  - Works with any Pulumi command

Environment Variables:
  POLICY_DIR           Path to the policy pack directory
  PULUMI_PROJECT_DIR   Path to the Pulumi project directory
  PULUMI_STACK         Pulumi stack name

Priority order: Command-line arguments > Environment variables > Default values

Commands:
  preview              Run pulumi preview with policy enforcement (default)
  up                   Run pulumi up with policy enforcement
  refresh              Run pulumi refresh with policy enforcement
  destroy              Run pulumi destroy with policy enforcement

Examples:
  node run-with-policy.js --policy-dir ./my-policies --project-dir ./my-project preview
  node run-with-policy.js --project-dir ./infrastructure --stack dev up
  POLICY_DIR=./policies PULUMI_PROJECT_DIR=./project PULUMI_STACK=dev node run-with-policy.js preview
`);
  process.exit(0);
}

// Parse command-line arguments and environment variables
function parseArgs() {
  const args = process.argv.slice(2);
  
  // Check for help flag
  if (args.includes('--help') || args.includes('-h')) {
    showHelp();
  }
  
  // Initialize with environment variables or defaults
  let policyDir = process.env.POLICY_DIR || '';
  let projectDir = process.env.PULUMI_PROJECT_DIR || '';
  let stack = process.env.PULUMI_STACK || '';
  let command = 'preview';
  let remainingArgs = [];

  // Look for command-line arguments (these override environment variables)
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--policy-dir' && i + 1 < args.length) {
      policyDir = args[i + 1];
      i++; // Skip the next argument as it's the value
    } else if (args[i] === '--project-dir' && i + 1 < args.length) {
      projectDir = args[i + 1];
      i++; // Skip the next argument as it's the value
    } else if (args[i] === '--stack' && i + 1 < args.length) {
      stack = args[i + 1];
      i++; // Skip the next argument as it's the value
    } else if (['preview', 'up', 'refresh', 'destroy'].includes(args[i])) {
      command = args[i];
      remainingArgs = args.slice(i + 1);
      break;
    } else {
      remainingArgs.push(args[i]);
    }
  }

  // Default values if not provided by env vars or command-line args
  if (!policyDir) {
    // First try ./pulumiPolicy (relative to current directory)
    const localPolicyDir = './pulumiPolicy';
    if (fs.existsSync(localPolicyDir)) {
      policyDir = localPolicyDir;
    } else {
      // Fall back to the absolute path relative to script location
      policyDir = path.join(__dirname, 'pulumiPolicy');
    }
  }
  if (!projectDir) {
    projectDir = path.join(__dirname, 'pulumiTemplate');
  }
  
  // We'll handle the stack parameter in the main function

  return {
    policyDir: path.resolve(policyDir),
    projectDir: path.resolve(projectDir),
    command,
    remainingArgs
  };
}

// Get configuration from command-line arguments
const { policyDir: POLICY_PACK_DIR, projectDir: PULUMI_PROJECT_DIR, command: initialCommand, remainingArgs: initialArgs } = parseArgs();

// Get stack from environment variable if not already in args
const PULUMI_STACK = process.env.PULUMI_STACK || '';
const POLICY_PACK_NAME = path.basename(POLICY_PACK_DIR);

// ANSI color codes
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m',
};

/**
 * Logs a message with color
 */
function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

/**
 * Runs a command and returns the result
 */
function runCommand(command, args, cwd) {
  log(`Running command: ${command} ${args.join(' ')}`, colors.blue);
  const result = spawnSync(command, args, {
    cwd,
    stdio: 'inherit',
    encoding: 'utf-8',
  });
  return result.status;
}

/**
 * Builds the policy pack using pnpm workspace
 */
function buildPolicyPack(policyPackDir) {
  log('Building policy pack...', colors.yellow);
  
  // Check if package.json exists
  const packageJsonPath = path.join(policyPackDir, 'package.json');
  if (!fs.existsSync(packageJsonPath)) {
    log(`Warning: No package.json found in ${policyPackDir}`, colors.yellow);
    return 0; // Continue without building
  }
  
  // Install dependencies using pnpm workspace
  log('Installing dependencies with pnpm...', colors.yellow);
  const installResult = runCommand('pnpm', ['install'], process.cwd());
  if (installResult !== 0) {
    log('Error: Failed to install dependencies', colors.red);
    return installResult;
  }
  
  // Run the build script in the policy pack directory
  log('Building policy pack...', colors.yellow);
  const buildResult = runCommand('pnpm', ['--filter', path.basename(policyPackDir), 'run', 'build'], process.cwd());
  if (buildResult !== 0) {
    log('Error: Failed to build policy pack', colors.red);
    return buildResult;
  }
  
  log(`✅ Policy pack built successfully`, colors.green);
  return 0;
}

/**
 * Checks if a directory exists
 */
function directoryExists(dir) {
  try {
    return fs.statSync(dir).isDirectory();
  } catch (err) {
    return false;
  }
}

/**
 * Main function
 */
async function main() {
  log('=== Pulumi Policy Check Wrapper ===', colors.blue);
  log(`Policy Pack: ${POLICY_PACK_NAME}`, colors.blue);
  log(`Policy Directory: ${POLICY_PACK_DIR}`, colors.blue);
  log(`Project Directory: ${PULUMI_PROJECT_DIR}`, colors.blue);
  if (PULUMI_STACK) {
    log(`Stack: ${PULUMI_STACK}`, colors.blue);
  }
  
  // Display configuration sources for clarity
  log(`\nConfiguration sources:`, colors.cyan);
  log(`Policy Directory: ${process.env.POLICY_DIR ? 'Environment variable' : 'Default or command-line'}`, colors.cyan);
  log(`Project Directory: ${process.env.PULUMI_PROJECT_DIR ? 'Environment variable' : 'Default or command-line'}`, colors.cyan);
  log(`Stack: ${process.env.PULUMI_STACK ? 'Environment variable' : 'Default or command-line'}`, colors.cyan);
  
  // Display absolute paths for clarity in CI environments
  log(`\nAbsolute paths:`, colors.cyan);
  log(`Policy Directory: ${path.resolve(POLICY_PACK_DIR)}`, colors.cyan);
  log(`Project Directory: ${path.resolve(PULUMI_PROJECT_DIR)}`, colors.cyan);

  // Check if required directories exist
  if (!directoryExists(POLICY_PACK_DIR)) {
    log(`Error: Policy pack directory not found: ${POLICY_PACK_DIR}`, colors.red);
    process.exit(1);
  }

  if (!directoryExists(PULUMI_PROJECT_DIR)) {
    log(`Error: Pulumi project directory not found: ${PULUMI_PROJECT_DIR}`, colors.red);
    process.exit(1);
  }
  
  // Build the policy pack using pnpm workspace
  // const buildResult = buildPolicyPack(POLICY_PACK_DIR);
  // if (buildResult !== 0) {
  //   log(`Error: Failed to build policy pack, exiting with code ${buildResult}`, colors.red);
  //   process.exit(buildResult);
  // }

  // Use the command and arguments from parseArgs()
  let pulumiCommand = initialCommand;
  let pulumiArgs = [...initialArgs];

  // Add stack to the arguments if available and not already present
  if (PULUMI_STACK && !pulumiArgs.includes('--stack')) {
    log(`Adding stack parameter: ${PULUMI_STACK}`, colors.cyan);
    pulumiArgs.unshift('--stack', PULUMI_STACK);
  }

  // Add policy pack to the arguments
  pulumiArgs.push('--policy-pack', POLICY_PACK_DIR);

  // Run Pulumi command with policy validation
  log(`Running Pulumi ${pulumiCommand} with policy checks...`, colors.yellow);
  const pulumiResult = runCommand('pulumi', [pulumiCommand, ...pulumiArgs], PULUMI_PROJECT_DIR);

  if (pulumiResult === 0) {
    log(`✅ ${pulumiCommand} completed successfully with no policy violations`, colors.green);
  } else {
    log(`❌ ${pulumiCommand} failed or policy violations detected`, colors.red);
    process.exit(pulumiResult);
  }
}

// Run the main function
main().catch((error) => {
  log(`Unhandled error: ${error.message}`, colors.red);
  process.exit(1);
});

// Example GitHub Actions workflow usage:
/*
name: Pulumi Policy Enforcement with pnpm Workspace

on:
  pull_request:
    branches: [ main ]

jobs:
  policy-check:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout repository with Pulumi project and policies
        uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Setup pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 8

      - name: Setup Pulumi
        uses: pulumi/setup-pulumi@v2

      - name: Run Pulumi with Policy Enforcement
        run: |
          node run-with-policy.js preview
        env:
          # Pass required variables to the script
          PULUMI_STACK: ${{ inputs.pulumi_stack }}
          PULUMI_PROJECT_DIR: ${{ inputs.working_dir }}
          POLICY_DIR: ./pulumiPolicy
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
*/
