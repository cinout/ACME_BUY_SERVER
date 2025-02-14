import { FileUpload } from "graphql-upload/processRequest.mjs";
import cloudinary from "./cloudConfig";
import { randomDefaultImage } from "./imageSamples";

export async function uploadImage(
  image: { name: string; file: string | { file: FileUpload } },
  folder: string
) {
  if (typeof image.file === "string") {
    return { imageUrl: image.file, imageName: image.name };
  } else {
    const { createReadStream } = image.file.file;
    const stream = createReadStream();
    return { imageUrl: randomDefaultImage(), imageName: image.name };

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
  images: { id: string; file: string | { file: FileUpload }; name: string }[],
  folder: string
): Promise<{ id: string; file: string; name: string }[]> {
  const uploadPromises = images.map((image) => {
    if (typeof image.file === "string") {
      return image;
    } else {
      const { createReadStream } = image.file.file;
      const stream = createReadStream();

      return new Promise((resolve, reject) => {
        resolve({ id: image.id, file: randomDefaultImage(), name: image.name });

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
  }) as { id: string; file: string; name: string }[];

  return Promise.all(uploadPromises);
}
