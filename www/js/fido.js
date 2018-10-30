/*----------------------------------------------------------------------------*/
// COPYRIGHT(C) FUJITSU LIMITED 2017
/*----------------------------------------------------------------------------*/

var netConfig = {
    mfas_url: 'https://motionpicture-poc-HU9i.startup.online-auth.com:8443',
    connection_timeout: 10000,
    api_reg: '/tutorial/reg',
    api_auth: '/tutorial/auth',
    api_login: '/tutorial/login'
};

var strings = {
    empty_user_name: 'empty_user_name',
    authentication_success: 'authentication_success',
    registration_success: 'registration_success',
    deregistration_success: 'deregistration_success',
    no_response_from_server: 'no_response_from_server',
    user_canceled: 'user_canceled',
    no_response_message_from_client: 'no_response_message_from_client',
    uaf_server_error: 'uaf_server_error',
    uaf_reg_not_found_error: 'uaf_reg_not_found_error',
    process_failed_with_status: 'process_failed_with_status',
    uvi_update_dialog_msg: 'uvi_update_dialog_msg',
    uvi_already_registered_dialog_msg: 'uvi_already_registered_dialog_msg',
    uaf_uvi_not_match_error: "uaf_uvi_not_match_error",
    generic_error: 'generic_error'
};

/**
 * Performs registration operation
 */
function executeRegistration(userName) {
    setInputUserName(userName);
    var userName = getInputUserName();
    if (userName === "") {
        showAlert(strings.empty_user_name);
        return false;
    }

    RPData = {
        "checkPolicy": false,
        "channelBindings": {}
    };

    // First step is to call AppSDK initOperation function to
    // get the message for passing to server
    var key = {
        op: FidoUaf.Operation.REG,
        rpData: RPData
    };

    FidoUaf.initOperation(
        key,
        onInitRegOperation,
        function () {
            showAlert(strings.generic_error);
            enableControls();
        }
    );

    return false;
}

/**
 * Callback function to be invoked when initialization for the REG operation was ended by the AppSDK.
 */
function onInitRegOperation(response) {
    messageFromAppSDK = response.message;
    if (response.status == FidoUaf.ResultType.SUCCESS) {
        var userName = getInputUserName();
        //first login and get the session cookie from the server
        gFidoUafAjax.login(userName, function () {
            //get the authentication request from server
            gFidoUafAjax.initReg(userName, "policyName", messageFromAppSDK, onRegRequest, onAjaxError);
        }, onAjaxError);
    } else {
        showAlert('response.status is not FidoUaf.ResultType.SUCCESS');
    }
}

/**
 * Callback function to be invoked when the INIT_REG ajax request succeeds.
 */
function onRegRequest(regRequest) {
    // console.log("onRegRequest regRequest: " + JSON.stringify(regRequest));

    if (regRequest.statusCode !== 4000) {
        console.log("regRequest.statusCode !== 4000");
    } else {
        console.log("regRequest.statusCode === 4000");
    }

    RPData = {
        "checkPolicy": false,
        "channelBindings": {}
    };

    //process the registration request received from server
    var key = {
        rpData: RPData,
        msg: regRequest
    };

    FidoUaf.process(
        key,
        onRegResponse,
        function () {
            showAlert(strings.generic_error);
        }
    );
}


/**
 * Callback function to be invoked when the REG operation was processed by the AppSDK.
 */
function onRegResponse(response) {
    respFromAppSDK = response.message;
    // console.log("onRegResponse status:" + response.status + " response:" + respFromAppSDK);
    if (response.status == FidoUaf.ResultType.SUCCESS) {
        // console.log(respFromAppSDK);
        //send the authentication response from appSDK to server
        var userName = getInputUserName();
        gFidoUafAjax.finishReg(userName, respFromAppSDK, onFinishReg, onAjaxError);

    } else {
        showAlert(strings.process_failed_with_status + " " + getResultTypeString(response.status));
    }
    return false;
}

/**
 * Callback function to be invoked when the FINISH_REG ajax request succeeds.
 */
function onFinishReg(response) {
    // the server response with final status of registration
    // console.log("onFinishReg: response =" + JSON.stringify(response));
    // showAlert(strings.registration_success);
    var data = JSON.stringify({
        method: 'fido',
        isSuccess: true,
        result: response
    });
    var targetView = 'contents';
    wizViewMessenger.postMessage(data, targetView);
}



/**
 * Performs authentication operation
 */
function executeAuthentication(userName) {
    setInputUserName(userName);
    var userName = getInputUserName();
    if (userName === "") {
        showAlert(strings.empty_user_name);
        return false;
    }

    RPData = {
        "checkPolicy": false,
        "channelBindings": {
            "serverEndPoint": "",
            "tlsServerCertificate": "",
            "cid_pubkey": "",
            "tlsUnique": ""
        }
    };

    // First step is to call AppSDK initOperation function to
    //get the message for passing to server
    var key = {
        op: FidoUaf.Operation.AUTH,
        rpData: RPData
    };

    FidoUaf.initOperation(
        key,
        onInitAuth,
        function () {
            showAlert(strings.generic_error);
        }
    );

    return false;
}

/**
 * Callback function to be invoked when initialization for the AUTH operation was ended by the AppSDK.
 */
function onInitAuth(response) {
    messageFromAppSDK = response.message;
    // console.log("onInitAuth status:" + response.status + " message:" + messageFromAppSDK);
    if (response.status == FidoUaf.ResultType.SUCCESS) {
        var userName = getInputUserName();
        if (userName !== "") {
            //first login and get the session cookie from the server
            gFidoUafAjax.login(userName, function () {
                //get the authentication request from server
                gFidoUafAjax.initAuth("policyName", messageFromAppSDK, onAuthRequest, onAjaxError);
            }, onAjaxError);
        } else {
            //get the authentication request from server
            gFidoUafAjax.initAuth("policyName", messageFromAppSDK, onAuthRequest, onAjaxError);
        }
    } else {
        showAlert('response.status is not FidoUaf.ResultType.SUCCESS');
    }
}

/**
 * Callback function to be invoked when the INIT_AUTH ajax request succeeds.
 */
function onAuthRequest(authRequest) {
    // console.log("onAuthRequest response: " + JSON.stringify(authRequest));
    if (authRequest.statusCode !== 4000) {
        // console.log("Failed to get authentication request from server");
    } else {
        // console.log("onAuthRequest: SUCCEEDED");
    }

    RPData = {
        "checkPolicy": false,
        "channelBindings": {}
    };

    //process the request received from server
    var key = {
        rpData: RPData,
        msg: authRequest
    };

    FidoUaf.process(
        key,
        onProcessAuth,
        function () {
            showAlert(strings.generic_error);
        }
    );
}

/**
 * Callback function to be invoked when the AUTH operation was processed by the AppSDK.
 */
function onProcessAuth(response) {
    // console.log("onProcessAuth status:" + response.status + " message:" + response.message);
    if (response.status == FidoUaf.ResultType.SUCCESS) {
        //send the response from appSDK to server
        gFidoUafAjax.finishAuth(response.message, onFinishAuth, onAjaxError);
    } else {
        showAlert(strings.process_failed_with_status + " " + getResultTypeString(response.status));
    }
    return false;
}

/**
 * Callback function to be invoked when the FINISH_AUTH ajax request succeeds.
 */
function onFinishAuth(response) {
    //the server response with final status of authentication
    if (gUpdateFlag) {
        // console.log("onFinishAuth response.statusCode = " + response.statusCode);
        if (response.statusCode == 4001) {
            // update
            var handle = response.additionalInfo.authenticatorsResult[0].handle;
            var uvi = response.additionalInfo.authenticatorsResult[0].uvi;
            // console.log("onFinishAuth() handle = " + handle, " uvi" + uvi);
            var userName = getInputUserName();
            var message = response.message;
            //first login and get the session cookie from the server
            gFidoUafAjax.login(userName, function () {
                //get the delete request from server
                gFidoUafAjax.updateReg(handle, uvi, userName, message, onUpdateRequest, onAjaxError);
            }, onAjaxError);
        } else if (response.statusCode == 4000) {
            showAlert(strings.uvi_already_registered_dialog_msg + "(" + response.statusCode + ")");
        } else {
            showAlert(strings.uaf_server_error + "(" + response.statusCode + ")");
        }
        gUpdateFlag = false;
    } else {
        // uvi not match
        if (response.statusCode == 4001) {
            // console.log("Fingerprints don\'t match.");
            showAlert(strings.uaf_uvi_not_match_error + "(" + response.statusCode + ")");
        } else {
            // console.log("Authentication successfully completed.");
            var data = JSON.stringify({
                method: 'fido',
                isSuccess: true,
                result: response
            });
            var targetView = 'contents';
            wizViewMessenger.postMessage(data, targetView);
        }
    }
}


/**
 * Starts to retrieve the registrations.
 */
function executeDeregistration(userName) {
    // navigator.notification.alert('executeDeregistration: ' + userName);
    setInputUserName(userName);
    var userName = getInputUserName();
    if (userName !== "") {
        //first login and get the session cookie from the server
        gFidoUafAjax.login(userName, function () {
            //get the authentication request from server
            gFidoUafAjax.listReg(userName, "policyName", onListRegRequest, onAjaxErrorForListReg);
        }, onAjaxError);
    } else {
        showAlert(strings.empty_user_name);
    }

    return false;
}


/**
 * Callback function to be invoked when the LIST_REG ajax request succeeds.
 */
function onListRegRequest(listRegRequest) {
    // console.log("onListRegRequest response: " + JSON.stringify(listRegRequest));
    // navigator.notification.alert('onListRegRequest');
    // Apply html template to virtual list.
    // The template will be used to render the each item within the list.
    // var list = framework7.virtualList('.list-to-deregister', {
    //     items: [],
    //     renderItem: function (index, item) {
    //         return getRegistrationRow(index, item.description, item.handle);
    //     }
    // });

    var authenticatorsItems = [];

    // Iterate the registrations to get a description and a handle per each authenticator,
    // then put them to virtual list.
    listRegRequest.registrations.forEach(function (registrationsItem) {
        registrationsItem.authenticators.forEach(function (authenticatorsItem) {
            console.log(JSON.stringify(authenticatorsItem));
            authenticatorsItems.push(authenticatorsItem);
        });
    });

    var data = JSON.stringify({
        method: 'fido',
        isSuccess: true,
        result: authenticatorsItems
    });
    // navigator.notification.alert(authenticatorsItems);
    var targetView = 'contents';
    wizViewMessenger.postMessage(data, targetView);
}


/**
 * Deletes a registration which corresponds to given handle.
 */
function deleteRegistration(handle, userName) {
    // navigator.notification.alert('deleteRegistration: ' + userName);
    setInputUserName(userName);
    var userName = getInputUserName();
    if (userName === "") {
        showAlert(strings.empty_user_name);
        return false;
    }

    RPData = {
        "checkPolicy": false,
        "channelBindings": {}
    };

    // First step is to call AppSDK initOperation function to
    // get the message for passing to server
    var key = {
        op: FidoUaf.Operation.DELETE_REG,
        rpData: RPData
    };

    FidoUaf.initOperation(
        key,
        function (ret) {
            onInitDeleteOperation(ret, handle)
        },
        function () {
            showAlert(strings.generic_error);
        }
    );

    return false;
}

/**
 * Callback function to be invoked when initialization for the DELETE_REG operation was ended by the AppSDK.
 */
function onInitDeleteOperation(response, handle) {
    // navigator.notification.alert('onInitDeleteOperation');
    messageFromAppSDK = response.message;
    console.log("onInitDeleteOperation status:" + response.status + " message:" + messageFromAppSDK);
    if (response.status == FidoUaf.ResultType.SUCCESS) {
        var userName = getInputUserName();
        //first login and get the session cookie from the server
        gFidoUafAjax.login(userName, function () {
            //get the delete request from server
            gFidoUafAjax.deleteReg(handle, userName, messageFromAppSDK, onDeleteRegRequest, onAjaxError);
        }, onAjaxError);
    } else {
        showAlert('response.status is not FidoUaf.ResultType.SUCCESS');
    }
}

/**
 * Callback function to be invoked when the DELETE_REG ajax request succeeds.
 */
function onDeleteRegRequest(deleteRegRequest) {
    // navigator.notification.alert('onDeleteRegRequest');
    console.log("onDeleteRegRequest deleteRegRequest: " + JSON.stringify(deleteRegRequest));

    RPData = {
        "checkPolicy": false,
        "channelBindings": {}
    };

    //process the registration request received from server
    var key = {
        rpData: RPData,
        msg: deleteRegRequest
    };

    FidoUaf.process(
        key,
        onProcessDelete,
        function () {
            showAlert(strings.generic_error);
        }
    );
}

/**
 * Callback function to be invoked when the DELETE_REG operation was processed by the AppSDK.
 */
function onProcessDelete(response) {
    // navigator.notification.alert('onProcessDelete');
    console.log("onProcessDelete status:" + response.status);
    if (response.status == FidoUaf.ResultType.SUCCESS) {
        console.log("Delete successfully completed.");
        // showAlert(strings.deregistration_success);
        var data = JSON.stringify({
            method: 'fido',
            isSuccess: true,
            result: response
        });
        var targetView = 'contents';
        wizViewMessenger.postMessage(data, targetView);
    } else {
        showAlert(strings.process_failed_with_status + " " + getResultTypeString(response.status));
    }

    return false;
}

/**
 * Performs update operation (for Android only)
 */
function executeUpdateRegistration() {
    gUpdateFlag = true;
    executeAuthentication();
}

/**
 * Callback function to be invoked when the UPDATE_REG ajax request succeeds.
 */
function onUpdateRequest(updateRequest) {
    console.log("onUpdateRequestFromServer updateRequest: " + JSON.stringify(updateRequest));

    if (updateRequest.statusCode == 4000) {
        console.log("Update successfully completed.");
        showAlert(strings.uvi_update_dialog_msg + "(" + updateRequest.statusCode + ")");
    } else {
        console.log("updateRequest.statusCode !== 4000");
        showAlert(strings.uaf_server_error + "(" + updateRequest.statusCode + ")");
    }
    return false;
}

/**
 * Callback function to be invoked when the ajax request fails with some reason.
 * e.g. The server responded with a http status code which indicates an error like 400, 404.
 */
function onAjaxError(status, responseStatus, responseText) {
    // navigator.notification.alert('onAjaxError: [status: ' + status + ', responseStatus: ' + responseStatus + ', responseText: ' + responseText + ']');

    if (status == 404 || status == 0) {
        // Can be interpreted as a sent request could not reach the server.
        showAlert(strings.no_response_from_server);
    } else if (status == 400 && JSON.parse(responseText).statusCode == 4430) {
        showAlert(strings.uaf_reg_not_found_error + "(" + JSON.parse(responseText).statusCode + ")");
    } else {
        showAlert(strings.uaf_server_error + "(" + JSON.parse(responseText).statusCode + ")");
    }
}

/**
 * Callback function to be invoked when the LIST_REG ajax request fails with some reason.
 */
function onAjaxErrorForListReg(status, responseStatus, responseText) {
    // navigator.notification.alert('onAjaxErrorForListReg: ' + status);
    if (status == 400 && JSON.parse(responseText).statusCode == 4430) {
        // This is the case that UserNotFoundException was responded via calling
        // the ajax for LIST_REG. We do not want to show an alert on the deregistration screen
        // even if there are no registrations, but should make empty the registration list.
        var data = JSON.stringify({
            method: 'fido',
            isSuccess: true,
            result: []
        });
        // navigator.notification.alert(authenticatorsItems);
        var targetView = 'contents';
        wizViewMessenger.postMessage(data, targetView);
        return;
    }
    onAjaxError(status, responseStatus, responseText)
}


/**
 * Shows an alert dialog with given text.
 */
function showAlert(message) {
    // navigator.notification.alert(message);
    // framework7.alert(text, '');
    var userName = getInputUserName();
    var errorMessage = 'userName: ' + userName + ', message: ' + message;
    // try {
    //     errorMessage = window.btoa(unescape(encodeURIComponent(message)));
    // } catch (err) {
    //     errorMessage = message;
    // }
    var data = JSON.stringify({
        method: 'fido',
        isSuccess: false,
        error: errorMessage
    });
    var targetView = 'contents';
    wizViewMessenger.postMessage(data, targetView);
    // alert(message);
}

/**
 * Returns an input user name.
 */
function setInputUserName(userName) {
    return sessionStorage.setItem('user', userName);
}

/**
 * Returns an input user name.
 */
function getInputUserName() {
    return sessionStorage.getItem('user');
}

/**
 * Returns a registration row which can be used for adding to the virtual list.
 */
function getRegistrationRow(index, description, handle) {
    // Always check the top item when the list is created.
    var checked = '';
    if (index == 0) {
        checked = ' checked="checked"'
    }
    var row;
    if (isAndroid === true) {
        row = '<li>' +
            '<label class="label-radio item-content">' +
            '<input type="radio" name="my-radio" value="' + handle + '"' + checked + '>' +
            '<div class="item-media">' +
            '<i class="icon icon-form-radio"></i>' +
            '</div>' +
            '<div class="item-inner">' +
            '<div class="item-title">' + description + '</div>' +
            '</div>' +
            '</label>' +
            '</li>'
    } else {
        // According to Framework7 documentation, "item-media" shoud not be added for iOS.
        row = '<li>' +
            '<label class="label-radio item-content">' +
            '<input type="radio" name="my-radio" value="' + handle + '"' + checked + '>' +
            '<div class="item-inner">' +
            '<div class="item-title">' + description + '</div>' +
            '</div>' +
            '</label>' +
            '</li>'
    }
    return row;
}

/**
 * Returns a string value which corresponds to given type.
 */
function getResultTypeString(type) {
    switch (type) {
        case FidoUaf.ResultType.SUCCESS:
            return 'SUCCESS';
        case FidoUaf.ResultType.FAILURE:
            return 'FAILURE';
        case FidoUaf.ResultType.CANCELED:
            return 'CANCELED';
        case FidoUaf.ResultType.NO_MATCH:
            return 'NO_MATCH';
        case FidoUaf.ResultType.PROTOCOL_ERROR:
            return 'PROTOCOL_ERROR';
        case FidoUaf.ResultType.ALREADY_INITIALIZED:
            return 'ALREADY_INITIALIZED';
        case FidoUaf.ResultType.KEY_DISAPPEARED_PERMANENTLY:
            return 'KEY_DISAPPEARED_PERMANENTLY';
        case FidoUaf.ResultType.AUTHENTICATOR_ACCESS_DENIED:
            return 'AUTHENTICATOR_ACCESS_DENIED';
        case FidoUaf.ResultType.USER_LOCKOUT:
            return 'USER_LOCKOUT';
        case FidoUaf.ResultType.USER_NOT_ENROLLED:
            return 'USER_NOT_ENROLLED';
        default:
            return 'OTHER(' + type + ')';
    }
}

/**
 * The following interface allows Relying Parties to make the ajax calls to the REST API.
 */
FidoUafAjax = function () {

    var REST_REQUEST_HEADER = {
        'Content-Type': 'application/json; charset=UTF-8'
    };

    //-----------------------------------------------------------------------------------
    // Make an ajax POST request to REST api for getting authentication request
    //-----------------------------------------------------------------------------------
    this.initAuth = function (policyName, messageFromAppSDK, successCallback, ajaxErrorCallback) {

        var authUrl = netConfig.mfas_url + netConfig.api_auth;

        jsonData = {
            "operation": "INIT_AUTH",
            "policyName": policyName,
            "message": messageFromAppSDK
        };

        var strJsonData = JSON.stringify(jsonData);
        console.log("ajax.initAuth: authUrl = " + authUrl + " JsonData=" + strJsonData);

        $.ajax({
            type: REQUEST_TYPE.POST,
            headers: REST_REQUEST_HEADER,
            url: authUrl,
            dataType: 'json',
            crossDomain: false,
            xhrFields: {
                withCredentials: true
            },
            data: JSON.stringify(jsonData),
            timeout: netConfig.connection_timeout,
            success: function (response, textStatus, jqXHR) {
                console.log("ajax.initAuth: SUCCESS");
                successCallback(response);
            },
            cache: false,
            error: function (xhr) {
                console.log('ajax.initAuth: Request Status: ' + xhr.status + ' Status Text: ' + xhr.statusText + ' ' + xhr.responseText);
                ajaxErrorCallback(xhr.status, xhr.statusText, xhr.responseText);
            },
            complete: function () { }
        });
    };

    //-----------------------------------------------------------------------------------
    // Make an ajax POST request to REST api for sending authentication response
    //-----------------------------------------------------------------------------------
    this.finishAuth = function (messageFromAppSDK, successCallback, ajaxErrorCallback) {

        var authUrl = netConfig.mfas_url + netConfig.api_auth;

        jsonData = {
            "operation": "FINISH_AUTH",
            "message": messageFromAppSDK
        };

        $.ajax({
            type: REQUEST_TYPE.POST,
            headers: REST_REQUEST_HEADER,
            url: authUrl,
            dataType: 'json',
            crossDomain: true,
            xhrFields: {
                withCredentials: true
            },
            data: JSON.stringify(jsonData),
            timeout: netConfig.connection_timeout,
            success: function (response, textStatus, jqXHR) {
                console.log("ajax.finishAuth: SUCCESS");
                successCallback(response);
            },
            cache: false,
            error: function (xhr) {
                console.log('ajax.finishAuth: Request Status: ' + xhr.status + ' Status Text: ' + xhr.statusText + ' ' + xhr.responseText);
                ajaxErrorCallback(xhr.status, xhr.statusText, xhr.responseText);
            },
            complete: function () { }
        });
    };

    //-----------------------------------------------------------------------------------
    // Make an ajax GET request to REST api for getting session cookie
    //-----------------------------------------------------------------------------------
    this.login = function (userName, loginCallback, ajaxErrorCallback) {
        $.ajax({
            type: REQUEST_TYPE.GET,
            headers: REST_REQUEST_HEADER,
            url: netConfig.mfas_url + netConfig.api_login + '?userName=' + userName + '&pword=noknok',
            timeout: netConfig.connection_timeout,
            crossDomain: false,
            cache: false,
            success: function (response, textStatus, jqXHR) {
                console.log("ajax.login: SUCCESS");
                loginCallback();
            },
            error: function (xhr) {
                console.log('ajax.login: Request Status: ' + xhr.status + ' Status Text: ' + xhr.statusText + ' ' + xhr.responseText);
                ajaxErrorCallback(xhr.status, xhr.statusText, xhr.responseText);
            },
            complete: function () { }
        });
    }

    //-----------------------------------------------------------------------------------
    // Make an ajax POST request to REST api for getting registration request
    //-----------------------------------------------------------------------------------
    this.initReg = function (userName, policyName, messageFromAppSDK, successCallback, ajaxErrorCallback) {
        var initRegUrl = netConfig.mfas_url + netConfig.api_reg;

        jsonData = {
            "operation": "INIT_REG",
            "userName": userName,
            "policyName": policyName,
            "message": messageFromAppSDK
        };

        var strJsonData = JSON.stringify(jsonData);
        console.log("ajax.initReg: initRegUrl = " + initRegUrl + " JsonData=" + strJsonData);

        $.ajax({
            type: REQUEST_TYPE.POST,
            headers: REST_REQUEST_HEADER,
            url: initRegUrl,
            dataType: 'json',
            crossDomain: true,
            xhrFields: {
                withCredentials: true
            },
            data: JSON.stringify(jsonData),
            timeout: netConfig.connection_timeout,
            success: function (response, textStatus, jqXHR) {
                console.log("ajax.initReg: SUCCESS");
                successCallback(response);

            },
            cache: false,
            error: function (xhr) {
                console.log('ajax.initReg: Request Status: ' + xhr.status + ' Status Text: ' + xhr.statusText + ' ' + xhr.responseText);
                ajaxErrorCallback(xhr.status, xhr.statusText, xhr.responseText);
            },
            complete: function () { }
        });
    };

    //-----------------------------------------------------------------------------------
    // Make an ajax POST request to REST api for sending registration response
    //-----------------------------------------------------------------------------------
    this.finishReg = function (userName, messageFromAppSDK, successCallback, ajaxErrorCallback) {
        var finishRegUrl = netConfig.mfas_url + netConfig.api_reg;

        jsonData = {
            "operation": "FINISH_REG",
            "userName": userName,
            "message": messageFromAppSDK
        };
        var strJsonData = JSON.stringify(jsonData);
        console.log("ajax.finishReg: finishUrl = " + finishRegUrl + " JsonData=" + strJsonData);

        $.ajax({
            type: REQUEST_TYPE.POST,
            headers: REST_REQUEST_HEADER,
            url: finishRegUrl,
            dataType: 'json',
            crossDomain: false,
            xhrFields: {
                withCredentials: true
            },
            data: JSON.stringify(jsonData),
            timeout: netConfig.connection_timeout,
            success: function (response, textStatus, jqXHR) {
                console.log("ajax.finishReg: SUCCESS" + response);
                successCallback(response);
            },
            cache: false,
            error: function (xhr) {
                console.log('ajax.finishReg: Request Status: ' + xhr.status + ' Status Text: ' + xhr.statusText + ' ' + xhr.responseText);
                ajaxErrorCallback(xhr.status, xhr.statusText, xhr.responseText);
            },
            complete: function () { }
        });
    };

    //-----------------------------------------------------------------------------------
    // Make an ajax POST request to REST api for getting registration list request
    //-----------------------------------------------------------------------------------
    this.listReg = function (userName, policyName, successCallback, ajaxErrorCallback) {
        var listRegUrl = netConfig.mfas_url + netConfig.api_reg;

        jsonData = {
            "operation": "LIST_REG",
            "userName": userName,
            "policyName": policyName
        };

        var strJsonData = JSON.stringify(jsonData);
        console.log("ajax.listReg: listRegUrl = " + listRegUrl + " JsonData=" + strJsonData);

        $.ajax({
            type: REQUEST_TYPE.POST,
            headers: REST_REQUEST_HEADER,
            url: listRegUrl,
            dataType: 'json',
            crossDomain: true,
            xhrFields: {
                withCredentials: true
            },
            data: JSON.stringify(jsonData),
            timeout: netConfig.connection_timeout,
            success: function (response, textStatus, jqXHR) {
                console.log("ajax.listReg: SUCCESS");
                successCallback(response);

            },
            cache: false,
            error: function (xhr) {
                console.log('ajax.listReg: Request Status: ' + xhr.status + ' Status Text: ' + xhr.statusText + ' ' + xhr.responseText);
                ajaxErrorCallback(xhr.status, xhr.statusText, xhr.responseText);
            },
            complete: function () { }
        });
    };

    //-----------------------------------------------------------------------------------
    // Make an ajax POST request to REST api for sending deregistration response
    //-----------------------------------------------------------------------------------
    this.deleteReg = function (handle, userName, messageFromAppSDK, successCallback, ajaxErrorCallback) {
        var deleteRegUrl = netConfig.mfas_url + netConfig.api_reg;

        console.log("ajax.deleteReg: message = " + messageFromAppSDK);
        console.log("ajax.deleteReg: handle = " + handle);

        jsonData = {
            "handle": handle,
            "operation": "DELETE_REG",
            "userName": userName,
            "message": messageFromAppSDK
        };
        var strJsonData = JSON.stringify(jsonData);
        console.log("ajax.deleteReg: deleteRegUrl = " + deleteRegUrl + " JsonData=" + strJsonData);

        $.ajax({
            type: REQUEST_TYPE.POST,
            headers: REST_REQUEST_HEADER,
            url: deleteRegUrl,
            dataType: 'json',
            crossDomain: false,
            xhrFields: {
                withCredentials: true
            },
            data: JSON.stringify(jsonData),
            timeout: netConfig.connection_timeout,
            success: function (response, textStatus, jqXHR) {
                console.log("ajax.deleteReg: SUCCESS");
                successCallback(response);
            },
            cache: false,
            error: function (xhr) {
                console.log('ajax.deleteReg: Request Status: ' + xhr.status + ' Status Text: ' + xhr.statusText + ' ' + xhr.responseText);
                ajaxErrorCallback(xhr.status, xhr.statusText, xhr.responseText);
            },
            complete: function () { }
        });
    };

    //-----------------------------------------------------------------------------------
    // Make an ajax POST request to REST api for sending update response
    //-----------------------------------------------------------------------------------
    this.updateReg = function (handle, uvi, userName, message, successCallback, ajaxErrorCallback) {
        var updateRegUrl = netConfig.mfas_url + netConfig.api_reg;

        jsonData = {
            "operation": "UPDATE_REG",
            "userName": userName,
            "handle": handle,
            "regData": [
                { "name": "uvi", "value": uvi },
                { "name": "uviStatus", "value": 1 }
            ],
            "needDetails": 1
        };
        var strJsonData = JSON.stringify(jsonData);
        console.log("ajax.updateReg: finishUrl = " + updateRegUrl + " JsonData=" + strJsonData);

        $.ajax({
            type: REQUEST_TYPE.POST,
            headers: REST_REQUEST_HEADER,
            url: updateRegUrl,
            dataType: 'json',
            crossDomain: false,
            xhrFields: {
                withCredentials: true
            },
            data: JSON.stringify(jsonData),
            timeout: netConfig.connection_timeout,
            success: function (response, textStatus, jqXHR) {
                console.log("ajax.updateReg: SUCCESS");
                successCallback(response);
            },
            cache: false,
            error: function (xhr) {
                console.log('ajax.updateReg: Request Status: ' + xhr.status + ' Status Text: ' + xhr.statusText + ' ' + xhr.responseText);
                ajaxErrorCallback(xhr.status, xhr.statusText, xhr.responseText);
            },
            complete: function () { }
        });
    };
}

var gFidoUafAjax = new FidoUafAjax();

//Update Flag
var gUpdateFlag = false;

REQUEST_TYPE = {};
Object.defineProperty(REQUEST_TYPE, "GET", {
    value: "GET"
});
Object.defineProperty(REQUEST_TYPE, "POST", {
    value: "POST"
});