const youtube = require('./youtube')
const request = require('request')

document.getElementById('search-btn').addEventListener('click', () => {
    loading(true)
    let url = document.getElementById('search-input').value
    const pattern = /^((?:https?:)?\/\/)?((?:www|m)\.)?((?:youtube\.com|youtu.be))(\/(?:[\w\-]+\?v=|embed\/|v\/)?)([\w\-]+)(\S+)?$/

    request(url, (err, resp, body) => {
        if (!pattern.test(resp.request.uri.href)) return alert('Esta url es incorrecta')

        youtube.getInfo(url)
            .then(info => {
                console.log(info.thumbnail)
                setVideoHtml(info)
                loading(false)
            })
            .catch(err => {
                onError(err)
                loading(false)
            })
    })
})

function onError(err) {
    console.log(err)
    alert('Ocurrio un error :')
}

function loading(state) {
    if (state) {
        document.getElementById('container-loading').style.visibility = 'visible'
    }
    else {
        document.getElementById('container-loading').style.visibility = 'hidden'
    }
}

function setVideoHtml(info) {
    let optionsHtml = ``
    console.log(info.formats)
    for (let format of info.formats) {
        if (format.ext === 'mp4') {
            optionsHtml += `<option value="${format.format_id}">${format.format_note}-${format.ext} | Tamaño: ${format.filesize}</option>`
        }
    }

    let html = `
    <div class="video col-xs-10" id='${info.display_id}'>
        <div class="row">
          <div class="col-xs-4">
            <img class="video-thumbnail" src="${info.thumbnail}" alt="">
          </div>
          <div class="col-xs-8">
            <div class="row">
              <div class="col-xs-12">
                <p class="video-title">${info.title}</p>
              </div>
              <div class="col-xs-8">
                <select name="" id="">
                    ${optionsHtml}
                    <option value="mp3">Audio-Ext: Mp3</option>
                </select>
              </div>
              <div class="col-xs-4">
                <button class="video-btn-download">
                  <img src="./img/arrow.png" width="20" class="video-img-arrow">
                </button>
                <img src="./img/check.png" width="20" class="video-check" style="display: none;">
              </div>
            </div>
          </div>
          <div class="col-xs-12">
            <div class="meter">
              <span style="width: 0%"></span>
            </div>
          </div>
        </div>
      </div> `

    document.getElementById('video-list-container').innerHTML = html + document.getElementById('video-list-container').innerHTML
}

document.addEventListener('click', (event) => {

    if (!event.target.matches('.video-img-arrow')) return

    console.log(event.path)
    let divVideo = event.path[6]
    let formatId = divVideo.querySelector('select').value
    let idVideo = divVideo.id

    /* Hidden btn download */
    divVideo.querySelector('.video-btn-download').disabled = true
    divVideo.querySelector('select').disabled = true
    console.log(divVideo.querySelector('.video-btn-download'))

    if (formatId !== 'm') {
        youtube.download(`https://www.youtube.com/watch?v=${idVideo}`, formatId, progress(divVideo))
            .then(info => {
                divVideo.querySelector('.video-btn-download').style.display = 'none'
                divVideo.querySelector('.video-check').style.display = 'inline'
            })
            .catch(console.log)
    } else {

    }
})

function progress(element) {
    return function (percent) {
        console.log(`Avanzando ${percent}%`)
        console.log(document.querySelector('.meter span'))
        element.querySelector('.meter span').style.width = `${percent}%`
    }
}