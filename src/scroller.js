import { Container, Sprite, Assets } from "pixi.js";

export class Scroller {
    constructor(app, options = {}) {
        this.app = app;
        this.container = new Container();
        this.app.stage.addChild(this.container);
        this.prevImgPath = options.prevImgPath ?? "/assets/scroller/prev.png";
        this.nextImgPath = options.nextImgPath ?? "/assets/scroller/next.png";
        this.onPrevClick = options.onPrevClick ?? (() => { console.log("Prev clicked"); });
        this.onNextClick = options.onNextClick ?? (() => { console.log("Next clicked"); });
        this.makeSprites();
    }

    async makeSprites() {
        const [prevTexture, nextTexture] = await Promise.all([
            Assets.load(this.prevImgPath),
            Assets.load(this.nextImgPath),
        ]);
        this.spritePrev = new Sprite(prevTexture);
        this.spriteNext = new Sprite(nextTexture);

        // --- KONFIGURACJA PRZYCISKU "WSTECZ" ---
        this.spritePrev.anchor.set(0.5); // Środek sprite'a jako punkt odniesienia
        this.spritePrev.position.set(50, this.app.screen.height / 2); // 50px od lewej, w połowie wysokości
        this.spritePrev.eventMode = 'static'; // Włącza interakcję (w Pixi v8)
        this.spritePrev.cursor = 'pointer';   // Zmienia kursor na rączkę
        this.spritePrev.alpha = 0.25;
        this.spritePrev.on('pointerover', () => (this.spritePrev.alpha = 1.0));
        this.spritePrev.on('pointerout', () => (this.spritePrev.alpha = 0.25));
        this.spritePrev.on('pointerdown', this.onPrevClick); // Podpięcie kliknięcia

        // --- KONFIGURACJA PRZYCISKU "DALEJ" ---
        this.spriteNext.anchor.set(0.5);
        this.spriteNext.position.set(this.app.screen.width - 50, this.app.screen.height / 2); // 50px od prawej
        this.spriteNext.eventMode = 'static';
        this.spriteNext.cursor = 'pointer';
        this.spriteNext.alpha = 0.25;
        this.spriteNext.on('pointerover', () => (this.spriteNext.alpha = 1.0));
        this.spriteNext.on('pointerout', () => (this.spriteNext.alpha = 0.25));
        this.spriteNext.on('pointerdown', this.onNextClick);


        this.container.addChild(this.spritePrev, this.spriteNext);
        this.container.zIndex = 1000;
        this.app.stage.sortableChildren = true;
    }
}