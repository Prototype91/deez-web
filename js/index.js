(function () {
    'use strict';

    //Localstorage and Sessionstorage ids
    const LOCALSTORAGE_ID = "deez-web-app-dylan";
    const SESSIONSTORAGE_ID = "last-search-deez-web-dylan"

    //Button to launch the search
    const startSearch = $('#submitInput');

    //Array with all your fav songs
    let favorites = [];

    //Last request data to keep on choosing songs
    let lastRequestData = {};

    function init() {
        //Check sessionstorage for last request
        if (sessionStorage.getItem(SESSIONSTORAGE_ID)) {
            lastRequestData = JSON.parse(sessionStorage.getItem(SESSIONSTORAGE_ID));
            if (lastRequestData.title.trim().length > 0) {
                $('.current-search-title').html(`de "${lastRequestData.title.trim()}"`);
                $('#search').val(lastRequestData.title.trim());
                $('#sort').val(lastRequestData.sort);
                search(lastRequestData.url);
            } else {
                $("#show-more").empty();
                $('.search-results').html(`
                <h1 class="ooups">Veuillez saisir au moins un caractère ...</h1>
                `);
            }
        } else {
            //Message if there is no current search
            if ($('.search-results').text().length === 0) {
                $('.search-results').append(`<h1 class="no-search">Aucune recherche actuellement ...</h1>`);
            }
        }

        //Check localstorage to fill the fav array
        if (localStorage.getItem(LOCALSTORAGE_ID)) {
            favorites = JSON.parse(localStorage.getItem(LOCALSTORAGE_ID));
            //Empty the ctn of your fav songs
            $('.favorites-ctn').empty();
            //Diplay all your fav songs
            for (let i = 0; i < favorites.length; i++) {
                const song = favorites[i];
                $('.favorites-ctn').append(
                    `
                    <div class="result-ctn">
                        <div class="img-add delete">
                            <img src="${song.album.cover}" alt="">
                            <input type="submit" value="Retirer des favoris" id="${song.id}" class="btn-remove">
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
                    event.preventDefault();
                    deletefavorite(i, song);
                    init();
                })
            }
        }

        //Event when you click to search a song
        startSearch.click(function (event) {
            event.preventDefault();

            //Values of the current search
            const searchValue = $('#search').val();
            const sortValue = $('#sort').val();
            const url = `https://api.deezer.com/search?q=${searchValue}&order=${sortValue}&output=jsonp`;

            //Check whitespaces
            if (searchValue.trim().length > 0) {
                lastRequestData = { url: url, title: searchValue, sort: sortValue };
                sessionStorage.setItem(SESSIONSTORAGE_ID, JSON.stringify(lastRequestData));
                $('#search').val(searchValue.trim());
                $('.search-results').empty();
                $('.more-results').empty();
                $('.current-search-title').html(`de "${lastRequestData.title.trim()}"`);
                search(url);
            } else {
                sessionStorage.clear();
                $('.more-results').empty();
                $('.current-search-title').empty();
                $('.search-results').html(`
                <h1 class="ooups">Veuillez saisir au moins un caractère ...</h1>
                `);
            }
        });

        //Choose a random fav song
        randomFavoriteSong(favorites);

        //Message if you have no fav songs
        if (favorites.length <= 0) {
            $('.favorites-ctn').append(`<h1 class="no-fav">Aucuns coups de coeur dans votre playlist actuellement...</h1>`);
        }
    }

    //Function to launch the search
    function search(requestUrl) {
        $.ajax({
            url: requestUrl,
            dataType: 'jsonp',
        })
            .then(obj => {
                //Get data
                const songs = obj.data;
                //Next url
                const next = obj.next;
                //If there is no results
                if (songs === undefined || songs.length <= 0) {
                    $('.search-results').append(`
                <h1 class="ooups">Ooups, on dirait qu'il n'y a pas de résultat pour "${lastRequestData.title}"</h1>
                `);
                } else {
                    $('.search-results').empty();
                    displayResults(songs);
                    $('.more-results').append(`<input type="submit" value="Voir plus" id="show-more">`);
                    $("#show-more").click(function (event) {
                        event.preventDefault();
                        $(this).remove();
                        //Display next reults
                        getMoreResults(next);
                    });
                }
            })
            //Errors
            .catch(error => {
                if (error.status) {
                    $('.search-results').append(`
                <h1 class="ooups">Erreur ${error.status}</h1>
                `);
                }
            })
    }

    //Function to display all the results
    function displayResults(songs) {
        $.each(songs, function (index, song) {
            //If not already added to your fav
            if (!isAlreadyAdded(song, favorites)) {
                $('.search-results').append(
                    `
                <div class="result-ctn">
                    <div class="img-add add-song-${song.id}">
                        <img src="${song.album.cover}" alt="">
                        <input type="submit" value="Ajouter aux Favoris" id="add-${song.id}" class="input-add">
                    </div>
                    <div class="song-infos">
                        <h1>${song.title}</h1>
                        <h2>${song.artist.name} / ${song.album.title}</h2>
                        <audio controls src="${song.preview}"></audio>
                    </div>
                </div>
                `);

                //Add fav song selected
                $(`.add-song-${song.id} #add-${song.id}`).click(function (event) {
                    event.preventDefault();
                    if (!isAlreadyAdded(song, favorites)) {
                        addFavorite(song);
                    }
                });
            } else {
                //If already added
                $('.search-results').append(
                    `
                <div class="result-ctn">
                    <div class="img-add add-song-${song.id}">
                        <img src="${song.album.cover}" alt="">
                        <input type="submit" value="Retirer de mes Favoris" id="add-${song.id}" class="input-add btn-remove">
                    </div>
                    <div class="song-infos">
                        <h1>${song.title}</h1>
                        <h2>${song.artist.name} / ${song.album.title}</h2>
                        <audio controls src="${song.preview}"></audio>
                    </div>
                </div>
                `);
                //Deletion of the fav song
                $(`.add-song-${song.id} #add-${song.id}`).click(function (event) {
                    event.preventDefault();
                    //Index of the song to delete
                    let favIndex = getIndex(song, favorites);
                    //Deletion
                    deletefavorite(favIndex, song);
                });
            }
        });
    }

    //Function to get more results
    function getMoreResults(next) {
        $.ajax({
            url: next,
            dataType: 'jsonp',
        })
            .then(obj => {
                //Get data
                const songs = obj.data;
                const nextSongs = obj.next;
                //If there is no  more results
                if (songs === undefined || songs.length <= 0) {
                    $('.search-results').append(`
                <h1 class="ooups">Ooups, on dirait qu'il n'y a pas plus de résultats pour "${lastRequestData.title}" ...</h1>
                `);
                } else {
                    displayResults(songs);
                    $('.more-results').append(`<input type="submit" value="Voir plus" id="show-more">`);
                    $("#show-more").click(function (event) {
                        event.preventDefault();
                        $(this).remove();
                        getMoreResults(nextSongs);
                    })
                }
            })
            //Errors
            .catch(error => {
                if (error.status) {
                    $('.search-results').append(`
                <h1 class="ooups">Erreur ${error.status}</h1>
                `);
                }
            })
    }

    //Put the song in your favorites
    function addFavorite(song) {
        favorites.push(song);
        localStorage.setItem(LOCALSTORAGE_ID, JSON.stringify(favorites));
        $(`.add-song-${song.id} input`).remove();
        $(`.add-song-${song.id}`).append(`
        <input type="submit" value="Retirer des Favoris" id="add-${song.id}" class="input-add btn-remove">
        `);
        $(`.add-song-${song.id} #add-${song.id}`).click(function (event) {
            event.preventDefault();
            let favIndex = getIndex(song)
            deletefavorite(favIndex, song);
        });
    }

    //Delete the specific fav song 
    function deletefavorite(index, song) {
        favorites.splice(index, 1);
        localStorage.setItem(LOCALSTORAGE_ID, JSON.stringify(favorites));
        onChangeDelete(song, index);
    }

    //Changing of the button when you need to delete one of your fav songs
    function onChangeDelete(song, index) {
        $(`.add-song-${song.id} input`).remove();
        $(`.add-song-${song.id}`).append(`
        <input type="submit" value="Ajouter aux Favoris" id="new-${song.id}" class="input-add btn-add">
        `);
        $(`#new-${song.id}`).click(function (event) {
            event.preventDefault();
            addFavorite(song);
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
                        <input type="submit" value="Autre titre aléatoire" id="random-${randomSong.id}">
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
                event.preventDefault();
                randomFavoriteSong(favorites);
            });
        } else {
            //If there is no fav song
            $('.random-favorite').append(
                `<h1 class="add-one">Enregistrez votre premier coup de coeur pour écouter un titre aléatoire !</h1>`);
        }
    }

    //Return if the song is already added
    function isAlreadyAdded(song, favorites) {
        for (let i = 0; i < favorites.length; i++) {
            if (favorites[i].id === song.id) {
                return true;
            }
        }
        return false
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