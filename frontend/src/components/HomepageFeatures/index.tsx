import clsx from 'clsx';
import Heading from '@theme/Heading';
import styles from './styles.module.css';

const TOPIC_CARDS = [
  {
    title: 'Foundations of Physical AI',
    description: 'Physical AI (also called Embodied AI) integrates artificial intelligence into physical systems, enabling them to perceive, reason, and act in real-world environments. Unlike traditional AI that operates purely in the digital realm, Physical AI combines sensors, machine learning, and computer vision to handle the complexity and unpredictability of physical interaction.',
    icon: '🤖',
    sources: [
      { name: 'NVIDIA Glossary', url: 'https://www.nvidia.com/en-us/glossary/embodied-ai/' },
      { name: 'arXiv: Embodied Intelligence Survey', url: 'https://arxiv.org/html/2507.00917v3' }
    ]
  },
  {
    title: 'ROS 2 Robotics',
    description: 'ROS 2 (Robot Operating System 2) is the industry-standard middleware for building robotic applications. Its core communication primitives include nodes (independent processes), topics (continuous data streams), services (request-response patterns), and actions (long-running tasks with feedback).',
    icon: '⚙️',
    sources: [
      { name: 'ROS 2 Documentation', url: 'https://docs.ros.org/en/rolling/' }
    ]
  },
  {
    title: 'Digital Twin Simulation',
    description: 'Digital Twin simulation creates virtual replicas of physical robots for safe, cost-effective testing. Gazebo provides open-source physics simulation with native ROS integration. Unity delivers high-fidelity visualization with 99.91–99.99% trajectory accuracy for teleoperation and reinforcement learning.',
    icon: '🖥️',
    sources: [
      { name: 'MDPI: Unity vs Gazebo Study', url: 'https://www.mdpi.com/2079-9292/14/2/276' }
    ]
  },
  {
    title: 'NVIDIA Isaac Platform',
    description: 'NVIDIA Isaac Sim is built on Omniverse for developing AI-driven robots in physically-based virtual environments. It provides GPU-accelerated PhysX simulation, RTX-rendered sensors, motion generation algorithms, and Isaac Lab for reinforcement learning with ROS/ROS2 bridge integration.',
    icon: '🎮',
    sources: [
      { name: 'NVIDIA Isaac Sim Docs', url: 'https://docs.isaacsim.omniverse.nvidia.com/4.5.0/' }
    ]
  },
  {
    title: 'Humanoid Robot Development',
    description: 'Humanoid development integrates kinematics (limb positioning), locomotion (bipedal walking), manipulation (dexterous control), and HRI (human-robot collaboration). Modern platforms demonstrate 28+ degrees of freedom with cable-driven hands, force-torque sensing, and vision-based navigation.',
    icon: '🚶',
    sources: [
      { name: 'thehumanoid.ai Glossary', url: 'https://thehumanoid.ai/glossary/kinematics/' },
      { name: 'Science Robotics: Humanoid Locomotion', url: 'https://hybrid-robotics.berkeley.edu/publications/ScienceRobotics2024_Learning_Humanoid_Locomotion.pdf' }
    ]
  },
  {
    title: 'Vision-Language-Action',
    description: 'VLA models unify perception, reasoning, and control into a single transformer architecture for robot manipulation. By processing multimodal inputs (images, language, proprioception) and mapping them directly to actions, VLAs enable end-to-end learning from natural language commands to task execution.',
    icon: '👁️',
    sources: [
      { name: 'IEEE: VLA Models Review', url: 'https://ieeexplore.ieee.org/iel8/6287639/10820123/11164279.pdf' },
      { name: 'Anyscale: VLA Pipelines', url: 'https://www.anyscale.com/blog/vision-language-action-pipelines-vla-robotics-ray-anyscale' }
    ]
  }
];

function Feature({title, description, icon, sources}) {
  return (
    <div className={clsx('col col--4', styles.feature)}>
      <div className={styles.featureCard}>
        <div className={styles.featureIcon}>{icon}</div>
        <Heading as="h3" className={styles.featureTitle}>
          {title}
        </Heading>
        <p className={styles.featureDescription}>{description}</p>
        <div className={styles.featureSources}>
          <strong>📚 References:</strong>
          <ul>
            {sources.map((source, idx) => (
              <li key={idx}>
                <a href={source.url} target="_blank" rel="noopener noreferrer">
                  {source.name}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default function HomepageFeatures() {
  return (
    <section className={styles.featuresSection}>
      <div className="container">
        <Heading as="h2" className={styles.sectionTitle}>
          Course Topics
        </Heading>
        <div className="row">
          {TOPIC_CARDS.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
