export const MAPS = [
  { id: 'valley', name: '\u9752\u8349\u5c71\u8c37', icon: '\u5c71', trait: '\u5747\u8861\u8d77\u4f0f', unlockCost: 0, soil: '#9a552f', edge: '#55c94b', sky: '#78cbea', gravity: 0.25, traction: 1.0, engine: 1.0, maxSpeed: 1.0, fuelBurn: 1.0 },
  { id: 'canyon', name: '\u8d64\u5ca9\u98ce\u53e3', icon: '\u5ce1', trait: '\u9661\u5761\u98de\u8dc3', unlockCost: 15, soil: '#b84f2e', edge: '#f1b84a', sky: '#ef9a62', gravity: 0.27, traction: 0.98, engine: 0.98, maxSpeed: 0.98, fuelBurn: 1.05 },
  { id: 'moon', name: '\u6708\u5c18\u73af\u5751', icon: '\u6708', trait: '\u4f4e\u91cd\u529b\u957f\u6ede\u7a7a', unlockCost: 45, soil: '#57516f', edge: '#b8b2cb', sky: '#171936', gravity: 0.16, traction: 0.82, engine: 0.94, maxSpeed: 0.92, fuelBurn: 0.92 },
  { id: 'ice', name: '\u51b0\u539f\u6781\u5149', icon: '\u51b0', trait: '\u6e7f\u6ed1\u9ad8\u901f', unlockCost: 70, soil: '#6d91ad', edge: '#e9fbff', sky: '#83b9cf', gravity: 0.24, traction: 0.68, engine: 1.02, maxSpeed: 1.08, fuelBurn: 1.0 }
];

export const VEHICLES = [
  { id: 'buggy', name: '\u5c71\u810a\u5409\u666e', icon: 'J', trait: '\u5747\u8861\u8010\u7528', unlockCost: 0, engine: 1.0, maxSpeed: 1.0, traction: 1.0, spring: 1.0, damping: 1.0, fuel: 1.0, economy: 1.0, airControl: 1.0 },
  { id: 'beetle', name: '\u5f39\u8df3\u7532\u866b', icon: 'B', trait: '\u8f7b\u5feb\u7075\u6d3b', unlockCost: 15, engine: 1.15, maxSpeed: 1.06, traction: 0.96, spring: 1.08, damping: 0.96, fuel: 0.90, economy: 1.05, airControl: 1.18 },
  { id: 'rover', name: '\u516d\u8f6e\u6708\u8f66', icon: '6', trait: '\u6293\u5730\u7a33\u5b9a', unlockCost: 50, engine: 0.94, maxSpeed: 0.88, traction: 1.14, spring: 1.16, damping: 1.12, fuel: 1.15, economy: 0.94, airControl: 0.78 },
  { id: 'steam', name: '\u84b8\u6c7d\u77ff\u9f99', icon: 'S', trait: '\u4f4e\u901f\u626d\u529b', unlockCost: 85, engine: 1.25, maxSpeed: 0.92, traction: 1.08, spring: 0.92, damping: 1.08, fuel: 1.25, economy: 1.12, airControl: 0.88 }
];

export function findContent(items, id) {
  for (let i = 0; i < items.length; i += 1) if (items[i].id === id) return items[i];
  return items[0];
}

export function terrainElevation(mapId, worldX) {
  if (mapId === 'canyon') return 54 + Math.sin(worldX * 0.0041) * 25 + Math.sin(worldX * 0.0108 + 0.8) * 18 + Math.sin(worldX * 0.028 + 2.0) * 5;
  if (mapId === 'moon') return 42 + Math.sin(worldX * 0.0038 + 0.4) * 13 + (1 - Math.cos(worldX * 0.0105)) * 13 + Math.sin(worldX * 0.021 + 1.2) * 3;
  if (mapId === 'ice') return 50 + Math.sin(worldX * 0.0034 + 1.0) * 24 + Math.sin(worldX * 0.0081) * 8 + Math.sin(worldX * 0.018 + 0.5) * 2;
  return 52 + Math.sin(worldX * 0.0054) * 27 + Math.sin(worldX * 0.0125 + 1.7) * 13 + Math.sin(worldX * 0.024 + 0.4) * 4;
}