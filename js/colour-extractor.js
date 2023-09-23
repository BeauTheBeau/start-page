// Modified from https://dev.to/producthackers/creating-a-color-palette-with-javascript-44ip

/**
 * Convert RGB values to hexadecimal color representation.
 * @param {object} pixel - The RGB values for a pixel { r: <red>, g: <green>, b: <blue> }.
 * @returns {string} The hexadecimal representation of the RGB color.
 */
const rgbToHex = (pixel) => {
    const componentToHex = (c) => {
        const hex = c.toString(16);
        return hex.length === 1 ? "0" + hex : hex;
    };

    return (
        "#" +
        componentToHex(pixel.r) +
        componentToHex(pixel.g) +
        componentToHex(pixel.b)
    ).toUpperCase();
};

/**
 * Convert HSL (Hue, Saturation, Luminance) to hexadecimal color representation.
 *
 * @param {object} hslColor - The HSL values { h: <hue>, s: <saturation>, l: <luminance> }.
 * @returns {string} The hexadecimal representation of the HSL color.
 */
const hslToHex = (hslColor) => {
    const hslColorCopy = { ...hslColor };
    hslColorCopy.l /= 100;
    const a = (hslColorCopy.s * Math.min(hslColorCopy.l, 1 - hslColorCopy.l)) / 100;
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
 * Convert RGB values to HSL (Hue, Saturation, Luminance).
 *
 * @param {object[]} rgbValues - Array of objects containing RGB values for pixels.
 * @returns {object[]} Array of objects containing HSL values for pixels.
 */
const convertRGBtoHSL = (rgbValues) => {
    const returnValue = rgbValues.map((pixel) => {
        let hue, saturation, luminance = 0;

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

        const maxColorValue = Math.max(pixel.r, pixel.g, pixel.b);

        if (maxColorValue === pixel.r) {
            hue = (greenOpposite - blueOpposite) / difference;
        } else if (maxColorValue === pixel.g) {
            hue = 2.0 + (blueOpposite - redOpposite) / difference;
        } else {
            hue = 4.0 + (greenOpposite - blueOpposite) / difference;
        }

        hue = hue * 60;

        if (hue < 0) {
            hue = hue + 360;
        }

        if (difference === 0) {
            return false;
        }

        return {
            h: Math.round(hue) + 180,
            s: parseFloat(saturation * 100).toFixed(2),
            l: parseFloat(luminance * 100).toFixed(2),
        };
    });

    return returnValue;
};

/**
 * Order RGB values by luminance (brightness).
 *
 * @param {object[]} rgbValues - Array of objects containing RGB values for pixels.
 * @returns {object[]} Array of RGB values ordered by luminance.
 */
const orderByLuminance = (rgbValues) => {
    const calculateLuminance = (p) => {
        return 0.2126 * p.r + 0.7152 * p.g + 0.0722 * p.b;
    };

    return rgbValues.sort((p1, p2) => {
        return calculateLuminance(p2) - calculateLuminance(p1);
    });
};

/**
 * Build an array of RGB values from image data.
 *
 * @param {Uint8ClampedArray} imageData - Image data.
 * @returns {object[]} Array of objects containing RGB values for pixels.
 */
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
 * Calculate the color difference between two colors using Euclidean distance.
 *
 * @param {object} color1 - The first color { r: <red>, g: <green>, b: <blue> }.
 * @param {object} color2 - The second color { r: <red>, g: <green>, b: <blue> }.
 * @returns {number} The color difference.
 */
const calculateColorDifference = (color1, color2) => {
    const rDifference = Math.pow(color2.r - color1.r, 2);
    const gDifference = Math.pow(color2.g - color1.g, 2);
    const bDifference = Math.pow(color2.b - color1.b, 2);

    return rDifference + gDifference + bDifference;
};

/**
 * Find the color channel (r, g, or b) with the biggest difference in RGB values.
 *
 * @param {object[]} rgbValues - Array of objects containing RGB values for pixels.
 * @returns {string} The color channel with the biggest difference (r, g, or b).
 */
const findBiggestColorRange = (rgbValues) => {
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
 * Perform quantization of RGB values using Median Cut algorithm.
 *
 * @param {object[]} rgbValues - Array of objects containing RGB values for pixels.
 * @param {number} depth - Current depth of recursion in the quantization process.
 * @returns {object[]} Quantized array of RGB values.
 */
const quantization = (rgbValues, depth) => {
    const MAX_DEPTH = 4;

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

/**
 * Build a color palette and complementary colors based on quantized RGB values.
 *
 * @param {object[]} colorsList - Array of quantized RGB values.
 * @returns {Promise<object>} Promise that resolves to an object containing the palette and complementary colors.
 */
const buildPalette = async (colorsList) => {
    const startTime = performance.now();
    const colours = {
        palette: [],
        complementary: [],
    };

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

    const endTime = performance.now();
    console.log(`Execution time: ${endTime - startTime} ms`);
    return colours;
};

/**
 * Extract color palette and complementary colors from an image using quantization and conversion algorithms.
 *
 * @param {string} imgSrcBase64 - Base64-encoded image source.
 * @returns {Promise<object>} Promise that resolves to an object containing the palette and complementary colors.
 */
export const extractPaletteFromImage = async (imgSrcBase64) => {
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

