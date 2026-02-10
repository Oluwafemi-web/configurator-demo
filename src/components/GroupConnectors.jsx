import { Line } from "@react-three/drei";

/**
 * GroupConnectors Component
 * Renders visual lines connecting modules that are in the same group
 */
export default function GroupConnectors({ chairs, getResolvedPosition }) {
  // Group chairs by their groupId
  const groups = new Map();
  
  chairs.forEach((chair) => {
    if (chair.groupId) {
      if (!groups.has(chair.groupId)) {
        groups.set(chair.groupId, []);
      }
      groups.get(chair.groupId).push(chair);
    }
  });
  
  // Only render connectors for groups with 2+ members
  const lines = [];
  
  groups.forEach((groupChairs) => {
    if (groupChairs.length < 2) return;
    
    // Sort chairs by X position to create a chain
    const sortedChairs = [...groupChairs].sort((a, b) => {
      const posA = getResolvedPosition(a);
      const posB = getResolvedPosition(b);
      return posA[0] - posB[0];
    });
    
    // Create lines between adjacent chairs
    for (let i = 0; i < sortedChairs.length - 1; i++) {
      const chairA = sortedChairs[i];
      const chairB = sortedChairs[i + 1];
      
      const posA = getResolvedPosition(chairA);
      const posB = getResolvedPosition(chairB);
      
      // Calculate midpoint for the connector
      const midY = 0.05; // Slightly above ground
      
      lines.push(
        <Line
          key={`${chairA.id}-${chairB.id}`}
          points={[
            [posA[0], midY, posA[2]],
            [posB[0], midY, posB[2]],
          ]}
          color="#4ade80"
          lineWidth={2}
          transparent
          opacity={0.6}
        />
      );
      
      // Add small circles at connection points
      const midX = (posA[0] + posB[0]) / 2;
      const midZ = (posA[2] + posB[2]) / 2;
      
      // Create connection indicator
      lines.push(
        <mesh key={`dot-${chairA.id}-${chairB.id}`} position={[midX, midY, midZ]}>
          <circleGeometry args={[0.08, 16]} />
          <meshBasicMaterial color="#4ade80" transparent opacity={0.8} />
        </mesh>
      );
    }
  });
  
  return <group>{lines}</group>;
}
