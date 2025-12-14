import { Sprite, Assets } from "pixi.js";

export class BackgroundManager {
    constructor(app, folder, prefix, callbacks = {}) {
        this.app = app;
        this.folder = folder;
        this.prefix = prefix;

        this.totalImages = 0;
        this.currentIndex = 0;
        this.isReady = false;

        this.onStartChange = callbacks.onStartChange || (() => {});
        this.onFinishChange = callbacks.onFinishChange || (() => {});

        this.sprite = new Sprite();
        this.sprite.anchor.set(0.5);
        this.sprite.position.set(this.app.screen.width / 2, this.app.screen.height / 2);
        this.sprite.zIndex = 0;
        this.app.stage.addChild(this.sprite);

        window.addEventListener('resize', () => this.resize());
    }

    /**
     * ZABEZPIECZONA wersja skanowania folderu.
     */
    async initAutoDetect() {
        console.log(`[BackgroundManager] Rozpoczynam skanowanie folderu: ${this.folder}...`);

        let count = 0;
        let searching = true;
        const MAX_LIMIT = 50; // BEZPIECZNIK: Maksymalna liczba plików do sprawdzenia

        while (searching) {
            // Zabezpieczenie przed nieskończoną pętlą (hard limit)
            if (count >= MAX_LIMIT) {
                console.warn(`[BackgroundManager] Osiągnięto limit ${MAX_LIMIT} plików. Przerywam skanowanie.`);
                searching = false;
                break;
            }

            const path = this.getPathForIndex(count);
            console.log(`[BackgroundManager] Plik: ${path}`);

            try {
                const response = await fetch(path, { method: 'HEAD' });

                // Pobieramy typ zawartości z nagłówka
                const contentType = response.headers.get("content-type");

                // WARUNEK ROZSZERZONY:
                // 1. response.ok (kod 200-299)
                // 2. contentType istnieje
                // 3. contentType zaczyna się od "image" (np. image/png, image/jpeg)
                if (response.ok && contentType && contentType.startsWith("image")) {
                    count++;
                } else {
                    // Jeśli to nie jest obrazek (np. html) lub błąd 404 -> koniec
                    searching = false;
                }
            } catch (err) {
                searching = false;
            }
        }

        this.totalImages = count;
        console.log(`[BackgroundManager] Zakończono skanowanie. Znaleziono obrazów: ${this.totalImages}`);

        if (this.totalImages > 0) {
            this.isReady = true;
            await this.loadImage(0);
        } else {
            console.warn("[BackgroundManager] Brak plików graficznych w folderze lub błędna nazwa!");
        }
    }

    getPathForIndex(index) {
        const fileNumber = index + 1;
        const formattedNumber = fileNumber.toString().padStart(3, '0');
        // return `/assets/${this.folder}/${this.prefix}_${formattedNumber}.png`;
        return `/assets/${this.folder}/${this.prefix}${formattedNumber}.png`;
    }

    async move(direction) {
        if (!this.isReady || this.totalImages === 0) return;

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
            console.error(`Błąd ładowania tekstury: ${fullPath}`, err);
        }
    }

    resize() {
        if (this.sprite) {
            this.sprite.position.set(this.app.screen.width / 2, this.app.screen.height / 2);
        }
    }
}