export const fileFilter = (
  req: Express.Request,
  file: Express.Multer.File,
  callback: (error: Error | null, acceptFile: boolean) => void,
) => {
  // console.log({ file });
  // esto quiere decir que no estamos recibiendo un archivo porque no viene
  if (!file) return callback(new Error('File is empty'), false);

  const fileExtension = file.mimetype.split('/')[1];
  // console.log({ fileExtension });
  const validExtensions = ['jpg', 'jpeg', 'png', 'gif'];

  if (!validExtensions.includes(fileExtension)) {
    //manejamos el error desde nestjs y no desde el interceptor
    return callback(null, false);
  }
  //eto significa que no sucedió ningún error
  callback(null, true);
};
