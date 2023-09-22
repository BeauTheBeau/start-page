/*
 * Requires
 * - swaylock (for locking the screen)
 * - grimblast (for screenshots)
 * - swappy (for editing screenshots)
 * - playerctl (for media controls and metadata)
 * - curl (for album art)
 * - base64 (for album art)
 */

const express = require('express');
const {exec} = require('child_process');

const app = express();
const port = 3000;

// Set max maxBuffer to 16MB
const execOptions = {maxBuffer: 16 * 1024 * 1024};

// Enable CORS for all routes
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*'); // Allow requests from this origin
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE'); // Allow these HTTP methods
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization'); // Allow these headers
  next();
});


app.post('/lock', (req, res) => {
  exec('swaylock', (error, stdout, stderr) => {
    if (error) {
      console.error(`Error locking the screen: ${stderr}`);
      res.status(500).send('Error locking the screen');
    } else {
      res.status(200).send('Screen locked successfully.');
    }
  });
});

app.post('/screenshot', (req, res) => {
  exec('swappy -f "$(grimblast --cursor --freeze copysave area)"', execOptions, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error taking screenshot: ${stderr}`);
      res.status(500).send('Error taking screenshot');
    } else {
      res.status(200).send('Screenshot taken successfully.');
    }
  });
});

app.get('/media', (req, res) => {

  async function getPlayingStatus() {
    return new Promise(resolve => {
      exec('playerctl status', (error, stdout, stderr) => {
        if (error) {
          console.error(`Error getting media status: ${stderr}`);
          resolve("Error")
        } else resolve(stdout)
      });
    })
  }

  exec('playerctl metadata --format "title: {{ title }} artist: {{ artist }} album: {{ album }} artUrl: {{mpris:artUrl}}"', async (error, stdout, stderr) => {
    if (error) {
      console.error(`Error getting media: ${stderr}`);
      res.status(500).send('Error getting media');
    } else {

      // Extract the art URL from the stdout
      const artUrlMatch = stdout.match(/artUrl: (.+)/);
      let artBase64 = null;

      let title = ""
      let artist = ""
      let album = ""
      let status = ""

      // Extract everything else from the stdout
      // Command output: title: Friendly Sex artist: Caity Baser album: Friendly Sex (Angrier) artUrl: file:///home/beauthebeau/.mozilla/firefox/firefox-mpris/1293_193.png
      try {
        title = stdout.match(/title: (.+) artist/)[1];
        artist = stdout.match(/artist: (.+) album/)[1];
        album = stdout.match(/album: (.+) artUrl/)[1];
      } catch (e) {
        console.log("Error parsing media output")
      }


      // Send the response
      let response = {
        title: title,
        artist: artist,
        album: album,
        artUrl: artBase64,
        playing: await getPlayingStatus() === "Playing\n"
      }

      // cURL the art URL to get the image
      if (artUrlMatch) {
        const artUrl = artUrlMatch[1];
        const artPath = 'album_art.jpg';
        const curlCommand = `curl -o album_art.jpg ${artUrl}`;

        // Delete the previous art file
        const deleteCommand = `rm -f ${artPath}`;
        await exec(deleteCommand, (error, stdout, stderr) => {
          if (error) console.error(`Error deleting previous media art: ${stderr}`);
        });

        await exec(curlCommand, async (error, stdout, stderr) => {
          if (error) {
            console.error(`Error getting media art: ${stderr}`);
          } else {
            const base64Command = `base64 -w0 ${artPath}`;

            await exec(base64Command, execOptions, (error, stdout, stderr) => {
              if (error) {
                console.error(`Error converting media art to base64`);
                console.error(error);
              } else {
                artBase64 = stdout;
                response.artUrl = artBase64;
                res.status(200).json(response);
              }
            });
          }
        });
      } else {
        res.status(200).json(response);
      }
    }
  });
});

app.post('/media', (req, res) => {

  exec('playerctl play-pause', (error, stdout, stderr) => {
    if (error) {
      console.error(`Error playing/pausing media: ${stderr}`);
      res.status(500).send('Error playing/pausing media');
    } else res.status(200).send('Media played/paused successfully.');

  });
});

app.post('/media/next', (req, res) => {

  exec('playerctl next', (error, stdout, stderr) => {
    if (error) {
      console.error(`Error playing next media: ${stderr}`);
      res.status(500).send('Error playing next media');
    } else {
      res.status(200).send('Next media played successfully.');
    }
  });
});

app.post('/media/previous', (req, res) => {
  exec('playerctl previous', (error, stdout, stderr) => {
    if (error) {
      console.error(`Error playing previous media: ${stderr}`);
      res.status(500).send('Error playing previous media');
    } else {
      res.status(200).send('Previous media played successfully.');
    }
  });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
