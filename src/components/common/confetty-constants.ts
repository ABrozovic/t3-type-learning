export function drawStars(ctx: CanvasRenderingContext2D) {
  const numPoints = Math.floor(Math.random() * 4) + 2;

  const outerRadius = 12;
  const innerRadius = outerRadius / 2;
  ctx.beginPath();
  ctx.moveTo(0, 0 - outerRadius);

  for (let n = 1; n < numPoints * 2; n++) {
    const radius = n % 2 === 0 ? outerRadius : innerRadius;
    const x = radius * Math.sin((n * Math.PI) / numPoints);
    const y = -1 * radius * Math.cos((n * Math.PI) / numPoints);
    ctx.lineTo(x, y);
  }
  ctx.fill();
  ctx.closePath();
}
export const CONFETTI_GOLD_COLORS = [
  "#FFD700", // Gold
  "#D4AF37", // Goldenrod
  "#FADA5E", // Lemon Curry
  "#F9A602", // Orange Yellow
  "#E1A95F", // Harvest Gold
  "#E6BE8A", // Satin Sheen Gold
  "#FCC200", // Golden Poppy
  "#FFC200", // Cyber Yellow
  "#FFDF00", // Yellow (Web)
  "#ECD540", // Dandelion
  "#F6E3CE", // Bisque
  "#FFDB58", // Mustard
  "#FFCC33", // Saffron
  "#FFC87C", // Tuscany
  "#C9AE5D", // Antique Brass
  "#8C7853", // Mule Fawn
];
