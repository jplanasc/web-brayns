export default {
    miniature(canvas: HTMLCanvasElement,
              destinationWidth: number,
              destinationHeight: number,
              mode: "contain" | "cover" | "resize" = "contain"): HTMLCanvasElement {
        const { width, height } = canvas;
        let w = destinationWidth;
        let h = destinationHeight;
        if (mode !== "resize") {
            const srcRatio = width / height;
            const dstRatio = destinationWidth / destinationHeight;
            let zoom = 1;
            if (srcRatio > dstRatio) {
                if (mode == "contain") {
                    zoom = destinationHeight / height;
                } else {

                }
            } else {
                if (mode == "contain") {

                } else {
                    zoom = destinationWidth / width;
                }
            }
            w *= zoom;
            h *= zoom;
        }
        const miniature = document.createElement("canvas");
        miniature.width = w;
        miniature.height = h;
        const ctx = miniature.getContext("2d");
        if (ctx) ctx.drawImage(canvas, w, h);
        return miniature;
    }
}
