import React, { useState, useEffect } from 'react';
import './App.css';
import Post from './components/Post';
import ImageUpload from './components/ImageUpload';
import { db, auth } from './firebase';
import { makeStyles } from '@material-ui/core/styles'
import Modal from '@material-ui/core/Modal';
import { Button, Input, InputLabel } from '@material-ui/core';
import InstagramEmbed from 'react-instagram-embed';


function getModalStyle() {
  const top = 50;
  const left = 50;

  return {
    top: `${top}%`,
    left: `${left}%`,
    transform: `translate(-${top}%, -${left}%)`,
  };
}

const useStyles = makeStyles((theme) => ({
  paper: {
    position: 'absolute',
    width: 400,
    backgroundColor: theme.palette.background.paper,
    border: '2px solid #000',
    boxShadow: theme.shadows[5],
    padding: theme.spacing(2, 4, 3),
  },
}));

function App() {
  const classes = useStyles();
  const [modalStyle] = useState(getModalStyle);

  const [posts, setPosts] = useState([]);
  const [open, setOpen] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [user, setUser] = useState(null);
  const [openSignIn, setOpenSignIn] = useState(false);


  useEffect(() => {
     const unsubscribe = auth.onAuthStateChanged((authUser) => {
       if (authUser) {
         setUser(authUser);
       } else {
         setUser(null);
       }
     });

     // cleanup 
     return () => {
       unsubscribe();
     };

  }, [user, username]);

  useEffect(() => {
      db.collection('posts').orderBy('timestamp', 'desc').onSnapshot(snapshot => {
        setPosts(snapshot.docs.map(doc => ({
          post: doc.data(),
          id: doc.id
        })))
      });
  }, []);

  const signUp = (event) => {
    event.preventDefault();

    auth
     .createUserWithEmailAndPassword(email, password)
     .then((authUser) => {
       return authUser.user.updateProfile({
         displayName: username
       })
     })
     .catch(error => alert(error.message));

     setOpen(false);

  };

  const signIn = (event) => {
    event.preventDefault();

    auth
      .signInWithEmailAndPassword(email, password)
      .catch(error => alert(error.message))

      setOpenSignIn(false);
  }; 

  return (
    <div className="app">
        <Modal
            open={open}
            onClose={() => setOpen(false)}
        >
        <div style={modalStyle} className={classes.paper}>
            <form className="app__signup">
                <center>
                  <img
                    className="app__headerImage"
                    src="https://www.instagram.com/static/images/web/mobile_nav_type_logo.png/735145cfe0a4.png"
                    alt=""
                  />
                </center>

                <InputLabel className="app__modalLabel">Username:</InputLabel>
                  <Input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                <InputLabel className="app__modalLabel">Email:</InputLabel>
                  <Input
                    type="text"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />

                <InputLabel className="app__modalLabel">Password:</InputLabel>
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />  
                <Button className="app__modalButton" onClick={signUp}>Sign up</Button>  
            </form>
          </div>
        </Modal>

        <Modal
          open={openSignIn}
          onClose={() => setOpenSignIn(false)}
        >
        <div style={modalStyle} className={classes.paper}>
          <form className="app__signup">
          <center>
            <img
              className="app__headerImage"
              src="https://www.instagram.com/static/images/web/mobile_nav_type_logo.png/735145cfe0a4.png"
              alt=""
            />
          </center>

          <InputLabel className="app__modalLabel">Email:</InputLabel>
            <Input
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

          <InputLabel className="app__modalLabel">Password:</InputLabel>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
             <Button className="app__modalButton" type="submit" onClick={signIn}>Log In</Button>
          </form>

        </div>
      </Modal>

      <div className="app__header">
        <img 
          className="app__headerImage"
          src="https://www.instagram.com/static/images/web/mobile_nav_type_logo.png/735145cfe0a4.png"
          alt=""
        />
        {user ? (
          <div>
            <Button 
              className="app__headerButton" 
              onClick={() => auth.signOut()}
            >
              Log Out
            </Button>
          </div>
        ) : (
          <div className="app__loginContainer">
            <Button onClick={() => setOpen(true)}>Sign up</Button>
            <Button onClick={() => setOpenSignIn(true)}>Log In</Button>
          </div> 
      )}
      </div>

      <div className="app__posts">
          <div className="app__postsLeft">
              {posts.map(({ post, id }) => (
                <Post 
                    key={id}
                    postId={id}
                    user={user}
                    username={post.username} 
                    caption={post.caption} 
                    imageUrl={post.imageUrl}
                />
              ))}
          </div>
          
          <div className="app__postsRight">
              <InstagramEmbed
                url='https://www.instagram.com/p/CFofphFg0H8/'
                maxWidth={320}
                hideCaption={false}
                containerTagName='div'
                protocol=''
                injectScript
                onLoading={() => {}}
                onSuccess={() => {}}
                onAfterRender={() => {}}
                onFailure={() => {}}
              />
          </div>
      </div>
      
      {user?.displayName ? (
            <ImageUpload username={user.displayName} />
          ) : (
            <div className="app__loginUpload">
              <h3>Sorry, you need to login to comment or upload.</h3>
            </div>
            
       )}
       
    </div>
  );
}

export default App;
