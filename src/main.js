import { Application, Assets, Sprite, Text, TextStyle } from "pixi.js";
import { Scroller } from "./scroller";
import { BackgroundManager } from "./background";
import { OffersManager } from "./offers";
import { ContoursManager } from "./contours"; // [1] IMPORT

(async () => {
    let config;
    try {
        config = await (await fetch('/assets/config.json')).json();
    } catch (err) { return; }

    const app = new Application();
    await app.init({ background: "#000000", resizeTo: window });
    document.getElementById("pixi-container").appendChild(app.canvas);

    // --- UI TEKSTOWE ---
    const style = new TextStyle({
        fontFamily: 'Arial', fontSize: 24, fill: '#ffffff',
        stroke: '#000000', strokeThickness: 4
    });
    const counterText = new Text({ text: "...", style });
    counterText.anchor.set(0.5);
    counterText.zIndex = 20;
    app.stage.addChild(counterText);

    // --- MANAGERY ---
    // Pobieramy listę ofert z configu (np. ["place-01", "place-02"])
    const offersList = config.offers || [];

    const offersManager = new OffersManager(app, offersList);
    const contoursManager = new ContoursManager(app, offersList); // [2] INICJALIZACJA

    const bgManager = new BackgroundManager(app, config.backgrounds, {
        onStartChange: () => {
            offersManager.hide();
            contoursManager.hide(); // [3] UKRYWANIE PRZY ZMIANIE
            counterText.text = "";
        },
        onFinishChange: (idx) => {
            counterText.text = `${idx + 1} / ${bgManager.totalImages}`;

            // [4] ŁADOWANIE NOWYCH DANYCH
            // Uruchamiamy ładowanie ofert i konturów równolegle
            Promise.all([
                offersManager.loadForIndex(idx),
                contoursManager.loadForIndex(idx)
            ]).then(() => {
                forceResizeAll();
            });
        }
    });

    const scroller = new Scroller(app, {
        onPrevClick: () => bgManager.move(-1),
        onNextClick: () => bgManager.move(1)
    });


    // ============================================================
    // SYSTEM ZARZĄDZANIA ROZMIARAMI (Centrowanie)
    // ============================================================

    const resizeCallbacks = [
        // 1. Tło
        () => bgManager.resize(),

        // 2. Oferty (strefy klikalne)
        () => {
            const screenW = app.screen.width;
            const screenH = app.screen.height;
            const bgW = bgManager.sprite.width;
            const bgH = bgManager.sprite.height;

            offersManager.reposition(screenW, screenH, bgW, bgH);
        },

        // 3. Kontury (grafiki PNG) - [5] DODANIE DO RESIZE
        () => {
            const screenW = app.screen.width;
            const screenH = app.screen.height;
            // Używamy wymiarów tła, żeby kontury idealnie się pokrywały
            const bgW = bgManager.sprite.width;
            const bgH = bgManager.sprite.height;

            contoursManager.reposition(screenW, screenH, bgW, bgH);
        },

        // 4. Scroller
        () => scroller.resize(),

        // 5. Elementy luźne
        () => {
            counterText.position.set(app.screen.width / 2, app.screen.height - 50);
        }
    ];

    const forceResizeAll = () => {
        resizeCallbacks.forEach(fn => fn());
    };

    let resizeTimeout;

    window.addEventListener('resize', () => {
        forceResizeAll();
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            app.renderer.resize(window.innerWidth, window.innerHeight);
            forceResizeAll();
        }, 50);
    });

    forceResizeAll();

})();