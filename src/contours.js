import { Container, Sprite, Assets } from "pixi.js";

export class ContoursManager {
  constructor(app, offersList) {
    this.app = app;
    this.offersList = offersList;

    this.container = new Container();
    // Ustawiamy zIndex na 1:
    // 0 = Tło
    // 1 = Kontury (to my)
    // 5 = Oferty (strefy klikalne)
    this.container.zIndex = 1;
    this.app.stage.addChild(this.container);
  }

  /**
   * Czyści aktualne kontury
   */
  hide() {
    this.container.removeChildren();
  }

  /**
   * Pozycjonowanie identyczne jak w OffersManager.
   * Dzięki temu obrazek PNG (o wymiarach tła) nałoży się idealnie na tło.
   */
  reposition(screenWidth, screenHeight, bgWidth, bgHeight) {
    // Ustawiamy środek kontenera na środku ekranu
    this.container.position.set(screenWidth / 2, screenHeight / 2);

    // Przesuwamy punkt zaczepienia (pivot) o połowę wymiarów tła.
    // Dzięki temu lewy górny róg obrazka wewnątrz tego kontenera (0,0)
    // trafi idealnie w lewy górny róg tła.
    this.container.pivot.set(bgWidth / 2, bgHeight / 2);
  }

  async loadForIndex(bgIndex) {
    const formattedIndex = (bgIndex + 1).toString().padStart(3, "0");

    // Ładujemy kontury dla wszystkich zdefiniowanych ofert (np. place-01, place-02)
    for (const offerName of this.offersList) {
      await this.loadOneContour(offerName, formattedIndex);
    }
  }

  async loadOneContour(offerName, indexSuffix) {
    // Ścieżka: assets/offers/place-01/place-01_001.png
    const imagePath = `/assets/offers/${offerName}/${offerName}_${indexSuffix}.png`;

    try {
      const texture = await Assets.load(imagePath);
      this.sprite = new Sprite(texture);

      // Ważne: Skoro używamy pivota na kontenerze (tak jak w OffersManager),
      // to sprite wewnątrz musi być w pozycji 0,0.
      this.sprite.position.set(0, 0);
      this.sprite.alpha = 0.3;
      // Wyłączamy interaktywność - to tylko grafika
      this.sprite.eventMode = "none";
      // TODO: w tym samym miejscu wyświetlamy wielokąt
      // TODO: zmiana alpha powinna być wymuszana z offers.js
      // this.sprite.eventMode = "static";
      // this.sprite.on("pointerover", () => (sprite.alpha = 1.0));
      // this.sprite.on("pointerout", () => (sprite.alpha = 0.3));
      this.container.addChild(this.sprite);

      // const sprite = new Sprite(texture);
      // // Ważne: Skoro używamy pivota na kontenerze (tak jak w OffersManager),
      // // to sprite wewnątrz musi być w pozycji 0,0.
      // sprite.position.set(0, 0);
      // sprite.alpha = 0.3;
      // sprite.on("pointerover", () => (sprite.alpha = 1.0));
      // sprite.on("pointerout", () => (sprite.alpha = 0.3));

      // // Wyłączamy interaktywność - to tylko grafika
      // sprite.eventMode = "none";

      // this.container.addChild(sprite);
    } catch (err) {
      // Ignorujemy błędy - brak pliku oznacza po prostu brak konturu dla danego tła
      console.warn(`Błąd: ${err}\nBrak konturu: ${imagePath}`);
    }
  }
}
