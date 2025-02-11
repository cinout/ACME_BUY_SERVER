import cloudinary from "./cloudConfig";
import { image_url_2, image_url_4 } from "./removeLater";

export async function uploadImage(
  image: { file: any; name: string },
  folder: string
) {
  if (typeof image.file === "string") {
    return { imageUrl: image.file, imageName: image.name };
  } else {
    const { createReadStream } = image.file.file;
    const stream = createReadStream();
    return { imageUrl: image_url_4, imageName: image.name };

    // TODO: remove comment
    // const uploadResult = await new Promise((resolve, reject) => {
    //   const uploadStream = cloudinary.uploader.upload_stream(
    //     { folder }, // Optional: specify a folder in your Cloudinary account
    //     (error, result) => {
    //       if (result) {
    //         resolve({ imageUrl: result.url, imageName: filename });
    //       } else {
    //         reject(error);
    //       }
    //     }
    //   );
    //   stream.pipe(uploadStream);
    // });
    // return uploadResult
  }
}

export async function uploadImages(
  images: { id: string; file: any; name: string }[],
  folder: string
) {
  const uploadPromises = images.map((image) => {
    if (typeof image.file === "string") {
      return image;
    } else {
      const { createReadStream } = image.file.file;
      const stream = createReadStream();

      return new Promise((resolve, reject) => {
        resolve({ id: image.id, file: image_url_2, name: image.name });

        // TODO: remove comment
        // const uploadStream = cloudinary.uploader.upload_stream(
        //   { folder }, // Optional: specify a folder in your Cloudinary account
        //   (error, result) => {
        //     if (result) {
        //       resolve({ id: image.id, file: result.url, name: image.name });
        //     } else {
        //       reject(error);
        //     }
        //   }
        // );
        // stream.pipe(uploadStream);
      });
    }
  });

  return Promise.all(uploadPromises);
}
