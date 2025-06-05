import React from 'react';
import airplaneLoading from './Airplane-Loading.gif';
import './Loading.css';

const Loading = ({ isButton }) => {
  if (isButton) {
    return <span className="button-loading"></span>;
  }
  
  return (
    <div className="loading-container">
      <img src={airplaneLoading} alt="Loading..." className="airplane-loading" />
    </div>
  );
};

export default Loading;
