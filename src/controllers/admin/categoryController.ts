import { apiReponse, apiReponseGeneralError } from "@/utils/apiReponse";
import { generateImageSlug } from "@/utils/strings";
import { Request, Response } from "express";
import formidable from "formidable";
import cloudinary from "@/utils/cloudConfig";
import Category from "@/models/CategoryModel";

export default class categoryController {
  static category_add = async (req: Request, res: Response) => {
    try {
      const form = formidable({});
      form.parse(req, async (err, fields, files) => {
        if (err) {
          apiReponse(res, 404, { error: "Error handling the incoming data." });
        } else {
          const name = fields.name?.[0];
          const image = files.image?.[0];
          const slug = generateImageSlug(name!); // TODO: is it ideal?

          // Upload an image
          cloudinary.uploader
            .upload(image!.filepath, {
              folder: "Categories",
            })
            .then(async (uploadResult) => {
              // Create entry in database
              const newCategory = await Category.create({
                name,
                image: uploadResult.url,
                slug,
              });

              return apiReponse(res, 201, {
                category: newCategory,
                message: "New category created successfully.",
              });
            })
            .catch((error) => {
              return apiReponseGeneralError(res, error);
            });
        }
      });
    } catch (e) {
      return apiReponseGeneralError(res, e as Error);
    }
  };
}
