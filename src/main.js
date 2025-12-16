import { Application, Assets, Sprite, Text, TextStyle } from "pixi.js";
import { Scroller } from "./scroller";
import { BackgroundManager } from "./background";

(async () => {
  // 1. WCZYTANIE KONFIGURACJI (Krok zerowy)
  // Zanim zrobimy cokolwiek innego, pobieramy JSONa
  let config;
  try {
    const response = await fetch('/assets/config.json');
    if (!response.ok) throw new Error("Brak pliku config.json");
    config = await response.json();
    console.log("Konfiguracja załadowana:", config);
  } catch (err) {
    console.error("Błąd krytyczny: Nie można załadować konfiguracji!", err);
    return; // Zatrzymujemy aplikację, bo bez configu nie zadziała
  }

  // 2. Start aplikacji Pixi
  const app = new Application();
  await app.init({ background: "#1099bb", resizeTo: window });
  document.getElementById("pixi-container").appendChild(app.canvas);

  // --- UI TEKSTOWE ---
  const style = new TextStyle({
    fontFamily: 'Arial', fontSize: 24, fill: '#ffffff',
    stroke: '#000000', strokeThickness: 4,
    dropShadow: true, dropShadowBlur: 4
  });
  const counterText = new Text({ text: "...", style });
  counterText.anchor.set(0.5);
  counterText.position.set(app.screen.width / 2, app.screen.height - 50);
  counterText.zIndex = 20;
  app.stage.addChild(counterText);

  // --- TWORZENIE BACKGROUND MANAGERA ---
  // Przekazujemy mu tylko sekcję "backgrounds" z naszego JSONa!
  const bgManager = new BackgroundManager(app, config.backgrounds, {
    onStartChange: () => { },
    onFinishChange: (idx) => {
      // Korzystamy z danych z configu, które manager ma w sobie
      counterText.text = `${idx + 1} / ${bgManager.totalImages}`;
    }
  });

  // --- SCROLLER ---
  const scroller = new Scroller(app, {
    onPrevClick: () => bgManager.move(-1),
    onNextClick: () => bgManager.move(1)
  });
  /*
    // --- BUNNY ---
    const texture = await Assets.load("/assets/bunny.png");
    const bunny = new Sprite(texture);
    bunny.anchor.set(0.5);
    bunny.position.set(app.screen.width / 2, app.screen.height / 2);
    bunny.zIndex = 10;
    app.stage.addChild(bunny);

    app.ticker.add((time) => {
      bunny.rotation += 0.1 * time.deltaTime;
    });
  */
})();