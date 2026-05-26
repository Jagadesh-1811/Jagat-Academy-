import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

function CursorGlobe({ className = '' }) {
  const containerRef = useRef(null);
  const animationRef = useRef(null);
  const targetRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (!containerRef.current) return undefined;

    const container = containerRef.current;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 1000);
    camera.position.z = 7;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'high-performance' });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);

    const root = new THREE.Group();
    scene.add(root);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const directLight = new THREE.DirectionalLight(0xffffff, 1.0);
    directLight.position.set(10, 10, 10);
    scene.add(directLight);

    const geometry = new THREE.IcosahedronGeometry(2.45, 3);

    const wireSphere = new THREE.Mesh(
      geometry,
      new THREE.MeshBasicMaterial({
        color: 0xffffff,
        wireframe: true,
        transparent: true,
        opacity: 0.22,
      })
    );
    root.add(wireSphere);

    const glassSphere = new THREE.Mesh(
      geometry,
      new THREE.MeshStandardMaterial({
        color: 0xffffff,
        metalness: 0.2,
        roughness: 0.12,
        transparent: true,
        opacity: 0.26,
        emissive: 0x222222,
        side: THREE.DoubleSide,
      })
    );
    root.add(glassSphere);

    const particlesCount = 110;
    const positions = new Float32Array(particlesCount * 3);
    for (let index = 0; index < particlesCount * 3; index += 1) {
      positions[index] = (Math.random() - 0.5) * 11;
    }

    const particlesGeometry = new THREE.BufferGeometry();
    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const particles = new THREE.Points(
      particlesGeometry,
      new THREE.PointsMaterial({
        size: 0.055,
        color: 0xffffff,
        transparent: true,
        opacity: 0.28,
      })
    );
    root.add(particles);

    const setSize = () => {
      const { width, height } = container.getBoundingClientRect();
      camera.aspect = width / height || 1;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height, false);
    };

    const handlePointerMove = (event) => {
      const x = (event.clientX / window.innerWidth) - 0.5;
      const y = (event.clientY / window.innerHeight) - 0.5;
      targetRef.current = {
        x: x * 1.2,
        y: y * 0.9,
      };
    };

    const handlePointerLeave = () => {
      targetRef.current = { x: 0, y: 0 };
    };

    const resizeObserver = new ResizeObserver(setSize);
    resizeObserver.observe(container);
    setSize();

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('blur', handlePointerLeave);

    let time = 0;
    const animate = () => {
      animationRef.current = requestAnimationFrame(animate);

      time += 0.0015;

      root.rotation.y += 0.0022;
      root.rotation.x += 0.0009;

      const target = targetRef.current;
      root.rotation.y += (target.x * 0.8 - root.rotation.y) * 0.045;
      root.rotation.x += (-target.y * 0.7 - root.rotation.x) * 0.045;

      glassSphere.position.y = Math.sin(time * 4) * 0.18;
      wireSphere.position.y = glassSphere.position.y;
      particles.position.y = Math.sin(time * 4) * 0.12;

      const pointerStrength = Math.abs(target.x) + Math.abs(target.y);
      glassSphere.scale.lerp(new THREE.Vector3(1 + pointerStrength * 0.04, 1 + pointerStrength * 0.04, 1 + pointerStrength * 0.04), 0.08);
      wireSphere.scale.lerp(new THREE.Vector3(1 + pointerStrength * 0.02, 1 + pointerStrength * 0.02, 1 + pointerStrength * 0.02), 0.08);

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationRef.current);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('blur', handlePointerLeave);
      resizeObserver.disconnect();
      geometry.dispose();
      wireSphere.material.dispose();
      glassSphere.material.dispose();
      particlesGeometry.dispose();
      particles.material.dispose();
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return <div ref={containerRef} className={`h-full w-full ${className}`} />;
}

export default CursorGlobe;