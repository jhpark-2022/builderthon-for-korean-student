import * as THREE from "three";

/**
 * Recursively dispose a Three.js object's geometries, materials, and textures.
 * Prevents GPU memory leaks when the scene is torn down (route change / HMR).
 */
export function disposeObject(obj: THREE.Object3D): void {
  obj.traverse((node) => {
    const mesh = node as THREE.Mesh & { material?: THREE.Material | THREE.Material[] };
    if (mesh.geometry) mesh.geometry.dispose();
    if (mesh.material) {
      const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
      for (const m of mats) disposeMaterial(m);
    }
  });
}

export function disposeMaterial(mat: THREE.Material): void {
  // dispose any texture uniforms / standard maps
  for (const key of Object.keys(mat) as (keyof THREE.Material)[]) {
    const value = (mat as unknown as Record<string, unknown>)[key as string];
    if (value instanceof THREE.Texture) value.dispose();
  }
  const asShader = mat as THREE.ShaderMaterial;
  if (asShader.uniforms) {
    for (const u of Object.values(asShader.uniforms)) {
      if (u && u.value instanceof THREE.Texture) u.value.dispose();
    }
  }
  mat.dispose();
}
