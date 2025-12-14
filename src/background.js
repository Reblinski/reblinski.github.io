import { Sprite, Assets } from "pixi.js";

export class BackgroundManager {
    /**
     * @param {Object} app - Aplikacja Pixi
     * @param {Object} config - Obiekt konfiguracyjny (sekcja 'backgrounds' z JSONa)
     * @param {Object} callbacks - Funkcje zwrotne
     */
    constructor(app, config, callbacks = {}) {
        this.app = app;

        // Rozpakowujemy konfigurację do zmiennych w klasie
        this.folder = config.folder;      // np. "backgrounds"
        this.prefix = config.prefix;      // np. "tlo"
        this.extension = config.extension;// np. "png"
        this.totalImages = config.count;  // np. 5

        this.currentIndex = 0;

        this.onStartChange = callbacks.onStartChange || (() => {});
        this.onFinishChange = callbacks.onFinishChange || (() => {});

        this.sprite = new Sprite();
        this.sprite.anchor.set(0.5);
        this.sprite.position.set(this.app.screen.width / 2, this.app.screen.height / 2);
        this.sprite.zIndex = 0;
        this.app.stage.addChild(this.sprite);

        // Od razu ładujemy pierwszy obrazek (bo wiemy z configu, że istnieje)
        this.loadImage(0);

        window.addEventListener('resize', () => this.resize());
    }

    /**
     * Buduje ścieżkę na podstawie CONFIGU.
     * Wzór: assets/{folder}/{prefix}_{00X}.{ext}
     */
    getPathForIndex(index) {
        const fileNumber = index + 1;
        const formattedNumber = fileNumber.toString().padStart(3, '0');

        // Budujemy nazwę, np.: "tlo_001.png"
        // Jeśli prefix jest pusty, będzie "_001.png" (można to dopracować, ale załóżmy że prefix jest)
        const fileName = `${this.prefix}${formattedNumber}.${this.extension}`;

        return `/assets/${this.folder}/${fileName}`;
    }

    async move(direction) {
        if (this.totalImages === 0) return;

        this.onStartChange();

        let newIndex = this.currentIndex + direction;

        if (newIndex < 0) {
            newIndex = this.totalImages - 1;
        } else if (newIndex >= this.totalImages) {
            newIndex = 0;
        }

        await this.loadImage(newIndex);
    }

    async loadImage(index) {
        const fullPath = this.getPathForIndex(index);

        try {
            const texture = await Assets.load(fullPath);
            this.sprite.texture = texture;
            this.currentIndex = index;
            this.resize();
            this.onFinishChange(this.currentIndex);
        } catch (err) {
            console.error(`Nie udało się załadować pliku z configu: ${fullPath}`, err);
        }
    }

    resize() {
        if (this.sprite) {
            this.sprite.position.set(this.app.screen.width / 2, this.app.screen.height / 2);
        }
    }
}