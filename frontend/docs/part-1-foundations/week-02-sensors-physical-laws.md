---
sidebar_position: 2
title: "Week 2: Sensors & Physical Laws"
description: "Learn how robots perceive the physical world through LiDAR, cameras, IMUs, force sensors, and understand physical laws"
tags: [sensors, lidar, rgb-d, imu, force-torque, sensor-fusion, robotics-perception]
---

# Week 2: Sensors & Physical Laws

## 🎯 Learning Objectives

By the end of this chapter, you will be able to:

- Explain how LiDAR sensors generate 3D point clouds using time-of-flight
- Compare RGB-D camera technologies: structured light, time-of-flight, active stereo
- Understand how IMUs measure acceleration and angular velocity using MEMS
- Describe how 6-axis force/torque sensors use strain gauges
- Explain how robots model gravity, friction, and collisions
- Understand sensor fusion pipelines using Kalman filters

---

## Introduction

In Week 1, we learned that Physical AI operates through a **Perceive → Think → Act** loop. This week, we dive deep into the **Perception** stage — how robots sense and understand their physical environment.

Without sensors, a robot is just a computer with motors. Sensors are the robot's window to the physical world, providing the raw data that intelligence systems process into understanding and action.

This week covers six critical topics:
1. **LiDAR** — 3D mapping with laser pulses
2. **RGB-D Cameras** — Depth perception using light patterns
3. **IMUs** — Measuring acceleration and orientation
4. **Force/Torque Sensors** — Tactile feedback for manipulation
5. **Physical Laws** — How robots model gravity, friction, and collisions
6. **Sensor Fusion** — Combining multiple sensors for accurate state estimation

---

## 1. LiDAR Sensors

### Working Principle

**LiDAR** (Light Detection and Ranging) generates 3D point clouds using **time-of-flight** measurement:

```
1. Laser emission → Emits laser beams across defined angles
2. Reflection detection → Detects reflections from objects
3. Range calculation → Distance = (Speed of Light × Time Delay) / 2
4. Point cloud output → 3D coordinates relative to sensor
```

### Data Format

```typescript
// Point Cloud Data Structure
interface PointCloud {
  location: number[][];    // M×3 matrix: [[x1,y1,z1], [x2,y2,z2], ...]
  intensity?: number[];    // Optional: return signal strength (0-255)
  ring?: number[];         // Optional: laser ring index
}

// Example: 1000 points
{
  location: [
    [1.23, 4.56, 0.12],
    [1.25, 4.58, 0.15],
    // ... 998 more points
  ],
  intensity: [180, 175, ...]
}
```

### Typical Specifications

| Parameter | Typical Range |
|-----------|---------------|
| **Max Range** | 50–200 m |
| **Range Accuracy** | 1–50 mm |
| **Update Rate** | 10–100 Hz |
| **Field of View** | 360° × [−20°, 20°] |

### Applications

- **SLAM**: Real-time mapping and localization
- **Obstacle Avoidance**: Detecting nearby obstacles
- **Navigation**: Path planning in dynamic environments

### Advantages & Limitations

| Advantages | Limitations |
|------------|-------------|
| High accuracy (mm-level) | Expensive vs. cameras |
| Works in complete darkness | Struggles with reflective surfaces |
| Direct 3D measurement | Large data volume |
| Long range (100m+) | Cannot detect color/texture |

---

## 2. RGB-D Cameras

### Working Principle

**RGB-D cameras** combine standard RGB imaging with depth sensing using three technologies:

**A. Structured Light**
- IR projector emits known pattern (grid/stripe)
- Camera observes pattern deformation
- Depth calculated via triangulation
- **Accuracy**: Sub-millimeter at close range (0.5–5m)

**B. Time-of-Flight (ToF)**
- IR emitter sends modulated light pulses
- Sensor measures phase shift of reflected light
- **Advantage**: Real-time, works in variable lighting

**C. Active Stereo Vision**
- Two IR cameras + dot pattern projector
- Depth from disparity (like human binocular vision)
- **Advantage**: Works outdoors

### Intel RealSense D435 Specifications

| Parameter | Value |
|-----------|-------|
| **Technology** | Active Stereoscopic |
| **Depth Resolution** | 1280 × 720 @ 30 fps |
| **RGB Resolution** | 1920 × 1080 |
| **Operating Range** | 0.3m – 3m |
| **Interface** | USB 3.0 Type-C |

### Applications

| Application | Technology | Why |
|-------------|------------|-----|
| Pick-and-Place | Structured Light | Millimeter precision |
| Collision Avoidance | ToF | Real-time, low latency |
| Outdoor Navigation | Active Stereo | Works in sunlight |

---

## 3. IMUs (Inertial Measurement Units)

### Working Principle

IMUs operate on **Newton's laws of motion**:

**Accelerometers** (Linear Acceleration)
- Mass suspended by spring within receptacle
- Displacement proportional to acceleration (F = ma)
- Tri-axial: three orthogonal sensors

**Gyroscopes** (Angular Velocity)
- Based on **Coriolis acceleration principle**
- Vibrating mass experiences force during rotation
- Angular position via integration: `θ = ∫ω dt`

**Magnetometers** (Magnetic Field)
- Measures Earth's magnetic field vector
- Provides absolute orientation reference (magnetic north)
- Corrects gyroscope drift

### Data Format

```typescript
interface IMUData {
  timestamp: number;
  accelerometer: {
    x: number; y: number; z: number;  // m/s²
  };
  gyroscope: {
    x: number; y: number; z: number;  // rad/s
  };
  magnetometer?: {
    x: number; y: number; z: number;  // μT
  };
}

// Example output
{
  timestamp: 1709567890123456,
  accelerometer: { x: 0.02, y: -0.01, z: 9.81 },
  gyroscope: { x: 0.05, y: -0.02, z: 0.01 },
  magnetometer: { x: 20.5, y: -5.2, z: 45.1 }
}
```

### Applications

- **Drone Stabilization**: Attitude estimation for flight control
- **Legged Robot Balance**: Orientation for dynamic locomotion
- **Human Motion Tracking**: Rehabilitation, sports analysis
- **Dead Reckoning**: Navigation when GPS unavailable

### The Drift Problem

IMUs accumulate error over time:
- Gyroscope drift: 1-50 °/hr
- Accelerometer bias changes with temperature
- **Solution**: Sensor fusion with other sensors (GPS, vision, LiDAR)

---

## 4. Force/Torque Sensors

### Working Principle

**6-axis force/torque sensors** use **strain gauge technology**:

```
1. Force applied → Sensor body deforms slightly
2. Strain gauges → Change resistance when stretched/compressed
3. Wheatstone bridge → Converts resistance to voltage
4. Signal processing → Computes Fx, Fy, Fz, Tx, Ty, Tz
```

**Measurement Axes:**
- **Fx, Fy, Fz**: Linear forces (push/pull)
- **Tx, Ty, Tz**: Torques (twisting moments)

### ATI Varo Specifications

| Parameter | Value |
|-----------|-------|
| **Force Range** | ±3000 N (Fx,Fy), ±6000 N (Fz) |
| **Torque Range** | ±120 Nm |
| **Force Resolution** | 0.29 N |
| **Torque Resolution** | 0.005 Nm |
| **Sample Rate** | 8 kHz |
| **Latency** | &lt;1 ms |

### Applications

| Industry | Application |
|----------|-------------|
| **Industrial Robotics** | Assembly, screwdriving, insertion |
| **Collaborative Robots** | Collision detection, safety |
| **Medical Robotics** | Surgical haptic feedback |
| **Humanoid Robots** | Grip force control, manipulation |

### Why Force Sensing Matters

Vision tells the robot *where* the object is. Force sensing tells the robot:
- How hard it's gripping
- Whether the object is slipping
- If it encountered an unexpected obstacle
- Whether the surface is hard or soft

---

## 5. Physical Laws in Robots

### Gravity Compensation

Robots must counteract gravity to move smoothly:

**Robot Dynamics Equation:**
```
τ = M(q)q̈ + C(q,q̇)q̇ + g(q) + τ_external
```

Where:
- `τ` = joint torque
- `M(q)` = inertia matrix
- `C(q,q̇)` = Coriolis/centrifugal terms
- `g(q)` = **gravity torque** (what we compensate)
- `τ_external` = external forces

**Gravity Compensation:**
```python
def gravity_compensation(robot_model, joint_positions, motor_kt):
    # Compute gravity torque using robot dynamics
    gravity_torque = compute_gravity(robot_model, joint_positions)
    
    # Convert torque to motor current: τ = Kt × I
    commanded_current = -gravity_torque / motor_kt
    
    return commanded_current
```

**Why it matters:** Without gravity compensation, a robot arm would drop when power is applied. Compensation allows:
- Smooth, precise motion
- Safe human interaction (robot can "go limp")
- Energy efficiency (only pay for motion, not holding position)

### Friction Models

**Coulomb Friction** (dry friction):
```
F_friction = μ × F_normal × sign(velocity)
```

**Viscous Friction** (fluid damping):
```
F_friction = b × velocity
```

**Combined Model:**
```
τ_friction = τ_coulomb × sign(q̇) + b × q̇
```

### Collision Detection

Detect unexpected contact for safety:

```python
def collision_detection(measured_torque, estimated_torque, threshold):
    external_torque = measured_torque - estimated_torque
    
    if abs(external_torque) > threshold:
        # Collision detected!
        enter_safe_mode()  # Stop or go limp
        return True
    return False
```

---

## 6. Sensor Fusion Pipeline

### Why Fuse Sensors?

No single sensor is perfect:
- **LiDAR**: Accurate 3D, but no color, expensive
- **Cameras**: Rich information, but no direct depth
- **IMU**: High frequency, but drifts over time
- **GPS**: Absolute position, but low frequency, indoor limitations

**Sensor fusion** combines multiple sensors to get the best of each.

### Kalman Filter Architecture

```
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│    LiDAR     │    │     IMU      │    │     GPS      │
│  (10-100Hz)  │    │  (200-1000Hz)│    │   (1-10Hz)   │
└──────┬───────┘    └──────┬───────┘    └──────┬───────┘
       │                   │                   │
       ▼                   ▼                   ▼
┌─────────────────────────────────────────────────────────┐
│              EXTENDED KALMAN FILTER (EKF)                │
│                                                          │
│  Predict: Use IMU (high frequency, short-term accurate) │
│  Update:  Use LiDAR/GPS (low frequency, long-term stable)│
│                                                          │
│  Output: Fused state estimate (position, velocity)      │
└─────────────────────────────────────────────────────────┘
```

### EKF Algorithm (Simplified)

```python
# Prediction step (using IMU)
state_predicted = predict_motion(state, imu_data, dt)
covariance_predicted = predict_uncertainty(covariance, imu_noise)

# Update step (using LiDAR or GPS)
innovation = measurement - predict_measurement(state_predicted)
kalman_gain = compute_optimal_gain(covariance_predicted, measurement_noise)
state_updated = state_predicted + kalman_gain × innovation
covariance_updated = (1 - kalman_gain) × covariance_predicted
```

### Real-World Example: Legged Robot State Estimation

| Sensor | Role | Frequency |
|--------|------|-----------|
| **IMU** | Primary orientation, high-frequency prediction | 500 Hz |
| **LiDAR** | Position correction, mapping | 10 Hz |
| **Joint Encoders** | Leg kinematics, contact detection | 200 Hz |
| **GPS** | Global position (outdoors) | 10 Hz |

**Result:** Accurate state estimate at 200 Hz with long-term stability from LiDAR/GPS.

---

## 🔧 Practical Exercise

### Sensor Selection Challenge

**Scenario:** You're designing a warehouse robot that must:
1. Navigate aisles with tall shelves (GPS unavailable indoors)
2. Detect and avoid workers walking between aisles
3. Pick up boxes (2-20 kg) from shelves at various heights
4. Operate 24/7 in varying lighting conditions

**Task:**

1. **Select sensors** for each requirement:
   - Navigation: Which sensors? Why?
   - Obstacle detection: Which sensors? Why?
   - Manipulation: Which sensors? Why?

2. **Design a sensor fusion architecture:**
   - Which sensor is primary for state estimation?
   - Which sensors provide corrections?
   - What frequency should your filter run?

3. **Identify challenges:**
   - What happens if LiDAR fails (dust, fog)?
   - How do you handle reflective shelves?
   - What if workers wear similar-colored uniforms?

**Deliverable:** 1-page sensor selection document with justification.

---

## 📝 Summary

### Key Takeaways

- **LiDAR**: 3D point clouds via time-of-flight; accurate, long-range, expensive; ideal for mapping and obstacle detection
- **RGB-D Cameras**: Depth + color via structured light, ToF, or active stereo; Intel RealSense is industry standard
- **IMUs**: Measure acceleration (accelerometers) and rotation (gyroscopes); high frequency but drift over time
- **Force/Torque Sensors**: Strain gauges measure 6-axis forces; essential for compliant manipulation and safety
- **Gravity Compensation**: Robots must counteract gravity using dynamics models; enables smooth, safe motion
- **Sensor Fusion**: Kalman filters combine multiple sensors (IMU + LiDAR + GPS) for accurate, robust state estimation

### Looking Ahead

In Part 2, we'll explore **ROS 2** — the middleware that connects all these sensors to AI algorithms and actuators. You'll learn how to build ROS 2 packages, create publisher/subscriber nodes, and bridge AI agents to robot controllers.

---

## 📚 References

1. **MathWorks.** "robotLidarPointCloudGenerator." Robotics System Toolbox Documentation.  
   URL: https://www.mathworks.com/help/robotics/ref/robotlidarpointcloudgenerator-system-object.html

2. **Intel Corporation.** "Intel RealSense Depth Camera D435 Specifications."  
   URL: https://www.intel.com/content/www/us/en/products/sku/128255/intel-realsense-depth-camera-d435/specifications.html

3. **Technaid.** "IMU Working Principles."  
   URL: https://www.technaid.com/publications/imu-working-principles/

4. **ATI Industrial Automation (Novanta).** "Varo Force/Torque Sensor Specifications."  
   URL: https://ati.novanta.com/product/varo-force-torque-sensor/

5. **Source Robotics.** "Gravity Compensation in Robotics." November 2024.  
   URL: https://source-robotics.com/blogs/blog/gravity-compensation-in-robotics

6. **arXiv.** "Multi-Sensor Fusion for Quadruped Robot State Estimation Using Invariant Filtering and Smoothing." 2025.  
   URL: https://arxiv.org/html/2504.20615v1

7. **AIMS Press.** "Collision detection and external force estimation for robot." 2024.  
   URL: https://www.aimspress.com/aimspress-data/electreng/2024/2/PDF/electreng-08-02-011.pdf
