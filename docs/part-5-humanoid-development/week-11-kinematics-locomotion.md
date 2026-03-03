---
sidebar_position: 1
title: "Week 11: Kinematics & Locomotion"
description: "Learn humanoid robot kinematics, forward/inverse kinematics, bipedal locomotion, ZMP balance control, and whole-body control frameworks"
tags: [kinematics, inverse-kinematics, bipedal-locomotion, zmp, whole-body-control, unitree]
---

# Week 11: Kinematics & Locomotion

## 🎯 Learning Objectives

By the end of this chapter, you will be able to:

- Compute forward and inverse kinematics for humanoid robot limbs
- Explain the Zero Moment Point (ZMP) criterion for dynamic stability
- Generate bipedal gait patterns using the Linear Inverted Pendulum model
- Implement balance recovery strategies for push recovery
- Apply whole-body control frameworks for multi-task coordination
- Specify Unitree G1/H1 capabilities and use their SDKs

---

## Introduction

Humanoid robots must walk, balance, and manipulate objects—tasks that require sophisticated kinematic and dynamic control. This week, you'll learn the mathematical foundations that enable humanoid locomotion and manipulation.

The key insight: **kinematics** (motion without forces) and **dynamics** (motion with forces) must be coordinated across dozens of joints to achieve stable, purposeful movement.

---

## 1. Robot Kinematics Fundamentals

### What is Robot Kinematics?

**Robot kinematics** studies motion in robotic systems without considering the forces that cause it. It establishes the mathematical relationship between joint parameters (angles for revolute joints, displacements for prismatic joints) and the position and orientation of the robot's end-effector.

**Key Concepts:**
- **Forward Kinematics (FK):** Given joint angles, compute end-effector pose
- **Inverse Kinematics (IK):** Given desired end-effector pose, compute joint angles
- **Denavit-Hartenberg (DH) Parameters:** Standard convention for representing kinematic chains
- **Jacobian Matrix:** Relates joint velocities to end-effector velocities

### Homogeneous Transformation Matrices

Kinematic relationships are expressed using **4×4 homogeneous transformation matrices**:

```
T = | R  p |
    | 0  1 |
```

Where:
- **R** (3×3): Rotation matrix representing orientation
- **p** (3×1): Position vector (x, y, z)

**Example: 2-DOF Planar Arm Forward Kinematics**

```python
import numpy as np

def forward_kinematics_2dof(theta1, theta2, l1, l2):
    """
    Compute end-effector position for a 2-DOF planar arm.
    
    Args:
        theta1: Joint 1 angle (radians)
        theta2: Joint 2 angle (radians)
        l1: Link 1 length
        l2: Link 2 length
    
    Returns:
        (x, y): End-effector position
    """
    x = l1 * np.cos(theta1) + l2 * np.cos(theta1 + theta2)
    y = l1 * np.sin(theta1) + l2 * np.sin(theta1 + theta2)
    return x, y

# Example usage
theta1 = np.pi / 4  # 45 degrees
theta2 = np.pi / 6  # 30 degrees
l1, l2 = 1.0, 0.8

x, y = forward_kinematics_2dof(theta1, theta2, l1, l2)
print(f"End-effector position: ({x:.3f}, {y:.3f})")
```

---

## 2. Forward vs Inverse Kinematics

### Forward Kinematics

**Definition:** Forward kinematics computes the end-effector pose from known joint parameters using the product of transformation matrices:

```
T_0^n = T_0^1 × T_1^2 × T_2^3 × ... × T_(n-1)^n
```

**Characteristics:**
- ✅ Always has a unique solution
- ✅ Computationally efficient
- ✅ Straightforward implementation

### Inverse Kinematics

**Definition:** Inverse kinematics determines the joint parameters required to achieve a desired end-effector pose.

**Key Challenge:** Multiple solutions may exist (redundancy), or no solution may exist (workspace limits).

### Analytical vs Numerical Methods

| Method | Advantages | Disadvantages | Best For |
|--------|-----------|---------------|----------|
| **Analytical** | Fast, exact, finds all solutions | Robot-specific, complex derivation | 6-DOF arms with spherical wrist |
| **Numerical** | General, handles constraints | Slower, single solution, may not converge | Redundant robots, complex chains |

**Analytical Solution Example (2-DOF Planar Arm):**

```python
def inverse_kinematics_2dof(x, y, l1, l2):
    """
    Analytical inverse kinematics for 2-DOF planar arm.
    
    Returns two possible solutions (elbow up/down).
    """
    # Check if target is reachable
    r = np.sqrt(x**2 + y**2)
    if r > l1 + l2 or r < abs(l1 - l2):
        raise ValueError("Target outside workspace")
    
    # Law of cosines for theta2
    cos_theta2 = (x**2 + y**2 - l1**2 - l2**2) / (2 * l1 * l2)
    theta2_1 = np.arccos(np.clip(cos_theta2, -1, 1))  # Elbow down
    theta2_2 = -theta2_1  # Elbow up
    
    # Theta1 calculation
    phi = np.arctan2(y, x)
    psi = np.arctan2(l2 * np.sin(theta2_1), l1 + l2 * np.cos(theta2_1))
    
    theta1_1 = phi - psi
    theta1_2 = phi + psi
    
    return [(theta1_1, theta2_1), (theta1_2, theta2_2)]
```

### The Jacobian Matrix

**Definition:** The Jacobian relates joint velocities to end-effector velocities:

```
v = J(q) × q̇
```

Where:
- **v** (6×1): End-effector twist [linear velocity; angular velocity]
- **J** (6×n): Jacobian matrix
- **q̇** (n×1): Joint velocity vector

**Jacobian Computation for Revolute Joints:**

```python
def compute_jacobian(q, link_transforms):
    """
    Compute geometric Jacobian for a serial manipulator.
    """
    n = len(q)
    J = np.zeros((6, n))
    
    # Get end-effector position
    T_0_e = link_transforms[-1]
    p_e = T_0_e[:3, 3]
    
    for i in range(n):
        # Get z-axis of joint i in base frame
        T_0_i = link_transforms[i]
        z_i = T_0_i[:3, 2]
        
        # Get position of joint i in base frame
        p_i = T_0_i[:3, 3]
        
        # Linear velocity component
        J[:3, i] = np.cross(z_i, p_e - p_i)
        
        # Angular velocity component
        J[3:, i] = z_i
    
    return J
```

**Key Jacobian Applications:**
- **Singularity Detection:** `det(J·Jᵀ) = 0` indicates singularity
- **Force Transformation:** `τ = Jᵀ × F`
- **Resolved Rate Control:** `q̇ = J⁺ × v` (using pseudoinverse)
- **Redundancy Resolution:** `q̇ = J⁺ × v + (I - J⁺J) × λ`

---

## 3. Bipedal Locomotion

### Overview

Bipedal locomotion enables humanoid robots to walk on two legs, mimicking human gait patterns. The fundamental challenge is maintaining **dynamic stability** while the support base (feet) continuously changes.

### Zero Moment Point (ZMP)

**Definition:** The ZMP is the point on the ground where the net moment of inertial forces and gravity has no horizontal component. As long as the ZMP remains within the **support polygon** (area bounded by foot/feet contact), the robot remains dynamically stable.

**Stability Criterion:**
```
(x_zmp, y_zmp) ∈ Support Polygon → Stable
(x_zmp, y_zmp) ∉ Support Polygon → Unstable (will fall)
```

### Linear Inverted Pendulum (LIP) Model

The LIP model simplifies bipedal dynamics by assuming:
- All mass is concentrated at the center of mass (CoM)
- CoM height is constant
- Legs are massless

**LIP Dynamics:**

```
ẍ = (g / h) × (x - x_zmp)
ÿ = (g / h) × (y - y_zmp)
```

Where `h` is the constant CoM height.

**Capture Point:** The point where the robot must step to come to a complete stop:

```
x_capture = x_com + (ẋ_com / ω)
where ω = √(g / h)
```

### Gait Generation Pipeline

```python
class BipedalGaitGenerator:
    """Simple ZMP-based gait generator for bipedal robots."""
    
    def __init__(self, step_length=0.3, step_height=0.05, step_time=0.8):
        self.step_length = step_length
        self.step_height = step_height
        self.step_time = step_time
        
    def generate_zmp_trajectory(self, n_steps):
        """Generate ZMP reference trajectory for n steps."""
        t = np.linspace(0, n_steps * self.step_time, 1000)
        zmp_x = np.zeros_like(t)
        zmp_y = np.zeros_like(t)
        
        for i in range(n_steps):
            step_start = i * self.step_time
            step_end = (i + 1) * self.step_time
            mask = (t >= step_start) & (t < step_end)
            
            # Double support phase (first 20% of step)
            ds_duration = 0.2 * self.step_time
            ds_mask = mask & (t < step_start + ds_duration)
            
            # Single support phase
            ss_mask = mask & (t >= step_start + ds_duration)
            
            # ZMP moves from current foot to next foot
            progress = (t[ss_mask] - step_start - ds_duration) / (self.step_time - ds_duration)
            zmp_x[ss_mask] = i * self.step_length + progress * self.step_length
            
            # Lateral ZMP motion (hip sway)
            zmp_y[ds_mask] = 0.1 * (-1)**i
            zmp_y[ss_mask] = 0.1 * (-1)**i * np.cos(np.pi * progress)
        
        return t, zmp_x, zmp_y
```

---

## 4. Balance and ZMP Control

### Stability Margins

**ZMP Stability Margin:** The minimum distance from the ZMP to the edge of the support polygon.

```python
def compute_stability_margin(zmp_x, zmp_y, support_polygon):
    """Compute ZMP stability margin."""
    from scipy.spatial import ConvexHull
    
    hull = ConvexHull(support_polygon)
    min_distance = float('inf')
    
    for simplex in hull.simplices:
        p1 = support_polygon[simplex[0]]
        p2 = support_polygon[simplex[1]]
        distance = point_to_line_distance((zmp_x, zmp_y), p1, p2)
        min_distance = min(min_distance, distance)
    
    return min_distance
```

### Push Recovery Strategies

**1. Ankle Strategy:** Small disturbances corrected by ankle torque
**2. Hip Strategy:** Larger disturbances use hip motion to shift CoM
**3. Stepping Strategy:** Very large disturbances require taking a step

```python
class PushRecoveryController:
    """Hierarchical push recovery controller."""
    
    def __init__(self, robot_mass=70.0, com_height=0.8):
        self.m = robot_mass
        self.h = com_height
        self.omega = np.sqrt(9.81 / self.h)
        
        # Thresholds for different strategies
        self.ankle_threshold = 0.02  # meters
        self.hip_threshold = 0.10    # meters
        
    def compute_recovery_strategy(self, com_state, disturbance):
        """Determine and execute recovery strategy."""
        x, y, x_dot, y_dot = com_state
        
        # Compute capture point
        x_capture = x + x_dot / self.omega
        y_capture = y + y_dot / self.omega
        
        # Distance from current support
        distance = np.sqrt(x_capture**2 + y_capture**2)
        
        if distance < self.ankle_threshold:
            return 'ankle', self.compute_ankle_torque(com_state, disturbance)
        elif distance < self.hip_threshold:
            return 'hip', self.compute_hip_momentum(com_state)
        else:
            return 'step', self.compute_step_location(x_capture, y_capture)
```

---

## 5. Whole-Body Control (WBC)

### Overview

**Whole-Body Control** is an algorithmic framework for generating coordinated commands to high-DoF articulated robotic systems. WBC simultaneously handles:
- Multiple task objectives (end-effector tracking, balance, posture)
- Physical constraints (joint limits, torque limits, friction cones)
- Contact interactions (foot contacts, hand contacts)

### Floating-Base Dynamics

The equations of motion for a humanoid robot with floating base:

```
M(q)q¨ + h(q,q̇) = Sᵀτ + J_c(q)ᵀλ_c
```

Where:
- `q ∈ ℝⁿ⁺⁶`: Floating base (6 DoF) + n actuated joints
- `M`: Inertia matrix
- `h`: Coriolis, centrifugal, and gravitational effects
- `S`: Actuated joint selection matrix
- `τ`: Actuator torque
- `J_c`: Contact Jacobian
- `λ_c`: Contact wrenches

### Task Prioritization with Null-Space Projection

**Hierarchical Task Structure:**

```python
class HierarchicalWBC:
    """Whole-Body Controller with task prioritization."""
    
    def __init__(self, robot_model):
        self.robot = robot_model
        self.task_stack = []  # List of (task, priority) tuples
        
    def add_task(self, task_name, jacobian, desired_accel, priority):
        """Add task to the priority stack."""
        self.task_stack.append({
            'name': task_name,
            'J': jacobian,
            'u_desired': desired_accel,
            'priority': priority
        })
    
    def compute_torques(self, q, q_dot):
        """Compute joint torques using prioritized WBC."""
        # Sort tasks by priority
        self.task_stack.sort(key=lambda x: x['priority'])
        
        # Build QP matrices
        n_dof = len(q)
        H = np.zeros((n_dof, n_dof))
        g = np.zeros(n_dof)
        
        # Accumulate tasks from highest to lowest priority
        N = np.eye(n_dof)  # Null-space projection matrix
        
        for task in self.task_stack:
            J = task['J']
            u = task['u_desired']
            
            # Project task into null-space of higher priority tasks
            J_proj = J @ N
            
            # Compute dynamically consistent pseudoinverse
            J_pinv = np.linalg.pinv(J_proj)
            
            # Compute task contribution
            q_ddot_task = J_pinv @ (u - J @ q_dot)
            
            # Update null-space projector
            N = N @ (np.eye(n_dof) - J_pinv @ J_proj)
        
        # Solve QP for optimal torques
        # ... QP solution code ...
        
        return torques
```

**Null-Space Projection Matrix:**

```
N = I - A†A
```

Where `A` is the constraint matrix and `A†` is its pseudoinverse.

---

## 6. Unitree G1/H1 Overview

### Unitree G1 Specifications

| Specification | G1 (Base) | G1 EDU |
|--------------|-----------|--------|
| **Height** | 1,320mm (4'4") | 1,320mm |
| **Weight** | ~35 kg | ~35 kg+ |
| **Total DOF** | 23 | 23–43 |
| **Leg DOF (per leg)** | 6 | 6 |
| **Arm DOF (per arm)** | 4 | 4–7 |
| **Hand DOF** | Grip only | Up to 14 (Dex3-1) |
| **Battery Runtime** | 1.5–2 hours | 1–1.5 hours |
| **Walking Speed** | Up to 2 m/s | Up to 2 m/s |
| **Peak Joint Torque** | 120 N·m (hip/knee) | 120 N·m |
| **Price** | From $13,500 | $18,000–$25,000+ |

**Sensors:**
- 360° 3D LiDAR
- Depth camera (RealSense)
- RGB camera
- 6-axis IMU
- Foot force sensors
- Joint encoders (absolute)

**SDK Features (EDU Model):**
- Python and C++ APIs
- ROS2 compatibility
- Custom neural network deployment
- Reinforcement learning frameworks
- Sensor data streaming
- Isaac Gym sim-to-real pipeline

### Unitree H1 Specifications

| Specification | H1 | H1-2 |
|--------------|-----|------|
| **Height** | ~180 cm | ~178 cm |
| **Weight** | ~47–70 kg | ~47–70 kg |
| **Total DOF** | 27 | 27 |
| **Peak Joint Torque (Leg)** | Up to 360 N·m | Up to 360 N·m |
| **Maximum Speed** | 3.3 m/s (demonstrated) | 3.3 m/s+ |
| **Battery Capacity** | ~864 Wh | ~864 Wh |
| **Price** | ~$90,000 | RFQ-based |

**Key Capabilities:**
- Dynamic locomotion (fast walking, backflips demonstrated)
- 360° LiDAR + depth vision
- Quick-swap batteries
- Industrial applications (machine tending, intralogistics)

---

## 🔧 Practical Exercise: Compute Inverse Kinematics for a Humanoid Leg

### Problem Statement

Compute the inverse kinematics for a 6-DOF humanoid leg (3 DOF hip, 1 DOF knee, 2 DOF ankle) to place the foot at a desired position and orientation.

### Implementation

```python
import numpy as np
from scipy.optimize import least_squares

class HumanoidLegIK:
    """Inverse kinematics solver for a 6-DOF humanoid leg."""
    
    def __init__(self):
        # Link lengths (meters)
        self.thigh_length = 0.40
        self.shank_length = 0.40
        self.foot_height = 0.10
        
        # Joint limits (radians)
        self.joint_limits = {
            'hip_yaw': (-np.pi/4, np.pi/4),
            'hip_pitch': (-np.pi/3, np.pi/3),
            'hip_roll': (-np.pi/6, np.pi/6),
            'knee_pitch': (-np.pi/12, -np.pi + 0.1),
            'ankle_pitch': (-np.pi/6, np.pi/6),
            'ankle_roll': (-np.pi/12, np.pi/12)
        }
    
    def forward_kinematics(self, q):
        """Compute foot pose from joint angles."""
        hip_yaw, hip_pitch, hip_roll, knee_pitch, ankle_pitch, ankle_roll = q
        
        # Rotation matrices
        R_yaw = self.rot_z(hip_yaw)
        R_pitch_hip = self.rot_y(hip_pitch)
        R_roll_hip = self.rot_x(hip_roll)
        R_pitch_knee = self.rot_y(knee_pitch)
        R_pitch_ankle = self.rot_y(ankle_pitch)
        R_roll_ankle = self.rot_x(ankle_roll)
        
        # Hip rotation (combined)
        R_hip = R_yaw @ R_pitch_hip @ R_roll_hip
        
        # Full transformation (simplified)
        T = np.eye(4)
        T[:3, :3] = R_hip
        T[2, 3] = -(self.thigh_length + self.shank_length + self.foot_height)
        
        return T
    
    def inverse_kinematics(self, target_pos, target_ori=None, q0=None):
        """Solve inverse kinematics for desired foot pose."""
        if q0 is None:
            q0 = [0, -0.3, 0, -0.6, 0.3, 0]  # Standing pose
        
        def error_function(q):
            T = self.forward_kinematics(q)
            pos_error = T[:3, 3] - target_pos
            
            if target_ori is not None:
                R_target = self.rot_z(target_ori[2]) @ self.rot_y(target_ori[1]) @ self.rot_x(target_ori[0])
                R_actual = T[:3, :3]
                ori_error = self.rotation_error(R_actual, R_target)
                return np.concatenate([pos_error, ori_error])
            else:
                return pos_error
        
        result = least_squares(
            error_function, 
            q0,
            bounds=self.get_joint_limit_bounds()
        )
        
        return result.x, result.success
    
    def get_joint_limit_bounds(self):
        """Get joint limit bounds for optimization."""
        limits = list(self.joint_limits.values())
        lower = [l[0] for l in limits]
        upper = [l[1] for l in limits]
        return (lower, upper)
    
    # Helper rotation functions
    def rot_x(self, theta):
        c, s = np.cos(theta), np.sin(theta)
        return np.array([[1, 0, 0], [0, c, -s], [0, s, c]])
    
    def rot_y(self, theta):
        c, s = np.cos(theta), np.sin(theta)
        return np.array([[c, 0, s], [0, 1, 0], [-s, 0, c]])
    
    def rot_z(self, theta):
        c, s = np.cos(theta), np.sin(theta)
        return np.array([[c, -s, 0], [s, c, 0], [0, 0, 1]])
    
    def rotation_error(self, R1, R2):
        """Compute rotation error vector."""
        R_error = R1.T @ R2
        angle = np.arccos(np.clip((np.trace(R_error) - 1) / 2, -1, 1))
        if angle < 1e-6:
            return np.zeros(3)
        axis = np.array([R_error[2,1] - R_error[1,2],
                        R_error[0,2] - R_error[2,0],
                        R_error[1,0] - R_error[0,1]]) / (2 * np.sin(angle))
        return angle * axis

# Example usage
if __name__ == "__main__":
    leg_ik = HumanoidLegIK()
    
    # Target: foot 0.3m forward, 0.1m to the side, 0.5m down
    target_pos = [0.3, 0.1, -0.5]
    
    # Solve IK
    q, success = leg_ik.inverse_kinematics(target_pos)
    
    if success:
        print("IK Solution found:")
        joint_names = ['Hip Yaw', 'Hip Pitch', 'Hip Roll', 
                      'Knee Pitch', 'Ankle Pitch', 'Ankle Roll']
        for name, angle in zip(joint_names, q):
            print(f"  {name}: {np.degrees(angle):.1f}°")
```

### Common Pitfalls and Best Practices

| Pitfall | Solution |
|---------|----------|
| **Singularities** (knee fully extended) | Use damped least squares, avoid joint limits |
| **Multiple solutions** (elbow up/down equivalent) | Choose solution closest to current configuration |
| **Workspace limits** | Check reachability before solving |
| **Numerical instability** | Use good initial guess, add regularization |
| **Joint limit violations** | Use constrained optimization (bounds) |

---

## 📝 Summary

### Key Takeaways

- **Kinematics Fundamentals:** Forward and inverse kinematics establish the relationship between joint angles and end-effector pose using transformation matrices and the DH convention
- **Jacobian Analysis:** The Jacobian matrix connects joint velocities to end-effector velocities and is essential for singularity analysis, force control, and redundancy resolution
- **Bipedal Locomotion:** ZMP-based control ensures dynamic stability by keeping the zero moment point within the support polygon. The LIP model provides a simplified framework for gait generation
- **Balance Control:** Hierarchical recovery strategies (ankle → hip → stepping) handle disturbances of increasing magnitude. Angular momentum regulation complements ZMP control
- **Whole-Body Control:** WBC frameworks use task prioritization and null-space projection to simultaneously achieve multiple objectives while respecting physical constraints
- **Unitree Platforms:** The G1 ($13.5K–$25K) and H1 (~$90K) provide accessible research platforms with comprehensive SDKs for locomotion and manipulation development

### Looking Ahead

In Week 12, you'll learn manipulation and human-robot interaction—grasping, dexterous hand control, HRI design principles, and gesture recognition for natural robot control.

---

## 📚 References

1. **Siciliano, B., & Khatib, O. (Eds.). (2016).** *Springer Handbook of Robotics* (2nd ed.). Springer.  
   URL: https://www.springer.com/gp/book/9783319325507

2. **Kajita, S., et al. (2003).** Biped walking pattern generation by using preview control of zero-moment point. *IEEE ICRA*.  
   URL: https://ieeexplore.ieee.org/document/1241826

3. **Kim, D., et al. (2019).** Dynamic Locomotion for Passive-Ankle Biped Robots. *IEEE/RSJ IROS*.  
   URL: https://ieeexplore.ieee.org/document/8967634

4. **Unitree Robotics. (2024).** *Unitree G1/H1 Humanoid Robot Documentation*.  
   URL: https://www.unitree.com/

5. **Robotiq. (2024).** *How to Calculate a Robot's Forward Kinematics in 5 Easy Steps*.  
   URL: https://blog.robotiq.com/how-to-calculate-a-robots-forward-kinematics-in-5-easy-steps
