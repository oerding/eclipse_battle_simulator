// Set the size of the ship panels. Such that the ship parts are qudratic, the panel fills the whole screen width if coresponding the height is not greater than y% of the screen height. If it is too high, then it is set to exactly y%.

/* Damit sind die boxen quadratisch und passen sich der vw an 
    Die Boxen sind so groß, dass sie insgesamt genau den ganzen view ausfüllen
    Die höhe ist überall identisch, nur die breite ist beim Dreadnought einen mehr*/
const y = 0.2; //die maximale höhe des Ship panels
const set_size = function (y) {
  const vw = Math.max(
    document.documentElement.clientWidth || 0,
    window.innerWidth || 0
  );
  const vh = Math.max(
    document.documentElement.clientHeight || 0,
    window.innerHeight || 0
  );

  //check if height given full width is ok

  const blank = 0.002 * vw;
  //setze zunächst höhe durch y% anteil der höhe des BIldschirms fest
  //checke dann ob das bild dann zu groß und passe entsprechend an
  let allHeight = y * vh;
  const allWidth = (allHeight * 1280) / 262; //the size of the Background ship picture
  if (allWidth > vw) {
    allWidth = vw;
    allHeight = (262 / 1280) * allWidth;
  }
  const shipPartWidth = (45 / 710) * allWidth;
  const shipPartHeight = (45 / 144) * allHeight;
  const panelLeft = (vw - allWidth) / 2;

  set_properties(allHeight, allWidth, shipPartWidth, shipPartHeight, panelLeft);
};

const set_properties = function (
  allHeight,
  allWidth,
  shipPartWidth,
  shipPartHeight,
  panelLeft
) {
  document.documentElement.style.setProperty(`--all_height`, `${allHeight}px`);
  document.documentElement.style.setProperty(`--all_width`, `${allWidth}px`);
  document.documentElement.style.setProperty(
    `--ship_part_width`,
    `${shipPartWidth}px`
  );
  document.documentElement.style.setProperty(
    `--ship_part_height`,
    `${shipPartHeight}px`
  );
  document.documentElement.style.setProperty(`--panel_left`, `${panelLeft}px`);
};

set_size(y);
addEventListener("resize", () => set_size(y));

//SAVE//////////////////////////////

// // Set the size of the ship panels. Such that the ship parts are qudratic, the panel fills the whole screen width if coresponding the height is not greater than y% of the screen height. If it is too high, then it is set to exactly y%.

// /* Damit sind die boxen quadratisch und passen sich der vw an
//     Die Boxen sind so groß, dass sie insgesamt genau den ganzen view ausfüllen
//     Die höhe ist überall identisch, nur die breite ist beim Dreadnought einen mehr*/
//     const set_size = function (y) {
//       const vw = Math.max(
//         document.documentElement.clientWidth || 0,
//         window.innerWidth || 0
//       );
//       const vh = Math.max(
//         document.documentElement.clientHeight || 0,
//         window.innerHeight || 0
//       );

//       //check if height given full width is ok
//       const blank = 0.002 * vw;
//       let interceptorHeight = 0;
//       let interceptorWidth = (3 / 13) * (vw - blank); //dreadnought hat anteil 4/13
//       if ((10 / 9) * interceptorWidth < y * vh) {
//         //9/10 aufgrund des verhätnisses der ship parts
//         interceptorHeight = (10 / 9) * interceptorWidth;
//       } else {
//         interceptorHeight = y * vh;
//         interceptorWidth = (9 / 10) * interceptorHeight;
//       }
//       const dreadnoughtWidth = (4 / 3) * interceptorWidth;
//       const shipPartWidth = (3 / 10) * interceptorHeight;
//       const shippartHeight = (1 / 3) * interceptorWidth;
//       const allWidth = 3 * interceptorWidth + dreadnoughtWidth + 3 * blank;
//       const panelLeft = (vw - allWidth) / 2;
//       const cruiserLeft = blank + interceptorWidth;
//       const dreadnoughtLeft = 2 * blank + 2 * interceptorWidth;
//       const starbaseLeft = 2 * interceptorWidth + dreadnoughtWidth + 3 * blank;

//       set_properties(
//         interceptorHeight,
//         interceptorWidth,
//         dreadnoughtWidth,
//         allWidth,
//         shipPartWidth,
//         shippartHeight,
//         panelLeft,
//         blank,
//         cruiserLeft,
//         dreadnoughtLeft,
//         starbaseLeft
//       );
//     };

//     const set_properties = function (
//       interceptorHeight,
//       interceptorWidth,
//       dreadnoughtWidth,
//       allWidth,
//       shipPartWidth,
//       shippartHeight,
//       panelLeft,
//       blank,
//       cruiserLeft,
//       dreadnoughtLeft,
//       starbaseLeft
//     ) {
//       document.documentElement.style.setProperty(
//         `--interceptor_width`,
//         `${interceptorWidth}px`
//       );
//       document.documentElement.style.setProperty(
//         `--interceptor_height`,
//         `${interceptorHeight}px`
//       );
//       document.documentElement.style.setProperty(
//         `--dreadnought_width`,
//         `${dreadnoughtWidth}px`
//       );
//       document.documentElement.style.setProperty(`--all_width`, `${allWidth}px`);
//       document.documentElement.style.setProperty(
//         `--ship_part_width`,
//         `${shipPartWidth}px`
//       );
//       document.documentElement.style.setProperty(
//         `--ship_part_height`,
//         `${shippartHeight}px`
//       );
//       document.documentElement.style.setProperty(`--panel_left`, `${panelLeft}px`);
//       document.documentElement.style.setProperty(
//         `--cruiser_left`,
//         `${cruiserLeft}px`
//       );
//       document.documentElement.style.setProperty(
//         `--dreadnought_left`,
//         `${dreadnoughtLeft}px`
//       );
//       document.documentElement.style.setProperty(
//         `--starbase_left`,
//         `${starbaseLeft}px`
//       );
//     };
//     const y = 0.2; //die maximale höhe des Ship panels
//     set_size(y);
//     addEventListener("resize", () => set_size(y));
