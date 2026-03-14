import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })
dotenv.config({ path: '.env' })

async function checkCloudinary() {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET
  
  console.log(`Cloud name: ${cloudName}`)
  console.log(`Upload preset: ${uploadPreset}`)
  
  if (!cloudName || !uploadPreset) {
    console.error("Missing credentials")
    return
  }
}

checkCloudinary()
