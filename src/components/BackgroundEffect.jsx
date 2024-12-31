import React, { memo } from 'react';

const BackgroundEffect = memo(() => {
  return (
    <div className="background-effect">
      <div className="gradient-orb top-left" />
      <div className="gradient-orb top-right" />
      <div className="gradient-orb bottom-left" />
      <div className="gradient-orb bottom-right" />
      <div className="gradient-overlay" />
    </div>
  );
});

BackgroundEffect.displayName = 'BackgroundEffect';

export default BackgroundEffect; 