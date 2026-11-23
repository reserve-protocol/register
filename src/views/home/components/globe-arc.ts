export const ARC_END = 1.45
export const ARC_LIFT = 0.22
export const ARC_HEAD_RADIUS = 3.2

// Leave room for a raised arc and its dot even on a narrow canvas.
export const arcGlobeRadius = (width: number, height: number) =>
  Math.max(0, (Math.min(width, height) / 2 - ARC_HEAD_RADIUS - 1) / (1 + ARC_LIFT))

// A raised arc behind the front hemisphere is still visible outside the silhouette.
export const arcVisibility = (depth: number, distance: number, radius: number) =>
  Math.max(0, Math.min(1, Math.max(depth * radius, distance - radius) / 5))

const ARC_FRONT_MARGIN = 0.2

// Depths of both ends at launch and at arrival: a flight that stays in front is never cut by the limb.
export const staysInFront = (depths: number[]) =>
  depths.every((depth) => depth >= ARC_FRONT_MARGIN)

export const arcWindow = (progress: number) => ({
  head: Math.min(1, progress),
  tail: Math.max(0, Math.min(1, progress - (ARC_END - 1))),
  opacity: Math.max(0, Math.min(1, (ARC_END - progress) / (ARC_END - 1))),
})
