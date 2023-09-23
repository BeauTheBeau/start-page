import {extractPaletteFromImage} from './colour-extractor.js';

let song = "";

const playButton = document.getElementById('media__player__controls__play');
const prevButton = document.getElementById('media__player__controls__prev');
const nextButton = document.getElementById('media__player__controls__next');

async function getMedia() {
    const media = await fetch('http://localhost:3000/media').then(res => res.text());
    const mediaJson = JSON.parse(media);

    const art = document.getElementById('media__player__art__img');
    const title = document.getElementById('media__player__info__title');
    const artist = document.getElementById('media__player__info__artist');

    if (mediaJson.playing === true) {
        playButton.children[0].classList.remove('nf-fa-play');
        playButton.children[0].classList.add('nf-fa-pause');
    } else if (mediaJson.playing === false) {
        playButton.children[0].classList.remove('nf-fa-pause');
        playButton.children[0].classList.add('nf-fa-play');
    }

    title.innerText = mediaJson.title;
    artist.innerText = mediaJson.artist;
    art.src = `data:image/png;base64,${mediaJson.artUrl}`;

    if (mediaJson.title !== song) {
        song = mediaJson.title;
        extractPaletteFromImage(art.src).then(async colours => {
            let randomComplementary = Math.floor(Math.random() * colours.complementary.length);
            let randomPalette = Math.floor(Math.random() * colours.palette.length);

            async function hexToRgb(hex) {
                const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
                hex = hex.replace(shorthandRegex, function (m, r, g, b) {
                    return r + r + g + g + b + b;
                });

                const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
                return result ? {
                    r: parseInt(result[1], 16),
                    g: parseInt(result[2], 16),
                    b: parseInt(result[3], 16)
                } : 1;
            }

            async function checkDifference(c1, c2) {
                const c1Rgb = await hexToRgb(c1);
                const c2Rgb = await hexToRgb(c2);

                const difference = Math.sqrt(
                    Math.pow(c1Rgb.r - c2Rgb.r, 2) +
                    Math.pow(c1Rgb.g - c2Rgb.g, 2) +
                    Math.pow(c1Rgb.b - c2Rgb.b, 2)
                );

                if (difference < 0.5) {
                    randomPalette = 0;
                    await checkDifference(colours.palette[randomPalette][0], colours.palette[randomPalette][1]);
                }

            }

            await checkDifference(colours.palette[randomPalette][0], colours.palette[randomPalette][1]);

            title.style.color = colours.palette[randomPalette];
            artist.style.color = colours.palette[randomPalette];
            playButton.style.color = colours.palette[randomPalette];
            prevButton.style.color = colours.palette[randomPalette];
            nextButton.style.color = colours.palette[randomPalette];

            // Set variables for use in CSS
            document.documentElement.style.setProperty('--special-gradient-colour', colours.complementary[randomComplementary]);
            document.documentElement.style.setProperty('--special-gradient-colour2', colours.palette[randomComplementary]);

            try {
                console.log(colours.palette[randomPalette]);
                console.log(colours.complementary[randomComplementary]);
                document.querySelector('#media__player').style.background = `linear-gradient(90deg, ${colours.palette[randomComplementary]} 0%, ${colours.complementary[randomPalette]} 100%)`;
                console.log(`linear-gradient(90deg, ${colours.complementary[randomComplementary]} 0%, ${colours.palette[randomPalette]} 100%)`);
            } catch (e) {
                console.log(e);
            } finally {
                console.log('finally');
            }
        });
    }
}


async function skipUnskip(type) {
    await fetch(`http://localhost:3000/media/${type}`, {method: 'POST'});
    await getMedia()
}

async function playPause() {
    await fetch('http://localhost:3000/media', {method: 'POST'});

    // Change icons - first set to opposite of what it is now,
    //                then set to what it should **definitely** be with getMedia()
    const playButton = document.getElementById('media__player__controls__play');
    if (playButton.children[0].classList.contains('nf-fa-play')) {
        playButton.children[0].classList.remove('nf-fa-play');
        playButton.children[0].classList.add('nf-fa-pause');
    } else {
        playButton.children[0].classList.remove('nf-fa-pause');
        playButton.children[0].classList.add('nf-fa-play');
    }

    await getMedia()
}

playButton.addEventListener('click', playPause);
prevButton.addEventListener('click', () => skipUnskip('previous'));
nextButton.addEventListener('click', () => skipUnskip('next'));

// Every second
setInterval(async () => {
    await getMedia();
}, 1000);

// Get media on page load
await getMedia();