import { useEffect, useRef, useState } from "react";
import { mountBim } from "../lib/bim-engine";
import { BuildingDrawing, Button, Icon, IconButton, Pill } from "./ui";
type Level = { id: string; name: string };
function LevelsPanel({
  levels,
  active,
  ready,
  onPick,
}: {
  levels: Level[];
  active: string | null;
  ready: boolean;
  onPick: (id: string | null) => void;
}) {
  return (
    <section
      className="float-panel levels-panel"
      aria-labelledby="levels-title"
    >
      <h2 id="levels-title">Niveaux</h2>
      {ready && levels.length ? (
        <ul>
          {[{ id: "", name: "Tous les niveaux" }, ...levels].map((level) => (
            <li key={level.id}>
              <button
                type="button"
                aria-pressed={(active ?? "") === level.id}
                onClick={() => onPick(level.id || null)}
              >
                {level.name}
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="quiet">
          {ready
            ? "Le modèle ne déclare aucun niveau."
            : "Disponible après le chargement du modèle 3D."}
        </p>
      )}
      {ready && levels.length > 0 && (
        <p className="quiet">Noms IFC du modèle, non traduits.</p>
      )}
    </section>
  );
}
function HeatmapPanel() {
  return (
    <section className="float-panel" aria-labelledby="heatmap-title">
      <h2 id="heatmap-title">Cartes thermiques</h2>
      <div className="field-disabled">
        <label htmlFor="heatmap-channel">Canal</label>
        <select id="heatmap-channel" disabled>
          <option>Aucun capteur relié</option>
        </select>
      </div>
      <p className="quiet">
        Disponible après l’association objet-capteur, encore à configurer.
      </p>
    </section>
  );
}
export default function BimPanel() {
  const canvas = useRef<HTMLCanvasElement>(null);
  const engine = useRef<ReturnType<typeof mountBim> | null>(null);
  const [attempt, setAttempt] = useState(0);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const [xray, setXray] = useState(false);
  const [levels, setLevels] = useState<Level[]>([]);
  const [level, setLevel] = useState<string | null>(null);
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
    setLevels([]);
    setLevel(null);
    const handle = mountBim({
      canvas: canvas.current,
      onStatus: setStatus,
      onSelection: setSelection,
      onReady: () => {
        setLevels(handle.levels());
        setReady(true);
      },
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
    <section className="bim-stage" aria-label="Jumeau BIM">
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
            <BuildingDrawing />
            <span className="bim-preview-note">
              Le modèle BIM réel se charge à la demande.
            </span>
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
      </div>
      <aside className="float-left" aria-label="Niveaux et cartes thermiques">
        <LevelsPanel
          levels={levels}
          active={level}
          ready={ready}
          onPick={(id) => {
            setLevel(id);
            setXray(false);
            engine.current?.isolate(id);
          }}
        />
        <HeatmapPanel />
      </aside>
      <div className="bim-hud">
        <span className="twin-status" role="status">
          {status}
        </span>
        <p className="bim-selection" aria-live="polite">
          {selection}
        </p>
        <Pill tone="neutral">Liaison capteurs à configurer</Pill>
      </div>
      <div
        className="dock viewer-controls"
        role="toolbar"
        aria-label="Navigation 3D"
      >
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
            setLevel(null);
          }}
        />
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
    </section>
  );
}
