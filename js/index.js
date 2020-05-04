console.log('Start !');

(function () {
    'use strict';

    console.log('JQUERY !');

    $.ajax({
        url: 'https://api.deezer.com/search?q=eminem&output=jsonp',
        dataType: 'jsonp'
    }).then((result) => {
        console.log(result);
    })

    function onSuccess(data) {
        console.log('success !', data);
    }

    function onError(jqXHR) {
        console.log(`Une erreur s'est produite`, jqXHR.status);
    }

})();