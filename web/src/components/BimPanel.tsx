import { useEffect, useRef, useState } from "react";
import { mountBim } from "../lib/bim-engine";
import { BuildingDrawing, Button, Icon, IconButton, Pill } from "./ui";
export default function BimPanel() {
  const canvas = useRef<HTMLCanvasElement>(null);
  const engine = useRef<ReturnType<typeof mountBim> | null>(null);
  const [attempt, setAttempt] = useState(0);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const [xray, setXray] = useState(false);
  const [status, setStatus] = useState("Vue 3D disponible à la demande");
  const [selection, setSelection] = useState(
    "Sélectionnez un élément pour consulter son identifiant BIM.",
  );
  useEffect(() => {
    if (!attempt || !canvas.current) return;
    setStatus("Chargement du modèle BIM…");
    setSelection("Sélectionnez un élément pour consulter son identifiant BIM.");
    setFailed(false);
    setReady(false);
    setXray(false);
    const handle = mountBim({
      canvas: canvas.current,
      onStatus: setStatus,
      onSelection: setSelection,
      onReady: () => setReady(true),
      onError: () => {
        setFailed(true);
        setReady(false);
      },
    });
    engine.current = handle;
    return () => {
      handle.dispose();
      engine.current = null;
    };
  }, [attempt]);
  return (
    <section className="panel twin-panel">
      <div className="panel-heading">
        <div>
          <h2>Le jumeau du bâtiment</h2>
          <p className="panel-subtitle">Explorer le contexte de vos mesures</p>
        </div>
        <a
          href="/assets/model.xkt"
          download="model.xkt"
          className="icon-button"
          aria-label="Télécharger le modèle XKT"
          title="Télécharger le modèle XKT"
        >
          <Icon name="download" />
        </a>
      </div>
      <div className="twin-viewport" data-ready={ready ? "true" : "false"}>
        <canvas
          ref={canvas}
          id="twin-canvas"
          tabIndex={0}
          aria-label="Vue 3D du modèle BIM. Utilisez les boutons de rotation et de zoom pour naviguer."
        />
        <span className="model-tag">
          <Icon name="cube" size={14} />{" "}
          {ready ? "MODÈLE XKT" : "APERÇU SCHÉMATIQUE"}
        </span>
        <div className="twin-grid" />
        {!ready && (
          <div className="bim-launch">
            <span className="bim-preview-note">
              Le modèle BIM réel se charge à la demande.
            </span>
            <BuildingDrawing />
            <Button
              onClick={() => setAttempt((v) => v + 1)}
              disabled={attempt > 0 && !failed}
              className="button primary"
              symbol="cube"
            >
              {failed
                ? "Réessayer le modèle 3D"
                : attempt
                  ? "Chargement du modèle…"
                  : "Charger le modèle 3D"}
            </Button>
          </div>
        )}
        <div className="viewer-controls">
          <IconButton
            label="Ajuster la vue"
            symbol="fit"
            disabled={!ready}
            onClick={() => engine.current?.fit()}
          />
          <IconButton
            label="Tourner à gauche"
            symbol="chevron"
            disabled={!ready}
            onClick={() => engine.current?.turn(-1)}
          />
          <IconButton
            label="Tourner à droite"
            symbol="chevron"
            disabled={!ready}
            onClick={() => engine.current?.turn(1)}
          />
          <IconButton
            label="Zoomer"
            symbol="plus"
            disabled={!ready}
            onClick={() => engine.current?.zoom(-1)}
          />
          <IconButton
            label="Dézoomer"
            symbol="minus"
            disabled={!ready}
            onClick={() => engine.current?.zoom(1)}
          />
          <IconButton
            label="Afficher en transparence"
            symbol="eye"
            disabled={!ready}
            aria-pressed={xray}
            onClick={() => {
              engine.current?.xray(!xray);
              setXray(!xray);
            }}
          />
        </div>
      </div>
      <div className="twin-footer">
        <span className="twin-status" role="status">
          {status}
        </span>
        <Pill tone="neutral">Liaison capteurs à configurer</Pill>
      </div>
      <p className="bim-selection" aria-live="polite">
        {selection}
      </p>
      <div className="panel-note">
        <a href="/public/index.html">
          Ouvrir les outils BIM, maintenance et actions{" "}
          <Icon name="arrow" size={16} />
        </a>
      </div>
    </section>
  );
}
