const DEG = 180 / Math.PI;

export function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

export function wheelTopForState(groundY, bodyY, grounded) {
  return grounded ? clamp(groundY - bodyY - 25, 18, 57) : 38;
}

export function createVehicleState() {
  return {
    distance: 0,
    speed: 0,
    bodyY: 72,
    velocityY: 0,
    angle: 0,
    angularVelocity: 0,
    grounded: true,
    rearGroundY: 126,
    frontGroundY: 126,
    rearWheelTop: 40,
    frontWheelTop: 40,
    surfaceVelocityY: 0,
    launchCooldown: 0,
    previousDesiredBodyY: 78
  };
}

export function resetVehicle(state, groundYAt, carX) {
  const rear = groundYAt(carX + 30);
  const front = groundYAt(carX + 84);
  state.distance = 0;
  state.speed = 0;
  state.velocityY = 0;
  state.angularVelocity = 0;
  state.rearGroundY = rear;
  state.frontGroundY = front;
  state.bodyY = (rear + front) * 0.5 - 65;
  state.previousDesiredBodyY = state.bodyY;
  state.surfaceVelocityY = 0;
  state.launchCooldown = 0;
  state.rearWheelTop = wheelTopForState(rear, state.bodyY, true);
  state.frontWheelTop = wheelTopForState(front, state.bodyY, true);
  state.angle = clamp(Math.atan2(front - rear, 54) * DEG, -34, 34);
  state.grounded = true;
}

// Fixed-step, two-contact-point vehicle model tailored for QuickJS.
export function stepVehicle(state, input, tuning, groundYAt, carX) {
  const sampleDistance = Math.max(0, state.distance + state.speed);
  const rearWorld = sampleDistance + carX + 30;
  const frontWorld = sampleDistance + carX + 84;
  const rearGround = groundYAt(rearWorld);
  const frontGround = groundYAt(frontWorld);
  const groundAngle = clamp(Math.atan2(frontGround - rearGround, 54) * DEG, -42, 42);
  const desiredBodyY = (rearGround + frontGround) * 0.5 - 65;
  const terrainMotion = desiredBodyY - state.previousDesiredBodyY;
  const lookAhead = Math.max(22, Math.abs(state.speed) * 5);
  const aheadRear = groundYAt(rearWorld + lookAhead);
  const aheadFront = groundYAt(frontWorld + lookAhead);
  const aheadBodyY = (aheadRear + aheadFront) * 0.5 - 65;
  const wasGrounded = state.grounded;
  if (state.launchCooldown > 0) state.launchCooldown -= 1;
  if (wasGrounded) state.surfaceVelocityY += (terrainMotion - state.surfaceVelocityY) * 0.25;
  let contact = state.bodyY >= desiredBodyY - 4;

  // A fast car crossing the top of a hill should unload its suspension instead
  // of being magnetically pulled onto the next sample.
  const crestDrop = aheadBodyY - desiredBodyY;
  const crestLaunch = state.launchCooldown === 0 && wasGrounded && state.speed > 4.8 && terrainMotion < 0.20 && crestDrop > 1.2 && state.bodyY <= desiredBodyY + 6;
  if (crestLaunch) {
    contact = false;
    const launchVelocityY = state.surfaceVelocityY - state.speed * 0.04 - crestDrop * 0.06;
    state.velocityY = Math.min(state.velocityY, launchVelocityY);
  }

  if (!wasGrounded && contact) state.launchCooldown = 32;

  let horizontalAcceleration = 0;
  if (contact) {
    horizontalAcceleration += Math.sin(groundAngle / DEG) * 2.40;
    if (input.gas) horizontalAcceleration += tuning.engineForce * tuning.traction;
    if (input.brake) horizontalAcceleration -= state.speed > 0 ? 0.72 * tuning.traction : 0.30;
    horizontalAcceleration -= state.speed * (0.018 + (1 - tuning.traction) * 0.014);
    if (input.gas) state.angularVelocity += 0.035;
    if (input.brake) state.angularVelocity -= 0.025;
  } else {
    horizontalAcceleration -= state.speed * 0.004;
    if (input.gas) state.angularVelocity += 0.13 * (tuning.airControl || 1);
    if (input.brake) state.angularVelocity -= 0.15 * (tuning.airControl || 1);
  }

  state.speed = clamp(state.speed + horizontalAcceleration, -2.4, tuning.maxSpeed);
  if (!input.gas && !input.brake && Math.abs(state.speed) < 0.06) state.speed = 0;
  const nextDistance = state.distance + state.speed;
  if (nextDistance < 0) {
    state.distance = 0;
    state.speed = 0;
  } else {
    state.distance = nextDistance;
  }

  let verticalAcceleration = typeof tuning.gravity === 'number' ? tuning.gravity : 0.25;
  if (contact) {
    verticalAcceleration += (desiredBodyY - state.bodyY) * tuning.spring - state.velocityY * tuning.damping;
  }
  state.velocityY = clamp(state.velocityY + verticalAcceleration, -8.5, 8.5);
  state.bodyY += state.velocityY;
  if (contact && state.bodyY > desiredBodyY + 11) {
    state.bodyY = desiredBodyY + 11;
    state.velocityY *= -0.28;
  }

  if (contact) {
    state.angularVelocity += (groundAngle - state.angle) * tuning.angularSpring;
    state.angularVelocity *= tuning.angularDamping;
  } else {
    state.angularVelocity *= 0.992;
  }
  state.angularVelocity = clamp(state.angularVelocity, -3.8, 3.8);
  state.angle = clamp(state.angle + state.angularVelocity, -78, 78);

  const rearWheelTarget = wheelTopForState(rearGround, state.bodyY, contact);
  const frontWheelTarget = wheelTopForState(frontGround, state.bodyY, contact);
  state.rearWheelTop += clamp(rearWheelTarget - state.rearWheelTop, -4.8, 6.4);
  state.frontWheelTop += clamp(frontWheelTarget - state.frontWheelTop, -4.8, 6.4);
  state.grounded = contact;
  state.rearGroundY = rearGround;
  state.frontGroundY = frontGround;
  state.previousDesiredBodyY = desiredBodyY;
}



