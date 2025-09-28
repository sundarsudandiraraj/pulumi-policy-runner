/**
 * Copyright 2025 Design Barn Inc.
 */

import { s3, ec2, rds } from "@pulumi/aws";
import { policyManager } from "@pulumi/compliance-policy-manager";
import type { ResourceValidationPolicy} from "@pulumi/policy";
import { PolicyPack, validateResourceOfType } from "@pulumi/policy";

// Define custom policies for your organization
const requireS3BucketVersioning: ResourceValidationPolicy = {
    name: "org-require-s3-bucket-versioning",
    description: "Ensures all S3 buckets have versioning enabled for data protection and recovery.",
    enforcementLevel: "mandatory",
    validateResource: validateResourceOfType(s3.Bucket, (bucket, args, reportViolation) => {
        if (!bucket.versioning || !bucket.versioning.enabled) {
            reportViolation("S3 buckets must have versioning enabled according to organizational policy.");
        }
    }),
};

const requireEC2InstanceTags: ResourceValidationPolicy = {
    name: "org-require-ec2-instance-tags",
    description: "Ensures all EC2 instances have required organizational tags.",
    enforcementLevel: "mandatory",
    validateResource: validateResourceOfType(ec2.Instance, (instance, args, reportViolation) => {
        const requiredTags = ["Owner", "Environment", "CostCenter"];
        const tags = instance.tags || {};

        if (instance.instanceType !== "t2.micro") {
            reportViolation("EC2 instances must not be of type 't2.micro' according to organizational policy.");
        }
        for (const tag of requiredTags) {
            if (!tags[tag]) {
                reportViolation(`EC2 instance must have the '${tag}' tag according to organizational policy.`);
            }
        }
    }),
};

const requireRDSEncryption: ResourceValidationPolicy = {
    name: "org-require-rds-encryption",
    description: "Ensures all RDS instances are encrypted at rest.",
    enforcementLevel: "mandatory",
    validateResource: validateResourceOfType(rds.Instance, (instance, args, reportViolation) => {
        if (!instance.storageEncrypted) {
            reportViolation("RDS instances must have storage encryption enabled according to organizational policy.");
        }
        if (instance.engineVersion === "8.0") {
            reportViolation("RDS instances must not be of engine version '8.0' according to organizational policy.");
        }
    }),
};

export const lottieFilesPolicyPack = new PolicyPack("aws-lottiefiles-iso27001-compliance-ready-policies-sundar", {
    policies: [
        // Include standard compliance frameworks
        ...policyManager.selectPolicies({
            vendors: ["aws"],
            services: ["alb", "apigateway", "apigatewayv2", "cloudfront", "ebs", "ec2", "ecr", "efs", "eks", "elb", "iam", "kms", "lambda", "rds", "s3", "secretsmanager"],
            severities: ["critical", "high"],
            topics: ["encryption", "logging", "network", "permissions", "security", "vulnerability"],
            // Multiple frameworks for comprehensive coverage
            frameworks: ["iso27001", "cis", "pcidss"]
        }, "advisory"),
        
        // Organization-specific mandatory policies
        requireS3BucketVersioning,
        requireEC2InstanceTags,
        requireRDSEncryption,
    ],
});

/**
 * Display additional stats and helpful information when the policy pack is evaluated.
 * This helps track which policies are being enforced and from which frameworks.
 */
policyManager.displaySelectionStats({
    displayGeneralStats: true,
    displayModuleInformation: true,
    displaySelectedPolicyNames: true,
});

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
