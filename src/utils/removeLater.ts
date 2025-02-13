// TODO: remoe this file later.

import { selectRandomItemFromArray } from "./array";

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
