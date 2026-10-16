import { useEffect } from "react";
import {
  ActionLink,
  Brand,
  BuildingDrawing,
  Icon,
  MarketingNav,
  Pill,
} from "../components/ui";
export default function Landing() {
  useEffect(() => {
    document.title = "EcoTwin — Le bâtiment, dans toutes ses dimensions";
  }, []);
  return (
    <>
      <MarketingNav />
      <main id="main">
        <section className="hero">
          <div className="hero-copy">
            <h1>
              Votre bâtiment.
              <br />
              Des données
              <br />
              <span className="accent-text">pour agir.</span>
            </h1>
            <p className="hero-description">
              Réunissez vos maquettes BIM et vos données dans un même espace.
              Consultez les mesures datées, repérez les seuils dépassés et
              préparez les interventions.
            </p>
            <div className="hero-actions">
              <ActionLink to="/dashboard?mode=demo">
                Explorer le jumeau numérique
              </ActionLink>
              <a className="text-link" href="#platform">
                Découvrir la plateforme <Icon name="chevron" size={18} />
              </a>
            </div>
            <p className="quiet hero-note">
              <Icon name="check" size={16} />
              Démo accessible sans compte <span>·</span> BIM + données +
              insights
            </p>
          </div>
          <div className="hero-visual">
            <div className="visual-title">
              <span>
                <Icon name="cube" size={16} /> LE BÂTIMENT, EN CONTEXTE
              </span>
              <Pill>Aperçu illustratif</Pill>
            </div>
            <BuildingDrawing />
            <div className="visual-footer">
              <span>Du modèle à la décision</span>
              <span className="mono">IFC / XKT</span>
            </div>
          </div>
        </section>
        <section className="product-strip">
          <span>Un socle pour votre exploitation</span>
          <div>
            Maquettes BIM <span>+</span> Données terrain <span>+</span> Contexte
            métier
          </div>
        </section>
        <section id="platform" className="feature-section">
          <div className="section-heading">
            <h2>
              Reliez ce que vous voyez
              <br />à ce que vous mesurez.
            </h2>
            <p>
              Une lecture commune pour les équipes techniques, les gestionnaires
              et les décideurs.
            </p>
          </div>
          <div className="feature-grid">
            {[
              [
                "Un contexte spatial",
                "Explorez le modèle BIM, sélectionnez un objet et retrouvez sa place dans le bâtiment.",
              ],
              [
                "Des données lisibles",
                "Suivez température, humidité et qualité de l’air avec leurs unités, leur source et leur historique.",
              ],
              [
                "Des décisions éclairées",
                "Repérez les dépassements de seuil et préparez l’intégration de vos futurs outils d’IA.",
              ],
            ].map(([title, description]) => (
              <article key={title} className="feature">
                <h3>{title}</h3>
                <p>{description}</p>
              </article>
            ))}
          </div>
        </section>
        <section id="uses" className="use-section">
          <div>
            <h2>
              Un bâtiment ne s’arrête pas
              <br />à sa livraison.
            </h2>
            <p>
              Conservez le contexte du BIM pour accompagner la vie de vos
              espaces, comprendre les signaux et prioriser les interventions.
            </p>
            <ActionLink to="/dashboard?mode=demo" className="button secondary">
              Ouvrir le site de démonstration
            </ActionLink>
          </div>
          <div className="use-list">
            {[
              [
                "Surveiller",
                "Identifier les variations de confort et de qualité de l’air.",
              ],
              [
                "Explorer",
                "Replacer les observations dans le contexte du bâtiment.",
              ],
              [
                "Anticiper",
                "Préparer des analyses traçables avec vos futurs moteurs IA.",
              ],
            ].map(([title, text]) => (
              <article key={title}>
                <Icon name="check" />
                <div>
                  <h3>{title}</h3>
                  <p>{text}</p>
                </div>
              </article>
            ))}
          </div>
        </section>
        <section className="closing">
          <h2>Donnez du sens à votre bâtiment.</h2>
          <ActionLink to="/dashboard?mode=demo">Explorer EcoTwin</ActionLink>
        </section>
      </main>
      <footer className="marketing-footer">
        <Brand />
        <span>BIM. Données. Décisions.</span>
        <span>EcoTwin · Pilote de plateforme de jumeaux numériques</span>
      </footer>
    </>
  );
}
