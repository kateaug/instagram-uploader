import React, { useState } from 'react';
import './ImageUpload.css';
import { Button } from '@material-ui/core';
import firebase from 'firebase';
import { storage, db } from '../firebase';

function ImageUpload ({username}) {
    const [caption, setCaption] = useState('');
    const [image, setImage] = useState(null);
    const [progress, setProgress] = useState(0);
    const [disabled, setDisabled] = useState(true);

    const handleChange = (e) => {
        if (e.target.files[0]) {
            setImage(e.target.files[0]);
            setDisabled(false);
        }
    };

    const handleUpload = () => {
        const uploadTask = storage.ref(`images/${image.name}`).put(image);

        uploadTask.on(
            'state_changed',
            (snapshot) => {
                // progress
                const progress = Math.round(
                    (snapshot.bytesTransferred / snapshot.totalBytes) * 100
                );
                setProgress(progress);
              
            },
            (error) => {
                // error
                console.log(console.error);
                alert(error.message);
            },
            () => {
                // complete task
                storage
                 .ref('images')
                 .child(image.name)
                 .getDownloadURL()
                 .then(url => {
                     // post image into db
                     db.collection('posts').add({
                         timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                         caption: caption,
                         imageUrl: url,
                         username: username
                     });

                    setProgress(0);
                    setCaption('');
                    setImage(null);
                    setDisabled(true);
                 })
            }
        );

    };

    return (
        <div className="imageUpload">
            <div className="imageUpload__container">
                <progress 
                className="imageUpload__progress" 
                value={progress} max="100"
                />
                <input 
                type="text" 
                value={caption} 
                onChange={ event => setCaption(event.target.value)}
                placeholder="Enter a caption ..."
                />
                <input type="file" onChange={handleChange} />
                <Button disabled={disabled}
                className="imageUpload__button"
                onClick={handleUpload}>
                    Upload
                </Button>
            </div>
        </div>
    )
};

export default ImageUpload;