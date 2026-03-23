import React from 'react';
import './herobetbit.scss';

const generateStarShadows = (n) => {
  const shadows = [];
  for (let i = 0; i < n; i++) {
    const x = Math.floor(Math.random() * 2000);
    const y = Math.floor(Math.random() * 2000);
    shadows.push(`${x}px ${y}px #FFF`);
  }
  return shadows.join(', ');
};

const BtParalex = ({ children, className = '' }) => {
  const [shadows, setShadows] = React.useState({
    small: '',
    medium: '',
    big: ''
  });

  React.useEffect(() => {
    setShadows({
      small: generateStarShadows(700),
      medium: generateStarShadows(200),
      big: generateStarShadows(100)
    });
  }, []);

  return (
    <div className={`parallax-stars-container ${className}`}>
      <div 
        id="stars" 
        className="stars-layer stars-small"
        style={{ 
          '--star-shadow': shadows.small,
          boxShadow: shadows.small 
        }}
      />
      <div 
        id="stars2" 
        className="stars-layer stars-medium"
        style={{ 
          '--star-shadow': shadows.medium,
          boxShadow: shadows.medium 
        }}
      />
      <div 
        id="stars3" 
        className="stars-layer stars-big"
        style={{ 
          '--star-shadow': shadows.big,
          boxShadow: shadows.big 
        }}
      />
      {children && <div className="parallax-content">{children}</div>}
    </div>
  );
};

export default BtParalex;
