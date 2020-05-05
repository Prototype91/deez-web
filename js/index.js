(function () {
    'use strict';

    const LOCALSTORAGE_ID = "deez-web-app-dylan";
    const startSearch = $('#submitInput');
    let favorites = [];

    function init() {
        if (localStorage[LOCALSTORAGE_ID]) {
            favorites = JSON.parse(localStorage[LOCALSTORAGE_ID]);

            $('.favorites-ctn').empty();

            for (let i = 0; i < favorites.length; i++) {
                const song = favorites[i];
                $('.favorites-ctn').append(
                    `
                    <div class="result-ctn">
                        <div class="img-add delete">
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
                $(`.delete #${song.id}`).click(function (event) {
                    deletefavorite(i, song);
                })
            }
        }

        startSearch.click(function (event) {
            event.preventDefault();
            $('.search-results').empty();
            search();
        });

        if ($('.search-results').text().length === 0) {
            $('.search-results').append(`<h1>Aucune recherche actuellement</h1>`);
        }

        randomFavoriteSong(favorites);

        if (favorites.length <= 0) {
            $('.favorites-ctn').append(`<h1>Aucun Favoris dans votre playlist actuellement...</h1>`);
        }
    }

    function search() {
        const searchValue = $('#search').val();
        const sortValue = $('#sort').val();
        $.ajax({
            url: `https://api.deezer.com/search?q=${searchValue}&order=${sortValue}&output=jsonp`,
            dataType: 'jsonp',
            error: function(request, status, error) {
                console.log(request, status, error);
            }
        })
            .then(obj => {
                const songs = obj.data;

                if (songs === undefined || songs.length <= 0) {
                    $('.search-results').append(`
                    <h1>Ooups, on dirait qu'il n'y ait pas de résultat pour cette recherche ...</h1>
                    `);
                } else {
                    $.each(songs, function (index, song) {
                        if (isAlreadyAdded(song, favorites) !== true) {
                            $('.search-results').append(
                                `
                                <div class="result-ctn">
                                    <div class="img-add add-song-${song.id}">
                                        <img src="${song.album.cover}" alt="">
                                        <input type="submit" value="Ajouter aux favoris" id="add-${song.id}" class="input-add">
                                    </div>
                                    <div class="song-infos">
                                        <h1>${song.title}</h1>
                                        <h2>${song.artist.name} / ${song.album.title}</h2>
                                        <audio controls src="${song.preview}"></audio>
                                    </div>
                                </div>
                            `);
                            $(`.add-song-${song.id} #add-${song.id}`).click(function (event) {
                                event.preventDefault();
                                if (isAlreadyAdded(song, favorites) !== true) {
                                    addFavorite(song, index);
                                }
                            });
                        } else {
                            $('.search-results').append(
                                `
                                <div class="result-ctn">
                                    <div class="img-add add-song-${song.id}">
                                        <img src="${song.album.cover}" alt="">
                                        <input type="submit" value="Retirer de mes Favoris" id="add-${song.id}" class="input-add">
                                    </div>
                                    <div class="song-infos">
                                        <h1>${song.title}</h1>
                                        <h2>${song.artist.name} / ${song.album.title}</h2>
                                        <audio controls src="${song.preview}"></audio>
                                    </div>
                                </div>
                            `);

                            let favIndex = getIndex(song, favorites);

                            $(`.add-song-${song.id} #add-${song.id}`).click(function (event) {
                                deletefavorite(favIndex, song);
                                onChangeDelete(song, favIndex);
                            });
                        }
                    });
                }
            })
            .catch(error => {
                if (error) {
                    console.error(error.message);
                    throw error;
                }
            })
    }

    function addFavorite(song, index) {
        favorites.push(song);
        localStorage.setItem(LOCALSTORAGE_ID, JSON.stringify(favorites));
        $(`.add-song-${song.id}`).empty();
        $(`.add-song-${song.id}`).append(`
        <img src="${song.album.cover}" alt="">
        <input type="submit" value="Retirer des Favoris" id="add-${song.id}" class="input-add">
        `);
        $(`.add-song-${song.id} #add-${song.id}`).click(function (event) {
            event.preventDefault();
            deletefavorite(index, song);
        });
    }

    function deletefavorite(index, song) {
        console.log(index);
        favorites.splice(index, 1);
        localStorage.setItem(LOCALSTORAGE_ID, JSON.stringify(favorites));
        onChangeDelete(song, index);
        init();
    }

    function onChangeDelete(song, index) {
        $(`.add-song-${song.id}`).empty();
        $(`.add-song-${song.id}`).append(`
        <img src="${song.album.cover}" alt="">
        <input type="submit" value="Ajouter aux favoris" id="new-${song.id}" class="input-add">
        `);
        $(`#new-${song.id}`).click(function (event) {
            event.preventDefault();
            addFavorite(song, index);
        });
    }

    function randomFavoriteSong(favorites) {
        $('.random-favorite').empty();
        if (favorites.length > 0) {
            let randomSong = favorites[Math.floor(Math.random() * favorites.length)];
            $('.random-favorite').append(
                `
                <div class="result-ctn">
                    <div class="img-add random">
                        <img src="${randomSong.album.cover}" alt="">
                        <input type="submit" value="Autre son aléatoire" id="random-${randomSong.id}">
                    </div>
                    <div class="song-infos">
                        <h1>${randomSong.title}</h1>
                        <h2>${randomSong.artist.name} / ${randomSong.album.title}</h2>
                        <audio controls src="${randomSong.preview}"></audio>
                    </div>
                </div>
            `);

            $(`#random-${randomSong.id}`).click(function (event) {
                randomFavoriteSong(favorites);
            });
        } else {
            $('.random-favorite').append(
                `<h1>Enregistrez votre premier coup de coeur pour voir un titre aléatoire !</h1>`);
        }
    }

    function isAlreadyAdded(song, favorites) {
        for (let i = 0; i < favorites.length; i++) {
            if (favorites[i].id === song.id) {
                return true;
            }
        }
    }

    function getIndex(song) {
        for (let i = 0; i < favorites.length; i++) {
            if (favorites[i].id === song.id) {
                return i;
            }
        }
    }

    init();

})();