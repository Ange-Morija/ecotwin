let importFailures = 0;
async function loadSdk() {
  const source = `/vendor/xeokit-sdk.es.js${importFailures ? `?retry=${importFailures}` : ""}`;
  try {
    return await import(/* @vite-ignore */ source);
  } catch (error) {
    importFailures += 1;
    throw error;
  }
}
/** The renderer owns GPU objects; React owns all visible text and controls. */
export function mountBim({
  canvas,
  onStatus,
  onSelection,
  onReady,
  onError,
}: {
  canvas: HTMLCanvasElement;
  onStatus: (text: string) => void;
  onSelection: (text: string) => void;
  onReady: () => void;
  onError: () => void;
}) {
  let disposed = false;
  // The locally pinned SDK is a browser-only external module, loaded on demand.
  let viewer: Awaited<ReturnType<typeof createViewer>> | undefined;
  async function createViewer() {
    const { Viewer } = await loadSdk();
    return new Viewer({ canvasId: canvas.id, transparent: true });
  }
  const contextLost = (event: Event) => {
    event.preventDefault();
    if (!disposed) {
      onStatus("La vue 3D a été interrompue. Réessayez de charger le modèle.");
      onError();
    }
  };
  canvas.addEventListener("webglcontextlost", contextLost);
  const ready = (async () => {
    try {
      const { XKTLoaderPlugin } = await loadSdk();
      if (disposed) return;
      const instance = await createViewer();
      if (disposed) {
        instance.destroy();
        return;
      }
      viewer = instance;
      viewer.camera.eye = [-35, 25, 35];
      viewer.camera.look = [0, 0, 0];
      viewer.camera.up = [0, 1, 0];
      const model = new XKTLoaderPlugin(viewer).load({
        id: "ecotwin",
        src: "/assets/model.xkt",
        edges: true,
      });
      model.on("loaded", () => {
        if (!disposed) {
          viewer.cameraFlight.jumpTo(model);
          onStatus("Modèle BIM chargé · XKT");
          onReady();
        }
      });
      model.on("error", () => {
        if (!disposed) {
          onStatus(
            "Le modèle n’a pas pu être chargé. Réessayez ou téléchargez le fichier XKT.",
          );
          onError();
        }
      });
      viewer.scene.input.on("mouseclicked", (position: number[]) => {
        if (disposed) return;
        const picked = viewer.scene.pick({ canvasPos: position });
        viewer.scene.setObjectsSelected(viewer.scene.selectedObjectIds, false);
        if (picked?.entity) {
          viewer.scene.setObjectsSelected([picked.entity.id], true);
          onSelection(
            `Objet BIM : ${picked.entity.id} · liaison capteur non configurée`,
          );
        } else
          onSelection(
            "Sélectionnez un élément pour consulter son identifiant BIM.",
          );
      });
    } catch {
      if (!disposed) {
        onStatus(
          "La vue 3D nécessite WebGL. Les mesures et le modèle téléchargeable restent accessibles.",
        );
        onError();
      }
    }
  })();
  return {
    ready,
    dispose() {
      disposed = true;
      canvas.removeEventListener("webglcontextlost", contextLost);
      viewer?.destroy();
      viewer = undefined;
    },
    fit: () => {
      if (matchMedia("(prefers-reduced-motion: reduce)").matches)
        viewer?.cameraFlight.jumpTo(viewer.scene);
      else viewer?.cameraFlight.flyTo(viewer.scene);
    },
    turn: (direction: number) => viewer?.camera.orbitYaw(direction * 20),
    zoom: (direction: number) => viewer?.camera.zoom(direction * 3),
    xray: (enabled: boolean) =>
      viewer?.scene.setObjectsXRayed(viewer.scene.objectIds, enabled),
    /** Storeys declared by the loaded model (IFC names, not translated). */
    levels: (): { id: string; name: string }[] =>
      viewer
        ? Object.values<{ id: string; name?: string; type: string }>(
            viewer.metaScene.metaObjects,
          )
            .filter((object) => object.type === "IfcBuildingStorey")
            .map((object) => ({
              id: object.id,
              name: object.name || object.id,
            }))
        : [],
    /** Shows one storey and x-rays the rest; null restores the whole model. */
    isolate: (levelId: string | null) => {
      if (!viewer) return;
      const scene = viewer.scene;
      scene.setObjectsXRayed(scene.objectIds, levelId !== null);
      const meta = levelId ? viewer.metaScene.metaObjects[levelId] : null;
      const ids: string[] = meta
        ? meta.getObjectIDsInSubtree().filter((id: string) => scene.objects[id])
        : [];
      if (levelId && ids.length) scene.setObjectsXRayed(ids, false);
      const target = ids.length ? { aabb: scene.getAABB(ids) } : scene;
      if (matchMedia("(prefers-reduced-motion: reduce)").matches)
        viewer.cameraFlight.jumpTo(target);
      else viewer.cameraFlight.flyTo(target);
    },
  };
}
