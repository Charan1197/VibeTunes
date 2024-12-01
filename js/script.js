console.log("Let's get started")

let currentSong = new Audio()
let songs;
let currFolder;

function convertSeconds(seconds) {
    // Ensure the seconds are a number and round it to the nearest whole number
    seconds = Math.round(Number(seconds));

    // Calculate the minutes and seconds
    let minutes = Math.floor(seconds / 60);
    let remainingSeconds = seconds % 60;

    // Add leading zeros if necessary
    let formattedMinutes = minutes < 10 ? '0' + minutes : minutes;
    let formattedSeconds = remainingSeconds < 10 ? '0' + remainingSeconds : remainingSeconds;

    // Return the result in mm:ss format
    return formattedMinutes + ':' + formattedSeconds;
}

async function getSongs(folder) {
    currFolder = folder
    let a = await fetch(`/${folder}/`)
    let response = await a.text()
    let div = document.createElement('div')
    div.innerHTML = response
    let as = div.getElementsByTagName('a')

    songs = []
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith('.mp3')) {
            // songs.push(element.href.split("/songs/")[1])
            const songTitle = decodeURI(element.href.split(`${folder.replaceAll(" ", "%20")}`)[1]).slice(1, -4)
            // console.log(songTitle)
            // console.log(element.href.split(`${folder.replaceAll(" ", "%20")}`))
            songs.push(songTitle)

        }
    }

    let songUL = document.querySelector(".songList").getElementsByTagName("ul")[0]
    songUL.innerHTML = ""
    for (let index = 0; index < songs.length; index++) {
        const song = songs[index];
        let a = await fetch(`/${folder}/info.json`)
        let response = await a.json()
        songUL.innerHTML = songUL.innerHTML + `<li>
            <img class="invert icon-size" src="icons/music.svg" alt="" style="padding-right: 5px;">
                <div class="info">
                    <div>${song}</div>
                    <div>${response.artist}</div>
                </div>
                <div class="playnow">
                    <span>Play Now</span>
                    <img class="invert icon-size" src="icons/play.svg" alt="">
                </div></li>`;
        // songUL.innerHTML = songUL.innerHTML + `<li> ${song.replaceAll("%20", " ")} </li>`;
    }

    //Attach an eventListener to each song
    Array.from(document.querySelector(".songList").getElementsByTagName('li')).forEach(e => {
        e.addEventListener("click", element => {
            playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim())

            if (window.innerWidth <= 1200) {
                // Show the left bar (mobile view) when playlist is clicked
                let leftBar = document.querySelector(".left");
                leftBar.style.left = "-150%"; // Slide-in animation
            }
        })
    })

}

const playMusic = (track, pause = false) => {
    const songUrl = `/${currFolder}/${track}.mp3`
    currentSong.src = songUrl
    if (!pause) {
        currentSong.play()
        play.src = "icons/pause.svg"
    }
    document.querySelector(".songinfo").innerHTML = track
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00"
}



async function displayAlbums() {
    let a = await fetch(`/songs/`)
    let response = await a.text()
    let div = document.createElement('div')
    div.innerHTML = response
    let anchors = div.getElementsByTagName("a")
    let array = Array.from(anchors)
    for (let index = 0; index < array.length; index++) {
        const e = array[index];

        if (e.href.includes("/songs/")) {
            let folder = e.title || e.dataset.folder || e.innerText
            if (!folder) {
                console.error("Folder name is missing");
                continue;  // Skip if folder is empty
            }
            //get the meta data of the folder
            let a = await fetch(`/songs/${folder}/info.json`)
            let response = await a.json()
            console.log(response)
            let cardContainer = document.querySelector(".cardContainer")
            cardContainer.innerHTML = cardContainer.innerHTML + `<div data-folder="${folder}" class="card ">
                        <div class="play">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="35" height="35">
                                <!-- Background Circle (Green) -->
                                <circle cx="50" cy="50" r="50" fill="#1fdf64" />
                                <!-- Black SVG Icon (Adjusted for Circle) -->
                                <g transform="translate(26, 26) scale(2)">
                                    <path
                                        d="M18.8906 12.846C18.5371 14.189 16.8667 15.138 13.5257 17.0361C10.296 18.8709 8.6812 19.7884 7.37983 19.4196C6.8418 19.2671 6.35159 18.9776 5.95624 18.5787C5 17.6139 5 15.7426 5 12C5 8.2574 5 6.3861 5.95624 5.42132C6.35159 5.02245 6.8418 4.73288 7.37983 4.58042C8.6812 4.21165 10.296 5.12907 13.5257 6.96393C16.8667 8.86197 18.5371 9.811 18.8906 11.154C19.0365 11.7084 19.0365 12.2916 18.8906 12.846Z"
                                        fill="black" stroke="black" stroke-width="1.5" stroke-linejoin="round" />
                                </g>
                            </svg>
                        </div>
                        <img src="/songs/${folder}/cover.jpg" alt="">
                        <h2>${response.title}</h2>
                        <p style="font-size: 13px;">${response.description}</p>
                    </div>`
        }
    }


    //load the playlist whenever card is clicked
    Array.from(document.getElementsByClassName("card")).forEach(e => {
        e.addEventListener("click", async item => {
            console.log(item, item.currentTarget.dataset)
            await getSongs(`songs/${item.currentTarget.dataset.folder}`)
            playMusic(songs[0])

            if (window.innerWidth <= 1200) {
                // Show the left bar (mobile view) when playlist is clicked
                let leftBar = document.querySelector(".left");
                leftBar.style.left = "0"; // Slide-in animation
            }

        })
    })
}


async function main() {
    // Get the list of all the songs
    await getSongs("songs/Arijit Singh songs");
    playMusic(songs[0], true);

    // Display all the albums on the page
    displayAlbums();

    // Attach an eventListener to play, next, and previous
    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play();
            play.src = "icons/pause.svg";
        } else {
            currentSong.pause();
            play.src = "icons/play.svg";
        }
    });

    // Listen for time update event
    currentSong.addEventListener("timeupdate", () => {
        document.querySelector(".songtime").innerHTML = `${convertSeconds(currentSong.currentTime)} / ${convertSeconds(currentSong.duration)}`;
        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";
    });

    // Listen for the ended event to play the next song automatically
    currentSong.addEventListener("ended", () => {
        let currentIndex = songs.indexOf(decodeURI(currentSong.src.split("/").slice(-1)[0]).replace(".mp3", ""));
        let nextIndex = (currentIndex + 1) % songs.length; // Loop back to the first song if at the end
        playMusic(songs[nextIndex]);
    });

    // Add an event listener to the seekbar
    document.querySelector(".seekbar").addEventListener("click", (e) => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%";
        currentSong.currentTime = (currentSong.duration * percent) / 100;
    });

    // Add an event listener for the hamburger menu
    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0";
    });

    // Add an event listener for the close button
    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-150%";
    });

    // Add an event listener to previous and next buttons
    previous.addEventListener("click", () => {
        let cs = decodeURI(currentSong.src.split("/").slice(-1)[0]).replace(".mp3", "");
        let index = songs.indexOf(cs);

        if ((index - 1) >= 0) {
            playMusic(songs[index - 1]);
        }
    });

    next.addEventListener("click", () => {
        let cs = decodeURI(currentSong.src.split("/").slice(-1)[0]).replace(".mp3", "");
        let index = songs.indexOf(cs);

        if ((index + 1) < songs.length) {
            playMusic(songs[index + 1]);
        }
    });

    document.querySelector(".volume>img").addEventListener("click", (e) => {
        if (e.target.src.includes("icons/volume.svg")) {
            e.target.src = e.target.src.replace("icons/volume.svg", "icons/mute.svg");
            currentSong.volume = 0;
            document.querySelector("#rng").value = "0";
        } else if (e.target.src.includes("icons/lowVolume.svg")) {
            e.target.src = e.target.src.replace("icons/lowVolume.svg", "icons/mute.svg");
            currentSong.volume = 0;
            document.querySelector("#rng").value = "0";
        } else {
            e.target.src = e.target.src.replace("icons/mute.svg", "icons/volume.svg");
            currentSong.volume = 0.5;
            document.querySelector("#rng").value = "50";
        }
    });

    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => {
        currentSong.volume = parseInt(e.target.value) / 100;
        if (e.target.value == 0) {
            document.querySelector(".volume>img").src = "icons/mute.svg";
        } else if (e.target.value < 25) {
            document.querySelector(".volume>img").src = "icons/lowVolume.svg";
        } else {
            document.querySelector(".volume>img").src = "icons/volume.svg";
        }
    });

    if ('caches' in window) {
        caches.keys().then(function (names) {
            for (let name of names) caches.delete(name);
        });
    }
}
main()