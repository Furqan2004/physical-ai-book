---
sidebar_position: 2
title: "Week 9: AI Perception & Manipulation"
description: "Learn Visual SLAM, Isaac Perceptor for 3D scene understanding, Nav2 path planning, and synthetic data generation with domain randomization"
tags: [isaac-ros, visual-slam, object-detection, nav2, synthetic-data, domain-randomization]
---

# Week 9: AI Perception & Manipulation

## 🎯 Learning Objectives

By the end of this chapter, you will be able to:

- Configure Visual SLAM with Isaac ROS for real-time robot localization
- Explain how Isaac Perceptor builds 3D scene maps from camera data
- Integrate Nav2 navigation stack for bipedal robot path planning
- Generate synthetic training data using domain randomization techniques
- Deploy GPU-accelerated perception pipelines on Jetson hardware

---

## Introduction

This week explores AI perception and manipulation in Isaac Sim and Isaac ROS. You'll learn how to build complete perception pipelines that enable robots to understand their environment, localize themselves, detect objects, and navigate autonomously.

The key insight: **GPU acceleration** enables real-time perception that was previously impossible with CPU-based systems.

---

## 1. Visual SLAM with Isaac ROS

### What is Visual SLAM?

**Visual SLAM (Simultaneous Localization and Mapping)** determines a robot's position by building a graph of visual landmarks from camera input, enabling loop closure detection to correct odometry drift.

### Isaac ROS Visual SLAM (cuVSLAM) Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    Isaac ROS Visual SLAM Pipeline               │
├─────────────────────────────────────────────────────────────────┤
│  Camera Input → GPU Feature Extraction → Landmark Graph        │
│       ↓              ↓                    ↓                     │
│  Image Stream    CUDA Kernels        Map Building              │
│       ↓              ↓                    ↓                     │
│  Rectification   Feature Tracking    Loop Closure              │
│       ↓              ↓                    ↓                     │
│  NITROS Zero-Copy → Pose Estimation → TF Output               │
└─────────────────────────────────────────────────────────────────┘
```

### Hardware Acceleration

| Component | Acceleration Method | Benefit |
|-----------|--------------------|---------|
| **Feature Extraction** | CUDA parallel processing | 10x faster than CPU |
| **Feature Tracking** | GPU-parallelized matching | Real-time performance |
| **Map Building** | GPU-accelerated graph optimization | Low-latency updates |
| **Data Transfer** | NITROS zero-copy | Minimal CPU overhead |

### Supported Cameras

| Camera | Configuration | Platform |
|--------|--------------|----------|
| **Isaac ROS Hawk** | Stereo camera | Jetson Orin |
| **Intel RealSense** | Stereo + IMU | x86_64, Jetson |
| **Multiple Hawk** | Multi-camera setup | Jetson Orin |
| **Isaac Sim Virtual** | Simulated cameras | Any |

### ROS 2 Integration

**Package:** `isaac_ros_visual_slam`

**Topics Subscribed:**
- `/camera/left/image_rect` – Left rectified image
- `/camera/right/image_rect` – Right rectified image
- `/camera/imu` – IMU data (optional, for RealSense)

**Topics Published:**
- `/visual_slam/odom` – Odometry estimate
- `/visual_slam/pose` – Camera pose
- `/visual_slam/map` – Landmark map
- `/tf` – Transform updates

### Example: Launch Visual SLAM

```python
# launch/visual_slam_launch.py
from launch import LaunchDescription
from launch_ros.actions import Node

def generate_launch_description():
    return LaunchDescription([
        Node(
            package='isaac_ros_visual_slam',
            executable='isaac_ros_visual_slam_node',
            name='visual_slam_node',
            parameters=[{
                'enable_slam': True,
                'enable_localization': True,
                'enable_mapping': True,
                'enable_odometry': True,
            }],
            remappings=[
                ('/stereo/left/image_rect', '/camera/left/image_rect'),
                ('/stereo/right/image_rect', '/camera/right/image_rect'),
            ]
        )
    ])
```

### Common Pitfalls

| Issue | Cause | Solution |
|-------|-------|----------|
| **Drift over time** | No loop closure | Ensure overlapping paths for loop detection |
| **Tracking loss** | Low texture environment | Add visual features or use IMU fusion |
| **High latency** | CPU bottleneck | Enable NITROS; reduce image resolution |
| **Incorrect scale** | Monocular setup | Use stereo cameras for metric scale |

---

## 2. Isaac Perceptor (3D Scene Understanding)

### System Overview

**Isaac Perceptor** is a GPU-accelerated perception system that provides 3D scene understanding using the Nova sensor suite. It processes multiple time-synchronized image streams to build real-time 3D reconstruction for navigation.

### 3D Mapping Pipeline

```
┌─────────────────────────────────────────────────────────────────┐
│                  Isaac Perceptor Data Flow                      │
├─────────────────────────────────────────────────────────────────┤
│  HAWK Cameras → NITROS Images → Rectification → Throttling     │
│       ↓                                                         │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │ ESS Depth       │  │ Visual SLAM     │  │ Nvblox          │ │
│  │ (Depth Images)  │  │ (Camera Pose)   │  │ (3D Voxel Map)  │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
│       ↓                    ↓                    ↓               │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │              Distance Map Converter                      │   │
│  └─────────────────────────────────────────────────────────┘   │
│       ↓                                                         │
│  ┌─────────────────┐  ┌─────────────────┐                      │
│  │ 2D Costmap      │  │ 3D Costmap      │ → Nav2              │
│  └─────────────────┘  └─────────────────┘                      │
└─────────────────────────────────────────────────────────────────┘
```

### Key Components

| Module | Function | Output |
|--------|----------|--------|
| **Isaac ROS Nova** | Time-synchronized multi-cam data | Synchronized images |
| **Isaac ROS ESS** | Learning-based stereo depth | Dense depth images |
| **Isaac ROS Visual SLAM** | GPU-accelerated odometry | Camera poses |
| **Isaac ROS Nvblox** | 3D voxel reconstruction | Voxel occupancy map |
| **Distance Map Converter** | Voxel → costmap | 2D/3D navigation maps |

### Object Detection Integration

**Supported Models:**

| Model | Package | Use Case |
|-------|---------|----------|
| **DetectNet** | `isaac_ros_detectnet` | General object detection |
| **RT-DETR** | `isaac_ros_rtdetr` | Real-time detection transformer |
| **YOLOv8** | `isaac_ros_yolov8` | Latest YOLO architecture |

**Important:** Object detection provides 2D bounding boxes only. For 3D spatial understanding, use:
- **Isaac ROS Nvblox** – Scene reconstruction
- **Isaac ROS Pose Estimation** – 6DoF object pose
- **Isaac ROS Image Segmentation** – Per-pixel classification

---

## 3. Nav2 Path Planning for Bipedal Robots

### Nav2 Architecture

The **Nav2 Navigation Stack** is the standard ROS 2 navigation framework:

```
┌─────────────────────────────────────────────────────────────────┐
│                      Nav2 Server Stack                          │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │ Planner      │  │ Controller   │  │ Behavior     │         │
│  │ Server       │  │ Server       │  │ Server       │         │
│  │ (A*, Dijkstra)│  │ (MPPI, DWB)  │  │ (Recovery)   │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
│       ↓                    ↓                    ↓               │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │              Costmap 2D/3D (from Perceptor)              │   │
│  └─────────────────────────────────────────────────────────┘   │
│       ↓                                                         │
│  ┌─────────────────┐  ┌─────────────────┐                      │
│  │ Global Planner  │  │ Local Planner   │ → Joint Commands     │
│  └─────────────────┘  └─────────────────┘                      │
└─────────────────────────────────────────────────────────────────┘
```

### Key Components

| Component | Function | Algorithms |
|-----------|----------|------------|
| **Planner Server** | Global path planning (A→B) | A*, Dijkstra, RRT, Theta* |
| **Controller Server** | Local trajectory following | MPPI, DWB, TEB |
| **Behavior Server** | Recovery behaviors | Spin, Backup, Wait |
| **Costmap** | Obstacle representation | Static, Inflation, Obstacle layers |

### Bipedal Robot Considerations

Bipedal robots require special navigation considerations:

| Challenge | Solution |
|-----------|----------|
| **Dynamic Stability** | Use MPC-based controllers (MPPI) with stability constraints |
| **Foot Placement** | Custom planner for foothold selection |
| **Terrain Adaptation** | 3D costmaps with elevation data |
| **Gait Planning** | Integration with whole-body controllers |

---

## 4. Synthetic Data Generation with Domain Randomization

### What is Domain Randomization?

**Domain randomization** systematically varies scene parameters (lighting, textures, object poses, backgrounds) within simulation to improve AI model robustness and generalization to real-world environments.

### Sim-to-Real Gap Types

| Gap Type | Cause | Solution |
|----------|-------|----------|
| **Appearance Gap** | Pixel-level differences (rendering, lighting, materials) | High-fidelity rendering + post-processing |
| **Content Gap** | Scene-level differences (object diversity, placement, context) | Domain randomization across multiple axes |

### Replicator Randomization Techniques

| Technique | Parameters | Example |
|-----------|------------|---------|
| **Object Randomization** | Pose, scale, texture, color | Random object positions within 2m radius |
| **Lighting Randomization** | Intensity, direction, time of day | 100-1000 lux; 0-360° azimuth |
| **Background Randomization** | Environment maps, textures | 50+ HDRI environments |
| **Texture & Color** | Material properties, hue, saturation | ±30% color variation |
| **Camera Randomization** | Position, angle, focal length | ±15° viewpoint variation |

### Implementation with Replicator API

```python
# synthetic_data_generation.py
import omni.replicator.core as rep

# Initialize Replicator
rep.initialize()

# Define randomization functions
def randomize_objects():
    objects = rep.get.prims(path_pattern="/World/Objects/*")
    with objects:
        rep.modify.pose(
            position=rep.distribution.uniform((-2, -2, 0), (2, 2, 1)),
            rotation=rep.distribution.uniform((0, 0, 0), (360, 360, 360))
        )
        rep.modify.scale(
            rep.distribution.uniform(0.8, 1.2)
        )

def randomize_lighting():
    lights = rep.get.lights()
    with lights:
        rep.modify.intensity(
            rep.distribution.uniform(100, 1000)
        )
        rep.modify.color(
            rep.distribution.uniform((0.8, 0.8, 1.0), (1.0, 1.0, 0.8))
        )

def randomize_background():
    env_map = rep.get.env_map()
    with env_map:
        rep.modify.texture(
            rep.distribution.choice(
                ["/World/Backgrounds/env_*.hdr"]
            )
        )

# Create data generation pipeline
with rep.trigger.on_frame(num_frames=1000):
    randomize_objects()
    randomize_lighting()
    randomize_background()

# Configure output
rep.writer.write(
    rep.WriterRegistry.get("BasicWriter"),
    output_dir="/output/synthetic_data",
    rgb=True,
    depth=True,
    semantic_segmentation=True,
    bounding_box_2d_tight=True,
    pose=True
)

# Run generation
rep.run()
```

### Best Practices

| Practice | Rationale |
|----------|-----------|
| **Maximize variability** | Expose models to wide range of conditions |
| **Avoid static configurations** | Fixed parameters limit dataset diversity |
| **Address both gaps** | Use high-fidelity rendering + randomization |
| **On-the-fly randomization** | Avoid asset reloading for efficiency |
| **Validate with real data** | Test on small real-world dataset |

---

## 🔧 Practical Exercise: Configure Perception Pipeline

### Exercise: Set Up Complete Perception Stack

**Goal:** Configure Visual SLAM + Object Detection + 3D Mapping for a robot

### Step 1: Create Launch File

```python
# launch/perception_pipeline_launch.py
from launch import LaunchDescription
from launch_ros.actions import Node

def generate_launch_description():
    return LaunchDescription([
        # Visual SLAM
        Node(
            package='isaac_ros_visual_slam',
            executable='isaac_ros_visual_slam_node',
            name='visual_slam_node',
            parameters=[{
                'enable_slam': True,
                'enable_mapping': True,
            }],
            remappings=[
                ('/stereo/left/image_rect', '/hawk/left/image_rect'),
                ('/stereo/right/image_rect', '/hawk/right/image_rect'),
            ]
        ),
        
        # Depth Estimation
        Node(
            package='isaac_ros_ess',
            executable='isaac_ros_ess_node',
            name='ess_node',
            parameters=[{
                'input_width': 960,
                'input_height': 560,
            }]
        ),
        
        # 3D Reconstruction (Nvblox)
        Node(
            package='isaac_ros_nvblox',
            executable='isaac_ros_nvblox_node',
            name='nvblox_node',
            parameters=[{
                'voxel_size': 0.05,
            }]
        ),
        
        # Object Detection
        Node(
            package='isaac_ros_rtdetr',
            executable='isaac_ros_rtdetr_node',
            name='rtdetr_node',
            parameters=[{
                'model_path': '/models/rtdetr.engine',
                'input_tensor_width': 640,
                'input_tensor_height': 640,
            }]
        ),
        
        # Nav2 Costmap from 3D
        Node(
            package='isaac_ros_nvblox',
            executable='nvblox_costmap_node',
            name='nvblox_costmap_node',
            parameters=[{
                'costmap_resolution': 0.05,
            }]
        )
    ])
```

### Step 2: Run the Pipeline

```bash
# Source ROS 2 environment
source /opt/ros/humble/setup.bash

# Launch perception pipeline
ros2 launch perception_pipeline_launch.py
```

### Step 3: Visualize in Foxglove/RViz2

```bash
# Open Foxglove
foxglove

# Add displays:
# - Image: /hawk/left/image_rect
# - PointCloud2: /nvblox_node/pointcloud
# - Path: /visual_slam/odom
# - DetectionArray: /rtdetr_node/detections
```

### Common Pitfalls

| Issue | Solution |
|-------|----------|
| **High GPU usage** | Throttle side cameras; reduce resolution |
| **SLAM drift** | Ensure loop closure opportunities |
| **Detection latency** | Use TensorRT engine; reduce input size |
| **Costmap errors** | Verify TF tree; check frame IDs |

---

## 📝 Summary

### Key Takeaways

- **Visual SLAM** – GPU-accelerated cuVSLAM provides real-time localization with loop closure
- **Isaac Perceptor** – Complete 3D scene understanding pipeline from cameras to costmaps
- **Nav2 Integration** – Standard navigation stack with bipedal-specific configurations
- **Synthetic Data** – Domain randomization bridges sim-to-real gap for perception models
- **TensorRT Inference** – Optimized DNN execution for real-time object detection

### Looking Ahead

In Week 10, you'll learn sim-to-real transfer techniques — how to deploy policies trained in simulation to physical robots using domain randomization, reinforcement learning, and Jetson deployment.

---

## 📚 References

1. **Isaac ROS Visual SLAM Documentation** – NVIDIA Corporation, Release 3.1, 2025.  
   URL: https://nvidia-isaac-ros.github.io/v/release-3.1/concepts/visual_slam/index.html

2. **Isaac Perceptor Technical Details** – NVIDIA Corporation, Release 3.1, 2025.  
   URL: https://nvidia-isaac-ros.github.io/v/release-3.1/reference_workflows/isaac_perceptor/technical_details.html

3. **Domain Randomization with Replicator** – NVIDIA Learning, 2025.  
   URL: https://docs.nvidia.com/learning/physical-ai/getting-started-with-isaac-sim/latest/synthetic-data-generation-for-perception-model-training-in-isaac-sim/03-domain-randomization-with-replicator.html

4. **Domain Randomization in Machine Learning** – Emergent Mind, July 2025.  
   URL: https://www.emergentmind.com/topics/domain-randomization

5. **Isaac ROS Object Detection** – NVIDIA Corporation, Release 3.1, 2025.  
   URL: https://nvidia-isaac-ros.github.io/v/release-3.1/repositories_and_packages/isaac_ros_object_detection/index.html
