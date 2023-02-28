import Confetti from "react-confetti";
import { drawStars, CONFETTI_GOLD_COLORS } from "./confetty-constants";

const ConfettiWrapper = ({height=0, width=0}:{height:number|undefined, width:number|undefined}) => {
  return (
    <Confetti
      confettiSource={{
        x: -25,
        y: height,
        w: 5,
        h: -20,
      }}
      initialVelocityY={30}
      height={height}
      width={width}
      recycle={false}
      wind={0.3}
      onConfettiComplete={(confetti) => {
        confetti?.reset();
      }}
      drawShape={drawStars}
      colors={CONFETTI_GOLD_COLORS}
    />
  );
};

export default ConfettiWrapper;
