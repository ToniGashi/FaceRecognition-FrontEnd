import React from 'react';
import './App.css';
import Nav from './Components/Navigation/Navigation';
import Logo from './Components/Logo/Logo';
import SignIn from './Components/SignIn/SignIn';
import Clarifai, { FACE_DETECT_MODEL } from 'clarifai';
import ImageLinkForm from './Components/ImageLinkForm/ImageLinkForm';
import Rank from './Components/Rank/Rank';
import Particles from 'react-particles-js';
import FaceRec from './Components/FaceRec/FaceRec';
import Register from './Components/Register/Register';

const app = new Clarifai.App({
  apiKey: 'a43d6c8847b5407aaeb5a6eb9ca01df0'
})

const particlesOptions = {
  particles: {
    number: {
      value: 80,
      density: {
        enable: true,
        value_area: 800
      }
    }
  }
}

const initialState = {
  input: '',
  imageURL:'',
  box: {},
  route: 'signin',
  isSignedIn: false,
  user: {
    id: '',
    name: '',
    email: '',
    entries: 0,
    joined: ''
  }
}

class App extends React.Component{
  constructor() {
    super();
    this.state = initialState;
  }

  loadUser = (data) => {
    this.setState(
      {
        user: 
        {
          id: data.id,
          name: data.name,
          email: data.email,
          entries: data.entries,
          joined: data.joined
        }
      })
  }

  calculateFaceLocation = (data) => {
    const clarifaiFace = data.outputs[0].data.regions[0].region_info.bounding_box;
    const image = document.getElementById('inputImage');
    const width = Number(image.width);
    const height = Number(image.height);
    return {
      leftCol: clarifaiFace.left_col * width,
      topRow: clarifaiFace.top_row * height,
      rightCol: width - (clarifaiFace.right_col * width),
      bottomRow: height - (clarifaiFace.bottom_row * height)
    }
  }

  displayFaceBox = (box) => {
    this.setState({box: box});
  }

  onInputChange = (event) => {
    this.setState({input:event.target.value})
  }

  onSubmit = (event) => {
    this.setState({imageURL: this.state.input});
    app.models
    .predict(
      Clarifai.FACE_DETECT_MODEL,
      this.state.input)
    .then(response => {
      if (response) {
        fetch('http://localhost:3000/image', {
          method: 'put',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({
            id: this.state.user.id
          })
        })
          .then(response => response.json())
          .then(count => {
            this.setState(Object.assign(this.state.user, { entries: count}))
          })
          .catch(console.log)
      }
      this.displayFaceBox(this.calculateFaceLocation(response))
    })
    .catch(err => console.log(err));
  }

  onRouteChange = (route) => {
    if(route==='signout'){
      this.setState(initialState)
    }
    else if(route ==='home') {
      this.setState({isSignedIn:true})
    }
    this.setState({route: route});
  }

  render (){
    return (
      <div className="App">
        <Particles className='Particles'
          params={particlesOptions}
        />
        <Nav isSignedIn={this.state.isSignedIn} onRouteChange={this.onRouteChange} />
        { 
        this.state.route==='home' 
        ?
          <div>
            <Logo />
            <Rank name={this.state.user.name} entries={this.state.user.entries}/>
            <ImageLinkForm onInputChange= {this.onInputChange} onSubmit = {this.onSubmit}/>
            <FaceRec box={this.state.box} url={this.state.imageURL}/> 
          </div>
          :
          (
          this.state.route==='signin' 
          ?  <SignIn onRouteChange={this.onRouteChange} loadUser={this.loadUser}/> 
          :  <Register onRouteChange={this.onRouteChange} loadUser={this.loadUser}/>
          )
        }
      </div>
    );
  }
}

export default App;
