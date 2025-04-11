import { selectRandomItemFromArray } from "./array";
import fs from "fs";
import { shuffleArray } from "./array";

/**
 * Images from Cloudinary
 */
export const image_url_1 =
  "http://res.cloudinary.com/dcavpobmc/image/upload/v1738491538/Categories/yvxwwkjos4hurben2dhk.png";
export const image_url_2 =
  "http://res.cloudinary.com/dcavpobmc/image/upload/v1738888773/Categories/dtsspvzmpih64ymgxraw.png";
export const image_url_3 =
  "http://res.cloudinary.com/dcavpobmc/image/upload/v1739189986/Products/svch45r8uzlcavpjhjws.png";
export const image_url_4 =
  "http://res.cloudinary.com/dcavpobmc/image/upload/v1739189986/Products/goyrtskikfcxxbvtndtn.png";

export function randomDefaultImage() {
  return selectRandomItemFromArray([
    image_url_1,
    image_url_2,
    image_url_3,
    image_url_4,
  ]);
}

// export function randomAlbumCoverImageRaw() {
//   return selectRandomItemFromArray(album_covers_array);
// }

// export function randomAlbumCoverImageLarge() {
//   const image = randomAlbumCoverImageRaw();
//   const parts = image.split(/.(jpg|png)$/);
//   return parts[0] + "-500" + parts[1];
// }

// export function randomAlbumCoverImageSmall() {
//   const image = randomAlbumCoverImageRaw();
//   const parts = image.split(/.(jpg|png)$/);
//   return parts[0] + "-250" + parts[1];
// }

export async function getAlbumCover(times: number) {
  async function runOnce() {
    const albumData: {
      artist: string;
      title: string;
      year: number;
      tracklist: { title: string; number: string }[];
      images: string[];
    }[] = [];
    const filePath = "output.json";
    try {
      // ARTIST
      const random_number = Math.floor(Math.random() * 200000);
      const getRandomArtist = `https://musicbrainz.org/ws/2/artist?query=*&limit=1&offset=${random_number}&fmt=json`;
      const responseArtist = await fetch(getRandomArtist, {
        headers: {
          "User-Agent": "MyMusicApp/1.0",
          Accept: "application/json",
        },
      });
      const artistData = await responseArtist.json();
      if (!artistData.artists.length) {
        console.log("No artist found.");
        return null;
      }
      const { id: artistId, name: artistName } = artistData.artists[0];

      // Releases
      const getReleasesFromArtist = `https://musicbrainz.org/ws/2/release-group?artist=${artistId}&type=album&offset=1&fmt=json`;
      const responseReleases = await fetch(getReleasesFromArtist, {
        headers: {
          "User-Agent": "MyMusicApp/1.0",
          Accept: "application/json",
        },
      });
      const releaseData = await responseReleases.json();

      if (!releaseData["release-groups"].length) {
        console.log("No album found.");
        return null;
      }

      const allReleases = releaseData["release-groups"].map(
        (a: { id: string; title: string; "first-release-date": string }) => ({
          id: a.id,
          title: a.title,
          year: parseInt(a["first-release-date"].split("-")[0], 10),
        })
      ) as { id: string; title: string; year: number }[];

      const takeN = allReleases.length <= 4 ? allReleases.length : 4;
      shuffleArray(allReleases);

      // Album
      for (let i = 0; i < takeN; i++) {
        const currentRelease = allReleases[i];
        const { id: releaseId, title, year } = currentRelease;

        const getRelease = `https://coverartarchive.org/release-group/${releaseId}`;
        const responseRelease = await fetch(getRelease, {
          headers: {
            "User-Agent": "MyMusicApp/1.0",
            Accept: "application/json",
          },
        });
        const release = await responseRelease.json();

        // Images
        if (!release["images"].length) {
          console.log("No release image found.");
          continue;
        }

        const frontImages: string[] = [];
        const backImages: string[] = [];

        release.images.forEach((a: { front: boolean; image: string }) => {
          if (a.front) {
            frontImages.push(a.image);
          } else {
            backImages.push(a.image);
          }
        });

        // Tracklist

        const albumId = release.release.split("/").slice(-1)[0];
        const getAlbum = `https://musicbrainz.org/ws/2/release/${albumId}?inc=recordings`;
        const responseAlbum = await fetch(getAlbum, {
          headers: {
            "User-Agent": "MyMusicApp/1.0",
            Accept: "application/json",
          },
        });
        const album = await responseAlbum.json();
        const tracklist = album?.media?.[0]?.tracks?.map(
          (track: { title: string; number: string }) => ({
            title: track.title,
            indexDisplay: track.number,
          })
        );

        // return
        albumData.push({
          artist: artistName,
          title,
          year,
          tracklist,
          images: [...frontImages, ...backImages].slice(0, 8),
        });
      }

      if (albumData.length > 0) {
        // Check if the file exists and read its content
        let existingData = [];
        if (fs.existsSync(filePath)) {
          const fileContent = fs.readFileSync(filePath, "utf-8");
          existingData = fileContent ? JSON.parse(fileContent) : [];
        }

        // Write back to file
        fs.writeFileSync(
          filePath,
          JSON.stringify(existingData.concat(albumData), null, 2)
        );
      }
      return;
    } catch (e) {
      console.error("Error fetching album cover");
      return;
    }
  }

  for (let i = 0; i < times; i++) {
    console.log(`>>>>> running ${i}`);
    await runOnce();
  }

  console.log("===== End of Execution =====");

  // const ladyGagaArtistId = "650e7db6-b795-4eb5-a702-5ea2fc46c848";
  // // Releases
  // const getReleasesFromArtist = `https://musicbrainz.org/ws/2/release-group?artist=${ladyGagaArtistId}&type=album&offset=1&fmt=json`;

  // const responseReleases = await fetch(getReleasesFromArtist, {
  //   headers: {
  //     "User-Agent": "MyMusicApp/1.0",
  //     Accept: "application/json",
  //   },
  // });
  // const releaseData = await responseReleases.json();

  // const releaseGoupDawnOfChr = "015d4df2-5618-46f8-9460-72707383b09b";

  // const getRelease = `https://coverartarchive.org/release-group/${releaseGoupDawnOfChr}`;
  // const responseRelease = await fetch(getRelease, {
  //   headers: {
  //     "User-Agent": "MyMusicApp/1.0",
  //     Accept: "application/json",
  //   },
  // });
  // const release = await responseRelease.json();

  // const albumId = release.release.split("/").slice(-1)[0];
  // const getAlbum = `https://musicbrainz.org/ws/2/release/${albumId}?inc=recordings`;
  // const responseAlbum = await fetch(getAlbum, {
  //   headers: {
  //     "User-Agent": "MyMusicApp/1.0",
  //     Accept: "application/json",
  //   },
  // });
  // const album = await responseAlbum.json();
  // console.log(album);
}
