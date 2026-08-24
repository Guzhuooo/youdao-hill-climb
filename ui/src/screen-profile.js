export const DESIGN_WIDTH = 800;
export const MIN_LOGICAL_HEIGHT = 254;
export const CONTROL_HEIGHT = 50;
export const GAME_SCENE_HEIGHT = 166;

export function logicalHeightForPhysical(width, height) {
  const longSide = Math.max(Number(width) || 0, Number(height) || 0);
  const shortSide = Math.min(Number(width) || 0, Number(height) || 0);
  if (!longSide || !shortSide) return MIN_LOGICAL_HEIGHT;
  return Math.round(DESIGN_WIDTH * shortSide / longSide);
}

export function describeScreen(width, height) {
  const logicalHeight = logicalHeightForPhysical(width, height);
  return {
    designWidth: DESIGN_WIDTH,
    logicalHeight,
    extraSkyHeight: Math.max(0, logicalHeight - MIN_LOGICAL_HEIGHT),
    compact: logicalHeight <= MIN_LOGICAL_HEIGHT
  };
}
