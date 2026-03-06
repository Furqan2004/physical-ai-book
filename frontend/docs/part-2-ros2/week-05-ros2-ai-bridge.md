---
sidebar_position: 3
title: "Week 5: Bridging AI to ROS 2"
description: "Learn URDF robot modeling, TF2 coordinate transforms, and how to integrate AI agents with ROS 2 controllers"
tags: [urdf, tf2, ai-ros2-bridge, robot-modeling, coordinate-transforms, rclpy]
---

# Week 5: Bridging AI to ROS 2

## 🎯 Learning Objectives

By the end of this chapter, you will be able to:

- Explain why bridging AI agents to ROS 2 is essential for modern robotics
- Describe URDF format and create robot models with links, joints, and inertials
- Understand how TF2 manages coordinate frame transforms
- Design an AI-to-ROS 2 pipeline for natural language robot control
- Create a URDF model for a humanoid arm and visualize it in RViz

---

## Introduction

You've learned ROS 2 fundamentals and package development. Now comes the exciting part: connecting AI agents to ROS 2 so they can control real robots.

Modern robotics requires intelligent decision-making beyond traditional control systems. AI agents — whether LLMs for natural language understanding, reinforcement learning policies for manipulation, or computer vision models for perception — need to:

- **Perceive** robot state and environment through ROS 2 topics
- **Reason** about tasks and generate action plans
- **Act** by sending commands to ROS 2 controllers

This week, you'll learn the three key technologies that enable AI-ROS 2 integration: URDF for robot modeling, TF2 for coordinate transforms, and bridge patterns for AI command execution.

---

## 1. Why Bridge AI to ROS 2

### The Motivation

Traditional robot control follows pre-programmed behaviors. But what if you want your robot to:

- Understand natural language commands like "Go to the kitchen and bring me water"
- Learn manipulation skills through trial and error
- Recognize objects and navigate to them autonomously
- Adapt to new environments without reprogramming

This requires **AI agents** that can:
- Process multimodal inputs (vision, language, touch)
- Make high-level decisions
- Translate decisions into low-level robot commands

### The AI-to-ROS 2 Pipeline

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   AI Agent      │     │   Bridge Node   │     │   ROS 2 Robot   │
│   (LLM/RL/CV)   │────▶│   (rclpy)       │────▶│   Controllers   │
│                 │     │                 │     │                 │
│ - Receives      │     │ - Subscribes to │     │ - Motor drivers │
│   observations  │     │   sensor topics │     │ - Navigation    │
│ - Generates     │     │ - Publishes to  │     │ - Manipulation  │
│   decisions     │     │   command topics│     │                 │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

### Real-World Use Cases

| Application | AI Component | ROS 2 Integration |
|-------------|--------------|-------------------|
| **Natural Language Control** | LLM (GPT, Llama) | Parse commands → ROS 2 actions |
| **Vision-Based Navigation** | CNN/ViT models | Image topics → Navigation goals |
| **Reinforcement Learning** | RL policies | State topics → Action commands |
| **Task Planning** | PDDL/LLM planners | High-level goals → ROS 2 behaviors |
| **Human-Robot Interaction** | Speech/NLP models | Voice commands → Robot actions |

---

## 2. URDF Format

### What is URDF?

**URDF (Unified Robot Description Format)** is an XML format that describes a robot's:
- **Kinematic structure** (links and joints)
- **Visual geometry** (meshes, colors)
- **Collision geometry** (simplified shapes for physics)
- **Inertial properties** (mass, center of mass, inertia)

### URDF XML Structure

```xml
<?xml version="1.0"?>
<robot name="my_robot">
  
  <!-- Links define rigid bodies -->
  <link name="base_link">
    <inertial>
      <mass value="1.0"/>
      <origin xyz="0 0 0"/>
      <inertia ixx="0.01" ixy="0" ixz="0" iyy="0.01" iyz="0" izz="0.01"/>
    </inertial>
    <visual>
      <geometry>
        <box size="0.2 0.2 0.2"/>
      </geometry>
    </visual>
    <collision>
      <geometry>
        <box size="0.2 0.2 0.2"/>
      </geometry>
    </collision>
  </link>
  
  <!-- Joints connect links -->
  <joint name="joint1" type="revolute">
    <parent link="base_link"/>
    <child link="link1"/>
    <origin xyz="0 0 0.1" rpy="0 0 0"/>
    <axis xyz="0 0 1"/>
    <limit lower="-3.14" upper="3.14" velocity="1.0" effort="10.0"/>
  </joint>
  
  <link name="link1">
    <!-- ... link definition ... -->
  </link>
  
</robot>
```

### Link Elements

| Element | Purpose | Required |
|---------|---------|----------|
| `<inertial>` | Mass, COM, inertia tensor | For simulation |
| `<visual>` | Rendering geometry | For visualization |
| `<collision>` | Physics collision geometry | For simulation |

### Joint Types

| Type | Description | Example |
|------|-------------|---------|
| `revolute` | Rotational with limits | Elbow, shoulder |
| `continuous` | Unlimited rotation | Wheel |
| `prismatic` | Linear sliding | Linear actuator |
| `fixed` | Rigid connection | Sensor mount |
| `floating` | 6-DOF | Free-floating base |
| `planar` | 2-DOF planar | Mobile base |

### Joint Elements

```xml
<joint name="shoulder_joint" type="revolute">
  <parent link="base_link"/>      <!-- Parent link -->
  <child link="arm_link"/>        <!-- Child link -->
  <origin xyz="0 0 0.1" rpy="0 0 0"/>  <!-- Transform -->
  <axis xyz="0 0 1"/>             <!-- Rotation axis -->
  <limit lower="-1.57" upper="1.57" velocity="2.0" effort="50.0"/>
  <dynamics damping="0.1" friction="0.05"/>
</joint>
```

---

## 3. TF2 Transform System

### What is TF2?

**TF2 (Transform Library 2)** manages coordinate frame relationships over time. It enables:
- Tracking multiple coordinate frames simultaneously
- Transforming data between frames (e.g., camera → base_link)
- Time-aware transforms with nanosecond precision

### Why TF2 is Needed

Robots have multiple sensors, each with its own coordinate frame:

```
odom (world origin)
  └── base_link (robot body)
      ├── camera_link (camera sensor)
      ├── lidar_link (LiDAR sensor)
      └── arm_base (manipulator base)
          └── end_effector (gripper)
```

Without TF2, you would need to manually calculate transforms between every pair of frames — a nightmare for complex robots!

### Transform Tree Example

**Publishing Static Transforms:**

```python
"""
static_transform_publisher.py - Publish static transforms
"""
import rclpy
from rclpy.node import Node
from geometry_msgs.msg import TransformStamped
import tf2_ros

class StaticTransformPublisher(Node):
    def __init__(self):
        super().__init__('static_transform_publisher')
        
        self.tf_broadcaster = tf2_ros.StaticTransformBroadcaster(self)
        
        # Create transform message
        transform = TransformStamped()
        transform.header.stamp = self.get_clock().now().to_msg()
        transform.header.frame_id = 'base_link'
        transform.child_frame_id = 'camera_link'
        
        # Translation (meters)
        transform.transform.translation.x = 0.1
        transform.transform.translation.y = 0.0
        transform.transform.translation.z = 0.2
        
        # Rotation (quaternion)
        transform.transform.rotation.x = 0.0
        transform.transform.rotation.y = 0.0
        transform.transform.rotation.z = 0.0
        transform.transform.rotation.w = 1.0
        
        self.tf_broadcaster.sendTransform(transform)
        self.get_logger().info('Published static transform: base_link → camera_link')

def main():
    rclpy.init()
    node = StaticTransformPublisher()
    rclpy.spin(node)
    node.destroy_node()
    rclpy.shutdown()

if __name__ == '__main__':
    main()
```

### TF2 Commands

```bash
# View transform tree
ros2 run tf2_tools view_frames

# Visualize in RViz
ros2 run rqt_tf_tree rqt_tf_tree

# Check transform between frames
ros2 run tf2_ros tf2_echo base_link camera_link
```

---

## 4. AI Agent Integration

### LLM to ROS 2 Command Pipeline

Here's how to bridge an LLM (or any AI agent) to ROS 2:

```python
"""
llm_bridge_node.py - Bridge LLM decisions to ROS 2 commands
"""
import rclpy
from rclpy.node import Node
from rclpy.action import ActionClient
from navigate_to_pose.action import NavigateToPose
from std_msgs.msg import String
import json

class LLMBridgeNode(Node):
    def __init__(self):
        super().__init__('llm_bridge_node')
        
        # Action client for navigation
        self.nav_client = ActionClient(
            self, NavigateToPose, 'navigate_to_pose')
        
        # Subscribe to LLM command topic
        self.cmd_subscription = self.create_subscription(
            String, '/llm/commands', self.llm_command_callback, 10)
        
        self.get_logger().info('LLM Bridge Node started')
    
    def llm_command_callback(self, msg):
        """Parse LLM command and execute ROS 2 action"""
        try:
            command = json.loads(msg.data)
            
            if command['action'] == 'navigate':
                self.send_navigation_goal(
                    x=command['x'],
                    y=command['y'],
                    z=command['z']
                )
            elif command['action'] == 'pick':
                self.get_logger().info('Pick action not implemented')
            elif command['action'] == 'place':
                self.get_logger().info('Place action not implemented')
                
        except json.JSONDecodeError:
            self.get_logger().error('Invalid JSON from LLM')
    
    def send_navigation_goal(self, x, y, z):
        """Send navigation goal to action server"""
        self.nav_client.wait_for_server()
        
        goal = NavigateToPose.Goal()
        goal.pose.position.x = x
        goal.pose.position.y = y
        goal.pose.position.z = z
        goal.pose.orientation.w = 1.0
        
        future = self.nav_client.send_goal_async(goal)
        future.add_done_callback(self.navigation_response_callback)
    
    def navigation_response_callback(self, future):
        goal_handle = future.result()
        if goal_handle.accepted:
            self.get_logger().info('Navigation goal accepted')
        else:
            self.get_logger().warn('Navigation goal rejected')

def main():
    rclpy.init()
    node = LLMBridgeNode()
    rclpy.spin(node)
    node.destroy_node()
    rclpy.shutdown()

if __name__ == '__main__':
    main()
```

### Example LLM Command Format

```json
{
  "action": "navigate",
  "x": 2.5,
  "y": 1.0,
  "z": 0.0,
  "description": "Move to the charging station"
}
```

### Integration Pattern

1. **AI Agent** outputs JSON commands to `/llm/commands` topic
2. **Bridge Node** subscribes, parses, and executes ROS 2 actions
3. **ROS 2 Robot** executes the action and provides feedback
4. **Bridge Node** publishes results back to AI agent

---

## 🔧 Practical Exercise: Create URDF for a Humanoid Arm

### Objective
Create a complete URDF description for a 3-DOF humanoid arm (shoulder, elbow, wrist).

### Step 1: Create Package
```bash
cd ~/ros2_ws/src
ros2 pkg create --build-type ament_python humanoid_arm_description
```

### Step 2: Create URDF File

Create `humanoid_arm_description/urdf/arm.urdf`:

```xml
<?xml version="1.0"?>
<robot name="humanoid_arm">
  
  <!-- Base Link (shoulder mount) -->
  <link name="base_link">
    <inertial>
      <mass value="0.5"/>
      <origin xyz="0 0 0"/>
      <inertia ixx="0.001" ixy="0" ixz="0" iyy="0.001" iyz="0" izz="0.001"/>
    </inertial>
    <visual>
      <geometry>
        <box size="0.1 0.1 0.05"/>
      </geometry>
      <material name="grey">
        <color rgba="0.5 0.5 0.5 1.0"/>
      </material>
    </visual>
    <collision>
      <geometry>
        <box size="0.1 0.1 0.05"/>
      </geometry>
    </collision>
  </link>
  
  <!-- Shoulder Joint -->
  <joint name="shoulder_joint" type="revolute">
    <parent link="base_link"/>
    <child link="upper_arm"/>
    <origin xyz="0 0 0.05" rpy="0 0 0"/>
    <axis xyz="0 0 1"/>
    <limit lower="-1.57" upper="1.57" velocity="2.0" effort="30.0"/>
    <dynamics damping="0.1" friction="0.05"/>
  </joint>
  
  <!-- Upper Arm Link -->
  <link name="upper_arm">
    <inertial>
      <mass value="0.8"/>
      <origin xyz="0 0 0.15"/>
      <inertia ixx="0.005" ixy="0" ixz="0" iyy="0.005" iyz="0" izz="0.002"/>
    </inertial>
    <visual>
      <origin xyz="0 0 0.15" rpy="0 0 0"/>
      <geometry>
        <cylinder radius="0.04" length="0.3"/>
      </geometry>
      <material name="blue">
        <color rgba="0.0 0.0 0.8 1.0"/>
      </material>
    </visual>
    <collision>
      <origin xyz="0 0 0.15" rpy="0 0 0"/>
      <geometry>
        <cylinder radius="0.04" length="0.3"/>
      </geometry>
    </collision>
  </link>
  
  <!-- Elbow Joint -->
  <joint name="elbow_joint" type="revolute">
    <parent link="upper_arm"/>
    <child link="forearm"/>
    <origin xyz="0 0 0.3" rpy="0 0 0"/>
    <axis xyz="0 1 0"/>
    <limit lower="-2.0" upper="0.0" velocity="2.0" effort="25.0"/>
    <dynamics damping="0.1" friction="0.05"/>
  </joint>
  
  <!-- Forearm Link -->
  <link name="forearm">
    <inertial>
      <mass value="0.6"/>
      <origin xyz="0 0 0.12"/>
      <inertia ixx="0.003" ixy="0" ixz="0" iyy="0.003" iyz="0" izz="0.001"/>
    </inertial>
    <visual>
      <origin xyz="0 0 0.12" rpy="0 0 0"/>
      <geometry>
        <cylinder radius="0.03" length="0.24"/>
      </geometry>
      <material name="blue">
        <color rgba="0.0 0.0 0.8 1.0"/>
      </material>
    </visual>
    <collision>
      <origin xyz="0 0 0.12" rpy="0 0 0"/>
      <geometry>
        <cylinder radius="0.03" length="0.24"/>
      </geometry>
    </collision>
  </link>
  
  <!-- Wrist Joint -->
  <joint name="wrist_joint" type="revolute">
    <parent link="forearm"/>
    <child link="hand"/>
    <origin xyz="0 0 0.24" rpy="0 0 0"/>
    <axis xyz="0 1 0"/>
    <limit lower="-1.57" upper="1.57" velocity="3.0" effort="15.0"/>
    <dynamics damping="0.05" friction="0.02"/>
  </joint>
  
  <!-- Hand Link -->
  <link name="hand">
    <inertial>
      <mass value="0.3"/>
      <origin xyz="0 0 0.05"/>
      <inertia ixx="0.001" ixy="0" ixz="0" iyy="0.001" iyz="0" izz="0.001"/>
    </inertial>
    <visual>
      <origin xyz="0 0 0.05" rpy="0 0 0"/>
      <geometry>
        <box size="0.06 0.04 0.1"/>
      </geometry>
      <material name="grey">
        <color rgba="0.5 0.5 0.5 1.0"/>
      </material>
    </visual>
    <collision>
      <origin xyz="0 0 0.05" rpy="0 0 0"/>
      <geometry>
        <box size="0.06 0.04 0.1"/>
      </geometry>
    </collision>
  </link>
  
</robot>
```

### Step 3: Create Launch File for Visualization

Create `humanoid_arm_description/launch/view_arm.launch.py`:

```python
from launch import LaunchDescription
from launch_ros.actions import Node
from launch_ros.substitutions import FindPackageShare
from launch.substitutions import Command, PathJoinSubstitution

def generate_launch_description():
    return LaunchDescription([
        # Robot State Publisher
        Node(
            package='robot_state_publisher',
            executable='robot_state_publisher',
            name='robot_state_publisher',
            parameters=[{
                'robot_description': Command([
                    'xacro ',
                    PathJoinSubstitution([
                        FindPackageShare('humanoid_arm_description'),
                        'urdf',
                        'arm.urdf'
                    ])
                ])
            }],
            output='screen'
        ),
        
        # Joint State Publisher GUI
        Node(
            package='joint_state_publisher_gui',
            executable='joint_state_publisher_gui',
            name='joint_state_publisher_gui',
            output='screen'
        ),
        
        # RViz2 for visualization
        Node(
            package='rviz2',
            executable='rviz2',
            name='rviz2',
            output='screen'
        ),
    ])
```

### Step 4: Build and Visualize

```bash
cd ~/ros2_ws
colcon build --symlink-install
source install/setup.bash

# Launch visualization
ros2 launch humanoid_arm_description view_arm.launch.py
```

In RViz:
1. Add "RobotModel" display
2. Set Description Topic to `/robot_description`
3. Use the Joint State Publisher GUI to move the arm joints!

---

## 📝 Summary

### Key Takeaways

- **AI-ROS 2 Bridge** enables intelligent agents to control robots through standardized interfaces
- **URDF** describes robot kinematics, visuals, and collision geometry in XML format
- **TF2** manages coordinate frame transforms with time-aware precision
- **Integration Pattern**: AI agent → Bridge node (rclpy) → ROS 2 commands (topics/actions)
- **Humanoid Arm URDF** demonstrates complete robot modeling with links, joints, and inertials

### Looking Ahead

In Part 3, you'll explore robot simulation with Gazebo and Unity — where you can test your ROS 2 code safely before deploying to real robots!

---

## 📚 References

1. **Open Robotics.** URDF Tutorial. Official documentation on robot modeling.  
   URL: https://docs.ros.org/en/humble/Tutorials/Intermediate/URDF/URDF-Main.html

2. **Formula Trinity.** TF2 Transform Library. Practical coordinate frame explanation.  
   URL: https://docs.formulatrinity.ie/resources/tf2/

3. **Tola et al. (2023).** Understanding URDF: A Survey Based on User Experience. Academic paper on URDF adoption.  
   URL: https://arxiv.org/abs/2306.08068
