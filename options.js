window.addEventListener('load', function load(event) {

    chrome.storage.local.get('cvp', function (result) {
        console.log(result.cvp)
        if (result != undefined && result.cvp != undefined) {
            document.getElementById('cvp').value = result.cvp;
        }
    });
    chrome.storage.local.get('fwd_user', function (result) {
        console.log(result.fwd_user)
        if (result != undefined && result.fwd_user != undefined) {
            document.getElementById('fwd_user').value = result.fwd_user;
        }
    });
    chrome.storage.local.get('fwd_password', function (result) {
        if (result != undefined && result.fwd_password != undefined) {
            document.getElementById('fwd_password').value = result.fwd_password;
        }
    });

    document.getElementById('save').onclick = function () {
        chrome.storage.local.set({'cvp': document.getElementById('cvp').value}, function () {
            console.log("Setting to " + document.getElementById('cvp').value)
        });
        chrome.storage.local.set({'fwd_user': document.getElementById('fwd_user').value}, function () {
            console.log("Setting to " + document.getElementById('fwd_user').value)
        });
        chrome.storage.local.set({'fwd_password': document.getElementById('fwd_password').value}, function () {
            console.log("Setting to " + document.getElementById('fwd_password').value)
        });
        console.log("Saving Options")
        alert("Saved")
    };
});