'use strict';

const Alexa = require('alexa-sdk');
const APP_ID = "amzn1.ask.skill.9608708c-a9ff-441b-9659-0958592879e5";
const GAME_STATES = {
  START: '_STARTMODE', // entry point, setting up the game
  PLAY: '_PLAYMODE', // playing the game
  HELP: '_HELPMODE', // help the user
};

const GAME_NAME = "Oregon Trail";
const WELCOME_MESSAGE = "Welcome to the Oregon Trail Game!";
const START_GAME_MESSAGE = "It's 1836 in Independence, Missouri. You and your family have decided to become pioneers and travel the Oregon Trail.";
const EXIT_SKILL_MESSAGE = "Thanks for joining me on the Oregon Trail. Let's play again soon!";
const STOP_MESSAGE =  "Would you like to keep playing?";
const CANCEL_MESSAGE = "Ok, let's play again soon.";

const newSessionHandlers = {
  'LaunchRequest': function() {
    resetVariables.call(this); // ensure all variables have default, empty values to start
    this.handler.state = GAME_STATES.START;
    this.emitWithState('StartGame'); // TEST >> CHANGE TO LAUNCH FROM A DIFFERENT HANDLER >> default StartGame
  },
  'AMAZON.StartOverIntent': function() {
    resetVariables.call(this); // reset all variables to default empty values
    this.handler.state = GAME_STATES.START;
    this.emitWithState('StartGame');
  },
  'AMAZON.HelpIntent': function() {
    this.handler.state = GAME_STATES.HELP;
    this.emitWithState('helpTheUser', true);
  },
  'AMAZON.CancelIntent': function() {
    this.response.speak(EXIT_SKILL_MESSAGE);
    this.emit(":responseReady");
  },
  'AMAZON.StopIntent': function() {
    this.response.speak(EXIT_SKILL_MESSAGE);
    this.emit(":responseReady");
  },
  'Unhandled': function() {
    this.handler.state = GAME_STATES.START;
    this.emitWithState('StartGame');
  },
};



// ==============
// GAME VARIABLES
// ==============
var mainPlayer; // tracks the main player
var peopleHealthy = []; // tracks healthy people -- games starts with everyone in the party being healthy
var peopleSick = []; // tracks sick people as the game progresses
var profession; // main player's profession -- used for setup and final score bonus
var money = 0; // tracks player's total money
var food = 0; // tracks player's total food
var oxen = 0; // tracks player's total oxen
var parts = 0; // tracks player's total parts
var miles = 0; // tracks distance traveled on map
var extraMiles = 255; // tracks shortcuts
var month; // tracks starting month
var days = 0; // tracks calendar
var trailDays = 0; // tracks daily usage of supplies
var invalid; // tracks people as they get sick
var victim; // tracks people as they die
var daysWithoutFood = 0; // tracks how many days in a row there is no food -- could lead to starvation
var daysWithoutGrass = 0; // tracks how many days there is no grass -- could lead to oxen dying or wandering off
var mapLocation; // follows map choices at split trails
var alreadyTradedAtThisFort = false; // tracks trading at each fort
var fate; // adds randomness to the game and changes every day

// 1836 CALENDAR
function dateFrom1836(day){
  var date = new Date(1836, 0);
  return new Date(date.setDate(day));
}

// override Alexa's default persistence
var resetVariables = function () {
  mainPlayer = undefined;
  peopleHealthy.length = 0;
  peopleSick.length = 0;
  profession = undefined;
  money = 0;
  food = 0;
  oxen = 0;
  parts = 0;
  miles = 0;
  extraMiles = 255;
  month = undefined;
  days = 0;
  trailDays = 0;
  invalid = undefined;
  victim = undefined;
  daysWithoutFood = 0;
  daysWithoutGrass = 0;
  mapLocation = undefined;
  alreadyTradedAtThisFort = false;
  fate = 0;
};



// =============================
// SET UP THE STARTING VARIABLES
// =============================

// MAIN PLAYER
var gameIntro = function() {
  mapLocation = "Independence";
  this.response.speak(WELCOME_MESSAGE + " " + START_GAME_MESSAGE + " Let's begin by setting up your five-person party." + " " + "What is your name?").listen("What is your name?");
  this.response.cardRenderer(WELCOME_MESSAGE);
  this.emit(':responseReady');
};

// PARTY
var setupParty = function() {
  if (peopleHealthy.length === 1) {
    this.response.speak("Hello, " + mainPlayer + "! Name the second person in your party.").listen("Name the second person in your party.");
    this.emit(':responseReady');
  } else if (peopleHealthy.length === 2) {
    this.response.speak("Name the third person in your party.").listen("Name the third person in your party.");
    this.emit(':responseReady');
  } else if (peopleHealthy.length === 3) {
    this.response.speak("Name the fourth person in your party.").listen("Name the fourth person in your party.");
    this.emit(':responseReady');
  } else if (peopleHealthy.length === 4) {
    this.response.speak("Name the fifth person in your party.").listen("Name the fifth person in your party.");
    this.emit(':responseReady');
  } else {
    this.emitWithState('GetProfession');
  }
};

// PROFESSION
var askAgain = true;
var setupProfession = function() {
  if (profession === undefined) {
    profession = "carpenter"; // TODO change value to user's input
    this.response.speak("Great! Now let's choose your profession. You can be a banker, a carpenter, or a farmer. What do you want to be?").listen("You must choose to be a banker, a carpenter, or a farmer. What do you want to be?");
    this.response.cardRenderer("Banker (easy mode): Start with a lot of money, but receive zero bonus points.\nCarpenter (intermediate mode): Start with tools, supplies and some money, plus receive a few bonus points.\nFarmer (hard mode): Start with food, a few oxen and a little bit of money, and earn high bonus points.");
    this.emit(':responseReady');
  } else if (profession !== "banker" && profession !== "carpenter" && profession !== "farmer") {
    if (askAgain === true) {
      askAgain = false;
      profession = "carpenter"; // TODO change value to user's input
      this.response.speak("Sorry, you can only be a banker, a carpenter, or a farmer. What do you want to be?").listen("You must choose to be a banker, a carpenter, or a farmer. What do you want to be?");
      this.response.cardRenderer("Banker (easy mode): Start with a lot of money, but receive zero bonus points.\nCarpenter (intermediate mode): Start with tools, supplies and some money, plus receive a few bonus points.\nFarmer (hard mode): Start with food, a few oxen and a little bit of money, and earn high bonus points.");
      this.emit(':responseReady');
    } else {
      profession = "carpenter";
    }
  } else {
    this.emitWithState('GetHowManyItems');
  }
};

// =============
// GENERAL STORE
// =============
const GENERAL_STORE_MESSAGE = "Before leaving, you need to stock up on supplies. Let's go to the general store and buy food, oxen, and spare parts.";
const FOOD_REPROMPT = "Food costs 50 cents per pound. How many pounds of food do you want to buy?";
const OXEN_REPROMPT = "Each ox costs $50. How many oxen do you want to buy?";
const PARTS_REPROMPT = "Each spare part costs $30. How many spare parts do you want to buy?";
var TRY_BUYING_AGAIN;

var currentlyBuying;
var itemPrice = 0;
var boughtFood = false;
var boughtOxen = false;
var boughtParts = false;
var amountToBuy = 0;

var generalStore = function () {
  var buyFood = function() {
    currentlyBuying = "food";
    itemPrice = 0.5;
    TRY_BUYING_AGAIN = FOOD_REPROMPT;
    if (profession === "banker") {
      money += 1200;
      amountToBuy = 1000; // TODO change value to user's input
      this.response.speak("You are a banker. You have $" + money + ". " + GENERAL_STORE_MESSAGE + " We'll start with food. Food costs 50 cents per pound. I recommend at least 1,000 pounds. You currently have " + food + " pounds of food. How many pounds of food do you want to buy?").listen(FOOD_REPROMPT);
      this.response.cardRenderer("Your money: $" + money + "\nOne pound of food: 50 cents" + "\n\nYou currently have " + food + "pounds of food. It is recommend to start with at least 1,000 pounds.");
      this.emit(':responseReady');
    } else if (profession === "carpenter") {
      money += 800;
      parts += 4;
      amountToBuy = 1000; // TODO change value to user's input
      this.response.speak("You are a carpenter. You have $" + money + " and " + parts + " spare parts. " + GENERAL_STORE_MESSAGE + " We'll start with food. Food costs 50 cents per pound. I recommend 200 pounds of food per person, a total of 1,000 pounds. You currently have " + food + " pounds of food. How many pounds of food do you want to buy?").listen(FOOD_REPROMPT);
      this.response.cardRenderer("Your money: $" + money + "\nOne pound of food: 50 cents" + "\n\nYou currently have " + food + "pounds of food. It is recommend to start with at least 1,000 pounds.");
      this.emit(':responseReady');
    } else if (profession === "farmer") {
      money += 400;
      food += 500;
      oxen += 4;
      amountToBuy = 500; // TODO change value to user's input
      this.response.speak("You are a farmer. You have $" + money + ", " + food + " pounds of food, and " + oxen + " oxen. " + GENERAL_STORE_MESSAGE + " We'll start with food. Food costs 50 cents per pound. I recommend 200 pounds of food per person, a total of 1,000 pounds. You currently have " + food + " pounds of food. How many pounds of food do you want to buy?").listen(FOOD_REPROMPT);
      this.response.cardRenderer("Your money: $" + money + "\nOne pound of food: 50 cents" + "\n\nYou currently have " + food + " pounds of food. It is recommend to start with at least 1,000 pounds.");
      this.emit(':responseReady');
    }
  };

  var buyOxen = function() {
    currentlyBuying = "oxen";
    itemPrice = 50;
    amountToBuy = 4; // TODO change value to user's input
    TRY_BUYING_AGAIN = OXEN_REPROMPT;
    this.response.speak("You have $" + money + " left. Now let's buy oxen. You will need these oxen to pull your wagon. I recommend at least six oxen. Each ox costs $50. You currently have " + oxen + " oxen. How many oxen do you want to buy?").listen(OXEN_REPROMPT);
    this.response.cardRenderer("Your total money: $" + money + "\nOne ox: $50" + "\n\nYou current have " + oxen + "oxen. It is recommend to have at least 6 oxen.");
    this.emit(':responseReady');
  };

  var buyParts = function() {
    currentlyBuying = "parts";
    itemPrice = 30;
    amountToBuy = 2; // TODO change value to user's input
    TRY_BUYING_AGAIN = PARTS_REPROMPT;
    this.response.speak("You have $" + money + " left. Now let's buy spare parts. You will need these parts in case your wagon breaks down along the trail. I recommend at least three spare parts. You currently have " + parts + " spare parts. Each spare part costs $30. How many spare parts do you want to buy?").listen(PARTS_REPROMPT);
    this.response.cardRenderer("Your total money: $" + money + "\nOne spare part: $30" + "\n\nYou current have " + parts + "spare parts. It is recommend to have 3 spare parts.");
    this.emit(':responseReady');
  };

  if (boughtFood === false) {
    buyFood.call(this);
  } else if (boughtOxen === false) {
    buyOxen.call(this);
  } else if (boughtParts === false) {
    buyParts.call(this);
  } else {
     this.emitWithState('GetStartingMonth');
  }
};

var notEnoughMoney = function() {
  amountToBuy = 1; // TODO change value to user's input
  this.response.speak("Sorry, you only have $ " + money + ". " + TRY_BUYING_AGAIN).listen(TRY_BUYING_AGAIN);
  this.emit(':responseReady');
};

/*
  var buyMore = prompt("Money: $" + money + "\nFood: " + food + "\nOxen: " + oxen + "\nSpare parts: " + parts + "\n\nDo you want to buy anything else? Type 'yes' or 'no'.");
  if (buyMore === "yes") {
    goShopping();
  }
*/

// =============
// WHEN TO LEAVE
// =============
var chooseMonth = function() {
  month = "june"; // TODO change value to user's input
  this.response.speak("Great! You have " + food + " pounds of food, " + oxen + " oxen, and " + parts + " spare parts. You also have $" + money + " left in your pocket. " + peopleHealthy[1] + ", " + peopleHealthy[2] + ", " + peopleHealthy[3] + ", and " + peopleHealthy[4] + " are ready to go. When do you want to start your journey? Choose a month between March and August.").listen("You can start your journey in March, April, May, June, July, or August. Which month do you want?");
  this.response.cardRenderer("It's time to start your journey. You can begin anytime between March and August. If you start too soon, there won't be enough grass for your oxen to eat, and you may encounter late-spring snow storms. If you leave too late, you won't make it to Oregon before winter. Choose wisely!");
  this.emit(':responseReady');
};

var setDays = function() {
  if (month === "march") {
    days = 61;
    // TODO emit with state to begin game play
  } else if (month === "april") {
    days = 92;
    // TODO emit with state to begin game play
  } else if (month === "may") {
    days = 122;
    // TODO emit with state to begin game play
  } else if (month === "june") {
    days = 153;
    this.response.speak("Okay, let's go!"); // TODO delete this after deleting default month value
    this.emit(':responseReady'); // TODO delete this after deleting default month value
    // TODO emit with state to begin game play
  } else if (month === "july") {
    days = 183;
    // TODO emit with state to begin game play
  } else if (month === "august") {
    days = 214;
    // TODO emit with state to begin game play
  }
};



const startStateHandlers = Alexa.CreateStateHandler(GAME_STATES.START, {
  'StartGame': function() {
    gameIntro.call(this);
  },
  'GetName': function() {
    if (peopleHealthy.length === 0) {
      mainPlayer = this.event.request.intent.slots.name.value;
      peopleHealthy.push(mainPlayer);
      setupParty.call(this);
    } else if (peopleHealthy.length === 1) {
      var person2 = this.event.request.intent.slots.name.value;
      peopleHealthy.push(person2);
      setupParty.call(this);
    } else if (peopleHealthy.length === 2) {
      var person3 = this.event.request.intent.slots.name.value;
      peopleHealthy.push(person3);
      setupParty.call(this);
    } else if (peopleHealthy.length === 3) {
      var person4 = this.event.request.intent.slots.name.value;
      peopleHealthy.push(person4);
      setupParty.call(this);
    } else if (peopleHealthy.length === 4) {
      var person5 = this.event.request.intent.slots.name.value;
      peopleHealthy.push(person5);
      setupParty.call(this);
    } else {
      setupParty.call(this);
    }
  },
  'GetProfession': function() {
    setupProfession.call(this);
  },
  'GetHowManyItems': function() {
    if (currentlyBuying !== undefined && (amountToBuy * itemPrice > money)) {
      notEnoughMoney.call(this);
    } else {
      money -= (amountToBuy * itemPrice);
      if (currentlyBuying === "food") {
        food += amountToBuy;
        amountToBuy = 0;
        boughtFood = true;
        generalStore.call(this);
      } else if (currentlyBuying === "oxen") {
        oxen += amountToBuy;
        amountToBuy = 0;
        boughtOxen = true;
        generalStore.call(this);
      } else if (currentlyBuying === "parts") {
        parts += amountToBuy;
        amountToBuy = 0;
        boughtParts = true;
        generalStore.call(this);
      } else {
        generalStore.call(this);
      }
    }
  },
  'GetStartingMonth': function() {
    if (month === undefined) {
    chooseMonth.call(this);
    } else {
      setDays.call(this);
    }
  },
  'AMAZON.HelpIntent': function() {
    this.handler.state = GAME_STATES.HELP;
    this.emitWithState('helpTheUser', true);
  },
  'AMAZON.StartOverIntent': function() {
    resetVariables.call(this); // reset all variables
    this.handler.state = GAME_STATES.START;
    this.emitWithState('StartGame');
  },
  'AMAZON.CancelIntent': function() {
    this.response.speak(EXIT_SKILL_MESSAGE);
    this.emit(":responseReady");
  },
  'AMAZON.StopIntent': function() {
    this.response.speak(EXIT_SKILL_MESSAGE);
    this.emit(":responseReady");
  },
  'Unhandled': function() {
    // TODO maybe change unhandled to just ask the player to repeat?
    // this is the plan while the default variable values exist
    if (mainPlayer === undefined) {
      this.handler.state = GAME_STATES.START;
      this.emitWithState('StartGame');
    } else if (peopleHealthy.length < 5) {
      this.handler.state = GAME_STATES.START;
      this.emitWithState('GetName');
    } else if (profession === undefined) {
      this.handler.state = GAME_STATES.START;
      this.emitWithState('GetProfession');
    } else if (boughtFood === false || boughtOxen === false || boughtParts === false) {
      this.handler.state = GAME_STATES.START;
      this.emitWithState('GetHowManyItems');
    } else if (days === 0) {
      this.handler.state = GAME_STATES.START;
      this.emitWithState('GetStartingMonth');
    }
  },
});



// ======================
// EVENTS ALONG THE TRAIL
// ======================
var crossRiver = function(depth, sinkChance, cost) {
  var cross = prompt(
    "You must cross the river. It is " + depth + " feet deep. Do you want to ferry for $" + cost + " or try to float across? Type 'ferry' or 'float'."
  );

  var float = function() {
    if (fate <= sinkChance && depth > 6) {
      food -= fate * 10;
      if (peopleHealthy.length + peopleSick.length === 1) {
        this.response.speak("Your wagon was overtaken by water, and you drowned.");
        throw new gameOver();
      } else if (peopleSick.length >= 1) {
        death(peopleSick);
        this.response.speak("Your wagon was overtaken by water, and " + victim + " drowned. You also lost " + fate * 10 + " pounds of food.");
      } else {
        death(peopleHealthy);
        this.response.speak("Your wagon was overtaken by water, and " + victim + " drowned. You also lost " + fate * 10 + " pounds of food."
        );
      }
    } else if (fate <= sinkChance && depth > 4) {
      food -= fate * 3;
      this.response.speak("You made it across, but water seeped in. You lost " + fate * 3 + " pounds of food."
      );
    } else {
      this.response.speak("Congratulations! You safely crossed the river.");
    }
  };

  if (cross === "ferry") {
    if (money >= cost) {
      money -= cost;
      this.response.speak("Congratulations! You safely crossed the river.");
    } else if (food >= cost * 3) {
      var choice = prompt(
        "You don't have $" + cost + ", but the ferry will accept " + cost * 3 + " pounds of food as your payment. Will you accept? Type 'yes' or 'no'.");
      if (choice === "yes") {
        food -= cost * 3;
        this.response.speak("Congratulations! You safely crossed the river.");
      } else {
        this.response.speak("You will have to try to float across.");
        float();
      }
    }
  } else {
    float();
  }
};

var goShopping = function() {
  var tradeInstead;
  if (money > 0) {
    if (mapLocation !== "Independence") {
      days++;
      trailDays++;
      food -= (peopleHealthy.length + peopleSick.length);
    }
    var toBuy = prompt("What do you want to buy? Type 'food', 'oxen' or 'parts'.");
    if (toBuy === "food") {
      var pounds = +prompt("Pound of food: 50 cents\nHow many pounds of food do you want to buy?");
      if (pounds * 0.5 > money) {
        pounds = +prompt("Sorry, you only have $ " + money + ". Each pound of food costs 50 cents. How many pounds of food do you want to buy?");
      } else {
        food += pounds;
        money -= pounds * 0.5;
        this.response.speak("You have $" + money + " left.");
      }
    } else if (toBuy === "oxen") {
      var beasts = +prompt("Ox: $50\nHow many oxen do you want to buy?");
      if (beasts * 50 > money) {
        beasts = +prompt("Sorry, you only have $" + money + ". Each ox costs $50. How many oxen do you want to buy?");
      } else {
        oxen += beasts;
        money -= beasts * 50;
        this.response.speak("You have $" + money + " left.");
      }
    } else if (toBuy === "parts") {
      var spares = +prompt("Spare part: $30\nHow many spare parts do you want to buy?");
      if (spares * 30 > money) {
        spares = +prompt("Sorry, you only have $" + money + ". Each spare part costs $30. How many spare parts do you want to buy?");
      } else {
        parts += spares;
        money -= spares * 30;
      }
    }
    var toBuyMore = prompt("Money: $" + money + "\nFood: " + food + "\nOxen: " + oxen + "\nSpare parts: " + parts + "\n\nDo you want to buy anything else? Type 'yes' or 'no'.");
    if (toBuyMore === "yes") {
      goShopping();
    }
    if (alreadyTradedAtThisFort === false && mapLocation !== "Independence") {
      tradeInstead = prompt("Instead of buying suplies, do you want to try trading? Type 'yes' or 'no'.");
      if (tradeInstead === "yes") {
        tradeItems(1);
      }
    }
  } else {
    if (alreadyTradedAtThisFort === false) {
      tradeInstead = prompt("Sorry, you don't have any money to buy supplies. Do you want to try trading instead? Type 'yes' or 'no'.");
      if (tradeInstead === "yes" && mapLocation !== "Independence") {
        if (mapLocation === "Fort Bridger") {
          tradeItems(3);
        } else if (mapLocation === "Fort Laramie" || mapLocation === "Fort Hall") {
          tradeItems(2);
        } else {
          tradeItems(1);
        }
      }
    } else {
      this.response.speak("Sorry, you don't have any money to buy items, and you already tried trading at this fort. It's time to move on.");
    }
  }
};

var tradeItems = function(tradeChances) {
  alreadyTradedAtThisFort = true;
  var tradeAttempts = 0;
  var makeADeal = function() {
    if (tradeAttempts < tradeChances) {
      if (mapLocation !== "Independence") {
        days++;
        trailDays++;
        food -= (peopleHealthy.length + peopleSick.length);
      }
      tradeAttempts++;
      var tradeDeal = Math.floor(Math.random() * (10 - 1 + 1)) + 1;
      var yeahOrNah;
      if (tradeDeal === 1) {
        yeahOrNah = prompt("An old settler will give you a spare part for 50 pounds of food. Do you accept this trade? Type 'yes' or 'no'.");
        if (yeahOrNah === "yes" && food >= 50) {
          parts++;
          food -= 50;
          this.response.speak("It's a deal!");
        } else if (yeahOrNah === "yes" && food < 50) {
          this.response.speak("Sorry, you don't have enough food to make the trade.");
        }
      } else if (tradeDeal === 2) {
        yeahOrNah = prompt("A woman at the fort will give you 100 pounds of food for an ox. Do you accept this trade? Type 'yes' or 'no'.");
        if (yeahOrNah === "yes" && oxen > 1) {
          food += 100;
          oxen--;
          this.response.speak("It's a deal!");
        } else if (yeahOrNah === "yes" && oxen === 1) {
          this.response.speak("Sorry, you only have one ox. You must keep him to continue on the trail.");
        }
      } else if (tradeDeal === 3) {
        yeahOrNah = prompt("The general store owner will give you $15 for a spare part. Do you accept this trade? Type 'yes' or 'no'.");
        if (yeahOrNah === "yes" && parts >= 1) {
          money += 15;
          parts--;
          this.response.speak("It's a deal!");
        } else if (yeahOrNah === "yes" && parts < 1) {
          this.response.speak("Sorry, you don't have any spare parts to make the trade.");
        }
      } else if (tradeDeal === 4) {
        yeahOrNah = prompt("A man at the fort will give you an ox for $25. Do you accept this trade? Type 'yes' or 'no'.");
        if (yeahOrNah === "yes" && money >= 25) {
          oxen++;
          money -= 25;
          this.response.speak("It's a deal!");
        } else if (yeahOrNah === "yes" && money < 25) {
          this.response.speak("Sorry, you don't have enough money to make the trade.");
        }
      } else if (tradeDeal === 5) {
        yeahOrNah = prompt("A man at the fort will give you $30 for a spare part. Do you accept this trade? Type 'yes' or 'no'.");
        if (yeahOrNah === "yes" && parts >= 1) {
          money += 30;
          parts --;
          this.response.speak("It's a deal!");
        } else if (yeahOrNah === "yes" && parts < 1) {
          this.response.speak("Sorry, you don't have any spare parts to make the trade.");
        }
      } else if (tradeDeal === 6) {
        yeahOrNah = prompt("A Native American at the fort will give you 200 pounds of food for two oxen. Do you accept this trade? Type 'yes' or 'no'.");
        if (yeahOrNah === "yes" && oxen > 2) {
          food += 200;
          oxen -= 2;
          this.response.speak("It's a deal!");
        } else if (yeahOrNah === "yes" && oxen > 2) {
          this.response.speak("Sorry, you only have two oxen. If you trade them both away, you won't be able to continue on the trail.");
        }
      } else if (tradeDeal === 7) {
        yeahOrNah = prompt("A woman at the fort will give you a spare part for $50. Do you accept this trade? Type 'yes' or 'no'.");
        if (yeahOrNah === "yes" && money >= 50) {
          parts++;
          money -= 50;
          this.response.speak("It's a deal!");
        } else if (yeahOrNah === "yes" && money < 50) {
          this.response.speak("Sorry, you don't have enough money to make the trade.");
        }
      } else if (tradeDeal === 8) {
        yeahOrNah = prompt("A man at the fort will give you $100 for an ox. Do you accept this trade? Type 'yes' or 'no'.");
        if (yeahOrNah === "yes" && oxen > 1) {
          money += 100;
          oxen--;
          this.response.speak("It's a deal!");
        } else if (yeahOrNah === "yes" && oxen === 1) {
          this.response.speak("Sorry, you only have one ox. You must keep him to continue on the trail.");
        }
      } else if (tradeDeal === 9) {
        yeahOrNah = prompt("An old settler will give you $20 for a spare part. Do you accept this trade? Type 'yes' or 'no'.");
        if (yeahOrNah === "yes" && parts >= 1) {
          money += 20;
          parts--;
          this.response.speak("It's a deal!");
        } else if (yeahOrNah === "yes" && parts < 1) {
          this.response.speak("Sorry, you don't have any spare parts to make the trade.");
        }
      } else if (tradeDeal === 10) {
        yeahOrNah = prompt("A man at the fort will give you a spare part for 75 pounds of food. Do you accept this trade? Type 'yes' or 'no'.");
        if (yeahOrNah === "yes" && food >= 50) {
          parts++;
          food -= 75;
          this.response.speak("It's a deal!");
        } else if (yeahOrNah === "yes" && food < 50) {
          this.response.speak("Sorry, you don't have enough food to make the trade.");
        }
      }
      var tradeAgain = prompt("Do you want to try again? Type 'yes' or 'no'.");
      if (tradeAgain === "yes") {
        makeADeal();
      }
    } else {
      this.response.speak("No one else at this fort wants to trade with you.");
    }
  };
  makeADeal();
  var goShoppingInstead = prompt("Instead of trading, do you want to buy anything? Type 'yes' or 'no'.");
  if (goShoppingInstead === "yes") {
    goShopping();
  }
};

var goHunting = function() {
  days++;
  trailDays++;
  food -= (peopleHealthy.length + peopleSick.length);
  var randomNumber = Math.floor(Math.random() * (10 - 1 + 1)) + 1;
  var guess = +prompt("Guess a number between 1 and 10. If you guess within 3 integers of the correct number, you will shoot an animal. The closer you are to the number, the larger your animal. Your number:");
  var shootMessage;

  var shootAnimal = function() {
    if (guess === randomNumber - 3 || guess === randomNumber + 3) {
      food += 2;
      shootMessage = "You shot a squirrel and brought back 2 pounds of food.";
    } else if (guess === randomNumber - 2 || guess === randomNumber + 2) {
      food += 5;
      shootMessage = "You shot a rabbit and brought back 5 pounds of food.";
    } else if (guess === randomNumber - 1 || guess === randomNumber + 1) {
      food += 50;
      shootMessage = "You shot a deer and brought back 50 pounds of food.";
    } else if (guess === randomNumber) {
      food += 100;
      if (mapLocation === "Independence" || mapLocation === "Kansas River" || mapLocation === "Fort Kearney" || mapLocation === "Chimney Rock" || mapLocation === "Fort Laramie") {
        shootMessage = "You shot a buffalo and brought back 100 pounds of food.";
      } else {
        shootMessage = "You shot a bear and brought back 100 pounds of food.";
      }
    } else {
      shootMessage = "Sorry, you didn't get anything on this hunting round.";
    }
    this.response.speak("You guessed " + guess + ". The random number was " + randomNumber + ". " + shootMessage);
  };

  if (guess > 0 && guess <= 10) {
    shootAnimal();
  } else {
    var guessAgain = +prompt("You must guess a number between 1 and 10. Your number:");
    if (guessAgain > 0 && guessAgain <= 10) {
      shootAnimal();
    }
  }
};

var rest = function(restDays) {
  var chanceOfRecovery = (Math.floor(Math.random() * (10 - 1 + 1)) + 1);
  if (restDays >= 7 && chanceOfRecovery % 2 === 0) {
    days += restDays;
    trailDays += restDays;
    food -= restDays*(peopleHealthy.length + peopleSick.length);
    recovery(3);
  } else if (restDays >= 5 && chanceOfRecovery % 2 === 0) {
    days += restDays;
    trailDays += restDays;
    food -= restDays*(peopleHealthy.length + peopleSick.length);
    recovery(2);
  } else if (restDays >= 2 && chanceOfRecovery % 2 === 0) {
    days += restDays;
    trailDays += restDays;
    food -= restDays*(peopleHealthy.length + peopleSick.length);
    recovery(1);
  } else {
    days++;
    trailDays++;
    food -= (peopleHealthy.length + peopleSick.length);
  }
};

var snow = function(lostDays) {
  days += lostDays;
  trailDays += lostDays;
  food -= lostDays*(peopleHealthy.length + peopleSick.length);
  if (lostDays === 1) {
    this.response.speak("You got stuck in some snow. You have lost 1 day.");
  } else if (lostDays >= 5 && peopleSick.length + peopleHealthy.length > 1) {
    if (peopleSick.length > 0) {
      death(peopleSick);
      this.response.speak("You got stuck in a large snow storm. You lost " + lostDays + " days, and " + victim + " froze to death.");
    } else {
      death(peopleHealthy);
      this.response.speak("You got stuck in a large snow storm. You lost " + lostDays + " days, and " + victim + " froze to death.");
    }
  } else if (lostDays >= 5 && peopleSick.length + peopleHealthy.length === 1) {
    this.response.speak("You got stuck in a large snow storm for " + lostDays + " days and froze to death.");
  } else {
    this.response.speak("You got stuck in some snow. You have lost " + lostDays + " days.");
  }
};

var storm = function(lostDays) {
  days += lostDays;
  trailDays += lostDays;
  food -= lostDays*(peopleHealthy.length + peopleSick.length);
  if (lostDays >= 3) {
    oxen -= 1;
    this.response.speak("You got caught in a thunderstorm and an ox ran away. You lost " + lostDays + " days.");
  } else if (lostDays === 1) {
    this.response.speak("You got caught in a thunderstorm. You lost 1 day.");
  } else {
    this.response.speak("You got caught in a thunderstorm. You lost " + lostDays + " days.");
  }
};

var noGrass = function() {
  daysWithoutGrass++;
  this.response.speak("There's no grass for the oxen.");
  if (daysWithoutGrass % 3 === 0) {
    oxProblem();
  }
};

var oxProblem = function() {
  var allOxProblems = ["An ox has wandered off.", "An ox has died."];
  var randomOxProblem = allOxProblems[Math.floor(Math.random() * allOxProblems.length)];
  this.response.speak(randomOxProblem);
  if (oxen > 1) {
    oxen -= 1;
  } else if (oxen === 1) {
    this.response.speak("That was your last ox. This is as far as you can go. Good luck homesteading!");
    throw new gameOver();
  }
};

var fire = function() {
  var destroyedItems = [["food", 20, "pounds of food"],["oxen", 1, "ox"],["money", 25, "dollars"],["parts", 1, "spare part"],["money", 10, "dollars"]];
  var itemIndex = Math.floor(Math.random() * destroyedItems.length);
  if (window[destroyedItems[itemIndex][0]] > destroyedItems[itemIndex][1]) {
    window[destroyedItems[itemIndex][0]] -= destroyedItems[itemIndex][1];
    this.response.speak("A fire broke out in your wagon and destroyed " + destroyedItems[itemIndex][1] + " " + destroyedItems[itemIndex][2] + ".");
  } else if (window[destroyedItems[itemIndex][0]] > 0) {
    window[destroyedItems[itemIndex][0]] = 0;
    this.response.speak("A fire broke out in your wagon and destroyed your remaining " + destroyedItems[itemIndex][2] + ".");
  }

  if (oxen === 0) {
    this.response.speak("That was your last ox. This is as far as you can go. Good luck homesteading!");
    throw new gameOver();
  }
};

var thief = function() {
  var stolenItems = [["food", 20, "pounds of food"],["oxen", 1, "ox"],["money", 25, "dollars"],["parts", 1, "spare part"],["money", 10, "dollars"]];
  var itemIndex = Math.floor(Math.random() * stolenItems.length);
  if (window[stolenItems[itemIndex][0]] > stolenItems[itemIndex][1]) {
    window[stolenItems[itemIndex][0]] -= stolenItems[itemIndex][1];
    this.response.speak("A thief broke into your wagon and stole " + stolenItems[itemIndex][1] + " " + stolenItems[itemIndex][2] + ".");
  } else {
    window[stolenItems[itemIndex][0]] = 0;
    this.response.speak("A thief broke into your wagon and stole your remaining " + stolenItems[itemIndex][2] + ".");
  }

  if (oxen === 0) {
    this.response.speak("That was your last ox. This is as far as you can go. Good luck homesteading!");
    throw new gameOver();
  }
};

var findItems = function() {
  var foundItems = [["food", 50, "pounds of food"],["oxen", 2, "oxen"],["money", 50, "dollars"],["parts", 1, "spare part"],["money", 100, "dollars"]];
  var itemIndex = Math.floor(Math.random() * foundItems.length);
  window[foundItems[itemIndex][0]] += foundItems[itemIndex][1];
  this.response.speak("You found an abandoned wagon on the trail. After looking around, you found " + foundItems[itemIndex][1] + " " + foundItems[itemIndex][2] + ".");
};

var findBerries = function() {
  daysWithoutFood = 0;
  food += 3*(Math.floor(Math.random() * (10 - 1 + 1)) + 1);
  this.response.speak("You found wild berries.");
};

var brokenWagon = function() {
  if (parts > 0) {
    parts -= 1;
    days++;
    trailDays++;
    food -= (peopleHealthy.length + peopleSick.length);
    this.response.speak("Your wagon broke, but you repaired it.");
  } else {
    this.response.speak("Your wagon broke, and you don't have any spare parts to fix it. This is as far as you can go. Good luck homesteading!");
    throw new gameOver();
  }
};

var getLost = function() {
  var howLong = Math.floor(Math.random() * (5 - 1 + 1)) + 1;
  days += howLong;
  trailDays += howLong;
  food -= howLong*(peopleHealthy.length + peopleSick.length);
  if (howLong === 1) {
    this.response.speak("You lost the trail. You wasted 1 day.");
  } else {
    this.response.speak("You lost the trail. You wasted " + howLong + " days.");
  }
};

var starve = function() {
  if (daysWithoutFood === 1) {
    this.response.speak("You have run out of food.");
  } else if (daysWithoutFood % 2 === 0 && peopleHealthy.length > 0) {
    if (peopleHealthy.length === 1) {
      if (fate % 2 === 0) {
        sickness();
        this.response.speak("You are starving and are very weak.");
      }
    } else {
      if (fate % 2 === 0) {
        sickness();
        this.response.speak(invalid + " is starving and is very weak.");
      }
    }
  } else if (daysWithoutFood % 3 === 0 && fate % 2 === 0) {
    if (peopleHealthy.length + peopleSick.length === 1) {
      this.response.speak("You have died of starvation.");
      throw new gameOver();
    } else if (peopleSick.length > 0){
      death(peopleSick);
      this.response.speak(victim + " has died of starvation.");
    } else if (peopleHealthy.length > 0) {
      death(peopleHealthy);
      this.response.speak(victim + " has died of starvation.");
    }
  }
};

var recovery = function(howManyToHeal) {
  var peopleCured = 0;

  var healThem = function() {
    peopleCured++;

    var recoveredIndex = Math.floor(Math.random() * peopleSick.length);
    if (recoveredIndex === 0 && peopleSick.indexOf(mainPlayer) === 0) {
      peopleSick.shift();
      peopleHealthy.unshift(mainPlayer);
      this.response.speak("You are feeling much better.");
    } else {
      var recoveredPerson = peopleSick[recoveredIndex];
      peopleSick.splice(recoveredIndex, 1);
      peopleHealthy.push(recoveredPerson);
      this.response.speak(recoveredPerson + " is feeling much better.");
    }

    if (peopleCured < howManyToHeal && peopleSick.length > 0) {
    healThem();
    }
  };

  healThem();
};

var sickness = function() {
  if (peopleHealthy.length > 1) {
    var invalidIndex = Math.floor(Math.random() * (peopleHealthy.length - 1 - 1 + 1)) + 1;
    invalid = peopleHealthy[invalidIndex];
    peopleHealthy.splice(invalidIndex, 1);
    peopleSick.push(invalid);
  } else {
    invalid = peopleHealthy[0];
    peopleHealthy.splice(0, 1);
    peopleSick.unshift(invalid);
  }
};

var death = function(array) {
  var victimIndex;
  if (array.indexOf(mainPlayer) === 0) {
    victimIndex = Math.floor(Math.random() * ((array.length - 1) - 1 + 1)) + 1;
  } else {
    victimIndex = Math.floor(Math.random() * array.length);
  }
  victim = array[victimIndex];
  array.splice(victimIndex, 1);
};

var gameOver = function(status) {
  if (status === "winner") {
    var bonus;
    if (profession === "banker") {
      bonus = 1;
    } else if (profession === "carpenter") {
      bonus = 2;
    } else if (profession === "farmer") {
      bonus = 3;
    }
    var points = bonus*((peopleHealthy.length * 100) + (peopleSick.length * 50) + (oxen * 20) + (food * 2) + (parts * 2) + money - trailDays);
    this.response.speak("Congratulations, you reached the end of the trail! You finished the game with a score of " + points + ".");
  } else {
    this.response.speak("THE END");
  }
};



// =========================
// LANDMARKS ALONG THE TRAIL
// =========================
var kansasRiver = function() {
  var depth;
  if (days < 92) {
    depth = 3;
  } else {
    depth = 4;
  }
  this.response.speak("Kansas River");
  crossRiver(depth, 2, 5);
};

var fortKearny = function() {
  this.response.speak("Fort Kearny");

  alreadyTradedAtThisFort = false;
  var getStuff = prompt("Do you want to buy or trade anything while you're here? Type 'yes' or 'no'.");
  if (getStuff === "yes") {
    if (money <= 0) {
      this.response.speak("You don't have any money, but you can try trading.");
      tradeItems(1);
    } else {
      var buyOrTrade = prompt("You have $" + money + " to spend. Do you want to use it to buy something, or do you want to try trading instead? Type 'buy' or 'trade'.");
      if (buyOrTrade === "buy") {
        goShopping();
      } else if (buyOrTrade === "trade") {
        tradeItems(1);
      }
    }
  }
};

var chimneyRock = function() {
  this.response.speak("Chimney Rock");
};

var fortLaramie = function() {
  this.response.speak("Fort Laramie");

  alreadyTradedAtThisFort = false;
  var getStuff = prompt("Do you want to buy or trade anything while you're here? Type 'yes' or 'no'.");
  if (getStuff === "yes") {
    if (money <= 0) {
      this.response.speak("You don't have any money, but you can try trading.");
      tradeItems(2);
    } else {
      var buyOrTrade = prompt("You have $" + money + " to spend. Do you want to use it to buy something, or do you want to try trading? Type 'buy' or 'trade'.");
      if (buyOrTrade === "buy") {
        goShopping();
      } else if (buyOrTrade === "trade") {
        tradeItems(2);
      }
    }
  }
};

var independenceRock = function() {
  this.response.speak("Independence Rock");
};

var southPass = function() {
  this.response.speak("South Pass");
};

var greenRiver = function() {
  this.response.speak("Green River");
  crossRiver(8, 8, 12);
};

var fortBridger = function() {
  this.response.speak("Fort Bridger");

  alreadyTradedAtThisFort = false;
  var getStuff = prompt("Do you want to buy or trade anything while you're here? Type 'yes' or 'no'.");
  if (getStuff === "yes") {
    if (money <= 0) {
      this.response.speak("You don't have any money, but you can try trading.");
      tradeItems(3);
    } else {
      var buyOrTrade = prompt("You have $" + money + " to spend. Do you want to use it to buy something, or do you want to try trading? Type 'buy' or 'trade'.");
      if (buyOrTrade === "buy") {
        goShopping();
      } else if (buyOrTrade === "trade") {
        tradeItems(3);
      }
    }
  }
};

var sodaSprings = function() {
  this.response.speak("Soda Springs");
};

var fortHall = function() {
  this.response.speak("Fort Hall");

  alreadyTradedAtThisFort = false;
  var getStuff = prompt("Do you want to buy or trade anything while you're here? Type 'yes' or 'no'.");
  if (getStuff === "yes") {
    if (money <= 0) {
      this.response.speak("You don't have any money, but you can try trading.");
      tradeItems(2);
    } else {
      var buyOrTrade = prompt("You have $" + money + " to spend. Do you want to use it to buy something, or do you want to try trading? Type 'buy' or 'trade'.");
      if (buyOrTrade === "buy") {
        goShopping();
      } else if (buyOrTrade === "trade") {
        tradeItems(2);
      }
    }
  }
};

var snakeRiver = function() {
  this.response.speak("Snake River");
  crossRiver(5, 5, 7);
};

var fortBoise = function() {
  this.response.speak("Fort Boise");

  alreadyTradedAtThisFort = false;
  var getStuff = prompt("Do you want to buy or trade anything while you're here? Type 'yes' or 'no'.");
  if (getStuff === "yes") {
    if (money <= 0) {
      this.response.speak("You don't have any money, but you can try trading.");
      tradeItems(1);
    } else {
      var buyOrTrade = prompt("You have $" + money + " to spend. Do you want to use it to buy something, or do you want to try trading? Type 'buy' or 'trade'.");
      if (buyOrTrade === "buy") {
        goShopping();
      } else if (buyOrTrade === "trade") {
        tradeItems(1);
      }
    }
  }
};

var fortWallaWalla = function() {
  this.response.speak("Fort Walla Walla");

  alreadyTradedAtThisFort = false;
  var getStuff = prompt("Do you want to buy or trade anything while you're here? Type 'yes' or 'no'.");
  if (getStuff === "yes") {
    if (money <= 0) {
      this.response.speak("You don't have any money, but you can try trading.");
      tradeItems(1);
    } else {
      var buyOrTrade = prompt("You have $" + money + " to spend. Do you want to use it to buy something, or do you want to try trading? Type 'buy' or 'trade'.");
      if (buyOrTrade === "buy") {
        goShopping();
      } else if (buyOrTrade === "trade") {
        tradeItems(1);
      }
    }
  }
};

var theDalles = function() {
  this.response.speak("The Dalles");
};

var oregonCity = function() {
  this.response.speak("Oregon City");
  throw new gameOver("winner");
};



// =============
// THE TRAIL MAP
// =============
var travel = function(distance) {
  if (distance === 105) {
    mapLocation = "Kansas River";
    kansasRiver();
  } else if (distance === 300) {
    mapLocation = "Fort Kearny";
    fortKearny();
  } else if (distance === 555) {
    mapLocation = "Chimney Rock";
    chimneyRock();
  } else if (distance === 645) {
    mapLocation = "Fort Laramie";
    fortLaramie();
  } else if (distance === 825) {
    mapLocation = "Independence Rock";
    independenceRock();
  } else if (distance === 930) {
    mapLocation = "South Pass";
    southPass();
  } else if (distance === 1050 && mapLocation !== "Fort Bridger") {
    mapLocation = "Green River";
    greenRiver();
    mapLocation = prompt("Do you want to stay on the trail to Fort Bridger or take the shortcut through Soda Springs?\n\nType 'Fort Bridger' or 'Soda Springs'.").replace(/(\b[a-z])/g, function(x){return x.toUpperCase();});
    if (mapLocation !== "Fort Bridger" && mapLocation !== "Soda Springs") {
      this.response.speak("Sorry, you didn't enter your desired location correctly. You'll stay on the trail and go to Fort Bridger.");
      mapLocation = "Fort Bridger";
    }
    if (mapLocation === "Soda Springs") {
      extraMiles -= 105;
    }
  } else if (distance === 1200) {
    if (mapLocation === "Fort Bridger") {
      fortBridger();
    } else if (mapLocation === "Soda Springs") {
      sodaSprings();
    }
  } else if (distance === 1260) {
    mapLocation = "Fort Hall";
    fortHall();
  } else if (distance === 1440) {
    mapLocation = "Snake River";
    snakeRiver();
  } else if (distance === 1560 && mapLocation !== "Fort Walla Walla") {
    mapLocation = "Fort Boise";
    fortBoise();
    mapLocation = prompt("Do you want to stay on the trail to Fort Walla Walla or take the shortcut through The Dalles?\n\nType 'Fort Walla Walla' or 'The Dalles'.").replace(/(\b[a-z])/g, function(x){return x.toUpperCase();});
    if (mapLocation !== "Fort Walla Walla" && mapLocation !== "The Dalles") {
      this.response.speak("Sorry, you didn't enter your desired location correctly. You'll stay on the trail and go to Fort Walla Walla.");
      mapLocation = "Fort Walla Walla";
    }
    if (mapLocation === "The Dalles") {
      extraMiles -= 150;
    }
  } else if (distance === 1710) {
    if (mapLocation === "Fort Walla Walla") {
      fortWallaWalla();
    } else if (mapLocation === "The Dalles") {
      theDalles();
    }
  } else if (distance === 1845) {
    mapLocation = "Oregon City";
    oregonCity();
  }
};



// =====================
// THE OREGON TRAIL GAME
// =====================
var theOregonTrail = function() {
  days--;
  for (miles = 15; miles <= 1845 + extraMiles; miles += 15) {
    // DAILY CHANGES
    days++;
    trailDays++;
    fate = Math.floor(Math.random() * (10 - 1 + 1)) + 1;

    // TRAVELING
    travel(miles);

    // FOOD STATUS
    if (food <= 0) {
      daysWithoutFood++;
      starve();
    } else {
      if (food >= (peopleHealthy.length + peopleSick.length)) {
        food -= (peopleHealthy.length + peopleSick.length); // each person eats 1 lb/day
      } else {
        food = 0;
      }
    }

    // RANDOM EVENTS
    if (trailDays > 2) {
      // HUNTING
      if (fate < 3 && trailDays % 4 === 0) {
        var hunt = prompt("You're in an area with a lot of wildlife. You currently have " + food + " pounds of food, which will last about " + Math.floor(food/(peopleHealthy.length + peopleSick.length)) + " days. Do you want to go hunting for more food? Type 'yes' or 'no'.");
        if (hunt === "yes") {
          goHunting();
        }
      // SICKNESS/INJURY
      } else if (fate % 4 === 0 && trailDays % 4 === 0) {
        var healthIssues = ["the flu", "cholera", "exhaustion", "typhoid fever", "a snake bite", "a broken arm", "a broken leg"];
        var issue = healthIssues[Math.floor(Math.random() * healthIssues.length)];
        var daysOfRest;
        var restOption;

        if (peopleHealthy.length > 1) {
          sickness();
          this.response.speak(invalid + " has " + issue + ".");
          restOption = prompt("Do you want to rest to see if "+ invalid + " feels better? Type 'yes' or 'no'.");
          if (restOption === "yes" ) {
            daysOfRest = +prompt("How many days would you like to rest? Type a number.");
            rest(daysOfRest);
          }
        } else {
          sickness();
          this.response.speak("You have " + issue + ".");
          restOption = prompt("Do you want to rest to see if you feel better? Type 'yes' or 'no'.");
          if (restOption === "yes" ) {
            daysOfRest = +prompt("How many days would you like to rest? Type a number.");
            rest(daysOfRest);
          }
        }
      // DEATH OF SICK/INJURED
      } else if (fate === 10) {
        var diseases = ["a fever", "dysentery", "an infection", "dehydration"];
        var fatality = diseases[Math.floor(Math.random() * diseases.length)];

        if (peopleHealthy.length + peopleSick.length === 1 && peopleSick.indexOf(mainPlayer) === 0) {
          this.response.speak("You have died of " + fatality);
          throw new gameOver();
        } else if (peopleSick.length > 0) {
          death(peopleSick);
          this.response.speak(victim + " has died of " + fatality + ".");
        }
      // WEATHER
      } else if (fate === 3 && trailDays % 2 === 0) {
        var lostDays;
        if (days < 122 || (days > 306 && days < 487) || days > 671) {
          lostDays = Math.floor(Math.random() * (7 - 4 + 1)) + 1;
          snow(lostDays);
        } else if ((days > 122 && days < 153) || (days > 487 && days < 518)) {
          lostDays = Math.floor(Math.random() * (3 - 1 + 1)) + 1;
          storm(lostDays);
        }
      // GREAT AMERICAN DESERT
      } else if (fate === 9) {
        if (mapLocation === "Kansas River" || mapLocation === "Fort Kearny" || mapLocation === "Chimney Rock") {
          if (days < 122 || (days > 365 && days < 487)) {
            noGrass();
          } else if (days > 183 && days < 214) {
            var stampedeChance = Math.floor(Math.random() * (10 - 1 + 1)) + 1;
            if (stampedeChance === 9 && peopleSick.length + peopleHealthy.length > 1) {
              if (peopleHealthy.length > 1) {
                death(peopleHealthy);
                this.response.speak("Buffalo stampede! " + victim + " got trampled.");
              } else if (peopleSick.length > 0) {
                death(peopleSick);
                this.response.speak("Buffalo stampede! " + victim + " got trampled.");
              }
            }
          }
        }
      // GOOD THINGS
      } else if (fate === 7 && trailDays % 2 === 1) {
        var goodThing = Math.floor(Math.random() * (2 - 1 + 1)) + 1;
        if (goodThing === 1) {
          if ((days > 122 && days < 275) || (days > 487 && days < 640)) {
            findBerries();
          } else {
            findItems();
          }
        } else if (goodThing === 2 && peopleSick.length > 0) {
          recovery(1);
        }
      // BAD THINGS
      } else if (fate === 6 && trailDays % 2 === 1) {
        var badThing = Math.floor(Math.random() * (5 - 1 + 1)) + 1;
        if (badThing === 1) {
          oxProblem();
        } else if (badThing === 2) {
          fire();
        } else if (badThing === 3) {
          thief();
        } else if (badThing === 4) {
          brokenWagon();
        } else if (badThing === 5) {
          getLost();
        }
      }
    }

    // DAILY STATUS UPDATE
    this.response.speak(dateFrom1836(days).toDateString()
    + "\n-----------------"
    + "\nDays on the trail: " + trailDays
    + "\nMiles: " + miles + "/" + (1845 + extraMiles)
    + "\nMoney: " + money
    + "\nFood: " + food
    + "\nOxen: " + oxen
    + "\nParts: " + parts
    + "\nPeople healthy: " + peopleHealthy
    + "\nPeople sick: " + peopleSick
    );
  }
};


/*
// PLAY THE GAME!
theOregonTrail();
*/


exports.handler = function(event, context, callback) {
  const alexa = Alexa.handler(event, context);
  alexa.appId = APP_ID;
  alexa.registerHandlers(newSessionHandlers, startStateHandlers);
  alexa.execute();
};
