# Falcon 屏幕自适应方案

## 结论

Falcon 当前公开 JSAPI 没有稳定的 `getSystemInfo`/屏幕尺寸接口。本项目因此不按型号硬编码，也不在业务代码中读取 `/etc/miniapp/resources/cfg.json`。

采用“固定设计宽度 + 弹性高度”的方式：

1. 使用 `setViewPort(800)`，让 Falcon 把 800 设计单位映射到设备横屏宽度。
2. 根页面和关于遮罩使用 `height: 100%`，填满 Falcon 根据设备比例提供的逻辑高度。
3. 底部操作栏固定 50 设计单位并禁止收缩。
4. 166 高的物理场景固定在天空区域底部，避免不同屏幕比例改变车辆碰撞、地形采样和腾空手感。
5. 更高屏幕增加的是 HUD 与地形之间的天空空间，不拉伸车辆、轮胎或地形。

逻辑高度近似为：

```text
logicalHeight = 800 * min(physicalWidth, physicalHeight) / max(physicalWidth, physicalHeight)
```

X5 的 800×254 环境得到 254，画面与专版保持一致；854×480 或 1280×720 环境约得到 450，多出的高度作为安全天空区域。

## 支持边界

- 最低目标逻辑高度：254。
- 目标方向：横屏。
- 仍要求设备具备 Falcon/QuickJS mini-app runtime。
- 非 Falcon 设备不能安装 AMR。
- 目前只有 X5/cv182x 固件 3.4.6 做过实体机验证；其他型号属于自适应候选，需要逐机安装验证。
