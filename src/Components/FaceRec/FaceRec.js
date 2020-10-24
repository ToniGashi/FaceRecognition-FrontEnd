import React from 'react';
import './FaceRec.css';

const FaceRecognition = ({url, box}) => {
    return (
      <div className='center ma'>
        <div className='pa4 absolute'>
            <img id='inputImage' src={url} alt='' width='500px' height='auto' />
            <div className='bounding-box' style={{top:box.topRow, right:box.rightCol, bottom:box.bottomRow, left:box.leftCol}}></div>
        </div>
      </div>
    );
}

export default FaceRecognition;