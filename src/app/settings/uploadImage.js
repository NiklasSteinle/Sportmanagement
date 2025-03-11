import { v2 as cloudinary } from "cloudinary";

// Configuration
cloudinary.config({
  cloud_name: "dpt9i5eaj",
  api_key: "778857944269393",
  api_secret: "oj0VAA06B4xXSMupu4AwTE72fOU", // Click 'View API Keys' above to copy your API secret
});

// Upload an image
export async function getServerSideProps(uid, image) {
  await cloudinary.uploader
    .upload(image, {
      public_id: uid,
      invalidate: true,
      overwrite: true,
    })
    .catch((error) => {
      
    });

  
}
