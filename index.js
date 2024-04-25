let currentSong = new Audio(); 
let songs;
let currFolder;

async function getSongs(folder) {
    currFolder = folder;
    let a = await fetch(`/${folder}/`);
    console.log(a);
    let response = await a.text(); 

    let div = document.createElement("div");   //creates new element of type 'div
    div.innerHTML = response;
    let as = div.getElementsByTagName("a");  //get all the elements with tag name 'td'


    songs = []
    for (let i = 0; i < as.length; i++) {
        if (as[i].href.endsWith(".mp3")) {
            songs.push(as[i].href.split(`/${folder}/`)[1]); 
        }
    }

    //show all songs in playlist
    let songUL = document.querySelector(".songList").getElementsByTagName("ul")[0]; //returns an array of elements
    songUL.innerHTML = ""; //reset the left song pane 
    for (const x of songs) {
        songUL.innerHTML = songUL.innerHTML + `<li> <img class="invert" src="./icons/music.svg" alt="">
    <div class="info">
      <div> ${x.replaceAll("-", " ")} </div>
      <div>Song Artist</div>
    </div>

    <div class="playnow">
    <span>Play Now </span>
    <img class="invert" src="./icons/play-button-list.svg" alt="play button">
    </div> </li>` ;//adds each link to unordered list
    }

    //Attach event listener to each song
    let songArray = document.querySelector(".songList").getElementsByTagName("li");
    Array.from(songArray).forEach(e => {
        e.addEventListener("click", element => {
            playMusic(e.getElementsByTagName("div")[1].innerHTML.trim());
        })
    })

    return songs;
}

async function displayAlbums() {
    let a = await fetch("/songs/"); 
    let response = await a.text(); 
    let div = document.createElement("div"); 
    div.innerHTML = response;
    let anchors = div.getElementsByTagName("a");
    let array = Array.from(anchors);
    for (let index = 0; index < array.length; index++) {
        const e = array[index];

        if (e.href.includes("/songs")) {
            let folder = e.href.split("/").slice(-2)[0];
            //get metadata of the folder
            let a = await fetch(`/songs/${folder}/info.json`);
            let response = await a.json();
            document.querySelector(".cardContainer").innerHTML +=

                `<div data-folder="${folder}" class="card">
            <div class="play">
              <svg height="48px" version="1.1" viewBox="0 0 48 48" width="48px" xmlns="http://www.w3.org/2000/svg"
                xmlns:xlink="http://www.w3.org/1999/xlink">
                <circle cx="24" cy="24" r="22.5" fill="#1DB954"></circle>
                <polygon points="18,14.4 34.8,24 18,33.6" fill="black"></polygon>
              </svg>
              
            </div>
            <img src="/songs/${folder}/cover.jpg" alt="" />
            <h2>${response.title}</h2>
            <p>
              ${response.description}
            </p>
          </div>`
        }
    }

    //load a playlist whenver a card is clicked
    Array.from(document.getElementsByClassName("card")).forEach(e => {
        e.addEventListener("click", async (item) => {  
            songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`);
            playMusic(songs[0].replaceAll("-", " "), true);
        })
    })

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

    currentSong.src = `./${currFolder}/` + songName;
    if (!pause) {
        currentSong.play();
        document.getElementById("play").src = "./icons/pause.svg"
    }
    document.querySelector(".songinfo").innerHTML = track;
    document.querySelector(".songtime").innerHTML = "0:00 / 0:00";
}


async function main() {
    await getSongs("songs/Angry_(mood)"); //calling getSongs function and load ncs album by default
    playMusic(songs[0].replaceAll("-", " "), true); //default load and play first song in player

    //display all albums on the page
    displayAlbums();

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
        //update current time on click
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
        //if slider is clicked when vol was muted, the mute icon changes to volume icon
        if(document.querySelector(".volume>img").src.includes("mute.svg")){
            document.querySelector(".volume>img").src = "./icons/volume.svg";
        }
    });

    //load a playlist whenver a card is clicked
    Array.from(document.getElementsByClassName("card")).forEach(e => {
        e.addEventListener("click", async (item) => {
            songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`);
        })
    })

    //add event listener to mute the track
    document.querySelector(".volume>img").addEventListener("click", (e) => {
        if (e.target.src.includes("volume.svg")) {
            e.target.src = e.target.src.replace("volume.svg", "mute.svg");
            currentSong.volume = 0;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 0;
        }
        else {
            e.target.src = e.target.src.replace("mute.svg", "volume.svg");
            currentSong.volume = 0.1;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 10;
        }
    })
}

main();


