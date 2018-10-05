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
    for (let format of info.formats) {
        console.log(format)
        if (format.format_note !== 'DASH audio' && format.ext === 'mp4' && format.format_note !== 'medium' && format.format_note !== 'hd720') {
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
            <p class="video-title">${info.title}</p>
            <select name="" id="">
              ${optionsHtml}
              <option value="mp3">Audio-Ext: Mp3</option>
            </select>
            <button class="video-btn-download">Decargar</button>
          </div>
          <div class="col-xs-12">
            <div class="meter">
              <span style="width: 0%"></span>
            </div>
          </div>
        </div>
      </div> `

    document.getElementById('video-list-container').innerHTML = html
}

document.addEventListener('click', (event) => {

    if (!event.target.matches('.video-btn-download')) return

    let formatId = event.path[1].querySelector('select').value
    let idVideo = event.path[3].id

    if (formatId !== 'm') {
        youtube.download(`https://www.youtube.com/watch?v=${idVideo}`, formatId, progress(event.path[3]))
    } else {

    }
})

function progress(element) {
    return function (percent) {
        console.log(`Avanzando ${percent}%`)
        console.log(document.querySelector('.meter span'))
        document.querySelector('.meter span').style.width = `${percent}%`
    }
}