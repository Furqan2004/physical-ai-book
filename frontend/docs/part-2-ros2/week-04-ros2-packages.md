---
sidebar_position: 2
title: "Week 4: Building ROS 2 Packages"
description: "Learn to create ROS 2 packages, publisher/subscriber patterns, launch files, parameters, and build a teleoperation node"
tags: [ros2-packages, colcon, launch-files, ros2-parameters, teleoperation, rclpy]
---

# Week 4: Building ROS 2 Packages

## 🎯 Learning Objectives

By the end of this chapter, you will be able to:

- Describe the standard ROS 2 package structure and create packages with `ros2 pkg create`
- Implement publisher and subscriber nodes in Python with proper error handling
- Create launch files to start multiple nodes with configurable parameters
- Manage node parameters using YAML configuration files
- Build a keyboard teleoperation node for robot control

---

## Introduction

Now that you understand ROS 2 fundamentals, it's time to build complete, production-ready packages. This week focuses on the practical skills you need to create robust ROS 2 applications: package structure, launch files, parameter management, and a real-world teleoperation example.

By the end of this chapter, you'll have built a keyboard teleoperation node that can control any mobile robot — a skill directly applicable to real robotics projects.

---

## 1. ROS 2 Package Structure

### Directory Layout

A well-organized ROS 2 Python package follows this structure:

```
my_package/
├── package.xml              # Package manifest (dependencies, metadata)
├── setup.py                 # Python package configuration
├── setup.cfg               # Additional setup configuration
├── resource/               # Ament resource files
├── my_package/             # Python source directory
│   ├── __init__.py
│   └── my_node.py          # Node implementation
├── test/                   # Test files
│   └── test_copyright.py
├── launch/                 # Launch files
│   └── my_launch.launch.py
└── config/                 # Configuration files
    └── params.yaml
```

### package.xml (Package Manifest)

The `package.xml` file describes your package to the ROS 2 build system:

```xml
<?xml version="1.0"?>
<package format="3">
  <name>my_package</name>
  <version>0.0.0</version>
  <description>My ROS 2 package description</description>
  <maintainer email="your@email.com">Your Name</maintainer>
  <license>Apache-2.0</license>

  <!-- Dependencies -->
  <depend>rclpy</depend>
  <depend>std_msgs</depend>
  <depend>sensor_msgs</depend>

  <!-- Test dependencies -->
  <test_depend>ament_copyright</test_depend>
  <test_depend>ament_flake8</test_depend>

  <export>
    <build_type>ament_python</build_type>
  </export>
</package>
```

### setup.py (Python Build Configuration)

```python
from setuptools import setup

package_name = 'my_package'

setup(
    name=package_name,
    version='0.0.0',
    packages=[package_name],
    data_files=[
        ('share/ament_index/resource_index/packages',
            ['resource/' + package_name]),
        ('share/' + package_name, ['package.xml']),
    ],
    install_requires=['setuptools'],
    zip_safe=True,
    maintainer='Your Name',
    maintainer_email='your@email.com',
    description='Package description',
    license='Apache-2.0',
    tests_require=['pytest'],
    entry_points={
        'console_scripts': [
            'my_node = my_package.my_node:main',
        ],
    },
)
```

The `entry_points` section defines executable commands. After building, you can run:
```bash
ros2 run my_package my_node
```

---

## 2. Creating a Package

### Using ros2 pkg create

**Create a Python Package:**
```bash
cd ~/ros2_ws/src
ros2 pkg create --build-type ament_python my_python_package \
  --dependencies rclpy std_msgs sensor_msgs
```

**Create a C++ Package:**
```bash
ros2 pkg create --build-type ament_cmake my_cpp_package \
  --dependencies rclcpp std_msgs
```

### Building with colcon

```bash
# Navigate to workspace root
cd ~/ros2_ws

# Build all packages
colcon build

# Build specific package
colcon build --packages-select my_package

# Build with symlink (auto-reload Python changes)
colcon build --symlink-install

# Source the workspace
source install/setup.bash
```

### Build Output Structure

After building, your workspace contains:

```
ros2_ws/
├── build/          # Build artifacts (intermediate files)
├── install/        # Installed packages (source this)
├── log/            # Build logs
└── src/            # Source code
```

Always source the install directory before using your packages:
```bash
source install/setup.bash
```

---

## 3. Publisher & Subscriber Pattern

### Complete Publisher Example

```python
"""
minimal_publisher.py - A minimal ROS 2 publisher node
"""
import rclpy
from rclpy.node import Node
from std_msgs.msg import String, Int32

class MinimalPublisher(Node):
    def __init__(self):
        super().__init__('minimal_publisher')
        
        # Create publisher (message type, topic name, queue size)
        self.string_publisher = self.create_publisher(String, 'chatter', 10)
        self.int_publisher = self.create_publisher(Int32, 'counter', 10)
        
        # Create timer (period in seconds, callback function)
        self.timer = self.create_timer(0.5, self.timer_callback)
        
        self.counter = 0
        self.get_logger().info('Publisher node started')
    
    def timer_callback(self):
        # Publish string message
        string_msg = String()
        string_msg.data = f'Hello ROS 2! Count: {self.counter}'
        self.string_publisher.publish(string_msg)
        
        # Publish integer message
        int_msg = Int32()
        int_msg.data = self.counter
        self.int_publisher.publish(int_msg)
        
        self.get_logger().info(f'Published: {string_msg.data}')
        self.counter += 1

def main(args=None):
    rclpy.init(args=args)
    node = MinimalPublisher()
    
    try:
        rclpy.spin(node)
    except KeyboardInterrupt:
        pass
    finally:
        node.destroy_node()
        rclpy.shutdown()

if __name__ == '__main__':
    main()
```

### Complete Subscriber Example

```python
"""
minimal_subscriber.py - A minimal ROS 2 subscriber node
"""
import rclpy
from rclpy.node import Node
from std_msgs.msg import String, Int32

class MinimalSubscriber(Node):
    def __init__(self):
        super().__init__('minimal_subscriber')
        
        # Create subscription (message type, topic name, callback, qos depth)
        self.string_subscription = self.create_subscription(
            String, 'chatter', self.string_callback, 10)
        
        self.int_subscription = self.create_subscription(
            Int32, 'counter', self.int_callback, 10)
        
        self.get_logger().info('Subscriber node started')
    
    def string_callback(self, msg):
        self.get_logger().info(f'Received string: "{msg.data}"')
    
    def int_callback(self, msg):
        self.get_logger().info(f'Received integer: {msg.data}')

def main(args=None):
    rclpy.init(args=args)
    node = MinimalSubscriber()
    
    try:
        rclpy.spin(node)
    except KeyboardInterrupt:
        pass
    finally:
        node.destroy_node()
        rclpy.shutdown()

if __name__ == '__main__':
    main()
```

### Common Pitfalls and Best Practices

| Pitfall | Solution |
|---------|----------|
| Queue size too small | Use 10+ for most applications |
| No error handling | Wrap `rclpy.spin()` in try/finally |
| Blocking callbacks | Keep callbacks short; use threads for long operations |
| Memory leaks | Always call `destroy_node()` and `rclpy.shutdown()` |
| Topic name typos | Use constants or configuration for topic names |

---

## 4. Launch Files

### Why Launch Files?

Launch files allow you to:
- Start multiple nodes with one command
- Configure node parameters centrally
- Pass arguments for different configurations
- Include other launch files for modularity

### Python vs XML Launch Files

| Aspect | Python (.launch.py) | XML (.launch.xml) |
|--------|--------------------|-------------------|
| **Flexibility** | Full Python logic | Limited to XML structure |
| **Conditionals** | Native Python if/else | `<if>`, `<unless>` tags |
| **Loops** | Native Python loops | Not supported |
| **Readability** | More verbose | More concise |
| **Recommendation** | **Preferred for ROS 2** | Legacy/simpler cases |

### Python Launch File Example

```python
"""
my_launch.launch.py - Example ROS 2 Python launch file
"""
from launch import LaunchDescription
from launch.actions import DeclareLaunchArgument, LogInfo
from launch.substitutions import LaunchConfiguration
from launch_ros.actions import Node

def generate_launch_description():
    # Declare launch arguments
    use_sim_time_arg = DeclareLaunchArgument(
        'use_sim_time',
        default_value='false',
        description='Use simulation clock if true'
    )
    
    namespace_arg = DeclareLaunchArgument(
        'namespace',
        default_value='',
        description='Namespace for all nodes'
    )
    
    # Get launch configurations
    use_sim_time = LaunchConfiguration('use_sim_time')
    namespace = LaunchConfiguration('namespace')
    
    # Define node configurations
    publisher_node = Node(
        package='my_package',
        executable='publisher',
        name='counter_publisher',
        namespace=namespace,
        parameters=[{'use_sim_time': use_sim_time}],
        output='screen',
        emulate_tty=True
    )
    
    subscriber_node = Node(
        package='my_package',
        executable='subscriber',
        name='counter_subscriber',
        namespace=namespace,
        parameters=[{'use_sim_time': use_sim_time}],
        output='screen',
        emulate_tty=True
    )
    
    # Create launch description
    return LaunchDescription([
        use_sim_time_arg,
        namespace_arg,
        LogInfo(msg=['Starting my launch file with namespace: ', namespace]),
        publisher_node,
        subscriber_node,
    ])
```

### Running Launch Files

```bash
# Basic launch
ros2 launch my_package my_launch.launch.py

# With arguments
ros2 launch my_package my_launch.launch.py use_sim_time:=true namespace:=/robot1

# View launch arguments
ros2 launch my_package my_launch.launch.py --show-args
```

---

## 5. Parameter Management

### Declaring Parameters

```python
import rclpy
from rclpy.node import Node

class ParameterNode(Node):
    def __init__(self):
        super().__init__('parameter_node')
        
        # Declare individual parameters with defaults
        self.declare_parameter('max_speed', 1.5)
        self.declare_parameter('robot_name', 'my_robot')
        self.declare_parameter('enabled', True)
        self.declare_parameter('sensor_rates', [10.0, 20.0, 30.0])
        
        # Get parameter values
        self.max_speed = self.get_parameter('max_speed').value
        self.robot_name = self.get_parameter('robot_name').value
        self.enabled = self.get_parameter('enabled').value
        
        self.get_logger().info(f'Robot: {self.robot_name}, Max Speed: {self.max_speed}')
```

### YAML Configuration File

```yaml
# config/params.yaml
parameter_node:
  ros__parameters:
    max_speed: 2.0
    robot_name: "advanced_robot"
    enabled: true
    sensor_rates: [15.0, 25.0, 35.0]
    thresholds:
      warning: 0.8
      critical: 0.95
```

### Setting Parameters at Runtime

```bash
# List all parameters
ros2 param list

# Get a parameter value
ros2 param get /parameter_node target_velocity

# Set a parameter value
ros2 param set /parameter_node target_velocity 1.5

# Load parameters from YAML
ros2 run my_package my_node --ros-args --params-file config/params.yaml
```

---

## 🔧 Practical Exercise: Build a Teleoperation Node

### Objective
Create a keyboard teleoperation node that publishes Twist messages to control robot movement.

### Step 1: Create Package
```bash
cd ~/ros2_ws/src
ros2 pkg create --build-type ament_python teleop_node --dependencies rclpy geometry_msgs
```

### Step 2: Implement Teleop Node

```python
"""
keyboard_teleop.py - Keyboard teleoperation node for ROS 2
"""
import rclpy
from rclpy.node import Node
from geometry_msgs.msg import Twist
import sys
import tty
import termios

class KeyboardTeleop(Node):
    # Key mappings
    KEY_UP = 'w'
    KEY_DOWN = 's'
    KEY_LEFT = 'a'
    KEY_RIGHT = 'd'
    KEY_STOP = ' '
    KEY_QUIT = 'q'
    
    # Velocity settings
    LINEAR_MAX = 1.0
    ANGULAR_MAX = 2.0
    LINEAR_STEP = 0.1
    ANGULAR_STEP = 0.2
    
    def __init__(self):
        super().__init__('keyboard_teleop')
        
        # Create publisher
        self.cmd_publisher = self.create_publisher(Twist, '/cmd_vel', 10)
        
        # Current velocity state
        self.linear_velocity = 0.0
        self.angular_velocity = 0.0
        
        # Timer for publishing
        self.timer = self.create_timer(0.1, self.publish_command)
        
        self.get_logger().info('Keyboard Teleop Started')
        self.print_help()
        
        # Setup terminal for key reading
        self.fd = sys.stdin.fileno()
        self.old_settings = termios.tcgetattr(self.fd)
    
    def print_help(self):
        self.get_logger().info('Controls:')
        self.get_logger().info('  W/↑ : Increase forward velocity')
        self.get_logger().info('  S/↓ : Decrease forward velocity')
        self.get_logger().info('  A/← : Turn left')
        self.get_logger().info('  D/→ : Turn right')
        self.get_logger().info('  SPACE : Stop')
        self.get_logger().info('  Q : Quit')
    
    def get_key(self):
        """Read a single keypress from terminal"""
        tty.setraw(sys.stdin.fileno())
        key = sys.stdin.read(1)
        termios.tcsetattr(self.fd, termios.TCSADRAIN, self.old_settings)
        return key
    
    def update_velocity(self, key):
        """Update velocity based on key press"""
        if key == self.KEY_UP:
            self.linear_velocity = min(self.linear_velocity + self.LINEAR_STEP, self.LINEAR_MAX)
        elif key == self.KEY_DOWN:
            self.linear_velocity = max(self.linear_velocity - self.LINEAR_STEP, -self.LINEAR_MAX)
        elif key == self.KEY_LEFT:
            self.angular_velocity = min(self.angular_velocity + self.ANGULAR_STEP, self.ANGULAR_MAX)
        elif key == self.KEY_RIGHT:
            self.angular_velocity = max(self.angular_velocity - self.ANGULAR_STEP, -self.ANGULAR_MAX)
        elif key == self.KEY_STOP:
            self.linear_velocity = 0.0
            self.angular_velocity = 0.0
        elif key == self.KEY_QUIT:
            return False
        
        return True
    
    def publish_command(self):
        """Publish current velocity command"""
        twist_msg = Twist()
        twist_msg.linear.x = self.linear_velocity
        twist_msg.angular.z = self.angular_velocity
        self.cmd_publisher.publish(twist_msg)
    
    def run(self):
        """Main loop"""
        try:
            while rclpy.ok():
                key = self.get_key()
                if not self.update_velocity(key):
                    break
        except KeyboardInterrupt:
            pass
        finally:
            # Stop robot on exit
            twist_msg = Twist()
            self.cmd_publisher.publish(twist_msg)
            termios.tcsetattr(self.fd, termios.TCSADRAIN, self.old_settings)
            self.destroy_node()

def main(args=None):
    rclpy.init(args=args)
    node = KeyboardTeleop()
    node.run()
    rclpy.shutdown()

if __name__ == '__main__':
    main()
```

### Step 3: Update setup.py

```python
entry_points={
    'console_scripts': [
        'keyboard_teleop = teleop_node.keyboard_teleop:main',
    ],
},
```

### Step 4: Build and Run

```bash
cd ~/ros2_ws
colcon build --symlink-install
source install/setup.bash

# Run teleop node
ros2 run teleop_node keyboard_teleop

# In another terminal, monitor commands
ros2 topic echo /cmd_vel
```

### Step 5: Test with TurtleSim (Optional)

```bash
# Install turtlesim
sudo apt install ros-humble-turtlesim

# Terminal 1: Start turtlesim
ros2 run turtlesim turtlesim_node

# Terminal 2: Run teleop
ros2 run teleop_node keyboard_teleop

# Control the turtle with W, A, S, D keys!
```

---

## 📝 Summary

### Key Takeaways

- **Package Structure** includes `package.xml`, `setup.py`, source directories, and configuration files
- **Creating Packages** uses `ros2 pkg create` with `ament_python` or `ament_cmake` build types
- **Publisher/Subscriber** pattern uses `create_publisher()` and `create_subscription()` with message types
- **Launch Files** (Python preferred) enable multi-node orchestration with parameters and arguments
- **Parameters** allow runtime configuration via YAML files and dynamic callbacks
- **Teleoperation** demonstrates practical keyboard input to Twist message conversion

### Looking Ahead

In Week 5, you'll learn to bridge AI agents to ROS 2, describe robots using URDF, and manage coordinate transforms with TF2.

---

## 📚 References

1. **Open Robotics.** Creating Your First ROS 2 Package. Official tutorial on package creation.  
   URL: https://docs.ros.org/en/humble/Tutorials/Beginner-Client-Libraries/Creating-Your-First-ROS2-Package.html

2. **Robotics Backend.** rclpy Parameters Tutorial. Comprehensive parameter management guide.  
   URL: https://roboticsbackend.com/rclpy-params-tutorial-get-set-ros2-params-with-python/

3. **GitHub.** keyboard_teleop Repository. Open-source teleoperation implementation.  
   URL: https://github.com/tonynajjar/keyboard_teleop
