(function () {
    'use strict';

    //Localstorage and Sessionstorage ids
    const LOCALSTORAGE_ID = "deez-web-app-dylan";
    const SESSIONSTORAGE_ID = "last-search-deez-web"

    //Button to launch the search
    const startSearch = $('#submitInput');

    //Array with all your fav songs
    let favorites = [];

    //Last request url to keep on choosing songs
    let lastRequest = '';

    function init() {
        //Message if there is no current search
        if ($('.search-results').text().length === 0) {
            $('.search-results').append(`<h1 class="no-search">Aucune recherche actuellement ...</h1>`);
        }

        //Get the last request url if existant
        if(sessionStorage[SESSIONSTORAGE_ID]) {
            lastRequest = sessionStorage.getItem([SESSIONSTORAGE_ID]);
            search(lastRequest);
        }

        //Check localstorage to fill the fav array
        if (localStorage[LOCALSTORAGE_ID]) {
            favorites = JSON.parse(localStorage.getItem([LOCALSTORAGE_ID]));

            //Empty the ctn of your fav songs
            $('.favorites-ctn').empty();

            //Diplay alll your fav songs
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

                //Event when you want to delete a fav song
                $(`.delete #${song.id}`).click(function (event) {
                    deletefavorite(i, song);
                })
            }
        }

        //Event when you click to search a song
        startSearch.click(function (event) {
            event.preventDefault();
            const searchValue = $('#search').val();
            const sortValue = $('#sort').val();
            const url = `https://api.deezer.com/search?q=${searchValue}&order=${sortValue}&output=jsonp`;
            $('.search-results').empty();
            search(url);
        });

        //Choose a random fav song
        randomFavoriteSong(favorites);

        //Message if you have no fav songs
        if (favorites.length <= 0) {
            $('.favorites-ctn').append(`<h1>Aucun Favoris dans votre playlist actuellement...</h1>`);
        }
    }

    //Function to launch the search
    function search(requestUrl) {
        $.ajax({
            url: requestUrl,
            dataType: 'jsonp',
            error: function(request, status, error) {
                console.log(request, status, error);
            }
        })        
            .then(obj => {
                //Get data
                const songs = obj.data;
                //Keeps the last request url
                lastRequest = requestUrl;
                sessionStorage.setItem(SESSIONSTORAGE_ID, lastRequest);
                //If there is no results
                if (songs === undefined || songs.length <= 0) {
                    $('.search-results').append(`
                    <h1>Ooups, on dirait qu'il n'y ait pas de résultat pour cette recherche ...</h1>
                    `);
                } else {
                    $('.search-results').empty();
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
                            //Index of the song to delete
                            let favIndex = getIndex(song, favorites);
                            
                            //Deletion of the fav song
                            $(`.add-song-${song.id} #add-${song.id}`).click(function (event) {
                                deletefavorite(favIndex, song);
                                
                            });
                        }
                    });
                }
            })
            //Errors
            .catch(error => {
                if (error) {
                    console.error(error.message);
                    throw error;
                }
            })
    }

    //Put the song in your favorites
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

    //Delete the specific fav song 
    function deletefavorite(index, song) {
        console.log(index);
        favorites.splice(index, 1);
        localStorage.setItem(LOCALSTORAGE_ID, JSON.stringify(favorites));
        onChangeDelete(song, index);
        init();
    }

    //Changing of the button when you need to delete one of your fav songs
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

    //Diplay a random of your fav songs
    function randomFavoriteSong(favorites) {
        $('.random-favorite').empty();
        //Check your fav array to display a random song
        if (favorites.length > 0) {
            //Random song to display
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
            //Display another random song
            $(`#random-${randomSong.id}`).click(function (event) {
                randomFavoriteSong(favorites);
            });
        } else {
            //If there is no fav song
            $('.random-favorite').append(
                `<h1 class="add-one">Enregistrez votre premier coup de coeur pour voir un titre aléatoire !</h1>`);
        }
    }

    //Return if the song is already added
    function isAlreadyAdded(song, favorites) {
        for (let i = 0; i < favorites.length; i++) {
            if (favorites[i].id === song.id) {
                return true;
            }
        }
    }

    //Get index of the fav array to delete it
    function getIndex(song) {
        for (let i = 0; i < favorites.length; i++) {
            if (favorites[i].id === song.id) {
                return i;
            }
        }
    }

    //App init
    init();

})();