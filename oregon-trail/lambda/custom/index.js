'use strict';

const Alexa = require('alexa-sdk');
const APP_ID = "amzn1.ask.skill.9608708c-a9ff-441b-9659-0958592879e5";
const GAME_STATES = {
  USER_SETUP: '_USERSETUPMODE', // entry point, setting up main player's name and party members' names
  PROFESSION_SETUP: '_PROFESSIONSETUPMODE', // setting up user's profession and starting money/food/oxen/parts
  SUPPLIES_SETUP: '_SUPPLIESSETUP', // setting up user's first purchases at general store
  MONTH_SETUP: '_MONTHSETUP', // setting up user's preferred starting month
  EVENT: '_EVENTMODE', // events within the game
  FORT: '_FORTMODE', // handles user's choices at forts
  FIRST_TRAIL_SPLIT: '_FIRSTTRAILSPLITMODE', // handles player's choice between Fort Bridger and Soda Springs
  SECOND_TRAIL_SPLIT: '_SECONDTRAILSPLITMODE', // handles player's choice between Fort Walla Walla and The Dalles
  THIRD_TRAIL_SPLIT: '_THIRDTRAILSPLIT', // handles player's choice between Barlow Toll Road and Columbia River
  SHOPPING: '_SHOPPINGMODE', // choosing which supplies to buy
  SHOPPING_AMOUNT: '_SHOPPINGAMOUNTMODE', // choosing how much to buy
  SHOPPING_SUCCESS: '_SHOPPINGSUCCESSMODE', // getting total, choosing to buy more
  TRADING: '_TRADINGMODE', // trading supplies
  CHANGE_PURCHASE: '_CHANGEPURCHASEMODE', // option to trade instead of buy/buy instead of trade
  HUNT: '_HUNTMODE', // hunting within the game
  HUNT_NUMBER: '_HUNTNUMBERMODE', // choosing a random number for hunting
  SICK: '_SICKMODE', // when a person gets sick or injured
  REST: '_RESTMODE', // resting for potential recovery
  RIVER: '_RIVERMODE', // crossing rivers
  COLUMBIA_RIVER: '_COLUMBIARIVERMODE', // floating down the Columbia River
  GAME_OVER: '_GAMEOVERMODE', // game over
};

const GAME_NAME = "Oregon Trail";
const WELCOME_MESSAGE = "Welcome to the Oregon Trail Game!";
const START_GAME_MESSAGE = "It's 1846 in Independence, Missouri. You and your family have decided to become pioneers and travel the Oregon Trail.";
const EXIT_SKILL_MESSAGE = "Thanks for joining me on the Oregon Trail. Let's play again soon!";
const STOP_MESSAGE =  "Would you like to keep playing?";
const CANCEL_MESSAGE = "Ok, let's play again soon.";
const PRICE_FOOD = 0.5;
const PRICE_OXEN = 50;
const PRICE_PARTS = 30;
const COST_FOOD = "Food costs $" + PRICE_FOOD + " per pound.";
const COST_OXEN = "Each ox costs $" + PRICE_OXEN + ".";
const COST_PARTS = "Each spare part costs $" + PRICE_PARTS + ".";
const Q_HOW_MANY_FOOD = "How many pounds of food do you want to buy?";
const Q_HOW_MANY_OXEN = "How many oxen do you want to buy?";
const Q_HOW_MANY_PARTS = "How many spare parts do you want to buy?";
const Q_BUY_ANYTHING_ELSE = "Do you want to buy anything else?";
const SORRY = "Sorry, I didn't get that.";
const QUIT_OR_START_OVER = "If you want to quit the game, say stop. If you want to start over, say start over.";

// ==============
// STATE HANDLERS
// ==============
const newSessionHandlers = {
  'LaunchRequest': function() {
    this.handler.state = GAME_STATES.USER_SETUP;
    this.emitWithState('StartGame');
  },
  'AMAZON.StartOverIntent': function() {
    this.handler.state = GAME_STATES.USER_SETUP;
    this.emitWithState('StartGame');
  },
  'AMAZON.HelpIntent': function() {
    this.handler.state = GAME_STATES.USER_SETUP;
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
    this.handler.state = GAME_STATES.USER_SETUP;
    this.emitWithState('StartGame');
  },
};

// HANDLE NAMES FOR MAIN PLAYER AND PARTY MEMBERS
const userSetupHandlers = Alexa.CreateStateHandler(GAME_STATES.USER_SETUP, {
  'StartGame': function() {
    this.event.session.attributes.mainPlayer = undefined;
    this.event.session.attributes.peopleHealthy = [];
    this.event.session.attributes.peopleSick = [];
    this.event.session.attributes.profession = undefined;
    this.event.session.attributes.money = 0;
    this.event.session.attributes.food = 0;
    this.event.session.attributes.oxen = 0;
    this.event.session.attributes.parts = 0;
    this.event.session.attributes.miles = 0;
    this.event.session.attributes.extraMiles = 0;
    this.event.session.attributes.month = undefined;
    this.event.session.attributes.days = 0;
    this.event.session.attributes.trailDays = 0;
    this.event.session.attributes.trailDaysWithoutIncident = 0;
    this.event.session.attributes.invalid = undefined;
    this.event.session.attributes.victim = undefined;
    this.event.session.attributes.guess = 0;
    this.event.session.attributes.lostDays = undefined;
    this.event.session.attributes.daysWithoutFood = 0;
    this.event.session.attributes.daysWithoutGrass = 0;
    this.event.session.attributes.riverDepth = 0;
    this.event.session.attributes.ferryCost = 0;
    this.event.session.attributes.sinkChance = 0;
    this.event.session.attributes.mapLocation = undefined;
    this.event.session.attributes.hasChosenFirstDirection = false;
    this.event.session.attributes.hasChosenSecondDirection = false;
    this.event.session.attributes.hasChosenThirdDirection = false;
    this.event.session.attributes.shortcut1 = false;
    this.event.session.attributes.shortcut2 = false;
    this.event.session.attributes.shortcut3 = false;
    this.event.session.attributes.currentlyBuyingWhat = undefined;
    this.event.session.attributes.currentlyBuyingHowMany = 0;
    this.event.session.attributes.itemPrice = 0;
    this.event.session.attributes.total = 0;
    this.event.session.attributes.purchaseChoice = undefined;
    this.event.session.attributes.tradeChances = 0;
    this.event.session.attributes.tradeAttempts = 0;
    this.event.session.attributes.tradeDeal = 0;
    this.event.session.attributes.tradeAllowed = true;
    this.event.session.attributes.fate = 0;
    this.event.session.attributes.hasChosenProfession = false;
    this.event.session.attributes.hasBeenToGeneralStore = false;
    this.event.session.attributes.boughtFood = false;
    this.event.session.attributes.boughtOxen = false;
    this.event.session.attributes.boughtParts = false;
    this.event.session.attributes.hasChosenMonth = false;
    this.event.session.attributes.daysOfRest = 0;
    this.event.session.attributes.howManyToHeal = 0;
    this.event.session.attributes.recoveredMessage = undefined;
    this.event.session.attributes.columbiaRiverDamage = 0;
    this.event.session.attributes.obstacles = 1;
    this.event.session.attributes.crashes = 0;
    this.event.session.attributes.travelingSFX = undefined;
    this.event.session.attributes.TRY_BUYING_AGAIN = undefined;
    this.event.session.attributes.finalscore = 0;
    gameIntro.call(this);
  },
  'StartGameAgain': function() {
    this.event.session.attributes.mainPlayer = undefined;
    this.event.session.attributes.peopleHealthy = [];
    this.event.session.attributes.peopleSick = [];
    this.event.session.attributes.profession = undefined;
    this.event.session.attributes.money = 0;
    this.event.session.attributes.food = 0;
    this.event.session.attributes.oxen = 0;
    this.event.session.attributes.parts = 0;
    this.event.session.attributes.miles = 0;
    this.event.session.attributes.extraMiles = 0;
    this.event.session.attributes.month = undefined;
    this.event.session.attributes.days = 0;
    this.event.session.attributes.trailDays = 0;
    this.event.session.attributes.trailDaysWithoutIncident = 0;
    this.event.session.attributes.invalid = undefined;
    this.event.session.attributes.victim = undefined;
    this.event.session.attributes.guess = 0;
    this.event.session.attributes.lostDays = undefined;
    this.event.session.attributes.daysWithoutFood = 0;
    this.event.session.attributes.daysWithoutGrass = 0;
    this.event.session.attributes.riverDepth = 0;
    this.event.session.attributes.ferryCost = 0;
    this.event.session.attributes.sinkChance = 0;
    this.event.session.attributes.mapLocation = undefined;
    this.event.session.attributes.hasChosenFirstDirection = false;
    this.event.session.attributes.hasChosenSecondDirection = false;
    this.event.session.attributes.hasChosenThirdDirection = false;
    this.event.session.attributes.shortcut1 = false;
    this.event.session.attributes.shortcut2 = false;
    this.event.session.attributes.shortcut3 = false;
    this.event.session.attributes.currentlyBuyingWhat = undefined;
    this.event.session.attributes.currentlyBuyingHowMany = 0;
    this.event.session.attributes.itemPrice = 0;
    this.event.session.attributes.total = 0;
    this.event.session.attributes.purchaseChoice = undefined;
    this.event.session.attributes.tradeChances = 0;
    this.event.session.attributes.tradeAttempts = 0;
    this.event.session.attributes.tradeDeal = 0;
    this.event.session.attributes.tradeAllowed = true;
    this.event.session.attributes.fate = 0;
    this.event.session.attributes.hasChosenProfession = false;
    this.event.session.attributes.hasBeenToGeneralStore = false;
    this.event.session.attributes.boughtFood = false;
    this.event.session.attributes.boughtOxen = false;
    this.event.session.attributes.boughtParts = false;
    this.event.session.attributes.hasChosenMonth = false;
    this.event.session.attributes.daysOfRest = 0;
    this.event.session.attributes.howManyToHeal = 0;
    this.event.session.attributes.recoveredMessage = undefined;
    this.event.session.attributes.columbiaRiverDamage = 0;
    this.event.session.attributes.obstacles = 1;
    this.event.session.attributes.crashes = 0;
    this.event.session.attributes.travelingSFX = undefined;
    this.event.session.attributes.TRY_BUYING_AGAIN = undefined;
    this.event.session.attributes.finalscore = 0;
    gameIntroStartOver.call(this);
  },
  'GetName': function() {
    if (this.event.request.intent && this.event.request.intent.slots && this.event.request.intent.slots.name && this.event.request.intent.slots.name.value) {
      if (this.event.session.attributes.peopleHealthy.length === 0) {
        var mainPlayer = this.event.request.intent.slots.name.value;
        this.event.session.attributes.mainPlayer = capitalizeFirstLetter(mainPlayer);
        this.event.session.attributes.peopleHealthy.push(capitalizeFirstLetter(mainPlayer));
        setupParty.call(this);
      } else if (this.event.session.attributes.peopleHealthy.length === 1) {
        var person2 = this.event.request.intent.slots.name.value;
        this.event.session.attributes.peopleHealthy.push(capitalizeFirstLetter(person2));
        setupParty.call(this);
      } else if (this.event.session.attributes.peopleHealthy.length === 2) {
        var person3 = this.event.request.intent.slots.name.value;
        this.event.session.attributes.peopleHealthy.push(capitalizeFirstLetter(person3));
        setupParty.call(this);
      } else if (this.event.session.attributes.peopleHealthy.length === 3) {
        var person4 = this.event.request.intent.slots.name.value;
        this.event.session.attributes.peopleHealthy.push(capitalizeFirstLetter(person4));
        setupParty.call(this);
      } else if (this.event.session.attributes.peopleHealthy.length === 4) {
        var person5 = this.event.request.intent.slots.name.value;
        this.event.session.attributes.peopleHealthy.push(capitalizeFirstLetter(person5));
        setupParty.call(this);
      } else {
        setupParty.call(this);
      }
    } else {
      if (this.event.session.attributes.mainPlayer === undefined) {
        this.response.speak(SORRY + " What is your name?").listen("What is your name?");
        this.emit(":responseReady");
      } else {
        this.response.speak(SORRY + " What is the name?").listen("What is the name?");
        this.emit(":responseReady");
      }
    }
  },
  'AMAZON.HelpIntent': function() {
    if (this.event.session.attributes.peopleHealthy.length === 0) {
      this.response.speak("If you don't want to play, say stop. If you want to play, I need to know your name. It can be a real name or a pretend name. What is your name?").listen("What is your name?");
      this.emit(":responseReady");
    } else if (this.event.session.attributes.peopleHealthy.length === 1) {
      this.response.speak(QUIT_OR_START_OVER + " Otherwise, please say a name, and that person will be added to your party. What is the name of the second person in your party?").listen("What is the name of the second person in your party?");
      this.emit(":responseReady");
    } else if (this.event.session.attributes.peopleHealthy.length === 1) {
      this.response.speak(QUIT_OR_START_OVER + " Otherwise, please say a name, and that person will be added to your party. What is the name of the third person in your party?").listen("What is the name of the third person in your party?");
      this.emit(":responseReady");
    } else if (this.event.session.attributes.peopleHealthy.length === 1) {
      this.response.speak(QUIT_OR_START_OVER + " Otherwise, please say a name, and that person will be added to your party. What is the name of the fourth person in your party?").listen("What is the name of the fourth person in your party?");
      this.emit(":responseReady");
    } else if (this.event.session.attributes.peopleHealthy.length === 1) {
      this.response.speak(QUIT_OR_START_OVER + " Otherwise, please say a name, and that person will be added to your party. What is the name of the fifth person in your party?").listen("What is the name of the fifth person in your party?");
      this.emit(":responseReady");
    } else {
      this.response.speak(QUIT_OR_START_OVER + " Otherwise, please say a name, and that person will be added to your party. What name do you want to use?").listen("What name do you want to use?");
      this.emit(":responseReady");
    }
  },
  'AMAZON.StartOverIntent': function() {
    this.handler.state = GAME_STATES.USER_SETUP;
    this.emitWithState('StartGameAgain');
  },
  'AMAZON.CancelIntent': function() {
    if (this.event.session.attributes.peopleHealthy.length === 0) {
      this.response.speak("If you want to quit the game, say stop. Otherwise, please tell me your name.").listen("What is your name?");
      this.emit(":responseReady");
    } else {
      this.event.session.attributes.peopleHealthy.pop();
      setupParty.call(this);
    }
  },
  'AMAZON.StopIntent': function() {
    this.response.speak(EXIT_SKILL_MESSAGE);
    this.emit(":responseReady");
  },
  'Unhandled': function() {
    if (this.event.request.intent.name !== "GetName") {
      // Allow people to register a name that is also a month
      if (this.event.request.intent.name === "GetStartingMonth") {
        if (this.event.session.attributes.peopleHealthy.length === 0) {
          var mainPlayer = this.event.request.intent.slots.month.value;
          this.event.session.attributes.mainPlayer = mainPlayer;
          this.event.session.attributes.peopleHealthy.push(mainPlayer);
          setupParty.call(this);
        } else if (this.event.session.attributes.peopleHealthy.length === 1) {
          var person2 = this.event.request.intent.slots.month.value;
          this.event.session.attributes.peopleHealthy.push(person2);
          setupParty.call(this);
        } else if (this.event.session.attributes.peopleHealthy.length === 2) {
          var person3 = this.event.request.intent.slots.month.value;
          this.event.session.attributes.peopleHealthy.push(person3);
          setupParty.call(this);
        } else if (this.event.session.attributes.peopleHealthy.length === 3) {
          var person4 = this.event.request.intent.slots.month.value;
          this.event.session.attributes.peopleHealthy.push(person4);
          setupParty.call(this);
        } else if (this.event.session.attributes.peopleHealthy.length === 4) {
          var person5 = this.event.request.intent.slots.month.value;
          this.event.session.attributes.peopleHealthy.push(person5);
          setupParty.call(this);
        } else {
          setupParty.call(this);
        }
      } else {
        this.response.speak("I'm sorry, but that's not a name I understand. Please choose another name.").listen("Please choose another name.");
        this.emit(":responseReady");
      }
    }
  },
});

// HANDLE PROFESSION
const professionSetupHandlers = Alexa.CreateStateHandler(GAME_STATES.PROFESSION_SETUP, {
  'GetProfession': function() {
    if (this.event.session.attributes.hasChosenProfession === false) {
      chooseProfession.call(this);
    } else if (this.event.request.intent && this.event.request.intent.slots && this.event.request.intent.slots.profession && this.event.request.intent.slots.profession.value) {
      var profession = this.event.request.intent.slots.profession.value;
      this.event.session.attributes.profession = profession;
      if (this.event.session.attributes.profession.toLowerCase() !== "banker" && this.event.session.attributes.profession.toLowerCase() !== "carpenter" && this.event.session.attributes.profession.toLowerCase() !== "farmer") {
        chooseProfessionAgain.call(this);
      } else {
        chooseProfession.call(this);
      }
    } else {
      this.handler.state = GAME_STATES.PROFESSION_SETUP;
      this.emitWithState('Unhandled');
    }
  },
  'AMAZON.HelpIntent': function() {
    this.response.speak(QUIT_OR_START_OVER + " Otherwise, you must choose a profession. Being a banker makes the game easier because you have a lot of money. Being a farmer is the hardest, but you'll earn the most bonus points. If you want to play on intermediate mode, be a carpenter. So, do you want to be a banker, a carpenter, or a farmer?").listen("Do you want to be a banker, a carpenter, or a farmer?");
    this.emit(":responseReady");
  },
  'AMAZON.StartOverIntent': function() {
    this.handler.state = GAME_STATES.USER_SETUP;
    this.emitWithState('StartGameAgain');
  },
  'AMAZON.CancelIntent': function() {
    this.response.speak(QUIT_OR_START_OVER + " Otherwise, please choose to be a banker, a carpenter, or a farmer.").listen("Please choose to be a banker, a carpenter, or a farmer.");
    this.emit(":responseReady");
  },
  'AMAZON.StopIntent': function() {
    this.response.speak(EXIT_SKILL_MESSAGE);
    this.emit(":responseReady");
  },
  'Unhandled': function() {
    if (this.event.request.intent.name !== "GetProfession") {
      this.response.speak("I'm sorry, but that's not a profession I understand. Please choose to be a banker, a carpenter, or a farmer.").listen("Please choose to be a banker, a carpenter, or a farmer.");
      this.emit(":responseReady");
    } else {
      this.handler.state = GAME_STATES.PROFESSION_SETUP;
      this.emitWithState('AMAZON.HelpIntent');
    }
  },
});

// HANDLE SUPPLIES
const suppliesSetupHandlers = Alexa.CreateStateHandler(GAME_STATES.SUPPLIES_SETUP, {
  'GetNumber': function() {
    if (this.event.session.attributes.hasBeenToGeneralStore === false) {
      generalStore.call(this);
    } else {
      this.event.session.attributes.currentlyBuyingHowMany = +this.event.request.intent.slots.number.value;
      if (this.event.session.attributes.currentlyBuyingWhat !== undefined && (this.event.session.attributes.currentlyBuyingHowMany * this.event.session.attributes.itemPrice > this.event.session.attributes.money)) {
        notEnoughMoney.call(this);
      } else {
        this.event.session.attributes.money -= (this.event.session.attributes.currentlyBuyingHowMany * this.event.session.attributes.itemPrice);
        if (this.event.session.attributes.currentlyBuyingWhat === "pounds of food") {
          this.event.session.attributes.food += this.event.session.attributes.currentlyBuyingHowMany;
          this.event.session.attributes.boughtFood = true;
          generalStore.call(this);
        } else if (this.event.session.attributes.currentlyBuyingWhat === "oxen") {
          if ((this.event.session.attributes.oxen === 0 && this.event.session.attributes.currentlyBuyingHowMany > 0) || this.event.session.attributes.oxen > 1) {
            this.event.session.attributes.oxen += this.event.session.attributes.currentlyBuyingHowMany;
            this.event.session.attributes.boughtOxen = true;
            generalStore.call(this);
          } else {
            mustBuyOxen.call(this);
          }
        } else if (this.event.session.attributes.currentlyBuyingWhat === "spare parts") {
          this.event.session.attributes.parts += this.event.session.attributes.currentlyBuyingHowMany;
          this.event.session.attributes.boughtParts = true;
          generalStore.call(this);
        } else {
          generalStore.call(this);
        }
      }
    }
  },
  'AMAZON.HelpIntent': function() {
    if (this.event.session.attributes.currentlyBuyingWhat === "pounds of food") {
      this.response.speak(QUIT_OR_START_OVER + " Otherwise, you need to buy food. I recommend buying " + (1000 - this.event.session.attributes.food) + " pounds of food. " + Q_HOW_MANY_FOOD).listen(Q_HOW_MANY_FOOD);
      this.emit(":responseReady");
    } else if (this.event.session.attributes.currentlyBuyingWhat === "oxen") {
      this.response.speak(QUIT_OR_START_OVER + " Otherwise, you need to buy oxen. I recommend buying " + (6 - this.event.session.attributes.oxen) + " oxen. " + Q_HOW_MANY_OXEN).listen(Q_HOW_MANY_OXEN);
      this.emit(":responseReady");
    } else if (this.event.session.attributes.currentlyBuyingWhat === "spare parts") {
      if (this.event.session.attributes.profession === "carpenter") {
        this.response.speak(QUIT_OR_START_OVER + " Otherwise, you need to buy spare parts. I recommend buying 0 spare parts. " + Q_HOW_MANY_PARTS).listen(Q_HOW_MANY_PARTS);
        this.emit(":responseReady");
      } else {
        this.response.speak(QUIT_OR_START_OVER + " Otherwise, you need to buy spare parts. I recommend buying " + (3 - this.event.session.attributes.parts) + " spare parts. " + Q_HOW_MANY_PARTS).listen(Q_HOW_MANY_PARTS);
        this.emit(":responseReady");
      }
    } else {
      this.response.speak(QUIT_OR_START_OVER + " Otherwise, say a number, and that's the amount you will buy. How many do you want to buy?").listen("How many do you want to buy?");
      this.emit(":responseReady");
    }
  },
  'AMAZON.StartOverIntent': function() {
    this.handler.state = GAME_STATES.USER_SETUP;
    this.emitWithState('StartGameAgain');
  },
  'AMAZON.CancelIntent': function() {
    if (this.event.session.attributes.currentlyBuyingWhat === "pounds of food") {
      this.response.speak(QUIT_OR_START_OVER + " Otherwise, please tell me how many pounds of food you want to buy.").listen(Q_HOW_MANY_FOOD);
      this.emit(":responseReady");
    } else if (this.event.session.attributes.currentlyBuyingWhat === "oxen") {
      this.response.speak(QUIT_OR_START_OVER + " Otherwise, please tell me how many oxen you want to buy.").listen(Q_HOW_MANY_OXEN);
      this.emit(":responseReady");
    } else if (this.event.session.attributes.currentlyBuyingWhat === "spare parts") {
      this.response.speak(QUIT_OR_START_OVER + " Otherwise, please tell me how many spare parts you want to buy.").listen(Q_HOW_MANY_PARTS);
      this.emit(":responseReady");
    } else {
      this.response.speak(QUIT_OR_START_OVER + " Otherwise, pleast tell me how many you want to buy.").listen("How many do you want to buy?");
      this.emit(":responseReady");
    }
  },
  'AMAZON.StopIntent': function() {
    this.response.speak(EXIT_SKILL_MESSAGE);
    this.emit(":responseReady");
  },
  'Unhandled': function() {
    if (this.event.request.intent.name !== "GetNumber") {
      this.response.speak("I'm sorry, I didn't understand how many " + this.event.session.attributes.currentlyBuyingWhat + " you want to buy. Please say a number.").listen("Please say a number.");
      this.emit(":responseReady");
    } else {
      this.handler.state = GAME_STATES.SUPPLIES_SETUP;
      this.emitWithState('AMAZON.HelpIntent');
    }
  },
});

// HANDLE MONTH
const monthSetupHandlers = Alexa.CreateStateHandler(GAME_STATES.MONTH_SETUP, {
  'GetStartingMonth': function() {
    if (this.event.session.attributes.hasChosenMonth === false) {
      chooseMonth.call(this);
    } else if (this.event.request.intent && this.event.request.intent.slots && this.event.request.intent.slots.month && this.event.request.intent.slots.month.value) {
      this.event.session.attributes.month = this.event.request.intent.slots.month.value;
      if (this.event.session.attributes.month.toLowerCase() !== "march" && this.event.session.attributes.month.toLowerCase() !== "april" && this.event.session.attributes.month.toLowerCase() !== "may" && this.event.session.attributes.month.toLowerCase() !== "june" && this.event.session.attributes.month.toLowerCase() !== "july" && this.event.session.attributes.month.toLowerCase() !== "august") {
        chooseMonthAgain.call(this);
      } else {
        setDays.call(this);
      }
    } else {
      this.handler.state = GAME_STATES.MONTH_SETUP;
      this.emitWithState('Unhandled');
    }
  },
  'AMAZON.HelpIntent': function() {
    this.response.speak(QUIT_OR_START_OVER + " Otherwise, if you want to keep playing, you need to choose a month. Leaving too soon means there won't be enough grass for your oxen to eat, and you may encounter late-spring snow storms. Leaving too late means you won't make it to Oregon before winter. I recommend leaving in May or June. When do you want to leave?").listen("When do you want to leave?");
    this.emit(":responseReady");
  },
  'AMAZON.StartOverIntent': function() {
    this.handler.state = GAME_STATES.USER_SETUP;
    this.emitWithState('StartGameAgain');
  },
  'AMAZON.CancelIntent': function() {
    this.response.speak(QUIT_OR_START_OVER + " Otherwise, please choose a month between March and August.").listen("Please choose a month between March and August.");
    this.emit(":responseReady");
  },
  'AMAZON.StopIntent': function() {
    this.response.speak(EXIT_SKILL_MESSAGE);
    this.emit(":responseReady");
  },
  'Unhandled': function() {
    if (this.event.request.intent.name !== "GetStartingMonth") {
      this.response.speak("I'm sorry, I didn't understand your month. Please choose a month between March and August.").listen("Please choose a month between March and August.");
      this.emit(":responseReady");
    } else {
      this.handler.state = GAME_STATES.MONTH_SETUP;
      this.emitWithState('AMAZON.HelpIntent');
    }
  },
});

// HANDLE GAME EVENTS
const eventHandlers = Alexa.CreateStateHandler(GAME_STATES.EVENT, {
  'PlayGame': function() {
    theOregonTrail.call(this);
  },
  'BeginJourney': function() {
    this.response.speak(goodNewsSFX + "Alright, it's " + this.event.session.attributes.month + "! Say OK to begin your journey.").listen("Say OK to begin your journey.");
    this.response.cardRenderer(statusCardTitle.call(this), statusCardContent.call(this));
    this.emit(":responseReady");
  },
  'Hunting': function() {
    var randomNumber = Math.floor(Math.random() * (10 - 1 + 1)) + 1;
    if (this.event.session.attributes.guess === randomNumber - 3 || this.event.session.attributes.guess === randomNumber + 3) {
      this.event.session.attributes.food += 2;
      this.response.speak(gunShotSFX + "You guessed " + this.event.session.attributes.guess + ". The secret number was " + randomNumber + ". Congratulations! You shot a squirrel and brought back 2 pounds of food. Say OK to continue on the trail.").listen("Say OK to continue on the trail.");
      this.emit(':responseReady');
    } else if (this.event.session.attributes.guess === randomNumber - 2 || this.event.session.attributes.guess === randomNumber + 2) {
      this.event.session.attributes.food += 5;
      this.response.speak(gunShotSFX + "You guessed " + this.event.session.attributes.guess + ". The secret number was " + randomNumber + ". Congratulations! You shot a rabbit and brought back 5 pounds of food. Say OK to continue on the trail.").listen("Say OK to continue on the trail.");
      this.emit(':responseReady');
    } else if (this.event.session.attributes.guess === randomNumber - 1 || this.event.session.attributes.guess === randomNumber + 1) {
      this.event.session.attributes.food += 50;
      this.response.speak(gunShotSFX + "You guessed " + this.event.session.attributes.guess + ". The secret number was " + randomNumber + ". Congratulations! You shot a deer and brought back 50 pounds of food. Say OK to continue on the trail.").listen("Say OK to continue on the trail.");
      this.emit(':responseReady');
    } else if (this.event.session.attributes.guess === randomNumber) {
      this.event.session.attributes.food += 100;
      if (this.event.session.attributes.mapLocation === "Independence" || this.event.session.attributes.mapLocation === "Kansas River" || this.event.session.attributes.mapLocation === "Fort Kearny" || this.event.session.attributes.mapLocation === "Chimney Rock" || this.event.session.attributes.mapLocation === "Fort Laramie") {
        this.response.speak(gunShotSFX + "You guessed " + this.event.session.attributes.guess + ". The secret number was " + randomNumber + ". Congratulations! You shot a buffalo and brought back 100 pounds of food. Say OK to continue on the trail.").listen("Say OK to continue on the trail.");
        this.emit(':responseReady');
      } else {
        this.response.speak(gunShotSFX + "You guessed " + this.event.session.attributes.guess + ". The secret number was " + randomNumber + ". Congratulations! You shot a bear and brought back 100 pounds of food. Say OK to continue on the trail.").listen("Say OK to continue on the trail.");
        this.emit(':responseReady');
      }
    } else {
      this.response.speak(gunShotSFX + "You guessed " + this.event.session.attributes.guess + ". The secret number was " + randomNumber + ". Sorry, you missed your target. Say OK to continue on the trail.").listen("Say OK to continue on the trail.");
      this.emit(':responseReady');
    }
  },
  'Recovery': function() {
    this.response.speak(goodNewsSFX + this.event.session.attributes.recoveredMessage + " Say OK to continue on the trail.").listen("Say OK to continue on the trail.");
    this.emit(":responseReady");
  },
  'RestRecovery': function() {
    if (this.event.session.attributes.howManyToHeal === 0 && this.event.session.attributes.daysOfRest > 1) {
      if (this.event.session.attributes.peopleHealthy.length === 0) {
        this.response.speak("You rested for " + this.event.session.attributes.daysOfRest + " days, but you still aren't feeling any better. Say OK to continue on the trail.").listen("Say OK to continue on the trail.");
        this.emit(":responseReady");
      } else {
        this.response.speak("You rested for " + this.event.session.attributes.daysOfRest + " days, but " + this.event.session.attributes.invalid + " still does not feel any better. Say OK to continue on the trail.").listen("Say OK to continue on the trail.");
        this.emit(":responseReady");
      }
    } else if (this.event.session.attributes.howManyToHeal === 0) {
      if (this.event.session.attributes.peopleHealthy.length === 0) {
        this.response.speak("You rested for one day, but you still aren't feeling any better. Say OK to continue on the trail.").listen("Say OK to continue on the trail.");
        this.emit(":responseReady");
      } else {
        this.response.speak("You rested for one day, but " + this.event.session.attributes.invalid + " still does not feel any better. Say OK to continue on the trail.").listen("Say OK to continue on the trail.");
        this.emit(":responseReady");
      }
    } else {
      this.response.speak("You rested for " + this.event.session.attributes.daysOfRest + " days. " + goodNewsSFX + this.event.session.attributes.recoveredMessage + " Say OK to continue on the trail.").listen("Say OK to continue on the trail.");
      this.emit(":responseReady");
    }
  },
  'FoodAlert': function() {
    this.response.speak(this.event.session.attributes.travelingSFX + badNewsSFX + "You have run out of food. Say OK to continue on the trail.").listen("Say OK to continue on the trail.");
    this.emit(":responseReady");
  },
  'Starve': function() {
    if (this.event.session.attributes.peopleHealthy.length > 1) {
      sickness.call(this);
      this.response.speak(this.event.session.attributes.travelingSFX + hungrySFX + this.event.session.attributes.invalid + " is starving and is very weak. Say OK to continue on the trail.").listen("Say OK to continue on the trail.");
      this.emit(":responseReady");
    } else {
      sickness.call(this);
      this.response.speak(this.event.session.attributes.travelingSFX + hungrySFX + "You are starving and are very weak. Say OK to continue on the trail.").listen("Say OK to continue on the trail.");
      this.emit(":responseReady");
    }
  },
  'StarveToDeath': function() {
    if (this.event.session.attributes.peopleHealthy.length + this.event.session.attributes.peopleSick.length === 1) {
      this.event.session.attributes.peopleHealthy = [];
      this.event.session.attributes.peopleSick = [];
      this.handler.state = GAME_STATES.GAME_OVER;
      this.emitWithState('YouStarved');
    } else {
      deathPeopleSick.call(this);
      this.response.speak(this.event.session.attributes.travelingSFX + deathSFX + this.event.session.attributes.victim + " has died of starvation. Rest in peace " + this.event.session.attributes.victim + ". Say OK to continue on the trail.").listen("Say OK to continue on the trail.");
      this.emit(":responseReady");
    }
  },
  'Death': function() {
    var diseases = ["a fever", "dysentery", "an infection", "dehydration"];
    var fatality = diseases[Math.floor(Math.random() * diseases.length)];
    if (this.event.session.attributes.peopleHealthy.length + this.event.session.attributes.peopleSick.length === 1) {
      this.event.session.attributes.peopleHealthy = [];
      this.event.session.attributes.peopleSick = [];
      this.handler.state = GAME_STATES.GAME_OVER;
      this.emitWithState('YouDied');
    } else if (this.event.session.attributes.peopleSick.length > 0) {
      deathPeopleSick.call(this);
      this.response.speak(this.event.session.attributes.travelingSFX + deathSFX + this.event.session.attributes.victim + " has died of " + fatality + ". Rest in peace " + this.event.session.attributes.victim + ". Now, it's time to move on. Say OK to continue on the trail.").listen("Say OK to continue on the trail.");
      this.emit(":responseReady");
    } else {
      this.event.session.attributes.trailDaysWithoutIncident++;
      this.handler.state = GAME_STATES.EVENT;
      this.emitWithState('PlayGame');
    }
  },
  'Snow': function() {
    this.event.session.attributes.days+= this.event.session.attributes.lostDays;
    this.event.session.attributes.trailDays += this.event.session.attributes.lostDays;
    this.event.session.attributes.food -= this.event.session.attributes.lostDays*(this.event.session.attributes.peopleHealthy.length + this.event.session.attributes.peopleSick.length);
    if (this.event.session.attributes.lostDays === 1) {
      this.response.speak(this.event.session.attributes.travelingSFX + badNewsSFX + "You got stuck in some snow. You have lost 1 day. Say OK to continue on the trail.").listen("Say OK to continue on the trail.");
      this.emit(":responseReady");
    } else if (this.event.session.attributes.lostDays >= 5 && this.event.session.attributes.peopleSick.length + this.event.session.attributes.peopleHealthy.length > 1) {
      if (this.event.session.attributes.peopleSick.length > 0) {
        deathPeopleSick.call(this);
        this.response.speak(this.event.session.attributes.travelingSFX + deathSFX + "You got stuck in a large snow storm. You lost " + this.event.session.attributes.lostDays + " days, and " + this.event.session.attributes.victim + " froze to death. Rest in peace " + this.event.session.attributes.victim + ". Say OK to continue on the trail.").listen("Say OK to continue on the trail.");
        this.emit(":responseReady");
      } else {
        deathPeopleHealthy.call(this);
        this.response.speak(this.event.session.attributes.travelingSFX + deathSFX + "You got stuck in a large snow storm. You lost " + this.event.session.attributes.lostDays + " days, and " + this.event.session.attributes.victim + " froze to death. Rest in peace " + this.event.session.attributes.victim + ". Say OK to continue on the trail.").listen("Say OK to continue on the trail.");
        this.emit(":responseReady");
      }
    } else if (this.event.session.attributes.lostDays >= 5 && this.event.session.attributes.peopleSick.length + this.event.session.attributes.peopleHealthy.length === 1) {
      this.event.session.attributes.peopleHealthy = [];
      this.event.session.attributes.peopleSick = [];
      this.handler.state = GAME_STATES.GAME_OVER;
      this.emitWithState('YouFroze');
    } else {
      this.response.speak(this.event.session.attributes.travelingSFX + badNewsSFX + "You got stuck in some snow. You have lost " + this.event.session.attributes.lostDays + " days. Say OK to continue on the trail.").listen("Say OK to continue on the trail.");
      this.emit(":responseReady");
    }
  },
  'Storm': function() {
    this.event.session.attributes.days += this.event.session.attributes.lostDays;
    this.event.session.attributes.trailDays += this.event.session.attributes.lostDays;
    this.event.session.attributes.food -= this.event.session.attributes.lostDays*(this.event.session.attributes.peopleHealthy.length + this.event.session.attributes.peopleSick.length);
    if (this.event.session.attributes.lostDays >= 3) {
      this.event.session.attributes.oxen -= 1;
      if (this.event.session.attributes.oxen === 0) {
        this.handler.state = GAME_STATES.GAME_OVER;
        this.emitWithState('NoMoreOxenThunderstorm');
      } else {
        this.response.speak(this.event.session.attributes.travelingSFX + stormSFX + "You got caught in a thunderstorm and an ox ran away. You lost " + this.event.session.attributes.lostDays + " days. Say OK to continue on the trail.").listen("Say OK to continue on the trail.");
        this.emit(":responseReady");
      }
    } else if (this.event.session.attributes.lostDays === 1) {
      this.response.speak(this.event.session.attributes.travelingSFX + stormSFX + "You got caught in a thunderstorm. You lost 1 day. Say OK to continue on the trail.").listen("Say OK to continue on the trail.");
      this.emit(":responseReady");
    } else {
      this.response.speak(this.event.session.attributes.travelingSFX + stormSFX + "You got caught in a thunderstorm. You lost " + this.event.session.attributes.lostDays + " days. Say OK to continue on the trail.").listen("Say OK to continue on the trail.");
      this.emit(":responseReady");
    }
  },
  'NoGrass': function() {
    this.event.session.attributes.daysWithoutGrass++;
    if (this.event.session.attributes.daysWithoutGrass % 3 === 0) {
      this.handler.state = GAME_STATES.EVENT;
      this.emitWithState('OxProblem');
    } else {
      this.response.speak(this.event.session.attributes.travelingSFX + "This is a dry month. There's no grass for the oxen. Say OK to continue on the trail.").listen("Say OK to continue on the trail.");
      this.emit(":responseReady");
    }
  },
  'BuffaloStampede': function() {
    var stampedeChance = Math.floor(Math.random() * (10 - 1 + 1)) + 1;
    if (stampedeChance === 9 && this.event.session.attributes.peopleSick.length + this.event.session.attributes.peopleHealthy.length > 1) {
      if (this.event.session.attributes.peopleHealthy.length > 1) {
        deathPeopleHealthy.call(this);
        this.response.speak(this.event.session.attributes.travelingSFX + stampedeSFX + "Oh no! Buffalo stampede! " + this.event.session.attributes.victim + " got trampled. Rest in peace " + this.event.session.attributes.victim + ". Say OK to continue on the trail.").listen("Say OK to continue on the trail.");
        this.emit(":responseReady");
      } else if (this.event.session.attributes.peopleSick.length > 0) {
        deathPeopleSick.call(this);
        this.response.speak(this.event.session.attributes.travelingSFX + stampedeSFX + "Oh no! Buffalo stampede! " + this.event.session.attributes.victim + " got trampled. Rest in peace " + this.event.session.attributes.victim + ". Say OK to continue on the trail.").listen("Say OK to continue on the trail.");
        this.emit(":responseReady");
      }
    } else {
      this.event.session.attributes.trailDaysWithoutIncident++;
      this.handler.state = GAME_STATES.EVENT;
      this.emitWithState('PlayGame');
    }
  },
  'OxProblem': function() {
    var allOxProblems = ["An ox has wandered off.", "An ox has died."];
    var randomOxProblem = allOxProblems[Math.floor(Math.random() * allOxProblems.length)];
    if (this.event.session.attributes.oxen > 1) {
      this.event.session.attributes.oxen -= 1;
      this.response.speak(this.event.session.attributes.travelingSFX + badNewsSFX + randomOxProblem + " Say OK to continue on the trail.").listen("Say OK to continue on the trail.");
      this.emit(":responseReady");
    } else if (this.event.session.attributes.oxen === 1) {
      this.handler.state = GAME_STATES.GAME_OVER;
      this.emitWithState('NoMoreOxenOxProbs');
    }
  },
  'Fire': function() {
    var destroyedItems = [["food", 20],["oxen", 1],["money", 25],["parts", 1],["money", 10]];
    var itemIndex = Math.floor(Math.random() * destroyedItems.length);
    if (destroyedItems[itemIndex][0] == "food") {
      if (this.event.session.attributes.food > destroyedItems[itemIndex][1]) {
        this.event.session.attributes.food -= destroyedItems[itemIndex][1];
        this.response.speak(this.event.session.attributes.travelingSFX + badNewsSFX + "A fire broke out in your wagon and destroyed " + destroyedItems[itemIndex][1] + " pounds of food. Say OK to continue on the trail.").listen("Say OK to continue on the trail.");
        this.emit(":responseReady");
      } else if (this.event.session.attributes.food > 0) {
        this.event.session.attributes.food = 0;
        this.response.speak(this.event.session.attributes.travelingSFX + badNewsSFX + "A fire broke out in your wagon and destroyed the rest of your food. Say OK to continue on the trail.").listen("Say OK to continue on the trail.");
        this.emit(":responseReady");
      } else {
        this.event.session.attributes.trailDaysWithoutIncident++;
        this.handler.state = GAME_STATES.EVENT;
        this.emitWithState('PlayGame');
      }
    } else if (destroyedItems[itemIndex][0] == "oxen") {
      if (this.event.session.attributes.oxen > destroyedItems[itemIndex][1]) {
        this.event.session.attributes.oxen -= destroyedItems[itemIndex][1];
        if (destroyedItems[itemIndex][1] === 1) {
          this.response.speak(this.event.session.attributes.travelingSFX + badNewsSFX + "A fire broke out in your wagon and killed an ox. Say OK to continue on the trail.").listen("Say OK to continue on the trail.");
          this.emit(":responseReady");
        } else {
          this.response.speak(this.event.session.attributes.travelingSFX + badNewsSFX + "A fire broke out in your wagon and killed " + destroyedItems[itemIndex][1] + " oxen. Say OK to continue on the trail.").listen("Say OK to continue on the trail.");
          this.emit(":responseReady");
        }
      } else if (this.event.session.attributes.oxen > 0) {
        this.handler.state = GAME_STATES.GAME_OVER;
        this.emitWithState('NoMoreOxenFire');
      } else {
        this.event.session.attributes.trailDaysWithoutIncident++;
        this.handler.state = GAME_STATES.EVENT;
        this.emitWithState('PlayGame');
      }
    } else if (destroyedItems[itemIndex][0] == "parts") {
      if (this.event.session.attributes.parts > destroyedItems[itemIndex][1]) {
        this.event.session.attributes.parts -= destroyedItems[itemIndex][1];
        if (destroyedItems[itemIndex][1] === 1) {
          this.response.speak(this.event.session.attributes.travelingSFX + badNewsSFX + "A fire broke out in your wagon and destroyed a spare part. Say OK to continue on the trail.").listen("Say OK to continue on the trail.");
          this.emit(":responseReady");
        } else {
          this.response.speak(this.event.session.attributes.travelingSFX + badNewsSFX + "A fire broke out in your wagon and destroyed " + destroyedItems[itemIndex][1] + " spare parts. Say OK to continue on the trail.").listen("Say OK to continue on the trail.");
          this.emit(":responseReady");
        }
      } else if (this.event.session.attributes.parts > 0) {
        this.event.session.attributes.parts = 0;
        this.response.speak(this.event.session.attributes.travelingSFX + badNewsSFX + "A fire broke out in your wagon and destroyed your remaining spare parts. Say OK to continue on the trail.").listen("Say OK to continue on the trail.");
        this.emit(":responseReady");
      } else {
        this.event.session.attributes.trailDaysWithoutIncident++;
        this.handler.state = GAME_STATES.EVENT;
        this.emitWithState('PlayGame');
      }
    } else if (destroyedItems[itemIndex][0] == "money") {
      if (this.event.session.attributes.money > destroyedItems[itemIndex][1]) {
        this.event.session.attributes.money -= destroyedItems[itemIndex][1];
        this.response.speak(this.event.session.attributes.travelingSFX + badNewsSFX + "A fire broke out in your wagon and destroyed $" + destroyedItems[itemIndex][1] + ". Say OK to continue on the trail.").listen("Say OK to continue on the trail.");
        this.emit(":responseReady");
      } else if (this.event.session.attributes.money > 0) {
        this.event.session.attributes.money = 0;
        this.response.speak(this.event.session.attributes.travelingSFX + badNewsSFX + "A fire broke out in your wagon and destroyed the rest of your money. Say OK to continue on the trail.").listen("Say OK to continue on the trail.");
        this.emit(":responseReady");
      } else {
        this.event.session.attributes.trailDaysWithoutIncident++;
        this.handler.state = GAME_STATES.EVENT;
        this.emitWithState('PlayGame');
      }
    } else {
      this.event.session.attributes.trailDaysWithoutIncident++;
      this.handler.state = GAME_STATES.EVENT;
      this.emitWithState('PlayGame');
    }
  },
  'Thief': function() {
    var stolenItems = [["food", 20],["oxen", 1],["money", 25],["parts", 1],["money", 10]];
    var itemIndex = Math.floor(Math.random() * stolenItems.length);
    if (stolenItems[itemIndex][0] == "food") {
      if (this.event.session.attributes.food > stolenItems[itemIndex][1]) {
        this.event.session.attributes.food -= stolenItems[itemIndex][1];
        this.response.speak(this.event.session.attributes.travelingSFX + badNewsSFX + "A thief broke into your wagon and stole " + stolenItems[itemIndex][1] + " pounds of food. Say OK to continue on the trail.").listen("Say OK to continue on the trail.");
        this.emit(":responseReady");
      } else if (this.event.session.attributes.food > 0) {
        this.event.session.attributes.food = 0;
        this.response.speak(this.event.session.attributes.travelingSFX + badNewsSFX + "A thief broke into your wagon and stole the rest of your food. Say OK to continue on the trail.").listen("Say OK to continue on the trail.");
        this.emit(":responseReady");
      } else {
        this.event.session.attributes.trailDaysWithoutIncident++;
        this.handler.state = GAME_STATES.EVENT;
        this.emitWithState('PlayGame');
      }
    } else if (stolenItems[itemIndex][0] == "oxen") {
      if (this.event.session.attributes.oxen > stolenItems[itemIndex][1]) {
        this.event.session.attributes.oxen -= stolenItems[itemIndex][1];
        if (stolenItems[itemIndex][1] === 1) {
          this.response.speak(this.event.session.attributes.travelingSFX + badNewsSFX + "A thief stole an ox when you weren't looking. Say OK to continue on the trail.").listen("Say OK to continue on the trail.");
          this.emit(":responseReady");
        } else {
          this.response.speak(this.event.session.attributes.travelingSFX + badNewsSFX + "A thief stole " + stolenItems[itemIndex][1] + " oxen when you weren't looking. Say OK to continue on the trail.").listen("Say OK to continue on the trail.");
          this.emit(":responseReady");
        }
      } else if (this.event.session.attributes.oxen > 0) {
        this.handler.state = GAME_STATES.GAME_OVER;
        this.emitWithState('NoMoreOxenThief');
      } else {
        this.event.session.attributes.trailDaysWithoutIncident++;
        this.handler.state = GAME_STATES.EVENT;
        this.emitWithState('PlayGame');
      }
    } else if (stolenItems[itemIndex][0] == "parts") {
      if (this.event.session.attributes.parts > stolenItems[itemIndex][1]) {
        this.event.session.attributes.parts -= stolenItems[itemIndex][1];
        if (stolenItems[itemIndex][1] === 1) {
          this.response.speak(this.event.session.attributes.travelingSFX + badNewsSFX + "A thief broke into your wagon and stole a spare part. Say OK to continue on the trail.").listen("Say OK to continue on the trail.");
          this.emit(":responseReady");
        } else {
          this.response.speak(this.event.session.attributes.travelingSFX + badNewsSFX + "A thief broke into your wagon and stole " + stolenItems[itemIndex][1] + " spare parts. Say OK to continue on the trail.").listen("Say OK to continue on the trail.");
          this.emit(":responseReady");
        }
      } else if (this.event.session.attributes.parts > 0) {
        this.event.session.attributes.parts = 0;
        this.response.speak(this.event.session.attributes.travelingSFX + badNewsSFX + "A thief broke into your wagon and stole your remaining spare parts. Say OK to continue on the trail.").listen("Say OK to continue on the trail.");
        this.emit(":responseReady");
      } else {
        this.event.session.attributes.trailDaysWithoutIncident++;
        this.handler.state = GAME_STATES.EVENT;
        this.emitWithState('PlayGame');
      }
    } else if (stolenItems[itemIndex][0] == "money") {
      if (this.event.session.attributes.money > stolenItems[itemIndex][1]) {
        this.event.session.attributes.money -= stolenItems[itemIndex][1];
        this.response.speak(this.event.session.attributes.travelingSFX + badNewsSFX + "A thief broke into your wagon and stole $" + stolenItems[itemIndex][1] + ". Say OK to continue on the trail.").listen("Say OK to continue on the trail.");
        this.emit(":responseReady");
      } else if (this.event.session.attributes.money > 0) {
        this.event.session.attributes.money = 0;
        this.response.speak(this.event.session.attributes.travelingSFX + badNewsSFX + "A thief broke into your wagon and stole the rest of your money. Say OK to continue on the trail.").listen("Say OK to continue on the trail.");
        this.emit(":responseReady");
      } else {
        this.event.session.attributes.trailDaysWithoutIncident++;
        this.handler.state = GAME_STATES.EVENT;
        this.emitWithState('PlayGame');
      }
    } else {
      this.event.session.attributes.trailDaysWithoutIncident++;
      this.handler.state = GAME_STATES.EVENT;
      this.emitWithState('PlayGame');
    }
  },
  'FindItems': function() {
    var foundItems = [["food", 50],["oxen", 2],["money", 50],["parts", 1],["money", 100]];
    var itemIndex = Math.floor(Math.random() * foundItems.length);
    if (foundItems[itemIndex][0] == "food") {
      this.event.session.attributes.food += foundItems[itemIndex][1];
      this.response.speak(this.event.session.attributes.travelingSFX + goodNewsSFX + "You found an abandoned wagon on the trail. After looking around, you found " + foundItems[itemIndex][1] + " pounds of food. Say OK to continue on the trail.").listen("Say OK to continue on the trail.");
      this.emit(":responseReady");
    } else if (foundItems[itemIndex][0] == "oxen") {
      this.event.session.attributes.oxen += foundItems[itemIndex][1];
      if (foundItems[itemIndex][1] === 1) {
        this.response.speak(this.event.session.attributes.travelingSFX + goodNewsSFX + "You found an abandoned wagon on the trail. After looking around, you found an ox. Say OK to continue on the trail.").listen("Say OK to continue on the trail.");
        this.emit(":responseReady");
      } else {
        this.response.speak(this.event.session.attributes.travelingSFX + goodNewsSFX + "You found an abandoned wagon on the trail. After looking around, you found " + foundItems[itemIndex][1] + " oxen. Say OK to continue on the trail.").listen("Say OK to continue on the trail.");
        this.emit(":responseReady");
      }
    } else if (foundItems[itemIndex][0] == "parts") {
      this.event.session.attributes.parts += foundItems[itemIndex][1];
      if (foundItems[itemIndex][1] === 1) {
        this.response.speak(this.event.session.attributes.travelingSFX + goodNewsSFX + "You found an abandoned wagon on the trail. After looking around, you found a spare part. Say OK to continue on the trail.").listen("Say OK to continue on the trail.");
        this.emit(":responseReady");
      } else {
        this.response.speak(this.event.session.attributes.travelingSFX + goodNewsSFX + "You found an abandoned wagon on the trail. After looking around, you found " + foundItems[itemIndex][1] + " spare parts. Say OK to continue on the trail.").listen("Say OK to continue on the trail.");
        this.emit(":responseReady");
      }
    } else if (foundItems[itemIndex][0] == "money") {
      this.event.session.attributes.money += foundItems[itemIndex][1];
      this.response.speak(this.event.session.attributes.travelingSFX + goodNewsSFX + "You found an abandoned wagon on the trail. After looking around, you found $" + foundItems[itemIndex][1] + ". Say OK to continue on the trail.").listen("Say OK to continue on the trail.");
      this.emit(":responseReady");
    } else {
      this.event.session.attributes.trailDaysWithoutIncident++;
      this.handler.state = GAME_STATES.EVENT;
      this.emitWithState('PlayGame');
    }
    window[foundItems[itemIndex][0]] += foundItems[itemIndex][1];
    this.response.speak(this.event.session.attributes.travelingSFX + goodNewsSFX + "You found an abandoned wagon on the trail. After looking around, you found " + foundItems[itemIndex][1] + " " + foundItems[itemIndex][2] + ". Say OK to continue on the trail.").listen("Say OK to continue on the trail.");
    this.emit(":responseReady");
  },
  'FindBerries': function() {
    this.event.session.attributes.daysWithoutFood = 0;
    var berries = (Math.floor(Math.random() * (10 - 1 + 1)) + 1)*3;
    this.event.session.attributes.food += berries;
    this.response.speak(this.event.session.attributes.travelingSFX + goodNewsSFX + "You found wild berries, and you harvested " + berries + " pounds. Say OK to continue on the trail.").listen("Say OK to continue on the trail.");
    this.emit(":responseReady");
  },
  'BrokenWagon': function() {
    if (this.event.session.attributes.parts > 0) {
      this.event.session.attributes.parts -= 1;
      this.event.session.attributes.days++;
      this.event.session.attributes.trailDays++;
      this.event.session.attributes.food -= (this.event.session.attributes.peopleHealthy.length + this.event.session.attributes.peopleSick.length);
      if (this.event.session.attributes.parts === 1) {
        this.response.speak(this.event.session.attributes.travelingSFX + badNewsSFX + "Your wagon broke, but you repaired it. You now have " + this.event.session.attributes.parts + " spare part. Say OK to continue on the trail.").listen("Say OK to continue on the trail.");
        this.emit(":responseReady");
      } else {
        this.response.speak(this.event.session.attributes.travelingSFX + badNewsSFX + "Your wagon broke, but you repaired it. You now have " + this.event.session.attributes.parts + " spare parts. Say OK to continue on the trail.").listen("Say OK to continue on the trail.");
        this.emit(":responseReady");
      }
    } else {
      this.handler.state = GAME_STATES.GAME_OVER;
      this.emitWithState('BrokenWagon');
    }
  },
  'GetLost': function() {
    var howLong = Math.floor(Math.random() * (5 - 1 + 1)) + 1;
    this.event.session.attributes.days += howLong;
    this.event.session.attributes.trailDays += howLong;
    this.event.session.attributes.food -= howLong*(this.event.session.attributes.peopleHealthy.length + this.event.session.attributes.peopleSick.length);
    if (howLong === 1) {
      this.response.speak(this.event.session.attributes.travelingSFX + badNewsSFX + "You lost the trail. You wasted 1 day. Say OK to continue on the trail.").listen("Say OK to continue on the trail.");
      this.emit(":responseReady");
    } else {
      this.response.speak(this.event.session.attributes.travelingSFX + badNewsSFX + "You lost the trail. You wasted " + howLong + " days. Say OK to continue on the trail.").listen("Say OK to continue on the trail.");
      this.emit(":responseReady");
    }
  },
  'RiverSuccess': function() {
    this.response.speak(riverSFX + goodNewsSFX + "Congratulations! You safely crossed the river. Say OK to continue on the trail.").listen("Say OK to continue on the trail.");
    this.emit(":responseReady");
  },
  'RiverAccident': function() {
    this.response.speak(riverSFX + badNewsSFX + "You made it across, but water seeped in. You lost " + this.event.session.attributes.fate * 3 + " pounds of food. Say OK to continue on the trail.").listen("Say OK to continue on the trail.");
    this.emit(":responseReady");
  },
  'RiverDeath': function() {
    this.response.speak(riverSFX + deathSFX + "Your wagon was overtaken by water, and " + this.event.session.attributes.victim + " drowned. You also lost " + this.event.session.attributes.fate * 10 + " pounds of food. Rest in peace " + this.event.session.attributes.victim + ". Say OK to continue on the trail.").listen("Say OK to continue on the trail.");
    this.emit(":responseReady");
  },
  'NoFerryMoneyRiverSuccess': function() {
    this.response.speak("Sorry, you don't have enough money to pay the ferry. You will have to try floating across the river." + riverSFX + goodNewsSFX + "Congratulations! You safely crossed the river. Say OK to continue on the trail.").listen("Say OK to continue on the trail.");
    this.emit(":responseReady");
  },
  'NoFerryMoneyRiverAccident': function() {
    this.response.speak("Sorry, you don't have enough money to pay the ferry. You will have to try floating across the river." + riverSFX + badNewsSFX + "You made it across, but water seeped in. You lost " + this.event.session.attributes.fate * 3 + " pounds of food. Say OK to continue on the trail.").listen("Say OK to continue on the trail.");
    this.emit(":responseReady");
  },
  'NoFerryMoneyRiverDeath': function() {
    this.response.speak("Sorry, you don't have enough money to pay the ferry. You will have to try floating across the river." + riverSFX + deathSFX + "Your wagon was overtaken by water, and " + this.event.session.attributes.victim + " drowned. You also lost " + this.event.session.attributes.fate * 10 + " pounds of food. Rest in peace " + this.event.session.attributes.victim + ". Say OK to continue on the trail.").listen("Say OK to continue on the trail.");
    this.emit(":responseReady");
  },
  'ChimneyRock': function() {
    this.response.speak(this.event.session.attributes.travelingSFX + goodNewsSFX + "You have arrived at Chimney Rock. Congratulations! Located in western Nebraska, Chimney Rock is a prominent geological formation that rises nearly 300 feet above the surrounding plains. For this reason, it is a well-known landmark along the trail, which means you're going the right way. Say OK to continue on the trail.").listen("Say OK to continue on the trail.");
    this.response.cardRenderer(statusCardTitle.call(this), statusCardContent.call(this));
    this.emit(":responseReady");
  },
  'IndependenceRock': function() {
    this.response.speak(this.event.session.attributes.travelingSFX + goodNewsSFX + "You have arrived at Independence Rock. Congratulations! Located in central Wyoming, Independence Rock is a large granite hill where many pioneers carve their names. It is a well-known landmark along the trail. Say OK to continue on the trail.").listen("Say OK to continue on the trail.");
    this.response.cardRenderer(statusCardTitle.call(this), statusCardContent.call(this));
    this.emit(":responseReady");
  },
  'SouthPass': function() {
    this.response.speak(this.event.session.attributes.travelingSFX + goodNewsSFX + "You have arrived at South Pass. Congratulations! Located in southwestern Wyoming, South Pass is the lowest point along the continental divide. It's the easiest way to cross the Rocky Mountains. Say OK to continue on the trail.").listen("Say OK to continue on the trail.");
    this.response.cardRenderer(statusCardTitle.call(this), statusCardContent.call(this));
    this.emit(":responseReady");
  },
  'SodaSprings': function() {
    this.response.speak(this.event.session.attributes.travelingSFX + goodNewsSFX + "You have arrived at Soda Springs. Congratulations! Located in southeastern Idaho, these springs bubble like soda water, which is how they got their name. It's a popular place to bathe and relax, but don't drink the water! You might get sick. Say OK to continue on the trail.").listen("Say OK to continue on the trail.");
    this.response.cardRenderer(statusCardTitle.call(this), statusCardContent.call(this));
    this.emit(":responseReady");
  },
  'TheDalles': function() {
    this.response.speak(this.event.session.attributes.travelingSFX + goodNewsSFX + "You have arrived at The Dalles. Congratulations! Located in northern Oregon, the Dalles is where the trail stops. You are blocked by the cascade mountains, and the only way to finish your journey is by floating down the Colombia River. It's going to be a treacherous last stretch. Say OK to continue.").listen("Say OK to continue.");
    this.response.cardRenderer(statusCardTitle.call(this), statusCardContent.call(this));
    this.emit(":responseReady");
  },
  'ChoseFortBridger': function() {
    this.response.speak("Great! You're going to Fort Bridger. Say OK to continue on the trail.").listen("Say OK to continue on the trail.");
    this.emit(":responseReady");
  },
  'ChoseSodaSprings': function() {
    this.response.speak("Great! You're going to Soda Springs. Say OK to continue on the trail.").listen("Say OK to continue on the trail.");
    this.emit(":responseReady");
  },
  'ChoseFortWallaWalla': function() {
    this.response.speak("Great! You're going to Fort Walla Walla. Say OK to continue on the trail.").listen("Say OK to continue on the trail.");
    this.emit(":responseReady");
  },
  'ChoseTheDalles': function() {
    this.response.speak("Great! You're going to The Dalles. Say OK to continue on the trail.").listen("Say OK to continue on the trail.");
    this.emit(":responseReady");
  },
  'ChoseBarlowTollRoad': function() {
    if (this.event.session.attributes.money >= 30) {
      this.event.session.attributes.money -= 30;
      this.response.speak("Great! You're taking the Barlow Toll Road to Oregon City. Say OK to continue on the trail.").listen("Say OK to continue on the trail.");
      this.emit(":responseReady");
    } else {
      this.handler.state = GAME_STATES.COLUMBIA_RIVER;
      this.emitWithState('NoMoneyColumbiaRiver');
    }
  },
  'LeaveFort': function() {
    this.response.speak("Sorry, you don't have any money to buy anything, and no one else wants to trade with you. It's time to move on. Say OK to continue on the trail.").listen("Say OK to continue on the trail.");
    this.emit(":responseReady");
  },
  'ContinueGame': function() {
    this.event.session.attributes.trailDaysWithoutIncident = 0;
    if (this.event.session.attributes.mapLocation === "The Dalles") {
      this.event.session.attributes.mapLocation = "Columbia River";
      this.handler.state = GAME_STATES.COLUMBIA_RIVER;
      this.emitWithState('TimeToFloat');
    } else if (this.event.session.attributes.mapLocation === "Fort Walla Walla") {
      this.event.session.attributes.mapLocation = "Exit Fort Walla Walla";
    } else {
      this.handler.state = GAME_STATES.EVENT;
      this.emitWithState('PlayGame');
    }
  },
  'AMAZON.HelpIntent': function() {
    this.response.speak(QUIT_OR_START_OVER + " Otherwise, say OK to continue on the trail.").listen("Say OK to continue on the trail.");
    this.emit(":responseReady");
  },
  'AMAZON.StartOverIntent': function() {
    this.handler.state = GAME_STATES.USER_SETUP;
    this.emitWithState('StartGameAgain');
  },
  'AMAZON.CancelIntent': function() {
    this.handler.state = GAME_STATES.EVENT;
    this.emitWithState('AMAZON.HelpIntent');
  },
  'AMAZON.StopIntent': function() {
    this.response.speak(EXIT_SKILL_MESSAGE);
    this.emit(":responseReady");
  },
  'Unhandled': function() {
    this.handler.state = GAME_STATES.EVENT;
    this.emitWithState('AMAZON.HelpIntent');
  },
});

// HANDLE FORTS
const fortHandlers = Alexa.CreateStateHandler(GAME_STATES.FORT, {
  'WelcomeToFort': function() {
    this.event.session.attributes.tradeAllowed = true;
    if (this.event.session.attributes.oxen === 1 && this.event.session.attributes.parts === 1) {
      this.response.speak(this.event.session.attributes.travelingSFX + fortSFX + "Welcome to " + this.event.session.attributes.mapLocation + "! It's " + dateFrom1846(this.event.session.attributes.days).toDateString() + ", and you have traveled " + this.event.session.attributes.miles + " miles in " + this.event.session.attributes.trailDays + " days. You currently have " + this.event.session.attributes.food + " pounds of food, " + this.event.session.attributes.oxen + " ox, " + this.event.session.attributes.parts + " spare part, and $" + this.event.session.attributes.money + ". Do you want to buy or trade anything while you're here?").listen("Do you want to buy or trade anything while you're here?");
      this.response.cardRenderer(statusCardTitle.call(this), statusCardContent.call(this));
      this.emit(":responseReady");
    } else if (this.event.session.attributes.oxen === 1 && this.event.session.attributes.parts > 1) {
      this.response.speak(this.event.session.attributes.travelingSFX + fortSFX + "Welcome to " + this.event.session.attributes.mapLocation + "! It's " + dateFrom1846(this.event.session.attributes.days).toDateString() + ", and you have traveled " + this.event.session.attributes.miles + " miles in " + this.event.session.attributes.trailDays + " days. You currently have " + this.event.session.attributes.food + " pounds of food, " + this.event.session.attributes.oxen + " ox, " + this.event.session.attributes.parts + " spare parts, and $" + this.event.session.attributes.money + ". Do you want to buy or trade anything while you're here?").listen("Do you want to buy or trade anything while you're here?");
      this.response.cardRenderer(statusCardTitle.call(this), statusCardContent.call(this));
      this.emit(":responseReady");
    } else if (this.event.session.attributes.oxen > 1 && this.event.session.attributes.parts === 1) {
      this.response.speak(this.event.session.attributes.travelingSFX + fortSFX + "Welcome to " + this.event.session.attributes.mapLocation + "! It's " + dateFrom1846(this.event.session.attributes.days).toDateString() + ", and you have traveled " + this.event.session.attributes.miles + " miles in " + this.event.session.attributes.trailDays + " days. You currently have " + this.event.session.attributes.food + " pounds of food, " + this.event.session.attributes.oxen + " oxen, " + this.event.session.attributes.parts + " spare part, and $" + this.event.session.attributes.money + ". Do you want to buy or trade anything while you're here?").listen("Do you want to buy or trade anything while you're here?");
      this.response.cardRenderer(statusCardTitle.call(this), statusCardContent.call(this));
      this.emit(":responseReady");
    } else {
      this.response.speak(this.event.session.attributes.travelingSFX + fortSFX + "Welcome to " + this.event.session.attributes.mapLocation + "! It's " + dateFrom1846(this.event.session.attributes.days).toDateString() + ", and you have traveled " + this.event.session.attributes.miles + " miles in " + this.event.session.attributes.trailDays + " days. You currently have " + this.event.session.attributes.food + " pounds of food, " + this.event.session.attributes.oxen + " oxen, " + this.event.session.attributes.parts + " spare parts, and $" + this.event.session.attributes.money + ". Do you want to buy or trade anything while you're here?").listen("Do you want to buy or trade anything while you're here?");
      this.response.cardRenderer(statusCardTitle.call(this), statusCardContent.call(this));
      this.emit(":responseReady");
    }
  },
  'Status': function() {
    if (this.event.session.attributes.oxen === 1 && this.event.session.attributes.parts === 1) {
      this.response.speak("You have " + this.event.session.attributes.food + " pounds of food, " + this.event.session.attributes.oxen + " ox, " + this.event.session.attributes.parts + " spare part, and $" + this.event.session.attributes.money + ". Do you want to buy or trade anything else?").listen("Do you want to buy or trade anything else?");
      this.emit(":responseReady");
    } else if (this.event.session.attributes.oxen === 1 && this.event.session.attributes.parts > 1) {
      this.response.speak("You have " + this.event.session.attributes.food + " pounds of food, " + this.event.session.attributes.oxen + " ox, " + this.event.session.attributes.parts + " spare parts, and $" + this.event.session.attributes.money + ". Do you want to buy or trade anything else?").listen("Do you want to buy or trade anything else?");
      this.emit(":responseReady");
    } else if (this.event.session.attributes.oxen > 1 && this.event.session.attributes.parts === 1) {
      this.response.speak("You have " + this.event.session.attributes.food + " pounds of food, " + this.event.session.attributes.oxen + " oxen, " + this.event.session.attributes.parts + " spare part, and $" + this.event.session.attributes.money + ". Do you want to buy or trade anything else?").listen("Do you want to buy or trade anything else?");
      this.emit(":responseReady");
    } else {
      this.response.speak("You have " + this.event.session.attributes.food + " pounds of food, " + this.event.session.attributes.oxen + " oxen, " + this.event.session.attributes.parts + " spare parts, and $" + this.event.session.attributes.money + ". Do you want to buy or trade anything else?").listen("Do you want to buy or trade anything else?");
      this.emit(":responseReady");
    }
  },
  'TradeSuccess': function() {
    this.event.session.attributes.tradeDeal = 0;
    if (this.event.session.attributes.oxen === 1 && this.event.session.attributes.parts === 1) {
      this.response.speak(goodNewsSFX + "It's a deal! You now have " + this.event.session.attributes.food + " pounds of food, " + this.event.session.attributes.oxen + " ox, " + this.event.session.attributes.parts + " spare part, and $" + this.event.session.attributes.money + ". Do you want to buy or trade anything else?").listen("Do you want to buy or trade anything else?");
      this.emit(":responseReady");
    } else if (this.event.session.attributes.oxen === 1 && this.event.session.attributes.parts > 1) {
      this.response.speak(goodNewsSFX + "It's a deal! You now have " + this.event.session.attributes.food + " pounds of food, " + this.event.session.attributes.oxen + " ox, " + this.event.session.attributes.parts + " spare parts, and $" + this.event.session.attributes.money + ". Do you want to buy or trade anything else?").listen("Do you want to buy or trade anything else?");
      this.emit(":responseReady");
    } else if (this.event.session.attributes.oxen > 1 && this.event.session.attributes.parts === 1) {
      this.response.speak(goodNewsSFX + "It's a deal! You now have " + this.event.session.attributes.food + " pounds of food, " + this.event.session.attributes.oxen + " oxen, " + this.event.session.attributes.parts + " spare part, and $" + this.event.session.attributes.money + ". Do you want to buy or trade anything else?").listen("Do you want to buy or trade anything else?");
      this.emit(":responseReady");
    } else {
      this.response.speak(goodNewsSFX + "It's a deal! You now have " + this.event.session.attributes.food + " pounds of food, " + this.event.session.attributes.oxen + " oxen, " + this.event.session.attributes.parts + " spare parts, and $" + this.event.session.attributes.money + ". Do you want to buy or trade anything else?").listen("Do you want to buy or trade anything else?");
      this.emit(":responseReady");
    }
  },
  'TradeFailure': function() {
    if (this.event.session.attributes.tradeDeal === 1 || this.event.session.attributes.tradeDeal === 10) {
      this.event.session.attributes.tradeDeal = 0;
      this.response.speak(badNewsSFX + "Sorry, you don't have enough food to make the trade. Do you want to buy or trade anything else?").listen("Do you want to buy or trade anything else?");
      this.emit(":responseReady");
    } else if (this.event.session.attributes.tradeDeal === 2 || this.event.session.attributes.tradeDeal === 8) {
      this.event.session.attributes.tradeDeal = 0;
      this.response.speak(badNewsSFX + "Sorry, you only have one ox. You must keep him to continue on the trail. Do you want to buy or trade anything else?").listen("Do you want to buy or trade anything else?");
      this.emit(":responseReady");
    } else if (this.event.session.attributes.tradeDeal === 3 || this.event.session.attributes.tradeDeal === 5 || this.event.session.attributes.tradeDeal === 9) {
      this.event.session.attributes.tradeDeal = 0;
      this.response.speak(badNewsSFX + "Sorry, you don't have any spare parts to make the trade. Do you want to buy or trade anything else?").listen("Do you want to buy or trade anything else?");
      this.emit(":responseReady");
    } else if (this.event.session.attributes.tradeDeal === 4 || this.event.session.attributes.tradeDeal === 7) {
      this.event.session.attributes.tradeDeal = 0;
      this.response.speak(badNewsSFX + "Sorry, you don't have enough money to make the trade. Do you want to buy or trade anything else?").listen("Do you want to buy or trade anything else?");
      this.emit(":responseReady");
    } else if (this.event.session.attributes.tradeDeal === 6) {
      this.event.session.attributes.tradeDeal = 0;
      this.response.speak(badNewsSFX + "Sorry, you only have two oxen. If you trade them both away, you won't be able to continue on the trail. Do you want to buy or trade anything else?").listen("Do you want to buy or trade anything else?");
      this.emit(":responseReady");
    } else {
      this.event.session.attributes.tradeDeal = 0;
      this.response.speak(badNewsSFX + "Sorry, it's not a deal. Do you want to buy or trade anything else?").listen("Do you want to buy or trade anything else?");
      this.emit(":responseReady");
    }
  },
  'NotEnoughMoney': function() {
    this.event.session.attributes.purchaseChoice = "trade";
    this.response.speak(badNewsSFX + "Sorry, you don't have enough money. You only have $" + this.event.session.attributes.money + ". Do you want to try again?").listen("Do you want to try again?");
    this.emit(":responseReady");
  },
  'GetBuyOrTradeItem': function() {
    if (this.event.request.intent && this.event.request.intent.slots && this.event.request.intent.slots.buy_or_trade && this.event.request.intent.slots.buy_or_trade.value) {
      if (this.event.request.intent.slots.buy_or_trade.resolutions.resolutionsPerAuthority[0].values[0].value.id === "BUY") {
        this.handler.state = GAME_STATES.SHOPPING;
        this.emitWithState('WelcomeToStore');
      } else if (this.event.request.intent.slots.buy_or_trade.resolutions.resolutionsPerAuthority[0].values[0].value.id === "TRADE") {
        this.handler.state = GAME_STATES.TRADING;
        this.emitWithState('Offer');
      } else {
        this.handler.state = GAME_STATES.FORT;
        this.emitWithState('Unhandled');
      }
    } else {
      this.handler.state = GAME_STATES.FORT;
      this.emitWithState('Unhandled');
    }
  },
  'AMAZON.YesIntent': function() {
    this.response.speak("Ok. You can buy supplies from the store, or you can try to trade supplies with other pioneers. What do you want to do? Please choose to buy or trade.").listen("Say buy or trade, or say cancel if you changed your mind.");
    this.emit(":responseReady");
  },
  'AMAZON.NoIntent': function() {
    if (this.event.session.attributes.purchaseChoice === "trade" && this.event.session.attributes.tradeAllowed === true) {
      this.handler.state = GAME_STATES.CHANGE_PURCHASE;
      this.emitWithState('TradeInstead');
    } else {
      this.event.session.attributes.trailDaysWithoutIncident = 0;
      if (this.event.session.attributes.mapLocation === "Fort Walla Walla") {
        this.event.session.attributes.mapLocation = "Exit Fort Walla Walla";
      }
      this.handler.state = GAME_STATES.EVENT;
      this.emitWithState('PlayGame');
    }
  },
  'AMAZON.HelpIntent': function() {
    this.response.speak(QUIT_OR_START_OVER + " Otherwise, if you want to buy something from the fort's general store, say buy, and if you want to try trading, say trade. To leave the fort, you can say cancel. What do you want to do?").listen("What do you want to do?");
    this.emit(":responseReady");
  },
  'AMAZON.StartOverIntent': function() {
    this.handler.state = GAME_STATES.USER_SETUP;
    this.emitWithState('StartGameAgain');
  },
  'AMAZON.CancelIntent': function() {
    this.event.session.attributes.trailDaysWithoutIncident = 0;
    if (this.event.session.attributes.mapLocation === "Fort Walla Walla") {
      this.event.session.attributes.mapLocation = "Exit Fort Walla Walla";
    }
    this.handler.state = GAME_STATES.EVENT;
    this.emitWithState('PlayGame');
  },
  'AMAZON.StopIntent': function() {
    this.response.speak(EXIT_SKILL_MESSAGE);
    this.emit(":responseReady");
  },
  'Unhandled': function() {
    this.response.speak("Sorry, I didn't understand that. Do you want to buy or trade anything at this fort?").listen("Say buy or trade if you do, or say no.");
    this.emit(":responseReady");
  },
});

// HANDLE FIRST TRAIL SPLIT
const firstTrailSplitHandlers = Alexa.CreateStateHandler(GAME_STATES.FIRST_TRAIL_SPLIT, {
  'ChooseDirection': function() {
    this.event.session.attributes.hasChosenFirstDirection = true;
    this.response.speak("The trail splits here. You can go to Fort Bridger, or you can take the shortcut to Soda Springs. Which way do you want to go?").listen("Do you want to go to Fort Bridger, or Soda Springs?");
    this.emit(":responseReady");
  },
  'GetTrailSplit': function() {
    if (this.event.request.intent && this.event.request.intent.slots && this.event.request.intent.slots.direction && this.event.request.intent.slots.direction.value) {
      if (this.event.request.intent.slots.direction.resolutions.resolutionsPerAuthority[0].values[0].value.id === "BRIDGER" || this.event.request.intent.slots.direction.value.toLowerCase() === "fort") {
        this.event.session.attributes.shortcut1 = false;
        this.event.session.attributes.extraMiles += 105;
        this.handler.state = GAME_STATES.EVENT;
        this.emitWithState('ChoseFortBridger');
      } else if (this.event.request.intent.slots.direction.resolutions.resolutionsPerAuthority[0].values[0].value.id === "SPRINGS" || this.event.request.intent.slots.direction.value.toLowerCase() === "shortcut") {
        this.event.session.attributes.shortcut1 = true;
        this.handler.state = GAME_STATES.EVENT;
        this.emitWithState('ChoseSodaSprings');
      } else {
        this.handler.state = GAME_STATES.FIRST_TRAIL_SPLIT;
        this.emitWithState('Unhandled');
      }
    } else {
      this.handler.state = GAME_STATES.FIRST_TRAIL_SPLIT;
      this.emitWithState('Unhandled');
    }
  },
  'AMAZON.HelpIntent': function() {
    if (this.event.session.attributes.food <= 15 * (this.event.session.attributes.peopleHealthy.length + this.event.session.attributes.peopleSick.length) || this.event.session.attributes.oxen <= 2 || this.event.session.attributes.parts <= 1) {
      this.response.speak(QUIT_OR_START_OVER + " Otherwise, you need to choose a direction. If you're low on supplies, it's best to go to Fort Bridger. But if your supplies is ok, you can take the shortcut to Soda Springs, which is 105 miles shorter. You seem low on supplies, so I recomment going to the fort. Do you want to go to Fort Bridger, or Soda Springs?").listen("Do you want to go to Fort Bridger, or Soda Springs?");
      this.emit(":responseReady");
    } else {
      this.response.speak(QUIT_OR_START_OVER + " Otherwise, you need to choose a direction. If you're low on supplies, it's best to go to Fort Bridger. But if your supplies is ok, you can take the shortcut to Soda Springs, which is 105 miles shorter. Assuming you don't have any bad events on the trail, I think you can take the shortcut. Do you want to go to Fort Bridger, or Soda Springs?").listen("Do you want to go to Fort Bridger, or Soda Springs?");
      this.emit(":responseReady");
    }
  },
  'AMAZON.StartOverIntent': function() {
    this.handler.state = GAME_STATES.USER_SETUP;
    this.emitWithState('StartGameAgain');
  },
  'AMAZON.CancelIntent': function() {
    this.handler.state = GAME_STATES.FIRST_TRAIL_SPLIT;
    this.emitWithState('AMAZON.HelpIntent');
  },
  'AMAZON.StopIntent': function() {
    this.response.speak(EXIT_SKILL_MESSAGE);
    this.emit(":responseReady");
  },
  'Unhandled': function() {
    this.response.speak(SORRY + " You must choose to go to Fort Bridger or Soda Springs. Which way do you want to go?").listen("Do you want to go to Fort Bridger, or Soda Springs?");
    this.emit(":responseReady");
  },
});

// HANDLE SECOND TRAIL SPLIT
const secondTrailSplitHandlers = Alexa.CreateStateHandler(GAME_STATES.SECOND_TRAIL_SPLIT, {
  'ChooseDirection': function() {
    this.event.session.attributes.hasChosenSecondDirection = true;
    this.response.speak("The trail splits here. You can go to Fort Walla Walla, or you can take the shortcut to The Dalles. Which way do you want to go?").listen("Do you want to go to Fort Walla Walla, or The Dalles?");
    this.emit(":responseReady");
  },
  'GetTrailSplit': function() {
    if (this.event.request.intent && this.event.request.intent.slots && this.event.request.intent.slots.direction && this.event.request.intent.slots.direction.value) {
      if (this.event.request.intent.slots.direction.resolutions.resolutionsPerAuthority[0].values[0].value.id === "WALLA" || this.event.request.intent.slots.direction.value.toLowerCase() === "fort") {
        this.event.session.attributes.shortcut2 = false;
        this.event.session.attributes.extraMiles += 60;
        this.handler.state = GAME_STATES.EVENT;
        this.emitWithState('ChoseFortWallaWalla');
      } else if (this.event.request.intent.slots.direction.resolutions.resolutionsPerAuthority[0].values[0].value.id === "DALLES" || this.event.request.intent.slots.direction.value.toLowerCase() === "shortcut") {
        this.event.session.attributes.shortcut2 = true;
        this.handler.state = GAME_STATES.EVENT;
        this.emitWithState('ChoseTheDalles');
      } else {
        this.handler.state = GAME_STATES.SECOND_TRAIL_SPLIT;
        this.emitWithState('Unhandled');
      }
    } else {
      this.handler.state = GAME_STATES.SECOND_TRAIL_SPLIT;
      this.emitWithState('Unhandled');
    }
  },
  'AMAZON.HelpIntent': function() {
    if (this.event.session.attributes.food <= 19 * (this.event.session.attributes.peopleHealthy.length + this.event.session.attributes.peopleSick.length) || this.event.session.attributes.oxen <= 2 || this.event.session.attributes.parts <= 1) {
      this.response.speak(QUIT_OR_START_OVER + " Otherwise, you need to choose a direction. If you're low on supplies, it's best to go to Fort Walla Walla. But if your supplies is ok, you can take the shortcut to The Dalles, which is 150 miles shorter. You seem low on supplies, so I recomment going to the fort. Do you want to go to Fort Walla Walla, or The Dalles?").listen("Do you want to go to Fort Walla Walla, or The Dalles?");
      this.emit(":responseReady");
    } else {
      this.response.speak(QUIT_OR_START_OVER + " Otherwise, you need to choose a direction. If you're low on supplies, it's best to go to Fort Walla Walla. But if your supplies is ok, you can take the shortcut to The Dalles, which is 150 miles shorter. Assuming you don't have any bad events on the trail, I think you can take the shortcut. Do you want to go to Fort Walla Walla, or The Dalles?").listen("Do you want to go to Fort Walla Walla, or The Dalles?");
      this.emit(":responseReady");
    }
  },
  'AMAZON.StartOverIntent': function() {
    this.handler.state = GAME_STATES.USER_SETUP;
    this.emitWithState('StartGameAgain');
  },
  'AMAZON.CancelIntent': function() {
    this.handler.state = GAME_STATES.SECOND_TRAIL_SPLIT;
    this.emitWithState('AMAZON.HelpIntent');
  },
  'AMAZON.StopIntent': function() {
    this.response.speak(EXIT_SKILL_MESSAGE);
    this.emit(":responseReady");
  },
  'Unhandled': function() {
    this.response.speak(SORRY + " You must choose to go to Fort Walla Walla or The Dalles. Which way do you want to go?").listen("Do you want to go to Fort Walla Walla, or The Dalles?");
    this.emit(":responseReady");
  },
});

// HANDLE THIRD TRAIL SPLIT
const thirdTrailSplitHandlers = Alexa.CreateStateHandler(GAME_STATES.THIRD_TRAIL_SPLIT, {
  'ChooseDirection': function() {
    this.event.session.attributes.hasChosenThirdDirection = true;
    this.response.speak("The trail ends here. There are two ways to go to Oregon City: You can take the Barlow Toll Road for $30, or you can float down the Columbia River. Which way do you want to go?").listen("Do you want to take the Barlow Toll Road, or go to the Columbia River?");
    this.emit(":responseReady");
  },
  'GetTrailSplit': function() {
    if (this.event.request.intent && this.event.request.intent.slots && this.event.request.intent.slots.direction && this.event.request.intent.slots.direction.value) {
      if (this.event.request.intent.slots.direction.resolutions.resolutionsPerAuthority[0].values[0].value.id === "COLUMBIA" || this.event.request.intent.slots.direction.value.toLowerCase() === "shortcut") {
        this.event.session.attributes.mapLocation = "Columbia River";
        this.event.session.attributes.shortcut3 = true;
        this.handler.state = GAME_STATES.COLUMBIA_RIVER;
        this.emitWithState('ChoseColumbiaRiver');
      } else if (this.event.request.intent.slots.direction.resolutions.resolutionsPerAuthority[0].values[0].value.id === "BARLOW") {
        this.event.session.attributes.extraMiles += 90;
        this.event.session.attributes.shortcut3 = false;
        this.handler.state = GAME_STATES.EVENT;
        this.emitWithState('ChoseBarlowTollRoad');
      } else {
        this.handler.state = GAME_STATES.THIRD_TRAIL_SPLIT;
        this.emitWithState('Unhandled');
      }
    } else {
      this.handler.state = GAME_STATES.THIRD_TRAIL_SPLIT;
      this.emitWithState('Unhandled');
    }
  },
  'AMAZON.HelpIntent': function() {
    this.response.speak(QUIT_OR_START_OVER + " Otherwise, you need to choose a direction. The Barlow Toll Road costs $30. It's a rough, mountainous road, and it's 90 miles long. Floating down the Columbia River is much shorter, but it's also much more dangerous. Do you want to take the Barlow Toll Road, or go to the Columbia River?").listen("Do you want to take the Barlow Toll Road, or go to the Columbia River?");
    this.emit(":responseReady");
  },
  'AMAZON.StartOverIntent': function() {
    this.handler.state = GAME_STATES.USER_SETUP;
    this.emitWithState('StartGameAgain');
  },
  'AMAZON.CancelIntent': function() {
    this.handler.state = GAME_STATES.THIRD_TRAIL_SPLIT;
    this.emitWithState('AMAZON.HelpIntent');
  },
  'AMAZON.StopIntent': function() {
    this.response.speak(EXIT_SKILL_MESSAGE);
    this.emit(":responseReady");
  },
  'Unhandled': function() {
    this.response.speak(SORRY + " You must choose to take the Barlow Toll Road or the Columbia River. Which way do you want to go?").listen("Do you want to take the Barlow Toll Road, or go to the Columbia River?");
    this.emit(":responseReady");
  },
});

// HANDLE SHOPPING
const shoppingHandlers = Alexa.CreateStateHandler(GAME_STATES.SHOPPING, {
  'WelcomeToStore': function() {
    this.event.session.attributes.currentlyBuyingWhat = undefined;
    this.event.session.attributes.currentlyBuyingHowMany = 0;
    if (this.event.session.attributes.money > 0) {
      this.response.speak("Ok, you have $" + this.event.session.attributes.money + " to spend. You can buy food, oxen, or spare parts. What do you want to buy?").listen("What do you want to buy?");
      this.emit(":responseReady");
    } else {
      this.handler.state = GAME_STATES.CHANGE_PURCHASE;
      this.emitWithState('TradeInstead');
    }
  },
  'GetBuyOrTradeItem': function() {
    if (this.event.request.intent && this.event.request.intent.slots && this.event.request.intent.slots.item && this.event.request.intent.slots.item.value) {
      if (this.event.request.intent.slots.item.resolutions.resolutionsPerAuthority[0].values[0].value.id === "FOOD" || this.event.request.intent.slots.item.resolutions.resolutionsPerAuthority[0].values[0].value.id === "OXEN" || this.event.request.intent.slots.item.resolutions.resolutionsPerAuthority[0].values[0].value.id === "PARTS") {
        if (this.event.request.intent.slots.item.resolutions.resolutionsPerAuthority[0].values[0].value.id === "FOOD") {
          this.event.session.attributes.currentlyBuyingWhat = "food";
        } else if (this.event.request.intent.slots.item.resolutions.resolutionsPerAuthority[0].values[0].value.id === "OXEN") {
          this.event.session.attributes.currentlyBuyingWhat = "oxen";
        } else {
          this.event.session.attributes.currentlyBuyingWhat = "parts";
        }
        this.handler.state = GAME_STATES.SHOPPING_AMOUNT;
        this.emitWithState('HowMany');
      } else {
        this.handler.state = GAME_STATES.SHOPPING;
        this.emitWithState('Unhandled');
      }
    } else {
      this.handler.state = GAME_STATES.SHOPPING;
      this.emitWithState('Unhandled');
    }
  },
  'AMAZON.HelpIntent': function() {
    this.response.speak(QUIT_OR_START_OVER + " Otherwise, you can buy food, oxen, or spare parts. Food will cost $" + PRICE_FOOD + " per pound, oxen will cost $" + PRICE_OXEN + " each, and spare parts will cost $" + PRICE_PARTS + " each. If you don't want to buy anything, you can say cancel. You currently have $" + this.event.session.attributes.money + ". What do you want to buy?").listen("What do you want to buy?");
    this.emit(":responseReady");
  },
  'AMAZON.StartOverIntent': function() {
    this.handler.state = GAME_STATES.USER_SETUP;
    this.emitWithState('StartGameAgain');
  },
  'AMAZON.CancelIntent': function() {
    this.event.session.attributes.currentlyBuyingWhat = undefined;
    this.event.session.attributes.currentlyBuyingHowMany = 0;
    this.handler.state = GAME_STATES.FORT;
    this.emitWithState('Status');
  },
  'AMAZON.StopIntent': function() {
    this.response.speak(EXIT_SKILL_MESSAGE);
    this.emit(":responseReady");
  },
  'Unhandled': function() {
    this.response.speak(SORRY + " You can buy food, oxen, or spare parts. If you changed your mind, you can say cancel. What do you want to buy?").listen("What do you want to buy?");
    this.emit(":responseReady");
  },
});

// HANDLE SHOPPING AMOUNT
const shoppingAmountHandlers = Alexa.CreateStateHandler(GAME_STATES.SHOPPING_AMOUNT, {
  'HowMany': function() {
    if (this.event.session.attributes.currentlyBuyingWhat === "food") {
      this.event.session.attributes.itemPrice = PRICE_FOOD;
      this.response.speak("Ok, let's buy food. " + COST_FOOD + " " + Q_HOW_MANY_FOOD).listen(Q_HOW_MANY_FOOD);
      this.emit(":responseReady");
    } else if (this.event.session.attributes.currentlyBuyingWhat === "oxen") {
      this.event.session.attributes.itemPrice = PRICE_OXEN;
      this.response.speak("Ok, let's buy oxen. " + COST_OXEN + " " + Q_HOW_MANY_OXEN).listen(Q_HOW_MANY_OXEN);
      this.emit(":responseReady");
    } else if (this.event.session.attributes.currentlyBuyingWhat === "parts") {
      this.event.session.attributes.itemPrice = PRICE_PARTS;
      this.response.speak("Ok, let's buy spare parts. " + COST_PARTS + " " + Q_HOW_MANY_PARTS).listen(Q_HOW_MANY_PARTS);
      this.emit(":responseReady");
    }
  },
  'GetNumber': function() {
    this.event.session.attributes.currentlyBuyingHowMany = +this.event.request.intent.slots.number.value;
    if (this.event.session.attributes.currentlyBuyingHowMany > 0) {
      this.handler.state = GAME_STATES.SHOPPING_SUCCESS;
      this.emitWithState('Total');
    } else {
      if (this.event.session.attributes.currentlyBuyingWhat === "food") {
        this.response.speak("Sorry, you can't buy zero pounds of food. If you want to cancel your purchase, say cancel. " + Q_HOW_MANY_FOOD).listen(Q_HOW_MANY_FOOD + " Please say a number.");
        this.emit(":responseReady");
      } else if (this.event.session.attributes.currentlyBuyingWhat === "oxen") {
        this.response.speak("Sorry, you can't buy zero oxen. If you want to cancel your purchase, say cancel. " + Q_HOW_MANY_OXEN).listen(Q_HOW_MANY_OXEN + " Please say a number.");
        this.emit(":responseReady");
      } else if (this.event.session.attributes.currentlyBuyingWhat === "parts") {
        this.response.speak("Sorry, you can't buy zero spare parts. If you want to cancel your purchase, say cancel. " + Q_HOW_MANY_PARTS).listen(Q_HOW_MANY_PARTS + " Please say a number.");
        this.emit(":responseReady");
      }
    }
  },
  'AMAZON.HelpIntent': function() {
    if (this.event.session.attributes.currentlyBuyingWhat === "food") {
      if (this.event.session.attributes.food === 1) {
        this.response.speak(QUIT_OR_START_OVER + " If you want to cancel your purchase, say cancel. Otherwise, if you want to buy food, it costs $" + PRICE_FOOD + " per pound. You currently have $" + this.event.session.attributes.money + " and " + this.event.session.attributes.food + " pound of food. " + Q_HOW_MANY_FOOD).listen(Q_HOW_MANY_FOOD + " Please say a number.");
        this.emit(":responseReady");
      } else {
        this.response.speak(QUIT_OR_START_OVER + " If you want to cancel your purchase, say cancel. Otherwise, if you want to buy food, it costs $" + PRICE_FOOD + " per pound. You currently have $" + this.event.session.attributes.money + " and " + this.event.session.attributes.food + " pounds of food. " + Q_HOW_MANY_FOOD).listen(Q_HOW_MANY_FOOD + " Please say a number.");
        this.emit(":responseReady");
      }
    } else if (this.event.session.attributes.currentlyBuyingWhat === "oxen") {
      if (this.event.session.attributes.oxen === 1) {
        this.response.speak(QUIT_OR_START_OVER + " If you want to cancel your purchase, say cancel. Otherwise, if you want to buy oxen, they cost $" + PRICE_OXEN + " each. You currently have $" + this.event.session.attributes.money + " and " + this.event.session.attributes.oxen + " ox. " + Q_HOW_MANY_OXEN).listen(Q_HOW_MANY_OXEN + " Please say a number.");
        this.emit(":responseReady");
      } else {
        this.response.speak(QUIT_OR_START_OVER + " If you want to cancel your purchase, say cancel. Otherwise, if you want to buy oxen, they cost $" + PRICE_OXEN + " each. You currently have $" + this.event.session.attributes.money + " and " + this.event.session.attributes.oxen + " oxen. " + Q_HOW_MANY_OXEN).listen(Q_HOW_MANY_OXEN + " Please say a number.");
        this.emit(":responseReady");
      }
    } else if (this.event.session.attributes.currentlyBuyingWhat === "parts") {
      if (this.event.session.attributes.parts === 1) {
        this.response.speak(QUIT_OR_START_OVER + " If you want to cancel your purchase, say cancel. Otherwise, if you want to buy spare parts, they cost $" + PRICE_PARTS + " each. You currently have $" + this.event.session.attributes.money + " and " + this.event.session.attributes.parts + " spare part. " + Q_HOW_MANY_OXEN).listen(Q_HOW_MANY_OXEN + " Please say a number.");
        this.emit(":responseReady");
      } else {
        this.response.speak(QUIT_OR_START_OVER + " If you want to cancel your purchase, say cancel. Otherwise, if you want to buy spare parts, they cost $" + PRICE_PARTS + " each. You currently have $" + this.event.session.attributes.money + " and " + this.event.session.attributes.parts + " spare parts. " + Q_HOW_MANY_OXEN).listen(Q_HOW_MANY_OXEN + " Please say a number.");
        this.emit(":responseReady");
      }
    }
  },
  'AMAZON.StartOverIntent': function() {
    this.handler.state = GAME_STATES.USER_SETUP;
    this.emitWithState('StartGameAgain');
  },
  'AMAZON.CancelIntent': function() {
    this.event.session.attributes.currentlyBuyingWhat = undefined;
    this.event.session.attributes.currentlyBuyingHowMany = 0;
    this.handler.state = GAME_STATES.FORT;
    this.emitWithState('Status');
  },
  'AMAZON.StopIntent': function() {
    this.response.speak(EXIT_SKILL_MESSAGE);
    this.emit(":responseReady");
  },
  'Unhandled': function() {
    if (this.event.session.attributes.currentlyBuyingWhat === "food") {
      this.response.speak("Sorry, I didnt get that. " + Q_HOW_MANY_FOOD).listen(Q_HOW_MANY_FOOD + " Please say a number.");
      this.emit(":responseReady");
    } else if (this.event.session.attributes.currentlyBuyingWhat === "oxen") {
      this.response.speak("Sorry, I didnt get that. " + Q_HOW_MANY_OXEN).listen(Q_HOW_MANY_OXEN + " Please say a number.");
      this.emit(":responseReady");
    } else if (this.event.session.attributes.currentlyBuyingWhat === "parts") {
      this.response.speak("Sorry, I didnt get that. " + Q_HOW_MANY_PARTS).listen(Q_HOW_MANY_PARTS + " Please say a number.");
      this.emit(":responseReady");
    }
  },
});

// HANDLE SHOPPING SUCCESS
const shoppingSuccessHandlers = Alexa.CreateStateHandler(GAME_STATES.SHOPPING_SUCCESS, {
  'Total': function() {
    this.event.session.attributes.total = this.event.session.attributes.currentlyBuyingHowMany * this.event.session.attributes.itemPrice;

    if (this.event.session.attributes.money < this.event.session.attributes.total) {
      this.handler.state = GAME_STATES.FORT;
      this.emitWithState('NotEnoughMoney');
    } else {
      this.event.session.attributes.days++;
      this.event.session.attributes.trailDays++;
      this.event.session.attributes.food -= (this.event.session.attributes.peopleHealthy.length + this.event.session.attributes.peopleSick.length);
      this.event.session.attributes.money -= this.event.session.attributes.currentlyBuyingHowMany * this.event.session.attributes.itemPrice;
      if (this.event.session.attributes.currentlyBuyingWhat === "food") {
        if (this.event.session.attributes.currentlyBuyingHowMany === 0) {
          this.response.speak("Ok, you bought " + this.event.session.attributes.currentlyBuyingHowMany + " pounds of food. You have still have $" + this.event.session.attributes.money + ". " + Q_BUY_ANYTHING_ELSE).listen(Q_BUY_ANYTHING_ELSE);
          this.emit(":responseReady");
        } else if (this.event.session.attributes.currentlyBuyingHowMany === 1) {
          this.event.session.attributes.food += this.event.session.attributes.currentlyBuyingHowMany;
          this.response.speak(cashSFX + "Great! You bought " + this.event.session.attributes.currentlyBuyingHowMany + " pound of food. You have $" + this.event.session.attributes.money + " left over. " + Q_BUY_ANYTHING_ELSE).listen(Q_BUY_ANYTHING_ELSE);
          this.emit(":responseReady");
        } else {
          this.event.session.attributes.food += this.event.session.attributes.currentlyBuyingHowMany;
          this.response.speak(cashSFX + "Great! You bought " + this.event.session.attributes.currentlyBuyingHowMany + " pounds of food. You have $" + this.event.session.attributes.money + " left over. " + Q_BUY_ANYTHING_ELSE).listen(Q_BUY_ANYTHING_ELSE);
          this.emit(":responseReady");
        }
      } else if (this.event.session.attributes.currentlyBuyingWhat === "oxen") {
        this.event.session.attributes.oxen += this.event.session.attributes.currentlyBuyingHowMany;
        if (this.event.session.attributes.currentlyBuyingHowMany === 0) {
          this.response.speak("Ok, you bought " + this.event.session.attributes.currentlyBuyingHowMany + " oxen. You still have $" + this.event.session.attributes.money + ". " + Q_BUY_ANYTHING_ELSE).listen(Q_BUY_ANYTHING_ELSE);
          this.emit(":responseReady");
        } else if (this.event.session.attributes.currentlyBuyingHowMany === 1) {
          this.response.speak(cashSFX + "Great! You bought " + this.event.session.attributes.currentlyBuyingHowMany + " ox. You have $" + this.event.session.attributes.money + " left over. " + Q_BUY_ANYTHING_ELSE).listen(Q_BUY_ANYTHING_ELSE);
          this.emit(":responseReady");
        } else {
          this.response.speak(cashSFX + "Great! You bought " + this.event.session.attributes.currentlyBuyingHowMany + " oxen. You have $" + this.event.session.attributes.money + " left over. " + Q_BUY_ANYTHING_ELSE).listen(Q_BUY_ANYTHING_ELSE);
          this.emit(":responseReady");
        }
      } else if (this.event.session.attributes.currentlyBuyingWhat === "parts") {
        this.event.session.attributes.parts += this.event.session.attributes.currentlyBuyingHowMany;
        if (this.event.session.attributes.currentlyBuyingHowMany === 0) {
          this.response.speak("Ok, you bought " + this.event.session.attributes.currentlyBuyingHowMany + " spare parts. You still have $" + this.event.session.attributes.money + " left over. " + Q_BUY_ANYTHING_ELSE).listen(Q_BUY_ANYTHING_ELSE);
          this.emit(":responseReady");
        } else if (this.event.session.attributes.currentlyBuyingHowMany === 1) {
          this.response.speak(cashSFX + "Great! You bought " + this.event.session.attributes.currentlyBuyingHowMany + " spare part. You have $" + this.event.session.attributes.money + " left over. " + Q_BUY_ANYTHING_ELSE).listen(Q_BUY_ANYTHING_ELSE);
          this.emit(":responseReady");
        } else {
          this.response.speak(cashSFX + "Great! You bought " + this.event.session.attributes.currentlyBuyingHowMany + " spare parts. You have $" + this.event.session.attributes.money + " left over. " + Q_BUY_ANYTHING_ELSE).listen(Q_BUY_ANYTHING_ELSE);
          this.emit(":responseReady");
        }
      }
    }
  },
  'AMAZON.YesIntent': function() {
    this.handler.state = GAME_STATES.SHOPPING;
    this.emitWithState('WelcomeToStore');
  },
  'AMAZON.NoIntent': function() {
    this.handler.state = GAME_STATES.CHANGE_PURCHASE;
    this.emitWithState('TradeInstead');
  },
  'AMAZON.HelpIntent': function() {
    this.response.speak(QUIT_OR_START_OVER + " If you want to leave the general store, say cancel. You have $" + this.event.session.attributes.money + ". " + Q_BUY_ANYTHING_ELSE).listen(Q_BUY_ANYTHING_ELSE);
    this.emit(":responseReady");
  },
  'AMAZON.StartOverIntent': function() {
    this.handler.state = GAME_STATES.USER_SETUP;
    this.emitWithState('StartGameAgain');
  },
  'AMAZON.CancelIntent': function() {
    this.handler.state = GAME_STATES.CHANGE_PURCHASE;
    this.emitWithState('TradeInstead');
  },
  'AMAZON.StopIntent': function() {
    this.response.speak(EXIT_SKILL_MESSAGE);
    this.emit(":responseReady");
  },
  'Unhandled': function() {
    this.response.speak(Q_BUY_ANYTHING_ELSE + " Please say yes or no.").listen(Q_BUY_ANYTHING_ELSE + " Please say yes or no.");
    this.emit(":responseReady");
  },
});

// HANDLE TRADING
const tradingHandlers = Alexa.CreateStateHandler(GAME_STATES.TRADING, {
  'Offer': function() {
    if (this.event.session.attributes.tradeAttempts < this.event.session.attributes.tradeChances) {
      this.event.session.attributes.tradeAttempts++;
      this.event.session.attributes.days++;
      this.event.session.attributes.trailDays++;
      this.event.session.attributes.food -= (this.event.session.attributes.peopleHealthy.length + this.event.session.attributes.peopleSick.length);
      this.event.session.attributes.tradeDeal = Math.floor(Math.random() * (10 - 1 + 1)) + 1;
      if (this.event.session.attributes.tradeDeal === 1) {
        this.response.speak("An old settler will give you a spare part for 50 pounds of food. Do you accept this trade?").listen("Do you accept this trade? Please say yes or no.");
        this.emit(":responseReady");
      } else if (this.event.session.attributes.tradeDeal === 2) {
        this.response.speak("A woman at the fort will give you 100 pounds of food for an ox. Do you accept this trade?").listen("Do you accept this trade? Please say yes or no.");
        this.emit(":responseReady");
      } else if (this.event.session.attributes.tradeDeal === 3) {
        this.response.speak("The general store owner will give you $15 for a spare part. Do you accept this trade?").listen("Do you accept this trade? Please say yes or no.");
        this.emit(":responseReady");
      } else if (this.event.session.attributes.tradeDeal === 4) {
        this.response.speak("A man at the fort will give you an ox for $25. Do you accept this trade?").listen("Do you accept this trade? Please say yes or no.");
        this.emit(":responseReady");
      } else if (this.event.session.attributes.tradeDeal === 5) {
        this.response.speak("A man at the fort will give you $30 for a spare part. Do you accept this trade?").listen("Do you accept this trade? Please say yes or no.");
        this.emit(":responseReady");
      } else if (this.event.session.attributes.tradeDeal === 6) {
        this.response.speak("A Native American at the fort will give you 200 pounds of food for two oxen. Do you accept this trade?").listen("Do you accept this trade? Please say yes or no.");
        this.emit(":responseReady");
      } else if (this.event.session.attributes.tradeDeal === 7) {
        this.response.speak("A woman at the fort will give you a spare part for $50. Do you accept this trade?").listen("Do you accept this trade? Please say yes or no.");
        this.emit(":responseReady");
      } else if (this.event.session.attributes.tradeDeal === 8) {
        this.response.speak("A man at the fort will give you $100 for an ox. Do you accept this trade?").listen("Do you accept this trade? Please say yes or no.");
        this.emit(":responseReady");
      } else if (this.event.session.attributes.tradeDeal === 9) {
        this.response.speak("An old settler will give you $20 for a spare part. Do you accept this trade?").listen("Do you accept this trade? Please say yes or no.");
        this.emit(":responseReady");
      } else if (this.event.session.attributes.tradeDeal === 10) {
        this.response.speak("A man at the fort will give you a spare part for 75 pounds of food. Do you accept this trade?").listen("Do you accept this trade? Please say yes or no.");
        this.emit(":responseReady");
      }
    } else {
      this.handler.state = GAME_STATES.CHANGE_PURCHASE;
      this.emitWithState('NoMoreTrading');
    }
  },
  'AMAZON.YesIntent': function() {
    evaluateOffer.call(this);
  },
  'AMAZON.NoIntent': function() {
    this.handler.state = GAME_STATES.FORT;
    this.emitWithState('Status');
  },
  'AMAZON.HelpIntent': function() {
    this.response.speak(QUIT_OR_START_OVER + " Otherwise, if you want to accept the trade, say yes, or, if you don't like the trade, say no. Say cancel if you don't want to trade anymore. What do you want to do?").listen("Please say yes, no, or cancel. What do you want to do?");
    this.emit(":responseReady");
  },
  'AMAZON.StartOverIntent': function() {
    this.handler.state = GAME_STATES.USER_SETUP;
    this.emitWithState('StartGameAgain');
  },
  'AMAZON.CancelIntent': function() {
    this.handler.state = GAME_STATES.FORT;
    this.emitWithState('Status');
  },
  'AMAZON.StopIntent': function() {
    this.response.speak(EXIT_SKILL_MESSAGE);
    this.emit(":responseReady");
  },
  'Unhandled': function() {
    this.response.speak(SORRY + " Please say yes or no to the offer.").listen("Please say yes or no to the offer.");
    this.emit(":responseReady");
  },
});

// HANDLE SHOPPING-TRADING OR TRADING-SHOPPING TRANSITION
const changePurchaseHandlers = Alexa.CreateStateHandler(GAME_STATES.CHANGE_PURCHASE, {
  'TradeInstead': function() {
    this.event.session.attributes.purchaseChoice = "trade";
    if (this.event.session.attributes.tradeAllowed === true) {
      if (this.event.session.attributes.money === 0) {
        this.response.speak(badNewsSFX + "Sorry, you don't have any money. Do you want to try trading with other pioneers at the fort?").listen("Do you want to try trading?");
        this.emit(":responseReady");
      } else {
        this.response.speak("Do you want to try trading with other pioneers at the fort?").listen("Do you want to try trading?");
        this.emit(":responseReady");
      }
    } else {
      this.handler.state = GAME_STATES.EVENT;
      this.emitWithState('LeaveFort');
    }
  },
  'BuyInstead': function() {
    this.event.session.attributes.purchaseChoice = "buy";
    this.response.speak("You have $" + this.event.session.attributes.money + ". Do you want to buy any supplies?").listen("Do you want to buy any supplies?");
    this.emit(":responseReady");
  },
  'NoMoreTrading': function() {
    this.event.session.attributes.purchaseChoice = "buy";
    this.event.session.attributes.tradeAllowed = false;
    this.response.speak(badNewsSFX + "Sorry, no one else wants to trade with you. Do you want to go to the fort's general store?").listen("Do you want to go to the fort's general store?");
    this.emit(":responseReady");
  },
  'AMAZON.YesIntent': function() {
    if (this.event.session.attributes.purchaseChoice === "trade") {
      this.handler.state = GAME_STATES.TRADING;
      this.emitWithState('Offer');
    } else if (this.event.session.attributes.purchaseChoice === "buy") {
      this.handler.state = GAME_STATES.SHOPPING;
      this.emitWithState('WelcomeToStore');
    } else {
      this.handler.state = GAME_STATES.CHANGE_PURCHASE;
      this.emitWithState('Unhandled');
    }
  },
  'AMAZON.NoIntent': function() {
    this.event.session.attributes.trailDaysWithoutIncident = 0;
    if (this.event.session.attributes.mapLocation === "Fort Walla Walla") {
      this.event.session.attributes.mapLocation = "Exit Fort Walla Walla";
    }
    this.handler.state = GAME_STATES.EVENT;
    this.emitWithState('PlayGame');
  },
  'AMAZON.HelpIntent': function() {
    this.response.speak(QUIT_OR_START_OVER + " Otherwise, say yes if you need more supplies, or say no if you want to get back on the trail. What do you want to do?").listen("Please say yes, no, or cancel. What do you want to do?");
    this.emit(":responseReady");
  },
  'AMAZON.StartOverIntent': function() {
    this.handler.state = GAME_STATES.USER_SETUP;
    this.emitWithState('StartGameAgain');
  },
  'AMAZON.CancelIntent': function() {
    this.event.session.attributes.trailDaysWithoutIncident = 0;
    if (this.event.session.attributes.mapLocation === "Fort Walla Walla") {
      this.event.session.attributes.mapLocation = "Exit Fort Walla Walla";
    }
    this.handler.state = GAME_STATES.EVENT;
    this.emitWithState('PlayGame');
  },
  'AMAZON.StopIntent': function() {
    this.response.speak(EXIT_SKILL_MESSAGE);
    this.emit(":responseReady");
  },
  'Unhandled': function() {
    this.response.speak(SORRY + " Please say yes or no.").listen("Please say yes or no.");
    this.emit(":responseReady");
  },
});

// HANDLE HUNTING
const huntingHandlers = Alexa.CreateStateHandler(GAME_STATES.HUNT, {
  'ChooseToHunt': function() {
    this.response.speak(this.event.session.attributes.travelingSFX + wildlifeSFX + "You're in an area with a lot of wildlife. You currently have " + this.event.session.attributes.food + " pounds of food, which will last about " + Math.floor(this.event.session.attributes.food/(this.event.session.attributes.peopleHealthy.length + this.event.session.attributes.peopleSick.length)) + " days. Do you want to go hunting for more food?").listen("Do you want to go hunting for more food?");
    this.emit(":responseReady");
  },
  'AMAZON.YesIntent': function() {
    this.handler.state = GAME_STATES.HUNT_NUMBER;
    this.emitWithState('ChooseRandomNumber');
  },
  'AMAZON.NoIntent': function() {
    this.event.session.attributes.trailDaysWithoutIncident = 0;
    this.handler.state = GAME_STATES.EVENT;
    this.emitWithState('PlayGame');
  },
  'AMAZON.HelpIntent': function() {
    this.response.speak(QUIT_OR_START_OVER + " Otherwise, if you want to go hunting, say yes. If not, say no to continue on the trail. Do you want to go hunting?").listen("Do you want to go hunting? Please say yes or no.");
    this.emit(":responseReady");
  },
  'AMAZON.StartOverIntent': function() {
    this.handler.state = GAME_STATES.USER_SETUP;
    this.emitWithState('StartGameAgain');
  },
  'AMAZON.CancelIntent': function() {
    this.event.session.attributes.trailDaysWithoutIncident = 0;
    this.handler.state = GAME_STATES.EVENT;
    this.emitWithState('PlayGame');
  },
  'AMAZON.StopIntent': function() {
    this.response.speak(EXIT_SKILL_MESSAGE);
    this.emit(":responseReady");
  },
  'Unhandled': function() {
      this.response.speak("Do you want to go hunting for more food? Please say yes or no.").listen("Do you want to go hunting for more food? Please say yes or no.");
      this.emit(":responseReady");
  },
});

// HANDLE SECRET NUMBER FOR HUNTING
const huntingNumberHandlers = Alexa.CreateStateHandler(GAME_STATES.HUNT_NUMBER, {
  'ChooseRandomNumber': function() {
    this.event.session.attributes.days++;
    this.event.session.attributes.trailDays++;
    this.event.session.attributes.food -= (this.event.session.attributes.peopleHealthy.length + this.event.session.attributes.peopleSick.length);
    this.response.speak("You will guess a number between 1 and 10. If you guess within 3 numbers of the secret number, you will shoot an animal. The closer you are to the number, the larger your animal. Between 1 and 10, what number do you guess?").listen("Please choose a number between 1 and 10. What number do you guess?");
    this.emit(':responseReady');
  },
  'GetNumber': function() {
    this.event.session.attributes.guess = +this.event.request.intent.slots.number.value;
    if (this.event.session.attributes.guess >= 1 && this.event.session.attributes.guess <= 10) {
      this.handler.state = GAME_STATES.EVENT;
      this.emitWithState('Hunting');
    } else {
      this.response.speak("Sorry, you must guess a number between 1 and 10. Please choose a number between 1 and 10. What number do you guess?").listen("Please choose a number between 1 and 10. What number do you guess?");
      this.emit(':responseReady');
    }
  },
  'AMAZON.HelpIntent': function() {
    this.response.speak(QUIT_OR_START_OVER + " Otherwise, say a number between 1 and 10 to shoot an animal. If you don't want to hunt anymore, you can say cancel. What number do you guess?").listen("Please say a number between 1 and 10, or say cancel. What number do you guess?");
    this.emit(":responseReady");
  },
  'AMAZON.StartOverIntent': function() {
    this.handler.state = GAME_STATES.USER_SETUP;
    this.emitWithState('StartGameAgain');
  },
  'AMAZON.CancelIntent': function() {
    this.event.session.attributes.trailDaysWithoutIncident = 0;
    this.handler.state = GAME_STATES.EVENT;
    this.emitWithState('PlayGame');
  },
  'AMAZON.StopIntent': function() {
    this.response.speak(EXIT_SKILL_MESSAGE);
    this.emit(":responseReady");
  },
  'Unhandled': function() {
    if (this.event.request.intent.name !== "GetNumber") {
      this.response.speak("I'm sorry, I didn't understand your number. Please say a number between 1 and 10.").listen("Please say a number between 1 and 10.");
      this.emit(":responseReady");
    } else {
      this.handler.state = GAME_STATES.HUNT_NUMBER;
      this.emitWithState('AMAZON.HelpIntent');
    }
  },
});

// HANDLE SICKNESS AND INJURY
const sicknessHandlers = Alexa.CreateStateHandler(GAME_STATES.SICK, {
  'Alert': function() {
    var healthIssues = ["the flu", "cholera", "exhaustion", "typhoid fever", "a snake bite", "a broken arm", "a broken leg"];
    var issue = healthIssues[Math.floor(Math.random() * healthIssues.length)];
    if (this.event.session.attributes.peopleHealthy.length > 1) {
      sickness.call(this);
      this.response.speak(this.event.session.attributes.travelingSFX + badNewsSFX + this.event.session.attributes.invalid + " has " + issue + ". Do you want to rest to see if " + this.event.session.attributes.invalid + " feels better?").listen("Do you want to rest to see if " + this.event.session.attributes.invalid + " feels better?");
      this.emit(":responseReady");
    } else {
      sickness.call(this);
      this.response.speak(this.event.session.attributes.travelingSFX + badNewsSFX + "You have " + issue + ". Do you want to rest to see if you feel better?").listen("Do you want to rest to see if you feel better?");
      this.emit(":responseReady");
    }
  },
  'AMAZON.YesIntent': function() {
    this.handler.state = GAME_STATES.REST;
    this.emitWithState('HowManyDays');
  },
  'AMAZON.NoIntent': function() {
    this.event.session.attributes.trailDaysWithoutIncident = 0;
    this.handler.state = GAME_STATES.EVENT;
    this.emitWithState('PlayGame');
  },
  'AMAZON.HelpIntent': function() {
    this.response.speak(QUIT_OR_START_OVER + " Otherwise, if you take a rest, there's a chance they could feel better. The longer the rest, the better the chance for them to heal. Do you want to rest?").listen("Say yes to rest, or say no to continue on the trail. Do you want to rest?");
    this.emit(":responseReady");
  },
  'AMAZON.StartOverIntent': function() {
    this.handler.state = GAME_STATES.USER_SETUP;
    this.emitWithState('StartGameAgain');
  },
  'AMAZON.CancelIntent': function() {
    this.event.session.attributes.trailDaysWithoutIncident = 0;
    this.handler.state = GAME_STATES.EVENT;
    this.emitWithState('PlayGame');
  },
  'AMAZON.StopIntent': function() {
    this.response.speak(EXIT_SKILL_MESSAGE);
    this.emit(":responseReady");
  },
  'Unhandled': function() {
    if (this.event.request.intent.name !== "AMAZON.YesIntent" && this.event.request.intent.name !== "AMAZON.NoIntent") {
      this.response.speak("Do you want to take a rest? Please say yes or no.").listen("Please say yes or no.");
      this.emit(":responseReady");
    } else {
      this.handler.state = GAME_STATES.SICK;
      this.emitWithState('AMAZON.HelpIntent');
    }
  },
});

// HANDLE DAYS OF REST
const daysOfRestHandlers = Alexa.CreateStateHandler(GAME_STATES.REST, {
  'HowManyDays': function() {
    this.response.speak("Ok, how many days do you want to rest?").listen("How many days do you want to rest?");
    this.emit(":responseReady");
  },
  'GetNumber': function() {
    this.event.session.attributes.daysOfRest = +this.event.request.intent.slots.number.value;
    rest.call(this);
  },
  'AMAZON.HelpIntent': function() {
    this.response.speak(QUIT_OR_START_OVER + " Otherwise, the more days you rest, the better the chances of recovery. If you don't want to rest, you can say cancel. How many days do you want to rest?").listen("How many days do you want to rest?");
    this.emit(":responseReady");
  },
  'AMAZON.StartOverIntent': function() {
    this.handler.state = GAME_STATES.USER_SETUP;
    this.emitWithState('StartGameAgain');
  },
  'AMAZON.CancelIntent': function() {
    this.event.session.attributes.trailDaysWithoutIncident = 0;
    this.handler.state = GAME_STATES.EVENT;
    this.emitWithState('PlayGame');
  },
  'AMAZON.StopIntent': function() {
    this.response.speak(EXIT_SKILL_MESSAGE);
    this.emit(":responseReady");
  },
  'Unhandled': function() {
    if (this.event.request.intent.name !== "GetNumber") {
      this.response.speak("I'm sorry, I didn't understand how many days you want to rest. Please say a number.").listen("Please say a number.");
      this.emit(":responseReady");
    } else {
      this.handler.state = GAME_STATES.REST;
      this.emitWithState('AMAZON.HelpIntent');
    }
  },
});

// HANDLE RIVER CROSSINGS
const crossRiverHandlers = Alexa.CreateStateHandler(GAME_STATES.RIVER, {
  'CrossingChoice': function() {
    this.response.speak(this.event.session.attributes.travelingSFX + riverSFX + "You have arrived at the " + this.event.session.attributes.mapLocation + ". The river is " + this.event.session.attributes.riverDepth + " feet deep. You can buy a ferry for $" + this.event.session.attributes.ferryCost + ", or you can try to float across on your own. Do you want to ferry, or do you want to float?").listen("Do you want to ferry, or do you want to float?");
    this.response.cardRenderer(statusCardTitle.call(this), statusCardContent.call(this));
    this.emit(":responseReady");
  },
  'GetRiverCrossing': function() {
    if (this.event.request.intent && this.event.request.intent.slots && this.event.request.intent.slots.crossing && this.event.request.intent.slots.crossing.value) {
      if (this.event.request.intent.slots.crossing.value === "ferry") {
        if (this.event.session.attributes.money >= this.event.session.attributes.ferryCost) {
          this.event.session.attributes.money -= this.event.session.attributes.ferryCost;
          this.handler.state = GAME_STATES.EVENT;
          this.emitWithState('RiverSuccess');
        } else {
          if (this.event.session.attributes.fate <= this.event.session.attributes.sinkChance && this.event.session.attributes.riverDepth > 6) {
            this.event.session.attributes.food -= this.event.session.attributes.fate * 10;
            if (this.event.session.attributes.peopleHealthy.length + this.event.session.attributes.peopleSick.length === 1) {
              this.event.session.attributes.peopleHealthy = [];
              this.event.session.attributes.peopleSick = [];
              this.handler.state = GAME_STATES.GAME_OVER;
              this.emitWithState('NoFerryMoneyYouDrowned');
            } else if (this.event.session.attributes.peopleSick.length >= 1) {
              deathPeopleSick.call(this);
              this.handler.state = GAME_STATES.EVENT;
              this.emitWithState('NoFerryMoneyRiverDeath');
            } else {
              deathPeopleHealthy.call(this);
              this.handler.state = GAME_STATES.EVENT;
              this.emitWithState('NoFerryMoneyRiverDeath');
            }
          } else if (this.event.session.attributes.fate <= this.event.session.attributes.sinkChance && this.event.session.attributes.riverDepth > 4) {
            this.event.session.attributes.food -= this.event.session.attributes.fate * 3;
            this.handler.state = GAME_STATES.EVENT;
            this.emitWithState('NoFerryMoneyRiverAccident');
          } else {
            this.handler.state = GAME_STATES.EVENT;
            this.emitWithState('NoFerryMoneyRiverSuccess');
          }
        }
      } else if (this.event.request.intent.slots.crossing.value === "float") {
        if (this.event.session.attributes.fate <= this.event.session.attributes.sinkChance && this.event.session.attributes.riverDepth > 6) {
          this.event.session.attributes.food -= this.event.session.attributes.fate * 10;
          if (this.event.session.attributes.peopleHealthy.length + this.event.session.attributes.peopleSick.length === 1) {
            this.event.session.attributes.peopleHealthy = [];
            this.event.session.attributes.peopleSick = [];
            this.handler.state = GAME_STATES.GAME_OVER;
            this.emitWithState('YouDrowned');
          } else if (this.event.session.attributes.peopleSick.length >= 1) {
            deathPeopleSick.call(this);
            this.handler.state = GAME_STATES.EVENT;
            this.emitWithState('RiverDeath');
          } else {
            deathPeopleHealthy.call(this);
            this.handler.state = GAME_STATES.EVENT;
            this.emitWithState('RiverDeath');
          }
        } else if (this.event.session.attributes.fate <= this.event.session.attributes.sinkChance && this.event.session.attributes.riverDepth > 4) {
          this.event.session.attributes.food -= this.event.session.attributes.fate * 3;
          this.handler.state = GAME_STATES.EVENT;
          this.emitWithState('RiverAccident');
        } else {
          this.handler.state = GAME_STATES.EVENT;
          this.emitWithState('RiverSuccess');
        }
      } else {
        this.handler.state = GAME_STATES.RIVER;
        this.emitWithState('Unhandled');
      }
    } else {
      this.handler.state = GAME_STATES.RIVER;
      this.emitWithState('Unhandled');
    }
  },
  'AMAZON.HelpIntent': function() {
    this.response.speak(QUIT_OR_START_OVER + " Otherwise, let's cross this river. If a river is less than three feet deep, it's usually safe to float. If it's over six feet deep, you definitely want a ferry. This river is " + this.event.session.attributes.riverDepth + " feet deep. Do you want to ferry, or do you want to float?").listen("Do you want to ferry, or do you want to float?");
    this.emit(":responseReady");
  },
  'AMAZON.StartOverIntent': function() {
    this.handler.state = GAME_STATES.USER_SETUP;
    this.emitWithState('StartGameAgain');
  },
  'AMAZON.CancelIntent': function() {
    this.handler.state = GAME_STATES.RIVER;
    this.emitWithState('Unhandled');
  },
  'AMAZON.StopIntent': function() {
    this.response.speak(EXIT_SKILL_MESSAGE);
    this.emit(":responseReady");
  },
  'Unhandled': function() {
    this.response.speak("I'm sorry, I didn't understand your choice. Do you want to ferry, or do you want to float?").listen("Please say ferry or float.");
    this.emit(":responseReady");
  },
});

// HANDLE COLUMBIA RIVER
const columbiaRiverHandlers = Alexa.CreateStateHandler(GAME_STATES.COLUMBIA_RIVER, {
  'TimeToFloat': function() {
    this.response.speak("Ok, here we go!" + riverSFX + "There's a large boulder coming up. Do you want to paddle to the left, or to the right?").listen("Do you want to paddle to the left, or to the right?");
    this.emit(":responseReady");
  },
  'ChoseColumbiaRiver': function() {
    this.event.session.attributes.miles += 75;
    this.event.session.attributes.days += 5;
    this.event.session.attributes.trailDays += 5;
    if (this.event.session.attributes.food <= (this.event.session.attributes.peopleHealthy.length + this.event.session.attributes.peopleSick.length) * 5) {
      this.event.session.attributes.food = 0;
    } else {
      this.event.session.attributes.food -= (this.event.session.attributes.peopleHealthy.length + this.event.session.attributes.peopleSick.length) * 5;
    }
    this.response.speak("Great! You chose to float down the Columbia River. Let's go to the river." + wagonWheels3SFX + "Congratulations! You made it to the Columbia River. Are you ready to float to Oregon City? Here we go!" + riverSFX + "There's a large boulder coming up. Do you want to paddle to the left or to the right?").listen("Do you want to paddle to the left, or to the right?");
    this.emit(":responseReady");
  },
  'NoMoneyColumbiaRiver': function() {
    this.response.speak("Sorry, but you don't have enough money to take the Barlow Toll Road. You will have to float down the Columbia River to Oregon City. Are you ready? Here we go!" + riverSFX + "There's a large boulder coming up. Do you want to paddle to the left, or to the right?").listen("Do you want to paddle to the left, or to the right?");
    this.emit(":responseReady");
  },
  'GetLeftOrRight': function() {
    if (this.event.request.intent && this.event.request.intent.slots && this.event.request.intent.slots.leftorright && this.event.request.intent.slots.leftorright.value) {
      if (this.event.session.attributes.obstacles === 1) {
        this.event.session.attributes.obstacles++;
        if (this.event.request.intent.slots.leftorright.value === "left") {
          this.response.speak(goodNewsSFX + "Great job! You missed the boulder." + riverSFX + "There are several logs and rocks blocking the center of the river. Do you want to paddle to the left, or to the right?").listen("Do you want to paddle to the left, or to the right?");
          this.emit(":responseReady");
        } else {
          this.event.session.attributes.crashes += 1;
          if (this.event.session.attributes.oxen >= 1) {
            this.event.session.attributes.oxen -= 1;
            this.response.speak(badNewsSFX + "Oh no! You hit the boulder. An ox fell off your raft and was swept away by the river. Thankfully, you're ok." + riverSFX + "There are several logs and rocks blocking the center of the river. Do you want to paddle to the left, or to the right?").listen("Do you want to paddle to the left, or to the right?");
            this.emit(":responseReady");
          } else if (this.event.session.attributes.food >= 25) {
            this.event.session.attributes.food -= 25;
            this.response.speak(badNewsSFX + "Oh no! You hit the boulder. 25 pounds of food fell off your raft and into the river. Thankfully, you're ok." + riverSFX + "There are several logs and rocks blocking the center of the river. Do you want to paddle to the left, or to the right?").listen("Do you want to paddle to the left, or to the right?");
            this.emit(":responseReady");
          } else if (this.event.session.attributes.parts >= 1 && this.event.session.attributes.food >= 15) {
            this.event.session.attributes.parts -= 1;
            this.event.session.attributes.food -= 15;
            this.response.speak(badNewsSFX + "Oh no! You hit the boulder. A spare part and 15 pounds of food fell off your raft and into the river. Thankfully, you're ok." + riverSFX + "There are several logs and rocks blocking the center of the river. Do you want to paddle to the left, or to the right?").listen("Do you want to paddle to the left, or to the right?");
            this.emit(":responseReady");
          } else {
            this.event.session.attributes.columbiaRiverDamage += 50;
            this.response.speak(badNewsSFX + "Oh no! You hit the boulder. You raft got damaged, but you're ok." + riverSFX + "There are several logs and rocks blocking the center of the river. Do you want to paddle to the left, or to the right?").listen("Do you want to paddle to the left, or to the right?");
            this.emit(":responseReady");
          }
        }
      } else if (this.event.session.attributes.obstacles === 2) {
        this.event.session.attributes.obstacles++;
        if (this.event.request.intent.slots.leftorright.value === "left") {
          this.response.speak(goodNewsSFX + "Great job! You made it around the logs and rocks." + riverSFX + "You are approaching wild rapids. Do you want to paddle to the left, or to the right?").listen("Do you want to paddle to the left, or to the right?");
          this.emit(":responseReady");
        } else {
          this.event.session.attributes.crashes += 1;
          if (this.event.session.attributes.peopleSick.length > 1) {
            deathPeopleSick.call(this);
            this.response.speak(deathSFX + "Oh no! You hit a stray log. The crash caused " + this.event.session.attributes.victim + " to fall off the raft and get swept away in the river. Rest in peace " + this.event.session.attributes.victim + "." + riverSFX + "You are approaching wild rapids. Do you want to paddle to the left, or to the right?").listen("Do you want to paddle to the left, or to the right?");
            this.emit(":responseReady");
          } else if (this.event.session.attributes.peopleHealthy.length > 1) {
            sickness.call(this);
            this.response.speak(badNewsSFX + "Oh no! You hit a stray log. " + this.event.session.attributes.invalid + " was injured in the crash." + riverSFX + "You are approaching wild rapids. Do you want to paddle to the left, or to the right?").listen("Do you want to paddle to the left, or to the right?");
            this.emit(":responseReady");
          } else {
            if (this.event.session.attributes.peopleHealthy.includes(this.event.session.attributes.mainPlayer)) {
              sickness.call(this);
              this.response.speak(badNewsSFX + "Oh no! You hit a stray log and got injured in the crash." + riverSFX + "You are approaching wild rapids. Do you want to paddle to the left, or to the right?").listen("Do you want to paddle to the left, or to the right?");
              this.emit(":responseReady");
            } else {
              this.event.session.attributes.columbiaRiverDamage += 50;
              this.response.speak(badNewsSFX + "Oh no! You hit a stray log and got injured in the crash." + riverSFX + "You are approaching wild rapids. Do you want to paddle to the left, or to the right?").listen("Do you want to paddle to the left, or to the right?");
              this.emit(":responseReady");
            }
          }
        }
      } else {
        if (this.event.request.intent.slots.leftorright.value === "right") {
          this.handler.state = GAME_STATES.GAME_OVER;
          this.emitWithState('ColumbiaRiverWinner');
        } else {
          this.event.session.attributes.crashes += 1;
          if (this.event.session.attributes.peopleSick.includes(this.event.session.attributes.mainPlayer) && (this.event.session.attributes.peopleHealthy.length + this.event.session.attributes.peopleSick.length === 1)) {
            this.event.session.attributes.peopleHealthy = [];
            this.event.session.attributes.peopleSick = [];
            this.handler.state = GAME_STATES.GAME_OVER;
            this.emitWithState('ColumbiaRiverYouDrowned');
          } else if (this.event.session.attributes.crashes === 3) {
            this.event.session.attributes.peopleHealthy = [];
            this.event.session.attributes.peopleSick = [];
            this.handler.state = GAME_STATES.GAME_OVER;
            this.emitWithState('ColumbiaRiverRaftSank');
          } else {
            this.event.session.attributes.food = 0;
            this.event.session.attributes.oxen = 0;
            this.event.session.attributes.parts = 0;
            this.event.session.attributes.money = 0;
            this.handler.state = GAME_STATES.GAME_OVER;
            this.emitWithState('ColumbiaRiverBarelyWinner');
          }
        }
      }
    } else {
      this.handler.state = GAME_STATES.COLUMBIA_RIVER;
      this.emitWithState('Unhandled');
    }
  },
  'AMAZON.HelpIntent': function() {
    this.response.speak(QUIT_OR_START_OVER + " Otherwise, please choose to paddle to the left, or to the right.").listen("Do you want to paddle to the left, or to the right?");
    this.emit(":responseReady");
  },
  'AMAZON.StartOverIntent': function() {
    this.handler.state = GAME_STATES.USER_SETUP;
    this.emitWithState('StartGameAgain');
  },
  'AMAZON.CancelIntent': function() {
    this.handler.state = GAME_STATES.COLUMBIA_RIVER;
    this.emitWithState('AMAZON.HelpIntent');
  },
  'AMAZON.StopIntent': function() {
    this.response.speak(EXIT_SKILL_MESSAGE);
    this.emit(":responseReady");
  },
  'Unhandled': function() {
    this.response.speak("You must choose left or right. Which way do you want to paddle?").listen("Do you want to paddle to the left, or to the right?");
    this.emit(":responseReady");
  },
});

// HANDLE GAME OVER
const gameOverHandlers = Alexa.CreateStateHandler(GAME_STATES.GAME_OVER, {
  'Winner': function() {
    getPoints.call(this);
    this.response.speak(this.event.session.attributes.travelingSFX + winnerSFX + "Congratulations, you reached Oregon City! You finished the game with a score of <say-as interpret-as='cardinal'>" + this.event.session.attributes.finalscore + "</say-as> points. " + EXIT_SKILL_MESSAGE);
    this.response.cardRenderer("Congratulations, you reached Oregon City!", "Final score: " + this.event.session.attributes.finalscore);
    this.emit(':responseReady');
  },
  'ColumbiaRiverWinner': function() {
    getPoints.call(this);
    this.response.speak(riverSFX + winnerSFX + "Congratulations, you reached the dock at Oregon City! You finished the game with a score of <say-as interpret-as='cardinal'>" + this.event.session.attributes.finalscore + "</say-as> points. " + EXIT_SKILL_MESSAGE);
    this.response.cardRenderer("Congratulations, you reached Oregon City!", "Final score: " + this.event.session.attributes.finalscore);
    this.emit(':responseReady');
  },
  'ColumbiaRiverBarelyWinner': function() {
    getPoints.call(this);
    this.response.speak(badNewsSFX + "Your raft nearly capsized in the rapids. You lost all of your belongings, but at least you're still alive." + riverSFX + winnerSFX + "Congratulations, you reached the dock at Oregon City! You finished the game with a score of <say-as interpret-as='cardinal'>" + this.event.session.attributes.finalscore + "</say-as> points. " + EXIT_SKILL_MESSAGE);
    this.response.cardRenderer("Congratulations, you reached Oregon City!", "Final score: " + this.event.session.attributes.finalscore);
    this.emit(':responseReady');
  },
  'YouDied': function() {
    var diseases = ["a fever", "dysentery", "an infection", "dehydration"];
    var fatality = diseases[Math.floor(Math.random() * diseases.length)];
    this.response.speak(this.event.session.attributes.travelingSFX + loserSFX + "You have died of " + fatality + ". Game over!");
    this.response.cardRenderer("Game over!", "You have died of " + fatality);
    this.emit(':responseReady');
  },
  'YouDrowned': function() {
    this.response.speak(riverSFX + loserSFX + "Your wagon was overtaken by water, and you drowned. Game over!");
    this.response.cardRenderer("Game over!", "You drowned trying to cross the " + this.event.session.attributes.mapLocation + ".");
    this.emit(':responseReady');
  },
  'NoFerryMoneyYouDrowned': function() {
    this.response.speak("Sorry, you don't have enough money to pay the ferry. You will have to try floating across the river." + riverSFX + loserSFX + "Your wagon was overtaken by water, and you drowned. Game over!");
    this.response.cardRenderer("Game over!", "You drowned trying to cross the " + this.event.session.attributes.mapLocation + ".");
    this.emit(':responseReady');
  },
  'ColumbiaRiverYouDrowned': function() {
    this.response.speak(loserSFX + "Your raft capsized in the rapids, and you drowned. Game over!");
    this.response.cardRenderer("Game over!", "You drowned in the Columbia River.");
    this.emit(':responseReady');
  },
  'ColumbiaRiverRaftSank': function() {
    this.response.speak(loserSFX + "Your raft was so badly damaged, it capsized in the rapids and you drowned. Game over!");
    this.response.cardRenderer("Game over!", "You drowned in the Columbia River.");
    this.emit(':responseReady');
  },
  'YouStarved': function() {
    this.response.speak(this.event.session.attributes.travelingSFX + loserSFX + "You have died of starvation. Game over!");
    this.response.cardRenderer("Game over!", "You have died of starvation.");
    this.emit(':responseReady');
  },
  'YouFroze': function() {
    this.response.speak(this.event.session.attributes.travelingSFX + loserSFX + "You got stuck in a large snow storm for " + this.event.session.attributes.lostDays + " days and froze to death.");
    this.response.cardRenderer("Game over!", "You froze to death.");
    this.emit(':responseReady');
  },
  'NoMoreOxenOxProbs': function() {
    var allOxProblems = ["An ox has wandered off.", "An ox has died."];
    var randomOxProblem = allOxProblems[Math.floor(Math.random() * allOxProblems.length)];
    this.response.speak(this.event.session.attributes.travelingSFX + loserSFX + randomOxProblem + " That was your last ox. This is as far as you can go. Good luck homesteading!");
    this.response.cardRenderer("Game over!", "You don't have an ox to pull your wagon.");
    this.emit(':responseReady');
  },
  'NoMoreOxenFire': function() {
    if (this.event.session.attributes.oxen === 1) {
      this.response.speak(this.event.session.attributes.travelingSFX + loserSFX + "A fire broke out and killed your last ox. This is as far as you can go. Good luck homesteading!");
      this.response.cardRenderer("Game over!", "You don't have an ox to pull your wagon.");
      this.emit(':responseReady');
    } else {
      this.response.speak(this.event.session.attributes.travelingSFX + loserSFX + "A fire broke out and killed your last oxen. This is as far as you can go. Good luck homesteading!");
      this.response.cardRenderer("Game over!", "You don't have an ox to pull your wagon.");
      this.emit(':responseReady');
    }
  },
  'NoMoreOxenThief': function() {
    if (this.event.session.attributes.oxen === 1) {
      this.response.speak(this.event.session.attributes.travelingSFX + loserSFX + "A thief stole your last ox. This is as far as you can go. Good luck homesteading!");
      this.response.cardRenderer("Game over!", "You don't have an ox to pull your wagon.");
      this.emit(':responseReady');
    } else {
      this.response.speak(this.event.session.attributes.travelingSFX + loserSFX + "A thief stole your last oxen. This is as far as you can go. Good luck homesteading!");
      this.response.cardRenderer("Game over! You don't have an ox to pull your wagon.");
      this.emit(':responseReady');
    }
  },
  'NoMoreOxenThunderstorm': function() {
    this.response.speak(stormSFX + "You got caught in a major thunderstorm and your last ox ran away. " + loserSFX + "This is as far as you can go. Good luck homesteading!");
    this.response.cardRenderer("Game over!", "You don't have an ox to pull your wagon.");
    this.emit(':responseReady');
  },
  'BrokenWagon': function() {
    this.response.speak(this.event.session.attributes.travelingSFX + loserSFX + "Your wagon broke, and you don't have any spare parts to fix it. This is as far as you can go. Good luck homesteading!");
    this.response.cardRenderer("Game over!", "Your wagon broke, and you don't have any spare parts to fix it.");
    this.emit(':responseReady');
  },
  'AMAZON.HelpIntent': function() {
    this.response.speak().listen();
    this.emit(":responseReady");
  },
  'AMAZON.StartOverIntent': function() {
    this.handler.state = GAME_STATES.USER_SETUP;
    this.emitWithState('StartGameAgain');
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
    this.response.speak().listen();
    this.emit(":responseReady");
  },
});


// ====================
// GLOBAL GAME FEATURES
// ====================
// 1846 CALENDAR
var dateFrom1846 = function(day){
  var date = new Date(1846, 0);
  return new Date(date.setDate(day));
};

// CAPITALIZE NAMES
var capitalizeFirstLetter = function(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
};

// STATUS CARD TITLE
var statusCardTitle = function() {
  return dateFrom1846(this.event.session.attributes.days).toDateString();
};

// STATUS CARD CONTENT
var statusCardContent = function() {
  if (this.event.session.attributes.mapLocation === "Independence") {
    return "\nCurrent location: " + this.event.session.attributes.mapLocation
    + "\nDays on the trail: " + this.event.session.attributes.trailDays
    + "\nMiles: " + this.event.session.attributes.miles + "/" + (1740 + this.event.session.attributes.extraMiles)
    + "\nMoney: " + this.event.session.attributes.money
    + "\nFood: " + this.event.session.attributes.food
    + "\nOxen: " + this.event.session.attributes.oxen
    + "\nParts: " + this.event.session.attributes.parts
    + "\nYour party: " + this.event.session.attributes.peopleHealthy.join(", ");
  } else if (this.event.session.attributes.peopleSick.length === 0) {
    return "\nCurrent location: " + this.event.session.attributes.mapLocation
    + "\nDays on the trail: " + this.event.session.attributes.trailDays
    + "\nMiles: " + this.event.session.attributes.miles + "/" + (1740 + this.event.session.attributes.extraMiles)
    + "\nMoney: " + this.event.session.attributes.money
    + "\nFood: " + this.event.session.attributes.food
    + "\nOxen: " + this.event.session.attributes.oxen
    + "\nParts: " + this.event.session.attributes.parts
    + "\nHealthy: " + this.event.session.attributes.peopleHealthy.join(", ");
  } else if (this.event.session.attributes.peopleHealthy.legnth === 0) {
    return "\nCurrent location: " + this.event.session.attributes.mapLocation
    + "\nDays on the trail: " + this.event.session.attributes.trailDays
    + "\nMiles: " + this.event.session.attributes.miles + "/" + (1740 + this.event.session.attributes.extraMiles)
    + "\nMoney: " + this.event.session.attributes.money
    + "\nFood: " + this.event.session.attributes.food
    + "\nOxen: " + this.event.session.attributes.oxen
    + "\nParts: " + this.event.session.attributes.parts
    + "\nSick/injured: " + this.event.session.attributes.peopleSick.join(", ");
  } else {
    return "\nCurrent location: " + this.event.session.attributes.mapLocation
    + "\nDays on the trail: " + this.event.session.attributes.trailDays
    + "\nMiles: " + this.event.session.attributes.miles + "/" + (1740 + this.event.session.attributes.extraMiles)
    + "\nMoney: " + this.event.session.attributes.money
    + "\nFood: " + this.event.session.attributes.food
    + "\nOxen: " + this.event.session.attributes.oxen
    + "\nParts: " + this.event.session.attributes.parts
    + "\nHealthy: " + this.event.session.attributes.peopleHealthy.join(", ")
    + "\nSick/injured: " + this.event.session.attributes.peopleSick.join(", ");
  }
};

var getPoints = function() {
  var points = (this.event.session.attributes.peopleHealthy.length * 100) + (this.event.session.attributes.peopleSick.length * 50) + (this.event.session.attributes.oxen * 50) + (this.event.session.attributes.food * 2) + (this.event.session.attributes.parts * 10) + this.event.session.attributes.money - this.event.session.attributes.trailDays - this.event.session.attributes.columbiaRiverDamage;
  if (this.event.session.attributes.profession === "farmer") {
    points = points*3;
  } else if (this.event.session.attributes.profession === "carpenter") {
    points = points*2;
  }
  this.event.session.attributes.finalscore = points;
  return this.event.session.attributes.finalscore;
};

// SOUND EFFECTS
const wagonWheels1SFX = "<audio src='https://s3.amazonaws.com/oregontrailsoundeffects/wagonwheels1.mp3' />";
const wagonWheels2SFX = "<audio src='https://s3.amazonaws.com/oregontrailsoundeffects/wagonwheels2.mp3' />";
const wagonWheels3SFX = "<audio src='https://s3.amazonaws.com/oregontrailsoundeffects/wagonwheels3.mp3' />";
const wagonWheels4SFX = "<audio src='https://s3.amazonaws.com/oregontrailsoundeffects/wagonwheels4.mp3' />";
const wagonWheels5SFX = "<audio src='https://s3.amazonaws.com/oregontrailsoundeffects/wagonwheels5.mp3' />";
const goodNewsSFX = "<audio src='https://s3.amazonaws.com/oregontrailsoundeffects/goodnews.mp3' />";
const badNewsSFX = "<audio src='https://s3.amazonaws.com/oregontrailsoundeffects/badnews.mp3' />";
const fortSFX = "<audio src='https://s3.amazonaws.com/oregontrailsoundeffects/fort.mp3' />";
const riverSFX = "<audio src='https://s3.amazonaws.com/oregontrailsoundeffects/river.mp3' />";
const stormSFX = "<audio src='https://s3.amazonaws.com/oregontrailsoundeffects/storm.mp3' />";
const gunShotSFX = "<audio src='https://s3.amazonaws.com/oregontrailsoundeffects/gunshot.mp3' />";
const hungrySFX = "<audio src='https://s3.amazonaws.com/oregontrailsoundeffects/hungry.mp3' />";
const stampedeSFX = "<audio src='https://s3.amazonaws.com/oregontrailsoundeffects/stampede.mp3' />";
const cashSFX = "<audio src='https://s3.amazonaws.com/oregontrailsoundeffects/cash.mp3' />";
const wildlifeSFX = "<audio src='https://s3.amazonaws.com/oregontrailsoundeffects/wildlife.mp3' />";
const deathSFX = "<audio src='https://s3.amazonaws.com/oregontrailsoundeffects/death.mp3' />";
const winnerSFX = "<audio src='https://s3.amazonaws.com/oregontrailsoundeffects/winner.mp3' />";
const loserSFX = "<audio src='https://s3.amazonaws.com/oregontrailsoundeffects/loser.mp3' />";

// ==========
// GAME SETUP
// ==========
// MAIN PLAYER
var gameIntro = function() {
  this.event.session.attributes.mapLocation = "Independence";
  this.response.speak(winnerSFX + WELCOME_MESSAGE + " " + START_GAME_MESSAGE + " Let's begin by setting up your five-person party." + " " + "What is your name?").listen("What is your name?");
  this.response.cardRenderer(WELCOME_MESSAGE, START_GAME_MESSAGE);
  this.emit(':responseReady');
};

var gameIntroStartOver = function() {
  this.event.session.attributes.mapLocation = "Independence";
  this.response.speak("Ok, let's start over. What is your name?").listen("What is your name?");
  this.response.cardRenderer(WELCOME_MESSAGE, START_GAME_MESSAGE);
  this.emit(':responseReady');
};

// PARTY
var setupParty = function() {
  if (this.event.session.attributes.peopleHealthy.length === 1) {
    this.response.speak("Hello, " + this.event.session.attributes.mainPlayer + "! What is the name of the second person in your party?").listen("Please name the second person in your party.");
    this.emit(':responseReady');
  } else if (this.event.session.attributes.peopleHealthy.length === 2) {
    this.response.speak("What is the name of the third person in your party?").listen("Please name the third person in your party.");
    this.emit(':responseReady');
  } else if (this.event.session.attributes.peopleHealthy.length === 3) {
    this.response.speak("What is the name of the fourth person in your party?").listen("Please name the fourth person in your party.");
    this.emit(':responseReady');
  } else if (this.event.session.attributes.peopleHealthy.length === 4) {
    this.response.speak("What is the name of the fifth person in your party?").listen("Please name the fifth person in your party.");
    this.emit(':responseReady');
  } else {
    this.handler.state = GAME_STATES.PROFESSION_SETUP;
    this.emitWithState('GetProfession');
  }
};

// PROFESSION
var chooseProfession = function() {
  if (this.event.session.attributes.profession === undefined) {
    this.event.session.attributes.hasChosenProfession = true;
    this.response.speak("Great! Now let's choose your profession. You can be a banker, a carpenter, or a farmer. What do you want to be?").listen("You must choose to be a banker, a carpenter, or a farmer. What do you want to be?");
    this.emit(':responseReady');
  } else {
    this.handler.state = GAME_STATES.SUPPLIES_SETUP;
    this.emitWithState('GetNumber');
  }
};

var chooseProfessionAgain = function() {
  this.response.speak("You must choose to be a banker, a carpenter, or a farmer. What do you want to be?").listen("You must choose to be a banker, a carpenter, or a farmer. What do you want to be?");
  this.emit(':responseReady');
};

// SUPPLIES
const GENERAL_STORE_MESSAGE = "Before leaving, you need to stock up on supplies. Let's go to the general store and buy food, oxen, and spare parts." + fortSFX + " We'll start with food. " + COST_FOOD + " I recommend at least 1,000 pounds.";

var generalStore = function () {
  this.event.session.attributes.hasBeenToGeneralStore = true;
  var buyFood = function() {
    this.event.session.attributes.currentlyBuyingWhat = "pounds of food";
    this.event.session.attributes.itemPrice = PRICE_FOOD;
    this.event.session.attributes.TRY_BUYING_AGAIN = COST_FOOD + " " + Q_HOW_MANY_FOOD;
    if (this.event.session.attributes.profession.toLowerCase() === "banker") {
      this.event.session.attributes.money += 1200;
      this.response.speak("You are a banker. You have $" + this.event.session.attributes.money + ". " + GENERAL_STORE_MESSAGE + " You currently have " + this.event.session.attributes.food + " pounds of food. " + Q_HOW_MANY_FOOD).listen(COST_FOOD + " " + Q_HOW_MANY_FOOD);
      this.emit(':responseReady');
    } else if (this.event.session.attributes.profession.toLowerCase() === "carpenter") {
      this.event.session.attributes.money += 800;
      this.event.session.attributes.parts += 4;
      this.response.speak("You are a carpenter. You have $" + this.event.session.attributes.money + " and " + this.event.session.attributes.parts + " spare parts. " + GENERAL_STORE_MESSAGE + " You currently have " + this.event.session.attributes.food + " pounds of food. " + Q_HOW_MANY_FOOD).listen(COST_FOOD + " " + Q_HOW_MANY_FOOD);
      this.emit(':responseReady');
    } else if (this.event.session.attributes.profession.toLowerCase() === "farmer") {
      this.event.session.attributes.money += 400;
      this.event.session.attributes.food += 500;
      this.event.session.attributes.oxen += 4;
      this.response.speak("You are a farmer. You have $" + this.event.session.attributes.money + ", " + this.event.session.attributes.food + " pounds of food, and " + this.event.session.attributes.oxen + " oxen. " + GENERAL_STORE_MESSAGE + " You currently have " + this.event.session.attributes.food + " pounds of food. " + Q_HOW_MANY_FOOD).listen(COST_FOOD + " " + Q_HOW_MANY_FOOD);
      this.emit(':responseReady');
    }
  };

  var buyOxen = function() {
    this.event.session.attributes.currentlyBuyingWhat = "oxen";
    this.event.session.attributes.itemPrice = PRICE_OXEN;
    this.event.session.attributes.TRY_BUYING_AGAIN = COST_OXEN + " " + Q_HOW_MANY_OXEN;
    if (this.event.session.attributes.currentlyBuyingHowMany === 0) {
      this.response.speak("Ok, you bought " + this.event.session.attributes.currentlyBuyingHowMany + " pounds of food and still have $" + this.event.session.attributes.money + ". Now let's buy oxen. You will need these oxen to pull your wagon. " + COST_OXEN + " I recommend at least six oxen. You currently have " + this.event.session.attributes.oxen + " oxen. " + Q_HOW_MANY_OXEN).listen(COST_OXEN + " " + Q_HOW_MANY_OXEN);
      this.emit(':responseReady');
    } else if (this.event.session.attributes.currentlyBuyingHowMany === 1) {
      this.response.speak(cashSFX + "You bought " + this.event.session.attributes.currentlyBuyingHowMany + " pound of food and have $" + this.event.session.attributes.money + " left. Now let's buy oxen. You will need these oxen to pull your wagon. " + COST_OXEN + " I recommend at least six oxen. You currently have " + this.event.session.attributes.oxen + " oxen. " + Q_HOW_MANY_OXEN).listen(COST_OXEN + " " + Q_HOW_MANY_OXEN);
      this.emit(':responseReady');
    } else {
      this.response.speak(cashSFX + "You bought " + this.event.session.attributes.currentlyBuyingHowMany + " pounds of food and have $" + this.event.session.attributes.money + " left. Now let's buy oxen. You will need these oxen to pull your wagon. " + COST_OXEN + " I recommend at least six oxen. You currently have " + this.event.session.attributes.oxen + " oxen. " + Q_HOW_MANY_OXEN).listen(COST_OXEN + " " + Q_HOW_MANY_OXEN);
      this.emit(':responseReady');
    }
  };

  var buyParts = function() {
    this.event.session.attributes.currentlyBuyingWhat = "spare parts";
    this.event.session.attributes.itemPrice = PRICE_PARTS;
    this.event.session.attributes.TRY_BUYING_AGAIN = COST_PARTS + " " + Q_HOW_MANY_PARTS;
    if (this.event.session.attributes.currentlyBuyingHowMany === 0) {
      this.response.speak("Ok, you bought " + this.event.session.attributes.currentlyBuyingHowMany + " oxen and still have $" + this.event.session.attributes.money + ". Now let's buy spare parts. You will need these parts in case your wagon breaks down along the trail. " + COST_PARTS + " I recommend at least three spare parts. You currently have " + this.event.session.attributes.parts + " spare parts. " + Q_HOW_MANY_PARTS).listen(COST_PARTS + " " + Q_HOW_MANY_PARTS);
      this.emit(':responseReady');
    } else if (this.event.session.attributes.currentlyBuyingHowMany === 1) {
      this.response.speak(cashSFX + "You bought " + this.event.session.attributes.currentlyBuyingHowMany + " ox and have $" + this.event.session.attributes.money + " left. Now let's buy spare parts. You will need these parts in case your wagon breaks down along the trail. " + COST_PARTS + " I recommend at least three spare parts. You currently have " + this.event.session.attributes.parts + " spare parts. " + Q_HOW_MANY_PARTS).listen(COST_PARTS + " " + Q_HOW_MANY_PARTS);
      this.emit(':responseReady');
    } else {
      this.response.speak(cashSFX + "You bought " + this.event.session.attributes.currentlyBuyingHowMany + " oxen and have $" + this.event.session.attributes.money + " left. Now let's buy spare parts. You will need these parts in case your wagon breaks down along the trail. " + COST_PARTS + " I recommend at least three spare parts. You currently have " + this.event.session.attributes.parts + " spare parts. " + Q_HOW_MANY_PARTS).listen(COST_PARTS + " " + Q_HOW_MANY_PARTS);
      this.emit(':responseReady');
    }
  };

  if (this.event.session.attributes.boughtFood === false) {
    buyFood.call(this);
  } else if (this.event.session.attributes.boughtOxen === false) {
    buyOxen.call(this);
  } else if (this.event.session.attributes.boughtParts === false) {
    buyParts.call(this);
  } else {
    this.handler.state = GAME_STATES.MONTH_SETUP;
    this.emitWithState('GetStartingMonth');
  }
};

var notEnoughMoney = function() {
  this.response.speak("Sorry, you only have $ " + this.event.session.attributes.money + ". " + this.event.session.attributes.TRY_BUYING_AGAIN).listen(this.event.session.attributes.TRY_BUYING_AGAIN);
  this.emit(':responseReady');
};

var mustBuyOxen = function() {
  this.response.speak("Sorry, you must buy at least one ox to pull your wagon. " + COST_OXEN + " " + Q_HOW_MANY_OXEN).listen(COST_OXEN + " " + Q_HOW_MANY_OXEN);
  this.emit(':responseReady');
};

// WHEN TO LEAVE
var chooseMonth = function() {
  this.event.session.attributes.hasChosenMonth = true;
  if (this.event.session.attributes.oxen === 1 && this.event.session.attributes.parts === 1) {
    if (this.event.session.attributes.currentlyBuyingHowMany === 0) {
      this.response.speak("Great! You have " + this.event.session.attributes.food + " pounds of food, " + this.event.session.attributes.oxen + " ox, and " + this.event.session.attributes.parts + " spare part. You also have $" + this.event.session.attributes.money + " left in your pocket. " + this.event.session.attributes.peopleHealthy[1] + ", " + this.event.session.attributes.peopleHealthy[2] + ", " + this.event.session.attributes.peopleHealthy[3] + ", and " + this.event.session.attributes.peopleHealthy[4] + " are ready to go. When do you want to start your journey? Choose a month between March and August.").listen("You can start your journey in March, April, May, June, July, or August. Which month do you want?");
      this.emit(':responseReady');
    } else {
      this.response.speak(cashSFX + "Great! You have " + this.event.session.attributes.food + " pounds of food, " + this.event.session.attributes.oxen + " ox, and " + this.event.session.attributes.parts + " spare part. You also have $" + this.event.session.attributes.money + " left in your pocket. " + this.event.session.attributes.peopleHealthy[1] + ", " + this.event.session.attributes.peopleHealthy[2] + ", " + this.event.session.attributes.peopleHealthy[3] + ", and " + this.event.session.attributes.peopleHealthy[4] + " are ready to go. When do you want to start your journey? Choose a month between March and August.").listen("You can start your journey in March, April, May, June, July, or August. Which month do you want?");
      this.emit(':responseReady');
    }
  } else if (this.event.session.attributes.oxen === 1 && this.event.session.attributes.parts > 1) {
    if (this.event.session.attributes.currentlyBuyingHowMany === 0) {
      this.response.speak("Great! You have " + this.event.session.attributes.food + " pounds of food, " + this.event.session.attributes.oxen + " ox, and " + this.event.session.attributes.parts + " spare parts. You also have $" + this.event.session.attributes.money + " left in your pocket. " + this.event.session.attributes.peopleHealthy[1] + ", " + this.event.session.attributes.peopleHealthy[2] + ", " + this.event.session.attributes.peopleHealthy[3] + ", and " + this.event.session.attributes.peopleHealthy[4] + " are ready to go. When do you want to start your journey? Choose a month between March and August.").listen("You can start your journey in March, April, May, June, July, or August. Which month do you want?");
      this.emit(':responseReady');
    } else {
      this.response.speak(cashSFX + "Great! You have " + this.event.session.attributes.food + " pounds of food, " + this.event.session.attributes.oxen + " ox, and " + this.event.session.attributes.parts + " spare parts. You also have $" + this.event.session.attributes.money + " left in your pocket. " + this.event.session.attributes.peopleHealthy[1] + ", " + this.event.session.attributes.peopleHealthy[2] + ", " + this.event.session.attributes.peopleHealthy[3] + ", and " + this.event.session.attributes.peopleHealthy[4] + " are ready to go. When do you want to start your journey? Choose a month between March and August.").listen("You can start your journey in March, April, May, June, July, or August. Which month do you want?");
      this.emit(':responseReady');
    }
  } else if (this.event.session.attributes.oxen > 1 && this.event.session.attributes.parts === 1) {
    if (this.event.session.attributes.currentlyBuyingHowMany === 0) {
      this.response.speak("Great! You have " + this.event.session.attributes.food + " pounds of food, " + this.event.session.attributes.oxen + " oxen, and " + this.event.session.attributes.parts + " spare part. You also have $" + this.event.session.attributes.money + " left in your pocket. " + this.event.session.attributes.peopleHealthy[1] + ", " + this.event.session.attributes.peopleHealthy[2] + ", " + this.event.session.attributes.peopleHealthy[3] + ", and " + this.event.session.attributes.peopleHealthy[4] + " are ready to go. When do you want to start your journey? Choose a month between March and August.").listen("You can start your journey in March, April, May, June, July, or August. Which month do you want?");
      this.emit(':responseReady');
    } else {
      this.response.speak(cashSFX + "Great! You have " + this.event.session.attributes.food + " pounds of food, " + this.event.session.attributes.oxen + " oxen, and " + this.event.session.attributes.parts + " spare part. You also have $" + this.event.session.attributes.money + " left in your pocket. " + this.event.session.attributes.peopleHealthy[1] + ", " + this.event.session.attributes.peopleHealthy[2] + ", " + this.event.session.attributes.peopleHealthy[3] + ", and " + this.event.session.attributes.peopleHealthy[4] + " are ready to go. When do you want to start your journey? Choose a month between March and August.").listen("You can start your journey in March, April, May, June, July, or August. Which month do you want?");
      this.emit(':responseReady');
    }
  } else {
    if (this.event.session.attributes.currentlyBuyingHowMany === 0) {
      this.response.speak("Great! You have " + this.event.session.attributes.food + " pounds of food, " + this.event.session.attributes.oxen + " oxen, and " + this.event.session.attributes.parts + " spare parts. You also have $" + this.event.session.attributes.money + " left in your pocket. " + this.event.session.attributes.peopleHealthy[1] + ", " + this.event.session.attributes.peopleHealthy[2] + ", " + this.event.session.attributes.peopleHealthy[3] + ", and " + this.event.session.attributes.peopleHealthy[4] + " are ready to go. When do you want to start your journey? Choose a month between March and August.").listen("You can start your journey in March, April, May, June, July, or August. Which month do you want?");
      this.emit(':responseReady');
    } else {
      this.response.speak(cashSFX + "Great! You have " + this.event.session.attributes.food + " pounds of food, " + this.event.session.attributes.oxen + " oxen, and " + this.event.session.attributes.parts + " spare parts. You also have $" + this.event.session.attributes.money + " left in your pocket. " + this.event.session.attributes.peopleHealthy[1] + ", " + this.event.session.attributes.peopleHealthy[2] + ", " + this.event.session.attributes.peopleHealthy[3] + ", and " + this.event.session.attributes.peopleHealthy[4] + " are ready to go. When do you want to start your journey? Choose a month between March and August.").listen("You can start your journey in March, April, May, June, July, or August. Which month do you want?");
      this.emit(':responseReady');
    }
  }
};

var chooseMonthAgain = function() {
  this.response.speak("You can start your journey in March, April, May, June, July, or August. Which month do you want?").listen("You can start your journey in March, April, May, June, July, or August. Which month do you want?");
  this.emit(':responseReady');
};

var setDays = function() {
  if (this.event.session.attributes.month.toLowerCase() === "march") {
    this.event.session.attributes.days = 60;
    this.handler.state = GAME_STATES.EVENT;
    this.emitWithState('BeginJourney');
  } else if (this.event.session.attributes.month.toLowerCase() === "april") {
    this.event.session.attributes.days = 91;
    this.handler.state = GAME_STATES.EVENT;
    this.emitWithState('BeginJourney');
  } else if (this.event.session.attributes.month.toLowerCase() === "may") {
    this.event.session.attributes.days = 121;
    this.handler.state = GAME_STATES.EVENT;
    this.emitWithState('BeginJourney');
  } else if (this.event.session.attributes.month.toLowerCase() === "june") {
    this.event.session.attributes.days = 152;
    this.handler.state = GAME_STATES.EVENT;
    this.emitWithState('BeginJourney');
  } else if (this.event.session.attributes.month.toLowerCase() === "july") {
    this.event.session.attributes.days = 182;
    this.handler.state = GAME_STATES.EVENT;
    this.emitWithState('BeginJourney');
  } else if (this.event.session.attributes.month.toLowerCase() === "august") {
    this.event.session.attributes.days = 213;
    this.handler.state = GAME_STATES.EVENT;
    this.emitWithState('BeginJourney');
  }
};



// ======================
// EVENTS ALONG THE TRAIL
// ======================
// RANDOM EVENTS
var randomEvents = function() {
  if (this.event.session.attributes.trailDays > 2) {
    // HUNTING
    if (this.event.session.attributes.fate < 3 && this.event.session.attributes.trailDays % 4 === 0) {
      this.handler.state = GAME_STATES.HUNT;
      this.emitWithState('ChooseToHunt');
    // SICKNESS/INJURY
    } else if (this.event.session.attributes.fate % 4 === 0 && this.event.session.attributes.trailDays % 4 === 0) {
      this.handler.state = GAME_STATES.SICK;
      this.emitWithState('Alert');
    // DEATH OF SICK/INJURED
    } else if (this.event.session.attributes.fate === 10 && this.event.session.attributes.trailDays % 2 === 0) {
      this.handler.state = GAME_STATES.EVENT;
      this.emitWithState('Death');
    // WEATHER
    } else if (this.event.session.attributes.fate === 3 && this.event.session.attributes.trailDays % 2 === 0) {
      if (this.event.session.attributes.days < 121 || (this.event.session.attributes.days >= 305 && this.event.session.attributes.days < 486) || this.event.session.attributes.days >= 671) {
        this.event.session.attributes.lostDays = Math.floor(Math.random() * (7 - 4 + 1)) + 1;
        this.handler.state = GAME_STATES.EVENT;
        this.emitWithState('Snow');
      } else if ((this.event.session.attributes.days >= 121 && this.event.session.attributes.days < 213) || (this.event.session.attributes.days >= 486 && this.event.session.attributes.days < 578)) {
        this.event.session.attributes.lostDays = Math.floor(Math.random() * (3 - 1 + 1)) + 1;
        this.handler.state = GAME_STATES.EVENT;
        this.emitWithState('Storm');
      } else {
        this.event.session.attributes.trailDaysWithoutIncident++;
        this.handler.state = GAME_STATES.EVENT;
        this.emitWithState('PlayGame');
      }
    // GREAT AMERICAN DESERT
    } else if (this.event.session.attributes.fate === 9) {
      if (this.event.session.attributes.mapLocation === "Kansas River" || this.event.session.attributes.mapLocation === "Fort Kearny" || this.event.session.attributes.mapLocation === "Chimney Rock") {
        if (this.event.session.attributes.days < 121 || (this.event.session.attributes.days >= 364 && this.event.session.attributes.days < 486)) {
          this.handler.state = GAME_STATES.EVENT;
          this.emitWithState('NoGrass');
        } else if (this.event.session.attributes.days >= 182 && this.event.session.attributes.days < 213) {
          this.handler.state = GAME_STATES.EVENT;
          this.emitWithState('BuffaloStampede');
        } else {
          this.event.session.attributes.trailDaysWithoutIncident++;
          this.handler.state = GAME_STATES.EVENT;
          this.emitWithState('PlayGame');
        }
      } else {
        this.event.session.attributes.trailDaysWithoutIncident++;
        this.handler.state = GAME_STATES.EVENT;
        this.emitWithState('PlayGame');
      }
    // GOOD THINGS
    } else if (this.event.session.attributes.fate === 7 && this.event.session.attributes.trailDays % 2 === 1) {
      var goodThing = Math.floor(Math.random() * (2 - 1 + 1)) + 1;
      if (goodThing === 1) {
        if ((this.event.session.attributes.days >= 121 && this.event.session.attributes.days < 274) || (this.event.session.attributes.days >= 486 && this.event.session.attributes.days < 639)) {
          this.handler.state = GAME_STATES.EVENT;
          this.emitWithState('FindBerries');
        } else {
          this.handler.state = GAME_STATES.EVENT;
          this.emitWithState('FindItems');
        }
      } else if (goodThing === 2 && this.event.session.attributes.peopleSick.length > 0 && this.event.session.attributes.daysWithoutFood === 0) {
        recovery.call(this);
      } else {
        this.event.session.attributes.trailDaysWithoutIncident++;
        this.handler.state = GAME_STATES.EVENT;
        this.emitWithState('PlayGame');
      }
    // BAD THINGS
    } else if (this.event.session.attributes.fate === 6 && this.event.session.attributes.trailDays % 2 === 1) {
      var badThing = Math.floor(Math.random() * (5 - 1 + 1)) + 1;
      if (badThing === 1) {
        this.handler.state = GAME_STATES.EVENT;
        this.emitWithState('OxProblem');
      } else if (badThing === 2) {
        this.handler.state = GAME_STATES.EVENT;
        this.emitWithState('Fire');
      } else if (badThing === 3) {
        this.handler.state = GAME_STATES.EVENT;
        this.emitWithState('Thief');
      } else if (badThing === 4) {
        this.handler.state = GAME_STATES.EVENT;
        this.emitWithState('BrokenWagon');
      } else if (badThing === 5) {
        this.handler.state = GAME_STATES.EVENT;
        this.emitWithState('GetLost');
      } else {
        this.event.session.attributes.trailDaysWithoutIncident++;
        this.handler.state = GAME_STATES.EVENT;
        this.emitWithState('PlayGame');
      }
    } else {
      this.event.session.attributes.trailDaysWithoutIncident++;
      this.handler.state = GAME_STATES.EVENT;
      this.emitWithState('PlayGame');
    }
  } else {
    this.event.session.attributes.trailDaysWithoutIncident++;
    this.handler.state = GAME_STATES.EVENT;
    this.emitWithState('PlayGame');
  }
};

// TRADING
var evaluateOffer = function() {
  if (this.event.session.attributes.tradeDeal === 1) {
    if (this.event.session.attributes.food >= 50) {
      this.event.session.attributes.parts++;
      this.event.session.attributes.food -= 50;
      this.handler.state = GAME_STATES.FORT;
      this.emitWithState('TradeSuccess');
    } else {
      this.handler.state = GAME_STATES.FORT;
      this.emitWithState('TradeFailure');
    }
  } else if (this.event.session.attributes.tradeDeal === 2) {
    if (this.event.session.attributes.oxen > 1) {
      this.event.session.attributes.food += 100;
      this.event.session.attributes.oxen--;
      this.handler.state = GAME_STATES.FORT;
      this.emitWithState('TradeSuccess');
    } else {
      this.handler.state = GAME_STATES.FORT;
      this.emitWithState('TradeFailure');
    }
  } else if (this.event.session.attributes.tradeDeal === 3) {
    if (this.event.session.attributes.parts >= 1) {
      this.event.session.attributes.money += 15;
      this.event.session.attributes.parts--;
      this.handler.state = GAME_STATES.FORT;
      this.emitWithState('TradeSuccess');
    } else {
      this.handler.state = GAME_STATES.FORT;
      this.emitWithState('TradeFailure');
    }
  } else if (this.event.session.attributes.tradeDeal === 4) {
    if (this.event.session.attributes.money >= 25) {
      this.event.session.attributes.oxen++;
      this.event.session.attributes.money -= 25;
      this.handler.state = GAME_STATES.FORT;
      this.emitWithState('TradeSuccess');
    } else {
      this.handler.state = GAME_STATES.FORT;
      this.emitWithState('TradeFailure');
    }
  } else if (this.event.session.attributes.tradeDeal === 5) {
    if (this.event.session.attributes.parts >= 1) {
      this.event.session.attributes.money += 30;
      this.event.session.attributes.parts --;
      this.handler.state = GAME_STATES.FORT;
      this.emitWithState('TradeSuccess');
    } else {
      this.handler.state = GAME_STATES.FORT;
      this.emitWithState('TradeFailure');
    }
  } else if (this.event.session.attributes.tradeDeal === 6) {
    if (this.event.session.attributes.oxen > 2) {
      this.event.session.attributes.food += 200;
      this.event.session.attributes.oxen -= 2;
      this.handler.state = GAME_STATES.FORT;
      this.emitWithState('TradeSuccess');
    } else {
      this.handler.state = GAME_STATES.FORT;
      this.emitWithState('TradeFailure');
    }
  } else if (this.event.session.attributes.tradeDeal === 7) {
    if (this.event.session.attributes.money >= 50) {
      this.event.session.attributes.parts++;
      this.event.session.attributes.money -= 50;
      this.handler.state = GAME_STATES.FORT;
      this.emitWithState('TradeSuccess');
    } else {
      this.handler.state = GAME_STATES.FORT;
      this.emitWithState('TradeFailure');
    }
  } else if (this.event.session.attributes.tradeDeal === 8) {
    if (this.event.session.attributes.oxen > 1) {
      this.event.session.attributes.money += 100;
      this.event.session.attributes.oxen--;
      this.handler.state = GAME_STATES.FORT;
      this.emitWithState('TradeSuccess');
    } else {
      this.handler.state = GAME_STATES.FORT;
      this.emitWithState('TradeFailure');
    }
  } else if (this.event.session.attributes.tradeDeal === 9) {
    if (this.event.session.attributes.parts >= 1) {
      this.event.session.attributes.money += 20;
      this.event.session.attributes.parts--;
      this.handler.state = GAME_STATES.FORT;
      this.emitWithState('TradeSuccess');
    } else {
      this.handler.state = GAME_STATES.FORT;
      this.emitWithState('TradeFailure');
    }
  } else if (this.event.session.attributes.tradeDeal === 10) {
    if (this.event.session.attributes.food >= 50) {
      this.event.session.attributes.parts++;
      this.event.session.attributes.food -= 75;
      this.handler.state = GAME_STATES.FORT;
      this.emitWithState('TradeSuccess');
    } else {
      this.handler.state = GAME_STATES.FORT;
      this.emitWithState('TradeFailure');
    }
  }
};

// RESTING
var rest = function() {
  var chanceOfRecovery = (Math.floor(Math.random() * (10 - 1 + 1)) + 1);
  if (this.event.session.attributes.daysOfRest >= 7 && chanceOfRecovery % 2 === 0) {
    this.event.session.attributes.days += this.event.session.attributes.daysOfRest;
    this.event.session.attributes.trailDays += this.event.session.attributes.daysOfRest;
    this.event.session.attributes.food -= this.event.session.attributes.daysOfRest*(this.event.session.attributes.peopleHealthy.length + this.event.session.attributes.peopleSick.length);
    this.event.session.attributes.howManyToHeal = 3;
    restRecovery.call(this);
  } else if (this.event.session.attributes.daysOfRest >= 5 && chanceOfRecovery % 2 === 0) {
    this.event.session.attributes.days += this.event.session.attributes.daysOfRest;
    this.event.session.attributes.trailDays += this.event.session.attributes.daysOfRest;
    this.event.session.attributes.food -= this.event.session.attributes.daysOfRest*(this.event.session.attributes.peopleHealthy.length + this.event.session.attributes.peopleSick.length);
    this.event.session.attributes.howManyToHeal = 2;
    restRecovery.call(this);
  } else if (this.event.session.attributes.daysOfRest >= 2 && chanceOfRecovery % 2 === 0) {
    this.event.session.attributes.days += this.event.session.attributes.daysOfRest;
    this.event.session.attributes.trailDays += this.event.session.attributes.daysOfRest;
    this.event.session.attributes.food -= this.event.session.attributes.daysOfRest*(this.event.session.attributes.peopleHealthy.length + this.event.session.attributes.peopleSick.length);
    this.event.session.attributes.howManyToHeal = 1;
    restRecovery.call(this);
  } else {
    this.event.session.attributes.days++;
    this.event.session.attributes.trailDays++;
    this.event.session.attributes.food -= (this.event.session.attributes.peopleHealthy.length + this.event.session.attributes.peopleSick.length);
    this.event.session.attributes.howManyToHeal = 0;
    this.handler.state = GAME_STATES.EVENT;
    this.emitWithState('RestRecovery');
  }
};

// REST RECOVERY
var restRecovery = function() {
  var peopleCured = 0;
  var recoveredPerson;
  var message = [];

  var healThem = function() {
    var recoveredIndex = Math.floor(Math.random() * ((this.event.session.attributes.peopleSick.length - 1) - 1 + 1)) + 1;
    if (peopleCured === 0) {
      if (this.event.session.attributes.peopleSick.includes(this.event.session.attributes.mainPlayer)) {
        this.event.session.attributes.peopleSick.shift();
        this.event.session.attributes.peopleHealthy.unshift(this.event.session.attributes.mainPlayer);
        peopleCured++;
        message.push("You are feeling much better.");
        healThem.call(this);
      } else {
        recoveredPerson = this.event.session.attributes.peopleSick.pop();
        this.event.session.attributes.peopleHealthy.push(recoveredPerson);
        peopleCured++;
        message.push(this.event.session.attributes.invalid + " is feeling much better.");
        healThem.call(this);
      }
    } else if (peopleCured < this.event.session.attributes.howManyToHeal && this.event.session.attributes.peopleSick.length > 0) {
      if (this.event.session.attributes.peopleSick.includes(this.event.session.attributes.mainPlayer)) {
        this.event.session.attributes.peopleSick.shift();
        this.event.session.attributes.peopleHealthy.unshift(this.event.session.attributes.mainPlayer);
        peopleCured++;
        message.push("You are feeling much better.");
        healThem.call(this);
      } else {
        recoveredPerson = this.event.session.attributes.peopleSick[recoveredIndex];
        this.event.session.attributes.peopleSick.splice(recoveredIndex, 1);
        this.event.session.attributes.peopleHealthy.push(recoveredPerson);
        peopleCured++;
        message.push(recoveredPerson + " is feeling much better.");
        healThem.call(this);
      }
    } else {
      this.event.session.attributes.recoveredMessage = message.join(" ");
      this.handler.state = GAME_STATES.EVENT;
      this.emitWithState('RestRecovery');
    }
  };

  healThem.call(this);
};

// RECOVERY
var recovery = function() {
  var recoveredIndex = Math.floor(Math.random() * this.event.session.attributes.peopleSick.length);
  if (this.event.session.attributes.peopleSick.includes(this.event.session.attributes.mainPlayer)) {
    this.event.session.attributes.peopleSick.shift();
    this.event.session.attributes.peopleHealthy.unshift(this.event.session.attributes.mainPlayer);
    this.event.session.attributes.recoveredMessage = "You are feeling much better.";
    this.handler.state = GAME_STATES.EVENT;
    this.emitWithState('Recovery');
  } else {
    var recoveredPerson = this.event.session.attributes.peopleSick[recoveredIndex];
    this.event.session.attributes.peopleSick.splice(recoveredIndex, 1);
    this.event.session.attributes.peopleHealthy.push(recoveredPerson);
    this.event.session.attributes.recoveredMessage = recoveredPerson + " is feeling much better.";
    this.handler.state = GAME_STATES.EVENT;
    this.emitWithState('Recovery');
  }
};

// SICKNESS
var sickness = function() {
  if (this.event.session.attributes.peopleHealthy.length > 1) {
    var invalidIndex = Math.floor(Math.random() * (this.event.session.attributes.peopleHealthy.length - 1 - 1 + 1)) + 1;
    this.event.session.attributes.invalid = this.event.session.attributes.peopleHealthy[invalidIndex];
    this.event.session.attributes.peopleHealthy.splice(invalidIndex, 1);
    this.event.session.attributes.peopleSick.push(this.event.session.attributes.invalid);
  } else if (this.event.session.attributes.peopleHealthy.length === 1) {
    this.event.session.attributes.invalid = this.event.session.attributes.peopleHealthy[0];
    this.event.session.attributes.peopleHealthy.splice(0, 1);
    this.event.session.attributes.peopleSick.unshift(this.event.session.attributes.invalid);
  }
};

// DEATH OF SICK PERSON
var deathPeopleSick = function() {
  if (this.event.session.attributes.peopleSick.length > 0) {
    var victimIndex;
    if (this.event.session.attributes.peopleSick.includes(this.event.session.attributes.mainPlayer)) {
      victimIndex = Math.floor(Math.random() * ((this.event.session.attributes.peopleSick.length - 1) - 1 + 1)) + 1;
    } else {
      victimIndex = Math.floor(Math.random() * this.event.session.attributes.peopleSick.length);
    }
    this.event.session.attributes.victim = this.event.session.attributes.peopleSick[victimIndex];
    this.event.session.attributes.peopleSick.splice(victimIndex, 1);
  }
};

// DEATH OF HEALTHY PERSON
var deathPeopleHealthy = function() {
  if (this.event.session.attributes.peopleSick.length > 0) {
    var victimIndex;
    if (this.event.session.attributes.peopleHealthy.includes(this.event.session.attributes.mainPlayer)) {
      victimIndex = Math.floor(Math.random() * ((this.event.session.attributes.peopleHealthy.length - 1) - 1 + 1)) + 1;
    } else {
      victimIndex = Math.floor(Math.random() * this.event.session.attributes.peopleHealthy.length);
    }
    this.event.session.attributes.victim = this.event.session.attributes.peopleHealthy[victimIndex];
    this.event.session.attributes.peopleHealthy.splice(victimIndex, 1);
  }
};


// =============
// THE TRAIL MAP
// =============
var travel = function() {
  if (this.event.session.attributes.miles === 105) {
    this.event.session.attributes.mapLocation = "Kansas River";
    if (this.event.session.attributes.days < 91) {
      this.event.session.attributes.riverDepth = 3;
    } else {
      this.event.session.attributes.riverDepth = 4;
    }
    this.event.session.attributes.ferryCost = 5;
    this.event.session.attributes.sinkChance = 2;
    this.handler.state = GAME_STATES.RIVER;
    this.emitWithState('CrossingChoice');
  } else if (this.event.session.attributes.miles === 300) {
    this.event.session.attributes.mapLocation = "Fort Kearny";
    this.event.session.attributes.tradeChances = 1;
    this.event.session.attributes.tradeAttempts = 0;
    this.handler.state = GAME_STATES.FORT;
    this.emitWithState('WelcomeToFort');
  } else if (this.event.session.attributes.miles === 555) {
    this.event.session.attributes.mapLocation = "Chimney Rock";
    this.handler.state = GAME_STATES.EVENT;
    this.emitWithState('ChimneyRock');
  } else if (this.event.session.attributes.miles === 645) {
    this.event.session.attributes.mapLocation = "Fort Laramie";
    this.event.session.attributes.tradeChances = 2;
    this.event.session.attributes.tradeAttempts = 0;
    this.handler.state = GAME_STATES.FORT;
    this.emitWithState('WelcomeToFort');
  } else if (this.event.session.attributes.miles === 825) {
    this.event.session.attributes.mapLocation = "Independence Rock";
    this.handler.state = GAME_STATES.EVENT;
    this.emitWithState('IndependenceRock');
  } else if (this.event.session.attributes.miles === 930) {
    this.event.session.attributes.mapLocation = "South Pass";
    this.handler.state = GAME_STATES.EVENT;
    this.emitWithState('SouthPass');
  } else if (this.event.session.attributes.miles === 1050 && this.event.session.attributes.mapLocation !== "Fort Bridger") {
    this.event.session.attributes.mapLocation = "Green River";
    this.event.session.attributes.riverDepth = 8;
    this.event.session.attributes.ferryCost = 12;
    this.event.session.attributes.sinkChance = 8;
    this.handler.state = GAME_STATES.RIVER;
    this.emitWithState('CrossingChoice');
  } else if (this.event.session.attributes.miles === 1200) {
    if (this.event.session.attributes.shortcut1 === true) {
      this.event.session.attributes.mapLocation = "Soda Springs";
      this.handler.state = GAME_STATES.EVENT;
      this.emitWithState('SodaSprings');
    } else {
      this.event.session.attributes.mapLocation = "Fort Bridger";
      this.event.session.attributes.tradeChances = 3;
      this.event.session.attributes.tradeAttempts = 0;
      this.handler.state = GAME_STATES.FORT;
      this.emitWithState('WelcomeToFort');
    }
  } else if (this.event.session.attributes.miles === 1260 && this.event.session.attributes.shortcut1 === true) {
    this.event.session.attributes.mapLocation = "Fort Hall";
    this.event.session.attributes.tradeChances = 2;
    this.event.session.attributes.tradeAttempts = 0;
    this.handler.state = GAME_STATES.FORT;
    this.emitWithState('WelcomeToFort');
  } else if (this.event.session.attributes.miles === 1305 && this.event.session.attributes.shortcut1 === false) {
    this.event.session.attributes.mapLocation = "Soda Springs";
    this.handler.state = GAME_STATES.EVENT;
    this.emitWithState('SodaSprings');
  } else if (this.event.session.attributes.miles === 1365 && this.event.session.attributes.shortcut1 === false) {
    this.event.session.attributes.mapLocation = "Fort Hall";
    this.event.session.attributes.tradeChances = 2;
    this.event.session.attributes.tradeAttempts = 0;
    this.handler.state = GAME_STATES.FORT;
    this.emitWithState('WelcomeToFort');
  } else if (this.event.session.attributes.miles === 1440 && this.event.session.attributes.shortcut1 === true) {
    this.event.session.attributes.mapLocation = "Snake River";
    this.event.session.attributes.riverDepth = 5;
    this.event.session.attributes.ferryCost = 7;
    this.event.session.attributes.sinkChance = 5;
    this.handler.state = GAME_STATES.RIVER;
    this.emitWithState('CrossingChoice');
  } else if (this.event.session.attributes.miles === 1545 && this.event.session.attributes.shortcut1 === false) {
    this.event.session.attributes.mapLocation = "Snake River";
    this.event.session.attributes.riverDepth = 5;
    this.event.session.attributes.ferryCost = 7;
    this.event.session.attributes.sinkChance = 5;
    this.handler.state = GAME_STATES.RIVER;
    this.emitWithState('CrossingChoice');
  } else if (this.event.session.attributes.miles === 1560 && this.event.session.attributes.shortcut1 === true) {
    this.event.session.attributes.mapLocation = "Fort Boise";
    this.event.session.attributes.tradeChances = 1;
    this.event.session.attributes.tradeAttempts = 0;
    this.handler.state = GAME_STATES.FORT;
    this.emitWithState('WelcomeToFort');
  } else if (this.event.session.attributes.miles === 1665 && this.event.session.attributes.shortcut1 === false) {
    this.event.session.attributes.mapLocation = "Fort Boise";
    this.event.session.attributes.tradeChances = 1;
    this.event.session.attributes.tradeAttempts = 0;
    this.handler.state = GAME_STATES.FORT;
    this.emitWithState('WelcomeToFort');
  } else if (this.event.session.attributes.miles === 1740 && this.event.session.attributes.shortcut1 === true && this.event.session.attributes.shortcut2 === true) {
    this.event.session.attributes.mapLocation = "The Dalles";
    this.handler.state = GAME_STATES.EVENT;
    this.emitWithState('TheDalles');
  } else if (this.event.session.attributes.miles === 1800 && this.event.session.attributes.shortcut1 === true && this.event.session.attributes.shortcut2 === false) {
    this.event.session.attributes.mapLocation = "Fort Walla Walla";
    this.event.session.attributes.tradeChances = 1;
    this.event.session.attributes.tradeAttempts = 0;
    this.handler.state = GAME_STATES.FORT;
    this.emitWithState('WelcomeToFort');
  } else if (this.event.session.attributes.miles === 1845 && this.event.session.attributes.shortcut1 === false && this.event.session.attributes.shortcut2 === true) {
    this.handler.state = GAME_STATES.EVENT;
    this.emitWithState('TheDalles');
  } else if (this.event.session.attributes.miles === 1890 && this.event.session.attributes.shortcut1 === true && this.event.session.attributes.shortcut2 === false && this.event.session.attributes.shortcut3 === false) {
    this.event.session.attributes.mapLocation = "Oregon City";
    this.handler.state = GAME_STATES.GAME_OVER;
    this.emitWithState('Winner');
  } else if (this.event.session.attributes.miles === 1905 && this.event.session.attributes.shortcut1 === false && this.event.session.attributes.shortcut2 === false) {
    this.event.session.attributes.mapLocation = "Fort Walla Walla";
    this.event.session.attributes.tradeChances = 1;
    this.event.session.attributes.tradeAttempts = 0;
    this.handler.state = GAME_STATES.FORT;
    this.emitWithState('WelcomeToFort');
  } else if (this.event.session.attributes.miles === 1995 && this.event.session.attributes.shortcut1 === false && this.event.session.attributes.shortcut2 === false && this.event.session.attributes.shortcut3 == false) {
    this.event.session.attributes.mapLocation = "Oregon City";
    this.handler.state = GAME_STATES.GAME_OVER;
    this.emitWithState('Winner');
  } else {
    randomEvents.call(this);
  }
};



// ================
// THE OREGON TRAIL
// ================
var theOregonTrail = function() {
  // TRAVEL SOUND EFFECTS
  if (this.event.session.attributes.trailDaysWithoutIncident >= 10) {
    this.event.session.attributes.travelingSFX = wagonWheels5SFX + wagonWheels5SFX;
  } else if (this.event.session.attributes.trailDaysWithoutIncident === 9) {
    this.event.session.attributes.travelingSFX = wagonWheels4SFX + wagonWheels5SFX;
  } else if (this.event.session.attributes.trailDaysWithoutIncident === 8) {
    this.event.session.attributes.travelingSFX = wagonWheels3SFX + wagonWheels5SFX;
  } else if (this.event.session.attributes.trailDaysWithoutIncident === 7) {
    this.event.session.attributes.travelingSFX = wagonWheels2SFX + wagonWheels5SFX;
  } else if (this.event.session.attributes.trailDaysWithoutIncident === 6) {
    this.event.session.attributes.travelingSFX = wagonWheels1SFX + wagonWheels5SFX;
  } else if (this.event.session.attributes.trailDaysWithoutIncident === 5) {
    this.event.session.attributes.travelingSFX = wagonWheels5SFX;
  } else if (this.event.session.attributes.trailDaysWithoutIncident === 4) {
    this.event.session.attributes.travelingSFX = wagonWheels4SFX;
  } else if (this.event.session.attributes.trailDaysWithoutIncident === 3) {
    this.event.session.attributes.travelingSFX = wagonWheels3SFX;
  } else if (this.event.session.attributes.trailDaysWithoutIncident === 2) {
    this.event.session.attributes.travelingSFX = wagonWheels2SFX;
  } else {
    this.event.session.attributes.travelingSFX = wagonWheels1SFX;
  }

  // DAILY CHANGES
  this.event.session.attributes.miles += 15;
  this.event.session.attributes.days ++;
  this.event.session.attributes.trailDays++;
  this.event.session.attributes.fate = Math.floor(Math.random() * (10 - 1 + 1)) + 1;

  if (this.event.session.attributes.food <= 0) {
    if (this.event.session.attributes.daysWithoutFood === 1) {
      this.event.session.attributes.daysWithoutFood++;
      this.handler.state = GAME_STATES.EVENT;
      this.emitWithState('FoodAlert');
    } else if (this.event.session.attributes.daysWithoutFood % 2 === 0 && this.event.session.attributes.fate % 2 === 0 && this.event.session.attributes.peopleHealthy.length > 0) {
      this.event.session.attributes.daysWithoutFood++;
      this.handler.state = GAME_STATES.EVENT;
      this.emitWithState('Starve');
    } else if (this.event.session.attributes.daysWithoutFood > 14 && this.event.session.attributes.daysWithoutFood % 2 === 1 && this.event.session.attributes.fate % 2 === 1 && this.event.session.attributes.peopleSick.length > 0) {
      this.event.session.attributes.daysWithoutFood++;
      this.handler.state = GAME_STATES.EVENT;
      this.emitWithState('StarveToDeath');
    } else {
      this.event.session.attributes.daysWithoutFood++;
    }
  } else {
    if (this.event.session.attributes.food >= (this.event.session.attributes.peopleHealthy.length + this.event.session.attributes.peopleSick.length)) {
      this.event.session.attributes.food -= (this.event.session.attributes.peopleHealthy.length + this.event.session.attributes.peopleSick.length); // each person eats 1 lb/day
    } else {
      this.event.session.attributes.food = 0;
    }
  }

  // TRAVELING
  if (this.event.session.attributes.mapLocation === "Green River" && this.event.session.attributes.hasChosenFirstDirection === false) {
    this.handler.state = GAME_STATES.FIRST_TRAIL_SPLIT;
    this.emitWithState('ChooseDirection');
  } else if (this.event.session.attributes.mapLocation === "Fort Boise" && this.event.session.attributes.hasChosenSecondDirection === false) {
    this.handler.state = GAME_STATES.SECOND_TRAIL_SPLIT;
    this.emitWithState('ChooseDirection');
  } else if (this.event.session.attributes.mapLocation === "Exit Fort Walla Walla" && this.event.session.attributes.hasChosenThirdDirection === false) {
    this.handler.state = GAME_STATES.THIRD_TRAIL_SPLIT;
    this.emitWithState('ChooseDirection');
  } else {
    travel.call(this);
  }
};


exports.handler = function(event, context, callback) {
  const alexa = Alexa.handler(event, context);
  alexa.appId = APP_ID;
  alexa.registerHandlers(newSessionHandlers, userSetupHandlers, professionSetupHandlers, suppliesSetupHandlers, monthSetupHandlers, eventHandlers, fortHandlers, firstTrailSplitHandlers, secondTrailSplitHandlers, thirdTrailSplitHandlers, shoppingHandlers, shoppingAmountHandlers, shoppingSuccessHandlers, tradingHandlers, changePurchaseHandlers, huntingHandlers, huntingNumberHandlers, sicknessHandlers, daysOfRestHandlers, crossRiverHandlers, columbiaRiverHandlers, gameOverHandlers);
  alexa.execute();
};
