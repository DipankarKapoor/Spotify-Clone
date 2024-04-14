let currentSong = new Audio();
let songs;

async function getSongs() {
    let a = await fetch("./songs/");
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let as = div.getElementsByTagName("a");

    let songs = []
    for (let i = 0; i < as.length; i++) {
        if (as[i].href.endsWith(".mp3")) {
            songs.push(as[i].href.split("/songs/")[1]);
        }
    }

    return songs;
}

function formatTime(seconds) {
    if (isNaN(seconds) || seconds < 0) return "00:00";
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
    const formattedSeconds = remainingSeconds < 10 ? `0${remainingSeconds}` : remainingSeconds;
    return `${formattedMinutes}:${formattedSeconds}`;
}


const playMusic = (track, pause = false) => {
    let songName = track.replaceAll(" ", "-")

    currentSong.src = "./songs/" + songName;
    if (!pause) {
        currentSong.play();
        document.getElementById("play").src = "./icons/pause.svg"
    }
    document.querySelector(".songinfo").innerHTML = track;
    document.querySelector(".songtime").innerHTML = "0:00 / 0:00";
}


async function main() {
    //get list of songs by calling getSongs function
    songs = await getSongs();
    //default load and play first song in player
    playMusic(songs[0].replaceAll("-", " "), true);

    //show all songs in playlist
    let songUL = document.querySelector(".songList").getElementsByTagName("ul")[0];
    for (const x of songs) {
        songUL.innerHTML = songUL.innerHTML + `<li> <img class="invert" src="./icons/music.svg" alt="">
    <div class="info">
      <div> ${x.replaceAll("-", " ")} </div>
      <div>Song Artist</div>
    </div>

    <div class="playnow">
    <span>Play Now </span>
    <img class="invert" src="./icons/play-button-list.svg" alt="play button">
    </div> </li>` ;
    }

    //Attach event listener to each song
    let songArray = document.querySelector(".songList").getElementsByTagName("li");
    Array.from(songArray).forEach(e => {
        e.addEventListener("click", element => {
            playMusic(e.getElementsByTagName("div")[1].innerHTML.trim());
        })
    })

    //attach event listener to play, prev and next buttons
    document.getElementById("play").addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play();
            document.getElementById("play").src = "./icons/pause.svg"
        }
        else {
            currentSong.pause();
            document.getElementById("play").src = "./icons/play.svg"
        }
    })

    //listen for update timeupdate event 
    currentSong.addEventListener("timeupdate", () => {
        document.querySelector(".songtime").innerHTML = `${formatTime(currentSong.currentTime)}
        / ${formatTime(currentSong.duration)}`;
        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";
    })

    //add event listener to seekbar
    document.querySelector(".seekbar").addEventListener("click", e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%";
        currentSong.currentTime = (currentSong.duration * percent) / 100;
    })

    //add event listener to previous button
    document.getElementById("previous").addEventListener("click", () => {
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
        if (index - 1 >= 0) {
            playMusic(songs[index - 1].replaceAll("-", " "));
        }
    })

    //add event listener to next button
    document.querySelector("#next").addEventListener("click", () => {
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
        if (index + 1 < songs.length) {
            playMusic(songs[index + 1].replaceAll("-", " "));
        }
    })

    //add event listener to hamburger button
    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0%";
    })

    //add event listener to close button
    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-120%";
    })

    //add event listener to volume slider
    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => {
        currentSong.volume = (e.target.value) / 100;
    });
}

main();


