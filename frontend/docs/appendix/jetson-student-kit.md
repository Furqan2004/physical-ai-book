---
sidebar_position: 3
title: "Jetson Student Kit"
description: "Build a mobile robot with NVIDIA Jetson Orin Nano Super - assembly, ROS 2 setup, RealSense integration, and performance benchmarks"
tags: [jetson-orin, mobile-robot, realsense, ros2-jetson, student-kit]
---

# Appendix 3: Jetson Student Kit

## Overview

The NVIDIA Jetson Orin Nano Super Developer Kit provides an affordable platform for mobile robotics development. This appendix guides you through building a complete mobile robot with perception, navigation, and AI capabilities.

---

## 1. Kit Components

### Jetson Orin Nano Super Developer Kit

| Component | Specification |
|-----------|---------------|
| **Module** | Jetson Orin Nano 8GB |
| **AI Performance** | 67 INT8 TOPS (Sparse), 33 INT8 TOPS (Dense) |
| **GPU** | 1,024 CUDA Cores, 32 Tensor Cores @ 1,020 MHz |
| **CPU** | 6-core Arm Cortex-A78AE @ 1.7 GHz |
| **Memory** | 8GB 128-bit LPDDR5 @ 102 GB/s |
| **Power** | 7W / 15W / 25W (MAXN mode) |
| **Price** | $249 USD |

### Complete Student Kit Components

| Component | Specification | Estimated Cost (USD) |
|-----------|---------------|---------------------|
| **Jetson Orin Nano Super Kit** | Module + carrier board + SD card + power supply | $249 |
| **Chassis (Differential Drive)** | Aluminum alloy, 2× motors + wheels | $80-$150 |
| **Motor Controller** | PWM-based or Arduino intermediary | $20-$50 |
| **Battery Pack** | 12V 5000mAh LiPo with regulator | $40-$80 |
| **Intel RealSense D435** | Depth camera | $150 |
| **LiDAR (Optional)** | 360°, 10m range | $100-$200 |
| **IMU Module** | MPU6050 6-axis | $15 |
| **WiFi Module** | USB WiFi 6 adapter | $30 |
| **MicroSD Card** | 64GB high-speed | $20 |
| **Total (Basic)** | | **~$600-$750** |
| **Total (With LiDAR)** | | **~$700-$950** |

---

## 2. Assembly Steps

### Step 1: Chassis Assembly

```
1. Unpack chassis components
2. Attach motors to chassis frame using provided screws
3. Mount wheels to motor shafts
4. Install caster wheel for balance
5. Verify all connections are secure
```

### Step 2: Mount Jetson Orin Nano

```
1. Position Jetson carrier board on chassis mounting points
2. Secure with M3 screws (ensure airflow clearance)
3. Connect motor controller to GPIO/PWM pins
4. Route cables neatly to avoid interference
```

### Step 3: Power System Wiring

```
Battery → Voltage Regulator → Jetson (5V/4A)
Battery → Motor Controller → Motors (12V)

⚠️ Safety Notes:
- Use appropriate gauge wires (18-20 AWG for motors)
- Include fuse (5A) between battery and regulator
- Verify polarity before connecting
```

### Step 4: Sensor Integration

| Sensor | Connection | Notes |
|--------|------------|-------|
| **RealSense D435** | USB 3.0 Type-A | Use provided cable; secure mounting |
| **LiDAR** | USB or UART | Configure baud rate (115200 typical) |
| **IMU** | I2C (GPIO pins) | Enable I2C in Jetson settings |
| **Motor Controller** | PWM + GPIO | Verify pin assignments |

### Step 5: Software Flash

```bash
# 1. Download JetPack from NVIDIA
# 2. Use Etcher to flash to microSD card
# 3. Insert card into Jetson
# 4. Power on and complete setup wizard

# Enable Super mode (25W):
sudo nvpmodel -m 2
```

---

## 3. ROS 2 on Jetson

### Installation Steps

```bash
# 1. Set locale
sudo apt update && sudo apt install locales
sudo locale-gen en_US en_US.UTF-8
sudo update-locale LC_ALL=en_US.UTF-8 LANG=en_US.UTF-8
export LANG=en_US.UTF-8

# 2. Add ROS 2 repository
sudo apt install software-properties-common
sudo add-apt-repository universe
sudo apt update && sudo apt install curl -y

# Download and install ROS 2 apt source
export ROS_APT_SOURCE_VERSION=$(curl -s https://api.github.com/repos/ros-infrastructure/ros-apt-source/releases/latest | grep -F "tag_name" | awk -F\" '{print $4}')
curl -L -o /tmp/ros2-apt-source.deb "https://github.com/ros-infrastructure/ros-apt-source/releases/download/${ROS_APT_SOURCE_VERSION}/ros2-apt-source_${ROS_APT_SOURCE_VERSION}.$(. /etc/os-release && echo ${UBUNTU_CODENAME:-${VERSION_CODENAME}})_all.deb"
sudo dpkg -i /tmp/ros2-apt-source.deb

# 3. Install ROS 2 Humble Desktop
sudo apt update
sudo apt install ros-humble-desktop

# 4. Install development tools
sudo apt install ros-dev-tools

# 5. Source environment
source /opt/ros/humble/setup.bash
echo "source /opt/ros/humble/setup.bash" >> ~/.bashrc

# 6. Initialize rosdep
sudo rosdep init
rosdep update

# 7. Install Cyclone DDS (optional, for better performance)
sudo apt install ros-humble-rmw-cyclonedds-cpp
export RMW_IMPLEMENTATION=rmw_cyclonedds-cpp
```

### Jetson-Specific Optimization

```bash
# Enable MAXN mode for maximum performance
sudo nvpmodel -m 0

# Set fan to maximum (if using active cooling)
sudo sh -c 'echo 255 > /sys/devices/pwm-fan/target_pwm'

# Verify GPU utilization
tegrastats

# Monitor power consumption
sudo tegrastats --interval 1000
```

---

## 4. Connecting RealSense Camera

### USB Setup

```bash
# 1. Connect RealSense D435/D455 to USB 3.0 port
# 2. Verify device detection
lsusb | grep RealSense

# 3. Install librealsense SDK
sudo apt install librealsense2-dkms
sudo apt install librealsense2-utils

# 4. Test camera
realsense-viewer
```

### ROS 2 Driver Installation

```bash
# Install RealSense ROS 2 package
sudo apt install ros-humble-realsense2-camera

# Source environment
source /opt/ros/humble/setup.bash

# Launch camera
ros2 launch realsense2_camera rs_launch.py
```

### Common Issues and Solutions

| Issue | Solution |
|-------|----------|
| Version mismatch (librealsense vs ROS package) | Match SDK version with ROS package version |
| USB bandwidth insufficient | Use USB 3.0 port; reduce resolution/frame rate |
| Camera not detected | Check cable; try different USB port |
| Low frame rate | Reduce resolution; enable hardware acceleration |

---

## 5. Testing Setup

### Hardware Verification

```bash
# Check Jetson status
jtop

# Verify GPU utilization
tegrastats

# Test GPIO (Python)
python3 -c "import RPi.GPIO as GPIO; GPIO.setmode(GPIO.BOARD); GPIO.setup(11, GPIO.OUT); GPIO.output(11, True)"

# Test motor controller
# (Use your specific motor control code)
```

### ROS 2 Verification

```bash
# List active topics
ros2 topic list

# Check camera feed
ros2 topic echo /camera/color/image_raw

# Test talker/listener
# Terminal 1:
ros2 run demo_nodes_cpp talker

# Terminal 2:
ros2 run demo_nodes_py listener
```

### Navigation Stack Test

```bash
# Install Navigation 2
sudo apt install ros-humble-navigation2

# Launch navigation
ros2 launch nav2_bringup navigation_launch.py

# Visualize in RViz2
rviz2
```

---

## 6. Performance Benchmarks

### Jetson Orin Nano Super vs. Original

| Workload | Original Orin Nano | Orin Nano Super | Improvement |
|----------|-------------------|-----------------|-------------|
| **AI Performance (INT8 Sparse)** | 40 TOPS | 67 TOPS | **+67%** |
| **AI Performance (FP16)** | 10 TFLOPs | 17 TFLOPs | **+70%** |
| **Memory Bandwidth** | 68 GB/s | 102 GB/s | **+50%** |
| **CPU Clock** | 1.5 GHz | 1.7 GHz | **+13%** |
| **GPU Clock** | 635 MHz | 1,020 MHz | **+60%** |

### Jetson Orin Nano Super vs. Raspberry Pi 5

| Metric | Jetson Orin Nano Super | Raspberry Pi 5 | Advantage |
|--------|----------------------|----------------|-----------|
| **AI Performance (INT8)** | 67 TOPS | ~1-2 TOPS | **30-60×** |
| **GPU (CUDA Cores)** | 1,024 | N/A (VideoCore VI) | N/A |
| **Memory Bandwidth** | 102 GB/s | ~48 GB/s | **2×** |
| **ResNet-50 Inference** | ~36 FPS | ~1-2 FPS | **18-36×** |
| **Price** | $249 | $60-$80 | Pi is cheaper |
| **Power Consumption** | 7-25W | 5-12W | Similar |

### Real-World Latency Benchmarks

| Task | Jetson Orin Nano Super | Raspberry Pi 5 |
|------|----------------------|----------------|
| Object Detection (YOLO) | 15-30 FPS | 2-5 FPS |
| SLAM Mapping | Real-time | Laggy |
| Multi-camera Processing | Supported | Limited |
| LLM Inference (7B) | 19 tokens/sec | Not practical |

---

## 7. Quick Reference: Build Checklist

### Components to Order

- [ ] Jetson Orin Nano Super Developer Kit ($249)
- [ ] Differential drive chassis ($80-$150)
- [ ] Motor controller ($20-$50)
- [ ] Battery pack 12V 5000mAh ($40-$80)
- [ ] Intel RealSense D435 ($150)
- [ ] MicroSD card 64GB ($20)
- [ ] WiFi adapter ($30)
- [ ] Wires, screws, mounting hardware ($20)

### Assembly Checklist

- [ ] Chassis assembled with motors
- [ ] Jetson mounted securely
- [ ] Power system wired correctly
- [ ] Sensors connected and tested
- [ ] JetPack flashed to SD card
- [ ] ROS 2 Humble installed
- [ ] RealSense camera working
- [ ] Motor controller tested
- [ ] Navigation stack running

---

## 📚 References

1. **NVIDIA Jetson Orin Nano Super Developer Kit** - NVIDIA Corporation, 2024.  
   URL: https://developer.nvidia.com/blog/nvidia-jetson-orin-nano-developer-kit-gets-a-super-boost/

2. **Jetson Orin Nano Super Kit Review** - JetsonHacks, 2024.  
   URL: https://jetsonhacks.com/2024/12/17/jetson-orin-nano-super-developer-kit/

3. **Jetson Orin Nano Super Analysis** - Tom's Hardware, 2024.  
   URL: https://www.tomshardware.com/tech-industry/artificial-intelligence/nvidia-launches-new-usd249-ai-development-board-that-does-67-tops

4. **Intel RealSense D455 Specifications** - Intel Corporation, 2024.  
   URL: https://www.intel.com/content/www/us/en/products/sku/205847/intel-realsense-depth-camera-d455/specifications.html

5. **ROS 2 Humble Installation Guide** - ROS.org, 2024.  
   URL: https://robocre8.gitbook.io/robocre8/tutorials/how-to-install-ros2-humble-desktop-on-pc-full-install

6. **Mobile Robot Build Guide** - LidarMOS, 2024.  
   URL: https://lidarmos.net/integrating-nvidia-jetson-into-mobile-robots/
