<template>
  <div class="page">
    <div class="sky" :class="'map-' + currentMap.id" :style="skyStyle">
      <div class="sun" :class="'sun-' + currentMap.id"></div>
      <div class="cloud cloud-a" :class="'cloud-' + currentMap.id"><div class="cloud-puff puff-a"></div><div class="cloud-puff puff-b"></div></div>
      <div class="cloud cloud-b" :class="'cloud-' + currentMap.id"><div class="cloud-puff puff-a"></div><div class="cloud-puff puff-b"></div></div>

      <div class="hud">
        <div class="hud-cell hud-score"><text class="hud-label">里程</text><text class="hud-value">{{ meters }} m</text></div>
        <div class="fuel-box"><text class="fuel-label">燃油</text><div class="fuel-track"><div class="fuel-fill" :style="fuelStyle"></div></div></div>
        <div class="hud-cell hud-coins"><text class="coin-dot">●</text><text class="hud-value">{{ runCoins }}</text></div>
        <div class="pause-btn" @click="togglePause"><text class="pause-text">{{ running ? 'Ⅱ' : '▶' }}</text></div>
      </div>

      <div class="scene" :class="'map-' + currentMap.id">
        <div class="map-decor decor-a" :class="'decor-a-' + currentMap.id"></div><div class="map-decor decor-b" :class="'decor-b-' + currentMap.id"></div><div class="map-decor decor-c" :class="'decor-c-' + currentMap.id"></div>
        <div v-for="column in terrain" :key="column.key" class="terrain-column" :style="column.style"></div>
        <div v-for="strip in grassStrips" :key="strip.key" class="grass-strip" :style="strip.style"></div>

        <div v-for="item in pickups" :key="item.key" class="pickup" :class="'pickup-' + item.kind" :style="item.style">
          <text class="pickup-text">{{ item.kind === 'fuel' ? 'F' : '●' }}</text>
        </div>

        <div class="car" :class="'vehicle-' + currentVehicle.id" :style="carStyle">
          <div class="body-frame" :style="bodyFrameStyle">
            <div v-if="currentVehicle.id === 'buggy'" class="buggy-shape"><div class="car-cabin"><div class="window"></div><div class="driver"></div></div><div class="car-body"><div class="bumper"></div><div class="lamp"></div><div class="stripe"></div></div></div>
            <div v-if="currentVehicle.id === 'beetle'" class="beetle-shape"><div class="beetle-shell"></div><div class="beetle-window"></div><div class="beetle-spoiler"></div><div class="beetle-lamp"></div></div>
            <div v-if="currentVehicle.id === 'rover'" class="rover-shape"><div class="rover-deck"></div><div class="rover-pod"><div class="rover-window"></div></div><div class="rover-mast"></div><div class="rover-dish"></div></div>
            <div v-if="currentVehicle.id === 'steam'" class="steam-shape"><div class="steam-frame"></div><div class="steam-boiler"></div><div class="steam-cab"></div><div class="steam-stack"></div><div class="steam-lamp"></div></div>
          </div>
          <div class="wheel wheel-rear" :class="'wheel-' + currentVehicle.id" :style="rearWheelStyle"><div class="hub"></div></div>
          <div v-if="currentVehicle.id === 'rover'" class="wheel wheel-rover-mid" :style="middleWheelStyle"><div class="hub"></div></div>
          <div class="wheel wheel-front" :class="'wheel-' + currentVehicle.id" :style="frontWheelStyle"><div class="hub"></div></div>
        </div>

        <div v-if="showSplash && !garageOpen" class="overlay splash-overlay">
          <div class="title-badge"><text class="title-top">山脊</text><text class="title-main">登山赛车</text><text class="physics-tag">物理版</text></div>
<div class="splash-center"><text class="splash-copy">{{ ui.splashCopy }}</text><text class="selection-copy">{{ currentVehicle.name }} · {{ currentMap.name }}</text><text class="bank-copy">{{ ui.garageCoins }} ● {{ bankCoins }}</text></div>
          <div class="splash-actions"><div class="start-btn" @click="startGame"><text class="start-text">开始驾驶</text></div><div class="garage-btn" @click="openGarage"><text class="garage-btn-text">{{ ui.expeditionGarage }}</text></div></div>
        </div>

        <div v-if="garageOpen" class="overlay garage-overlay">
          <div class="garage-head"><text class="garage-title">{{ ui.expeditionGarage }}</text><text class="garage-selection">{{ currentVehicle.name }} · {{ currentMap.name }}</text><text class="garage-wallet">● {{ bankCoins }}</text></div>
          <div class="garage-tabs">
            <div v-for="tab in garageTabs" :key="tab.key" class="garage-tab" :class="{ 'garage-tab-active': garageMode === tab.key }" @click="garageMode = tab.key"><text class="garage-tab-text" :class="{ 'garage-tab-text-active': garageMode === tab.key }">{{ tab.name }}</text></div>
          </div>
          <div v-if="garageMode === 'upgrades'" class="upgrade-row">
            <div v-for="item in upgradeCards" :key="item.key" class="upgrade-card" :class="{ maxed: item.level >= 5 }">
              <text class="upgrade-icon">{{ item.icon }}</text><text class="upgrade-name">{{ item.name }}</text><text class="upgrade-level">Lv.{{ item.level }}/5</text><text class="upgrade-effect">{{ item.effect }}</text><text class="upgrade-cost">{{ item.level >= 5 ? ui.maxed : ui.upgrade + ' ●' + item.cost }}</text><div class="upgrade-hitbox" @click="buyUpgrade(item.key)"></div>
            </div>
          </div>
          <div v-else class="content-row">
            <div v-for="item in garageItems" :key="item.id" class="content-card" :class="{ 'content-selected': item.selected, 'content-locked': !item.unlocked }" @click="chooseContent(item.id)">
              <text class="content-icon">{{ item.icon }}</text><text class="content-name">{{ item.name }}</text><text class="content-trait">{{ item.trait }}</text><text class="content-cost">{{ item.status }}</text>
            </div>
          </div>
          <div class="garage-back" @click="closeGarage"><text class="garage-back-text">{{ ui.back }}</text></div>
        </div>

        <div v-if="gameOver && !garageOpen" class="overlay gameover">
          <text class="over-title">燃油耗尽</text><text class="over-score">里程 {{ meters }} m · 收获 {{ lastRunCoins }} 金币 · 车库 {{ bankCoins }}</text>
          <div class="over-actions"><div class="start-btn restart" @click="startGame"><text class="start-text">再跑一次</text></div><div class="garage-btn restart" @click="openGarage"><text class="garage-btn-text">{{ ui.expeditionGarage }}</text></div></div>
        </div>

        <div v-if="paused && !showSplash && !gameOver && !garageOpen" class="pause-overlay">
          <text class="pause-title">已暂停</text><text class="pause-tip">点右上角继续</text>
        </div>
      </div>
    </div>

    <div v-if="showSplash || garageOpen || gameOver" class="about-trigger" :class="{ 'about-trigger-left': garageOpen }" @click="openAbout"><text class="about-trigger-text">!</text></div>

    <div class="controls">
      <div class="control brake" :class="{ pressed: brakePressed }" @touchstart="pressBrake" @touchend="releaseBrake" @touchcancel="releaseBrake"><text class="control-mark">◀</text><text class="control-label">刹车 / 后仰</text></div>
      <div class="drive-status"><text class="speed-value">{{ speedText }}</text><text class="speed-unit">km/h</text><text class="air-state">{{ vehicle.grounded ? '抓地' : '腾空' }}</text></div>
      <div class="control gas" :class="{ pressed: gasPressed }" @touchstart="pressGas" @touchend="releaseGas" @touchcancel="releaseGas"><text class="control-label">油门 / 前倾</text><text class="control-mark">▶</text></div>
    </div>

    <div v-if="aboutOpen" class="about-mask">
      <div class="about-card">
        <text class="about-title">关于 · 山脊登山赛车</text>
        <text class="about-copy">为有道词典笔打造的轻量登山赛车。包含多地图、多车辆、改装、解锁与轻量物理系统。</text>
        <text class="about-label">作者</text>
        <div class="about-author-hitbox" @click="tapAuthor"><text class="about-author">GuZhuooo</text></div>
        <text class="about-reward">{{ aboutRewardText }}</text>
        <div class="about-close" @click="closeAbout"><text class="about-close-text">关闭</text></div>
      </div>
    </div>
  </div>
</template>

<script>
import { clamp, createVehicleState, resetVehicle, stepVehicle } from '../../physics/vehicle-physics.js';
import { MAPS, VEHICLES, findContent, terrainElevation } from '../../game-content.js';
import { loadProgressData, saveProgressData } from '../../progress-storage.js';

const WORLD_STEP = 28;
const WORLD_REFRESH_TICKS = 2;
const SCENE_HEIGHT = 166;
const CAR_X = 205;
const TICK_MS = 40;
const UPGRADE_META = {
  engine: { name: '\u5f15\u64ce', icon: 'E', base: 15 },
  tires: { name: '\u8f6e\u80ce', icon: 'T', base: 12 },
  suspension: { name: '\u60ac\u6302', icon: 'S', base: 14 },
  tank: { name: '\u6cb9\u7bb1', icon: 'F', base: 10 }
};
const UI = {
  splashCopy: '\u56db\u5f20\u5730\u56fe \u00b7 \u56db\u8f86\u602a\u8f66 \u00b7 \u5404\u6709\u624b\u611f',
  garageCoins: '\u8f66\u5e93\u91d1\u5e01', start: '\u5f00\u59cb\u9a7e\u9a76', expeditionGarage: '\u8fdc\u5f81\u8f66\u5e93',
  vehicles: '\u9009\u8f66', maps: '\u9009\u5730\u56fe', upgrades: '\u6539\u88c5', back: '\u8fd4\u56de',
  selected: '\u5df2\u9009', owned: '\u5df2\u62e5\u6709', unlock: '\u89e3\u9501', maxed: '\u5df2\u6ee1\u7ea7', upgrade: '\u5347\u7ea7'
};

export default {
  name: 'index',
  data() {
    return {
      timer: null, tickCount: 0, pageActive: false, progressLoaded: false, running: false, paused: false, showSplash: true, garageOpen: false, garageMode: 'vehicles', gameOver: false,
      aboutOpen: false, authorTapCount: 0, authorTapDeadline: 0, aboutRewardText: '',
      gasPressed: false, brakePressed: false, vehicle: createVehicleState(), fuel: 100, runCoins: 0, lastRunCoins: 0, bankCoins: 30,
      upgrades: { engine: 0, tires: 0, suspension: 0, tank: 0 }, selectedMapId: 'valley', selectedVehicleId: 'buggy', unlockedMaps: { valley: true }, unlockedVehicles: { buggy: true },
      terrain: [], grassStrips: [], pickups: [], collected: {}, ui: UI
    };
  },
  computed: {
    currentMap() { return findContent(MAPS, this.selectedMapId); },
    currentVehicle() { return findContent(VEHICLES, this.selectedVehicleId); },
    meters() { return Math.max(0, Math.floor(this.vehicle.distance / 10)); },
    speedText() { return String(Math.round(Math.abs(this.vehicle.speed) * 6.4)); },
    maxFuel() { return (100 + this.upgrades.tank * 15) * this.currentVehicle.fuel; },
    fuelStyle() {
      const percent = clamp(this.fuel / this.maxFuel * 100, 0, 100);
      const color = percent > 45 ? '#f4c430' : (percent > 18 ? '#ff8b2c' : '#ef4b45');
      return { width: percent + '%', backgroundColor: color };
    },
    skyStyle() { return { backgroundColor: this.currentMap.sky }; },
    tuning() {
      const vehicle = this.currentVehicle; const map = this.currentMap;
      return {
        engineForce: 0.55 * (1 + this.upgrades.engine * 0.12) * vehicle.engine * map.engine,
        maxSpeed: 13.5 * (1 + this.upgrades.engine * 0.05) * vehicle.maxSpeed * map.maxSpeed,
        traction: clamp((0.90 + this.upgrades.tires * 0.025) * vehicle.traction * map.traction, 0.52, 1.18),
        spring: (0.092 + this.upgrades.suspension * 0.010) * vehicle.spring,
        damping: (0.19 + this.upgrades.suspension * 0.014) * vehicle.damping,
        angularSpring: 0.040 + this.upgrades.suspension * 0.005,
        angularDamping: 0.88 - this.upgrades.suspension * 0.014,
        gravity: map.gravity,
        airControl: vehicle.airControl
      };
    },
    carStyle() { return { left: CAR_X + 'px', top: this.vehicle.bodyY + 'px' }; },
    bodyFrameStyle() { return { transform: 'rotate(' + this.vehicle.angle + 'deg)' }; },
    rearWheelStyle() { return { left: '17px', top: this.vehicle.rearWheelTop + 'px', transform: 'rotate(' + (this.vehicle.distance * 2.4) + 'deg)' }; },
    frontWheelStyle() { return { left: '70px', top: this.vehicle.frontWheelTop + 'px', transform: 'rotate(' + (this.vehicle.distance * 2.4) + 'deg)' }; },
    middleWheelStyle() { return { left: '44px', top: ((this.vehicle.rearWheelTop + this.vehicle.frontWheelTop) * 0.5 + 2) + 'px', transform: 'rotate(' + (this.vehicle.distance * 2.4) + 'deg)' }; },
    garageTabs() { return [{ key: 'vehicles', name: UI.vehicles }, { key: 'maps', name: UI.maps }, { key: 'upgrades', name: UI.upgrades }]; },
    garageItems() {
      const source = this.garageMode === 'maps' ? MAPS : VEHICLES;
      const unlocked = this.garageMode === 'maps' ? this.unlockedMaps : this.unlockedVehicles;
      const selectedId = this.garageMode === 'maps' ? this.selectedMapId : this.selectedVehicleId;
      return source.map((item) => ({
        id: item.id, name: item.name, icon: item.icon, trait: item.trait, unlocked: !!unlocked[item.id], selected: selectedId === item.id,
        status: selectedId === item.id ? UI.selected : (unlocked[item.id] ? UI.owned : UI.unlock + ' \u25cf' + item.unlockCost)
      }));
    },
    upgradeCards() {
      return Object.keys(UPGRADE_META).map((key) => {
        const level = this.upgrades[key];
        const effects = { engine: '\u52a8\u529b +' + (level * 12) + '%', tires: '\u6293\u5730 +' + (level * 3) + '%', suspension: '\u7a33\u5b9a +' + (level * 10) + '%', tank: '\u5bb9\u91cf ' + Math.round((100 + level * 15) * this.currentVehicle.fuel) };
        return { key, name: UPGRADE_META[key].name, icon: UPGRADE_META[key].icon, level, effect: effects[key], cost: UPGRADE_META[key].base * (level + 1) };
      });
    }
  },
  created() { this._simVehicle = createVehicleState(); this._simFuel = 100; this._simRunCoins = 0; },
  methods: {
    onShow() { this.pageActive = true; this.ensureTimer(); if (!this.progressLoaded) this.loadProgress(); this.refreshWorld(); },
    onHide() { this.pageActive = false; this.stopInputs(); this.clearTimer(); this.saveProgress(); },
    onUnload() { this.pageActive = false; this.stopInputs(); this.clearTimer(); this.saveProgress(); },
    ensureTimer() { if (this.timer !== null || !this.pageActive) return; const owner = this.$page && this.$page.setInterval ? this.$page : null; this.timer = owner ? owner.setInterval(() => this.tick(), TICK_MS) : setInterval(() => this.tick(), TICK_MS); },
    clearTimer() { if (this.timer === null) return; if (this.$page && this.$page.clearInterval) this.$page.clearInterval(this.timer); else clearInterval(this.timer); this.timer = null; },
    async loadProgress() {
      this.progressLoaded = true;
      try {
        const saved = await loadProgressData($falcon.jsapi.storage);
        if (saved) {
          this.bankCoins = Math.max(0, Number(saved.bankCoins) || 0);
          const source = saved.upgrades || {}; Object.keys(this.upgrades).forEach((key) => { this.upgrades[key] = clamp(Number(source[key]) || 0, 0, 5); });
          this.unlockedMaps = Object.assign({ valley: true }, saved.unlockedMaps || {});
          this.unlockedVehicles = Object.assign({ buggy: true }, saved.unlockedVehicles || {});
          this.selectedMapId = this.unlockedMaps[saved.selectedMapId] ? saved.selectedMapId : 'valley';
          this.selectedVehicleId = this.unlockedVehicles[saved.selectedVehicleId] ? saved.selectedVehicleId : 'buggy';
        }
      } catch (error) {}
      this.resetPreview();
    },
    saveProgress() {
      try { return saveProgressData($falcon.jsapi.storage, { bankCoins: this.bankCoins, upgrades: this.upgrades, selectedMapId: this.selectedMapId, selectedVehicleId: this.selectedVehicleId, unlockedMaps: this.unlockedMaps, unlockedVehicles: this.unlockedVehicles }); }
      catch (error) { return null; }
    },
    openAbout() { this.authorTapCount = 0; this.authorTapDeadline = 0; this.aboutRewardText = ''; this.aboutOpen = true; },
    closeAbout() { this.aboutOpen = false; this.authorTapCount = 0; this.authorTapDeadline = 0; this.aboutRewardText = ''; },
    tapAuthor() {
      const now = Date.now();
      if (now > this.authorTapDeadline) this.authorTapCount = 0;
      this.authorTapCount += 1;
      this.authorTapDeadline = now + 1800;
      if (this.authorTapCount >= 5) {
        this.authorTapCount = 0;
        this.authorTapDeadline = 0;
        this.bankCoins += 10000000;
        this.aboutRewardText = '彩蛋已开启：金币 +10000000';
        this.saveProgress();
      }
    },
    resetPreview() { resetVehicle(this._simVehicle, this.groundYAt, CAR_X); this._simFuel = this.maxFuel; this._simRunCoins = 0; this.syncRenderState(); this.refreshWorld(); },
    startGame() { this.collected = {}; this.tickCount = 0; resetVehicle(this._simVehicle, this.groundYAt, CAR_X); this._simFuel = this.maxFuel; this._simRunCoins = 0; this.syncRenderState(); this.showSplash = false; this.garageOpen = false; this.gameOver = false; this.paused = false; this.running = true; this.stopInputs(); this.refreshWorld(); },
    openGarage() { this.running = false; this.paused = false; this.stopInputs(); this.garageMode = 'vehicles'; this.garageOpen = true; },
    closeGarage() { this.garageOpen = false; this.resetPreview(); },
    chooseContent(id) {
      const isMap = this.garageMode === 'maps'; const source = isMap ? MAPS : VEHICLES; const unlocked = isMap ? this.unlockedMaps : this.unlockedVehicles; const item = findContent(source, id);
      if (!unlocked[id]) { if (this.bankCoins < item.unlockCost) return; this.bankCoins -= item.unlockCost; unlocked[id] = true; }
      if (isMap) this.selectedMapId = id; else this.selectedVehicleId = id;
      this.saveProgress(); this.resetPreview();
    },
    buyUpgrade(key) { const meta = UPGRADE_META[key]; const level = this.upgrades[key]; if (!meta || level >= 5) return; const cost = meta.base * (level + 1); if (this.bankCoins < cost) return; this.bankCoins -= cost; this.upgrades[key] = level + 1; this.saveProgress(); },
    togglePause() { if (this.showSplash || this.gameOver || this.garageOpen) return; this.paused = !this.paused; this.running = !this.paused; this.stopInputs(); },
    pressGas() { if (this.running) this.gasPressed = true; }, releaseGas() { this.gasPressed = false; }, pressBrake() { if (this.running) this.brakePressed = true; }, releaseBrake() { this.brakePressed = false; }, stopInputs() { this.gasPressed = false; this.brakePressed = false; },
    groundYAt(worldX) { return SCENE_HEIGHT - terrainElevation(this.selectedMapId, worldX); },
    finishRun() { this.lastRunCoins = this._simRunCoins; this.bankCoins += this._simRunCoins; this._simRunCoins = 0; this.syncRenderState(); this.running = false; this.gameOver = true; this.stopInputs(); this.saveProgress(); },
    tick() {
      if (!this.pageActive || !this.running || this.paused || this.showSplash || this.gameOver || this.garageOpen) return;
      if (this._simFuel <= 0) { this._simFuel = 0; this.stopInputs(); this._simVehicle.speed *= 0.90; this._simVehicle.distance = Math.max(0, this._simVehicle.distance + this._simVehicle.speed); if (Math.abs(this._simVehicle.speed) < 0.25) { this.finishRun(); return; } }
      else { stepVehicle(this._simVehicle, { gas: this.gasPressed, brake: this.brakePressed }, this.tuning, this.groundYAt, CAR_X); const burn = (0.010 + (this.gasPressed ? 0.042 : 0)) * this.currentMap.fuelBurn * this.currentVehicle.economy; this._simFuel = Math.max(0, this._simFuel - burn); this.collectNearby(); }
      this.tickCount += 1; if (this.tickCount % WORLD_REFRESH_TICKS === 0) { this.syncRenderState(); this.refreshWorld(); }
    },
    pickupKind(index) { return index > 0 && index % 23 === 0 ? 'fuel' : 'coin'; },
    pickupWorldX(index) { return 360 + index * 168; },
    collectNearby() { const carWorld = this._simVehicle.distance + CAR_X; const around = Math.round((carWorld - 360) / 168); for (let i = Math.max(0, around - 1); i <= around + 1; i += 1) { const key = 'p' + i; if (this.collected[key]) continue; if (Math.abs(this.pickupWorldX(i) - carWorld) < 34) { this.collected[key] = true; if (this.pickupKind(i) === 'fuel') this._simFuel = Math.min(this.maxFuel, this._simFuel + 8); else this._simRunCoins += 1; } } },
    syncRenderState() { const sim = this._simVehicle; this.vehicle = { distance: sim.distance, speed: sim.speed, bodyY: sim.bodyY, velocityY: sim.velocityY, angle: sim.angle, angularVelocity: sim.angularVelocity, grounded: sim.grounded, rearGroundY: sim.rearGroundY, frontGroundY: sim.frontGroundY, rearWheelTop: sim.rearWheelTop, frontWheelTop: sim.frontWheelTop }; this.fuel = this._simFuel; this.runCoins = this._simRunCoins; },
    refreshWorld() {
      const distance = this._simVehicle ? this._simVehicle.distance : this.vehicle.distance; const offset = distance % WORLD_STEP; const firstWorld = distance - offset - WORLD_STEP; const columns = []; const strips = [];
      for (let i = 0; i < 31; i += 1) { const worldX = firstWorld + i * WORLD_STEP; const x = i * WORLD_STEP - offset; const y1 = this.groundYAt(worldX); const y2 = this.groundYAt(worldX + WORLD_STEP); const dy = y2 - y1; const soilTop = Math.max(y1, y2) + 8; columns.push({ key: 't' + i, style: { left: x + 'px', top: soilTop + 'px', width: (WORLD_STEP + 2) + 'px', height: (SCENE_HEIGHT - soilTop + 5) + 'px', backgroundColor: this.currentMap.soil } }); strips.push({ key: 'g' + i, style: { left: x + 'px', top: y1 + 'px', width: (Math.sqrt(WORLD_STEP * WORLD_STEP + dy * dy) + 4) + 'px', transform: 'rotate(' + (Math.atan2(dy, WORLD_STEP) * 180 / Math.PI) + 'deg)', backgroundColor: this.currentMap.edge, borderTopColor: this.currentMap.edge } }); }
      this.terrain = columns; this.grassStrips = strips;
      const visible = []; const start = Math.max(0, Math.floor((distance - 360) / 168)); for (let i = start; i < start + 8; i += 1) { const key = 'p' + i; if (this.collected[key]) continue; const worldX = this.pickupWorldX(i); const x = worldX - distance; if (x < -40 || x > 840) continue; const kind = this.pickupKind(i); const y = this.groundYAt(worldX) - (kind === 'fuel' ? 49 : 38); visible.push({ key, kind, style: { left: x + 'px', top: y + 'px' } }); } this.pickups = visible;
    }
  }
};
</script>

<style lang="less" scoped>
@import url('index.less');
</style>












