---
sidebar_position: 2
title: "Week 12: Manipulation & HRI"
description: "Learn robot grasping, dexterous hand control, HRI design principles, gesture recognition, and complete pick-and-place pipelines"
tags: [robot-grasping, dexterous-manipulation, hri, gesture-recognition, pick-and-place, ros2]
---

# Week 12: Manipulation & HRI

## 🎯 Learning Objectives

By the end of this chapter, you will be able to:

- Explain grasp taxonomy and compute force closure conditions
- Describe dexterous hand designs and tendon-driven mechanisms
- Apply HRI design principles for safe, predictable robot behavior
- Implement vision-based and IMU-based gesture recognition
- Build a complete pick-and-place pipeline using ROS 2 and MoveIt 2

---

## Introduction

Humanoid robots must not only walk—they must also manipulate objects and interact naturally with humans. This week covers two critical capabilities: **manipulation** (grasping and moving objects) and **human-robot interaction** (HRI) for natural, safe collaboration.

The key insight: successful manipulation requires understanding contact mechanics and force closure, while effective HRI requires respecting human social norms and safety expectations.

---

## 1. Grasping and Manipulation

### Grasp Taxonomy

Grasp taxonomy classifies different ways robots can hold and manipulate objects. The most widely used taxonomy is based on human grasping patterns.

**Cutkosky Grasp Taxonomy (adapted for robotics):**

| Grasp Type | Description | Example Objects |
|------------|-------------|-----------------|
| **Power Grasp** | Full hand contact, force-focused | Hammer, bottle |
| **Precision Grasp** | Fingertip contact, accuracy-focused | Pen, small parts |
| **Pinch Grasp** | Thumb and one/two fingers | Coin, card |
| **Hook Grasp** | Fingers curled, no thumb | Bag handle |
| **Platform Grasp** | Palm supports from below | Plate, tray |
| **Enveloping Grasp** | Object fully surrounded | Ball, cylinder |

### Force Closure

**Definition:** A grasp achieves **force closure** if the fingers can apply arbitrary forces and moments to the object through the contacts, preventing any motion.

**Mathematical Condition:**

A grasp achieves force closure if the **grasp matrix** G has full rank and the origin lies in the interior of the convex hull of the wrench space:

```
G = [w_1 w_2 ... w_n]
```

Where each `w_i` is the wrench (force + moment) that can be applied at contact i.

**Force Closure Test:**

```python
import numpy as np
from scipy.optimize import linprog

def check_force_closure(contact_points, contact_normals, friction_coef=0.5):
    """Check if a grasp achieves force closure."""
    n_contacts = len(contact_points)
    
    # Build grasp matrix (6 wrenches per contact for 3D)
    wrenches = []
    
    for i in range(n_contacts):
        p = contact_points[i]
        n = contact_normals[i]
        
        # Generate wrench vectors within friction cone
        cone_directions = generate_friction_cone_directions(n, friction_coef)
        
        for direction in cone_directions:
            # Force vector
            f = direction
            # Moment vector (r × f)
            m = np.cross(p, f)
            # Wrench (6D: [force, moment])
            wrench = np.concatenate([f, m])
            wrenches.append(wrench)
    
    wrenches = np.array(wrenches).T  # 6 × m matrix
    
    # Check if origin is in interior of convex hull
    c = np.ones(len(wrenches.T))
    A_eq = wrenches
    b_eq = np.zeros(6)
    bounds = [(0.001, None) for _ in range(len(wrenches.T))]
    
    result = linprog(c, A_eq=A_eq, b_eq=b_eq, bounds=bounds, method='highs')
    
    return result.success
```

### Underactuated Hands

**Definition:** Underactuated hands have fewer actuators than degrees of freedom, using mechanical coupling (tendons, linkages) to achieve adaptive grasping.

**Advantages:**
- ✅ Simpler control (fewer motors)
- ✅ Lower weight and cost
- ✅ Passive adaptation to object shape
- ✅ Inherent force distribution

**Disadvantages:**
- ❌ Limited dexterity
- ❌ Cannot control individual finger joints independently
- ❌ Reduced manipulation capabilities

**Example: Robotiq 2F-85 Gripper**

```python
class UnderactuatedGripper:
    """Control class for underactuated adaptive gripper."""
    
    def __init__(self, max_width=0.085, max_force=85.0):
        self.max_width = max_width  # meters
        self.max_force = max_force  # Newtons
        self.current_width = max_width
        
    def grasp(self, object_width, grasp_force=None):
        """Adaptive grasp: fingers conform to object shape."""
        if grasp_force is None:
            grasp_force = self.max_force * 0.5
        
        if object_width > self.max_width:
            return False  # Object too large
        
        self.current_width = object_width
        return True
    
    def release(self):
        """Open gripper to maximum width."""
        self.current_width = self.max_width
```

---

## 2. Dexterous Hand Control

### Anthropomorphic Hand Designs

Modern dexterous hands aim to replicate human hand capabilities:

| Hand Model | DOF | Actuators | Key Features |
|------------|-----|-----------|--------------|
| **Shadow Hand** | 20 DOF / 24 movements | 20 pneumatic/electric | Research standard, tactile options |
| **Allegro Hand** | 16 DOF | 4 motors per hand | Electric, affordable |
| **Unitree Dex3-1** | 12 DOF (3 fingers × 4) | Tendon-driven | Compact, humanoid integration |
| **Tesla Optimus Hand** | 11 DOF | Tendon-driven | Force sensing, human-scale |

### Tendon-Driven Mechanisms

**Principle:** Motors located in the forearm pull tendons routed through the fingers, similar to human anatomy.

**Advantages:**
- Compact finger design (actuators proximal)
- Natural force transmission
- Backdrivable for safe interaction

**Challenges:**
- Tendon stretch and friction complicate control
- Requires tension maintenance
- Wear over time

**Tendon Routing Model:**

```python
def tendon_to_joint_mapping(tendon_forces, routing_matrix):
    """Convert tendon forces to joint torques."""
    # τ = R^T × f_tendon
    joint_torques = routing_matrix.T @ tendon_forces
    return joint_torques

def compute_tendon_tensions(desired_torques, routing_matrix, min_tension=1.0):
    """Compute tendon tensions to achieve desired joint torques."""
    from scipy.optimize import minimize
    
    n_tendons = routing_matrix.shape[1]
    
    def objective(tensions):
        # Minimize total tension (energy efficiency)
        return np.sum(tensions**2)
    
    def constraint(tensions):
        # Must achieve desired torques
        return routing_matrix @ tensions - desired_torques
    
    t0 = np.ones(n_tendons) * min_tension
    
    result = minimize(
        objective, t0,
        constraints={'type': 'eq', 'fun': constraint},
        bounds=[(min_tension, None) for _ in range(n_tendons)]
    )
    
    return result.x
```

### Tactile Feedback

**Sensor Types:**

| Sensor Type | Principle | Resolution | Applications |
|-------------|-----------|------------|--------------|
| **Capacitive** | Change in capacitance | ~1 mm | Contact detection, pressure |
| **Piezoresistive** | Resistance change under pressure | ~0.5 mm | Force measurement |
| **Optical** | Light intensity/position change | ~0.1 mm | High-res tactile imaging |
| **Magnetic** | Hall effect, inductance | ~0.2 mm | Joint position, force |

**Tactile Feedback Control Loop:**

```python
class TactileGraspController:
    """Grasp controller using tactile feedback for slip detection."""
    
    def __init__(self, slip_threshold=0.3, force_threshold=50.0):
        self.slip_threshold = slip_threshold  # m/s²
        self.force_threshold = force_threshold  # N
        self.grasp_force = 10.0
        
    def adjust_grasp(self, tactile_data, imu_data):
        """Adjust grasp force based on tactile and IMU feedback."""
        # Check for slip (high-frequency vibration in IMU)
        vibration = np.std(imu_data['acceleration'])
        
        if vibration > self.slip_threshold:
            # Increase grasp force
            self.grasp_force = min(
                self.grasp_force * 1.2,
                self.force_threshold
            )
        elif np.mean(tactile_data['pressure']) > self.force_threshold * 0.8:
            # Reduce force if too high
            self.grasp_force = max(self.grasp_force * 0.9, 5.0)
        
        return self.grasp_force
```

---

## 3. HRI Design Principles

### Core Principles

Based on comprehensive HRI research, the following principles guide effective human-robot interaction design:

| Principle | Definition | Implementation Guidelines |
|-----------|------------|--------------------------|
| **Safety** | Physical and psychological comfort | Smooth motions, proximity sensing, emergency stop |
| **Predictability** | Users understand what robot will do next | Pre-action signaling, consistent behavior |
| **Legibility** | Users can interpret robot's current behavior | Clear motion cues, status indicators |
| **Transparency** | Robot reveals decision-making/status | Status communication, honest capability representation |
| **Proxemics** | Respect for personal space | Distance management, spatial awareness |

### Safety Implementation

**Physical Safety:**
- Force-limited joints (collaborative robot standards: ISO 10218, ISO/TS 15066)
- Rounded edges, soft materials
- Emergency stop buttons (multiple locations)
- Speed and separation monitoring

**Psychological Safety:**
- Avoid sudden, surprising motions
- Smooth, purposeful movement paced to human expectations
- Clear audio/visual signals before action

```python
class SafeMotionController:
    """Motion controller with safety constraints for HRI."""
    
    def __init__(self, max_speed_human_nearby=0.3, safe_distance=0.5):
        self.max_speed_human_nearby = max_speed_human_nearby  # m/s
        self.safe_distance = safe_distance  # meters
        self.human_detected = False
        self.human_distance = float('inf')
    
    def update_human_presence(self, distance):
        """Update human proximity from sensors."""
        self.human_detected = distance < self.safe_distance
        self.human_distance = distance
    
    def compute_safe_velocity(self, desired_velocity):
        """Scale velocity based on human proximity."""
        if not self.human_detected:
            return desired_velocity
        
        # Linear scaling based on distance
        safety_factor = min(1.0, self.human_distance / self.safe_distance)
        safety_factor = max(safety_factor, 0.2)  # Minimum speed for legibility
        
        return desired_velocity * safety_factor
```

### Proxemics

**Hall's Proxemic Zones (adapted for HRI):**

| Zone | Distance | Social Context | Robot Behavior |
|------|----------|----------------|----------------|
| **Intimate** | 0–0.45m | Close relationships | Avoid unless necessary (assistance) |
| **Personal** | 0.45–1.2m | Friends, family | Brief entry acceptable (handover) |
| **Social** | 1.2–3.6m | Acquaintances | Preferred interaction distance |
| **Public** | >3.6m | Strangers, presentations | Approach slowly, signal intent |

---

## 4. Gesture Recognition

### Vision-Based Gesture Recognition

**Pipeline:**

```
Camera Input → Hand Detection → Pose Estimation → Gesture Classification → Command
```

**Popular Frameworks:**
- **MediaPipe Hands:** Real-time 21-point hand landmark detection
- **OpenPose:** Full-body pose including hands
- **MMPose:** Modular pose estimation toolbox

**MediaPipe Example:**

```python
import cv2
import mediapipe as mp
import numpy as np

class GestureRecognizer:
    """Real-time gesture recognition using MediaPipe Hands."""
    
    def __init__(self):
        self.mp_hands = mp.solutions.hands
        self.hands = self.mp_hands.Hands(
            static_image_mode=False,
            max_num_hands=2,
            min_detection_confidence=0.5,
            min_tracking_confidence=0.5
        )
        self.finger_tip_ids = [4, 8, 12, 16, 20]
    
    def detect_gesture(self, frame):
        """Detect gesture from camera frame."""
        rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        results = self.hands.process(rgb_frame)
        
        if not results.multi_hand_landmarks:
            return None, None
        
        landmarks = results.multi_hand_landmarks[0]
        gesture = self.classify_gesture(landmarks)
        
        return gesture, landmarks
    
    def classify_gesture(self, landmarks):
        """Classify gesture based on finger extension."""
        lm_list = [(lm.x, lm.y, lm.z) for lm in landmarks.landmark]
        
        # Check which fingers are extended
        fingers_extended = []
        
        # Thumb
        if lm_list[self.finger_tip_ids[0]][0] > lm_list[3][0]:
            fingers_extended.append(True)
        else:
            fingers_extended.append(False)
        
        # Other fingers
        for id in self.finger_tip_ids[1:]:
            if lm_list[id][1] < lm_list[id - 2][1]:
                fingers_extended.append(True)
            else:
                fingers_extended.append(False)
        
        # Classify based on pattern
        if all(fingers_extended):
            return "OPEN_HAND"
        elif not any(fingers_extended):
            return "FIST"
        elif fingers_extended[1] and not any(fingers_extended[2:]):
            return "POINT"
        elif fingers_extended[1] and fingers_extended[2] and not any(fingers_extended[3:]):
            return "PEACE"
        
        return "UNKNOWN"
```

### IMU-Based Gesture Recognition

**Use Cases:** Wearable devices, remote controls, robot teleoperation

```python
class IMUGestureRecognizer:
    """Gesture recognition using IMU data."""
    
    def __init__(self, sample_rate=100):
        self.sample_rate = sample_rate
        self.gesture_templates = {}
    
    def record_gesture_template(self, gesture_name, imu_data):
        """Record a gesture template for later recognition."""
        normalized = self.normalize_imu_data(imu_data)
        self.gesture_templates[gesture_name] = normalized
    
    def recognize_gesture(self, imu_data):
        """Recognize gesture from IMU data stream."""
        normalized = self.normalize_imu_data(imu_data)
        
        best_match = None
        best_score = float('inf')
        
        for name, template in self.gesture_templates.items():
            distance = self.dynamic_time_warping(normalized, template)
            if distance < best_score:
                best_score = distance
                best_match = name
        
        if best_score < 0.5:
            return best_match
        return None
    
    def dynamic_time_warping(self, seq1, seq2):
        """Compute Dynamic Time Warping distance."""
        n, m = len(seq1), len(seq2)
        dtw_matrix = np.zeros((n + 1, m + 1))
        dtw_matrix[1:, 0] = float('inf')
        dtw_matrix[0, 1:] = float('inf')
        
        for i in range(1, n + 1):
            for j in range(1, m + 1):
                cost = np.linalg.norm(seq1[i-1] - seq2[j-1])
                dtw_matrix[i, j] = cost + min(
                    dtw_matrix[i-1, j],
                    dtw_matrix[i, j-1],
                    dtw_matrix[i-1, j-1]
                )
        
        return dtw_matrix[n, m] / (n + m)
    
    def normalize_imu_data(self, data):
        """Normalize IMU data (zero mean, unit variance)."""
        mean = np.mean(data, axis=0)
        std = np.std(data, axis=0)
        return (data - mean) / (std + 1e-8)
```

---

## 5. Practical: Pick and Place Pipeline

### Complete Pipeline Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    Pick and Place Pipeline                       │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐         │
│  │  Perception │───▶│  Planning   │───▶│  Execution  │         │
│  └─────────────┘    └─────────────┘    └─────────────┘         │
│         │                  │                  │                  │
│         ▼                  ▼                  ▼                  │
│  • Point Cloud       • Path Planning    • Trajectory Follow    │
│  • Segmentation      • Grasp Planning   • Gripper Control      │
│  • Object Pose       • Collision Check  • Feedback Control     │
└─────────────────────────────────────────────────────────────────┘
```

### Perception Module

```python
import open3d as o3d
import numpy as np

class PerceptionPipeline:
    """Perception pipeline for pick and place."""
    
    def __init__(self, camera_frame="camera_link"):
        self.camera_frame = camera_frame
    
    def process_point_cloud(self, point_cloud):
        """Process raw point cloud to extract object information."""
        # 1. Downsample for efficiency
        pcd_down = point_cloud.voxel_down_sample(voxel_size=0.005)
        
        # 2. Remove outliers
        pcd_clean, _ = pcd_down.remove_statistical_outlier(
            nb_neighbors=20, std_ratio=2.0
        )
        
        # 3. Segment support plane (table)
        plane_model, inliers = pcd_clean.segment_plane(
            distance_threshold=0.01,
            ransac_n=3,
            num_iterations=1000
        )
        
        # 4. Remove plane points (keep objects)
        object_cloud = pcd_clean.select_by_index(inliers, invert=True)
        
        # 5. Cluster objects
        clusters = self.cluster_objects(object_cloud)
        
        # 6. Estimate pose for each cluster
        objects = []
        for cluster in clusters:
            pose = self.estimate_object_pose(cluster)
            objects.append(pose)
        
        return objects, plane_model
    
    def cluster_objects(self, point_cloud, eps=0.02, min_points=100):
        """Cluster point cloud into individual objects."""
        labels = np.array(point_cloud.cluster_dbscan(
            eps=eps, min_points=min_points, print_progress=False
        ))
        
        clusters = []
        max_label = labels.max()
        for i in range(max_label + 1):
            cluster = point_cloud.select_by_index(np.where(labels == i)[0])
            if len(cluster.points) > min_points:
                clusters.append(cluster)
        
        return clusters
    
    def estimate_object_pose(self, cluster):
        """Estimate 6-DoF pose of object from point cloud cluster."""
        points = np.asarray(cluster.points)
        
        # Position: centroid
        position = np.mean(points, axis=0)
        
        # Orientation: PCA
        cov = np.cov(points.T)
        eigenvalues, eigenvectors = np.linalg.eigh(cov)
        
        idx = np.argsort(eigenvalues)[::-1]
        eigenvectors = eigenvectors[:, idx]
        
        if np.linalg.det(eigenvectors) < 0:
            eigenvectors[:, 0] *= -1
        
        return {
            'position': position,
            'orientation': eigenvectors,
            'size': np.sqrt(eigenvalues[idx]) * 4,
            'point_cloud': cluster
        }
```

### Motion Planning with MoveIt 2

```python
import moveit_commander
from geometry_msgs.msg import PoseStamped

class PickPlacePlanner:
    """Motion planning for pick and place using MoveIt 2."""
    
    def __init__(self, robot_group="arm", gripper_group="gripper"):
        moveit_commander.roscpp_initialize([])
        self.robot = moveit_commander.RobotCommander()
        self.scene = moveit_commander.PlanningSceneInterface()
        self.group = moveit_commander.MoveGroupCommander(robot_group)
        self.gripper = moveit_commander.MoveGroupCommander(gripper_group)
        
        # Planning parameters
        self.group.set_planning_time(10.0)
        self.group.set_num_planning_attempts(10)
        self.group.set_max_velocity_scaling_factor(0.5)
    
    def plan_pick(self, object_pose, pre_grasp_height=0.15, grasp_height=0.05):
        """Plan pick motion sequence."""
        waypoints = []
        
        # 1. Pre-grasp position (above object)
        pre_grasp = object_pose.copy()
        pre_grasp['position'][2] += pre_grasp_height
        waypoints.append(self.pose_to_msg(pre_grasp))
        
        # 2. Grasp position
        grasp = object_pose.copy()
        grasp['position'][2] += grasp_height
        waypoints.append(self.pose_to_msg(grasp))
        
        # 3. Compute Cartesian path
        (plan, fraction) = self.group.compute_cartesian_path(
            waypoints,
            eef_step=0.01,
            jump_threshold=0.0
        )
        
        return plan, fraction
    
    def execute_plan(self, plan):
        """Execute planned trajectory."""
        return self.group.execute(plan, wait=True)
    
    def open_gripper(self):
        """Open gripper."""
        self.gripper.set_named_target("open")
        self.gripper.go(wait=True)
    
    def close_gripper(self):
        """Close gripper."""
        self.gripper.set_named_target("close")
        self.gripper.go(wait=True)
```

### Complete Pick and Place Execution

```python
class PickPlaceExecutor:
    """Complete pick and place execution pipeline."""
    
    def __init__(self):
        self.perception = PerceptionPipeline()
        self.planner = PickPlacePlanner()
    
    def execute_pick_place(self, target_object_id, place_pose):
        """Execute complete pick and place operation."""
        print("Starting pick and place operation...")
        
        # 1. Get perception data
        point_cloud = self.capture_point_cloud()
        objects, _ = self.perception.process_point_cloud(point_cloud)
        
        # 2. Find target object
        target = None
        for obj in objects:
            if obj.get('id') == target_object_id:
                target = obj
                break
        
        if target is None:
            print("Target object not found!")
            return False
        
        # 3. Plan and execute pick
        print("Planning pick motion...")
        pick_plan, fraction = self.planner.plan_pick(target)
        
        if fraction < 0.9:
            print("Pick planning failed!")
            return False
        
        print("Executing pick...")
        self.planner.open_gripper()
        self.planner.execute_plan(pick_plan)
        self.planner.close_gripper()
        
        # 4. Plan and execute place
        print("Planning place motion...")
        place_plan, fraction = self.planner.plan_place(place_pose)
        
        if fraction < 0.9:
            print("Place planning failed!")
            return False
        
        print("Executing place...")
        self.planner.execute_plan(place_plan)
        self.planner.open_gripper()
        
        # 5. Retreat
        print("Retreating...")
        self.planner.group.set_named_target("home")
        self.planner.group.go(wait=True)
        
        print("Pick and place complete!")
        return True
```

### Common Pitfalls and Best Practices

| Pitfall | Solution |
|---------|----------|
| **Perception failures** (occlusion, lighting) | Use multiple cameras, add active illumination |
| **Planning failures** (collision) | Inflate robot model, add safety margins |
| **Grasp failures** (slip, wrong pose) | Use tactile feedback, regrasp strategies |
| **Execution errors** (tracking) | Add feedback control, reduce speed |
| **Calibration drift** | Regular recalibration, hand-eye calibration |

---

## 📝 Summary

### Key Takeaways

- **Grasping Fundamentals:** Grasp taxonomy classifies different hold types. Force closure ensures stable grasps by enabling arbitrary force application. Underactuated hands provide adaptive grasping with simpler control
- **Dexterous Hand Control:** Anthropomorphic designs replicate human capabilities. Tendon-driven mechanisms enable compact designs. Tactile feedback enables slip detection and force control
- **HRI Design Principles:** Safety, predictability, legibility, transparency, and proxemics form the foundation of effective human-robot interaction. ISO standards guide safety implementation
- **Gesture Recognition:** Vision-based (MediaPipe), IMU-based, and multimodal fusion approaches enable natural robot control. Dynamic Time Warping handles temporal variation in gestures
- **Pick and Place Pipeline:** Complete perception → planning → execution pipeline using ROS 2 and MoveIt 2. Point cloud processing, motion planning, and gripper control integrated into cohesive system

### Part 5 Complete!

You've completed the Humanoid Robot Development section. You now understand:
- Kinematics and inverse kinematics for limb control
- Bipedal locomotion with ZMP-based stability
- Whole-body control frameworks
- Manipulation and grasping fundamentals
- HRI design principles and gesture recognition
- Complete pick-and-place implementation

In Part 6, you'll explore Vision-Language-Action models and complete a capstone project integrating all concepts from this course.

---

## 📚 References

1. **Bicchi, A., & Kumar, V. (2000).** Robotic grasping and contact: A review. *IEEE ICRA*.  
   URL: https://ieeexplore.ieee.org/document/844062

2. **Argall, B. D., & Billard, A. G. (2010).** A survey of tactile human-robot interactions. *Robotics and Autonomous Systems*, 58(10), 1140-1152.  
   URL: https://www.sciencedirect.com/science/article/pii/S0921889010001188

3. **Bartneck, C., et al. (2020).** *Human-Robot Interaction: An Introduction* (2nd ed.). Cambridge University Press.  
   URL: https://www.cambridge.org/core/books/humanrobot-interaction/

4. **Automatic Addison. (2024).** *Pick and Place Task Using MoveIt 2 and Perception – ROS 2 Jazzy*.  
   URL: https://automaticaddison.com/pick-and-place-task-using-moveit-2-and-perception-ros2-jazzy/

5. **IOP Science. (2025).** A comprehensive review of dexterous robotic hands. *Bioinspiration & Biomimetics*.  
   URL: https://iopscience.iop.org/article/10.1088/1748-3190/ade7e1

6. **Interaction Design Foundation. (2024).** *Human-Robot Interaction (HRI)*.  
   URL: https://www.interaction-design.org/literature/topics/human-robot-interaction
