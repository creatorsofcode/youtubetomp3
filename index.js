const express = require('express');
const ytdl = require('ytdl-core');
const ffmpeg = require('fluent-ffmpeg');
const app = express();
const port = process.env.PORT || 3000

app.use(express.static('public'));

// Endpoint to get video details
app.get('/videoDetails', async (req, res) => {
    const videoUrl = req.query.URL;
    if (!ytdl.validateURL(videoUrl)) {
        return res.status(400).send('Invalid YouTube URL');
    }

    try {
        const info = await ytdl.getInfo(videoUrl);
        res.json({
            title: info.videoDetails.title,
            thumbnail: info.videoDetails.thumbnails[info.videoDetails.thumbnails.length - 1].url,
            downloadLink: `/download?URL=${encodeURIComponent(videoUrl)}`
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error fetching video details');
    }
});

app.get('/download', async (req, res) => {
    const videoUrl = req.query.URL;
    if (!ytdl.validateURL(videoUrl)) {
        return res.status(400).send('Invalid YouTube URL');
    }

    try {
        const info = await ytdl.getInfo(videoUrl);
        const title = info.videoDetails.title.replace(/[^\w\s]/gi, '');
        res.header('Content-Disposition', `attachment; filename="${title}.mp3"`);

        const stream = ytdl(videoUrl, { quality: 'highestaudio' });
        ffmpeg(stream)
            .audioBitrate(128)
            .format('mp3')
            .on('error', (err) => console.error('Error:', err))
            .pipe(res);
    } catch (error) {
        console.error('Error processing request:', error);
        res.status(500).send('Server error');
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
