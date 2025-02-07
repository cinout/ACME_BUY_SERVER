import cloudinary from "./cloudConfig";

export async function uploadImage(image: any, folder: string) {
  const { createReadStream, mimetype, filename } = image.file;
  const stream = createReadStream();

  const uploadResult = null;
  // TODO: remove comment
  // const uploadResult = await new Promise((resolve, reject) => {
  //   const uploadStream = cloudinary.uploader.upload_stream(
  //     { folder }, // Optional: specify a folder in your Cloudinary account
  //     (error, result) => {
  //       if (result) {
  //         resolve(result);
  //       } else {
  //         reject(error);
  //       }
  //     }
  //   );
  //   stream.pipe(uploadStream);
  // });

  return { uploadResult, mimetype };
}
