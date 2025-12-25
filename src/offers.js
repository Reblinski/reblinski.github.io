import { Container, Graphics, Assets, Sprite } from "pixi.js";

export class OffersManager {
  constructor(app, offersList) {
    this.app = app;
    this.offersList = offersList;

    this.container = new Container();
    this.container.zIndex = 5;
    this.app.stage.addChild(this.container);

    this.popupContainer = new Container();
    this.popupContainer.zIndex = 100;
    this.app.stage.addChild(this.popupContainer);
  }

  hide() {
    this.container.removeChildren();
  }

  /**
   * ZMIANA: Pozycjonowanie centralne z użyciem PIVOT
   */
  reposition(screenWidth, screenHeight, bgWidth, bgHeight) {
    // 1. Ustawiamy kontener fizycznie na środku ekranu
    this.container.position.set(screenWidth / 2, screenHeight / 2);

    // 2. Ustawiamy punkt odniesienia (pivot) na środek wymiarów tła.
    // Dzięki temu, jeśli w pliku txt masz punkt [0,0] (lewy górny róg),
    // to zostanie on narysowany w lewym górnym rogu obrazka, mimo że kontener jest na środku.
    this.container.pivot.set(bgWidth / 2, bgHeight / 2);

    // 3. Popup też centrujemy (overlay i treść)
    this.resizePopup(screenWidth, screenHeight);
  }

  resizePopup(w, h) {
    // Jeśli popup jest otwarty, musimy zaktualizować tło (overlay)
    if (this.popupContainer.children.length > 0) {
      const overlay = this.popupContainer.getChildAt(0);
      if (overlay) {
        overlay.clear();
        // Overlay rysujemy od -w/2 do w/2, żeby pokrył ekran, gdy kontener jest na środku?
        // NIE, popupContainer nie ma pivota ustawionego dynamicznie,
        // więc dla prostoty popupContainer ustawimy na 0,0 ekranu w main.js?
        // Albo zrobimy to lokalnie:

        // Najbezpieczniej overlay rysować zawsze "po całości" względem 0,0 ekranu.
        // Ale my jesteśmy wewnątrz OffersManager.
        // Dla uproszczenia załóżmy, że popupContainer NIE jest przesuwany pivotem.
        overlay.rect(0, 0, w, h);
        overlay.fill({ color: 0x000000, alpha: 0.7 });
      }

      // Obrazek popupu - zawsze na środku ekranu
      if (this.popupContainer.children.length > 1) {
        const popupSprite = this.popupContainer.getChildAt(1);
        popupSprite.position.set(w / 2, h / 2);
      }
    }
  }

  async loadForIndex(bgIndex) {
    const formattedIndex = (bgIndex + 1).toString().padStart(3, "0");
    for (const offerName of this.offersList) {
      await this.loadOneOffer(offerName, formattedIndex);
    }
  }

  async loadOneOffer(offerName, indexSuffix) {
    const txtPath = `/assets/offers/${offerName}/${offerName}_${indexSuffix}.json`;
    try {
      const response = await fetch(txtPath);
      if (!response.ok) return;
      const coords = await response.json();
      this.drawClickablePolygon(coords, offerName);
    } catch (err) {
      console.warn(`Błąd: ${err}`);
    }
  }

  drawClickablePolygon(coords, offerName) {
    const graphics = new Graphics();
    graphics.beginPath();
    graphics.poly(coords);
    graphics.fill({ color: 0x00ff00, alpha: 0.01 }); // Alpha 0.5 dla testów
    graphics.eventMode = "static";
    graphics.cursor = "pointer";

    graphics.on("pointertap", () => this.showPopup(offerName));

    this.container.addChild(graphics);
  }

  async showPopup(offerName) {
    this.popupContainer.removeChildren();

    // Overlay na cały ekran (zakładamy że popupContainer jest na 0,0)
    const overlay = new Graphics();
    overlay.rect(0, 0, this.app.screen.width, this.app.screen.height);
    overlay.fill({ color: 0x000000, alpha: 0.7 });
    overlay.eventMode = "static";
    overlay.on("pointertap", () => this.popupContainer.removeChildren());
    this.popupContainer.addChild(overlay);

    // const imagePath = `/assets/offers/${offerName}/${offerName}.png`;
    const imagePath = `/assets/offers/${offerName}/${offerName}.jpg`;
    try {
      const texture = await Assets.load(imagePath);
      const sprite = new Sprite(texture);

      // Sprite popupu centrujemy klasycznie anchorem
      sprite.anchor.set(0.5);
      sprite.position.set(
        this.app.screen.width / 2,
        this.app.screen.height / 2,
      );

      const scale = Math.min((this.app.screen.width * 0.8) / sprite.width, 1);
      sprite.scale.set(scale);

      this.popupContainer.addChild(sprite);
    } catch (err) {
      console.error(err);
    }
  }
}
