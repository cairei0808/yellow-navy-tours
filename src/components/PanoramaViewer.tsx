import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

interface PanoramaViewerProps {
  imageUrl: string;
}

const PanoramaViewer = ({ imageUrl }: PanoramaViewerProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!containerRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      1,
      1100
    );
    camera.position.set(0, 0, 0);

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Create sphere geometry for panorama (larger for better quality)
    const geometry = new THREE.SphereGeometry(500, 64, 64);
    geometry.scale(-1, 1, 1); // Invert to see inside

    // Load texture with proper settings
    const textureLoader = new THREE.TextureLoader();
    textureLoader.load(
      imageUrl,
      (texture) => {
        // Configure texture for better quality
        texture.minFilter = THREE.LinearFilter;
        texture.magFilter = THREE.LinearFilter;
        texture.format = THREE.RGBAFormat;
        
        const material = new THREE.MeshBasicMaterial({
          map: texture,
          side: THREE.BackSide,
        });
        
        const sphere = new THREE.Mesh(geometry, material);
        scene.add(sphere);
        setIsLoading(false);
      },
      undefined,
      (error) => {
        console.error("Error loading panorama:", error);
        setIsLoading(false);
      }
    );

    // Mouse/Touch controls with smoother interaction
    let isUserInteracting = false;
    let onPointerDownMouseX = 0;
    let onPointerDownMouseY = 0;
    let lon = 0; // Horizontal rotation
    let onPointerDownLon = 0;
    let lat = 0; // Vertical rotation
    let onPointerDownLat = 0;

    const onPointerDown = (event: PointerEvent) => {
      isUserInteracting = true;
      onPointerDownMouseX = event.clientX;
      onPointerDownMouseY = event.clientY;
      onPointerDownLon = lon;
      onPointerDownLat = lat;
    };

    const onPointerMove = (event: PointerEvent) => {
      if (isUserInteracting) {
        lon = (onPointerDownMouseX - event.clientX) * 0.2 + onPointerDownLon;
        lat = (event.clientY - onPointerDownMouseY) * 0.2 + onPointerDownLat;
      }
    };

    const onPointerUp = () => {
      isUserInteracting = false;
    };

    const onWheel = (event: WheelEvent) => {
      event.preventDefault();
      const fov = camera.fov + event.deltaY * 0.05;
      camera.fov = THREE.MathUtils.clamp(fov, 30, 90);
      camera.updateProjectionMatrix();
    };

    // Event listeners
    const canvas = renderer.domElement;
    canvas.addEventListener("pointerdown", onPointerDown);
    canvas.addEventListener("pointermove", onPointerMove);
    canvas.addEventListener("pointerup", onPointerUp);
    canvas.addEventListener("wheel", onWheel);

    // Handle resize
    const handleResize = () => {
      if (!containerRef.current) return;
      camera.aspect = containerRef.current.clientWidth / containerRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    };
    window.addEventListener("resize", handleResize);

    // Animation loop with smooth camera updates
    const animate = () => {
      requestAnimationFrame(animate);

      // Clamp latitude to prevent flipping
      lat = Math.max(-85, Math.min(85, lat));
      
      // Calculate spherical coordinates
      const phi = THREE.MathUtils.degToRad(90 - lat);
      const theta = THREE.MathUtils.degToRad(lon);

      // Update camera target
      const target = new THREE.Vector3();
      target.x = 500 * Math.sin(phi) * Math.cos(theta);
      target.y = 500 * Math.cos(phi);
      target.z = 500 * Math.sin(phi) * Math.sin(theta);

      camera.lookAt(target);
      renderer.render(scene, camera);
    };
    animate();

    // Cleanup
    return () => {
      canvas.removeEventListener("pointerdown", onPointerDown);
      canvas.removeEventListener("pointermove", onPointerMove);
      canvas.removeEventListener("pointerup", onPointerUp);
      canvas.removeEventListener("wheel", onWheel);
      window.removeEventListener("resize", handleResize);
      renderer.dispose();
      if (containerRef.current && renderer.domElement) {
        containerRef.current.removeChild(renderer.domElement);
      }
    };
  }, [imageUrl]);

  return (
    <div ref={containerRef} className="w-full h-full relative bg-black">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/90 z-20">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-foreground">Loading 360° Tour...</p>
          </div>
        </div>
      )}
      <div className="absolute top-4 left-4 bg-background/90 backdrop-blur-sm rounded-lg px-4 py-2 text-sm text-foreground z-10 shadow-lg">
        <p className="font-semibold mb-1">💡 How to explore:</p>
        <p className="text-xs">🖱️ Click and drag to look around</p>
        <p className="text-xs">🔍 Scroll to zoom in/out</p>
      </div>
    </div>
  );
};

export default PanoramaViewer;
