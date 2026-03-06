---
sidebar_position: 1
title: "Week 3: ROS 2 Fundamentals"
description: "Learn ROS 2 architecture, nodes, topics, services, actions, DDS middleware, and installation on Ubuntu 22.04"
tags: [ros2, robotics-middleware, nodes, topics, services, actions, dds, ros2-installation]
---

# Week 3: ROS 2 Fundamentals

## 🎯 Learning Objectives

By the end of this chapter, you will be able to:

- Explain what ROS 2 is and why it was created to replace ROS 1
- Distinguish between nodes, topics, services, and actions with code examples
- Understand how DDS middleware enables real-time, distributed communication
- Install ROS 2 Humble on Ubuntu 22.04 and verify the installation
- Create a simple publisher/subscriber node in Python

---

## Introduction

Welcome to **ROS 2** — the robotic nervous system that connects sensors, intelligence, and actuators into a cohesive system. If Physical AI is the brain of a robot, ROS 2 is the network of nerves that allows different parts to communicate.

ROS 2 (Robot Operating System 2) is not actually an operating system in the traditional sense. It's **middleware** — software that sits between your robot's hardware and your applications, providing standardized communication protocols and tools.

This week, you'll learn the fundamental concepts that power modern robotics: nodes, topics, services, actions, and the DDS middleware that makes it all possible.

---

## 1. What is ROS 2 and Why It Exists

### A Brief History

**ROS 1** began at Stanford in 2007 and evolved at Willow Garage. It revolutionized robotics research by providing:
- Standardized message types
- Reusable drivers and libraries
- Visualization tools (RViz)
- Simulation integration (Gazebo)

However, ROS 1 had critical limitations for production deployment:

| ROS 1 Limitation | Consequence |
|------------------|-------------|
| **Single point of failure** | Master node (roscore) required for all communication |
| **No real-time support** | Unsuitable for industrial control systems |
| **Limited security** | No native encryption or authentication |
| **Linux-only** | Poor cross-platform support |

### ROS 2: A Complete Redesign

**ROS 2** was created to address these limitations with a complete architectural redesign, officially released in 2017 with ongoing LTS releases:
- **Humble** (2022) — Long Term Support until 2027
- **Iron** (2023)
- **Jazzy** (2024) — Latest LTS

### Core Design Goals

| Goal | ROS 1 Limitation | ROS 2 Solution |
|------|------------------|----------------|
| **Distributed Architecture** | Centralized Master node | DDS-based peer-to-peer |
| **Real-time Performance** | Poor latency guarantees | DDS QoS policies |
| **Security** | None native | DDS-Security standard |
| **Platform Support** | Linux primarily | Linux, Windows, macOS, RTOS |
| **Fault Tolerance** | Master failure = system down | No single point of failure |

### Where is ROS 2 Used?

ROS 2 powers robots in diverse applications:

| Industry | Applications |
|----------|--------------|
| **Industrial Automation** | Factory robots, assembly lines, quality inspection |
| **Autonomous Vehicles** | Self-driving cars, delivery robots, warehouse AGVs |
| **Medical Robotics** | Surgical systems, rehabilitation devices, telemedicine |
| **Aerospace** | Drones, satellite systems, space exploration |
| **Research** | Academic robotics, AI integration, human-robot interaction |

---

## 2. Core Concepts: Nodes, Topics, Services, Actions

### Nodes

**Nodes** are executable units that perform specific tasks. Think of them as individual processes that do one thing well.

A robot system comprises multiple nodes communicating together:

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  Lidar Node │     │  SLAM Node  │     │  Nav Node   │
│  (sensing)  │────▶│ (mapping)   │────▶│ (planning)  │
└─────────────┘     └─────────────┘     └─────────────┘
```

**Example: Simple Node in Python**

```python
import rclpy
from rclpy.node import Node

class SimpleNode(Node):
    def __init__(self):
        super().__init__('simple_node')
        self.get_logger().info('Node started!')

def main():
    rclpy.init()
    node = SimpleNode()
    rclpy.spin(node)
    node.destroy_node()
    rclpy.shutdown()

if __name__ == '__main__':
    main()
```

### Communication Patterns

ROS 2 provides three communication patterns, each suited for different scenarios:

| Pattern | Communication Model | Data Flow | Response | Use Case |
|---------|--------------------|-----------|----------|----------|
| **Topics** | Publish-Subscribe | One-to-many | None | Continuous streams (sensors) |
| **Services** | Request-Response | One-to-one | Single reply | Quick queries |
| **Actions** | Goal-Feedback-Result | One-to-one with feedback | Progress + result | Long-running tasks |

### Topics (Publish-Subscribe)

**When to Use:**
- Continuous data streams (sensor data, robot state)
- One-to-many or many-to-many communication
- No response expected from subscribers

**Common Topics:**
- `/scan` — LIDAR laser scan data
- `/camera/image_raw` — Camera images
- `/imu/data` — IMU readings
- `/odom` — Robot odometry (position/velocity)

**Publisher Example:**

```python
import rclpy
from rclpy.node import Node
from sensor_msgs.msg import LaserScan

class LidarPublisher(Node):
    def __init__(self):
        super().__init__('lidar_publisher')
        self.publisher_ = self.create_publisher(LaserScan, '/scan', 10)
        self.timer = self.create_timer(0.1, self.publish_scan)
    
    def publish_scan(self):
        msg = LaserScan()
        msg.ranges = [1.0, 2.0, 3.0]  # Example data
        self.publisher_.publish(msg)
```

**Subscriber Example:**

```python
import rclpy
from rclpy.node import Node
from sensor_msgs.msg import LaserScan

class LidarSubscriber(Node):
    def __init__(self):
        super().__init__('lidar_subscriber')
        self.subscription = self.create_subscription(
            LaserScan, '/scan', self.scan_callback, 10)
    
    def scan_callback(self, msg):
        self.get_logger().info(f'Received scan with {len(msg.ranges)} points')
```

### Services (Request-Response)

**When to Use:**
- Fast request/response communication (< 1 second)
- Need immediate response before continuing
- Short-lived operations

**Examples:**
- Loading a map when robot reaches a new floor
- Toggling a sensor on/off
- Getting current robot configuration
- Triggering a calibration routine

**Service Server:**

```python
from std_srvs.srv import Trigger

class MapLoaderServer(Node):
    def __init__(self):
        super().__init__('map_loader_server')
        self.srv = self.create_service(
            Trigger, 'load_map', self.load_map_callback)
    
    def load_map_callback(self, request, response):
        response.success = True
        response.message = "Map loaded successfully"
        return response
```

**Service Client:**

```python
class MapLoaderClient(Node):
    def __init__(self):
        super().__init__('map_loader_client')
        self.cli = self.create_client(Trigger, 'load_map')
    
    def load_map(self):
        while not self.cli.wait_for_service(timeout_sec=1.0):
            self.get_logger().info('Service not available, waiting...')
        req = Trigger.Request()
        future = self.cli.call_async(req)
        rclpy.spin_until_future_complete(self, future)
        return future.result()
```

### Actions (Goal-Feedback-Result)

**When to Use:**
- Long-running processes (seconds to hours)
- Need progress feedback during execution
- Task may need cancellation

**Examples:**
- Navigate to a goal location (takes minutes)
- Pick and place manipulation
- Path planning with progress updates
- Battery charging monitoring

**Action Server:**

```python
from rclpy.action import ActionServer, GoalResponse, CancelResponse
from navigate_to_pose.action import NavigateToPose

class NavigateActionServer(Node):
    def __init__(self):
        super().__init__('navigate_action_server')
        self.action_server = ActionServer(
            self, NavigateToPose, 'navigate_to_pose',
            self.execute_callback,
            goal_callback=self.goal_callback,
            cancel_callback=self.cancel_callback)
    
    def goal_callback(self, goal_request):
        return GoalResponse.ACCEPT
    
    def cancel_callback(self, goal_handle):
        return CancelResponse.ACCEPT
    
    async def execute_callback(self, goal_handle):
        feedback = NavigateToPose.Feedback()
        result = NavigateToPose.Result()
        
        for i in range(100):
            if goal_handle.is_cancel_requested:
                goal_handle.canceled()
                return result
            feedback.percent_complete = i
            goal_handle.publish_feedback(feedback)
            await asyncio.sleep(0.1)
        
        goal_handle.succeed()
        result.success = True
        return result
```

### Decision Framework

How do you choose between Topics, Services, and Actions?

```
                    ┌─────────────────────────┐
                    │  Need continuous data?  │
                    └───────────┬─────────────┘
                                │ Yes
                                ▼
                          ┌─────────┐
                          │ TOPICS  │
                          └─────────┘
                                │ No
                                ▼
                    ┌─────────────────────────┐
                    │  Task < 1 second?       │
                    └───────────┬─────────────┘
                                │ Yes
                                ▼
                          ┌───────────┐
                          │ SERVICES  │
                          └───────────┘
                                │ No
                                ▼
                    ┌─────────────────────────┐
                    │  Need feedback/cancel?  │
                    └───────────┬─────────────┘
                                │ Yes
                                ▼
                          ┌─────────┐
                          │ ACTIONS │
                          └─────────┘
```

---

## 3. DDS Middleware Explained

### What is DDS?

**DDS (Data Distribution Service)** is a middleware protocol and API standard from the Object Management Group (OMG) for data-centric connectivity in distributed systems. ROS 2 uses DDS as its underlying communication layer.

### Why ROS 2 Uses DDS

| Reason | Benefit |
|--------|---------|
| **Real-time Performance** | Low-latency, deterministic QoS policies |
| **Distributed Architecture** | Native peer-to-peer, no single point of failure |
| **Quality of Service** | Reliability guarantees for sensor data and control |
| **Dynamic Discovery** | Plug-and-play node integration |
| **Security** | Built-in authentication and encryption |
| **Interoperability** | Multiple implementations (Fast DDS, Cyclone DDS) |

### DDS Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    ROS 2 Application Layer                   │
│  (Nodes, Topics, Services, Actions, CLI Tools)              │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                    RMW Abstraction Layer                     │
│  (rmw_api, rmw_implementation, vendor-specific adapters)    │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                    DDS Implementation                        │
│  (Fast DDS / Cyclone DDS / Zenoh / Connext)                 │
│  • Discovery (Simple or Discovery Server)                   │
│  • RTPS Protocol                                            │
│  • QoS Enforcement                                          │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                    Transport Layer                           │
│  (UDP multicast/unicast, locator lists, ports via Domain ID)│
└─────────────────────────────────────────────────────────────┘
```

### How DDS Works

**Data-Centric Architecture:**
- Applications read/write to what appears as **local memory** via an API
- DDS transparently sends messages to update remote nodes
- No central broker required—**peer-to-peer communication**

**Domain-Based Isolation:**
- **DDS Domains** are completely independent
- No data-sharing across domains
- A `DomainParticipant` represents local membership in a domain

**Quality of Service (QoS) Policies:**

| QoS Aspect | Description | Use Case |
|-----------|-------------|----------|
| **Reliability** | Ensures messages reach destinations | Critical commands |
| **Best Effort** | Sends once, no delivery check | Sensor data, video |
| **Durability** | Controls data persistence | Late-joining subscribers |
| **Deadlines** | Timing constraints for delivery | Real-time control |

---

## 4. Installation Guide (Ubuntu 22.04, ROS 2 Humble)

### Prerequisites
- Ubuntu 22.04 LTS (Jammy Jellyfish)
- Terminal access with sudo privileges
- Internet connection

### Step-by-Step Installation

**Step 1: Set Locale**
```bash
sudo apt update && sudo apt install locales
sudo locale-gen en_US en_US.UTF-8
sudo update-locale LC_ALL=en_US.UTF-8 LANG=en_US.UTF-8
export LANG=en_US.UTF-8
```

**Step 2: Setup Sources**
```bash
sudo apt install software-properties-common
sudo add-apt-repository universe
sudo apt update && sudo apt install curl -y

# Download ROS 2 apt source
export ROS_APT_SOURCE_VERSION=$(curl -s https://api.github.com/repos/ros-infrastructure/ros-apt-source/releases/latest | grep -F "tag_name" | awk -F\" '{print $4}')

curl -L -o /tmp/ros2-apt-source.deb "https://github.com/ros-infrastructure/ros-apt-source/releases/download/${ROS_APT_SOURCE_VERSION}/ros2-apt-source_${ROS_APT_SOURCE_VERSION}_$(. /etc/os-release && echo ${UBUNTU_CODENAME:-${VERSION_CODENAME}})_all.deb"

sudo dpkg -i /tmp/ros2-apt-source.deb
sudo apt update
```

**Step 3: Install ROS 2 Humble Desktop**
```bash
sudo apt install ros-humble-desktop
sudo apt install ros-dev-tools
```

**Step 4: Source Environment**
```bash
source /opt/ros/humble/setup.bash
```

**Step 5: Persistent Configuration**
```bash
echo "source /opt/ros/humble/setup.bash" >> ~/.bashrc
source ~/.bashrc
```

**Step 6: Verification**
```bash
# Check version
ros2 --version

# Test communication (Terminal 1)
ros2 run demo_nodes_cpp talker

# Test communication (Terminal 2)
ros2 run demo_nodes_py listener
```

### Installation Options

| Package | Command | Description |
|---------|---------|-------------|
| Desktop | `sudo apt install ros-humble-desktop` | Full installation (recommended) |
| Base | `sudo apt install ros-humble-base` | Minimal installation |
| ROS-Base | `sudo apt install ros-humble-ros-base` | Barebones ROS |

---

## 🔧 Practical Exercise: Create a Simple Publisher/Subscriber

### Objective
Create two Python nodes: one that publishes counter messages and one that subscribes to them.

### Step 1: Create Workspace
```bash
mkdir -p ~/ros2_ws/src
cd ~/ros2_ws
colcon build
source install/setup.bash
```

### Step 2: Create Package
```bash
cd ~/ros2_ws/src
ros2 pkg create --build-type ament_python my_publisher_subscriber
```

### Step 3: Write Publisher (`publisher.py`)
```python
import rclpy
from rclpy.node import Node
from std_msgs.msg import String

class CounterPublisher(Node):
    def __init__(self):
        super().__init__('counter_publisher')
        self.publisher_ = self.create_publisher(String, 'counter_topic', 10)
        self.timer = self.create_timer(1.0, self.timer_callback)
        self.counter = 0
    
    def timer_callback(self):
        msg = String()
        msg.data = f'Count: {self.counter}'
        self.publisher_.publish(msg)
        self.get_logger().info(f'Publishing: {msg.data}')
        self.counter += 1

def main(args=None):
    rclpy.init(args=args)
    node = CounterPublisher()
    rclpy.spin(node)
    node.destroy_node()
    rclpy.shutdown()

if __name__ == '__main__':
    main()
```

### Step 4: Write Subscriber (`subscriber.py`)
```python
import rclpy
from rclpy.node import Node
from std_msgs.msg import String

class CounterSubscriber(Node):
    def __init__(self):
        super().__init__('counter_subscriber')
        self.subscription = self.create_subscription(
            String, 'counter_topic', self.listener_callback, 10)
    
    def listener_callback(self, msg):
        self.get_logger().info(f'Received: {msg.data}')

def main(args=None):
    rclpy.init(args=args)
    node = CounterSubscriber()
    rclpy.spin(node)
    node.destroy_node()
    rclpy.shutdown()

if __name__ == '__main__':
    main()
```

### Step 5: Update setup.py
```python
from setuptools import setup

package_name = 'my_publisher_subscriber'

setup(
    name=package_name,
    version='0.0.0',
    packages=[package_name],
    entry_points={
        'console_scripts': [
            'publisher = my_publisher_subscriber.publisher:main',
            'subscriber = my_publisher_subscriber.subscriber:main',
        ],
    },
)
```

### Step 6: Build and Run
```bash
cd ~/ros2_ws
colcon build
source install/setup.bash

# Terminal 1: Run publisher
ros2 run my_publisher_subscriber publisher

# Terminal 2: Run subscriber
ros2 run my_publisher_subscriber subscriber
```

**Expected Output:**
```
# Publisher terminal:
[INFO] [counter_publisher]: Publishing: Count: 0
[INFO] [counter_publisher]: Publishing: Count: 1
[INFO] [counter_publisher]: Publishing: Count: 2

# Subscriber terminal:
[INFO] [counter_subscriber]: Received: Count: 0
[INFO] [counter_subscriber]: Received: Count: 1
[INFO] [counter_subscriber]: Received: Count: 2
```

---

## 📝 Summary

### Key Takeaways

- **ROS 2** is a distributed, real-time robotics framework using DDS middleware for peer-to-peer communication
- **Nodes** communicate via **Topics** (streaming data), **Services** (quick requests), or **Actions** (long tasks with feedback)
- **DDS** provides real-time performance, dynamic discovery, and QoS guarantees without a single point of failure
- **Installation** on Ubuntu 22.04 requires locale setup, repository configuration, and environment sourcing
- **Publisher/Subscriber** pattern is the foundation of ROS 2 communication — publishers broadcast data, subscribers receive it

### Looking Ahead

In Week 4, you'll learn to build complete ROS 2 packages with launch files, parameter management, and create a teleoperation node for robot control.

---

## 📚 References

1. **Open Robotics.** ROS 2 Documentation: Humble. Official documentation with tutorials and concepts.  
   URL: https://docs.ros.org/en/humble/

2. **DDS Foundation.** What is DDS? Technical explanation of Data Distribution Service.  
   URL: https://www.dds-foundation.org/what-is-dds-3/

3. **Clearpath Robotics.** Middleware and DDS Overview. Practical RMW/DDS implementation details.  
   URL: https://docs.clearpathrobotics.com/docs/ros/networking/ros2_networking/rmw_overview/

4. **Automatic Addison.** ROS 2 Architecture Overview. Beginner-friendly technical explanations.  
   URL: https://automaticaddison.com/ros-2-architecture-overview/
