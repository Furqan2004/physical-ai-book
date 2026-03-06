---
sidebar_position: 2
title: "Week 7: Advanced Simulation & Unity"
description: "Learn sensor simulation, Unity for high-fidelity visualization, ROS-Unity bridge, and human-robot interaction simulation"
tags: [gazebo-sensors, unity-robotics, ros-unity-bridge, hri-simulation, lidar-simulation]
---

# Week 7: Advanced Simulation & Unity

## 🎯 Learning Objectives

By the end of this chapter, you will be able to:

- Configure LiDAR, depth cameras, and IMU sensors in Gazebo
- Explain Unity's advantages over Gazebo for high-fidelity simulation
- Set up ROS-Unity bridge for bidirectional communication
- Understand design principles for human-robot interaction simulation
- Evaluate when to use Gazebo vs. Unity for specific use cases

---

## Introduction

Last week, you learned Gazebo fundamentals. This week, we dive into advanced topics: sensor simulation, Unity integration, and human-robot interaction (HRI) environments.

You'll discover:
- How to add realistic sensors (LiDAR, cameras, IMU) to your robot
- Why Unity offers superior graphics and lower latency for certain applications
- How to bridge ROS 2 with Unity for high-fidelity visualization
- Design principles for safe, predictable human-robot interaction

---

## 1. Sensor Simulation in Gazebo

### Overview

Gazebo provides comprehensive sensor simulation through plugins that publish ROS 2 messages. Sensors are configured within `<gazebo>` tags in URDF/Xacro files.

### LiDAR (Ray Sensor) Configuration

**URDF/Xacro Setup:**

```xml
<robot xmlns:xacro="http://www.ros.org/wiki/xacro">
  <xacro:macro name="lidar" params="prefix">
    
    <!-- LiDAR Link -->
    <link name="${prefix}_lidar_link">
      <visual>
        <geometry>
          <cylinder radius="0.05" length="0.04"/>
        </geometry>
      </visual>
      <collision>
        <geometry>
          <cylinder radius="0.05" length="0.04"/>
        </geometry>
      </collision>
      <inertial>
        <mass value="0.1"/>
        <inertia ixx="0.001" ixy="0" ixz="0" iyy="0.001" iyz="0" izz="0.001"/>
      </inertial>
    </link>

    <!-- LiDAR Joint -->
    <joint name="${prefix}_lidar_joint" type="fixed">
      <parent link="base_link"/>
      <child link="${prefix}_lidar_link"/>
      <origin xyz="0 0 0.2" rpy="0 0 0"/>
    </joint>

    <!-- Gazebo Sensor Plugin -->
    <gazebo reference="${prefix}_lidar_link">
      <sensor name="${prefix}_lidar" type="ray">
        <pose>0 0 0 0 0 0</pose>
        <visualize>true</visualize>
        <update_rate>10</update_rate>
        
        <ray>
          <scan>
            <horizontal>
              <samples>360</samples>
              <resolution>1</resolution>
              <min_angle>-3.14159</min_angle>
              <max_angle>3.14159</max_angle>
            </horizontal>
          </scan>
          <range>
            <min>0.10</min>
            <max>10.0</max>
            <resolution>0.01</resolution>
          </range>
          <noise>
            <type>gaussian</type>
            <mean>0.0</mean>
            <stddev>0.01</stddev>
          </noise>
        </ray>
        
        <plugin name="gazebo_ros_ray_sensor" filename="libgazebo_ros_ray_sensor.so">
          <ros>
            <namespace>/</namespace>
            <remapping>~/out:=scan</remapping>
          </ros>
          <output_type>sensor_msgs/LaserScan</output_type>
          <frame_name>${prefix}_lidar_link</frame_name>
        </plugin>
      </sensor>
    </gazebo>
    
  </xacro:macro>
</robot>
```

**Technical Specifications:**

| Parameter | Value |
|-----------|-------|
| **Topic** | `/scan` |
| **Message Type** | `sensor_msgs/msg/LaserScan` |
| **Update Rate** | 10 Hz |
| **Samples** | 360 (1° resolution) |
| **Range** | 0.10 m to 10.0 m |

### Depth Camera Configuration

```xml
<gazebo reference="${prefix}_depth_camera_link">
  <sensor name="${prefix}_depth_camera" type="depth">
    <pose>0 0 0 0 0 0</pose>
    <visualize>true</visualize>
    <update_rate>30</update_rate>
    
    <camera>
      <horizontal_fov>1.047</horizontal_fov>
      <image>
        <width>640</width>
        <height>480</height>
        <format>R8G8B8</format>
      </image>
      <clip>
        <near>0.05</near>
        <far>8.0</far>
      </clip>
    </camera>
    
    <plugin name="gazebo_ros_depth_camera" filename="libgazebo_ros_depth_camera.so">
      <ros>
        <namespace>/</namespace>
        <remapping>~/depth_image:=depth/image_raw</remapping>
        <remapping>~/camera_info:=depth/camera_info</remapping>
        <remapping>~/points:=depth/points</remapping>
      </ros>
      <frame_name>${prefix}_depth_camera_link</frame_name>
    </plugin>
  </sensor>
</gazebo>
```

**Technical Specifications:**

| Parameter | Value |
|-----------|-------|
| **Topics** | `/depth/image_raw`, `/depth/camera_info`, `/depth/points` |
| **Resolution** | 640×480 |
| **FOV** | 60° (1.047 rad) |
| **Range** | 0.05 m to 8.0 m |

### IMU Configuration

```xml
<gazebo reference="${prefix}_imu_link">
  <sensor name="${prefix}_imu_sensor" type="imu">
    <pose>0 0 0 0 0 0</pose>
    <visualize>true</visualize>
    <update_rate>100</update_rate>
    
    <plugin name="gazebo_ros_imu_sensor" filename="libgazebo_ros_imu_sensor.so">
      <ros>
        <namespace>/</namespace>
        <remapping>~/out:=imu/data</remapping>
      </ros>
      <frame_name>${prefix}_imu_link</frame_name>
    </plugin>
  </sensor>
</gazebo>
```

**Technical Specifications:**

| Parameter | Value |
|-----------|-------|
| **Topic** | `/imu/data` |
| **Message Type** | `sensor_msgs/msg/Imu` |
| **Update Rate** | 100 Hz |
| **Data** | Orientation, angular velocity, linear acceleration |

### Complete Sensor Topic Summary

| Sensor | Topic | Message Type | Frequency |
|--------|-------|--------------|-----------|
| LiDAR | `/scan` | `sensor_msgs/msg/LaserScan` | 10 Hz |
| Depth Camera | `/depth/image_raw` | `sensor_msgs/msg/Image` | 30 Hz |
| Depth Camera | `/depth/points` | `sensor_msgs/msg/PointCloud2` | 30 Hz |
| IMU | `/imu/data` | `sensor_msgs/msg/Imu` | 100 Hz |

### Verification Commands

```bash
# List all topics
ros2 topic list

# View LiDAR data
ros2 topic echo /scan

# View IMU data
ros2 topic echo /imu/data

# Visualize in RViz
rviz2
# Add: LaserScan (for /scan), PointCloud2 (for /depth/points)
```

---

## 2. Unity for High-Fidelity Visualization

### Advantages Over Gazebo

Unity, originally developed as a game engine, offers several advantages for robot simulation:

| Aspect | Unity | Gazebo |
|--------|-------|--------|
| **Graphical Quality** | High-fidelity, photorealistic | Functional, moderate |
| **Latency** | 77.67 ± 15.74 ms | 108.79 ± 57.65 ms |
| **Accuracy (MAE)** | 0.0002–0.1666° | 0.1401–0.3672° |
| **Cross-Platform** | PC, mobile, VR/AR, web | Desktop primarily |
| **Visual Effects** | Advanced lighting, shadows | Basic rendering |
| **Asset Library** | Extensive Asset Store | Limited model database |
| **VR/AR Support** | Native support | Limited |

### Performance Comparison

Research by Singh et al. (2025) compared Unity and Gazebo for digital twin development:

**Accuracy by Joint:**

| Joint | Unity MAE | Gazebo MAE | Improvement |
|-------|-----------|------------|-------------|
| Joint 1 | 0.0021° | 0.2795° | 99.25% |
| Joint 2 | 0.1666° | 0.3672° | 54.63% |
| Joint 3 | 0.0073° | 0.1401° | 94.79% |
| Joint 4 | 0.0023° | 0.1749° | 98.68% |
| Joint 5 | 0.0005° | 0.3361° | 99.85% |
| Joint 6 | 0.0002° | 0.1800° | 99.89% |

**Key Findings:**
- Unity showed **28.5% lower latency** than Gazebo
- Unity accuracy ranged from **99.91% to 99.99%**
- Unity maintained consistent performance across environment sizes
- Gazebo performance degraded in large environments

### When to Choose Unity

| Use Case | Rationale |
|----------|-----------|
| **Industrial Automation** | High accuracy critical for precision tasks |
| **Autonomous Vehicles** | Low latency essential for real-time decisions |
| **VR/AR Training** | Immersive visualization required |
| **Large Environments** | Consistent performance in factories, smart cities |
| **Multi-Platform Deployment** | Cross-platform capability (PC, mobile, AR/VR) |
| **Human-Robot Interaction** | High-fidelity visualization for user studies |

### Unity Limitations

| Limitation | Impact |
|------------|--------|
| **ROS Integration** | Requires middleware (ROS-TCP-Connector) |
| **Learning Curve** | Steeper for robotics developers |
| **Cost** | Enterprise licensing for commercial use |
| **Physics** | Good but less robotics-focused than Gazebo |
| **Setup Time** | More configuration for ROS communication |

---

## 3. ROS-Unity Bridge Setup

### Architecture Overview

```
┌─────────────────┐     TCP/IP      ┌─────────────────┐
│     Unity       │ ◄─────────────► │      ROS 2      │
│  TCP Connector  │    Port 10000   │    Endpoint     │
└─────────────────┘                 └─────────────────┘
       │                                   │
       ▼                                   ▼
  C# Scripts                         ROS 2 Nodes
  (Publishers/                     (Publishers/
   Subscribers)                     Subscribers)
```

### Requirements

| Component | Requirement |
|-----------|-------------|
| **Unity Version** | 2020 or newer |
| **ROS Version** | ROS 2 Humble, Iron, Jazzy |
| **Network** | TCP connection on port 10000 |

### Step 1: ROS 2 Endpoint Setup

**Install ROS-TCP-Endpoint:**

```bash
# Clone repository
cd ~/ros2_ws/src
git clone -b main-ros2 https://github.com/Unity-Technologies/ROS-TCP-Endpoint.git

# Build
cd ~/ros2_ws
colcon build
source install/setup.bash
```

**Launch Endpoint:**

```bash
# ROS 2 endpoint with custom IP
ros2 run ros_tcp_endpoint default_server_endpoint \
  --ros-args -p ROS_IP:=192.168.1.100 -p ROS_TCP_PORT:=10000
```

### Step 2: Unity Package Installation

1. **Open Unity** (2020+)

2. **Install ROS-TCP-Connector:**
   - Open **Package Manager** (Window → Package Manager)
   - Click **+** → **Add package from git URL**
   - Enter: `https://github.com/Unity-Technologies/ROS-TCP-Connector.git?path=/com.unity.robotics.ros-tcp-connector`

3. **Configure ROS Settings:**
   - Menu: `Robotics` → `ROS Settings`
   - Set **ROS IP Address** to match ROS machine IP
   - Switch protocol to **ROS2** for ROS 2

### Step 3: Unity C# Script Example

**Publisher Script (IMU):**

```csharp
using UnityEngine;
using RosMessageTypes.Sensor;
using Unity.Robotics.ROSTCPConnector;

public class ImuPublisher : MonoBehaviour
{
    ROSConnection ros;
    public string topicName = "imu/data";
    public float publishRate = 100f;
    private float publishTimer = 0f;

    void Start()
    {
        ros = ROSConnection.GetOrCreateInstance();
        ros.RegisterPublisher<ImuMsg>(topicName);
    }

    void Update()
    {
        publishTimer += Time.deltaTime;
        if (publishTimer >= 1f / publishRate)
        {
            publishTimer = 0f;
            PublishImuData();
        }
    }

    void PublishImuData()
    {
        ImuMsg imuMsg = new ImuMsg
        {
            header = new StdMsgs.HeaderMsg
            {
                stamp = new BuiltinInterfaces.Msgs.TimeMsg
                {
                    sec = (int)Time.time,
                    nanosec = (uint)((Time.time % 1) * 1e9)
                },
                frame_id = "imu_link"
            },
            orientation = new GeometryMsgs.QuaternionMsg
            {
                x = transform.rotation.x,
                y = transform.rotation.y,
                z = transform.rotation.z,
                w = transform.rotation.w
            },
            angular_velocity = new GeometryMsgs.Vector3Msg
            {
                x = GetComponent<Rigidbody>().angularVelocity.x,
                y = GetComponent<Rigidbody>().angularVelocity.y,
                z = GetComponent<Rigidbody>().angularVelocity.z
            }
        };

        ros.Publish(topicName, imuMsg);
    }
}
```

**Subscriber Script (Twist):**

```csharp
using UnityEngine;
using RosMessageTypes.Geometry;
using Unity.Robotics.ROSTCPConnector;

public class TwistSubscriber : MonoBehaviour
{
    ROSConnection ros;
    public string topicName = "cmd_vel";
    public float linearSpeed = 1f;
    public float angularSpeed = 1f;

    void Start()
    {
        ros = ROSConnection.GetOrCreateInstance();
        ros.Subscribe<TwistMsg>(topicName, OnTwistReceived);
    }

    void OnTwistReceived(TwistMsg twist)
    {
        float linear = twist.linear.x;
        float angular = twist.angular.z;

        // Apply movement
        transform.Translate(0, 0, linear * linearSpeed * Time.deltaTime);
        transform.Rotate(0, angular * angularSpeed * Time.deltaTime, 0);
    }
}
```

### Message Types Supported

| Category | Message Types |
|----------|---------------|
| **Standard** | Header, Time, Duration, String |
| **Geometry** | Point, Vector3, Quaternion, Pose, Transform |
| **Sensor** | Image, CameraInfo, Imu, LaserScan, PointCloud2 |
| **Navigation** | Odometry, Path, OccupancyGrid |
| **Control** | Twist, JointState |

---

## 4. Human-Robot Interaction Simulation

### Core Design Principles

Effective HRI simulation environments must incorporate these fundamental principles:

#### 1. Safety Principles

| Principle | Implementation |
|-----------|----------------|
| **Physical Safety** | Collision detection, force limiting, emergency stop |
| **Psychological Safety** | Predictable motions, appropriate distance, calm responses |
| **Human-in-the-Loop** | Adaptive control with human oversight |
| **Intervention** | Easy override mechanisms for human operators |

#### 2. Predictability

- **Consistent Behavior**: Avoid sudden, surprising motions
- **Pre-Action Signaling**: Use lights, sounds, or movement cues before acting
- **Role Clarity**: Define when human leads vs. robot leads
- **Stable Patterns**: Users trust robots with interpretable behavior

#### 3. Legibility

- **Interpretable Motion**: Smooth, purposeful movement paced to human expectations
- **Social Cues**: Nodding, pausing, eye contact (where appropriate)
- **Proxemics**: Respect personal space boundaries
- **Body Language**: Orientation, gestures, posture communicate status

#### 4. Transparency

- **Decision Visibility**: Reveal decision-making in human-friendly ways
- **Honest Representation**: Avoid deceptive emotional cues
- **Status Communication**: Clear feedback about what's happening
- **Listening Indicators**: Show when robot is processing input

#### 5. Feedback Mechanisms

| Modality | Examples |
|----------|----------|
| **Visual** | LEDs, displays, visual signals |
| **Audio** | Speech, sounds, 3D audio cues |
| **Haptic** | Vibration, force feedback |
| **Motion** | Body orientation, gestures |

### Gazebo for HRI Simulation

Gazebo supports HRI simulation through:

- **Human Models**: Import human meshes for collision testing
- **Social Force Plugins**: Simulate human crowd behavior
- **Safety Zones**: Define keep-out zones around humans
- **Sensor Simulation**: Test human detection with cameras, LiDAR

### Unity for HRI Simulation

Unity excels in HRI simulation due to:

- **High-Fidelity Humans**: Realistic human avatars with animations
- **VR/AR Integration**: Immersive user studies
- **Behavior Trees**: Complex human behavior modeling
- **Visual Feedback**: Rich visual and audio feedback systems

---

## 🔧 Practical Exercise: Compare Gazebo vs. Unity

### Objective
Evaluate Gazebo and Unity for a warehouse robot navigation use case.

### Scenario
Autonomous mobile robot (AMR) navigating a warehouse with:
- LiDAR for obstacle avoidance
- Camera for package recognition
- Human workers present
- ROS 2 navigation stack

### Evaluation Criteria

| Criterion | Weight | Description |
|-----------|--------|-------------|
| **ROS 2 Integration** | 25% | Ease of integration with navigation stack |
| **Sensor Accuracy** | 20% | LiDAR and camera data fidelity |
| **Visual Quality** | 15% | Realism for stakeholder presentations |
| **Performance** | 20% | Latency, frame rate, resource usage |
| **Development Effort** | 20% | Time to set up and configure |

### Gazebo Implementation

**Setup Time:** 2-4 hours

**Advantages:**
- ✅ Native ROS 2 integration (no middleware)
- ✅ Pre-built sensor plugins
- ✅ Direct compatibility with Nav2
- ✅ Free and open-source
- ✅ Extensive documentation

**Disadvantages:**
- ❌ Moderate visual quality
- ❌ Higher latency (~109 ms)
- ❌ Limited human model support

**Estimated Performance:**
- Latency: 100-120 ms
- Frame Rate: 30-60 FPS
- Sensor Accuracy: Good (suitable for algorithm testing)

### Unity Implementation

**Setup Time:** 6-10 hours

**Advantages:**
- ✅ High-fidelity graphics
- ✅ Lower latency (~78 ms)
- ✅ Excellent human avatars
- ✅ VR/AR support for user studies
- ✅ Cross-platform deployment

**Disadvantages:**
- ❌ Requires ROS-TCP-Connector middleware
- ❌ More setup complexity
- ❌ Enterprise licensing for commercial use

**Estimated Performance:**
- Latency: 70-90 ms
- Frame Rate: 60-90 FPS
- Sensor Accuracy: Excellent (99.9%+ accuracy)

### Comparison Results

| Criterion | Gazebo Score | Unity Score | Winner |
|-----------|--------------|-------------|--------|
| **ROS 2 Integration** | 9/10 | 6/10 | Gazebo |
| **Sensor Accuracy** | 8/10 | 10/10 | Unity |
| **Visual Quality** | 5/10 | 10/10 | Unity |
| **Performance** | 7/10 | 9/10 | Unity |
| **Development Effort** | 9/10 | 5/10 | Gazebo |
| **Weighted Total** | **8.15/10** | **7.65/10** | **Gazebo** |

### Recommendation

**For warehouse AMR development:**

**Primary Choice: Gazebo**
- Faster development cycle
- Native ROS 2 integration
- Sufficient for algorithm testing
- Cost-effective for research

**Secondary Choice: Unity**
- Use for stakeholder presentations
- VR/AR training modules
- Human-robot interaction studies
- Final deployment visualization

**Hybrid Approach:**
- Develop and test algorithms in Gazebo
- Transfer to Unity for high-fidelity visualization
- Use Unity for user studies and training

---

## 📝 Summary

### Key Takeaways

- **Gazebo Sensors**: Use `libgazebo_ros_*` plugins with proper topic remapping
- **Unity Advantage**: 28% lower latency, 99.9%+ accuracy, superior graphics
- **ROS-Unity Bridge**: Requires TCP endpoint; adds complexity but enables high-fidelity sim
- **HRI Principles**: Safety, predictability, legibility, transparency, feedback
- **Platform Choice**: Gazebo for development; Unity for visualization and user studies

### Platform Selection Guide

```
┌─────────────────────────────────────────────────────────────┐
│              PLATFORM SELECTION GUIDE                        │
├─────────────────────────────────────────────────────────────┤
│  CHOOSE GAZEBO IF:                                          │
│  • ROS 2 integration is primary requirement                 │
│  • Budget constraints (need open-source)                    │
│  • Robotics-focused algorithm development                   │
│  • Sensor simulation critical                               │
│  • Smaller-scale environments                               │
├─────────────────────────────────────────────────────────────┤
│  CHOOSE UNITY IF:                                           │
│  • Visual fidelity is critical                              │
│  • Real-time performance matters (latency <80ms)            │
│  • High accuracy required (>99.9%)                          │
│  • Large-scale environments                                 │
│  • VR/AR or cross-platform deployment needed                │
│  • Human-robot interaction studies                          │
└─────────────────────────────────────────────────────────────┘
```

### Looking Ahead

In Part 4, you'll explore the NVIDIA Isaac Platform — a GPU-accelerated simulation environment for advanced robotics development with photorealistic rendering and AI training capabilities.

---

## 📚 References

1. **Singh, M. et al.** (2025). "Comparative Study of Digital Twin Developed in Unity and Gazebo." *Electronics*, 14(2), 276.  
   URL: https://doi.org/10.3390/electronics14020276

2. **Unity Technologies.** "Unity Robotics Hub - ROS-Unity Integration." GitHub.  
   URL: https://github.com/Unity-Technologies/Unity-Robotics-Hub

3. **Interaction Design Foundation.** "What is Human-Robot Interaction (HRI)?"  
   URL: https://www.interaction-design.org/literature/topics/human-robot-interaction

4. **Open Robotics.** "Gazebo Sensor Plugins." Gazebo Documentation.  
   URL: https://gazebosim.org/docs/latest/

5. **Robotics SnowCron.** "ROS2 Navigation: Setting up Robot."  
   URL: https://robotics.snowcron.com/robotics_ros2/nav_sensors_gazebo.htm
