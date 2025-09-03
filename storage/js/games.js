// open in new tab setting
document.addEventListener('DOMContentLoaded', () => {
    function cookie(name, value = null, days = null) {
        if (value !== null) {
            let expires = "";
            if (days) {
                let date = new Date();
                date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
                expires = "; expires=" + date.toUTCString();
            }
            document.cookie = name + "=" + (value || "") + expires + "; path=/";
        } else {
            let cookieArr = document.cookie.split(';');
            for (let i = 0; i < cookieArr.length; i++) {
                let cookiePair = cookieArr[i].split('=');
                if (name === cookiePair[0].trim()) {
                    return decodeURIComponent(cookiePair[1]);
                }
            }
            return null;
        }
    }

    let openBlankCookie = cookie('open-blank');
    if (openBlankCookie === null) {
        openBlankCookie = 'true';
        cookie('open-blank', openBlankCookie, 365);
    }

    if (openBlankCookie === 'false') {
        let anchorTags = document.querySelectorAll('a[target="_blank"]');
        
        anchorTags.forEach(anchor => {
            anchor.removeAttribute('target');
        });
    }
});

// search bar
function filterGames() {
    const searchInput = document.getElementById('search').value.toLowerCase();
    const buttons = document.querySelectorAll('.button h2');

    buttons.forEach(button => {
        const gameName = button.textContent.toLowerCase();
        const buttonContainer = button.parentElement.parentElement; // anchor
        const slug = (function(href){
            if (!href) return '';
            try {
                const u = new URL(href, window.location.origin);
                const parts = u.pathname.split('/').filter(Boolean);
                if (parts[0] === 'games') return parts[1] || '';
                return parts[0] || '';
            } catch(_) {
                return href.replace(/^\//,'').split('/')[0];
            }
        })(buttonContainer.getAttribute('href'));
        let hidden = [];
        try { hidden = JSON.parse(localStorage.getItem('hiddenGames') || '[]'); } catch(_) { hidden = []; }
        const hiddenSet = new Set(hidden);

        if (hiddenSet.has(slug)) {
            buttonContainer.style.display = 'none';
            return;
        }

        if (gameName.includes(searchInput)) {
            buttonContainer.style.display = 'block'; 
        } else {
            buttonContainer.style.display = 'none';
        }
    });
}

document.getElementById('search').addEventListener('input', filterGames);

// genre filtering
const genreDropdown = document.getElementById('genreDropdown');

genreDropdown.addEventListener('change', () => {
    const selectedGenre = genreDropdown.value;
    const buttons = document.querySelectorAll('.button');
    
    buttons.forEach(button => {
        const dataGenre = button.getAttribute('data-genre');
        
        if (selectedGenre === 'all' || selectedGenre === dataGenre) {
            button.style.display = 'block';
        } else {
            button.style.display = 'none';
        }
    });
});

genreDropdown.value = 'all';

// cool typing
const text = "games";
const typingDelay = 500; 
const initialDelay = 100; 
const cursor = document.getElementById("cursor");
const h1 = document.querySelector(".typewriter");

function type() {
setTimeout(() => {
    for (let i = 0; i < text.length; i++) {
    setTimeout(() => {
        h1.textContent += text[i];
        if (i === text.length - 1) {
        cursor.style.display = "none"; 
        }
    }, i * typingDelay);
    }
}, initialDelay);
}

type();

// open in blank tab
document.addEventListener('DOMContentLoaded', function() {
    var openBlankLink = document.getElementById('openBlankLink');

    openBlankLink.addEventListener('click', function(event) {
        event.preventDefault();

        var newTab = window.open('about:blank', '_blank');

        if (newTab) {
            var newTabBody = newTab.document.body;
            newTabBody.style.padding = '0';
            newTabBody.style.margin = '0';
            newTabBody.style.border = 'hidden';

            var iframe = document.createElement('iframe');
            iframe.src = window.location.href;
            iframe.style.width = '100%';
            iframe.style.height = '100%';
            iframe.style.border = 'hidden';

            iframe.onload = function() {
                var links = iframe.contentDocument.querySelectorAll('a[target="_blank"]');
                links.forEach(function(link) {
                    link.addEventListener('click', function(event) {
                        event.preventDefault();
                        iframe.contentWindow.location.href = link.href;
                    });
                });
            };

            newTab.document.body.appendChild(iframe);
        } else {
            alert("couldn't manage to open a new tab :(");
        }
    });
}); 

// per-user hide game feature
function getHiddenGames() {
    try { return JSON.parse(localStorage.getItem('hiddenGames') || '[]'); } catch { return []; }
}

function setHiddenGames(arr) {
    localStorage.setItem('hiddenGames', JSON.stringify(arr));
}

function hrefToSlug(href) {
    if (!href) return '';
    try {
        const u = new URL(href, window.location.origin);
        const parts = u.pathname.split('/').filter(Boolean);
        if (parts[0] === 'games') return parts[1] || '';
        return parts[0] || '';
    } catch(_) {
        return href.replace(/^\//,'').split('/')[0];
    }
}

function injectHideButtonsAndApplyHidden() {
    const hiddenSet = new Set(getHiddenGames());
    const anchors = document.querySelectorAll('.button-container > a, .pinned-container > a');

    anchors.forEach(a => {
        const slug = hrefToSlug(a.getAttribute('href'));
        if (hiddenSet.has(slug)) {
            a.style.display = 'none';
        }

        const btnContainer = a.querySelector('.button');
        if (!btnContainer) return;
        if (btnContainer.querySelector('.hide-button')) return;

        const hideSpan = document.createElement('span');
        hideSpan.classList.add('hide-button');
        hideSpan.title = 'Hide this game';
        const img = document.createElement('img');
        img.src = '/images/other/cross.png';
        img.width = 25; img.height = 25; img.alt = 'hide';
        hideSpan.appendChild(img);
        hideSpan.addEventListener('click', (ev) => {
            ev.preventDefault();
            ev.stopPropagation();
            const list = getHiddenGames();
            if (!list.includes(slug)) {
                list.push(slug);
                setHiddenGames(list);
            }
            a.style.display = 'none';
        });
        btnContainer.appendChild(hideSpan);
    });
}

document.addEventListener('DOMContentLoaded', injectHideButtonsAndApplyHidden);

// favouritng games
document.addEventListener("DOMContentLoaded", function () {
    const pinButtons = document.querySelectorAll(".pin-button");
    const pinnedContainer = document.querySelector(".pinned-container");
    const pinnedHeader = document.querySelector(".pinned-header");
    const allGamesHeader = document.querySelector(".allgames-header")

    const pinnedGames = JSON.parse(localStorage.getItem("pinnedGames")) || [];

    function updatePinnedUI() {
        if (pinnedGames.length === 0) {
            pinnedContainer.style.display = "none";
            pinnedHeader.style.display = "none";
            allGamesHeader.style.display = "none";
        } else {
            pinnedContainer.style.display = "block";
            pinnedHeader.style.display = "block";
            allGamesHeader.style.display = "block"

            pinnedContainer.innerHTML = "";
            const hiddenSet = new Set(getHiddenGames());
            pinnedGames.forEach((game) => {
                const slug = hrefToSlug(game.link);
                if (hiddenSet.has(slug)) return; // skip hidden ones
                const gameLink = document.createElement("a");
                gameLink.href = game.link;
                gameLink.target = "_blank";

                const gameButton = document.createElement("div");
                gameButton.classList.add("button");
                gameButton.style.backgroundImage = `url('${game.thumbnail}')`;
                gameButton.innerHTML = `<h2>${game.name}</h2>`;

                const pinButton = document.createElement("span");
                pinButton.classList.add("pin-button");

                const img = document.createElement("img");
                img.src = "/images/other/cross.png";
                img.width = 25;
                img.height = 25;

                pinButton.appendChild(img);

                pinButton.addEventListener("click", (event) => {
                    event.preventDefault();
                    unpinGame(game.name);
                });

                gameButton.appendChild(pinButton);
                gameLink.appendChild(gameButton);
                pinnedContainer.appendChild(gameLink);
            });
        }
    }

    function pinGame(name, thumbnail, link) {
        const isAlreadyPinned = pinnedGames.some((game) => game.name === name);
        if (!isAlreadyPinned) {
            pinnedGames.push({ name, thumbnail, link });
            localStorage.setItem("pinnedGames", JSON.stringify(pinnedGames));
            updatePinnedUI();
        }
    }

    function unpinGame(name) {
        const index = pinnedGames.findIndex((game) => game.name === name);
        if (index !== -1) {
            pinnedGames.splice(index, 1);
            localStorage.setItem("pinnedGames", JSON.stringify(pinnedGames));
            updatePinnedUI();
        }
    }

    pinButtons.forEach((pinButton, index) => {
        pinButton.addEventListener("click", (event) => {
            event.preventDefault();
            const gameDiv = pinButton.closest(".button");
            const thumbnail = gameDiv.style.backgroundImage
                .replace('url("', '')
                .replace('")', '');
            const name = gameDiv.querySelector("h2").textContent;
            const link = gameDiv.parentElement.href; 
            pinGame(name, thumbnail, link);
        });
    });
    updatePinnedUI();
});

// download feature removed