import { exec } from "child_process";
import { showToast, Toast } from "@raycast/api";

async function getKaraokeState(): Promise<boolean> {
    return new Promise((resolve, reject) => {
        exec("defaults read com.aviwadhwa.SpotifyLyricsInMenubar karaoke", (error, stdout, stderr) => {
            if (error) {
                // If the key doesn't exist, assume it's false
                resolve(false);
            } else {
                resolve(stdout.trim() === "1");
            }
        });
    });
}

async function getSongDetailsState(): Promise<boolean> {
    return new Promise((resolve, reject) => {
        exec("defaults read com.aviwadhwa.SpotifyLyricsInMenubar showSongDetailsInMenubar", (error, stdout, stderr) => {
            if (error) {
                // If the key doesn't exist, assume it's false
                resolve(false);
            } else {
                resolve(stdout.trim() === "1");
            }
        });
    });
}

export default async () => {
    try {
        const currentKaraokeState = await getKaraokeState();
        const newKaraokeState = !currentKaraokeState;

        const currentSongDetailsState = await getSongDetailsState();
        const newSongDetailsState = !currentSongDetailsState;
        
        // If the user has disabled song details, we need to toggle karaoke mode twice to refresh the menubar
        const command = `defaults write com.aviwadhwa.SpotifyLyricsInMenubar showSongDetailsInMenubar -bool ${newSongDetailsState} && defaults write com.aviwadhwa.SpotifyLyricsInMenubar karaoke -bool ${newKaraokeState} && defaults write com.aviwadhwa.SpotifyLyricsInMenubar karaoke -bool ${currentKaraokeState}`;

        await new Promise((resolve, reject) => {
            exec(command, (error, stdout, stderr) => {
                if (error) {
                    showToast({
                        style: Toast.Style.Failure,
                        title: "Failed to toggle song details in menubar",
                        message: stderr || error.message,
                    });
                    reject(stderr || error.message);
                } else {
                    showToast({
                        style: Toast.Style.Success,
                        title: `Song details in menubar ${newSongDetailsState ? "enabled" : "disabled"}`,
                    });
                    resolve(stdout);
                }
            });
        });
    } catch (error) {
        showToast({
            style: Toast.Style.Failure,
            title: "Error toggling song details in menubar",
            message: error.message,
        });
    }
};