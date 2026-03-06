---
sidebar_position: 1
title: "Hardware Requirements"
description: "Complete hardware specifications for Physical AI development including workstation requirements, GPU recommendations, and peripheral equipment"
tags: [hardware, workstation, gpu, nvidia-rtx, jetson, sensors]
---

# Appendix 1: Hardware Requirements

## Overview

This appendix provides comprehensive hardware specifications for setting up your Physical AI learning and development environment. Whether you're a student, researcher, or professional, you'll find configuration recommendations for every budget.

---

## 1. Workstation Specifications

### Minimum vs. Recommended Configuration

| Component | Minimum | Recommended (Good) | Ideal (Professional) |
|-----------|---------|-------------------|---------------------|
| **Operating System** | Ubuntu 22.04 / Windows 10 | Ubuntu 22.04 / Windows 11 | Ubuntu 22.04 / 24.04 |
| **CPU** | Intel i7 7th Gen / AMD Ryzen 5 (4 cores) | Intel i7 9th Gen / AMD Ryzen 7 (8 cores) | Intel i9 / AMD Ryzen 9 (16 cores) |
| **GPU** | GeForce RTX 4080 | GeForce RTX 5080 | RTX PRO 6000 Blackwell |
| **VRAM** | 16GB | 16GB | 48GB-96GB |
| **RAM** | 32GB | 64GB | 64GB+ |
| **Storage** | 50GB SSD | 500GB SSD | 1TB NVMe SSD |

**Source:** NVIDIA Isaac Sim Documentation (2025)

### Ubuntu 22.04 Base Requirements

| Requirement | Minimum | Recommended |
|-------------|---------|-------------|
| **CPU** | 2 GHz dual-core | 2 GHz quad-core+ |
| **RAM** | 4 GB | 8 GB+ |
| **Storage** | 25 GB | 50 GB+ |
| **Display** | 1024×768 | 1920×1080+ |

---

## 2. GPU Recommendations

### Consumer GPUs for Isaac Sim

| GPU Model | Architecture | CUDA Cores | VRAM | Memory Bandwidth | TBP | MSRP (USD) | Current Price (USD) |
|-----------|--------------|------------|------|------------------|-----|------------|---------------------|
| **RTX 4080** | Ada Lovelace | 9,728 | 16GB GDDR6X | 717 GB/s | 320W | $1,199 | $1,500+ |
| **RTX 4080 Super** | Ada Lovelace | 10,240 | 16GB GDDR6X | 736 GB/s | 320W | $999 | $1,000+ |
| **RTX 4090** | Ada Lovelace | 16,384 | 24GB GDDR6X | 1,008 GB/s | 450W | $1,599 | $2,000+ |
| **RTX 5080** | Blackwell | 10,752 | 16GB GDDR7 | 960 GB/s | 360W | $999 | $1,500+ |

### Professional GPUs for Production

| GPU Model | Architecture | CUDA Cores | Tensor Cores | RT Cores | VRAM | Memory Bandwidth | TBP | Price (USD) |
|-----------|--------------|------------|--------------|----------|------|------------------|-----|-------------|
| **RTX PRO 6000 Blackwell** | Blackwell | 24,064 | 752 | 188 | 96GB GDDR7 ECC | 1,792 GB/s | 600W | $7,999-$8,565 |

### VRAM Requirements by Workload

| Workload Type | Minimum VRAM | Recommended VRAM | Notes |
|---------------|--------------|------------------|-------|
| Basic Isaac Sim tutorials | 16GB | 16GB | Single robot, simple scenes |
| Multi-robot simulation | 16GB | 24GB+ | 5+ robots, moderate complexity |
| High-fidelity sensor simulation | 24GB | 48GB+ | LiDAR, multiple cameras, HD textures |
| Large-scale training (Isaac Lab) | 24GB | 48GB-96GB | RL training, parallel environments |

**⚠️ Important:** GPUs without RT Cores (e.g., A100, H100) are **not supported** by Isaac Sim.

---

## 3. Peripheral Equipment

### Depth Cameras for Robotics

| Camera Model | Depth Resolution | RGB Resolution | Frame Rate | Operating Range | FOV | Connectivity | Price (USD) |
|--------------|-----------------|----------------|------------|-----------------|-----|--------------|-------------|
| **Intel RealSense D435** | 1280×720 | Yes | Up to 90 FPS | 0.3m - 3m | 85.2° × 58° | USB 3.0 Type-C | ~$150 |
| **Intel RealSense D455** | 1280×720 | Yes | Up to 90 FPS | 0.6m - 6m | 86° × 57° | USB 3.1 | ~$250 |

### Additional Peripherals

| Peripheral | Specification | Purpose | Estimated Cost (USD) |
|------------|---------------|---------|---------------------|
| **LiDAR Sensor** | 360°, 10-20m range | SLAM mapping, navigation | $100-$500 |
| **IMU (MPU6050)** | 6-axis (accelerometer + gyroscope) | Orientation tracking | $10-$30 |
| **4K Monitor** | 3840×2160, 60Hz | Development, visualization | $300-$600 |
| **Gigabit Ethernet** | 1 Gbps minimum | Robot communication | Included |
| **WiFi 6 Adapter** | 802.11ax | Wireless connectivity | $30-$80 |

---

## 4. Budget Tiers

### Entry-Level (~$1,500-$2,500)

| Component | Specification | Estimated Cost (USD) |
|-----------|---------------|---------------------|
| CPU | AMD Ryzen 7 7700X (8-core) | $300 |
| GPU | RTX 4070 Super (12GB) | $600 |
| RAM | 32GB DDR5 | $120 |
| Storage | 500GB NVMe SSD | $50 |
| Motherboard | B650 chipset | $180 |
| PSU | 750W 80+ Gold | $100 |
| Case + Cooling | Mid-tower + air cooler | $150 |
| **Total** | | **~$1,500** |

**Suitable for:** ROS 2 development, basic Gazebo simulation, entry-level Isaac Sim

### Mid-Range (~$3,000-$5,000)

| Component | Specification | Estimated Cost (USD) |
|-----------|---------------|---------------------|
| CPU | AMD Ryzen 9 7900X (12-core) | $400 |
| GPU | RTX 5080 (16GB) | $1,500 |
| RAM | 64GB DDR5 | $240 |
| Storage | 1TB NVMe SSD | $100 |
| Motherboard | X670 chipset | $250 |
| PSU | 850W 80+ Gold | $150 |
| Case + Cooling | Mid-tower + AIO | $200 |
| **Total** | | **~$2,840** |

**Suitable for:** Isaac Sim with moderate scenes, multi-robot simulation, AI training

### Professional (~$8,000-$15,000+)

| Component | Specification | Estimated Cost (USD) |
|-----------|---------------|---------------------|
| CPU | AMD Threadripper 7960X (24-core) | $1,500 |
| GPU | RTX PRO 6000 Blackwell (96GB) | $8,000 |
| RAM | 128GB DDR5 ECC | $600 |
| Storage | 2TB NVMe SSD | $200 |
| Motherboard | TRX50 workstation | $600 |
| PSU | 1200W 80+ Platinum | $250 |
| Case + Cooling | Full-tower + custom loop | $500 |
| **Total** | | **~$11,650** |

**Suitable for:** Production Isaac Sim, large-scale RL training, digital twin development

---

## 5. Component Compatibility

### Ubuntu 22.04 + ROS 2 Humble + Isaac Sim

| Component | Compatible Version | Notes |
|-----------|-------------------|-------|
| **Ubuntu** | 22.04 LTS (Jammy Jellyfish) | Primary supported OS |
| **ROS 2** | Humble Hawksbill | Default for Ubuntu 22.04 |
| **Isaac Sim** | 4.0.0 - 5.1.0 | Requires Ubuntu 22.04/24.04 |
| **NVIDIA Driver** | 580.65.06+ (Linux) | Required for RTX features |
| **CUDA** | 12.x | Included with driver |
| **Gazebo** | Gazebo Classic / Gazebo Sim | ROS 2 compatible |

### Known Compatibility Issues

| Issue | Solution |
|-------|----------|
| Windows 10 support ends Oct 2025 | Migrate to Ubuntu 22.04 or Windows 11 |
| GPUs without RT Cores (A100, H100) not supported | Use RTX-series GPUs only |
| VRAM &lt;16GB insufficient for complex scenes | Upgrade GPU or reduce scene complexity |

---

## 6. Quick Reference: What to Buy

### For Students (Budget-Conscious)

```
- GPU: RTX 4070 Super or RTX 4080 Super
- CPU: AMD Ryzen 7 7700X
- RAM: 32GB DDR5
- Storage: 500GB NVMe SSD
- Total: ~$1,500-$2,000
```

### For Researchers (Balanced Performance)

```
- GPU: RTX 5080 or RTX 4090
- CPU: AMD Ryzen 9 7900X
- RAM: 64GB DDR5
- Storage: 1TB NVMe SSD
- Total: ~$3,000-$4,000
```

### For Production (Maximum Performance)

```
- GPU: RTX PRO 6000 Blackwell
- CPU: AMD Threadripper 7960X
- RAM: 128GB DDR5 ECC
- Storage: 2TB NVMe SSD
- Total: ~$12,000-$15,000
```

---

## 📚 References

1. **NVIDIA Isaac Sim Documentation** - NVIDIA Corporation, 2025.  
   URL: https://docs.isaacsim.omniverse.nvidia.com/5.1.0/installation/requirements.html

2. **Intel RealSense D435/D455 Specifications** - Intel Corporation, 2024.  
   URL: https://www.intel.com/content/www/us/en/products/sku/128255/intel-realsense-depth-camera-d435/specifications.html

3. **Ubuntu 22.04 System Requirements** - Canonical Ltd., 2025.  
   URL: https://linuxconfig.org/ubuntu-22-04-minimum-requirements

4. **RTX 5080 Specifications** - WCCFTech, 2026.  
   URL: https://wccftech.com/roundup/nvidia-geforce-rtx-5080/

5. **RTX PRO 6000 Blackwell Specifications** - BIZON Tech, 2025.  
   URL: https://bizon-tech.com/blog/new-rtx-pro-6000-blackwell-gpus-tech-specs
