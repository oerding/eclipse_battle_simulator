// import cloneDeep from "F:/Users/Tobias/programming/node_modules/lodash-es/cloneDeep.js";
import cloneDeep from "../node_modules/lodash-es/cloneDeep.js";
//weapons class

///////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////

const resize_element = function (item, width, height) {
  item.style.setProperty("width", width + "px");
  item.style.setProperty("heigth", height + "px");
};

function unpress() {
  fight.classList.remove("pressed");
}

function pressFight() {
  let defendingShips;
  fight.classList.add("pressed");
  const delay = 800;
  setTimeout(unpress, delay);
  let againstAncients = false;
  if (
    document.getElementById("changeButton").innerText ==
    "change to ancient ships"
  ) {
    defendingShips = generatePlayerShips("enemy");
  } else {
    defendingShips = generateAncientShips();
    againstAncients = true;
  }

  const attackingShips = generatePlayerShips("friendly");
  const defender = new fleet(...defendingShips);
  const attacker = new fleet(...attackingShips);
  console.log("defender", defender);
  console.log("attacker", attacker);

  const winPercentage = getWinPercentageAttackerAll(
    defender,
    attacker,
    10000,
    againstAncients
  );
  console.log(winPercentage);
  document.getElementById(
    "result-attacker"
  ).innerHTML = `<center>Attacker winchance <br> ${Math.round(
    winPercentage[1] * 100
  )}%</center>`;
  document.getElementById(
    "result-defender"
  ).innerHTML = `<center>Defender winchance <br> ${Math.round(
    (1 - winPercentage[1]) * 100
  )}%</center>`;
}
fight.addEventListener("click", function (event) {
  pressFight();
});

changeButton.addEventListener("click", function (e) {
  if (this.innerText == "change to ancient ships") {
    this.innerText = "change to player ships";
    document.getElementById("enemy").classList.add("invisible");
    document.getElementById("guardian-enemy").classList.remove("invisible");
  } else {
    this.innerText = "change to ancient ships";
    document.getElementById("enemy").classList.remove("invisible");
    document.getElementById("guardian-enemy").classList.add("invisible");
  }
});

///////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////

class ship {
  constructor(
    initiative = 0,
    hull = 0,
    tracking = 0,
    evasion = 0,
    weapons = [0, 0, 0, 0, 0, 0]
  ) {
    this.initiative = initiative;
    this.hull = hull;
    this.tracking = tracking;
    this.evasion = evasion;
    this.weapons = weapons; //cannon 1-4,, missile 1-2
    //bsp: weapons=[1,0,0,0,0,1] ist 1 ioncannon 1 plasmamissile
    this.missilesShot = 0;
    this.possibleHitCannon1 = [];
    this.possibleHitCannon2 = [];
    this.possibleHitCannon3 = [];
    this.possibleHitCannon4 = [];
    this.possibleHitMissile1 = [];
    this.possibleHitMissile2 = [];
  }

  shootWeapons() {
    //reset previous shot
    this.possibleHitCannon1 = [];
    this.possibleHitCannon2 = [];
    this.possibleHitCannon3 = [];
    this.possibleHitCannon4 = [];
    this.possibleHitMissile1 = [];
    this.possibleHitMissile2 = [];
    this.weapons.forEach(
      function (val, i) {
        for (let j = 0; j < val; j++) {
          let dice = Math.floor(Math.random() * 6 + 1 + this.tracking);
          if (dice > 5) {
            if (dice == 6 + this.tracking) dice = -1; //a direct hit is a -1
            switch (i + 1) {
              case 1:
                this.possibleHitCannon1.push(dice);
                break;
              case 2:
                this.possibleHitCannon2.push(dice);
                break;
              case 3:
                this.possibleHitCannon3.push(dice);
                break;
              case 4:
                this.possibleHitCannon4.push(dice);
                break;
              case 5:
                if (this.missilesShot == 0) {
                  this.possibleHitMissile1.push(dice); //got second dice
                  dice = Math.floor(Math.random() * 6 + 1 + this.tracking);
                  if (dice > 5) {
                    if (dice == 6 + this.tracking) dice = -1;
                    this.possibleHitMissile1.push(dice);
                  }
                }
                break;
              case 6:
                if (this.missilesShot == 0) {
                  this.possibleHitMissile2.push(dice);
                  dice = Math.floor(Math.random() * 6 + 1 + this.tracking);
                  if (dice > 5) {
                    if (dice == 6 + this.tracking) dice = -1;
                    this.possibleHitMissile2.push(dice);
                  }
                }
                break;
            }
          }
        }
      }.bind(this)
    );
    this.missilesShot = 1;

    return this;
  }
}

class fleet {
  constructor(interceptor = [], cruiser = [], dreadnought = [], starbase = []) {
    this.interceptor = interceptor || [];
    this.cruiser = cruiser || [];
    this.dreadnought = dreadnought || [];
    this.starbase = starbase || [];
    this.shipTypes = [];
    this.setShipTypes();
    //enageOne are all the ships with highest initative etc.
    this.engageOne = [];
    this.engageTwo = [];
    this.engageThree = [];
    this.engageFour = [];

    this.initiatives = [
      (this.interceptor.length > 0 && this.interceptor[0].initiative) || 0,
      (this.cruiser.length > 0 && this.cruiser[0].initiative) || 0,
      (this.dreadnought.length > 0 && this.dreadnought[0].initiative) || 0,
      (this.starbase.length > 0 && this.starbase[0].initiative) || 0,
    ];
    this.setEngage();

    //the dice rolls the attacking ship do with atleast 6 in an engagement round
    this.possibleHitCannon1 = [];
    this.possibleHitCannon2 = [];
    this.possibleHitCannon3 = [];
    this.possibleHitCannon4 = [];
    this.possibleHitMissile1 = [];
    this.possibleHitMissile2 = [];
    this.missileRound = 1; //the first round of battle is when only missiles are allowed to fire

    //the dice rolls that actually hit a certain shipttype in an engagement round
    this.hitInterceptor = []; //ex. [1,4,2] one 1 die one 4 die and one 2 die hit
    this.hitCruiser = [];
    this.hitDreadnought = [];
    this.hitStarbase = [];
  }
  getShipType(index) {
    let ships = [];
    for (let i = 0; i < index.length; i++) {
      switch (index[i]) {
        case 0:
          ships.push(this.interceptor);
          continue;
        case 1:
          ships.push(this.cruiser);
          continue;
        case 2:
          ships.push(this.dreadnought);
          continue;
        case 3:
          ships.push(this.starbase);
          continue;
      }
    }
    return ships;
  }

  setShipTypes() {
    for (ship of ["starbase", "dreadnought", "cruiser", "interceptor"]) {
      if (this[ship].length > 0) this.shipTypes.push(ship);
    }
  }

  resetEngage() {
    this.engageOne = [];
    this.engageTwo = [];
    this.engageThree = [];
    this.engageFour = [];
  }
  setEngage() {
    this.resetEngage();
    let tempInitiatives = Array.from(this.initiatives);
    for (const engage of [
      "engageOne",
      "engageTwo",
      "engageThree",
      "engageFour",
    ]) {
      let ships = this.getShipType(
        getAllIndex(tempInitiatives, Math.max(...tempInitiatives))
      );
      for (let i = 0; i < ships.length; i++) {
        for (let j = 0; j < ships[i].length; j++)
          this[engage].push(ships[i][j]);
      }
      tempInitiatives = deleteAllIndex(
        tempInitiatives,
        Math.max(...tempInitiatives)
      );
    }
  }
  //sums the possible hits of each ship in egagement round up.
  countPossibleCannonHits(engage) {
    for (let ship of engage) {
      ship.shootWeapons();
      for (let i = 1; i < 5; i++)
        this[`possibleHitCannon${i}`].push(...ship[`possibleHitCannon${i}`]);
    }
  }

  //does the calculation which possibleHit actually hits what ship. If a possibleHit does not hit the particular ship then it sets the number in the hit"ship" array as 0.
  countCannonHits(engage, enemy, shipKillPriority) {
    this.countPossibleCannonHits(engage);
    for (const ship of shipKillPriority) {
      //define hit priority by shiptype
      //check which possibleHits actually hit that type
      for (let j = 0; j < 4; j++) {
        //go through all weapon types and check the hits
        this[`hit${capitalizeFirstLetter(ship)}`] = this[
          `hit${capitalizeFirstLetter(ship)}`
        ].concat(
          this[`possibleHitCannon${j + 1}`].map((dice) => {
            if (
              enemy[`${ship}`].length == 0 ||
              dice == -1 ||
              dice - enemy[`${ship}`][0].evasion > 5
            )
              return j + 1;
            else {
              return 0;
            }
          })
        );
      }
    }
  }

  countPossibleMissileHits(engage) {
    for (let ship of engage) {
      ship.shootWeapons();
      for (let i = 1; i < 3; i++)
        this[`possibleHitMissile${i}`].push(...ship[`possibleHitMissile${i}`]);
    }
  }

  countMissileHits(engage, enemy, shipKillPriority) {
    this.countPossibleMissileHits(engage);
    for (const ship of shipKillPriority) {
      //define hit priority by shiptype
      //check which possibleHits actually hit that type
      for (let j = 0; j < 2; j++) {
        //go through all weapon types and check the hits
        this[`hit${capitalizeFirstLetter(ship)}`] = this[
          `hit${capitalizeFirstLetter(ship)}`
        ].concat(
          this[`possibleHitMissile${j + 1}`].map((dice) => {
            if (
              enemy[`${ship}`].length == 0 ||
              dice == -1 ||
              dice - enemy[`${ship}`][0].evasion > 5
            )
              return j + 1;
            else {
              return 0;
            }
          })
        );
      }
    }
  }
  resetHits() {
    this.possibleHitCannon1 = [];
    this.possibleHitCannon2 = [];
    this.possibleHitCannon3 = [];
    this.possibleHitCannon4 = [];
    this.possibleHitMissile1 = [];
    this.possibleHitMissile2 = [];
    this.hitInterceptor = [];
    this.hitCruiser = [];
    this.hitDreadnought = [];
    this.hitStarbase = [];
  }
  //Strategien:
  //withOverkill: gehe die Priotirätenliste der Schiffe herunter und kill anhand dieser schiffe mit möglichst geringen dice. Achte nicht ob es overkill gibt

  //noOverkill: Wie withOverkill, aber bevor ein overkill committed wird checke ob die würfe auch andere Schiffe töten könnten, ohne overkill - falls ja töte diese.

  //retreat: Nach der ersten Kampfrunde ziehen sich alle schiffe zurück. Insbesondere für raketenschiffe interessant.
  oneEngagementRound(
    engagedShips,
    enemy,
    shipKillPriority = enemy.shipTypes,
    strategy
  ) {
    this.resetHits();
    if (this.missileRound) {
      this.countMissileHits(engagedShips, enemy, shipKillPriority);
    } else {
      this.countCannonHits(engagedShips, enemy, shipKillPriority);
    }

    this.deleteHits(enemy);
    return this.assignHits(enemy, strategy, shipKillPriority);
  }

  hasMissile(engagedShips) {
    for (const ship of engagedShips) {
      if (ship.missilesShot == 0) return true;
    }
    return false;
  }

  assignHits(enemy, strategy = "standard", shipKillPriority = enemy.shipTypes) {
    //geh gegnerschifftypen durch und assigne anhand dessen hits
    for (ship of shipKillPriority) {
      if (enemy[ship].length == 0) continue;
      let hitDice = 0;
      let dmg = 0;
      let hitsOnEnemy = [];

      while (hitDice != null && enemy[ship].length > 0) {
        //only empty ships have hull 0
        //hit Dice is the distribution of hit to kill the ship
        //if there is no way to kill the ship it returns null
        hitDice = this.getHits(ship, enemy[ship][0].hull);
        //falls Schiff gekillt, dann lösche das schiff und die hits.
        if (hitDice != null) {
          //falls letztes schiff gekillt wurde muss priority aktualisiert werden
          shipKillPriority = enemy.deleteShip(ship, shipKillPriority);
          if (enemy.shipTypes.length == 0) return ["WIN", shipKillPriority]; //der kampf ist gewonnen

          this.deleteHits(enemy, hitDice);
        }
      }
      //strategy focus: only deal dmg to the ship first in shipkillPriority.
      //Even if other ships could be killed.
      //But there might be hits that cannot hit the focused ship, thus deplete all possible hits for the focused ship here and then move on
      if (strategy == "focus" && enemy[ship].length > 0) {
        hitDice = this.getRestHits(ship);
        hitsOnEnemy = this[`hit${capitalizeFirstLetter(ship)}`];
        dmg = multArrays(hitsOnEnemy, hitDice).reduce((pv, qv) => pv + qv, 0);
        enemy[ship][0].hull -= dmg;
        this.deleteHits(enemy, hitDice);
      }
    }
    //all the damage that is left is dealt to the ships according to highest kill priority
    this.dealRestDamage(enemy, shipKillPriority);

    return ["next round", shipKillPriority];
  }

  dealRestDamage(enemy, shipKillPriority) {
    for (let ship of shipKillPriority) {
      if (enemy[ship].length == 0) continue; //deal no dmg to empty ships
      enemy[ship][0].hull -= this[`hit${capitalizeFirstLetter(ship)}`].reduce(
        (pv, cv) => pv + cv,
        0
      );
      this.deleteHits(enemy, this[`hit${capitalizeFirstLetter(ship)}`]);
    }
  }
  deleteShip(ship, shipKillPriority) {
    this[ship].shift();
    //if last ship was killed replace it with an empty ship.
    if (this[ship].length == 0) {
      this.shipTypes = this.shipTypes.filter((v) => v != ship);
      shipKillPriority = shipKillPriority.filter((v) => v != ship); //die Schiffsklasse ist komplett vernichtet
    }

    //update the engage order
    this.setEngage();

    return shipKillPriority;
  }

  deleteHits(enemy, distribution = []) {
    //Delete all hits if every enemy ship is evading them.
    //If a distribution is gioven e.g [0,0,1,0,0,1,0] then all index with 1 are also deleted
    //for easier use distributions like [0,0,2,0,0,1,0] are also accepted
    for (
      let i =
        this[`hit${capitalizeFirstLetter(enemy.shipTypes[0])}`].length - 1;
      i >= 0;
      i--
    ) {
      if (
        ((this.hitInterceptor.length == 0 || this.hitInterceptor[i] == 0) &&
          (this.hitCruiser.length == 0 || this.hitCruiser[i] == 0) &&
          (this.hitDreadnought.length == 0 || this.hitDreadnought[i] == 0) &&
          (this.hitStarbase.length == 0 || this.hitStarbase[i] == 0)) ||
        distribution[i] > 0
      ) {
        for (let ship of enemy.shipTypes) {
          this[`hit${capitalizeFirstLetter(ship)}`] = deleteArrayIndex(
            this[`hit${capitalizeFirstLetter(ship)}`],
            i
          );
        }
      }
    }
  }

  getHits(enemyShipType, enemyShipHull) {
    const hitsOnEnemy = this[`hit${capitalizeFirstLetter(enemyShipType)}`];
    //generiere die kombination an Waffen welche das Schiff töten. Strategie:
    //1. Wähle die erste gefundene Kombination ohne overkill
    //2. Sonst gehe in chooseFromDistribution und wäjle nach gegebener Strategie aus
    let distribution;
    const possibleDistributions = new Array(0);
    let dmg;
    if (hitsOnEnemy.reduce((pv, cv) => pv + cv, 0) < enemyShipHull) return null;
    for (let i = 1; i <= hitsOnEnemy.length; i++) {
      distribution = generateStartingDistribution(i, hitsOnEnemy.length);
      while (distribution != 0) {
        const distribution_temp = [...distribution];
        //check if distribution is kill
        dmg = multArrays(hitsOnEnemy, distribution).reduce(
          (pv, qv) => pv + qv,
          0
        );
        if (dmg == enemyShipHull) return distribution_temp;
        if (dmg > enemyShipHull) {
          possibleDistributions.push(distribution_temp);
        }
        distribution = increment(distribution);
      }
    }
    return this.chooseFromDistributions(possibleDistributions, hitsOnEnemy);
  }

  getRestHits(enemyShipType) {
    const hitsOnEnemy = this[`hit${capitalizeFirstLetter(enemyShipType)}`];
    return hitsOnEnemy.map((v) => {
      if (v > 0) return 1;
      return 0;
    });
  }

  chooseFromDistributions(distributions, hits, strategy = "standard") {
    //distributions gibt alle distributions an welche das Schiff töten könnten.
    //hits gibt an welche Hits gegen das Schiff möglich sind, also etwa
    //[1,1,0,0,2] wären 2*1hit und 1*2hits, wobei das schiff den beiden anderen Schüssen ausweicht
    //Standard Strategie:
    //2. Wähle die gefundene Version mit möglichst kleinem Overkill
    //2.1 Es werden weniger würfel bei Gleichstand bevorzugt
    let currentBestDistributions = [];
    let dmg_best = 9999;
    let dmg_new;
    for (let distribution of distributions) {
      dmg_new = multArrays(distribution, hits).reduce((pv, cv) => pv + cv, 0);
      if (dmg_new < dmg_best) {
        currentBestDistributions = [distribution];
        dmg_best = dmg_new;
      }
      if (dmg_new == dmg_best) currentBestDistributions.push(distribution);
    }
    return currentBestDistributions[0];
  }
}

//helper functions
const deleteArrayIndex = function (arr, index) {
  return arr.filter((v, i) => i != index);
};

const capitalizeFirstLetter = function (string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
};

const getAllIndex = function (arr, val) {
  if (val == -1) return [];
  let indexes = [];
  for (let i = 0; i < arr.length; i++) if (arr[i] == val) indexes.push(i);
  return indexes;
};

const deleteAllIndex = function (arr, val) {
  for (let i = 0; i < arr.length; i++) if (arr[i] == val) arr[i] = -1;
  return arr;
};

const multArrays = function (arr1, arr2) {
  if (arr1.length != arr2.length) console.log("arrays not same length");
  let arr3 = [];
  for (let i = 0; i < arr1.length; i++) {
    arr3.push(arr1[i] * arr2[i]);
  }
  return arr3;
};

// function to get the subsets incrementally

const increment = function (number) {
  let firstOne = -1; //gibt den index der ersten 1 von rechts an
  let firstZero = -1; //gibt den index der ersten 0 nach der ersten 1 an von rechts
  let secondOne = -1; //gibt den index der ersten 1 nach der ersten Onestreak an
  for (let i = number.length - 1; i > -1; i--) {
    if (number[i] == 1 && firstOne == -1) {
      firstOne = i;
    }
    if (number[i] == 0 && firstZero == -1 && firstOne != -1) {
      firstZero = i;
    }
    if (number[i] == 1 && firstZero != -1) {
      secondOne = i;
      break;
    }
  }
  if (secondOne == -1 && firstOne == number.length - 1) {
    return 0;
  } //dann ist die letzte kombination erreicht

  const oneStreak = firstOne - firstZero; //gibt an wie viele 1en direkt an der ersten 1 hängen.
  //falls die erste eins schon ganz hinten ist verschiebe die ganze oneStreak entsprechend
  if (firstOne == number.length - 1) {
    if (secondOne > -1) number[secondOne] = 0;
    for (let j = secondOne + 1; j < number.length; j++) {
      if (j < secondOne + 1 + oneStreak + 1) {
        number[j] = 1;
      } else {
        number[j] = 0;
      }
    }
  } else {
    //sonsr schiebe die erste 1 einen nach rechts
    number[firstOne] = 0;
    number[firstOne + 1] = 1;
  }
  return number;
};

const setCharAt = function (str, index, chr) {
  if (index > str.length - 1) return str;
  return str.substring(0, index) + chr + str.substring(index + 1);
};

const generateStartingDistribution = function (numberOfOnes, length) {
  let result = new Array(length).fill(0);
  for (let i = 0; i < numberOfOnes; i++) {
    result[i] = 1;
  }
  return result;
};

const permute = function (permutation) {
  const length = permutation.length;
  let result = [permutation.slice()];
  let c = new Array(length).fill(0);
  let i = 1;
  let k;
  let p;

  while (i < length) {
    if (c[i] < i) {
      k = i % 2 && c[i];
      p = permutation[i];
      permutation[i] = permutation[k];
      permutation[k] = p;
      ++c[i];
      i = 1;
      result.push(permutation.slice());
    } else {
      c[i] = 0;
      ++i;
    }
  }
  return result;
};

///////////////////////////////////
//Battle

/////////////////////////////////////

const getEngageOrder = function (friendly, enemy) {
  //friendly is the defender
  //get an array of arrays in the order of engaging ships
  let engageOrder = [];
  let notEngagedFriendly = [
    "engageOne",
    "engageTwo",
    "engageThree",
    "engageFour",
  ];
  let notEngagedEnemy = ["engageOne", "engageTwo", "engageThree", "engageFour"];
  while (true) {
    if (
      //only empty hulls have hull 0
      (notEngagedFriendly.length == 0 ||
        friendly[notEngagedFriendly[0]].length == 0) &&
      (notEngagedEnemy.length == 0 || enemy[notEngagedEnemy[0]].length == 0)
    )
      break;
    else if (
      notEngagedFriendly.length == 0 ||
      friendly[notEngagedFriendly[0]].length == 0
    ) {
      engageOrder.push(["enemy", notEngagedEnemy[0]]);
      notEngagedEnemy.shift();
    } else if (
      notEngagedEnemy.length == 0 ||
      enemy[notEngagedEnemy[0]].length == 0
    ) {
      engageOrder.push(["friendly", notEngagedFriendly[0]]);
      notEngagedFriendly.shift();
    } else if (
      friendly[notEngagedFriendly[0]][0].initiative >=
      enemy[notEngagedEnemy[0]][0].initiative
    ) {
      engageOrder.push(["friendly", notEngagedFriendly[0]]);
      notEngagedFriendly.shift();
    } else {
      engageOrder.push(["enemy", notEngagedEnemy[0]]);
      notEngagedEnemy.shift();
    }
  }
  return engageOrder;
};

const oneBattle = function (
  friendly,
  enemy,
  strategyEnemy,
  strategyFriendly,
  shipKillPriorityFriendly,
  shipKillPriorityEnemy
) {
  let engageOrder = getEngageOrder(friendly, enemy);
  const cloneFriendly = cloneDeep(friendly);
  const cloneEnemy = cloneDeep(enemy);
  let text;
  let winner = "next round";
  while (winner == "next round") {
    for (const engage of engageOrder) {
      if (engage[0] == "friendly") {
        [text, shipKillPriorityFriendly] = cloneFriendly.oneEngagementRound(
          cloneFriendly[engage[1]],
          cloneEnemy,
          shipKillPriorityFriendly,
          strategyFriendly
        );
        if (text == "WIN") {
          winner = "Defender";
          return winner;
        }
      } else if (engage[0] == "enemy") {
        [text, shipKillPriorityEnemy] = cloneEnemy.oneEngagementRound(
          cloneEnemy[engage[1]],
          cloneFriendly,
          shipKillPriorityEnemy,
          strategyEnemy
        );
        if (text == "WIN") {
          winner = "Attacker";
          return winner;
        }
      }
    }
    //after the first engage round the missiles are depleted
    cloneFriendly.missileRound = 0;
    cloneEnemy.missileRound = 0;
  }
};

const getWinPercentageAttackerOne = function (
  friendly,
  enemy,
  strategyEnemy,
  strategyFriendly,
  shipKillPriorityFriendly,
  shipKillPriorityEnemy,
  numberOfBattles = 100
) {
  let attackerWins = 0;
  let winner;
  for (let i = 0; i < numberOfBattles; i++) {
    winner = oneBattle(
      friendly,
      enemy,
      strategyEnemy,
      strategyFriendly,
      shipKillPriorityFriendly,
      shipKillPriorityEnemy
    );
    if (winner == "Attacker") {
      attackerWins++;
    }
  }
  return attackerWins / numberOfBattles;
};

const getWinPercentageAttackerAll = function (
  friendly,
  enemy,
  numberOfBattles = 100,
  againstAncients = false
) {
  //friendly=defender. enemy=attacker. NUmberOfBattles= number of battle simulations to get win percentage
  let attackerWinPercentageBest = 0;

  let attackerWinPercentageNew = [];
  let attackerWin = [];
  let attackerWinBest = 0;
  const permutationFriendly = permute(friendly.shipTypes);
  const permutationEnemy = permute(enemy.shipTypes);
  let enemyWinTactic = [permutationEnemy[0]];

  for (let strategyEnemy of ["standard", "focus"]) {
    for (let shipKillPriorityEnemy of permutationFriendly) {
      attackerWinPercentageNew = [];
      if (!againstAncients) {
        for (let strategyFriendly of ["standard", "focus"]) {
          for (let shipKillPriorityFriendly of permutationEnemy) {
            attackerWinPercentageNew.push(
              getWinPercentageAttackerOne(
                friendly,
                enemy,
                strategyEnemy,
                strategyFriendly,
                shipKillPriorityFriendly,
                shipKillPriorityEnemy,
                numberOfBattles
              )
            );
            attackerWin.push([
              attackerWinPercentageNew[attackerWinPercentageNew.length - 1],
              [shipKillPriorityFriendly, strategyFriendly],
              [shipKillPriorityEnemy, strategyEnemy],
            ]);
          }
          if (
            Math.min(...attackerWinPercentageNew) > attackerWinPercentageBest
          ) {
            enemyWinTactic = [shipKillPriorityEnemy, strategyEnemy];
            attackerWinBest = Math.min(...attackerWinPercentageNew);
          }
        }
      } else {
        attackerWinPercentageNew.push(
          getWinPercentageAttackerOne(
            friendly,
            enemy,
            strategyEnemy,
            "standard",
            ["starbase", "dreadnought", "cruiser", "interceptor"],
            shipKillPriorityEnemy,
            numberOfBattles
          )
        );
        attackerWin.push([
          attackerWinPercentageNew[attackerWinPercentageNew.length - 1],
          [["starbase", "dreadnought", "cruiser", "interceptor"], "standard"],
          [shipKillPriorityEnemy, strategyEnemy],
        ]);
        if (Math.min(...attackerWinPercentageNew) > attackerWinPercentageBest) {
          enemyWinTactic = [shipKillPriorityEnemy, strategyEnemy];
          attackerWinBest = Math.min(...attackerWinPercentageNew);
        }
      }
    }
  }
  //attacker win: returns array with arr[0] winpercentage for attacker. arr[1]/arr[2] win strategy for defender/attacker.
  return [attackerWin, attackerWinBest, enemyWinTactic];
};

const readFriendlyInterceptor = function () {
  let shipParts = [];
  let part;
  let ship = document.querySelector("#interceptor-friendly").children;
  for (let i = 0; i < ship.length; i++) {
    part = ship[i];
    if (part.children.length > 0) {
      shipParts.push(part.children[0].alt);
    }
  }
  return ["interceptor", shipParts];
};

const readEnemyInterceptor = function () {
  let shipParts = [];
  let part;
  let ship = document.querySelector("#interceptor-enemy").children;
  for (let i = 0; i < ship.length; i++) {
    part = ship[i];
    if (part.children.length > 0) {
      shipParts.push(part.children[0].alt);
    }
  }
  return ["interceptor", shipParts];
};

const readFriendlyCruiser = function () {
  let shipParts = [];
  let part;
  let ship = document.querySelector("#cruiser-friendly").children;
  for (let i = 0; i < ship.length; i++) {
    part = ship[i];
    if (part.children.length > 0) {
      shipParts.push(part.children[0].alt);
    }
  }
  return ["cruiser", shipParts];
};

const readEnemyCruiser = function () {
  let shipParts = [];
  let part;
  let ship = document.querySelector("#cruiser-enemy").children;
  for (let i = 0; i < ship.length; i++) {
    part = ship[i];
    if (part.children.length > 0) {
      shipParts.push(part.children[0].alt);
    }
  }
  return ["cruiser", shipParts];
};

const readFriendlyDreadnought = function () {
  let shipParts = [];
  let part;
  let ship = document.querySelector("#dreadnought-friendly").children;
  for (let i = 0; i < ship.length; i++) {
    part = ship[i];
    if (part.children.length > 0) {
      shipParts.push(part.children[0].alt);
    }
  }
  return ["dreadnought", shipParts];
};

const readEnemyDreadnought = function () {
  let shipParts = [];
  let part;
  let ship = document.querySelector("#dreadnought-enemy").children;
  for (let i = 0; i < ship.length; i++) {
    part = ship[i];
    if (part.children.length > 0) {
      shipParts.push(part.children[0].alt);
    }
  }
  return ["dreadnought", shipParts];
};

const readFriendlyStarbase = function () {
  let shipParts = [];
  let part;
  let ship = document.querySelector("#starbase-friendly").children;
  for (let i = 0; i < ship.length; i++) {
    part = ship[i];
    if (part.children.length > 0) {
      shipParts.push(part.children[0].alt);
    }
  }
  return ["starbase", shipParts];
};

const readEnemyStarbase = function () {
  let shipParts = [];
  let part;
  let ship = document.querySelector("#starbase-enemy").children;
  for (let i = 0; i < ship.length; i++) {
    part = ship[i];
    if (part.children.length > 0) {
      shipParts.push(part.children[0].alt);
    }
  }
  return ["starbase", shipParts];
};

const generateShip = function (shipType, shipParts) {
  //Initiative, Hull, Tracking, Evasion; Weapons (cannon1-4, missile1-2)
  let emptyShip = [0, 1, 0, 0, [0, 0, 0, 0, 0, 0]];
  //evasion for ShiptTypes
  if (shipType == "interceptor") emptyShip[0] += 2;
  if (shipType == "cruiser") emptyShip[0]++;
  if (shipType == "starbase") emptyShip[0] += 4;

  for (let part of shipParts) {
    //weapons
    if (part == "ion_cannon") emptyShip[4][0]++;
    if (part == "plasma_cannon") emptyShip[4][1]++;
    if (part == "soliton_cannon") emptyShip[4][2]++;
    if (part == "antimatter_cannon") emptyShip[4][3]++;
    if (part == "flux_missile") emptyShip[4][4]++;
    if (part == "plasma_missile") emptyShip[4][5]++;

    //power source
    if (part == "absorption_shield") emptyShip[3]++;

    //computer
    if (part == "electron_computer") {
      console.log("electron");
      emptyShip[2]++;
    }
    if (part == "positron_computer") emptyShip[2] += 2;
    if (part == "gluon_computer") emptyShip[2] += 3;
    if (part == "sentient_hull") {
      emptyShip[2] += 1;
      emptyShip[1] += 1;
      console.log("sentient");
    }
    //Hull
    if (part == "hull") emptyShip[1]++;
    if (part == "improved_hull") emptyShip[1] += 2;
    if (part == "conifold_field") emptyShip[1] += 3;

    //drives
    if (part == "nuclear_drive") emptyShip[0]++;
    if (part == "fusion_drive") emptyShip[0] += 2;
    if (part == "tachyon_drive") emptyShip[0] += 3;

    //evasion
    if (part == "gauss_shield") emptyShip[3]++;
    if (part == "phase_shield") emptyShip[3] += 2;
  }
  return emptyShip;
};

const generatePlayerShips = function (side) {
  let interceptor = [];
  let cruiser = [];
  let dreadnought = [];
  let starbase = [];
  for (const shipType of [
    "interceptor",
    "cruiser",
    "dreadnought",
    "starbase",
  ]) {
    if (side == "enemy") {
      if (shipType == "interceptor") {
        for (
          let i = 0;
          i < document.getElementById("input-enemy-interceptor").value;
          i++
        )
          interceptor.push(
            new ship(...generateShip(...readEnemyInterceptor()))
          );
      }
      if (shipType == "cruiser") {
        for (
          let i = 0;
          i < document.getElementById("input-enemy-cruiser").value;
          i++
        )
          cruiser.push(new ship(...generateShip(...readEnemyCruiser())));
      }
      if (shipType == "dreadnought") {
        for (
          let i = 0;
          i < document.getElementById("input-enemy-dreadnought").value;
          i++
        )
          dreadnought.push(
            new ship(...generateShip(...readEnemyDreadnought()))
          );
      }
      if (shipType == "starbase") {
        for (
          let i = 0;
          i < document.getElementById("input-enemy-starbase").value;
          i++
        )
          starbase.push(new ship(...generateShip(...readEnemyStarbase())));
      }
    }
    if (side == "friendly") {
      if (shipType == "interceptor") {
        for (
          let i = 0;
          i < document.getElementById("input-friendly-interceptor").value;
          i++
        )
          interceptor.push(
            new ship(...generateShip(...readFriendlyInterceptor()))
          );
      }
      if (shipType == "cruiser") {
        for (
          let i = 0;
          i < document.getElementById("input-friendly-cruiser").value;
          i++
        )
          cruiser.push(new ship(...generateShip(...readFriendlyCruiser())));
      }
      if (shipType == "dreadnought") {
        for (
          let i = 0;
          i < document.getElementById("input-friendly-dreadnought").value;
          i++
        )
          dreadnought.push(
            new ship(...generateShip(...readFriendlyDreadnought()))
          );
      }
      if (shipType == "starbase") {
        for (
          let i = 0;
          i < document.getElementById("input-friendly-starbase").value;
          i++
        )
          starbase.push(new ship(...generateShip(...readFriendlyStarbase())));
      }
    }
  }

  return [interceptor, cruiser, dreadnought, starbase];
};

const generateAncientShips = function () {
  let guardian = [];
  let ancient = [];
  let gcds = [];
  for (
    let i = 0;
    i < document.getElementById("input-ancient-guardian-1").value;
    i++
  ) {
    guardian.push(new ship(3, 3, 2, 0, [3, 0, 0, 0, 0, 0]));
  }
  for (
    let i = 0;
    i < document.getElementById("input-ancient-guardian-2").value;
    i++
  ) {
    ancient.push(new ship(2, 2, 1, 0, [2, 0, 0, 0, 0, 0]));
  }
  for (
    let i = 0;
    i < document.getElementById("input-ancient-guardian-3").value;
    i++
  ) {
    gcds.push(new ship(0, 8, 2, 0, [4, 0, 0, 0, 0, 0]));
  }
  return [guardian, ancient, gcds];
};

//    initiative = 0,
// hull = 0,
// tracking = 0,
// evasion = 0,
// weapons = [0, 0, 0, 0, 0, 0]

// const interceptor = new ship(1, 1, 0, 0, [1, 0, 0, 0, 0, 0]);
// const cruiser = new ship(2, 2, 1, 0, [1, 0, 0, 0, 0, 0]);
// const dreadnought = new ship(1, 1, 2, 1, [2, 0, 0, 0, 0, 0]);
// const ancient = new ship(2, 2, 1, 0, [2, 0, 0, 0, 0, 0]);
// const generic = new ship(0, 1, 0, 0, [1, 0, 0, 0, 0, 0]);

//const friendly = new fleet([interceptor, interceptor]);
//const enemy = new fleet([interceptor, interceptor, interceptor]);

// console.log(getWinPercentageAttackerAll(friendly, enemy, 1000));
