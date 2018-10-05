const youtubedl = require('youtube-dl')
const fs = require('fs')

const getInfo = async (url) => {
    return new Promise((resolve, reject) => {
        if (!url || url == '') reject('Url parameter is empty')
        youtubedl.getInfo(url, ['--youtube-skip-dash-manifest'], (err, info) => {
            if (err) reject(err)
            resolve(info)
        })
    })
}

const download = async (url, formatId, progress) => {
    return new Promise((resolve, reject) => {

        if (!isFunction(progress)) reject('The paramether is not a function')
        youtubedl.getInfo(url, [], (err, infoVideo) => {
            if (err) reject(err)

            let size = 0
            const video = youtubedl(url, [`--format=${formatId}`], {})

            video.on('info', (info) => {
                size = info.size
                video.pipe(fs.createWriteStream(`${infoVideo.title}.mp4`, { flags: 'a' }));
            })

            let pos = 0
            video.on('data', (chunk) => {
                pos += chunk.length
                let percent = (pos / size * 100).toFixed(2)
                progress(percent)
            })

            video.on('end', (info) => {
                resolve(info)
            })
        })
    })
}

function isFunction(functionToCheck) {
    return functionToCheck && {}.toString.call(functionToCheck) === '[object Function]';
}

/* function progress(info) {
    console.log(info)
}

download('https://www.youtube.com/watch?v=MWACyj9025Y', progress)
    .then(info => {
        console.log(info)
    })
    .catch(console.log) */

/* getInfo('https://www.youtube.com/watch?v=MWACyj9025Y')
    .then(info => {
        console.log(info.display_id)
    })
    .catch(console.log) */

module.exports = {
    getInfo,
    download
}
