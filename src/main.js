import { Application, Assets, Sprite } from "pixi.js";
import { Scroller } from "./scroller";
import { BackgroundManager } from "./background";

(async () => {
  // 1. Inicjalizacja aplikacji
  const app = new Application();
  await app.init({ background: "#1099bb", resizeTo: window });
  document.getElementById("pixi-container").appendChild(app.canvas);

  // 2. Konfiguracja Background Managera
  // Zakładamy, że pliki są w: /public/assets/backgrounds/
  // I nazywają się: tlo_001.png, tlo_002.png itd.
  // const bgManager = new BackgroundManager(app, "backgrounds", "tlo", {
  const bgManager = new BackgroundManager(app, "backgrounds", "bcgdn", {
      onStartChange: () => {
          // Tutaj możesz np. wyłączyć przyciski na chwilę
          console.log("--> Rozpoczynam zmianę tła");
      },
      onFinishChange: (idx) => {
          console.log(`--> Wyświetlono tło nr ${idx + 1}`);
      }
  });

  // 3. SKANOWANIE KATALOGU (To jest ten kluczowy moment)
  // Czekamy, aż manager sprawdzi, ile plików istnieje na serwerze
  await bgManager.initAutoDetect();

  // 4. Tworzymy Scroller dopiero gdy tła są gotowe
  const scroller = new Scroller(app, {
      onPrevClick: () => bgManager.move(-1),
      onNextClick: () => bgManager.move(1)
  });

  // --- Elementy dodatkowe (Bunny) ---
  const texture = await Assets.load("/assets/bunny.png");
  const bunny = new Sprite(texture);
  bunny.anchor.set(0.5);
  bunny.position.set(app.screen.width / 2, app.screen.height / 2);
  bunny.zIndex = 10; // Ważne: królik nad tłem
  app.stage.addChild(bunny);

  app.ticker.add((time) => {
    bunny.rotation += 0.1 * time.deltaTime;
  });

})();