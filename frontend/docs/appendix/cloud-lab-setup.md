---
sidebar_position: 2
title: "Cloud Lab Setup"
description: "Cloud-based robotics development with AWS, NVIDIA Omniverse Cloud, cost estimation, and migration strategies"
tags: [cloud-robotics, aws, omniverse-cloud, cloud-simulation, cost-optimization]
---

# Appendix 2: Cloud Lab Setup

## Overview

Cloud-based robotics development offers scalability, remote accessibility, and pay-as-you-go pricing. This appendix covers cloud lab setup options, cost estimation, and best practices for Physical AI development.

---

## 1. Cloud vs. On-Premise Comparison

| Factor | Cloud-Based | On-Premise |
|--------|-------------|------------|
| **Upfront Cost** | $0 (pay-as-you-go) | $2,000-$15,000+ |
| **Monthly Cost** | $100-$2,000+ (usage-based) | $0 (after purchase) |
| **Scalability** | Instant scaling, hundreds of parallel jobs | Limited by hardware |
| **Accessibility** | Remote access from anywhere | Local access only |
| **Maintenance** | Managed by provider | Self-managed |
| **Data Transfer** | Potential costs for large datasets | Local, no transfer costs |
| **Latency** | 20-100ms (region-dependent) | &lt;1ms (local) |
| **Security** | Provider-managed, compliance certified | Self-managed |
| **Best For** | Large-scale simulation, burst workloads | Daily development, low-latency control |

---

## 2. AWS RoboMaker Migration

### ⚠️ Important: RoboMaker Discontinuation

**AWS RoboMaker was discontinued on September 10, 2025.** Users are migrating to **AWS Batch** for robotics simulation.

### AWS Batch Alternative Configuration

| Component | Specification |
|-----------|---------------|
| **Service** | AWS Batch (free service fee) |
| **Compute** | EC2 instances (pay only for resources used) |
| **Container Images** | User-supplied Docker images (osrf/ros:humble-desktop base) |
| **Scaling** | Hundreds to thousands of parallel jobs |
| **Spot Instances** | Up to 90% savings for interruptible workloads |

### Migration from RoboMaker to Batch

| RoboMaker Feature | Batch Equivalent |
|-------------------|------------------|
| Per simulation-second pricing | EC2 hourly pricing |
| Built-in ROS images | Custom Docker containers |
| WorldForge GUI | S3 asset storage |
| 10 concurrent job limit | Unlimited scaling |
| Integrated ROS extensions | AWS SDK in container code |

---

## 3. NVIDIA Omniverse Cloud

### Deployment Options

| Cloud Platform | Availability | Notes |
|----------------|--------------|-------|
| **AWS** | Available | NVIDIA Omniverse Cloud APIs |
| **Azure** | Available | First to receive Omniverse Cloud APIs (March 2024) |
| **GCP** | Available | Supported for Isaac Lab deployment |
| **Alibaba Cloud** | Available | Regional availability |

**Source:** NVIDIA Developer Blog (2024)

### Subscription Model

| Term | Details |
|------|---------|
| **Billing** | Per Node basis |
| **License Type** | Subscription-based |
| **SLA** | Available via NVIDIA Cloud Services SLA |
| **Data Processing** | Customer content processed per DPA |

---

## 4. Cost Estimation

### AWS EC2 GPU Instance Pricing (US East - N. Virginia)

| Instance | GPU | vCPUs | Memory | Storage | On-Demand/Hour | Monthly (720 hrs) |
|----------|-----|-------|--------|---------|----------------|-------------------|
| **g4dn.xlarge** | 1× T4 (16GB) | 4 | 16 GB | 125 GB | ~$0.526 | ~$379 |
| **g4dn.2xlarge** | 1× T4 (16GB) | 8 | 32 GB | 225 GB | ~$0.786 | ~$566 |
| **g4dn.4xlarge** | 1× T4 (16GB) | 16 | 64 GB | 225 GB | ~$1.336 | ~$962 |
| **g4dn.8xlarge** | 1× T4 (16GB) | 32 | 128 GB | 900 GB | ~$2.436 | ~$1,754 |
| **g4dn.12xlarge** | 4× T4 (64GB) | 48 | 192 GB | 900 GB | ~$4.356 | ~$3,136 |
| **g4ad.xlarge** | 1× Radeon Pro V520 | 4 | 16 GB | 150 GB | $0.379 | $273 |
| **g4ad.4xlarge** | 1× Radeon Pro V520 | 16 | 64 GB | 600 GB | $0.867 | $624 |

### Monthly Cost Scenarios

| Usage Pattern | Configuration | Estimated Monthly Cost (USD) |
|---------------|---------------|------------------------------|
| **Student/Light Usage** | g4ad.xlarge, 4 hrs/day, 20 days/month | $30-$50 |
| **Development** | g4dn.4xlarge, 8 hrs/day, 22 days/month | $400-$500 |
| **Team Development** | g4dn.8xlarge, 12 hrs/day, 22 days/month | $1,200-$1,500 |
| **Large-Scale Training** | g4dn.12xlarge (Spot), 24/7 for 1 week | $800-$1,200 |
| **Production Simulation** | Multiple g4dn.12xlarge, continuous | $5,000-$10,000+ |

### Cost Optimization Strategies

| Strategy | Potential Savings |
|----------|-------------------|
| **Spot Instances** | Up to 90% vs. On-Demand |
| **Reserved Instances (1-year)** | ~40% vs. On-Demand |
| **Reserved Instances (3-year)** | ~60% vs. On-Demand |
| **Right-sizing instances** | 20-50% based on workload |
| **Auto-scaling** | 30-70% by matching demand |

---

## 5. Limitations and Considerations

### Cloud Robotics Limitations

| Limitation | Impact | Mitigation |
|------------|--------|------------|
| **Latency (20-100ms)** | Not suitable for real-time robot control | Use for simulation only; deploy locally |
| **Data Transfer Costs** | Large datasets expensive to move | Keep data in same region; use S3 |
| **GPU Availability** | Spot instances can be interrupted | Use for fault-tolerant workloads |
| **Security Compliance** | Data residency requirements | Choose appropriate region |
| **Vendor Lock-in** | Migration complexity | Use containerized workloads |

### Best Practices

| Practice | Description |
|----------|-------------|
| **Containerize Everything** | Use Docker for portability |
| **Infrastructure as Code** | Terraform/CloudFormation for reproducibility |
| **Monitor Costs** | Set up AWS Budgets alerts |
| **Use Spot for Batch** | Training, Monte Carlo simulations |
| **Keep Development Local** | Use cloud for scaling, not daily dev |

---

## 6. Quick Setup Guide

### AWS Batch Setup (Basic)

```bash
# 1. Create Docker container with ROS 2
FROM osrf/ros:humble-desktop

# Install your dependencies
RUN apt-get update && apt-get install -y \
    ros-humble-navigation2 \
    ros-humble-slam-toolbox \
    && rm -rf /var/lib/apt/lists/*

# 2. Push to ECR

```bash
aws ecr create-repository --repository-name robotics-sim
docker tag robotics-sim:latest your-aws-account-id.dkr.ecr.us-east-1.amazonaws.com/robotics-sim:latest
docker push your-aws-account-id.dkr.ecr.us-east-1.amazonaws.com/robotics-sim:latest
```

# 3. Submit batch job
aws batch submit-job \
  --job-name simulation-run \
  --job-queue your-queue \
  --job-definition your-job-def \
  --container-overrides 'command=["ros2","launch","nav2_bringup","navigation_launch.py"]'
```

### Cost Monitoring

```bash
# Set up AWS Budget alert
aws budgets create-budget \
  --account-id <account-id> \
  --budget file://budget.json \
  --notifications-with-subscribers file://notifications.json
```

---

## 📚 References

1. **AWS RoboMaker Migration Guide** - Dev.to, 2025.  
   URL: https://dev.to/tinnyrobot/cloud-robotics-development-on-aws-migrating-from-robomaker-to-batch-35gn

2. **AWS EC2 G4 Instances** - Amazon Web Services, 2024.  
   URL: https://aws.amazon.com/ec2/instance-types/g4/

3. **NVIDIA Omniverse Cloud Terms** - NVIDIA Corporation, 2024.  
   URL: https://www.nvidia.com/en-us/agreements/cloud-services/service-specific-terms-for-omniverse-cloud/

4. **NVIDIA Omniverse Cloud on Azure** - Microsoft News, 2024.  
   URL: https://news.microsoft.com/de-ch/2024/03/18/microsoft-and-nvidia-announce-major-integrations-to-accelerate-generative-ai-for-enterprises-everywhere/
