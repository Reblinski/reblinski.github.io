import { Container, Graphics, Assets, Sprite } from "pixi.js";

export class OffersManager {
    constructor(app, offersList) {
        this.app = app;
        this.offersList = offersList; // Tablica nazw katalogów np. ['butelka', 'szklanka']

        // Kontener na wszystkie aktywne poligony
        this.container = new Container();
        this.container.zIndex = 5; // Nad tłem, ale pod UI (scrollerem)
        this.app.stage.addChild(this.container);

        // Kontener na popup (domyślnie pusty)
        this.popupContainer = new Container();
        this.popupContainer.zIndex = 100; // Zawsze na wierzchu
        this.app.stage.addChild(this.popupContainer);
    }

    /**
     * Czyści aktualne oferty (wywoływane przy zmianie tła)
     */
    hide() {
        this.container.removeChildren();
    }

    /**
     * Ładuje oferty dla konkretnego indeksu tła
     * @param {number} bgIndex - indeks tła (0, 1, 2...)
     * @param {Sprite} bgSprite - referencja do sprite'a tła (żeby pobrać jego wymiary i pozycję)
     */
    async loadForIndex(bgIndex, bgSprite) {
        // 1. Ustawiamy kontener w lewym górnym rogu wyświetlanego obrazka
        // Pixi domyślnie centruje (anchor 0.5), więc musimy obliczyć róg.
        const startX = bgSprite.x - (bgSprite.width * bgSprite.anchor.x);
        const startY = bgSprite.y - (bgSprite.height * bgSprite.anchor.y);

        this.container.position.set(startX, startY);

        // 2. Formatowanie indeksu do nazwy pliku (np. 0 -> "_001")
        const formattedIndex = (bgIndex + 1).toString().padStart(3, '0');

        // 3. Sprawdzamy każdy katalog z listy offers
        for (const offerName of this.offersList) {
            await this.loadOneOffer(offerName, formattedIndex);
        }
    }

    async loadOneOffer(offerName, indexSuffix) {
        // Budujemy ścieżkę: assets/offers/nazwa/nazwa_NNN.txt
        // const txtPath = `/assets/offers/${offerName}/${offerName}_${indexSuffix}.txt`;
        const txtPath = `/assets/offers/${offerName}/${offerName}_${indexSuffix}.json`;
        console.log(`txtPath: ${txtPath}`)

        try {
            // Pobieramy plik tekstowy
            const response = await fetch(txtPath);

            // Jeśli plik nie istnieje (404), po prostu go pomijamy (to normalne)
            if (!response.ok) return;

            // Parsujemy treść (zakładamy, że w pliku jest JSON tablica punktów)
            const coords = await response.json();
            console.log(`coords: ${coords}`)

            // Rysujemy poligon
            this.drawClickablePolygon(coords, offerName);

        } catch (err) {
            console.warn(`Błąd przy ofercie ${offerName}:`, err);
        }
    }

    drawClickablePolygon(coords, offerName) {
        const graphics = new Graphics();

        // Rysujemy kształt
        graphics.beginPath();
        graphics.poly(coords); // coords to tablica [x,y,x,y...]
        graphics.fill({ color: 0x00FF00, alpha: 0.5 }); // Prawie niewidoczny (0.01), ale klikalny.
                                                         // Zmień alpha na 0.5, żeby widzieć strefy przy testach!
        graphics.stroke({ width: 2, color: 0xFFFF00, alpha: 1 }); // Obrys (opcjonalnie)

        // Interakcja
        graphics.eventMode = 'static';
        graphics.cursor = 'pointer';

        graphics.on('pointertap', () => {
            console.log(`Kliknięto ofertę: ${offerName}`);
            this.showPopup(offerName);
        });

        this.container.addChild(graphics);
    }

    async showPopup(offerName) {
        // Czyścimy poprzednie popupy
        this.popupContainer.removeChildren();

        // 1. Tło przyciemniające (Overlay)
        const overlay = new Graphics();
        overlay.rect(0, 0, this.app.screen.width, this.app.screen.height);
        overlay.fill({ color: 0x000000, alpha: 0.7 });
        overlay.eventMode = 'static'; // Blokuje klikanie w tło pod spodem
        // Kliknięcie w tło zamyka popup
        overlay.on('pointertap', () => this.popupContainer.removeChildren());

        this.popupContainer.addChild(overlay);

        // 2. Ładowanie obrazka oferty
        const imagePath = `/assets/offers/${offerName}/${offerName}.png`;
        try {
            const texture = await Assets.load(imagePath);
            const sprite = new Sprite(texture);

            sprite.anchor.set(0.5);
            sprite.position.set(this.app.screen.width / 2, this.app.screen.height / 2);

            // Skalowanie, jeśli obraz jest za duży
            const maxW = this.app.screen.width * 0.8;
            const maxH = this.app.screen.height * 0.8;
            const scale = Math.min(maxW / sprite.width, maxH / sprite.height, 1);
            sprite.scale.set(scale);

            this.popupContainer.addChild(sprite);
        } catch (err) {
            console.error("Nie znaleziono obrazka popupu:", imagePath);
        }
    }
}