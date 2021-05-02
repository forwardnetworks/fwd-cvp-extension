console.log("LOADED CVP Extension")
var layersNode = $("#layers")[0]

var observerOptions = {
    childList: true,
    attributes: false,
    subtree: true
}

async function deviceCard(mutationList, observer) {
    mutationList.forEach((mutation) => {
        switch (mutation.type) {
            case 'childList':
                if
                    ($(mutation.target).hasClass("tdt")
                    && mutation.previousSibling == null) {
                    const regex = new RegExp('arista*', 'i');
                    const device = $("#layers").find("div.tdt-title").text()
                    const os = $("#layers").find("div.neim-info").text()
                    const actions = $("#layers").find("div.tdt-actions")
                    const container = $("#layers").find("div.neim-logo")
                    if (regex.test(os)) {
                        console.log("Found Device " + device)
                        console.log("OS " + os)
                        updateDeviceCard(device, container)
                    }
                }
        }
    });
}

async function updateDeviceCard(device, container) {
    const cvpLink = (await getKey('cvp')).cvp
    const serial = await getSerialNumber(device)
    const cvpResource = cvpLink + "/cv/devices/overview/" + serial
    container.replaceWith(`<a href="${cvpResource}" target="_blank"><img src="img/vendor_logo_arista.svg" alt="Arista" class="neim-logo-image">`)
}

var observer = new MutationObserver(deviceCard);
observer.observe(layersNode, observerOptions);

const getKey = (key) => {
    return new Promise((resolve, reject) => {
        chrome.storage.local.get([key], (data, err) => {
            if (err) return reject(err)
            resolve(data)
        })
    })
}

async function getSerialNumber(device) {
    const pattern = /https:\/\/(\w+\.\w+:\d+|\w+\.\w+).*networkId=(\d+).*snapshotId=(\d+)/
    if (pattern.test(window.location.href)) {
        const results = pattern.exec(window.location.href)
        const fwdUrl = "https://" + results[1] + "/api/snapshots/" + results[3] + "/devices/" + device + "/files/version"
        const user = (await getKey('fwd_user')).fwd_user
        const pass = (await getKey('fwd_password')).fwd_password
        const intRequest = new Request(fwdUrl, {
            method: 'GET'
        })
        intRequest.headers.append('Authorization', 'Basic ' + btoa(user + ":" + pass))
        const response = await fetch(intRequest)
        if (response.ok) {
            const file = await response.text()
            const serialPattern = /Serial number:\s+(\w+)/m
            const serial = file.match(serialPattern)
            console.log("Found Serial:" + serial[1])
            return serial[1]
        }
        else {
            throw ("API error")
        }
    }
    else { console.log("Error parsing HREF " + window.location.href) }
}
