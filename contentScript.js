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
    const nqe = `foreach device in network.devices 
                   where device.name == "${device}"
                   let platform = device.platform 
                   foreach component in platform.components 
                   where component.name == "System Chassis" 
                   select {serialNumber: component.serialNumber}`

    const pattern = /https:\/\/(\w+\.\w+:\d+|\w+\.\w+).*networkId=(\d+).*snapshotId=(\d+)/
    if (pattern.test(window.location.href)) {
        const user = (await getKey('fwd_user')).fwd_user
        const pass = (await getKey('fwd_password')).fwd_password
        let fwdBody = {
            query: nqe,
            queryOptions: {
                limit: 1,
                offset: 0
            }
        }
        const results = pattern.exec(window.location.href)
        let fwdUrl = "https://" + results[1] + "/api/nqe?networkId=" + results[2]
        const intRequest = new Request(fwdUrl, {
            method: 'POST',
            body: JSON.stringify(fwdBody),
            headers: new Headers({
                'Content-Type': 'application/json'
            })
        })
        intRequest.headers.append('Authorization', 'Basic ' + btoa(user + ":" + pass))
        const response = await fetch(intRequest)
        if (response.ok) {
            const resp = await response.json()
            return resp.items[0].serialNumber
        }
        else {
            console.log(response)
        }
    }
    else { console.log("Error parsing HREF " + window.location.href) }
}



