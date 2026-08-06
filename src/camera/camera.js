/**
 * YOURCRAFT - Camera System
 * FPS camera controller with pitch & yaw angle clamping
 */

export class GameCamera {
  constructor() {
    this.threeCamera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      400
    );

    this.pitch = 0; // Vertical angle (up/down)
    this.yaw = 0;   // Horizontal angle (left/right)

    window.addEventListener('resize', () => this.onResize());
  }

  update(position, eyeHeight) {
    this.threeCamera.position.set(
      position.x,
      position.y + eyeHeight,
      position.z
    );

    const euler = new THREE.Euler(0, 0, 0, 'YXZ');
    euler.x = this.pitch;
    euler.y = this.yaw;
    this.threeCamera.quaternion.setFromEuler(euler);
  }

  getForwardVector() {
    const forward = new THREE.Vector3(
      -Math.sin(this.yaw),
      0,
      -Math.cos(this.yaw)
    );
    return forward.normalize();
  }

  getRightVector() {
    const right = new THREE.Vector3(
      Math.cos(this.yaw),
      0,
      -Math.sin(this.yaw)
    );
    return right.normalize();
  }

  onResize() {
    this.threeCamera.aspect = window.innerWidth / window.innerHeight;
    this.threeCamera.updateProjectionMatrix();
  }
}
