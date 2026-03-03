---
sidebar_position: 1
title: "Week 6: Gazebo Simulation Setup"
description: "Learn Gazebo simulator installation, URDF vs SDF, physics configuration, and how to spawn robots in simulation worlds"
tags: [gazebo, robot-simulation, urdf, sdf, physics-simulation, ros2-gazebo]
---

# Week 6: Gazebo Simulation Setup

## 🎯 Learning Objectives

By the end of this chapter, you will be able to:

- Explain what Gazebo is and why it's the standard for robot simulation
- Install Gazebo Sim (Harmonic) on Ubuntu 22.04 with ROS 2 Humble
- Distinguish between URDF and SDF formats and know when to use each
- Configure physics properties: gravity, collisions, and rigid body dynamics
- Create launch files to spawn robots in Gazebo worlds
- Build a complete differential drive robot simulation

---

## Introduction

Welcome to the world of **robot simulation**! Before deploying code to real robots, simulation allows you to test algorithms safely, cheaply, and rapidly. This week, you'll learn Gazebo — the industry-standard 3D robotics simulator that has been the backbone of robot development since 2002.

Gazebo provides:
- **Physics simulation** — realistic rigid body dynamics
- **Sensor simulation** — cameras, LiDAR, IMU with noise models
- **3D graphics** — visualize your robot in virtual worlds
- **ROS 2 integration** — seamless communication with your ROS 2 nodes

By the end of this chapter, you'll have created a complete simulation environment with a differential drive robot navigating a warehouse world.

---

## 1. What is Gazebo and Why It's Used

### History and Evolution

**Gazebo** is an open-source 3D robotics simulator originally developed at the University of Southern California in 2002. It was later acquired by **Open Robotics** (now Intrinsic) and became the default simulator for ROS.

In 2020, Open Robotics announced a next-generation simulator built on the **Ignition Framework**, now called **Gazebo Sim** (part of the Gazebo Harmonic/Jetty release line). The original simulator is now referred to as **Gazebo Classic** (with Gazebo 11 being the final version).

### Capabilities

| Capability | Description |
|------------|-------------|
| **Physics Simulation** | Multiple engines (ODE, DART, Bullet, Simbody) for accurate dynamics |
| **Sensor Simulation** | Cameras, LiDAR, IMU, GPS with realistic noise models |
| **Graphics Rendering** | 3D visualization with lighting, shadows, textures |
| **Robot Modeling** | Support for URDF and SDF robot description formats |
| **ROS Integration** | Native ROS and ROS 2 communication via plugins |
| **World Building** | Create complex environments with terrain and objects |
| **Plugin System** | Extensible architecture for custom behaviors |

### ROS 2 Integration

Gazebo integrates seamlessly with ROS 2 through the `gazebo_ros_pkgs` package:

- **Launch Integration**: Launch Gazebo directly from ROS 2 launch files
- **Model Spawning**: Spawn robot models using ROS 2 services
- **Topic Communication**: Bidirectional message passing between ROS 2 and Gazebo
- **Simulation Control**: Time management, pause/resume, reset

---

## 2. Installation Guide (Ubuntu 22.04)

### Gazebo Classic vs. Gazebo Sim

| Feature | Gazebo Classic (Gazebo 11) | Gazebo Sim (Harmonic) |
|---------|---------------------------|----------------------|
| **Status** | End-of-life (legacy) | Active development (LTS until 2030) |
| **ROS 2 Support** | ROS 2 Foxy, Galactic, Humble | ROS 2 Humble, Iron, Jazzy |
| **Physics Engine** | ODE (primary) | Multiple (DART, ODE, Bullet, TPE) |
| **Rendering** | OGRE | OGRE2, IGN Rendering |
| **Recommendation** | Legacy projects only | **All new projects** |

### Installation: Gazebo Sim with ROS 2 Humble

**Step 1: Update System**
```bash
sudo apt update
sudo apt upgrade -y
sudo apt install software-properties-common -y
sudo add-apt-repository universe
```

**Step 2: Install ROS 2 Humble** (if not already installed)
```bash
sudo apt install curl -y
curl -sSL https://raw.githubusercontent.com/ros/rosdistro/master/ros.key | sudo apt-key add -
sudo sh -c 'echo "deb http://packages.ros.org/ros2/ubuntu $(lsb_release -cs) main" > /etc/apt/sources.list.d/ros2-latest.list'
sudo apt update
sudo apt install ros-humble-desktop -y
source /opt/ros/humble/setup.bash
```

**Step 3: Install Gazebo Sim (Harmonic)**
```bash
# Add Gazebo repository
sudo curl https://packages.osrfoundation.org/gazebo.gpg --output /usr/share/keyrings/pkgs-osrf-archive-keyring.gpg

echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/pkgs-osrf-archive-keyring.gpg] http://packages.osrfoundation.org/gazebo/ubuntu-stable $(lsb_release -cs) main" | sudo tee /etc/apt/sources.list.d/gazebo-stable.list > /dev/null

sudo apt update

# Install Gazebo Harmonic
sudo apt install gz-harmonic -y
```

**Step 4: Install ROS 2 Gazebo Packages**
```bash
sudo apt install ros-humble-gazebo-ros-pkgs -y
sudo apt install ros-humble-ros-gz -y
```

**Step 5: Verify Installation**
```bash
# Check Gazebo version
gz sim --version

# Check ROS 2 Gazebo packages
ros2 pkg prefix gazebo_ros

# Launch Gazebo
gz sim empty.sdf
```

**Expected Output:**
```
Gazebo Sim version 8.x.x
```

---

## 3. URDF vs. SDF Comparison

### Overview

| Aspect | URDF | SDF |
|--------|------|-----|
| **Origin** | Developed for ROS | Developed for Gazebo |
| **Scope** | Single robot model only | Complete world with multiple models |
| **Structure** | XML with attributes | XML with elements |
| **Pose Specification** | Limited (relative to parent) | Full pose with `@relative_to` |
| **Joint Loops** | Not supported (tree only) | Supported (parallel linkages) |
| **World Elements** | Not supported | Lights, terrain, atmosphere |

### When to Use Each

**Use URDF When:**
- Working primarily within ROS ecosystem
- Describing a single robot
- Leveraging existing ROS URDF packages
- Using `robot_state_publisher` for TF transforms

**Use SDF When:**
- Creating complete simulation worlds
- Modeling multiple robots
- Requiring advanced physics features
- Using Gazebo Sim without ROS
- Needing parallel linkages or closed chains

### URDF to SDF Conversion

Gazebo automatically converts URDF to SDF. Manual conversion:

```bash
# Convert URDF to SDF
gz sdf -p robot.urdf > robot.sdf
```

### Xacro for Parametric URDF

Xacro (XML Macros) extends URDF with variables and macros:

```xml
<?xml version="1.0"?>
<robot xmlns:xacro="http://www.ros.org/wiki/xacro" name="simple_robot">

<xacro:property name="base_length" value="0.5"/>
<xacro:property name="base_radius" value="0.4"/>

<link name="base_link">
  <visual>
    <geometry>
      <cylinder length="${base_length}" radius="${base_radius}"/>
    </geometry>
  </visual>
</link>

</robot>
```

---

## 4. Physics Configuration

### Physics Engine Selection

| Engine | Characteristics | Best For |
|--------|----------------|----------|
| **ODE** | Fast, stable, well-tested | General robotics, mobile bases |
| **DART** | Accurate, advanced features | Manipulators, complex dynamics |
| **Bullet** | Good collision detection | Games, visual simulations |
| **Simbody** | High accuracy, intensive | Research, precise dynamics |
| **TPE** (Gazebo Sim) | Deterministic, real-time | Hardware-in-the-loop |

### Gravity Configuration

Set gravity in the world file (SDF):

```xml
<world name="default">
  <physics type="ode">
    <gravity>0 0 -9.81</gravity>
  </physics>
</world>
```

### Rigid Body Dynamics

Every link requires proper inertial properties:

```xml
<link name="base_link">
  <inertial>
    <!-- Center of mass (relative to link frame) -->
    <origin xyz="0 0 0.1" rpy="0 0 0"/>
    <!-- Mass in kilograms -->
    <mass value="2.5"/>
    <!-- Inertia tensor (kg·m²) -->
    <inertia 
      ixx="0.05" ixy="0.0" ixz="0.0"
      iyy="0.05" iyz="0.0"
      izz="0.08"/>
  </inertial>
</link>
```

**Critical Requirements:**
- Mass must be **greater than zero** (zero-mass links are ignored)
- Principal moments of inertia (ixx, iyy, izz) must be **non-zero**
- Units: **meters** and **kilograms** (per ROS REP 103)

### Collision Configuration

```xml
<link name="wheel_link">
  <collision>
    <origin xyz="0 0 0" rpy="0 0 0"/>
    <geometry>
      <cylinder radius="0.1" length="0.05"/>
    </geometry>
  </collision>
  
  <gazebo reference="wheel_link">
    <!-- Friction coefficients -->
    <mu1>0.8</mu1>
    <mu2>0.8</mu2>
    <!-- Contact stiffness and damping -->
    <kp>1000000.0</kp>
    <kd>1.0</kd>
  </gazebo>
</link>
```

### Physics Parameters Reference

| Parameter | Symbol | Typical Value | Description |
|-----------|--------|---------------|-------------|
| Friction Coefficient 1 | μ₁ | 0.5–1.0 | Primary direction friction |
| Friction Coefficient 2 | μ₂ | 0.5–1.0 | Secondary direction friction |
| Contact Stiffness | kₚ | 10⁵–10⁷ | Spring constant for contacts |
| Contact Damping | k<sub>d</sub> | 0.1–10.0 | Damping for contact forces |
| Max Velocity | v<sub>max</sub> | 0.1–10.0 m/s | Maximum correction velocity |

---

## 5. Spawning a Robot in Gazebo

### Method 1: ROS 2 Launch File (Recommended)

**Launch File Structure:**

```python
# launch/gazebo_spawn.launch.py
import os
from ament_index_python.packages import get_package_share_directory
from launch import LaunchDescription
from launch.actions import IncludeLaunchDescription
from launch.launch_description_sources import PythonLaunchDescriptionSource
from launch_ros.actions import Node
import xacro

def generate_launch_description():
    
    package_name = 'my_robot_description'
    robot_name = 'my_robot'
    
    # Resolve paths
    urdf_path = os.path.join(
        get_package_share_directory(package_name),
        'urdf', 'robot.xacro'
    )
    world_path = os.path.join(
        get_package_share_directory(package_name),
        'worlds', 'empty.world'
    )
    
    # Parse Xacro to URDF
    robot_description = xacro.process_file(urdf_path).toxml()
    
    # Launch Gazebo with world
    gazebo_launch = IncludeLaunchDescription(
        PythonLaunchDescriptionSource(
            os.path.join(
                get_package_share_directory('gazebo_ros'),
                'launch', 'gazebo.launch.py'
            )
        ),
        launch_arguments={'world': world_path}.items()
    )
    
    # Robot State Publisher
    robot_state_publisher = Node(
        package='robot_state_publisher',
        executable='robot_state_publisher',
        parameters=[{
            'robot_description': robot_description,
            'use_sim_time': True
        }]
    )
    
    # Spawn Entity
    spawn_entity = Node(
        package='gazebo_ros',
        executable='spawn_entity.py',
        arguments=[
            '-topic', 'robot_description',
            '-entity', robot_name
        ],
        output='screen'
    )
    
    return LaunchDescription([
        gazebo_launch,
        robot_state_publisher,
        spawn_entity
    ])
```

### World File Structure (SDF)

```xml
<?xml version="1.0"?>
<sdf version="1.7">
  <world name="my_world">
    
    <!-- Physics configuration -->
    <physics type="ode">
      <gravity>0 0 -9.81</gravity>
    </physics>
    
    <!-- Include standard models -->
    <include>
      <uri>model://sun</uri>
    </include>
    
    <include>
      <uri>model://ground_plane</uri>
    </include>
    
  </world>
</sdf>
```

---

## 🔧 Practical Exercise: Create a Gazebo World and Spawn a Robot

### Objective
Create a complete Gazebo simulation environment with a differential drive robot.

### Step 1: Create Package Structure

```bash
# Create workspace
mkdir -p ~/ws_simulation/src
cd ~/ws_simulation

# Create package
ros2 pkg create --build-type ament_python my_robot_simulation \
  --dependencies gazebo_ros xacro robot_state_publisher

# Create directories
cd src/my_robot_simulation/my_robot_simulation
mkdir -p urdf worlds launch
```

### Step 2: Create Robot URDF (Xacro)

**File:** `urdf/diff_drive_robot.xacro`

```xml
<?xml version="1.0"?>
<robot xmlns:xacro="http://www.ros.org/wiki/xacro" name="diff_drive_robot">

  <xacro:property name="base_length" value="0.4"/>
  <xacro:property name="base_width" value="0.3"/>
  <xacro:property name="base_height" value="0.15"/>
  <xacro:property name="wheel_radius" value="0.08"/>
  <xacro:property name="wheel_width" value="0.04"/>
  <xacro:property name="wheel_separation" value="0.35"/>

  <!-- Base Link -->
  <link name="base_link">
    <visual>
      <geometry>
        <box size="${base_length} ${base_width} ${base_height}"/>
      </geometry>
      <material name="blue"/>
    </visual>
    <collision>
      <geometry>
        <box size="${base_length} ${base_width} ${base_height}"/>
      </geometry>
    </collision>
    <inertial>
      <mass value="5.0"/>
      <inertia ixx="0.1" ixy="0" ixz="0" iyy="0.1" iyz="0" izz="0.15"/>
    </inertial>
  </link>

  <!-- Left Wheel -->
  <link name="left_wheel_link">
    <visual>
      <geometry>
        <cylinder radius="${wheel_radius}" length="${wheel_width}"/>
      </geometry>
    </visual>
    <collision>
      <geometry>
        <cylinder radius="${wheel_radius}" length="${wheel_width}"/>
      </geometry>
    </collision>
    <inertial>
      <mass value="0.5"/>
      <inertia ixx="0.001" ixy="0" ixz="0" iyy="0.001" iyz="0" izz="0.002"/>
    </inertial>
  </link>

  <joint name="left_wheel_joint" type="continuous">
    <parent link="base_link"/>
    <child link="left_wheel_link"/>
    <origin xyz="0 ${wheel_separation/2} 0" rpy="${-pi/2} 0 0"/>
    <axis xyz="0 0 1"/>
  </joint>

  <!-- Right Wheel -->
  <link name="right_wheel_link">
    <visual>
      <geometry>
        <cylinder radius="${wheel_radius}" length="${wheel_width}"/>
      </geometry>
    </visual>
    <collision>
      <geometry>
        <cylinder radius="${wheel_radius}" length="${wheel_width}"/>
      </geometry>
    </collision>
    <inertial>
      <mass value="0.5"/>
      <inertia ixx="0.001" ixy="0" ixz="0" iyy="0.001" iyz="0" izz="0.002"/>
    </inertial>
  </link>

  <joint name="right_wheel_joint" type="continuous">
    <parent link="base_link"/>
    <child link="right_wheel_link"/>
    <origin xyz="0 ${-wheel_separation/2} 0" rpy="${-pi/2} 0 0"/>
    <axis xyz="0 0 1"/>
  </joint>

  <!-- Gazebo Properties -->
  <gazebo reference="base_link">
    <material>Gazebo/Blue</material>
    <mu1>0.2</mu1>
    <mu2>0.2</mu2>
  </gazebo>

  <gazebo reference="left_wheel_link">
    <material>Gazebo/Black</material>
    <mu1>1.0</mu1>
    <mu2>1.0</mu2>
  </gazebo>

  <gazebo reference="right_wheel_link">
    <material>Gazebo/Black</material>
    <mu1>1.0</mu1>
    <mu2>1.0</mu2>
  </gazebo>

</robot>
```

### Step 3: Create World File

**File:** `worlds/warehouse.world`

```xml
<?xml version="1.0"?>
<sdf version="1.7">
  <world name="warehouse">
    
    <physics type="ode">
      <gravity>0 0 -9.81</gravity>
    </physics>
    
    <include>
      <uri>model://sun</uri>
    </include>
    
    <include>
      <uri>model://ground_plane</uri>
    </include>
    
    <!-- Add obstacles -->
    <include>
      <uri>model://wood_pallet</uri>
      <pose>2 0 0 0 0 0</pose>
    </include>
    
  </world>
</sdf>
```

### Step 4: Create Launch File

See the launch file example in Section 5 above.

### Step 5: Build and Run

```bash
# Build
cd ~/ws_simulation
colcon build

# Source
source install/setup.bash

# Launch
ros2 launch my_robot_simulation simulation.launch.py
```

### Verification Checklist

- [ ] Gazebo opens with warehouse world
- [ ] Robot appears at origin (0, 0, 0)
- [ ] Robot has correct colors (blue base, black wheels)
- [ ] Wheels are properly attached
- [ ] No console errors about inertia or mass

---

## 📝 Summary

### Key Takeaways

- **Gazebo Versions**: Gazebo Sim (Harmonic/Jetty) is the future; Gazebo Classic is legacy
- **URDF Limitation**: URDF describes single robots; SDF describes complete worlds
- **Inertial Properties**: Mass > 0 and non-zero inertia required for physics simulation
- **Launch Files**: Use `spawn_entity.py` with `robot_description` topic
- **World Files**: SDF format with physics, lighting, and model includes

### Looking Ahead

In Week 7, you'll explore advanced simulation topics: sensor simulation in Gazebo, Unity for high-fidelity visualization, and human-robot interaction simulation environments.

---

## 📚 References

1. **Open Robotics.** "Gazebo Sim Documentation." Gazebo Official Documentation.  
   URL: https://gazebosim.org/docs/latest/

2. **Open Robotics.** "Tutorial: Using a URDF in Gazebo." Gazebo Classic Documentation.  
   URL: https://classic.gazebosim.org/tutorials/?tut=ros_urdf/

3. **Haber, Aleksandar.** "Write Launch and URDF/XACRO Models Files and Load them in Gazebo." January 2024.  
   URL: https://aleksandarhaber.com/write-launch-and-urdf-xacro-models-files-and-load-them-in-gazebo/

4. **Open Robotics.** "SDFormat Library."  
   URL: https://gazebosim.org/libs/sdformat/
