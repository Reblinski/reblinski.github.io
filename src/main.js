import { Application, Assets, Sprite, Text, TextStyle } from "pixi.js";
import { Scroller } from "./scroller";
import { BackgroundManager } from "./background";
import { OffersManager } from "./offers";

(async () => {
    let config;
    try {
        config = await (await fetch('/assets/config.json')).json();
    } catch (err) { return; }

    const app = new Application();
    await app.init({ background: "#1099bb", resizeTo: window });
    document.getElementById("pixi-container").appendChild(app.canvas);


    window.addEventListener('resize', () => {
        const w = window.innerWidth;
        const h = window.innerHeight;
        app.renderer.resize(w, h);
        // przesunąć sprite do środka ponownie, jeśli trzeba:
        if (app.stage.children[0]) {
            const spr = app.stage.children[0];
            spr.position.set(app.screen.width / 2, app.screen.height / 2);
        }
    });



    // --- UI TEKSTOWE ---
    const style = new TextStyle({
        fontFamily: 'Arial', fontSize: 24, fill: '#ffffff',
        stroke: '#000000', strokeThickness: 4
    });
    const counterText = new Text({ text: "...", style });

    // Tekst też centrujemy względem środka (anchor 0.5)
    counterText.anchor.set(0.5);
    counterText.zIndex = 20;
    app.stage.addChild(counterText);

    // --- MANAGERY ---
    const offersManager = new OffersManager(app, config.offers || []);

    const bgManager = new BackgroundManager(app, config.backgrounds, {
        onStartChange: () => {
            offersManager.hide();
            counterText.text = "";
        },
        onFinishChange: (idx) => {
            counterText.text = `${idx + 1} / ${bgManager.totalImages}`;
            offersManager.loadForIndex(idx).then(() => {
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
        // 1. Tło: BackgroundManager ma w sobie this.sprite.position.set(screenW/2, ...)
        () => bgManager.resize(),

        // 2. Oferty: Ustawiamy kontener na środku, ale pivotem korygujemy o połowę tła
        () => {
            const screenW = app.screen.width;
            const screenH = app.screen.height;
            const bgW = bgManager.sprite.width;
            const bgH = bgManager.sprite.height;

            offersManager.reposition(screenW, screenH, bgW, bgH);
        },

        // 3. Scroller: (Zostawiamy jak jest, bo on trzyma się krawędzi, a nie środka)
        () => scroller.resize(),

        // 4. Elementy luźne: Ustawiamy je sztywno na środek ekranu
        () => {
            // Tekst na dole, ale wycentrowany w poziomie
            counterText.position.set(app.screen.width / 2, app.screen.height - 50);

        }
    ];

    const forceResizeAll = () => {
        resizeCallbacks.forEach(fn => fn());
    };

    window.addEventListener('resize', forceResizeAll);
    forceResizeAll();

})();