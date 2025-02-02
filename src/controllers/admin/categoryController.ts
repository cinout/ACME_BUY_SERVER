import { apiReponse } from "@/utils/apiReponse";
import { generateImageSlug } from "@/utils/strings";
import { Request, Response } from "express";
import formidable, { errors as formidableErrors } from "formidable";

export default class categoryController {
  static category_add = async (req: Request, res: Response) => {
    const form = formidable({});
    form.parse(req, (err, fields, files) => {
      console.log(fields);
      console.log(files);
      if (err) {
        apiReponse(res, 404, { error: "Error handling the incoming data." });
      } else {
        const name = fields.name?.[0];
        const image = files.image?.[0];
        const slug = generateImageSlug(name!);
        console.log(name);
        console.log(image);
      }
    });
  };
}
