import musicInfo from "@/utils/musicInfo.json";

const length = musicInfo.length;
console.log("total length:", length);

const newValues = musicInfo.map((a) => a.artist + " " + a.title);
const seen = new Set();
const duplicates = new Set();
for (const item of newValues) {
  if (seen.has(item)) {
    duplicates.add(item);
  } else {
    seen.add(item);
  }
}

console.log(Array.from(duplicates));
