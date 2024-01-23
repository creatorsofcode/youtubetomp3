const express = require('express');
const ytdl = require('ytdl-core');
const ffmpeg = require('fluent-ffmpeg');
const app = express();
const port = 3000;
const AWS = require("aws-sdk");
const s3 = new AWS.S3()

export AWS_REGION="eu-west-1"
export AWS_ACCESS_KEY_ID="ASIAVHKVCOWI2R6PDH5K"
export AWS_SECRET_ACCESS_KEY="TzoA3qAt6qdho9HE4NYoNo3s0NbQ3scA0YFilzbs"
export AWS_SESSION_TOKEN="IQoJb3JpZ2luX2VjEKH//////////wEaCXVzLWVhc3QtMiJGMEQCICsC8bFeS7fRa0zSLFloR4i/QYjbWbbX6PetD+r05LWZAiBCp3y9XmtLXI9RS0DVfn7q4Ng59ykM2koCTknrM8ta8CqsAghaEAAaDDM1OTM0NTA1OTIxNyIMjCJOrseq1ImVdAjQKokCW5t5Hzmsfv16MOYs+1Vw/mffQH8s0R5qtRV4mU6pcEpWVQ/0Uj45YSocgxJ++/xSIfW8v5MmZmhqDLZhK49j4hcWVPx6BqOkgzgsNgikYQ9WKulvY0FQ/dNVEdxEWRXwtURHipo1Lxx46hQbLhcsQd3vnRVgdkYTSdexK83n8IeTfjVDyODy3vAuGKdxTNVno0z+mT4lh9VFZ2+cd+xjoIRIXP5cVwI2Do0I3eJ2sbieEJuvU6tvqL05fDdxrWkSnTpzrnRQasEQBMnsWzViPS/IhFAdC178BWLuz0tph7s24rtXgdLt7GoI4o1sLeLAUfqlzlT7r5BhYwGkrC5Es2srFGJpT+ktRjDfgL6tBjqeAUysIDxQwcZ4pZhzlePOuS65yQf1PFGXIs9lrgbMuEaEsIdmUm727Vy9AXqz5hBTJxFHhX4BXIiFEUpsuZ69BlVw/RAs2sFb+BiofGh3ONi6H6mYOA22Dd4Tzs02KX6K0xCKq2GFWGAjh+n2BR6LHywxvA2gnaxQIqultlPNELi14kTUmT2KXdFoYT5JErb6bffb0LOisP9dmveJaUIu"

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
    console.log(`https://zany-red-clam-cuff.cyclic.app/${port}`);
});

