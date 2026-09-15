"use client";

import * as React from "react";
import Image from "next/image";
import { Canvas, useLoader } from "@react-three/fiber";
import { Center, OrbitControls, Stage } from "@react-three/drei";
import { STLLoader } from "three/examples/jsm/loaders/STLLoader.js";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js";
import { ThreeMFLoader } from "three/examples/jsm/loaders/3MFLoader.js";
import * as THREE from "three";
import { LoaderCircleIcon } from "lucide-react";

export type ModelFileKind = "stl" | "obj" | "3mf" | "image";

export function getFileKind(file: File): ModelFileKind {
  const ext = file.name.split(".").pop()?.toLowerCase();
  if (ext === "stl") return "stl";
  if (ext === "obj") return "obj";
  if (ext === "3mf") return "3mf";
  return "image";
}

export type ModelDimensions = { heightMm: number; widthMm: number; depthMm: number };

function boxToDimensions(box: THREE.Box3): ModelDimensions {
  const size = box.getSize(new THREE.Vector3());
  return {
    heightMm: Math.round(size.y * 10) / 10,
    widthMm: Math.round(size.x * 10) / 10,
    depthMm: Math.round(size.z * 10) / 10,
  };
}

function StlMesh({
  url,
  onLoaded,
}: {
  url: string;
  onLoaded: (dimensions: ModelDimensions) => void;
}) {
  const geometry = useLoader(STLLoader, url);

  React.useEffect(() => {
    geometry.rotateX(-Math.PI / 2);
    geometry.computeBoundingBox();
    if (geometry.boundingBox) onLoaded(boxToDimensions(geometry.boundingBox));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [geometry]);

  return (
    <Center>
      <mesh geometry={geometry} castShadow receiveShadow>
        <meshStandardMaterial color="#7c7ff0" roughness={0.4} metalness={0.05} />
      </mesh>
    </Center>
  );
}

function GroupModel({
  url,
  loader,
  onLoaded,
}: {
  url: string;
  loader: typeof OBJLoader | typeof ThreeMFLoader;
  onLoaded: (dimensions: ModelDimensions) => void;
}) {
  const group = useLoader(loader, url) as THREE.Group;

  React.useEffect(() => {
    group.traverse((child) => {
      if (child instanceof THREE.Mesh && !child.material?.map) {
        child.material = new THREE.MeshStandardMaterial({
          color: "#7c7ff0",
          roughness: 0.4,
          metalness: 0.05,
        });
      }
    });
    const box = new THREE.Box3().setFromObject(group);
    onLoaded(boxToDimensions(box));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [group]);

  return (
    <Center>
      <primitive object={group} />
    </Center>
  );
}

function SceneModel({
  url,
  kind,
  onLoaded,
}: {
  url: string;
  kind: ModelFileKind;
  onLoaded: (dimensions: ModelDimensions) => void;
}) {
  if (kind === "stl") return <StlMesh url={url} onLoaded={onLoaded} />;
  if (kind === "obj") return <GroupModel url={url} loader={OBJLoader} onLoaded={onLoaded} />;
  return <GroupModel url={url} loader={ThreeMFLoader} onLoaded={onLoaded} />;
}

export function ModelViewer({
  file,
  onDimensions,
}: {
  file: File;
  onDimensions?: (dimensions: ModelDimensions) => void;
}) {
  const [loading, setLoading] = React.useState(true);
  const [failed, setFailed] = React.useState(false);
  const [objectUrl, setObjectUrl] = React.useState<string | null>(null);
  const kind = React.useMemo(() => getFileKind(file), [file]);

  React.useEffect(() => {
    // Object URLs are an external browser resource that must be created and
    // revoked in the same effect run, or Strict Mode's dev-only double
    // mount/cleanup revokes a URL a sibling render is still using.
    const url = URL.createObjectURL(file);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setObjectUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  if (!objectUrl) {
    return (
      <div className="relative aspect-square w-full animate-pulse overflow-hidden rounded-2xl bg-muted" />
    );
  }

  if (kind === "image") {
    return (
      <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-muted">
        <Image src={objectUrl} alt={file.name} fill className="object-contain" unoptimized />
      </div>
    );
  }

  return (
    <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-muted">
      {loading && !failed && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 bg-muted/80">
          <LoaderCircleIcon className="size-6 animate-spin text-primary" />
          <p className="text-xs text-muted-foreground">Loading preview…</p>
        </div>
      )}
      {failed && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 bg-muted p-6 text-center">
          <p className="text-sm font-medium">Couldn&apos;t render a preview</p>
          <p className="text-xs text-muted-foreground">
            The file was still uploaded — you can continue to the next step.
          </p>
        </div>
      )}
      <ModelErrorBoundary onError={() => setFailed(true)}>
        <Canvas
          shadows
          dpr={[1, 2]}
          camera={{ position: [3, 2, 3], fov: 40 }}
          onCreated={() => setLoading(false)}
        >
          <React.Suspense fallback={null}>
            <Stage environment="city" intensity={0.6} shadows="contact" adjustCamera={1.4}>
              <SceneModel
                url={objectUrl}
                kind={kind}
                onLoaded={(d) => {
                  setLoading(false);
                  onDimensions?.(d);
                }}
              />
            </Stage>
          </React.Suspense>
          <OrbitControls makeDefault enableDamping dampingFactor={0.15} />
        </Canvas>
      </ModelErrorBoundary>
    </div>
  );
}

class ModelErrorBoundary extends React.Component<
  { children: React.ReactNode; onError: () => void },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode; onError: () => void }) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch() {
    this.props.onError();
  }
  render() {
    if (this.state.hasError) return null;
    return this.props.children;
  }
}
