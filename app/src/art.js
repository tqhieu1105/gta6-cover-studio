// After Hours' poster engine: original vector lettering, local photo grading and
// aspect-aware slanted photo panels. Every preview and exported PNG uses renderPoster.
export const FORMATS = {
  square: [1080, 1080],
  portrait: [1080, 1350],
  landscape: [1920, 1080],
};
export const GRADES = [
  {
    id: "sunset",
    name: "Sunset",
    colors: ["#573c79", "#f28378", "#ffd59b"],
    shadow: [46, 10, 66],
    light: [255, 199, 127],
  },
  {
    id: "neon",
    name: "Neon noir",
    colors: ["#121d56", "#b047a8", "#4dd6d5"],
    shadow: [24, 17, 76],
    light: [250, 137, 196],
  },
  {
    id: "tropic",
    name: "Tropic",
    colors: ["#064e59", "#34ad9b", "#f9df9b"],
    shadow: [6, 60, 70],
    light: [255, 220, 145],
  },
  {
    id: "heat",
    name: "Heat",
    colors: ["#5d2148", "#ee5b58", "#ffc375"],
    shadow: [67, 14, 45],
    light: [255, 171, 103],
  },
  {
    id: "gold",
    name: "Gold rush",
    colors: ["#343c52", "#b88d57", "#f3dea9"],
    shadow: [30, 36, 58],
    light: [252, 218, 149],
  },
  {
    id: "film",
    name: "Silver",
    colors: ["#20242e", "#7b8394", "#e2e4de"],
    shadow: [28, 33, 47],
    light: [223, 230, 228],
  },
];
export const LAYOUTS = [
  { id: "alibi", name: "The Alibi" },
  { id: "crossfire", name: "Crossfire" },
  { id: "coastline", name: "Coastline" },
  { id: "triptych", name: "Triptych" },
  { id: "split", name: "Split Scene" },
  { id: "mosaic", name: "Mosaic" },
];
const LETTERS = {
  A: [
    [
      [0, 140],
      [29, 0],
      [75, 0],
      [106, 140],
      [75, 140],
      [69, 110],
      [36, 110],
      [30, 140],
    ],
    [
      [43, 82],
      [63, 82],
      [53, 32],
    ],
  ],
  B: [
    [
      [0, 0],
      [72, 0],
      [95, 18],
      [95, 57],
      [82, 69],
      [99, 82],
      [99, 121],
      [79, 140],
      [0, 140],
    ],
    [
      [30, 27],
      [30, 56],
      [63, 56],
      [66, 52],
      [66, 31],
      [62, 27],
    ],
    [
      [30, 83],
      [30, 113],
      [66, 113],
      [70, 109],
      [70, 88],
      [65, 83],
    ],
  ],
  C: [
    [
      [99, 0],
      [99, 30],
      [37, 30],
      [30, 37],
      [30, 104],
      [37, 110],
      [99, 110],
      [99, 140],
      [22, 140],
      [0, 118],
      [0, 23],
      [23, 0],
    ],
  ],
  D: [
    [
      [0, 0],
      [72, 0],
      [103, 30],
      [103, 109],
      [72, 140],
      [0, 140],
    ],
    [
      [30, 30],
      [30, 110],
      [59, 110],
      [73, 96],
      [73, 44],
      [59, 30],
    ],
  ],
  E: [
    [
      [0, 0],
      [94, 0],
      [94, 30],
      [30, 30],
      [30, 55],
      [83, 55],
      [83, 83],
      [30, 83],
      [30, 110],
      [96, 110],
      [96, 140],
      [0, 140],
    ],
  ],
  F: [
    [
      [0, 0],
      [94, 0],
      [94, 30],
      [30, 30],
      [30, 57],
      [82, 57],
      [82, 87],
      [30, 87],
      [30, 140],
      [0, 140],
    ],
  ],
  G: [
    [
      [104, 0],
      [104, 30],
      [39, 30],
      [30, 39],
      [30, 103],
      [37, 110],
      [74, 110],
      [74, 86],
      [54, 86],
      [54, 60],
      [104, 60],
      [104, 119],
      [83, 140],
      [22, 140],
      [0, 118],
      [0, 23],
      [23, 0],
    ],
  ],
  H: [
    [
      [0, 0],
      [31, 0],
      [31, 54],
      [72, 54],
      [72, 0],
      [103, 0],
      [103, 140],
      [72, 140],
      [72, 85],
      [31, 85],
      [31, 140],
      [0, 140],
    ],
  ],
  I: [
    [
      [0, 0],
      [68, 0],
      [68, 28],
      [49, 28],
      [49, 112],
      [68, 112],
      [68, 140],
      [0, 140],
      [0, 112],
      [19, 112],
      [19, 28],
      [0, 28],
    ],
  ],
  J: [
    [
      [0, 0],
      [98, 0],
      [98, 117],
      [75, 140],
      [22, 140],
      [0, 118],
      [0, 85],
      [30, 85],
      [30, 104],
      [37, 111],
      [61, 111],
      [68, 104],
      [68, 30],
      [0, 30],
    ],
  ],
  K: [
    [
      [0, 0],
      [31, 0],
      [31, 52],
      [67, 0],
      [104, 0],
      [58, 66],
      [108, 140],
      [70, 140],
      [31, 81],
      [31, 140],
      [0, 140],
    ],
  ],
  L: [
    [
      [0, 0],
      [31, 0],
      [31, 110],
      [93, 110],
      [93, 140],
      [0, 140],
    ],
  ],
  M: [
    [
      [0, 140],
      [0, 0],
      [34, 0],
      [60, 60],
      [86, 0],
      [120, 0],
      [120, 140],
      [90, 140],
      [90, 56],
      [67, 111],
      [52, 111],
      [30, 56],
      [30, 140],
    ],
  ],
  N: [
    [
      [0, 140],
      [0, 0],
      [31, 0],
      [74, 82],
      [74, 0],
      [104, 0],
      [104, 140],
      [74, 140],
      [30, 57],
      [30, 140],
    ],
  ],
  O: [
    [
      [23, 0],
      [82, 0],
      [105, 23],
      [105, 117],
      [82, 140],
      [23, 140],
      [0, 117],
      [0, 23],
    ],
    [
      [38, 30],
      [30, 38],
      [30, 102],
      [38, 110],
      [67, 110],
      [75, 102],
      [75, 38],
      [67, 30],
    ],
  ],
  P: [
    [
      [0, 0],
      [76, 0],
      [100, 23],
      [100, 72],
      [77, 95],
      [31, 95],
      [31, 140],
      [0, 140],
    ],
    [
      [31, 29],
      [31, 66],
      [63, 66],
      [70, 59],
      [70, 36],
      [63, 29],
    ],
  ],
  Q: [
    [
      [23, 0],
      [82, 0],
      [105, 23],
      [105, 112],
      [91, 126],
      [110, 140],
      [73, 140],
      [63, 132],
      [23, 132],
      [0, 109],
      [0, 23],
    ],
    [
      [38, 30],
      [30, 38],
      [30, 96],
      [38, 104],
      [68, 104],
      [75, 97],
      [75, 38],
      [67, 30],
    ],
  ],
  R: [
    [
      [0, 0],
      [75, 0],
      [99, 23],
      [99, 68],
      [79, 88],
      [108, 140],
      [73, 140],
      [49, 94],
      [31, 94],
      [31, 140],
      [0, 140],
    ],
    [
      [31, 29],
      [31, 65],
      [63, 65],
      [69, 59],
      [69, 35],
      [63, 29],
    ],
  ],
  S: [
    [
      [23, 0],
      [96, 0],
      [96, 30],
      [38, 30],
      [30, 38],
      [30, 50],
      [38, 57],
      [76, 57],
      [99, 80],
      [99, 117],
      [76, 140],
      [0, 140],
      [0, 110],
      [62, 110],
      [69, 103],
      [69, 91],
      [62, 85],
      [23, 85],
      [0, 62],
      [0, 23],
    ],
  ],
  T: [
    [
      [0, 0],
      [108, 0],
      [108, 31],
      [69, 31],
      [69, 140],
      [38, 140],
      [38, 31],
      [0, 31],
    ],
  ],
  U: [
    [
      [0, 0],
      [31, 0],
      [31, 101],
      [40, 110],
      [66, 110],
      [75, 101],
      [75, 0],
      [106, 0],
      [106, 117],
      [83, 140],
      [23, 140],
      [0, 117],
    ],
  ],
  V: [
    [
      [0, 0],
      [33, 0],
      [55, 103],
      [79, 0],
      [111, 0],
      [77, 140],
      [33, 140],
    ],
  ],
  W: [
    [
      [0, 0],
      [30, 0],
      [45, 89],
      [65, 13],
      [86, 13],
      [106, 89],
      [122, 0],
      [152, 0],
      [124, 140],
      [96, 140],
      [76, 65],
      [56, 140],
      [27, 140],
    ],
  ],
  X: [
    [
      [0, 0],
      [35, 0],
      [55, 44],
      [77, 0],
      [112, 0],
      [73, 68],
      [114, 140],
      [78, 140],
      [55, 93],
      [33, 140],
      [0, 140],
      [37, 68],
    ],
  ],
  Y: [
    [
      [0, 0],
      [34, 0],
      [58, 54],
      [81, 0],
      [115, 0],
      [73, 85],
      [73, 140],
      [42, 140],
      [42, 85],
    ],
  ],
  Z: [
    [
      [0, 0],
      [103, 0],
      [103, 29],
      [37, 110],
      [103, 110],
      [103, 140],
      [0, 140],
      [0, 111],
      [67, 30],
      [0, 30],
    ],
  ],
  0: [
    [
      [23, 0],
      [79, 0],
      [102, 23],
      [102, 117],
      [79, 140],
      [23, 140],
      [0, 117],
      [0, 23],
    ],
    [
      [37, 30],
      [30, 37],
      [30, 103],
      [37, 110],
      [65, 110],
      [72, 103],
      [72, 37],
      [65, 30],
    ],
  ],
  1: [
    [
      [3, 23],
      [32, 0],
      [66, 0],
      [66, 112],
      [90, 112],
      [90, 140],
      [9, 140],
      [9, 112],
      [35, 112],
      [35, 37],
      [3, 57],
    ],
  ],
  2: [
    [
      [0, 0],
      [78, 0],
      [101, 23],
      [101, 63],
      [35, 110],
      [101, 110],
      [101, 140],
      [0, 140],
      [0, 107],
      [71, 53],
      [71, 37],
      [64, 30],
      [0, 30],
    ],
  ],
  3: [
    [
      [0, 0],
      [76, 0],
      [99, 23],
      [99, 58],
      [87, 70],
      [99, 82],
      [99, 117],
      [76, 140],
      [0, 140],
      [0, 110],
      [62, 110],
      [69, 104],
      [69, 89],
      [62, 83],
      [23, 83],
      [23, 55],
      [62, 55],
      [69, 49],
      [69, 36],
      [62, 30],
      [0, 30],
    ],
  ],
  4: [
    [
      [0, 0],
      [31, 0],
      [31, 58],
      [64, 58],
      [64, 0],
      [95, 0],
      [95, 140],
      [64, 140],
      [64, 88],
      [0, 88],
    ],
  ],
  5: [
    [
      [0, 0],
      [97, 0],
      [97, 30],
      [30, 30],
      [30, 54],
      [74, 54],
      [99, 79],
      [99, 117],
      [76, 140],
      [0, 140],
      [0, 110],
      [62, 110],
      [69, 103],
      [69, 91],
      [62, 84],
      [0, 84],
    ],
  ],
  6: [
    [
      [23, 0],
      [98, 0],
      [98, 30],
      [39, 30],
      [31, 38],
      [31, 54],
      [76, 54],
      [99, 77],
      [99, 117],
      [76, 140],
      [23, 140],
      [0, 117],
      [0, 23],
    ],
    [
      [31, 84],
      [31, 104],
      [38, 111],
      [63, 111],
      [70, 104],
      [70, 91],
      [63, 84],
    ],
  ],
  7: [
    [
      [0, 0],
      [105, 0],
      [105, 30],
      [48, 140],
      [13, 140],
      [71, 30],
      [0, 30],
    ],
  ],
  8: [
    [
      [22, 0],
      [77, 0],
      [99, 22],
      [99, 58],
      [87, 70],
      [99, 82],
      [99, 118],
      [77, 140],
      [22, 140],
      [0, 118],
      [0, 82],
      [12, 70],
      [0, 58],
      [0, 22],
    ],
    [
      [31, 30],
      [31, 55],
      [68, 55],
      [68, 30],
    ],
    [
      [31, 84],
      [31, 110],
      [68, 110],
      [68, 84],
    ],
  ],
  9: [
    [
      [23, 0],
      [76, 0],
      [99, 23],
      [99, 117],
      [76, 140],
      [0, 140],
      [0, 110],
      [61, 110],
      [69, 102],
      [69, 87],
      [23, 87],
      [0, 64],
      [0, 23],
    ],
    [
      [31, 30],
      [31, 58],
      [68, 58],
      [68, 30],
    ],
  ],
  "!": [
    [
      [0, 0],
      [33, 0],
      [29, 96],
      [4, 96],
    ],
    [
      [3, 110],
      [30, 110],
      [30, 140],
      [3, 140],
    ],
  ],
  "?": [
    [
      [0, 0],
      [73, 0],
      [96, 23],
      [96, 60],
      [61, 88],
      [61, 99],
      [31, 99],
      [31, 76],
      [66, 49],
      [66, 37],
      [59, 30],
      [0, 30],
    ],
    [
      [31, 111],
      [61, 111],
      [61, 140],
      [31, 140],
    ],
  ],
  "-": [
    [
      [0, 57],
      [70, 57],
      [70, 85],
      [0, 85],
    ],
  ],
  ".": [
    [
      [0, 108],
      [32, 108],
      [32, 140],
      [0, 140],
    ],
  ],
  ":": [
    [
      [0, 27],
      [31, 27],
      [31, 58],
      [0, 58],
    ],
    [
      [0, 96],
      [31, 96],
      [31, 127],
      [0, 127],
    ],
  ],
};
function captionPath(text) {
  const path = new Path2D();
  let x = 0;
  for (const character of text.toUpperCase()) {
    if (character === " ") {
      x += 48;
      continue;
    }
    const contours = LETTERS[character] || LETTERS["?"];
    let width = 0;
    for (const contour of contours) {
      for (let i = 0; i < contour.length; i++) {
        const [px, py] = contour[i];
        width = Math.max(width, px);
        if (i === 0) path.moveTo(x + px, py);
        else path.lineTo(x + px, py);
      }
      path.closePath();
    }
    x += width + 9;
  }
  return { path, width: Math.max(1, x - 9) };
}
export function drawChromeLettering(
  ctx,
  text,
  cx,
  top,
  width,
  height,
  grade = "sunset",
  finish = "chrome",
) {
  if (/[^a-z0-9 !?.:-]/i.test(text)) {
    drawSystemCaption(ctx, text, cx, top, width, height, grade);
    return;
  }
  const { path, width: rawWidth } = captionPath(text);
  const sx = width / rawWidth,
    sy = height / 140;
  ctx.save();
  ctx.translate(cx - width / 2 + height * 0.05, top);
  ctx.transform(sx, 0, -0.12 * sy, sy, 0, 0);
  ctx.lineJoin = "round";
  // Stacked offset silhouettes create a real dimensional extrusion from the same glyphs.
  ctx.strokeStyle = "#100d1c";
  ctx.lineWidth = 13;
  ctx.translate(12 / sx, 14 / sy);
  ctx.stroke(path);
  ctx.fillStyle = "#160f26";
  ctx.fill(path, "evenodd");
  ctx.translate(-12 / sx, -14 / sy);
  for (let d = 11; d >= 1; d--) {
    ctx.save();
    ctx.translate((d * 0.8) / sx, d / sy);
    ctx.fillStyle = d % 3 === 0 ? "#f18693" : "#74395e";
    ctx.strokeStyle = "#1b1229";
    ctx.lineWidth = 7;
    ctx.stroke(path);
    ctx.fill(path, "evenodd");
    ctx.restore();
  }
  ctx.lineWidth = 9;
  ctx.strokeStyle = "#111020";
  ctx.stroke(path);
  ctx.lineWidth = 5;
  ctx.strokeStyle = "#ffddad";
  ctx.stroke(path);
  const chrome = ctx.createLinearGradient(0, 0, 0, 140);
  const colors =
    finish === "enamel"
      ? [
          "#ffeaca",
          "#ffd4aa",
          "#ffae88",
          "#e46e79",
          "#ffb997",
          "#f1818d",
          "#cb5389",
        ]
      : finish === "ice"
        ? [
            "#fffde7",
            "#dbf6ed",
            "#86d5d8",
            "#295a81",
            "#fff3da",
            "#a6d2df",
            "#82a4c8",
          ]
        : grade === "neon"
          ? [
              "#fffce7",
              "#a6f0ec",
              "#5b8fc0",
              "#182e67",
              "#f7ffed",
              "#c796d5",
              "#f378b7",
            ]
          : [
              "#fffee4",
              "#fff2c5",
              "#efbb79",
              "#ac665f",
              "#fffce5",
              "#f5adb8",
              "#dd648d",
            ];
  [
    [0, colors[0]],
    [0.2, colors[1]],
    [0.43, colors[2]],
    [0.49, colors[3]],
    [0.51, colors[4]],
    [0.72, colors[5]],
    [1, colors[6]],
  ].forEach(([p, c]) => chrome.addColorStop(p, c));
  ctx.fillStyle = chrome;
  ctx.fill(path, "evenodd");
  ctx.lineWidth = 0.9;
  ctx.strokeStyle = "#fff9dc";
  ctx.stroke(path);
  ctx.save();
  ctx.clip(path, "evenodd");
  ctx.globalAlpha = 0.23;
  ctx.strokeStyle = "#faf4da";
  ctx.lineWidth = 0.55;
  for (let y = 3; y < 140; y += 5) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(rawWidth, y);
    ctx.stroke();
  }
  ctx.restore();
  ctx.restore();
}
function drawSystemCaption(ctx, text, cx, top, width, height, grade) {
  ctx.save();
  ctx.font = "900 140px Arial, sans-serif";
  const raw = Math.max(1, ctx.measureText(text).width);
  ctx.translate(cx - width / 2, top);
  ctx.transform(width / raw, 0, -0.1, height / 140, 0, 0);
  ctx.textBaseline = "top";
  ctx.lineJoin = "round";
  ctx.strokeStyle = "#110f21";
  ctx.lineWidth = 14;
  ctx.strokeText(text, 8, 9);
  ctx.strokeStyle = "#ffddad";
  ctx.lineWidth = 5;
  ctx.strokeText(text, 0, 0);
  const g = ctx.createLinearGradient(0, 0, 0, 140);
  g.addColorStop(0, "#fff8dc");
  g.addColorStop(0.48, grade === "neon" ? "#80ced5" : "#edb687");
  g.addColorStop(0.51, "#ffeed5");
  g.addColorStop(1, "#de6e9d");
  ctx.fillStyle = g;
  ctx.fillText(text, 0, 0);
  ctx.restore();
}
function drawLocationPlate(ctx, x, y, title, coordinates) {
  ctx.save();
  ctx.fillStyle = "#171627";
  ctx.fillRect(x - 6, y - 12, 151, 33);
  ctx.strokeStyle = "#e3bd94";
  ctx.lineWidth = 0.6;
  ctx.strokeRect(x - 6, y - 12, 151, 33);
  trackedText(ctx, title, x + 4, y, 8, 2, "left", "#ffe2a5");
  trackedText(ctx, coordinates, x + 4, y + 12, 5.7, 0.9, "left", "#bf9e9d");
  ctx.restore();
}

export function panelPolygons(layout, format) {
  const wide = format === "landscape";
  let points = wide
    ? [
        [
          [0.026, 0.09],
          [0.331, 0.09],
          [0.281, 0.655],
          [0.026, 0.76],
        ],
        [
          [0.34, 0.09],
          [0.694, 0.09],
          [0.769, 0.922],
          [0.275, 0.922],
        ],
        [
          [0.703, 0.09],
          [0.974, 0.09],
          [0.974, 0.467],
          [0.736, 0.507],
        ],
        [
          [0.742, 0.523],
          [0.974, 0.485],
          [0.974, 0.922],
          [0.779, 0.922],
        ],
        [
          [0.026, 0.78],
          [0.276, 0.675],
          [0.252, 0.922],
          [0.026, 0.922],
        ],
      ]
    : [
        [
          [0.027, 0.074],
          [0.405, 0.074],
          [0.352, 0.57],
          [0.027, 0.656],
        ],
        [
          [0.418, 0.074],
          [0.973, 0.074],
          [0.973, 0.688],
          [0.348, 0.737],
        ],
        [
          [0.027, 0.67],
          [0.338, 0.589],
          [0.311, 0.922],
          [0.027, 0.922],
        ],
        [
          [0.677, 0.705],
          [0.973, 0.677],
          [0.973, 0.922],
          [0.712, 0.922],
        ],
        [
          [0.326, 0.75],
          [0.665, 0.716],
          [0.7, 0.922],
          [0.312, 0.922],
        ],
      ];
  if (layout === "crossfire")
    points = wide
      ? [
          [
            [0.026, 0.09],
            [0.367, 0.09],
            [0.303, 0.716],
            [0.026, 0.607],
          ],
          [
            [0.378, 0.09],
            [0.724, 0.09],
            [0.664, 0.922],
            [0.314, 0.719],
          ],
          [
            [0.735, 0.09],
            [0.974, 0.09],
            [0.974, 0.53],
            [0.7, 0.473],
          ],
          [
            [0.698, 0.494],
            [0.974, 0.55],
            [0.974, 0.922],
            [0.675, 0.922],
          ],
          [
            [0.026, 0.629],
            [0.301, 0.739],
            [0.289, 0.922],
            [0.026, 0.922],
          ],
        ]
      : [
          [
            [0.027, 0.074],
            [0.47, 0.074],
            [0.393, 0.573],
            [0.027, 0.462],
          ],
          [
            [0.483, 0.074],
            [0.973, 0.074],
            [0.973, 0.652],
            [0.407, 0.58],
          ],
          [
            [0.027, 0.479],
            [0.389, 0.59],
            [0.353, 0.922],
            [0.027, 0.922],
          ],
          [
            [0.684, 0.633],
            [0.973, 0.669],
            [0.973, 0.922],
            [0.739, 0.922],
          ],
          [
            [0.401, 0.601],
            [0.671, 0.635],
            [0.724, 0.922],
            [0.366, 0.922],
          ],
        ];
  if (layout === "coastline")
    points = wide
      ? [
          [
            [0.026, 0.09],
            [0.28, 0.09],
            [0.329, 0.597],
            [0.026, 0.663],
          ],
          [
            [0.292, 0.09],
            [0.728, 0.09],
            [0.674, 0.922],
            [0.357, 0.922],
          ],
          [
            [0.739, 0.09],
            [0.974, 0.09],
            [0.974, 0.422],
            [0.717, 0.474],
          ],
          [
            [0.716, 0.496],
            [0.974, 0.444],
            [0.974, 0.922],
            [0.689, 0.922],
          ],
          [
            [0.026, 0.683],
            [0.331, 0.619],
            [0.343, 0.922],
            [0.026, 0.922],
          ],
        ]
      : [
          [
            [0.027, 0.074],
            [0.415, 0.074],
            [0.378, 0.52],
            [0.027, 0.573],
          ],
          [
            [0.428, 0.074],
            [0.973, 0.074],
            [0.973, 0.76],
            [0.359, 0.705],
          ],
          [
            [0.027, 0.587],
            [0.373, 0.536],
            [0.348, 0.922],
            [0.027, 0.922],
          ],
          [
            [0.703, 0.748],
            [0.973, 0.773],
            [0.973, 0.922],
            [0.721, 0.922],
          ],
          [
            [0.365, 0.721],
            [0.69, 0.75],
            [0.707, 0.922],
            [0.348, 0.922],
          ],
        ];
  if (layout === "triptych")
    points = [
      [
        [0.027, 0.09],
        [0.334, 0.09],
        [0.292, 0.922],
        [0.027, 0.922],
      ],
      [
        [0.346, 0.09],
        [0.694, 0.09],
        [0.741, 0.922],
        [0.304, 0.922],
      ],
      [
        [0.706, 0.09],
        [0.974, 0.09],
        [0.974, 0.48],
        [0.729, 0.48],
      ],
      [
        [0.731, 0.499],
        [0.974, 0.499],
        [0.974, 0.922],
        [0.753, 0.922],
      ],
    ];
  if (layout === "split")
    points = [
      [
        [0.027, 0.078],
        [0.495, 0.078],
        [0.427, 0.635],
        [0.027, 0.727],
      ],
      [
        [0.507, 0.078],
        [0.974, 0.078],
        [0.974, 0.65],
        [0.44, 0.635],
      ],
      [
        [0.027, 0.744],
        [0.422, 0.652],
        [0.39, 0.922],
        [0.027, 0.922],
      ],
      [
        [0.443, 0.652],
        [0.974, 0.668],
        [0.974, 0.922],
        [0.407, 0.922],
      ],
    ];
  if (layout === "mosaic")
    points = [
      [
        [0.027, 0.078],
        [0.48, 0.078],
        [0.452, 0.48],
        [0.027, 0.535],
      ],
      [
        [0.492, 0.078],
        [0.974, 0.078],
        [0.974, 0.608],
        [0.465, 0.55],
      ],
      [
        [0.027, 0.552],
        [0.449, 0.498],
        [0.417, 0.922],
        [0.027, 0.922],
      ],
      [
        [0.67, 0.592],
        [0.974, 0.625],
        [0.974, 0.922],
        [0.691, 0.922],
      ],
      [
        [0.463, 0.568],
        [0.658, 0.59],
        [0.678, 0.922],
        [0.431, 0.922],
      ],
    ];
  return points.map((polygon) =>
    polygon.map(([x, y]) => [x, y > 0.87 ? y - 0.025 : y]),
  );
}
export function initialPanels() {
  return [
    {
      photo: 1,
      zoom: 1,
      offsetX: 0,
      offsetY: 0,
      focusX: 0.48,
      focusY: 0.34,
      flip: false,
      role: "THE FIXER",
    },
    {
      photo: 0,
      zoom: 1,
      offsetX: 0,
      offsetY: 0,
      focusX: 0.52,
      focusY: 0.36,
      flip: false,
      role: "THE DRIVER",
    },
    {
      photo: -1,
      zoom: 1,
      offsetX: 0,
      offsetY: 0,
      focusX: 0.5,
      focusY: 0.5,
      flip: false,
      role: "PARADISE HAS A PRICE",
    },
    {
      photo: 0,
      zoom: 1.8,
      offsetX: 0,
      offsetY: 0,
      focusX: 0.23,
      focusY: 0.72,
      flip: false,
      role: "THE GETAWAY",
    },
    {
      photo: 1,
      zoom: 1.6,
      offsetX: 0,
      offsetY: 0,
      focusX: 0.82,
      focusY: 0.66,
      flip: false,
      role: "OFF THE GRID",
    },
  ];
}
export function gradePhoto(image, gradeId, intensity, ink) {
  const canvas = document.createElement("canvas");
  const factor = Math.min(1, 1200 / Math.max(image.width, image.height));
  canvas.width = Math.round(image.width * factor);
  canvas.height = Math.round(image.height * factor);
  const c = canvas.getContext("2d", { willReadFrequently: true });
  c.drawImage(image, 0, 0, canvas.width, canvas.height);
  const data = c.getImageData(0, 0, canvas.width, canvas.height);
  const pixels = data.data;
  const grade = GRADES.find((x) => x.id === gradeId) || GRADES[0];
  const amount = intensity / 100;
  // A tiny edge-preserving paint pass suppresses camera noise without flattening faces.
  const original = new Uint8ClampedArray(pixels);
  const lumas = new Float32Array(pixels.length / 4);
  for (let i = 0; i < original.length; i += 4)
    lumas[i / 4] =
      original[i] * 0.299 + original[i + 1] * 0.587 + original[i + 2] * 0.114;
  const width = canvas.width,
    height = canvas.height;
  for (let y = 0; y < height; y++)
    for (let x = 0; x < width; x++) {
      const index = y * width + x,
        i = index * 4,
        lum = lumas[index];
      let r = original[i],
        g = original[i + 1],
        b = original[i + 2];
      if (ink && x > 1 && x < width - 2 && y > 1 && y < height - 2) {
        let sr = r * 2,
          sg = g * 2,
          sb = b * 2,
          weight = 2;
        for (const off of [
          -width - 1,
          -width,
          -width + 1,
          -1,
          1,
          width - 1,
          width,
          width + 1,
        ]) {
          const close =
            1 - Math.min(1, Math.abs(lumas[index + off] - lum) / 25);
          sr += original[(index + off) * 4] * close;
          sg += original[(index + off) * 4 + 1] * close;
          sb += original[(index + off) * 4 + 2] * close;
          weight += close;
        }
        r = sr / weight;
        g = sg / weight;
        b = sb / weight;
      }
      // Selective cool-color toning ties bright blue skies into a sunset ink palette.
      const sky =
        Math.max(0, Math.min(1, (b - r - 10) / 45)) *
        Math.max(0, 1 - y / height / 0.57) *
        amount;
      if (gradeId === "sunset" || gradeId === "heat" || gradeId === "gold") {
        r = r * (1 - sky * 0.85) + (236 - (y / height) * 60) * sky * 0.85;
        g = g * (1 - sky * 0.7) + (154 + (y / height) * 80) * sky * 0.7;
        b = b * (1 - sky * 0.6) + 176 * sky * 0.6;
      }
      if (gradeId === "neon") {
        const blue = Math.max(0, Math.min(1, (b - r) / 60)) * amount;
        r += blue * 35;
        b += 10 * amount;
        g -= blue * 16;
      }
      const luminance = r * 0.299 + g * 0.587 + b * 0.114;
      const shade = (1 - luminance / 255) ** 1.25 * 0.51 * amount,
        highlight = (luminance / 255) ** 1.6 * 0.31 * amount;
      const channels = [r, g, b];
      for (let k = 0; k < 3; k++) {
        let value = (channels[k] - luminance) * (1 + amount * 0.3) + luminance;
        value = (value - 122) * (1 + amount * 0.23) + 124;
        value =
          value * (1 - shade - highlight) +
          grade.shadow[k] * shade +
          grade.light[k] * highlight;
        if (gradeId === "film") value = value * 0.15 + luminance * 0.85;
        const step = ink ? 18 : 3,
          q = Math.round(value / step) * step;
        pixels[i + k] = Math.min(
          255,
          Math.max(0, value * (ink ? 0.38 : 0.8) + q * (ink ? 0.62 : 0.2)),
        );
      }
      if (ink && x > 0 && x < width - 1 && y > 0 && y < height - 1) {
        const edge =
          Math.abs(lum - lumas[index + 1]) +
          Math.abs(lum - lumas[index + width]);
        if (edge > 25) {
          const darkness = Math.min(0.6, (edge - 25) / 130);
          pixels[i] = pixels[i] * (1 - darkness) + 26 * darkness;
          pixels[i + 1] = pixels[i + 1] * (1 - darkness) + 18 * darkness;
          pixels[i + 2] = pixels[i + 2] * (1 - darkness) + 43 * darkness;
        }
      }
    }
  c.putImageData(data, 0, 0);
  return canvas;
}
function polygonPath(points, w, h) {
  const p = new Path2D();
  points.forEach(([x, y], i) =>
    i ? p.lineTo(x * w, y * h) : p.moveTo(x * w, y * h),
  );
  p.closePath();
  return p;
}
function panelBounds(points, w, h) {
  const xs = points.map((p) => p[0] * w),
    ys = points.map((p) => p[1] * h);
  return {
    x: Math.min(...xs),
    y: Math.min(...ys),
    w: Math.max(...xs) - Math.min(...xs),
    h: Math.max(...ys) - Math.min(...ys),
  };
}
export function fitPhotoToPanel(ctx, image, bounds, panel) {
  const { x, y, w, h } = bounds;
  const scale = Math.max(w / image.width, h / image.height) * panel.zoom;
  const dw = image.width * scale,
    dh = image.height * scale;
  const dx = Math.max(
    x + w - dw,
    Math.min(x, x + w / 2 - dw * panel.focusX + panel.offsetX * w),
  );
  const dy = Math.max(
    y + h - dh,
    Math.min(y, y + h / 2 - dh * panel.focusY + panel.offsetY * h),
  );
  ctx.save();
  if (panel.flip) {
    ctx.translate(x + w / 2, 0);
    ctx.scale(-1, 1);
    ctx.translate(-x - w / 2, 0);
  }
  ctx.drawImage(image, dx, dy, dw, dh);
  ctx.restore();
}
function drawPalm(ctx, x, y, height, lean = 0, color = "#171729") {
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = color;
  ctx.strokeStyle = color;
  const tx = lean * height,
    ty = -height;
  ctx.beginPath();
  ctx.moveTo(-height * 0.035, 0);
  ctx.bezierCurveTo(
    height * 0.025,
    -height * 0.48,
    tx - height * 0.023,
    ty * 0.8,
    tx,
    ty,
  );
  ctx.bezierCurveTo(
    tx + height * 0.025,
    ty * 0.8,
    height * 0.05,
    -height * 0.4,
    height * 0.028,
    0,
  );
  ctx.closePath();
  ctx.fill();
  for (let i = 0; i < 9; i++) {
    const angle = -Math.PI * 0.95 + i * Math.PI * 0.123;
    const length = height * (0.29 + (i % 3) * 0.035);
    const ex = tx + Math.cos(angle) * length,
      ey = ty + Math.sin(angle) * length * 0.5 + height * 0.12;
    ctx.beginPath();
    ctx.moveTo(tx, ty);
    ctx.quadraticCurveTo(
      tx + Math.cos(angle) * length * 0.64,
      ty - height * 0.16,
      ex,
      ey,
    );
    ctx.quadraticCurveTo(
      tx + Math.cos(angle) * length * 0.6,
      ty - height * 0.04,
      tx,
      ty + height * 0.018,
    );
    ctx.fill();
    for (let f = 2; f < 8; f++) {
      const t = f / 9;
      const bx = tx + (ex - tx) * t,
        by = ty + (ey - ty) * t - height * 0.08 * Math.sin(t * Math.PI);
      ctx.lineWidth = Math.max(0.6, height * 0.006);
      ctx.beginPath();
      ctx.moveTo(bx, by);
      ctx.lineTo(
        bx + Math.cos(angle + 0.4) * height * 0.065,
        by + height * 0.08,
      );
      ctx.stroke();
    }
  }
  ctx.restore();
}
function drawSkyline(ctx, b, gradeId, details) {
  const { x, y, w, h } = b;
  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, w, h);
  ctx.clip();
  const neon = gradeId === "neon";
  const sky = ctx.createLinearGradient(0, y, 0, y + h);
  [
    [0, neon ? "#202958" : "#ad7590"],
    [0.46, neon ? "#c55d9e" : "#fba38b"],
    [0.7, "#ffd69b"],
    [1, "#1d697d"],
  ].forEach(([p, c]) => sky.addColorStop(p, c));
  ctx.fillStyle = sky;
  ctx.fillRect(x, y, w, h);
  const sunX = x + w * 0.45,
    sunY = y + h * 0.43,
    r = w * 0.26;
  ctx.save();
  const glow = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, r * 2);
  glow.addColorStop(0, "#ffe7b6aa");
  glow.addColorStop(1, "#ffd59200");
  ctx.fillStyle = glow;
  ctx.fillRect(x, y, w, h);
  ctx.beginPath();
  ctx.arc(sunX, sunY, r, 0, Math.PI * 2);
  ctx.fillStyle = "#ffde99";
  ctx.fill();
  ctx.globalCompositeOperation = "destination-out";
  ctx.restore();
  ctx.fillStyle = neon ? "#402956" : "#99617c";
  for (let i = 0; i < 22; i++) {
    const bw = w / 24;
    const bh = h * (0.08 + noise(i * 6 + 2) * 0.2);
    ctx.fillRect(x + i * bw * 1.15, y + h * 0.73 - bh, bw, bh);
  }
  ctx.fillStyle = "#37304d";
  for (let i = 0; i < 16; i++) {
    const bw = w / 19;
    const bh = h * (0.09 + noise(i * 5 + 10) * 0.25);
    const bx = x + i * bw * 1.2,
      by = y + h * 0.78 - bh;
    ctx.fillRect(bx, by, bw, bh);
    if (i % 4 === 0) {
      ctx.fillRect(bx + bw * 0.28, by - h * 0.05, bw * 0.44, h * 0.06);
      ctx.fillRect(bx + bw * 0.46, by - h * 0.11, bw * 0.07, h * 0.07);
    }
    ctx.fillStyle = "#ffcf9c";
    for (let wy = by + h * 0.025; wy < y + h * 0.77; wy += h * 0.027) {
      for (let wx = bx + bw * 0.17; wx < bx + bw * 0.85; wx += bw * 0.3) {
        if (noise(wx + wy) > 0.35) ctx.fillRect(wx, wy, bw * 0.095, h * 0.008);
      }
    }
    ctx.fillStyle = "#37304d";
  }
  // A tiny low-flying silhouette gives the illustrated inset a sense of scale.
  if (details) {
    ctx.save();
    ctx.translate(x + w * 0.58, y + h * 0.19);
    ctx.rotate(-0.12);
    ctx.fillStyle = "#34213c";
    ctx.beginPath();
    ctx.moveTo(-w * 0.09, 0);
    ctx.lineTo(-w * 0.01, -h * 0.009);
    ctx.lineTo(w * 0.025, -h * 0.065);
    ctx.lineTo(w * 0.038, -h * 0.064);
    ctx.lineTo(w * 0.02, -h * 0.005);
    ctx.lineTo(w * 0.085, 0);
    ctx.lineTo(w * 0.022, h * 0.01);
    ctx.lineTo(w * 0.035, h * 0.045);
    ctx.lineTo(w * 0.022, h * 0.043);
    ctx.lineTo(-w * 0.01, h * 0.01);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }
  const sea = ctx.createLinearGradient(0, y + h * 0.78, 0, y + h);
  sea.addColorStop(0, "#527c88");
  sea.addColorStop(1, "#172a48");
  ctx.fillStyle = sea;
  ctx.fillRect(x, y + h * 0.78, w, h * 0.22);
  ctx.strokeStyle = "#e2b69b";
  ctx.globalAlpha = 0.5;
  ctx.lineWidth = 0.7;
  for (let i = 0; i < 20; i++) {
    const yy = y + h * (0.8 + i * 0.011);
    const ww = w * (0.08 + noise(i + 55) * 0.4);
    ctx.beginPath();
    ctx.moveTo(sunX - ww * 0.5, yy);
    ctx.lineTo(sunX + ww * 0.5, yy);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
  if (details) {
    drawPalm(ctx, x + w * 0.16, y + h * 1.05, h * 0.9, 0.06);
    drawPalm(ctx, x + w * 0.96, y + h * 1.01, h * 1.03, -0.14);
    drawPalm(ctx, x + w * 0.84, y + h * 0.99, h * 0.6, -0.07);
  }
  ctx.restore();
}
function noise(n) {
  const v = Math.sin(n * 127.1 + 13.7) * 43758.5453;
  return v - Math.floor(v);
}
function trackedText(
  ctx,
  text,
  x,
  y,
  size,
  spacing = 2,
  align = "left",
  color = "#f6e5c8",
) {
  ctx.save();
  ctx.font = `700 ${size}px Arial, Helvetica, sans-serif`;
  ctx.fillStyle = color;
  const chars = Array.from(text);
  const widths = chars.map((c) => ctx.measureText(c).width);
  const width =
    widths.reduce((a, b) => a + b, 0) + Math.max(0, chars.length - 1) * spacing;
  if (align === "center") x -= width / 2;
  else if (align === "right") x -= width;
  for (let i = 0; i < chars.length; i++) {
    ctx.fillText(chars[i], x, y);
    x += widths[i] + spacing;
  }
  ctx.restore();
  return width;
}
function drawRoleTag(ctx, text, x, y, maxWidth, angle = 0, accent = "#efaf96") {
  if (!text) return;
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  ctx.font = "bold 10px Arial";
  const width = Math.min(maxWidth, ctx.measureText(text).width + 26);
  ctx.fillStyle = "#121322";
  ctx.fillRect(-2, -14, width, 21);
  ctx.strokeStyle = accent;
  ctx.lineWidth = 0.8;
  ctx.strokeRect(-2, -14, width, 21);
  trackedText(ctx, text, 8, 0, 8, 1, "left", "#ffe7c3");
  ctx.fillStyle = accent;
  ctx.fillRect(-2, 7, width * 0.2, 2);
  ctx.restore();
}
function drawBurstSeal(ctx, x, y, r, year) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(0.13);
  ctx.beginPath();
  for (let i = 0; i < 48; i++) {
    const a = (i * Math.PI) / 24,
      rr = i % 2 ? r : r * 0.9;
    const px = Math.cos(a) * rr,
      py = Math.sin(a) * rr;
    i ? ctx.lineTo(px, py) : ctx.moveTo(px, py);
  }
  ctx.closePath();
  ctx.fillStyle = "#f1c18f";
  ctx.fill();
  ctx.lineWidth = 2;
  ctx.strokeStyle = "#161624";
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(0, 0, r * 0.79, 0, Math.PI * 2);
  ctx.lineWidth = 0.8;
  ctx.stroke();
  trackedText(
    ctx,
    "AFTER DARK",
    0,
    -r * 0.25,
    r * 0.16,
    0.8,
    "center",
    "#252038",
  );
  ctx.font = `900 ${r * 0.55}px Arial`;
  ctx.fillStyle = "#252038";
  ctx.textAlign = "center";
  ctx.fillText(year || "2026", 0, r * 0.2);
  trackedText(ctx, "NO CURFEW", 0, r * 0.48, r * 0.13, 1, "center", "#252038");
  ctx.restore();
}
function drawStar(ctx, x, y, r) {
  ctx.beginPath();
  ctx.moveTo(x - r, y);
  ctx.quadraticCurveTo(x, y, x, y - r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.quadraticCurveTo(x, y, x, y + r);
  ctx.quadraticCurveTo(x, y, x - r, y);
  ctx.fill();
}
function drawBillingBlock(ctx, state, h, wide) {
  const y = h * 0.958;
  trackedText(
    ctx,
    `${state.edition || "SUNSET EDITION"}   /   AN AFTER HOURS ORIGINAL`,
    500,
    y,
    wide ? 6.6 : 7.1,
    1.65,
    "center",
    "#c8a9a3",
  );
  const line =
    "A LOCAL PICTURE  •  STARRING YOU  •  ART DIRECTION: AFTER HOURS  •  SHOT ON YOUR TERMS";
  trackedText(
    ctx,
    line,
    500,
    y + 6.4,
    wide ? 5.0 : 5.6,
    wide ? 1.15 : 0.8,
    "center",
    "#8f828c",
  );
}
function drawFilmGrain(ctx, w, h) {
  ctx.save();
  ctx.globalAlpha = 0.065;
  for (let i = 0; i < 10500; i++) {
    const x = noise(i * 2) * w,
      y = noise(i * 2 + 1) * h;
    ctx.fillStyle = i % 2 ? "#fff2d0" : "#0d1027";
    ctx.fillRect(x, y, 0.5 + noise(i + 3) * 0.8, 0.6);
  }
  ctx.restore();
}
export function renderPoster(
  canvas,
  state,
  photos,
  gradedPhotos,
  format = state.format,
) {
  const [W, H] = FORMATS[format];
  if (canvas.width !== W) canvas.width = W;
  if (canvas.height !== H) canvas.height = H;
  const ctx = canvas.getContext("2d");
  ctx.setTransform(W / 1000, 0, 0, W / 1000, 0, 0);
  const w = 1000,
    h = (H / W) * 1000,
    wide = format === "landscape";
  ctx.fillStyle = "#121320";
  ctx.fillRect(0, 0, w, h);
  const base = ctx.createLinearGradient(0, 0, w, h);
  base.addColorStop(0, "#49314e");
  base.addColorStop(0.52, "#1b1d31");
  base.addColorStop(1, "#6e3d57");
  ctx.fillStyle = base;
  ctx.fillRect(9, 9, w - 18, h - 18);
  const shapes = panelPolygons(state.layout, format);
  for (let i = 0; i < shapes.length; i++) {
    const polygon = polygonPath(shapes[i], w, h),
      b = panelBounds(shapes[i], w, h),
      panel = state.panels[i];
    ctx.save();
    ctx.clip(polygon);
    const photo = panel && gradedPhotos[panel.photo];
    if (photo) fitPhotoToPanel(ctx, photo, b, panel);
    else drawSkyline(ctx, b, state.grade, state.details);
    const tint = ctx.createLinearGradient(b.x, b.y, b.x + b.w, b.y + b.h);
    tint.addColorStop(0, state.grade === "neon" ? "#b043a92b" : "#ffb78316");
    tint.addColorStop(0.5, "#ff7b9505");
    tint.addColorStop(1, "#18142c33");
    ctx.fillStyle = tint;
    ctx.globalCompositeOperation = "soft-light";
    ctx.fillRect(b.x, b.y, b.w, b.h);
    ctx.globalCompositeOperation = "source-over";
    const shade = ctx.createLinearGradient(0, b.y, 0, b.y + b.h);
    shade.addColorStop(0, "#15152a00");
    shade.addColorStop(0.55, "#11132a00");
    shade.addColorStop(1, "#101329a8");
    ctx.fillStyle = shade;
    ctx.fillRect(b.x, b.y, b.w, b.h);
    if (state.ink) {
      ctx.globalAlpha = 0.1;
      ctx.fillStyle = "#ffe6b6";
      for (let yy = b.y + 5; yy < b.y + b.h; yy += 5) {
        for (let xx = b.x + 4; xx < b.x + Math.min(b.w * 0.12, 30); xx += 5) {
          ctx.beginPath();
          ctx.arc(xx, yy, 0.6, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.globalAlpha = 1;
    }
    ctx.restore();
    ctx.lineJoin = "miter";
    ctx.lineWidth = 8;
    ctx.strokeStyle = "#111320";
    ctx.stroke(polygon);
    ctx.lineWidth = 1.1;
    ctx.strokeStyle = "#f9c6a1";
    ctx.stroke(polygon);
  }
  // Small typography belongs to the cover itself, never to a screenshot overlay.
  trackedText(
    ctx,
    "AFTER HOURS PICTURE CO.",
    31,
    h * 0.047,
    wide ? 8 : 8.5,
    2.1,
    "left",
    "#f6d6b1",
  );
  trackedText(
    ctx,
    "VOL. 01  /  " + (state.year || "2026"),
    968,
    h * 0.047,
    wide ? 8 : 8.5,
    2,
    "right",
    "#f6d6b1",
  );
  const topY = h * 0.047;
  trackedText(
    ctx,
    "A SUNSET STATE OF MIND",
    515,
    topY,
    wide ? 7 : 7.5,
    2,
    "center",
    "#e8bca7",
  );
  if (state.details) {
    if (wide) {
      drawLocationPlate(
        ctx,
        753,
        h * 0.131,
        "SOUTH COAST",
        "25°46′ N  /  80°12′ W",
      );
      drawRoleTag(ctx, state.panels[0].role, 46, h * 0.56, 200, -0.08);
      drawRoleTag(ctx, state.panels[1].role, 390, h * 0.51, 240, 0.015);
      drawRoleTag(ctx, state.panels[3].role, 808, h * 0.86, 150, -0.05);
      drawRoleTag(ctx, state.panels[4].role, 46, h * 0.87, 180, -0.05);
      drawBurstSeal(ctx, 895, h * 0.56, 40, state.year);
    } else {
      drawRoleTag(ctx, state.panels[0].role, 45, h * 0.478, 270, -0.08);
      drawRoleTag(ctx, state.panels[1].role, 495, h * 0.53, 380, -0.015);
      drawRoleTag(ctx, state.panels[3].role, 758, h * 0.863, 180, -0.035);
      drawBurstSeal(ctx, 888, h * 0.645, 50, state.year);
    }
  }
  const lines = (state.caption || "YOUR\nSTORY")
    .split("\n")
    .map((x) => x.trim())
    .filter(Boolean)
    .slice(0, 2);
  if (lines.length === 1) {
    const ws = lines[0].split(" ");
    if (ws.length > 1) {
      const at = Math.ceil(ws.length / 2);
      lines[0] = ws.slice(0, at).join(" ");
      lines.push(ws.slice(at).join(" "));
    }
  }
  const titleCenter = wide ? 523 : 494;
  const titleWidth = wide ? 500 : 760;
  const titleTop = wide ? h * 0.595 : h * 0.633;
  const titleHeight = wide ? h * 0.115 : h * 0.102;
  if (lines.length > 1) {
    drawChromeLettering(
      ctx,
      lines[0],
      titleCenter,
      titleTop,
      titleWidth * 0.91,
      titleHeight,
      state.grade,
      state.finish,
    );
    drawChromeLettering(
      ctx,
      lines[1],
      titleCenter,
      titleTop + titleHeight * 1.09,
      titleWidth,
      titleHeight * 1.17,
      state.grade,
      state.finish,
    );
  } else
    drawChromeLettering(
      ctx,
      lines[0] || "STORY",
      titleCenter,
      titleTop + titleHeight * 0.3,
      titleWidth,
      titleHeight * 1.6,
      state.grade,
      state.finish,
    );
  const taglineY = h * 0.932;
  const tagline = state.tagline || "";
  const tagSize = Math.min(
    wide ? 9 : 10,
    (780 / Math.max(1, tagline.length)) * 1.4,
  );
  trackedText(
    ctx,
    tagline,
    500,
    taglineY,
    tagSize,
    wide ? 3 : 3.5,
    "center",
    "#f7d1b2",
  );
  if (state.details) {
    ctx.save();
    ctx.fillStyle = "#fbe8ba";
    drawStar(
      ctx,
      wide ? 740 : 840,
      titleTop + titleHeight * 0.1,
      wide ? 9 : 12,
    );
    drawStar(
      ctx,
      wide ? 290 : 131,
      titleTop + titleHeight * 1.88,
      wide ? 7 : 10,
    );
    ctx.restore();
    drawBillingBlock(ctx, state, h, wide);
  }
  drawFilmGrain(ctx, w, h);
  ctx.strokeStyle = "#efc09b";
  ctx.lineWidth = 1.15;
  ctx.strokeRect(14, 14, w - 28, h - 28);
  ctx.strokeStyle = "#ae826d";
  ctx.lineWidth = 0.6;
  ctx.strokeRect(18, 18, w - 36, h - 36);
  return { width: W, height: H, panels: shapes.length };
}
export function renderPanelThumbnail(canvas, panel, photo, gradeId) {
  canvas.width = 220;
  canvas.height = 110;
  const ctx = canvas.getContext("2d");
  if (photo) fitPhotoToPanel(ctx, photo, { x: 0, y: 0, w: 220, h: 110 }, panel);
  else drawSkyline(ctx, { x: 0, y: 0, w: 220, h: 110 }, gradeId, true);
  const g = ctx.createLinearGradient(0, 40, 0, 110);
  g.addColorStop(0, "#11132000");
  g.addColorStop(1, "#111320cc");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 220, 110);
}
export function hitTestPanel(canvas, x, y, state) {
  const ctx = canvas.getContext("2d");
  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  const shapes = panelPolygons(state.layout, state.format);
  let found = -1;
  shapes.forEach((p, i) => {
    if (ctx.isPointInPath(polygonPath(p, canvas.width, canvas.height), x, y))
      found = i;
  });
  ctx.restore();
  return found;
}
