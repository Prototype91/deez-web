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

                const songs = obj.data;

                console.log(songs);

                $.each(songs, function (index, song) {

                    $('.search-results').append(
                        `
                <div class="result-ctn">
                    <div class="img-add">
                        <img src="${song.album.cover}" alt="">
                        <input type="submit" value="Ajouter aux favoris" id="${song.id}">
                    </div>
                    <div class="song-infos">
                        <h1>${song.title}</h1>
                        <h2>${song.artist.name} / ${song.album.title}</h2>
                        <audio controls src="${song.preview}"></audio>
                    </div>
                </div>
                `);
                
                $(`#${song.id}`).click(function (e) {
                    e.preventDefault();
                    addFavorite(song);
                })

                });

            })
    }

    function addFavorite(song) {
        console.log(song);
        // favorites.push(song);
        // localStorage.setItem(LS_ID, JSON.stringify(favorites));
    }

    function deletefavorite(song) {

    }
})();