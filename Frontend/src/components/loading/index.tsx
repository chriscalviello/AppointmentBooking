import React from "react";
import Backdrop from "@material-ui/core/Backdrop";
import CircularProgress from "@material-ui/core/CircularProgress";

const Loading: React.FC = () => {
  return (
    <Backdrop open={true} style={{ zIndex: 100000000 }}>
      <CircularProgress color="inherit" />
    </Backdrop>
  );
};

export default Loading;
