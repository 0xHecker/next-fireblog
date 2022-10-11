import {
  ref,
  getDownloadURL,
  uploadBytesResumable,
} from 'firebase/storage';
import { useState } from 'react';
import { auth, storage, STATE_CHANGED } from '../lib/firebase';
import Loader from './Loader';

const ImageUploader = () => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [downloadURL, setDownloadURL] = useState(null);

  const uploadFile = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = Array.from(e.target.files)[0];
    const extension = file.type.split('/'[1]);

    const storageRef = ref(
      storage,
      `uploads/${auth.currentUser.uid}/${Date.now()}.${extension}`
    );
    setUploading(true);

    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      STATE_CHANGED,
      (snapshot) => {
        const progress = Math.round(
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100
        );
        setProgress(progress);
      },
      (error) => {
        alert(error);
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then(
          (downloadURL) => {
            setDownloadURL(downloadURL);
            setUploading(false);
          }
        );
      }
    );
  };

  return (
    <div className='box'>
      <Loader show={uploading} />
      {uploading && <h3>{progress}%</h3>}

      {!uploading && (
        <>
          <label className='btn'>
            📸 Upload Img
            <input
              type='file'
              onChange={uploadFile}
              accept='image/x-png,image/gif,image/jpeg'
            />
          </label>
        </>
      )}

      {downloadURL && (
        <code className='upload-snippet'>{`![alt](${downloadURL})`}</code>
      )}
    </div>
  );
};

export default ImageUploader;
