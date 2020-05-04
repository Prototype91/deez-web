(function () {
    'use strict';

    const LS_ID = "deez-web-app-dylan";
    let favorites = [];

    const startSearch = $('#submitInput');

    startSearch.click(function (e) {
        e.preventDefault();
        search();
    });

    function search() {
        const searchValue = $('#search').val();
        const sortValue = $('#sort').val();
    
        console.log(searchValue, sortValue);
    
        $.ajax({
            url: `https://api.deezer.com/search?q=${searchValue}&order=${sortValue}&output=jsonp`,
            dataType: 'jsonp'
        })
    
            .then((obj) => {
    
                const results = obj.data;
    
                console.log(results);
    
                let content = '';
    
                $.each(results, function (index, result) {
                    content += `
                <div class="result-ctn">
                    <div class="img-add">
                        <img src="${ result.album.cover}" alt="">
                        <input type="submit" value="Ajouter aux favoris" id="${ result.id }" class="add">
                    </div>
                    <div class="result-infos">
                        <h1>${ result.title}</h1>
                        <h2>${ result.artist.name} / ${result.album.title}</h2>
                        <audio controls src="${ result.preview}"></audio>
                    </div>
                </div>
                `;
                });
    
                $('.search-results').html(content);
    
                $('.add').click(function (e) {
                    e.preventDefault();
                    addFavorite($(this).attr('id'));
                })
            })
    }
    
    function addFavorite(id) {
        console.log(id);
        // favorites.push(song);
        // localStorage.setItem(LS_ID, JSON.stringify(favorites));
    }
    
    function deletefavorite() {
    
    }
})();