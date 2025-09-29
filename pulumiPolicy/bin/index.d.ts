/**
 * Copyright 2025 Design Barn Inc.
 */
import { PolicyPack } from "@pulumi/policy";
export declare const lottieFilesPolicyPack: PolicyPack;
/**
 * AWS Compliance Policy Pack Documentation
 *
 * This policy pack enforces both industry-standard compliance frameworks and
 * organization-specific security requirements for AWS resources.
 *
 * Included frameworks:
 * - ISO 27001: Information security management standard
 * - CIS: Center for Internet Security benchmarks
 * - PCI DSS: Payment Card Industry Data Security Standard
 *
 * Organization-specific policies:
 * - S3 bucket versioning: All buckets must have versioning enabled
 * - EC2 instance tagging: All instances must have Owner, Environment, and CostCenter tags
 * - RDS encryption: All RDS instances must have storage encryption enabled
 *
 * Enforcement levels:
 * - Standard framework policies: Advisory (warnings only)
 * - Organization-specific policies: Mandatory (deployment blocking)
 */
