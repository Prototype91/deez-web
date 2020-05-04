(function () {
    'use strict';

    const LOCALSTORAGE_ID = "deez-web-app-dylan";
    const startSearch = $('#submitInput');
    let favorites = [];

    function init() {

        if (localStorage[LOCALSTORAGE_ID]) {
            favorites = JSON.parse(localStorage[LOCALSTORAGE_ID]);
            console.log('ARRAY FAVORITES', favorites);

            $('.favorites-ctn').empty();

            for (let i = 0; i < favorites.length; i++) {

                const song = favorites[i];

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
                    deletefavorite(song, i);
                })

            }
        }


        startSearch.click(function (event) {
            event.preventDefault();
            $('.search-results').empty();
            search();
        });

        if ($('.search-results').text().length === 0) {
            console.log('Rien à afficher');
            $('.search-results').append(`<h1>Aucune recherche actuellement</h1>`);
        }

        randomFavoriteSong(favorites);

        if (favorites.length <= 0) {
            $('.favorites-ctn').append(
                `<h1>Aucun Favoris dans votre playlist actuellement...</h1>`);
        }

    }



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
        init();
    }

    function deletefavorite(song, index) {
        console.log(song, index);
        //console.log(favorites[0].splice(index, 1))
        favorites.splice(index, 1)
        localStorage.setItem(LOCALSTORAGE_ID, JSON.stringify(favorites));
        init();
    }

    function randomFavoriteSong(favorites) {
        if (favorites.length > 0) {
            let randomSong = favorites[Math.floor(Math.random() * favorites.length)];
            console.log(Math.floor(Math.random() * favorites.length))
            $('.random-favorite').append(
                `
            <div class="result-ctn">
                <div class="img-add">
                    <img src="${randomSong.album.cover}" alt="">
                    <input type="submit" value="Retirer des favoris" id="${randomSong.id}">
                </div>
                <div class="song-infos">
                    <h1>${randomSong.title}</h1>
                    <h2>${randomSong.artist.name} / ${randomSong.album.title}</h2>
                    <audio controls src="${randomSong.preview}"></audio>
                </div>
            </div>
            `);
        } else {
            $('.random-favorite').append(
                `<h1>Enregistrez votre premier coup de coeur pour voir un titre aléatoire !</h1>`)
        }

    }

    init();

})();