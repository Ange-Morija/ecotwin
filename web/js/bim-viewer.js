/** One WebGL scene. No sensor/object link is inferred without a verified mapping. */
export async function mountBim({ canvas, status, selection, onReady }) {
  let viewer;
  let disposed = false;
  const dispose = () => {
    disposed = true;
    viewer?.destroy();
  };
  const ready = (async () => {
    try {
      const { Viewer, XKTLoaderPlugin } = await import(
        "/vendor/xeokit-sdk.es.js"
      );
      if (disposed) return;
      viewer = new Viewer({ canvasId: canvas.id, transparent: true });
      viewer.camera.eye = [-35, 25, 35];
      viewer.camera.look = [0, 0, 0];
      viewer.camera.up = [0, 1, 0];
      const loader = new XKTLoaderPlugin(viewer);
      const model = loader.load({
        id: "ecotwin",
        src: "/assets/model.xkt",
        edges: true,
      });
      model.on("loaded", () => {
        if (disposed) return;
        viewer.cameraFlight.jumpTo(model);
        status.textContent = "Modèle BIM chargé · XKT";
        canvas.parentElement.dataset.ready = "true";
        onReady?.();
      });
      model.on("error", () => {
        status.textContent =
          "Le modèle n’a pas pu être chargé. Réessayez en rechargeant la page.";
      });
      viewer.scene.input.on("mouseclicked", (position) => {
        const picked = viewer.scene.pick({ canvasPos: position });
        viewer.scene.setObjectsSelected(viewer.scene.selectedObjectIds, false);
        if (picked?.entity) {
          viewer.scene.setObjectsSelected([picked.entity.id], true);
          selection.textContent = `Objet BIM : ${picked.entity.id} · liaison capteur non configurée`;
        } else {
          selection.textContent =
            "Sélectionnez un élément pour consulter son identifiant BIM.";
        }
      });
      canvas.addEventListener("webglcontextlost", (event) => {
        event.preventDefault();
        status.textContent =
          "La vue 3D a été interrompue. Rechargez la page pour la rétablir.";
      });
    } catch {
      if (!disposed)
        status.textContent =
          "La vue 3D nécessite WebGL. Les mesures et le modèle téléchargeable restent accessibles.";
    }
  })();
  return {
    ready,
    dispose,
    fit: () => viewer?.cameraFlight.flyTo(viewer.scene),
    turn: (direction) => viewer?.camera.orbitYaw(direction * 20),
    zoom: (direction) => viewer?.camera.zoom(direction * 3),
    xray: (enabled) =>
      viewer?.scene.setObjectsXRayed(viewer.scene.objectIds, enabled),
  };
}
