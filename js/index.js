(function () {
    'use strict';

    const startSearch = $('#submitInput');

    startSearch.click(function(e) {
        e.preventDefault();
        search();
    })

    function search() {
        const searchValue = $('#search').val();
        const sortValue = $('#sort').val();

        console.log(searchValue, sortValue);

        $.ajax({
            url: `https://api.deezer.com/search?q=${searchValue}&order=${sortValue}&output=jsonp`,
            dataType: 'jsonp'
        }).then((result) => {
            console.log(result);
        })
    }

})();