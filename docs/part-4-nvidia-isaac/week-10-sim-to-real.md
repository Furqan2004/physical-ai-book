---
sidebar_position: 3
title: "Week 10: Sim-to-Real Transfer"
description: "Learn sim-to-real gap, reinforcement learning in Isaac Lab, domain randomization techniques, and Jetson Orin deployment with TensorRT"
tags: [sim-to-real, reinforcement-learning, isaac-lab, domain-randomization, jetson-orin, tensorrt]
---

# Week 10: Sim-to-Real Transfer

## 🎯 Learning Objectives

By the end of this chapter, you will be able to:

- Explain the sim-to-real gap and why policies trained in simulation fail on real robots
- Train reinforcement learning policies in Isaac Lab with domain randomization
- Apply domain randomization techniques for robust policy transfer
- Optimize DNN models with TensorRT for real-time inference on Jetson
- Deploy trained policies from Isaac Sim to physical robots via Jetson Orin

---

## Introduction

You've learned to simulate robots with high fidelity. But **simulation is not reality**. This week addresses the critical challenge: how do you transfer policies trained in simulation to physical robots?

The **sim-to-real gap** is the performance degradation when simulation-trained policies are deployed on real hardware. We'll explore techniques to bridge this gap through domain randomization, robust training, and optimized deployment.

---

## 1. The Sim-to-Real Gap

### Why Simulation Doesn't Match Reality

The **sim-to-real gap** refers to performance degradation when policies trained in simulation are deployed on physical robots. This gap arises from inevitable differences between simulated and real environments.

### Sources of the Gap

| Category | Specific Differences | Impact |
|----------|---------------------|--------|
| **Appearance** | Lighting, textures, materials, rendering artifacts | Perception model failures |
| **Physics** | Friction, mass, inertia, actuator dynamics | Control policy instability |
| **Sensors** | Noise characteristics, latency, calibration errors | State estimation errors |
| **Environment** | Unmodeled obstacles, terrain variations, disturbances | Navigation failures |
| **Actuators** | Backlash, compliance, saturation limits | Trajectory tracking errors |

### Quantifying the Gap

```
Gap = |J_real(π_sim) - J_sim(π_sim)|

Where:
- J_real = Cost/reward in real environment
- J_sim = Cost/reward in simulation
- π_sim = Policy trained in simulation
```

### Key Challenges

1. **Unmodeled Dynamics** – Simulation cannot capture all physical phenomena
2. **Sensor Noise** – Real sensors have complex noise patterns
3. **Computational Constraints** – Real-time inference on edge hardware
4. **Safety** – Real-world failures have physical consequences

---

## 2. Reinforcement Learning for Robot Control

### RL in Isaac Lab

**Isaac Lab** provides a GPU-accelerated framework for training RL policies:

```
┌─────────────────────────────────────────────────────────────────┐
│                   Isaac Lab RL Pipeline                         │
├─────────────────────────────────────────────────────────────────┤
│  Environment Design → Reward Design → Policy Training          │
│       ↓                    ↓                    ↓               │
│  USD Scene           Reward Functions     PPO/SAC/Actor-Critic │
│  Robot Assets        (Task-specific)      (GPU-parallelized)   │
│       ↓                    ↓                    ↓               │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │           Vectorized Environments (1000s parallel)       │   │
│  └─────────────────────────────────────────────────────────┘   │
│       ↓                                                         │
│  Policy Export → TensorRT → Jetson Deployment                  │
└─────────────────────────────────────────────────────────────────┘
```

### Key Components

| Component | Description |
|-----------|-------------|
| **Environment Design** | Manager-based or direct workflows; procedural terrain |
| **Reward Functions** | Task-specific rewards (tracking, efficiency, stability) |
| **Observation Space** | Joint states, IMU, depth, images |
| **Action Space** | Joint positions, velocities, torques |
| **Training Algorithms** | PPO, SAC, TD3 with GPU acceleration |

### Example: RL Task Configuration

```python
# Locomotion task configuration
from isaaclab.envs import ManagerBasedRLEnvCfg
from isaaclab.scene import InteractiveSceneCfg
from isaaclab.sensors import ContactSensorCfg, ImuSensorCfg
from isaaclab.actuators import ImplicitActuatorCfg

class BipedLocomotionCfg(ManagerBasedRLEnvCfg):
    # Scene setup
    scene: InteractiveSceneCfg = InteractiveSceneCfg(
        num_envs=4096,
        env_spacing=2.0
    )
    
    # Sensors
    sensors: dict = {
        "imu": ImuSensorCfg(
            prim_path="{ENV_REGEX_NS}/Robot/base_link",
            update_period=0.005
        ),
        "contact": ContactSensorCfg(
            prim_path="{ENV_REGEX_NS}/Robot/.*_foot",
        )
    }
    
    # Actuators
    actuators: dict = {
        "legs": ImplicitActuatorCfg(
            joint_names_expr=[".*_hip", ".*_knee", ".*_ankle"],
            effort_limit=100.0,
            velocity_limit=10.0,
        )
    }
    
    # Reward terms
    rewards: dict = {
        "tracking_lin_vel": {"weight": 2.0, "params": {"std": 0.5}},
        "tracking_ang_vel": {"weight": 1.0, "params": {"std": 0.5}},
        "penalize_torque": {"weight": -0.0001},
        "penalize_slip": {"weight": -0.1},
        "base_height": {"weight": -1.0, "params": {"target": 0.8}},
    }
```

### Training Best Practices

| Practice | Rationale |
|----------|-----------|
| **Start simple** | Begin with basic tasks; add complexity gradually |
| **Domain randomization** | Randomize physics parameters during training |
| **Curriculum learning** | Progressively increase task difficulty |
| **Early stopping** | Monitor validation; prevent overfitting to simulation |
| **Ensemble policies** | Train multiple policies for robustness |

---

## 3. Domain Randomization Techniques

### Comprehensive DR Framework

Domain randomization has evolved into a rigorous framework for sim-to-real transfer:

### Visual Domain Randomization

| Parameter | Randomization Range | Purpose |
|-----------|--------------------|---------|
| **Textures** | Flat colors, gradients, Perlin noise | Force shape-based recognition |
| **Lighting** | 100-2000 lux; 0-360° direction | Robustness to illumination changes |
| **Camera** | ±15° position; ±10° angle | Viewpoint invariance |
| **Backgrounds** | 50+ HDRI environments | Scene context diversity |

### Physics & Dynamics Randomization

| Parameter | Randomization Range | Purpose |
|-----------|--------------------|---------|
| **Mass** | ±20% of nominal | Robustness to payload variations |
| **Friction** | 0.3-1.0 coefficient | Surface adaptation |
| **Joint damping** | 0.5-2.0x nominal | Actuator model uncertainty |
| **Link lengths** | ±2% | Manufacturing tolerances |
| **Motor gains** | 0.8-1.2x | Controller tuning variations |

### Advanced DR Methods

| Method | Description | When to Use |
|--------|-------------|-------------|
| **Adaptive DR** | Bayesian optimization of randomization ranges | When manual tuning is impractical |
| **Adversarial DR** | Generate challenging scenarios (DeceptionNet) | For robustness to worst-case |
| **Sequential DR** | Incrementally introduce variability | To prevent catastrophic forgetting |
| **Distilled DR** | Train teacher policies; distill to single policy | For multi-task deployment |
| **Offline DR** | Fit distribution using real-world data | When some real data is available |

### Implementation Example

```python
# Domain randomization configuration
from isaaclab.utils import configclass

@configclass
class DomainRandomizationCfg:
    """Configuration for domain randomization."""
    
    # Physics randomization
    physics: dict = {
        "mass": {"type": "uniform", "range": (0.8, 1.2)},
        "friction": {"type": "uniform", "range": (0.3, 1.0)},
        "restitution": {"type": "uniform", "range": (0.0, 0.3)},
        "joint_damping": {"type": "uniform", "range": (0.5, 2.0)},
    }
    
    # Visual randomization (for vision-based policies)
    visual: dict = {
        "light_intensity": {"type": "uniform", "range": (100, 2000)},
        "light_azimuth": {"type": "uniform", "range": (0, 360)},
        "light_elevation": {"type": "uniform", "range": (30, 90)},
        "background_texture": {"type": "choice", "options": 50},
    }
    
    # Sensor randomization
    sensors: dict = {
        "imu_noise": {"type": "gaussian", "std": 0.01},
        "joint_noise": {"type": "gaussian", "std": 0.001},
        "camera_delay": {"type": "uniform", "range": (0, 0.05)},
    }
    
    # Randomization schedule
    schedule: dict = {
        "type": "progressive",  # progressive | constant | adaptive
        "start_episode": 0,
        "ramp_episodes": 100,
        "final_scale": 1.0,
    }
```

### Design Trade-offs

| Trade-off | Consideration |
|-----------|---------------|
| **Rendering Fidelity vs. Volume** | High-quality renderings yield more robust transfer than vast quantities of low-fidelity images |
| **Breadth vs. Difficulty** | Randomizing all parameters at once can degrade performance; sequential exposure improves learning |
| **Performance vs. Robustness** | Increased randomization improves cross-domain robustness but may reduce optimality on any single platform |

---

## 4. Deploying to Jetson Orin

### Jetson Orin Platform Overview

| Model | GPU | VRAM | CPU | Power |
|-------|-----|------|-----|-------|
| **Orin Nano 4GB** | 512-core Ampere | 4GB | 6-core ARM | 7-15W |
| **Orin Nano 8GB** | 1024-core Ampere | 8GB | 6-core ARM | 7-15W |
| **Orin NX 8GB** | 1024-core Ampere | 8GB | 8-core ARM | 10-25W |
| **Orin NX 16GB** | 1024-core Ampere | 16GB | 8-core ARM | 10-25W |
| **Orin AGX 32GB** | 2048-core Ampere | 32GB | 12-core ARM | 15-60W |
| **Orin AGX 64GB** | 2048-core Ampere | 64GB | 12-core ARM | 15-60W |

### TensorRT Optimization

**TensorRT** is NVIDIA's high-performance DNN inference optimizer:

```
┌─────────────────────────────────────────────────────────────────┐
│                  TensorRT Optimization Pipeline                 │
├─────────────────────────────────────────────────────────────────┤
│  ONNX Model → Layer Fusion → Precision Calibration → Engine    │
│       ↓           ↓              ↓                ↓             │
│  Framework    Kernel       INT8/FP16       Optimized GPU       │
│  Agnostic     Optimization   Quantization     Binary (.engine)  │
└─────────────────────────────────────────────────────────────────┘
```

### Optimization Techniques

| Technique | Description | Speedup |
|-----------|-------------|---------|
| **Layer Fusion** | Combine operations (Conv+BN+ReLU) | 1.5-2x |
| **Precision Calibration** | FP16 or INT8 quantization | 2-4x (FP16), 4-8x (INT8) |
| **Kernel Auto-Tuning** | Select optimal CUDA kernels | 1.2-1.5x |
| **Multi-Stream** | Parallel inference streams | 1.5-2x |

### Example: Convert Model to TensorRT

```bash
# Convert ONNX to TensorRT engine
trtexec --onnx=model.onnx \
  --saveEngine=model.engine \
  --fp16 \
  --minShapes=input:1x3x224x224 \
  --optShapes=input:4x3x224x224 \
  --maxShapes=input:8x3x224x224 \
  --workspace=4096
```

### ROS 2 Integration on Jetson

```python
# TensorRT inference node for ROS 2
import rclpy
from rclpy.node import Node
from pycuda import cuda, autodevice
import tensorrt as trt

class TensorRTInferenceNode(Node):
    def __init__(self):
        super().__init__('tensorrt_inference_node')
        
        # Load TensorRT engine
        self.engine = self.load_engine('/models/policy.engine')
        self.context = self.engine.create_execution_context()
        
        # ROS 2 subscriptions
        self.sub = self.create_subscription(
            Image,
            '/camera/image',
            self.image_callback,
            10
        )
        
        # ROS 2 publishers
        self.pub = self.create_publisher(
            JointCommand,
            '/robot/joint_commands',
            10
        )
```

### Performance Optimization

| Optimization | Configuration |
|--------------|---------------|
| **Power Mode** | `sudo nvpmodel -m 0` (max performance) |
| **Clock Settings** | `sudo jetson_clocks` (max clocks) |
| **Memory** | Reserve 2GB for DNN; rest for ROS 2 |
| **Storage** | Use NVMe SSD for model loading |

---

## 🔧 Practical Exercise: Deploy Trained Policy to Jetson

### Exercise Overview

**Goal:** Deploy a locomotion policy trained in Isaac Lab to a Jetson Orin controlling a physical bipedal robot

### Step 1: Export Policy from Isaac Lab

```python
# export_policy.py
import torch
from isaaclab.utils.io import dump_pickle

# Load trained checkpoint
checkpoint = torch.load('locomotion_policy.pt', map_location='cpu')
policy = checkpoint['policy']

# Set to evaluation mode
policy.eval()

# Trace the policy for JIT compilation
example_obs = torch.randn(1, 64)  # Match your observation dimension
traced_policy = torch.jit.trace(policy, example_obs)

# Save traced model
torch.jit.save(traced_policy, 'traced_policy.pt')
print("Policy traced and saved")
```

### Step 2: Convert to TensorRT on Jetson

```bash
# SSH to Jetson
ssh jetson@192.168.1.100

# Create conversion script
cat > convert_policy.sh << 'EOF'
#!/bin/bash
# First convert to ONNX (on development machine)
# Then convert ONNX to TensorRT on Jetson

trtexec --onnx=policy.onnx \
  --saveEngine=policy.engine \
  --fp16 \
  --minShapes=obs:1x64 \
  --optShapes=obs:1x64 \
  --maxShapes=obs:4x64 \
  --workspace=2048

echo "Conversion complete"
EOF

chmod +x convert_policy.sh
./convert_policy.sh
```

### Step 3: Create ROS 2 Inference Package

```bash
# Create package structure
mkdir -p ~/ros2_ws/src/robot_inference
cd ~/ros2_ws/src/robot_inference

# Create package.xml, setup.py, and inference node
# (See full implementation in Week 9 practical exercise)
```

### Step 4: Integration with Physical Robot

```python
# robot_control_node.py
import rclpy
from rclpy.node import Node
from sensor_msgs.msg import JointState
from std_msgs.msg import Float32MultiArray

class RobotControlNode(Node):
    def __init__(self):
        super().__init__('robot_control_node')
        
        # Load TensorRT policy
        self.policy = self.load_trt_engine('/home/user/models/policy.engine')
        
        # Subscribers
        self.joint_sub = self.create_subscription(
            JointState,
            '/robot/joint_states',
            self.joint_state_callback,
            10
        )
        
        # Publishers
        self.cmd_pub = self.create_publisher(
            Float32MultiArray,
            '/robot/joint_commands',
            10
        )
        
        self.latest_state = None
    
    def joint_state_callback(self, msg):
        self.latest_state = msg
        
        # Prepare observation
        observation = self.prepare_observation(msg)
        
        # Run policy inference
        action = self.policy.infer(observation)
        
        # Publish commands
        cmd_msg = Float32MultiArray()
        cmd_msg.data = action.tolist()
        self.cmd_pub.publish(cmd_msg)
```

### Safety Considerations

| Safety Measure | Implementation |
|----------------|----------------|
| **E-Stop** | Hardware and software emergency stop |
| **Joint Limits** | Software limits in controller |
| **Force Monitoring** | Torque sensors with thresholds |
| **Supervised Testing** | Human operator ready to intervene |
| **Gradual Deployment** | Teleop → Supervised → Autonomous |

---

## 📝 Summary

### Key Takeaways

- **Sim-to-Real Gap** – Arises from appearance, physics, sensor, and environment differences
- **RL in Isaac Lab** – GPU-accelerated training with domain randomization for robustness
- **Domain Randomization** – Systematic parameter variation bridges the reality gap
- **Jetson Deployment** – TensorRT optimization enables real-time inference on edge hardware
- **Full Pipeline** – Complete workflow from simulation training to physical deployment

### Part 4 Complete!

You've completed the NVIDIA Isaac Platform section. You now understand:
- Isaac Sim for photorealistic simulation
- Isaac ROS for GPU-accelerated perception
- Sim-to-real transfer techniques
- Jetson deployment with TensorRT optimization

In Part 5, you'll apply this knowledge to humanoid robot development — kinematics, locomotion, manipulation, and human-robot interaction.

---

## 📚 References

1. **A Survey of Sim-to-Real Methods in RL** – arXiv:2502.13187, February 2025.  
   URL: https://arxiv.org/abs/2502.13187

2. **Domain Randomization in Machine Learning** – Emergent Mind, July 2025.  
   URL: https://www.emergentmind.com/topics/domain-randomization

3. **TensorRT and Triton for DNN Inference** – NVIDIA Corporation, Release 3.1, 2025.  
   URL: https://nvidia-isaac-ros.github.io/concepts/dnn_inference/tensorrt_and_triton_info.html

4. **Isaac Lab Documentation** – Isaac Lab Team, 2025.  
   URL: https://isaac-sim.github.io/IsaacLab/main/

5. **Isaac Sim Release Notes** – NVIDIA Corporation, Version 5.1.0, January 2026.  
   URL: https://docs.isaacsim.omniverse.nvidia.com/5.1.0/overview/release_notes.html
