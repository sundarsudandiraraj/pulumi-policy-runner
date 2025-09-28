# Pulumi Policy Integration

This project demonstrates how to integrate Pulumi Policy Packs with Pulumi infrastructure projects to enforce organizational policies during infrastructure deployment.

## Project Structure

- **pulumiPolicy/**: Contains the Pulumi Policy Pack with AWS compliance policies
- **pulumiTemplate/**: Contains a sample Pulumi infrastructure project
- **run-with-policy.sh**: Bash script to run Pulumi commands with policy checks
- **run-with-policy.js**: Node.js script to run Pulumi commands with policy checks
- **run-with-policy-automation.js**: Advanced script using Pulumi Automation API

## Policy Pack Details

The policy pack (`pulumiPolicy/`) enforces several AWS compliance policies:

1. **S3 Bucket Versioning**: Ensures all S3 buckets have versioning enabled
2. **EC2 Instance Tags**: Ensures EC2 instances have required organizational tags (Owner, Environment, CostCenter)
3. **RDS Encryption**: Ensures RDS instances have storage encryption enabled
4. **Instance Type Restrictions**: Prevents use of t2.micro instance types
5. **RDS Engine Version Restrictions**: Prevents use of MySQL 8.0

Additionally, it includes standard compliance frameworks:
- ISO 27001
- CIS (Center for Internet Security)
- PCI DSS (Payment Card Industry Data Security Standard)

## Usage

### Prerequisites

- Node.js and npm installed
- Pulumi CLI installed
- AWS credentials configured

### Installation

1. Install dependencies:

```bash
npm install
```

### Running with Policy Checks

#### Option 1: Using the Bash Script

```bash
# Run preview with policy checks
./run-with-policy.sh preview

# Run up with policy checks
./run-with-policy.sh up

# Run destroy with policy checks
./run-with-policy.sh destroy

# Pass additional arguments
./run-with-policy.sh preview --diff
```

#### Option 2: Using the Node.js Script

```bash
# Run preview with policy checks
node run-with-policy.js preview

# Run up with policy checks
node run-with-policy.js up

# Run destroy with policy checks
node run-with-policy.js destroy

# Pass additional arguments
node run-with-policy.js preview --diff
```

#### Option 3: Using npm Scripts

```bash
# Run preview with policy checks
npm run preview

# Run preview with Automation API
npm run preview:automation

# Run up with policy checks
npm run up

# Run destroy with policy checks
npm run destroy
```

#### Option 4: Using Pulumi Automation API

```bash
# Run preview with policy checks using Automation API
node run-with-policy-automation.js

# Specify a different stack
node run-with-policy-automation.js prod
```

## How It Works

The integration works by:

1. Loading the policy pack from the `pulumiPolicy` directory
2. Running the Pulumi command with the `--policy-pack` flag pointing to the policy pack
3. Evaluating resources against policies during the preview/update process
4. Reporting any policy violations before resources are created/updated

## Policy Enforcement Levels

- **Mandatory**: Blocks deployment if violated
- **Advisory**: Warns but allows deployment to proceed

## Sample Resources

The `pulumiTemplate/index.ts` file includes several resources that demonstrate both policy violations and compliant resources:

- S3 buckets with and without versioning
- EC2 instances with and without required tags
- RDS instances with and without encryption

## Customizing Policies

To modify existing policies or add new ones:

1. Edit `pulumiPolicy/index.ts`
2. Add or modify policy definitions
3. Run your Pulumi commands with the updated policy pack

## Integrating with CI/CD

For CI/CD integration, you can use the provided scripts in your pipeline:

```yaml
# Example GitHub Actions workflow
jobs:
  pulumi:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      - name: Install dependencies
        run: npm install
      - name: Run Pulumi preview with policy checks
        run: ./run-with-policy.sh preview
```

## Troubleshooting

### Common Issues

1. **Policy pack not found**: Ensure the path to the policy pack is correct
2. **Dependency errors**: Run `npm install` in both the policy pack and project directories
3. **Pulumi not found**: Ensure Pulumi CLI is installed and in your PATH

### Debugging

For more verbose output:

```bash
PULUMI_DEBUG=1 ./run-with-policy.sh preview
```

## Advanced Usage

### Using with Existing Projects

To use these scripts with your existing Pulumi projects:

1. Copy the scripts to your project root
2. Modify the `POLICY_PACK_DIR` and `PULUMI_PROJECT_DIR` variables in the scripts

### Using Environment Variables

The `run-with-policy.js` script supports configuration via environment variables, which is particularly useful for CI/CD environments:

```bash
# Using environment variables
PULUMI_STACK="lottiefiles-test/dev" POLICY_DIR="./pulumiPolicy" PULUMI_PROJECT_DIR="./pulumiTemplate" node run-with-policy.js preview
```

### Available Options for run-with-policy.js

| Option | Environment Variable | Description |
|--------|---------------------|-------------|
| `--policy-dir` | `POLICY_DIR` | Path to the policy pack directory |
| `--project-dir` | `PULUMI_PROJECT_DIR` | Path to the Pulumi project directory |
| `--stack` | `PULUMI_STACK` | Pulumi stack name |
| `--help` | - | Show help text |

### Priority Order

The script uses the following priority order for configuration:
1. Command-line arguments
2. Environment variables
3. Default values

### GitHub Actions Integration

You can easily integrate this script into your GitHub Actions workflows:

```yaml
- name: Run Pulumi Deployment with Policy Enforcement
  run: |
    pnpm install
    pnpm run preview
  working-directory: ./runner
  env:
    PULUMI_STACK: ${{ inputs.pulumi_stack }}
    PULUMI_PROJECT_DIR: ${{ inputs.working_dir }}
    POLICY_DIR: ${{ inputs.policy_dir }}
```

### Examples

```bash
# Run preview with a specific policy pack and project
node run-with-policy.js --policy-dir ./policies/aws --project-dir ./infrastructure preview

# Run update with a specific stack
node run-with-policy.js --stack dev up

# Run destroy with confirmation
node run-with-policy.js destroy --yes

# Using environment variables for CI/CD
PULUMI_STACK="lottiefiles-test/dev" POLICY_DIR="./pulumiPolicy" PULUMI_PROJECT_DIR="./pulumiTemplate" node run-with-policy.js preview
```
