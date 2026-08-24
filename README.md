# 山脊登山赛车 / Youdao Hill Climb

作者：**GuZhuooo**

面向有道 Falcon/QuickJS mini-app runtime 的轻量登山赛车。包含四张地图、四辆创意车辆、车库解锁、升级、金币存档和自然腾空物理。

## 版本分支

### 通用自适应版 1.3.0

当前主源码。采用 `800` 设计宽度归一化和弹性页面高度：底部控制区固定，物理场景固定在天空区域底部；更高屏幕增加安全天空空间，不拉伸车辆和碰撞参数。

详细方案见 [`docs/SCREEN_ADAPTATION.md`](docs/SCREEN_ADAPTATION.md)。

> 目前只有 X5/cv182x、固件 3.4.6 完成实体机验证。其他 Falcon 型号属于兼容候选，不代表已经逐机验证。

### X5 专版 1.2.1

已冻结在：

```text
releases/x5-1.2.1/
```

目录中包含 X5 AMR、可复现源码 ZIP、真机截图和 SHA-256。该归档不会随通用版继续修改。

## 关于与开发后门

菜单页角落的 `!` 可打开“关于”。快速点击作者 `GuZhuooo` 五次会增加 `10000000` 金币；该入口是暂时保留、可重复触发的开发后门。

## 存档

Falcon Storage 逻辑命名空间：

```text
/userdata/miniapp/hill_climb_ridge/progress.json
```

固件公开 JSAPI 不提供普通文件 API，所以它是 storage key，并非 Linux 绝对路径上的实体 JSON 文件。1.2.1 以后会自动迁移旧 key `hill_climb_progress_v7`。

## 构建

```powershell
& 'F:\js\node.exe' `
  'C:\Users\Ianhi\AppData\Local\node\corepack\v1\pnpm\10.12.4\bin\pnpm.cjs' `
  -C ui package
```

通用版产物：

```text
ui/8001799000000002.1_3_0.amr
releases/adaptive-1.3.0/youdao-hill-climb-adaptive-1.3.0.amr
```

## 测试

```powershell
node test/adaptive-layout-smoke.mjs
node test/progress-storage-smoke.mjs
node test/vehicle-physics-smoke.mjs
node test/vehicle-physics-difficulty.mjs
node test/content-smoke.mjs
```

## 已验证设备

- SoC：cv182x / ARMv7
- 固件：3.4.6，构建于 2026-03-30
- 逻辑画布：800 × 254
- libc：glibc 2.23
- App ID：`8001799000000002`
