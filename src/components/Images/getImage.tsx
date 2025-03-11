
import { getCldImageUrl } from 'next-cloudinary';



export const getImageByUserId = async (uid: string) => {
  const url = getCldImageUrl({
    width: 960,
    height: 600,
    src: uid,
    quality: 'auto',
    
     
  });
  return url;

};