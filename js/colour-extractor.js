// Modified from https://dev.to/producthackers/creating-a-color-palette-with-javascript-44ip

const buildPalette = (colorsList) => {
    const startTime = performance.now();
    const returnValue =  new Promise((resolve, reject) => {
        let colours = {
            "palette": [],
            "complementary": []
        }

        const orderedByColor = orderByLuminance(colorsList);
        const hslColors = convertRGBtoHSL(orderedByColor);

        for (let i = 0; i < orderedByColor.length; i++) {
            const hexColor = rgbToHex(orderedByColor[i]);
            const hexColorComplementary = hslToHex(hslColors[i]);

            if (i > 0) {
                const difference = calculateColorDifference(
                    orderedByColor[i],
                    orderedByColor[i - 1]
                );

                if (difference < 120) continue;
                colours.palette.push(hexColor);
            }

            if (hslColors[i].h) {
                colours.palette.push(hexColor);
                colours.complementary.push(hexColorComplementary);
            }
        }

        resolve(colours);
    });

    const endTime = performance.now();
    console.log(`Execution time: ${endTime - startTime} ms`);
    return returnValue;

};

//  Convert each pixel value ( number ) to hexadecimal ( string ) with base 16
const rgbToHex = (pixel) => {
    const componentToHex = (c) => {
        const hex = c.toString(16);
        return hex.length == 1 ? "0" + hex : hex;
    };

    return (
        "#" +
        componentToHex(pixel.r) +
        componentToHex(pixel.g) +
        componentToHex(pixel.b)
    ).toUpperCase();
};

/**
 * Convert HSL to Hex
 * this entire formula can be found in stackoverflow, credits to @icl7126 !!!
 * https://stackoverflow.com/a/44134328/17150245
 */
const hslToHex = (hslColor) => {
    const hslColorCopy = { ...hslColor };
    hslColorCopy.l /= 100;
    const a =
        (hslColorCopy.s * Math.min(hslColorCopy.l, 1 - hslColorCopy.l)) / 100;
    const f = (n) => {
        const k = (n + hslColorCopy.h / 30) % 12;
        const color = hslColorCopy.l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
        return Math.round(255 * color)
            .toString(16)
            .padStart(2, "0");
    };
    return `#${f(0)}${f(8)}${f(4)}`.toUpperCase();
};

/**
 * Convert RGB values to HSL
 * This formula can be
 * found here https://www.niwa.nu/2013/05/math-behind-colorspace-conversions-rgb-hsl/
 */
const convertRGBtoHSL = (rgbValues) => {
    const returnValue = rgbValues.map((pixel) => {
        let hue,
            saturation,
            luminance = 0;

        // first change range from 0-255 to 0 - 1
        let redOpposite = pixel.r / 255;
        let greenOpposite = pixel.g / 255;
        let blueOpposite = pixel.b / 255;

        const Cmax = Math.max(redOpposite, greenOpposite, blueOpposite);
        const Cmin = Math.min(redOpposite, greenOpposite, blueOpposite);

        const difference = Cmax - Cmin;

        luminance = (Cmax + Cmin) / 2.0;

        if (luminance <= 0.5) {
            saturation = difference / (Cmax + Cmin);
        } else if (luminance >= 0.5) {
            saturation = difference / (2.0 - Cmax - Cmin);
        }

        /**
         * If Red is max, then Hue = (G-B)/(max-min)
         * If Green is max, then Hue = 2.0 + (B-R)/(max-min)
         * If Blue is max, then Hue = 4.0 + (R-G)/(max-min)
         */
        const maxColorValue = Math.max(pixel.r, pixel.g, pixel.b);

        if (maxColorValue === pixel.r) {
            hue = (greenOpposite - blueOpposite) / difference;
        } else if (maxColorValue === pixel.g) {
            hue = 2.0 + (blueOpposite - redOpposite) / difference;
        } else {
            hue = 4.0 + (greenOpposite - blueOpposite) / difference;
        }

        hue = hue * 60; // find the sector of 60 degrees to which the color belongs

        // it should be always a positive angle
        if (hue < 0) {
            hue = hue + 360;
        }

        // When all three of R, G and B are equal, we get a neutral color: white, grey or black.
        if (difference === 0) {
            return false;
        }

        return {
            h: Math.round(hue) + 180, // plus 180 degrees because that is the complementary color
            s: parseFloat(saturation * 100).toFixed(2),
            l: parseFloat(luminance * 100).toFixed(2),
        };
    });

    return returnValue;

};

/**
 * Using relative luminance we order the brightness of the colors
 * the fixed values and further explanation about this topic
 * can be found here -> https://en.wikipedia.org/wiki/Luma_(video)
 */
const orderByLuminance = (rgbValues) => {
    const calculateLuminance = (p) => {
        return 0.2126 * p.r + 0.7152 * p.g + 0.0722 * p.b;
    };

    return rgbValues.sort((p1, p2) => {
        return calculateLuminance(p2) - calculateLuminance(p1);
    });
};

const buildRgb = (imageData) => {
    const rgbValues = [];
    for (let i = 0; i < imageData.length; i += 32) {
        const rgb = {
            r: imageData[i],
            g: imageData[i + 1],
            b: imageData[i + 2],
        };

        rgbValues.push(rgb);
    }
    return rgbValues;
};

/**
 * Calculate the color distance or difference between 2 colors
 *
 * further explanation of this topic
 * can be found here -> https://en.wikipedia.org/wiki/Euclidean_distance
 * note: this method is not accuarate for better results use Delta-E distance metric.
 */
const calculateColorDifference = (color1, color2) => {
    const rDifference = Math.pow(color2.r - color1.r, 2);
    const gDifference = Math.pow(color2.g - color1.g, 2);
    const bDifference = Math.pow(color2.b - color1.b, 2);

    return rDifference + gDifference + bDifference;
};

// returns what color channel has the biggest difference
const findBiggestColorRange = (rgbValues) => {
    /**
     * Min is initialized to the maximum value posible
     * from there we procced to find the minimum value for that color channel
     *
     * Max is initialized to the minimum value posible
     * from there we procced to fin the maximum value for that color channel
     */
    let rMin = Number.MAX_VALUE;
    let gMin = Number.MAX_VALUE;
    let bMin = Number.MAX_VALUE;

    let rMax = Number.MIN_VALUE;
    let gMax = Number.MIN_VALUE;
    let bMax = Number.MIN_VALUE;

    rgbValues.forEach((pixel) => {
        rMin = Math.min(rMin, pixel.r);
        gMin = Math.min(gMin, pixel.g);
        bMin = Math.min(bMin, pixel.b);

        rMax = Math.max(rMax, pixel.r);
        gMax = Math.max(gMax, pixel.g);
        bMax = Math.max(bMax, pixel.b);
    });

    const rRange = rMax - rMin;
    const gRange = gMax - gMin;
    const bRange = bMax - bMin;

    // determine which color has the biggest difference
    const biggestRange = Math.max(rRange, gRange, bRange);
    if (biggestRange === rRange) {
        return "r";
    } else if (biggestRange === gRange) {
        return "g";
    } else {
        return "b";
    }
};

/**
 * Median cut implementation
 * can be found here -> https://en.wikipedia.org/wiki/Median_cut
 */
const quantization = (rgbValues, depth) => {
    const MAX_DEPTH = 4;

    // Base case
    if (depth === MAX_DEPTH || rgbValues.length === 0) {
        const color = rgbValues.reduce(
            (prev, curr) => {
                prev.r += curr.r;
                prev.g += curr.g;
                prev.b += curr.b;

                return prev;
            },
            {
                r: 0,
                g: 0,
                b: 0,
            }
        );

        color.r = Math.round(color.r / rgbValues.length);
        color.g = Math.round(color.g / rgbValues.length);
        color.b = Math.round(color.b / rgbValues.length);

        return [color];
    }

    /**
     *  Recursively do the following:
     *  1. Find the pixel channel (red,green or blue) with biggest difference/range
     *  2. Order by this channel
     *  3. Divide in half the rgb colors list
     *  4. Repeat process again, until desired depth or base case
     */
    const componentToSortBy = findBiggestColorRange(rgbValues);
    rgbValues.sort((p1, p2) => {
        return p1[componentToSortBy] - p2[componentToSortBy];
    });

    const mid = rgbValues.length / 2;
    return [
        ...quantization(rgbValues.slice(0, mid), depth + 1),
        ...quantization(rgbValues.slice(mid + 1), depth + 1),
    ];
};

export const main = async (imgSrcBase64) => {
    const image = new Image();
    image.src = imgSrcBase64;

    return await new Promise((resolve, reject) => {
        image.onload = () => {
            const canvas = document.getElementById("canvas");
            canvas.width = image.width;
            canvas.height = image.height;
            const ctx = canvas.getContext("2d");
            ctx.drawImage(image, 0, 0);

            const startTime = performance.now();

            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const rgbArray = buildRgb(imageData.data);
            const quantColors = quantization(rgbArray, 0);
            const colors = buildPalette(quantColors);
            resolve(colors);
        };

        image.onerror = (error) => {
            reject(error);
        };
    });
};




export default main;
