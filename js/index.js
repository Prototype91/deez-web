(function () {
    'use strict';

    const LOCALSTORAGE_ID = "deez-web-app-dylan";
    let favorites = [];

    const startSearch = $('#submitInput');

    if (localStorage[LOCALSTORAGE_ID]) {
        favorites.push(JSON.parse(localStorage[LOCALSTORAGE_ID]));
        console.log('ARRAY FAVORITES', favorites);

        for (let i = 0; i < favorites[0].length; i++) {

            const song = favorites[0][i];

            $('.favorites-ctn').append(
                `
        <div class="result-ctn">
            <div class="img-add">
                <img src="${song.album.cover}" alt="">
                <input type="submit" value="Retirer des favoris" id="${song.id}">
            </div>
            <div class="song-infos">
                <h1>${song.title}</h1>
                <h2>${song.artist.name} / ${song.album.title}</h2>
                <audio controls src="${song.preview}"></audio>
            </div>
        </div>
        `);

        $(`#${song.id}`).click(function (event) {
            event.preventDefault();
            deletefavorite(song);
        })

        }
    } else {
        $('.favorites-ctn').append(
            `<h1>Aucun Favoris dans votre playliste actuellement...</h1>`);
    }

    startSearch.click(function (event) {
        event.preventDefault();
        $('.search-results').empty();
        search();
    });

    function search() {
        const searchValue = $('#search').val();
        const sortValue = $('#sort').val();

        $.ajax({
            url: `https://api.deezer.com/search?q=${searchValue}&order=${sortValue}&output=jsonp`,
            dataType: 'jsonp'
        })

            .then(obj => {

                const songs = obj.data;

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

                    $(`#${song.id}`).click(function (event) {
                        event.preventDefault();
                        addFavorite(song);
                    })

                });

            })

            .catch(error => {
                if (error) throw error;
            })
    }

    function addFavorite(song) {
        console.log('SONG ADDED', song);
        favorites.push(song);
        localStorage.setItem(LOCALSTORAGE_ID, JSON.stringify(favorites));
        console.log('LOCALSTORAGE', localStorage[LOCALSTORAGE_ID]);
        console.log('ARRAY FAVORITES', favorites);
    }

    function deletefavorite(song) {
        console.log(song);
    }

    function displayFavorites() {
        const ls = JSON.parse(localStorage[LOCALSTORAGE_ID]);
        console.log(ls);
        for (let i = 0; i < ls.length; i++) {
            console.log('LSSSS', ls[i]);

            $('.favorites-ctn').append(
                `
        <div class="result-ctn">
            <div class="img-add">
                <img src="${ls[i].album.cover}" alt="">
                <input type="submit" value="Retirer des favoris" id="${ls[i].id}">
            </div>
            <div class="ls[i]-infos">
                <h1>${ls[i].title}</h1>
                <h2>${ls[i].artist.name} / ${ls[i].album.title}</h2>
                <audio controls src="${ls[i].preview}"></audio>
            </div>
        </div>
        `);

            $(`#${ls[i].id}`).click(function (event) {
                event.preventDefault();
                deletefavorite(ls[i]);
            })
        }
    }

    //displayFavorites();
})();