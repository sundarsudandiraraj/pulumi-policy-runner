# Local Development Guide for Pulumi Policy Integration

This guide explains how to build and use the Pulumi policy pack locally with the integration scripts.

## Overview

The approach we're using involves:

1. Building the policy pack locally using TypeScript
2. Using the built JavaScript files directly with Pulumi commands
3. Running the integration script to apply policies during Pulumi operations

## Directory Structure

- `pulumiPolicy/`: Contains the policy pack source code and build output
- `pulumiTemplate/`: Contains a sample Pulumi project for testing
- `run-with-policy.js`: Script to run Pulumi commands with policy enforcement

## Building the Policy Pack

The policy pack is written in TypeScript and needs to be compiled to JavaScript before use:

```bash
# Navigate to the policy pack directory
cd pulumiPolicy

# Install dependencies
npm install

# Build the TypeScript files
npm run build
```

This will create a `bin` directory containing the compiled JavaScript files.

## Running with Policy Enforcement

The `run-with-policy.js` script handles:

1. Building the policy pack
2. Verifying the build output
3. Running Pulumi commands with policy enforcement

To use it:

```bash
# Run preview with policy enforcement
node run-with-policy.js preview

# Run update with policy enforcement
node run-with-policy.js up

# Run destroy with policy enforcement
node run-with-policy.js destroy
```

## How It Works

### Policy Pack Structure

The policy pack is defined in `pulumiPolicy/index.ts` and includes:

- Custom policies for your organization
- Integration with standard compliance frameworks
- Policy enforcement levels (mandatory, advisory)

### Build Process

The TypeScript compiler (`tsc`) compiles the policy pack to JavaScript:

- Source: `pulumiPolicy/index.ts`
- Output: `pulumiPolicy/bin/index.js`

### Integration Script

The `run-with-policy.js` script:

1. Builds the policy pack using `npm run build`
2. Verifies the build output exists
3. Runs the specified Pulumi command with the `--policy-pack` flag pointing to the policy pack directory

## Modifying Policies

To modify existing policies or add new ones:

1. Edit `pulumiPolicy/index.ts`
2. Add or modify policy definitions
3. Rebuild the policy pack: `cd pulumiPolicy && npm run build`
4. Run your Pulumi commands with the updated policy pack

## Troubleshooting

### Common Issues

1. **Build failures**:
   - Make sure all dependencies are installed: `npm install`
   - Check for TypeScript errors in the policy pack

2. **Policy not being applied**:
   - Verify the policy pack was built successfully
   - Check that the `--policy-pack` flag is correctly pointing to the policy pack directory

3. **Unexpected policy violations**:
   - Review the policy definitions in `pulumiPolicy/index.ts`
   - Check the enforcement levels (mandatory vs. advisory)

## Next Steps

- Add more policies to the policy pack
- Integrate with CI/CD pipelines
- Create a global configuration for policy enforcement
