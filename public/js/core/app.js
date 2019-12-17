var socket = io();

$(document).ready(function () {

    function playAudio(url) {
        var a = new Audio(url);
        a.play();
    }

    let lastUsername = localStorage.getItem('username');
    if(lastUsername !== null){
        $('#username').val(lastUsername);
    }
    $('#ready').click(function () {
        let userName = $('#username').val();
        if(userName !== ""){
            socket.emit("ready", userName);
            $(this).parent().remove();
            localStorage.setItem('username', userName);
        }
        else {
            alertify.notify('Nhập tên trước đã!', 'error', 4, function(){});
        }

    });

    $('#username').keypress(function (e) {
       if(e.keyCode === 13){
           $('#ready').click();
       }
    });

    $(document).on('click', '#gogo', function () {
        socket.emit("start-game", 'Start Game!');

        })
        .on('click', '#sortCards', function () {
            socket.emit('sort-cards');
        })
        .on('click', '.cards .single-card', function () {
            $(this).toggleClass('picking');
                playAudio('./sound/picking.wav');
        })
        .on('click', '#pass', function () {
            socket.emit('pass');
        })
        .on('click', '#playCards', function () {
            let cardsData = [];
            $('.picking').map(function(e) {
                let cardId = $(this).data('id');
                cardsData.push(cardId);
            });

            if(cardsData.length > 0){
                socket.emit('play', cardsData);
            }
        });

    window.onbeforeunload = function()
    {
        return "";
    };

    (function() {
        socket.on("start-btn-bind", data => {
            if(data.status === 'success'){
                $('.start-game').removeClass('hidden');
            }
        });

        socket.on('you-come-in', data => {
            var selfPlayer = $('.bottom');
            selfPlayer.data('order', data.newOrder);
            selfPlayer.addClass('order-' + data.newOrder);
            selfPlayer.html(`<div class="player-info">
                    <strong>${data.comeInPlayer.userName}</strong>
                    <img src="image/node-ava.png"> </div>
                     <div class="cards-container">
                    </div>`);
        });

        socket.on("room-members", data => {
            let order = $('.bottom').data('order');
            var leftPlayer = $('.left');
            var rightPlayer = $('.right');
            var topPlayer = $('.top');

            leftPlayer.html("");
            rightPlayer.html("");
            topPlayer.html("");

            let rightIdentity = order + 1 > 3 ? order + 1 - 4 : order + 1;
            let topIdentity = order + 2 > 3 ? order + 2 - 4 : order + 2;
            let leftIdentity = order + 3 > 3 ? order + 3 - 4 : order + 3;

            leftPlayer.addClass('order-' + leftIdentity);
            topPlayer.addClass('order-' + topIdentity);
            rightPlayer.addClass('order-' + rightIdentity);

            data.users.map(function (e) {
                $('.order-' + e.order).html(`<div class="player-info">
                     <strong>${e.userName}</strong>
                    <img src="image/node-ava.png">
                    </div>
                    <div class="back-image-wrapper">
                    <img src="image/backof.jpg" class="back-image">
                     </div>`);
            });

        });

        socket.on("card-result", data => {
            var cardHtml = ``;
            if(data.info){
                data.info.cards.map((e,i,a) =>  {
                    cardHtml += `<div class="single-card" data-id="${e.id}">
                                <img src="./image/${e.id}.png">
                        </div>`;
                });
                $('.cards').html(cardHtml);
                $('#sortCards').removeClass('hidden');
                $('.start-game').addClass('hidden');
            }
        });

        socket.on('card-sorted', data => {
            let cardHtml = ``;
            if(data.info){
                data.info.cards.map((e,i,a) =>  {
                    cardHtml += `<div class="single-card" data-id="${e.id}">
                                <img src="./image/${e.id}.png">
                                 </div>`;
                });
                $('.cards').html(cardHtml);
                playAudio('./sound/picking.wav');
            }
        });

        socket.on("your-first-turn-in-first-round", data => {
            $('.action-container').removeClass('hidden');
        });

        socket.on('your-turn', data => {
            $('.action-container').removeClass('hidden');
        });

        socket.on('turn-passed-as-pass', orderData => {
            $('.action-container').addClass('hidden');
        });

        socket.on('turn-passed-as-pass-global', orderData => {
            $('.order-' + orderData).addClass('opacity-03');
        });
       socket.on('new-round', data => {
           $('.single-player').removeClass('opacity-03');
       });

        socket.on('turn-passed-as-play', cardsData => {
            $('.action-container').addClass('hidden');
            let cardsPlayed = ``;

            cardsData.map(id => {
                cardsPlayed += `<img class="card-played" src="./image/${id}.png">`;
            });
            $('.last-combo-container').removeClass('last-combo-highlight');
            $('.played-area-container').append(`<div class="last-combo-container last-combo-highlight">${cardsPlayed}`);
            playAudio('./sound/hit.wav');

        });

        socket.on("remaining-cards", data => {
            let cardHtml = ``;
            if(data.info){
                data.info.cards.map((e,i,a) =>  {
                    cardHtml += `<div class="single-card" data-id="${e.id}">
                                <img src="./image/${e.id}.png">
                                 </div>`;
                });
                $('.cards').html(cardHtml);
            }
        });

        socket.on('next-player-turn', order => {
            $('.single-player').removeClass('turn-active');
            $('.order-'+ order).addClass('turn-active');
        });

        socket.on('you-win', player => {
            alertify.notify(player.userName + 'đã hết bài!', 'error', 4, function(){});
        });

        socket.on('game-end', data => {
            $('.cards').html('');
            $('.played-area-container').html('');
            $('.action-container').addClass('hidden');
            $('.single-player').removeClass('opacity-03');
        });

        socket.on('not-own-cards', data => {
            alertify.notify('Không hack được đâu', 'error', 4, function(){});

        });

        socket.on('kill-two', data => {
            playAudio('./sound/killtwo.mp3');
        });

        socket.on('not-your-turn', data => {
            alertify.notify('Chưa đến lượt, bình tĩnh...', 'error', 4, function(){});
        });

        socket.on("your-turn-can-not-pass", data => {
            alertify.notify('Đang cầm vòng, sao bỏ được?', 'error', 4, function(){});
        });

        socket.on("you-need-to-play-smallest-card", data => {
            alertify.notify('Ván đầu, đánh con nhỏ nhất giùm', 'error', 4, function(){});
        });

        socket.on("invalid-combo", data => {
            alertify.notify('Không được phép đánh như vậy...', 'error', 4, function(){});
        });

        socket.on("the-game-is-busy", data => {
            alert('Đợi đi, mọi người đang trong game rồi.');
        });

    })();

});

//
// (function() {
//     fetch("/play")
//         .then(data => {
//             return data.json(); //PROMISE
//         })
//         .then(json => {
//             [json].map(data => {
//             console.log(data.user);
//             });
//         });
// })();

