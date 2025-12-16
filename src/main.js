import { Application, Assets, Sprite, Text, TextStyle } from "pixi.js";
import { Scroller } from "./scroller";
import { BackgroundManager } from "./background";
import { OffersManager } from "./offers"; // Importujemy nową klasę

(async () => {
  // 1. Ładowanie Configu
  let config;
  try {
      const response = await fetch('/assets/config.json');
      if (!response.ok) throw new Error("Brak pliku config.json");
      config = await response.json();
  } catch (err) {
      console.error("Błąd konfiguracji:", err);
      return;
  }

  const app = new Application();
  await app.init({ background: "#1099bb", resizeTo: window });
  document.getElementById("pixi-container").appendChild(app.canvas);

  // --- UI TEKSTOWE ---
  const style = new TextStyle({
      fontFamily: 'Arial', fontSize: 24, fill: '#ffffff',
      stroke: '#000000', strokeThickness: 4, dropShadow: true, dropShadowBlur: 4
  });
  const counterText = new Text({ text: "...", style });
  counterText.anchor.set(0.5);
  counterText.position.set(app.screen.width / 2, app.screen.height - 50);
  counterText.zIndex = 20;
  app.stage.addChild(counterText);


  // --- 2. INICJALIZACJA MANAGERA OFERT ---
  // Przekazujemy tablicę nazw folderów z configu (np. ["butelka", "szklanka"])
  // Jeśli w configu nie ma sekcji offers, przekazujemy pustą tablicę []
  const offersList = config.offers || [];
  const offersManager = new OffersManager(app, offersList);


  // --- 3. MANAGER TŁA Z PODPIĘCIEM OFERT ---
  const bgManager = new BackgroundManager(app, config.backgrounds, {
      onStartChange: () => {
          // Gdy tło zaczyna się zmieniać, usuwamy stare oferty
          offersManager.hide();
          counterText.text = ""; // Opcjonalnie czyścimy tekst
      },
      onFinishChange: (idx) => {
          counterText.text = `${idx + 1} / ${bgManager.totalImages}`;

          // Gdy tło jest gotowe, ładujemy oferty dla tego indeksu
          // Przekazujemy też sprite tła (bgManager.sprite), żeby policzyć współrzędne
          offersManager.loadForIndex(idx, bgManager.sprite);
      }
  });


  // --- SCROLLER ---
  const scroller = new Scroller(app, {
      onPrevClick: () => bgManager.move(-1),
      onNextClick: () => bgManager.move(1)
  });


})();