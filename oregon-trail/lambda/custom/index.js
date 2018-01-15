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
  FIRST_TRAIL_SPLIT: '_FIRSTTRAILSPLITMODE', // handle's user direction choice
  SECOND_TRAIL_SPLIT: '_SECONDTRAILSPLITMODE', // handle's user direction choice
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
};

const GAME_NAME = "Oregon Trail";
const WELCOME_MESSAGE = "Welcome to the Oregon Trail Game!";
const START_GAME_MESSAGE = "It's 1836 in Independence, Missouri. You and your family have decided to become pioneers and travel the Oregon Trail.";
const EXIT_SKILL_MESSAGE = "Thanks for joining me on the Oregon Trail. Let's play again soon!";
const STOP_MESSAGE =  "Would you like to keep playing?";
const CANCEL_MESSAGE = "Ok, let's play again soon.";

// ==============
// STATE HANDLERS
// ==============
const newSessionHandlers = {
  'LaunchRequest': function() {
    // BEGIN TEST
    mainPlayer = "Kara";
    peopleHealthy = ["Kara", "Kevin", "Kilgore", "Delilah", "Bill"];
    profession = "banker";
    money = 310;
    food = 1000;
    oxen = 6;
    parts = 3;
    days = 153;
    miles = 0;
    mapLocation = "Independence";
    this.handler.state = GAME_STATES.EVENT;
    this.emitWithState('PlayGame');
    // END TEST

    // this.handler.state = GAME_STATES.USER_SETUP;
    // this.emitWithState('StartGame');
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
    resetVariables.call(this); // ensure all variables have default, empty values to start
    gameIntro.call(this);
  },
  'StartGameAgain': function() {
    resetVariables.call(this); // reset all variables
    gameIntroStartOver.call(this);
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
  'AMAZON.HelpIntent': function() {
    this.response.speak("Say a name, and that person will be added to your party.").listen("Please say a name.");
    this.emit(":responseReady");
  },
  'AMAZON.StartOverIntent': function() {
    this.handler.state = GAME_STATES.USER_SETUP;
    this.emitWithState('StartGameAgain');
  },
  'AMAZON.CancelIntent': function() {
    if (peopleHealthy.length === 0) {
      this.response.speak("If you want to leave the game, say stop. Otherwise, please tell me your name.").listen("What is your name?");
      this.emit(":responseReady");
    } else {
      peopleHealthy.pop();
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
        if (peopleHealthy.length === 0) {
          mainPlayer = this.event.request.intent.slots.month.value;
          peopleHealthy.push(mainPlayer);
          setupParty.call(this);
        } else if (peopleHealthy.length === 1) {
          var person2 = this.event.request.intent.slots.month.value;
          peopleHealthy.push(person2);
          setupParty.call(this);
        } else if (peopleHealthy.length === 2) {
          var person3 = this.event.request.intent.slots.month.value;
          peopleHealthy.push(person3);
          setupParty.call(this);
        } else if (peopleHealthy.length === 3) {
          var person4 = this.event.request.intent.slots.month.value;
          peopleHealthy.push(person4);
          setupParty.call(this);
        } else if (peopleHealthy.length === 4) {
          var person5 = this.event.request.intent.slots.month.value;
          peopleHealthy.push(person5);
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
    if (hasChosenProfession === false) {
      chooseProfession.call(this);
    } else {
      profession = this.event.request.intent.slots.profession.value;
      if (profession.toLowerCase() !== "banker" && profession.toLowerCase() !== "carpenter" && profession.toLowerCase() !== "farmer") {
        chooseProfessionAgain.call(this);
      } else {
        chooseProfession.call(this);
      }
    }
  },
  'AMAZON.HelpIntent': function() {
    this.response.speak("Being a banker makes the game easier because you have a lot of money. Being a farmer is the hardest. If you want to play on intermediate mode, be a carpenter. Do you want to be a banker, a carpenter, or a farmer?").listen("Do you want to be a banker, a carpenter, or a farmer?");
    this.emit(":responseReady");
  },
  'AMAZON.StartOverIntent': function() {
    this.handler.state = GAME_STATES.USER_SETUP;
    this.emitWithState('StartGameAgain');
  },
  'AMAZON.CancelIntent': function() {
    this.response.speak("If you want to quit the game, say stop. If you want to start over, say start over. Otherwise, please choose to be a banker, a carpenter, or a farmer.").listen("Please choose to be a banker, a carpenter, or a farmer.");
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
    if (hasBeenToGeneralStore === false) {
      generalStore.call(this);
    } else {
      currentlyBuyingHowMany = +this.event.request.intent.slots.number.value;
      if (currentlyBuyingWhat !== undefined && (currentlyBuyingHowMany * itemPrice > money)) {
        notEnoughMoney.call(this);
      } else {
        money -= (currentlyBuyingHowMany * itemPrice);
        if (currentlyBuyingWhat === "pounds of food") {
          food += currentlyBuyingHowMany;
          boughtFood = true;
          generalStore.call(this);
        } else if (currentlyBuyingWhat === "oxen") {
          if (oxen === 0 && currentlyBuyingHowMany > 0) {
            oxen += currentlyBuyingHowMany;
            boughtOxen = true;
            generalStore.call(this);
          } else {
            mustBuyOxen.call(this);
          }
        } else if (currentlyBuyingWhat === "spare parts") {
          parts += currentlyBuyingHowMany;
          boughtParts = true;
          generalStore.call(this);
        } else {
          generalStore.call(this);
        }
      }
    }
  },
  'AMAZON.HelpIntent': function() {
    if (currentlyBuyingWhat === "pounds of food") {
      this.response.speak("I recommend buying 1000 pounds of food. How many pounds of food do you want to buy?").listen("How many pounds of food do you want to buy?");
      this.emit(":responseReady");
    } else if (currentlyBuyingWhat === "oxen") {
      this.response.speak("I recommend buying 6 oxen. How many oxen do you want to buy?").listen("How many oxen do you want to buy?");
      this.emit(":responseReady");
    } else if (currentlyBuyingWhat === "spare parts") {
      this.response.speak("I recommend buying 3 spare parts. How many spare parts do you want to buy?").listen("How many spare parts do you want to buy?");
      this.emit(":responseReady");
    } else {
      this.response.speak("Say a number, and that's the amount you will buy.").listen("Please say a number.");
      this.emit(":responseReady");
    }
  },
  'AMAZON.StartOverIntent': function() {
    this.handler.state = GAME_STATES.USER_SETUP;
    this.emitWithState('StartGameAgain');
  },
  'AMAZON.CancelIntent': function() {
    if (currentlyBuyingWhat === "pounds of food") {
      this.response.speak("If you want to quit the game, say stop. If you want to start over, say start over. Otherwise, please tell me how many pounds of food you want to buy.").listen("How many pounds of food do you want to buy?");
      this.emit(":responseReady");
    } else if (currentlyBuyingWhat === "oxen") {
      this.response.speak("If you want to quit the game, say stop. If you want to start over, say start over. Otherwise, please tell me how many oxen you want to buy.").listen("How many oxen do you want to buy?");
      this.emit(":responseReady");
    } else if (currentlyBuyingWhat === "spare parts") {
      this.response.speak("If you want to quit the game, say stop. If you want to start over, say start over. Otherwise, please tell me how many spare parts you want to buy.").listen("How many spare parts do you want to buy?");
      this.emit(":responseReady");
    } else {
      this.response.speak("If you want to quit the game, say stop. If you want to start over, say start over.").listen("If you want to start over from the beginning, say start over.");
      this.emit(":responseReady");
    }
  },
  'AMAZON.StopIntent': function() {
    this.response.speak(EXIT_SKILL_MESSAGE);
    this.emit(":responseReady");
  },
  'Unhandled': function() {
    if (this.event.request.intent.name !== "GetNumber") {
      this.response.speak("I'm sorry, I didn't understand how many " + currentlyBuyingWhat + " you want to buy. Please say a number.").listen("Please say a number.");
      this.emit(":responseReady");
    } else {
      this.handler.state = GAME_STATES.SUPPLIES_SETUP;
      this.emitWithState('AMAZON.HelpIntent');
    }
  },
});

// HANDLE STARTING MONTH
const monthSetupHandlers = Alexa.CreateStateHandler(GAME_STATES.MONTH_SETUP, {
  'GetStartingMonth': function() {
    if (hasChosenMonth === false) {
      chooseMonth.call(this);
    } else {
      month = this.event.request.intent.slots.month.value;
      if (month.toLowerCase() !== "march" && month.toLowerCase() !== "april" && month.toLowerCase() !== "may" && month.toLowerCase() !== "june" && month.toLowerCase() !== "july" && month.toLowerCase() !== "august") {
        chooseMonthAgain.call(this);
      } else {
        setDays.call(this);
      }
    }
  },
  'AMAZON.HelpIntent': function() {
    this.response.speak("If you start too early, there won't be enough grass for the oxen. However, if you start too late, you risk getting caught in snow storms. I recommend leaving in May or June. When do you want to leave?").listen("When do you want to leave?");
    this.emit(":responseReady");
  },
  'AMAZON.StartOverIntent': function() {
    this.handler.state = GAME_STATES.USER_SETUP;
    this.emitWithState('StartGameAgain');
  },
  'AMAZON.CancelIntent': function() {
    this.response.speak("If you want to quit the game, say stop. If you want to start over, say start over. Otherwise, please choose a month between March and August.").listen("Please choose a month between March and August.");
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
  'Hunting': function() {
    var randomNumber = Math.floor(Math.random() * (10 - 1 + 1)) + 1;
    if (guess === randomNumber - 3 || guess === randomNumber + 3) {
      food += 2;
      this.response.speak(gunShotSFX + "You guessed " + guess + ". The secret number was " + randomNumber + ". Congratulations! You shot a squirrel and brought back 2 pounds of food. Say OK to continue on the trail.").listen("Say OK to continue on the trail.");
      this.emit(':responseReady');
    } else if (guess === randomNumber - 2 || guess === randomNumber + 2) {
      food += 5;
      this.response.speak(gunShotSFX + "You guessed " + guess + ". The secret number was " + randomNumber + ". Congratulations! You shot a rabbit and brought back 5 pounds of food. Say OK to continue on the trail.").listen("Say OK to continue on the trail.");
      this.emit(':responseReady');
    } else if (guess === randomNumber - 1 || guess === randomNumber + 1) {
      food += 50;
      this.response.speak(gunShotSFX + "You guessed " + guess + ". The secret number was " + randomNumber + ". Congratulations! You shot a deer and brought back 50 pounds of food. Say OK to continue on the trail.").listen("Say OK to continue on the trail.");
      this.emit(':responseReady');
    } else if (guess === randomNumber) {
      food += 100;
      if (mapLocation === "Independence" || mapLocation === "Kansas River" || mapLocation === "Fort Kearney" || mapLocation === "Chimney Rock" || mapLocation === "Fort Laramie") {
        this.response.speak(gunShotSFX + "You guessed " + guess + ". The secret number was " + randomNumber + ". Congratulations! You shot a buffalo and brought back 100 pounds of food. Say OK to continue on the trail.").listen("Say OK to continue on the trail.");
        this.emit(':responseReady');
      } else {
        this.response.speak(gunShotSFX + "You guessed " + guess + ". The secret number was " + randomNumber + ". Congratulations! You shot a bear and brought back 100 pounds of food. Say OK to continue on the trail.").listen("Say OK to continue on the trail.");
        this.emit(':responseReady');
      }
    } else {
      this.response.speak(gunShotSFX + "You guessed " + guess + ". The secret number was " + randomNumber + " Sorry, you missed your target. Say OK to continue on the trail.").listen("Say OK to continue on the trail.");
      this.emit(':responseReady');
    }
  },
  'Recovery': function() {
    this.response.speak(goodNewsSFX + recoveredMessage + " Say OK to continue on the trail.").listen("Say OK to continue on the trail.");
    this.emit(":responseReady");
  },
  'RestRecovery': function() {
    if (howManyToHeal === 0 && daysOfRest > 1) {
      if (peopleHealthy.length === 0) {
        this.response.speak("You rested for " + daysOfRest + " days, but you still aren't feeling any better. Say OK to continue on the trail.").listen("Say OK to continue on the trail.");
        this.emit(":responseReady");
      } else {
        this.response.speak("You rested for " + daysOfRest + " days, but " + invalid + " still is not feeling any better. Say OK to continue on the trail.").listen("Say OK to continue on the trail.");
        this.emit(":responseReady");
      }
    } else if (howManyToHeal === 0) {
      if (peopleHealthy.length === 0) {
        this.response.speak("You rested for one day, but you still aren't feeling any better. Say OK to continue on the trail.").listen("Say OK to continue on the trail.");
        this.emit(":responseReady");
      } else {
        this.response.speak("You rested for one day, but " + invalid + " still is not feeling any better. Say OK to continue on the trail.").listen("Say OK to continue on the trail.");
        this.emit(":responseReady");
      }
    } else {
      this.response.speak("You rested for " + daysOfRest + " days. " + goodNewsSFX + recoveredMessage + " Say OK to continue on the trail.").listen("Say OK to continue on the trail.");
      this.emit(":responseReady");
    }
  },
  'Starve': function() {
    if (daysWithoutFood === 1) {
      this.response.speak(badNewsSFX + "You have run out of food. Say OK to continue on the trail.").listen("Say OK to continue on the trail.");
      this.emit(":responseReady");
    } else if (daysWithoutFood % 2 === 0 && peopleHealthy.length > 0) {
      if (peopleHealthy.length === 1) {
        if (fate % 2 === 0) {
          sickness.call(this);
          this.response.speak(hungrySFX + "You are starving and are very weak. Say OK to continue on the trail.").listen("Say OK to continue on the trail.");
          this.emit(":responseReady");
        }
      } else {
        if (fate % 2 === 0) {
          sickness.call(this);
          this.response.speak(hungrySFX + invalid + " is starving and is very weak. Say OK to continue on the trail.").listen("Say OK to continue on the trail.");
          this.emit(":responseReady");
        }
      }
    } else if (daysWithoutFood % 3 === 0 && fate % 2 === 0) {
      if (peopleHealthy.length + peopleSick.length === 1) {
        gameOverMessage = "you starved";
        gameOver.call(this);
      } else if (peopleSick.length > 0){
        deathPeopleSick.call(this);
        this.response.speak(badNewsSFX + victim + " has died of starvation. Rest in peace " + victim + ". Say OK to continue on the trail.").listen("Say OK to continue on the trail.");
        this.emit(":responseReady");
      } else if (peopleHealthy.length > 0) {
        deathPeopleHealthy.call(this);
        this.response.speak(badNewsSFX + victim + " has died of starvation. Rest in peace " + victim + ". Say OK to continue on the trail.").listen("Say OK to continue on the trail.");
        this.emit(":responseReady");
      }
    } else {
      this.handler.state = GAME_STATES.EVENT;
      this.emitWithState('PlayGame');
    }
  },
  'Death': function() {
    var diseases = ["a fever", "dysentery", "an infection", "dehydration"];
    var fatality = diseases[Math.floor(Math.random() * diseases.length)];
    if (peopleHealthy.length + peopleSick.length === 1 && peopleSick.indexOf(mainPlayer) === 0) {
      gameOverMessage = "you died";
      gameOver.call(this);
    } else if (peopleSick.length > 0) {
      deathPeopleSick.call(this);
      this.response.speak(badNewsSFX + victim + " has died of " + fatality + ". Rest in peace " + victim + ". Now, it's time to move on. Say OK to continue on the trail.").listen("Say OK to continue on the trail.");
      this.emit(":responseReady");
    } else {
      this.handler.state = GAME_STATES.EVENT;
      this.emitWithState('PlayGame');
    }
  },
  'Snow': function() {
    days += lostDays;
    trailDays += lostDays;
    food -= lostDays*(peopleHealthy.length + peopleSick.length);
    if (lostDays === 1) {
      this.response.speak(badNewsSFX + "You got stuck in some snow. You have lost 1 day. Say OK to continue on the trail.").listen("Say OK to continue on the trail.");
      this.emit(":responseReady");
    } else if (lostDays >= 5 && peopleSick.length + peopleHealthy.length > 1) {
      if (peopleSick.length > 0) {
        deathPeopleSick.call(this);
        this.response.speak(badNewsSFX + "You got stuck in a large snow storm. You lost " + lostDays + " days, and " + victim + " froze to death. Rest in peace " + victim + ". Say OK to continue on the trail.").listen("Say OK to continue on the trail.");
        this.emit(":responseReady");
      } else {
        deathPeopleHealthy.call(this);
        this.response.speak(badNewsSFX + "You got stuck in a large snow storm. You lost " + lostDays + " days, and " + victim + " froze to death. Rest in peace " + victim + ". Say OK to continue on the trail.").listen("Say OK to continue on the trail.");
        this.emit(":responseReady");
      }
    } else if (lostDays >= 5 && peopleSick.length + peopleHealthy.length === 1) {
      gameOverMessage = "froze to death";
      gameOver.call(this);
    } else {
      this.response.speak(badNewsSFX + "You got stuck in some snow. You have lost " + lostDays + " days. Say OK to continue on the trail.").listen("Say OK to continue on the trail.");
      this.emit(":responseReady");
    }
  },
  'Storm': function() {
    days += lostDays;
    trailDays += lostDays;
    food -= lostDays*(peopleHealthy.length + peopleSick.length);
    if (lostDays >= 3) {
      oxen -= 1;
      if (oxen === 0) {
        gameOverMessage = "no more oxen -- thunderstorm";
        gameOver.call(this);
      } else {
        this.response.speak(stormSFX + "You got caught in a thunderstorm and an ox ran away. You lost " + lostDays + " days. Say OK to continue on the trail.").listen("Say OK to continue on the trail.");
        this.emit(":responseReady");
      }
    } else if (lostDays === 1) {
      this.response.speak(stormSFX + "You got caught in a thunderstorm. You lost 1 day. Say OK to continue on the trail.").listen("Say OK to continue on the trail.");
      this.emit(":responseReady");
    } else {
      this.response.speak(stormSFX + "You got caught in a thunderstorm. You lost " + lostDays + " days. Say OK to continue on the trail.").listen("Say OK to continue on the trail.");
      this.emit(":responseReady");
    }
  },
  'NoGrass': function() {
    daysWithoutGrass++;
    if (daysWithoutGrass % 3 === 0) {
      this.handler.state = GAME_STATES.EVENT;
      this.emitWithState('OxProblem');
    } else {
      this.response.speak("This is a dry month. There's no grass for the oxen. Say OK to continue on the trail.").listen("Say OK to continue on the trail.");
      this.emit(":responseReady");
    }
  },
  'BuffaloStampede': function() {
    var stampedeChance = Math.floor(Math.random() * (10 - 1 + 1)) + 1;
    if (stampedeChance === 9 && peopleSick.length + peopleHealthy.length > 1) {
      if (peopleHealthy.length > 1) {
        deathPeopleHealthy.call(this);
        this.response.speak(stampedeSFX + "Oh no! Buffalo stampede! " + victim + " got trampled. Rest in peace " + victim + ". Say OK to continue on the trail.").listen("Say OK to continue on the trail.");
        this.emit(":responseReady");
      } else if (peopleSick.length > 0) {
        deathPeopleSick.call(this);
        this.response.speak(stampedeSFX + "Oh no! Buffalo stampede! " + victim + " got trampled. Rest in peace " + victim + ". Say OK to continue on the trail.").listen("Say OK to continue on the trail.");
        this.emit(":responseReady");
      }
    } else {
      this.handler.state = GAME_STATES.EVENT;
      this.emitWithState('PlayGame');
    }
  },
  'OxProblem': function() {
    var allOxProblems = ["An ox has wandered off.", "An ox has died."];
    var randomOxProblem = allOxProblems[Math.floor(Math.random() * allOxProblems.length)];
    if (oxen > 1) {
      oxen -= 1;
      this.response.speak(badNewsSFX + randomOxProblem + " Say OK to continue on the trail.").listen("Say OK to continue on the trail.");
      this.emit(":responseReady");
    } else if (oxen === 1) {
      gameOverMessage = "no more oxen -- ox probs";
      gameOver.call(this);
    }
  },
  'Fire': function() {
    var destroyedItems = [["food", 20],["oxen", 1],["money", 25],["parts", 1],["money", 10]];
    var itemIndex = Math.floor(Math.random() * destroyedItems.length);
    if (destroyedItems[itemIndex][0] == "food") {
      if (food > destroyedItems[itemIndex][1]) {
        food -= destroyedItems[itemIndex][1];
        this.response.speak(badNewsSFX + "A fire broke out in your wagon and destroyed " + destroyedItems[itemIndex][1] + " pounds of food. Say OK to continue on the trail.").listen("Say OK to continue on the trail.");
        this.emit(":responseReady");
      } else if (food > 0) {
        food = 0;
        this.response.speak(badNewsSFX + "A fire broke out in your wagon and destroyed the rest of your food. Say OK to continue on the trail.").listen("Say OK to continue on the trail.");
        this.emit(":responseReady");
      } else {
        this.handler.state = GAME_STATES.EVENT;
        this.emitWithState('PlayGame');
      }
    } else if (destroyedItems[itemIndex][0] == "oxen") {
      if (oxen > destroyedItems[itemIndex][1]) {
        oxen -= destroyedItems[itemIndex][1];
        if (destroyedItems[itemIndex][1] === 1) {
          this.response.speak(badNewsSFX + "A fire broke out in your wagon and killed an ox. Say OK to continue on the trail.").listen("Say OK to continue on the trail.");
          this.emit(":responseReady");
        } else {
          this.response.speak(badNewsSFX + "A fire broke out in your wagon and killed " + destroyedItems[itemIndex][1] + " oxen. Say OK to continue on the trail.").listen("Say OK to continue on the trail.");
          this.emit(":responseReady");
        }
      } else if (oxen > 0) {
        gameOverMessage = "no more oxen -- fire";
        gameOver.call(this);
      } else {
        this.handler.state = GAME_STATES.EVENT;
        this.emitWithState('PlayGame');
      }
    } else if (destroyedItems[itemIndex][0] == "parts") {
      if (parts > destroyedItems[itemIndex][1]) {
        parts -= destroyedItems[itemIndex][1];
        if (destroyedItems[itemIndex][1] === 1) {
          this.response.speak(badNewsSFX + "A fire broke out in your wagon and destroyed a spare part. Say OK to continue on the trail.").listen("Say OK to continue on the trail.");
          this.emit(":responseReady");
        } else {
          this.response.speak(badNewsSFX + "A fire broke out in your wagon and destroyed " + destroyedItems[itemIndex][1] + " spare parts. Say OK to continue on the trail.").listen("Say OK to continue on the trail.");
          this.emit(":responseReady");
        }
      } else if (parts > 0) {
        parts = 0;
        this.response.speak(badNewsSFX + "A fire broke out in your wagon and destroyed your remaining spare parts. Say OK to continue on the trail.").listen("Say OK to continue on the trail.");
        this.emit(":responseReady");
      } else {
        this.handler.state = GAME_STATES.EVENT;
        this.emitWithState('PlayGame');
      }
    } else if (destroyedItems[itemIndex][0] == "money") {
      if (money > destroyedItems[itemIndex][1]) {
        money -= destroyedItems[itemIndex][1];
        this.response.speak(badNewsSFX + "A fire broke out in your wagon and destroyed $" + destroyedItems[itemIndex][1] + ". Say OK to continue on the trail.").listen("Say OK to continue on the trail.");
        this.emit(":responseReady");
      } else if (money > 0) {
        money = 0;
        this.response.speak(badNewsSFX + "A fire broke out in your wagon and destroyed the rest of your money. Say OK to continue on the trail.").listen("Say OK to continue on the trail.");
        this.emit(":responseReady");
      } else {
        this.handler.state = GAME_STATES.EVENT;
        this.emitWithState('PlayGame');
      }
    } else {
      this.handler.state = GAME_STATES.EVENT;
      this.emitWithState('PlayGame');
    }
  },
  'Thief': function() {
    var stolenItems = [["food", 20],["oxen", 1],["money", 25],["parts", 1],["money", 10]];
    var itemIndex = Math.floor(Math.random() * stolenItems.length);
    if (stolenItems[itemIndex][0] == "food") {
      if (food > stolenItems[itemIndex][1]) {
        food -= stolenItems[itemIndex][1];
        this.response.speak(badNewsSFX + "A thief broke into your wagon and stole " + stolenItems[itemIndex][1] + " pounds of food. Say OK to continue on the trail.").listen("Say OK to continue on the trail.");
        this.emit(":responseReady");
      } else if (food > 0) {
        food = 0;
        this.response.speak(badNewsSFX + "A thief broke into your wagon and stole the rest of your food. Say OK to continue on the trail.").listen("Say OK to continue on the trail.");
        this.emit(":responseReady");
      } else {
        this.handler.state = GAME_STATES.EVENT;
        this.emitWithState('PlayGame');
      }
    } else if (stolenItems[itemIndex][0] == "oxen") {
      if (oxen > stolenItems[itemIndex][1]) {
        oxen -= stolenItems[itemIndex][1];
        if (stolenItems[itemIndex][1] === 1) {
          this.response.speak(badNewsSFX + "A thief stole an ox when you weren't looking. Say OK to continue on the trail.").listen("Say OK to continue on the trail.");
          this.emit(":responseReady");
        } else {
          this.response.speak(badNewsSFX + "A thief stole " + stolenItems[itemIndex][1] + " oxen when you weren't looking. Say OK to continue on the trail.").listen("Say OK to continue on the trail.");
          this.emit(":responseReady");
        }
      } else if (oxen > 0) {
        gameOverMessage = "no more oxen -- fire";
        gameOver.call(this);
      } else {
        this.handler.state = GAME_STATES.EVENT;
        this.emitWithState('PlayGame');
      }
    } else if (stolenItems[itemIndex][0] == "parts") {
      if (parts > stolenItems[itemIndex][1]) {
        parts -= stolenItems[itemIndex][1];
        if (stolenItems[itemIndex][1] === 1) {
          this.response.speak(badNewsSFX + "A thief broke into your wagon and stole a spare part. Say OK to continue on the trail.").listen("Say OK to continue on the trail.");
          this.emit(":responseReady");
        } else {
          this.response.speak(badNewsSFX + "A thief broke into your wagon and stole " + stolenItems[itemIndex][1] + " spare parts. Say OK to continue on the trail.").listen("Say OK to continue on the trail.");
          this.emit(":responseReady");
        }
      } else if (parts > 0) {
        parts = 0;
        this.response.speak(badNewsSFX + "A thief broke into your wagon and stole your remaining spare parts. Say OK to continue on the trail.").listen("Say OK to continue on the trail.");
        this.emit(":responseReady");
      } else {
        this.handler.state = GAME_STATES.EVENT;
        this.emitWithState('PlayGame');
      }
    } else if (stolenItems[itemIndex][0] == "money") {
      if (money > stolenItems[itemIndex][1]) {
        money -= stolenItems[itemIndex][1];
        this.response.speak(badNewsSFX + "A thief broke into your wagon and stole $" + stolenItems[itemIndex][1] + ". Say OK to continue on the trail.").listen("Say OK to continue on the trail.");
        this.emit(":responseReady");
      } else if (money > 0) {
        money = 0;
        this.response.speak(badNewsSFX + "A thief broke into your wagon and stole the rest of your money. Say OK to continue on the trail.").listen("Say OK to continue on the trail.");
        this.emit(":responseReady");
      } else {
        this.handler.state = GAME_STATES.EVENT;
        this.emitWithState('PlayGame');
      }
    } else {
      this.handler.state = GAME_STATES.EVENT;
      this.emitWithState('PlayGame');
    }
  },
  'FindItems': function() {
    var foundItems = [["food", 50],["oxen", 2],["money", 50],["parts", 1],["money", 100]];
    var itemIndex = Math.floor(Math.random() * foundItems.length);
    if (foundItems[itemIndex][0] == "food") {
      food += foundItems[itemIndex][1];
      this.response.speak(goodNewsSFX + "You found an abandoned wagon on the trail. After looking around, you found " + foundItems[itemIndex][1] + " pounds of food. Say OK to continue on the trail.").listen("Say OK to continue on the trail.");
      this.emit(":responseReady");
    } else if (foundItems[itemIndex][0] == "oxen") {
      oxen += foundItems[itemIndex][1];
      if (foundItems[itemIndex][1] === 1) {
        this.response.speak(goodNewsSFX + "You found an abandoned wagon on the trail. After looking around, you found an ox. Say OK to continue on the trail.").listen("Say OK to continue on the trail.");
        this.emit(":responseReady");
      } else {
        this.response.speak(goodNewsSFX + "You found an abandoned wagon on the trail. After looking around, you found " + foundItems[itemIndex][1] + " oxen. Say OK to continue on the trail.").listen("Say OK to continue on the trail.");
        this.emit(":responseReady");
      }
    } else if (foundItems[itemIndex][0] == "parts") {
      parts += foundItems[itemIndex][1];
      if (foundItems[itemIndex][1] === 1) {
        this.response.speak(goodNewsSFX + "You found an abandoned wagon on the trail. After looking around, you found a spare part. Say OK to continue on the trail.").listen("Say OK to continue on the trail.");
        this.emit(":responseReady");
      } else {
        this.response.speak(goodNewsSFX + "You found an abandoned wagon on the trail. After looking around, you found " + foundItems[itemIndex][1] + " spare parts. Say OK to continue on the trail.").listen("Say OK to continue on the trail.");
        this.emit(":responseReady");
      }
    } else if (foundItems[itemIndex][0] == "money") {
      money += foundItems[itemIndex][1];
      this.response.speak(goodNewsSFX + "You found an abandoned wagon on the trail. After looking around, you found $" + foundItems[itemIndex][1] + ". Say OK to continue on the trail.").listen("Say OK to continue on the trail.");
      this.emit(":responseReady");
    } else {
      this.handler.state = GAME_STATES.EVENT;
      this.emitWithState('PlayGame');
    }
    window[foundItems[itemIndex][0]] += foundItems[itemIndex][1];
    this.response.speak(goodNewsSFX + "You found an abandoned wagon on the trail. After looking around, you found " + foundItems[itemIndex][1] + " " + foundItems[itemIndex][2] + ". Say OK to continue on the trail.").listen("Say OK to continue on the trail.");
    this.emit(":responseReady");
  },
  'FindBerries': function() {
    daysWithoutFood = 0;
    food += 3*(Math.floor(Math.random() * (10 - 1 + 1)) + 1);
    this.response.speak(goodNewsSFX + "You found wild berries. Say OK to continue on the trail.").listen("Say OK to continue on the trail.");
    this.emit(":responseReady");
  },
  'BrokenWagon': function() {
    if (parts > 0) {
      parts -= 1;
      days++;
      trailDays++;
      food -= (peopleHealthy.length + peopleSick.length);
      this.response.speak(badNewsSFX + "Your wagon broke, but you repaired it. You now have " + parts + " spare parts. Say OK to continue on the trail.").listen("Say OK to continue on the trail.");
      this.emit(":responseReady");
    } else {
      gameOverMessage = "broken wagon";
      gameOver.call(this);
    }
  },
  'GetLost': function() {
    var howLong = Math.floor(Math.random() * (5 - 1 + 1)) + 1;
    days += howLong;
    trailDays += howLong;
    food -= howLong*(peopleHealthy.length + peopleSick.length);
    if (howLong === 1) {
      this.response.speak(badNewsSFX + "You lost the trail. You wasted 1 day. Say OK to continue on the trail.").listen("Say OK to continue on the trail.");
      this.emit(":responseReady");
    } else {
      this.response.speak(badNewsSFX + "You lost the trail. You wasted " + howLong + " days. Say OK to continue on the trail.").listen("Say OK to continue on the trail.");
      this.emit(":responseReady");
    }
  },
  'RiverSuccess': function() {
    this.response.speak(riverSFX + goodNewsSFX + "Congratulations! You safely crossed the river. Say OK to continue on the trail.").listen("Say OK to continue on the trail.");
    this.emit(":responseReady");
  },
  'RiverAccident': function() {
    this.response.speak(riverSFX + "You made it across, but water seeped in. You lost " + fate * 3 + " pounds of food. Say OK to continue on the trail.").listen("Say OK to continue on the trail.");
    this.emit(":responseReady");
  },
  'RiverDeath': function() {
    this.response.speak(riverSFX + badNewsSFX + "Your wagon was overtaken by water, and " + victim + " drowned. You also lost " + fate * 10 + " pounds of food. Rest in peace " + victim + ". Say OK to continue on the trail.").listen("Say OK to continue on the trail.");
    this.emit(":responseReady");
  },
  'NoFerryMoneyRiverSuccess': function() {
    this.response.speak(riverSFX + goodNewsSFX + "Sorry, you don't have enough money to pay the ferry. You wall have to try floating across the river. <break time='2s'/> Congratulations! You safely crossed the river. Say OK to continue on the trail.").listen("Say OK to continue on the trail.");
    this.emit(":responseReady");
  },
  'NoFerryMoneyRiverAccident': function() {
    this.response.speak(riverSFX + "Sorry, you don't have enough money to pay the ferry. You wall have to try floating across the river. <break time='2s'/> You made it across, but water seeped in. You lost " + fate * 3 + " pounds of food. Say OK to continue on the trail.").listen("Say OK to continue on the trail.");
    this.emit(":responseReady");
  },
  'NoFerryMoneyRiverDeath': function() {
    this.response.speak(riverSFX + badNewsSFX + "Sorry, you don't have enough money to pay the ferry. You wall have to try floating across the river. <break time='2s'/> Your wagon was overtaken by water, and " + victim + " drowned. You also lost " + fate * 10 + " pounds of food. Rest in peace " + victim + ". Say OK to continue on the trail.").listen("Say OK to continue on the trail.");
    this.emit(":responseReady");
  },
  'ChimneyRock': function() {
    this.response.speak(goodNewsSFX + "You have arrived at Chimney Rock. Congratulations! Located in western Nebraska, Chimney Rock is a prominent geological formation that rises nearly 300 feet above the surrounding plains. For this reason, it is a well-known landmark along the trail, which means you're going the right way. Say OK to continue on the trail.").listen("Say OK to continue on the trail.");
    this.emit(":responseReady");
  },
  'IndependenceRock': function() {
    this.response.speak(goodNewsSFX + "You have arrived at Independence Rock. Congratulations! Located in central Wyoming, Independence Rock is a large granite hill where many pioneers carve their names. It is a well-known landmark along the trail. Say OK to continue on the trail.").listen("Say OK to continue on the trail.");
    this.emit(":responseReady");
  },
  'SouthPass': function() {
    this.response.speak(goodNewsSFX + "You have arrived at South Pass. Congratulations! Located in southwestern Wyoming, South Pass is the lowest point along the continental divide. It's the easiest way to cross the Rocky Mountains. Say OK to continue on the trail.").listen("Say OK to continue on the trail.");
    this.emit(":responseReady");
  },
  'SodaSprings': function() {
    this.response.speak(goodNewsSFX + "You have arrived at Soda Springs. Congratulations! Located in southeastern Idaho, these springs bubble like soda water, which is how they got their name. It's a popular place to bathe and relax, but don't drink the water! You might get sick. Say OK to continue on the trail.").listen("Say OK to continue on the trail.");
    this.emit(":responseReady");
  },
  'TheDalles': function() {
    this.response.speak(goodNewsSFX + "You have arrived at The Dalles. Congratulations! Located in northern Oregon, the Dalles is where the trail stops. You are blocked by the cascade mountains, and the only way to finish your journey is by floating down the Colombia River gorge. Say OK to continue on the trail.").listen("Say OK to continue on the trail.");
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
  'ContinueGame': function() {
    travelingSFX = wagonWheelsSFX;
    this.handler.state = GAME_STATES.EVENT;
    this.emitWithState('PlayGame');
  },
  'AMAZON.HelpIntent': function() {
    this.response.speak("If you want to start the game from the beginning, say start over. If you want to quit, say stop. Otherwise, say OK to continue on the trail.").listen("Say OK to continue on the trail.");
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
    if (oxen === 1 && parts === 1) {
      this.response.speak(fortSFX + "Welcome to " + mapLocation + "! You currently have " + food + " pounds of food, " + oxen + " ox, " + parts + " spare part, and $" + money + ". Do you want to buy or trade anything while you're here?").listen("Do you want to buy or trade anything while you're here?");
      this.emit(":responseReady");
    } else if (oxen === 1 && parts > 1) {
      this.response.speak(fortSFX + "Welcome to " + mapLocation + "! You currently have " + food + " pounds of food, " + oxen + " ox, " + parts + " spare parts, and $" + money + ". Do you want to buy or trade anything while you're here?").listen("Do you want to buy or trade anything while you're here?");
      this.emit(":responseReady");
    } else if (oxen > 1 && parts === 1) {
      this.response.speak(fortSFX + "Welcome to " + mapLocation + "! You currently have " + food + " pounds of food, " + oxen + " oxen, " + parts + " spare part, and $" + money + ". Do you want to buy or trade anything while you're here?").listen("Do you want to buy or trade anything while you're here?");
      this.emit(":responseReady");
    } else {
      this.response.speak(fortSFX + "Welcome to " + mapLocation + "! You currently have " + food + " pounds of food, " + oxen + " oxen, " + parts + " spare parts, and $" + money + ". Do you want to buy or trade anything while you're here?").listen("Do you want to buy or trade anything while you're here?");
      this.emit(":responseReady");
    }
  },
  'Status': function() {
    if (oxen === 1 && parts === 1) {
      this.response.speak("You have " + food + " pounds of food, " + oxen + " ox, " + parts + " spare part, and $" + money + ". Do you want to buy or trade anything else?").listen("Do you want to buy or trade anything else?");
      this.emit(":responseReady");
    } else if (oxen === 1 && parts > 1) {
      this.response.speak("You have " + food + " pounds of food, " + oxen + " ox, " + parts + " spare parts, and $" + money + ". Do you want to buy or trade anything else?").listen("Do you want to buy or trade anything else?");
      this.emit(":responseReady");
    } else if (oxen > 1 && parts === 1) {
      this.response.speak("You have " + food + " pounds of food, " + oxen + " oxen, " + parts + " spare part, and $" + money + ". Do you want to buy or trade anything else?").listen("Do you want to buy or trade anything else?");
      this.emit(":responseReady");
    } else {
      this.response.speak("You have " + food + " pounds of food, " + oxen + " oxen, " + parts + " spare parts, and $" + money + ". Do you want to buy or trade anything else?").listen("Do you want to buy or trade anything else?");
      this.emit(":responseReady");
    }
  },
  'TradeSuccess': function() {
    if (oxen === 1 && parts === 1) {
      tradeDeal = 0;
      this.response.speak(goodNewsSFX + "It's a deal! You now have " + food + " pounds of food, " + oxen + " ox, " + parts + " spare part, and $" + money + ". Do you want to buy or trade anything else?").listen("Do you want to buy or trade anything else?");
      this.emit(":responseReady");
    } else if (oxen === 1 && parts > 1) {
      this.response.speak(goodNewsSFX + "It's a deal! You now have " + food + " pounds of food, " + oxen + " ox, " + parts + " spare parts, and $" + money + ". Do you want to buy or trade anything else?").listen("Do you want to buy or trade anything else?");
      this.emit(":responseReady");
    } else if (oxen > 1 && parts === 1) {
      this.response.speak(goodNewsSFX + "It's a deal! You now have " + food + " pounds of food, " + oxen + " oxen, " + parts + " spare part, and $" + money + ". Do you want to buy or trade anything else?").listen("Do you want to buy or trade anything else?");
      this.emit(":responseReady");
    } else {
      this.response.speak(goodNewsSFX + "It's a deal! You now have " + food + " pounds of food, " + oxen + " oxen, " + parts + " spare parts, and $" + money + ". Do you want to buy or trade anything else?").listen("Do you want to buy or trade anything else?");
      this.emit(":responseReady");
    }
  },
  'TradeFailure': function() {
    if (tradeDeal === 1 || tradeDeal === 10) {
      tradeDeal = 0;
      this.response.speak(badNewsSFX + "Sorry, you don't have enough food to make the trade. Do you want to buy or trade anything else?").listen("Do you want to buy or trade anything else?");
      this.emit(":responseReady");
    } else if (tradeDeal === 2 || tradeDeal === 8) {
      tradeDeal = 0;
      this.response.speak(badNewsSFX + "Sorry, you only have one ox. You must keep him to continue on the trail. Do you want to buy or trade anything else?").listen("Do you want to buy or trade anything else?");
      this.emit(":responseReady");
    } else if (tradeDeal === 3 || tradeDeal === 5 || tradeDeal === 9) {
      tradeDeal = 0;
      this.response.speak(badNewsSFX + "Sorry, you don't have any spare parts to make the trade. Do you want to buy or trade anything else?").listen("Do you want to buy or trade anything else?");
      this.emit(":responseReady");
    } else if (tradeDeal === 4 || tradeDeal === 7) {
      tradeDeal = 0;
      this.response.speak(badNewsSFX + "Sorry, you don't have enough money to make the trade. Do you want to buy or trade anything else?").listen("Do you want to buy or trade anything else?");
      this.emit(":responseReady");
    } else if (tradeDeal === 6) {
      tradeDeal = 0;
      this.response.speak(badNewsSFX + "Sorry, you only have two oxen. If you trade them both away, you won't be able to continue on the trail. Do you want to buy or trade anything else?").listen("Do you want to buy or trade anything else?");
      this.emit(":responseReady");
    } else {
      tradeDeal = 0;
      this.response.speak(badNewsSFX + "Sorry, it's not a deal. Do you want to buy or trade anything else?").listen("Do you want to buy or trade anything else?");
      this.emit(":responseReady");
    }
  },
  'NotEnoughMoney': function() {
    purchaseChoice = "trade";
    this.response.speak(badNewsSFX + "Sorry, you don't have enough money. You only have $" + money + ". Do you want to try again?").listen("Do you want to try again?");
    this.emit(":responseReady");
  },
  'GetBuyOrTradeItem': function() {
    if (this.event.request.intent.slots.buy_or_trade.value === "buy") {
      this.handler.state = GAME_STATES.SHOPPING;
      this.emitWithState('WelcomeToStore');
    } else if (this.event.request.intent.slots.buy_or_trade.value === "trade") {
      this.handler.state = GAME_STATES.TRADING;
      this.emitWithState('Offer');
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
    if (purchaseChoice === "trade") {
      this.handler.state = GAME_STATES.CHANGE_PURCHASE;
      this.emitWithState('TradeInstead');
    } else {
      this.handler.state = GAME_STATES.EVENT;
      this.emitWithState('PlayGame');
    }
  },
  'AMAZON.HelpIntent': function() {
    this.response.speak("If you want to buy something from the fort's general store, say buy. If you want to try trading, say trade. If you don't want to buy or trade, you can say cancel.").listen("Please say buy or trade, or say cancel to continue on the trail.");
    this.emit(":responseReady");
  },
  'AMAZON.StartOverIntent': function() {
    this.handler.state = GAME_STATES.USER_SETUP;
    this.emitWithState('StartGameAgain');
  },
  'AMAZON.CancelIntent': function() {
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
    hasChosenFirstDirection = true;
    this.response.speak("The trail splits here. You can go to Fort Bridger, or you can take the shortcut to Soda Springs. Which way do you want to go?").listen("Do you want to go to Fort Bridger or Soda Springs?");
    this.emit(":responseReady");
  },
  'GetTrailSplit': function() {
    if (this.event.request.intent.slots.direction.value.toLowerCase() === "fort bridger" || this.event.request.intent.slots.direction.value.toLowerCase() === "bridger" || this.event.request.intent.slots.direction.value.toLowerCase() === "fort") {
      mapLocation = "Fort Bridger";
      this.handler.state = GAME_STATES.EVENT;
      this.emitWithState('ChoseFortBridger');
    } else if (this.event.request.intent.slots.direction.value.toLowerCase() === "soda springs" || this.event.request.intent.slots.direction.value.toLowerCase() === "springs" || this.event.request.intent.slots.direction.value.toLowerCase() === "shortcut") {
      mapLocation = "Soda Springs";
      extraMiles -= 105;
      this.handler.state = GAME_STATES.EVENT;
      this.emitWithState('ChoseSodaSprings');
    } else {
      this.handler.state = GAME_STATES.FIRST_TRAIL_SPLIT;
      this.emitWithState('Unhandled');
    }
  },
  'AMAZON.HelpIntent': function() {
    if (food <= 15 * (peopleHealthy.length + peopleSick.length) || oxen <= 2 || parts <= 1) {
      this.response.speak("If you're low on supplies, it's best to go to Fort Bridger. But if your supplies is ok, you can take the shortcut to Soda Springs, which is 105 miles shorter. You seem low on supplies, so I recomment going to the fort. Do you want to go to Fort Bridger or Soda Springs?").listen("Do you want to go to Fort Bridger or Soda Springs?");
      this.emit(":responseReady");
    } else {
      this.response.speak("If you're low on supplies, it's best to go to Fort Bridger. But if your supplies is ok, you can take the shortcut to Soda Springs, which is 105 miles shorter. Assuming you don't have any bad events on the trail, I think you can take the shortcut. Do you want to go to Fort Bridger or Soda Springs?").listen("Do you want to go to Fort Bridger or Soda Springs?");
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
    this.response.speak("Sorry, I didn't get that. You must choose to go to Fort Bridger or Soda Springs. Which way do you want to go?").listen("Do you want to go to Fort Bridger or Soda Springs?");
    this.emit(":responseReady");
  },
});

// HANDLE SECOND TRAIL SPLIT
const secondTrailSplitHandlers = Alexa.CreateStateHandler(GAME_STATES.SECOND_TRAIL_SPLIT, {
  'ChooseDirection': function() {
    hasChosenSecondDirection = true;
    this.response.speak("The trail splits here. You can go to Fort Walla Walla, or you can take the shortcut to The Dalles. Which way do you want to go?").listen("Do you want to go to Fort Walla Walla or The Dalles?");
    this.emit(":responseReady");
  },
  'GetTrailSplit': function() {
    if (this.event.request.intent.slots.direction.value.toLowerCase() === "fort walla walla" || this.event.request.intent.slots.direction.value.toLowerCase() === "walla walla" || this.event.request.intent.slots.direction.value.toLowerCase() === "fort") {
      mapLocation = "Fort Walla Walla";
      this.handler.state = GAME_STATES.EVENT;
      this.emitWithState('ChoseFortWallaWalla');
    } else if (this.event.request.intent.slots.direction.value.toLowerCase() === "the dalles" || this.event.request.intent.slots.direction.value.toLowerCase() === "dalles" || this.event.request.intent.slots.direction.value.toLowerCase() === "shortcut") {
      mapLocation = "The Dalles";
      extraMiles -= 150;
      this.handler.state = GAME_STATES.EVENT;
      this.emitWithState('ChoseTheDalles');
    } else {
      this.handler.state = GAME_STATES.SECOND_TRAIL_SPLIT;
      this.emitWithState('Unhandled');
    }
  },
  'AMAZON.HelpIntent': function() {
    if (food <= 19 * (peopleHealthy.length + peopleSick.length) || oxen <= 2 || parts <= 1) {
      this.response.speak("If you're low on supplies, it's best to go to Fort Walla Walla. But if your supplies is ok, you can take the shortcut to The Dalles, which is 150 miles shorter. You seem low on supplies, so I recomment going to the fort. Do you want to go to Fort Walla Walla or The Dalles?").listen("Do you want to go to Fort Walla Walla or The Dalles?");
      this.emit(":responseReady");
    } else {
      this.response.speak("If you're low on supplies, it's best to go to Fort Walla Walla. But if your supplies is ok, you can take the shortcut to The Dalles, which is 150 miles shorter. Assuming you don't have any bad events on the trail, I think you can take the shortcut. Do you want to go to Fort Walla Walla or The Dalles?").listen("Do you want to go to Fort Walla Walla or The Dalles?");
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
    this.response.speak("Sorry, I didn't get that. You must choose to go to Fort Walla Walla or The Dalles. Which way do you want to go?").listen("Do you want to go to Fort Walla Walla or The Dalles?");
    this.emit(":responseReady");
  },
});

// HANDLE SHOPPING
const shoppingHandlers = Alexa.CreateStateHandler(GAME_STATES.SHOPPING, {
  'WelcomeToStore': function() {
    currentlyBuyingWhat = undefined;
    currentlyBuyingHowMany = 0;
    if (money > 0) {
      this.response.speak("Ok, you have $" + money + " to spend. You can buy food, oxen, or spare parts. What do you want to buy?").listen("What do you want to buy?");
      this.emit(":responseReady");
    } else {
      this.handler.state = GAME_STATES.CHANGE_PURCHASE;
      this.emitWithState('TradeInstead');
    }
  },
  'GetBuyOrTradeItem': function() {
    if (this.event.request.intent.slots.item.value === "food" || this.event.request.intent.slots.item.value === "oxen" || this.event.request.intent.slots.item.value === "parts" || this.event.request.intent.slots.item.value === "spare parts") {
      currentlyBuyingWhat = this.event.request.intent.slots.item.value;
      this.handler.state = GAME_STATES.SHOPPING_AMOUNT;
      this.emitWithState('HowMany');
    } else {
      this.handler.state = GAME_STATES.SHOPPING;
      this.emitWithState('Unhandled');
    }
  },
  'AMAZON.HelpIntent': function() {
    this.response.speak("You can buy food, oxen, or spare parts. Food will cost 50 cents per pound, oxen will cost $50 each, and spare parts will cost $30 each. You currently have $" + money + ". What do you want to buy?").listen("What do you want to buy?");
    this.emit(":responseReady");
  },
  'AMAZON.StartOverIntent': function() {
    this.handler.state = GAME_STATES.USER_SETUP;
    this.emitWithState('StartGameAgain');
  },
  'AMAZON.CancelIntent': function() {
    currentlyBuyingWhat = undefined;
    currentlyBuyingHowMany = 0;
    this.handler.state = GAME_STATES.FORT;
    this.emitWithState('Status');
  },
  'AMAZON.StopIntent': function() {
    this.response.speak(EXIT_SKILL_MESSAGE);
    this.emit(":responseReady");
  },
  'Unhandled': function() {
    this.response.speak("Sorry, I didn't get that. You can buy food, oxen, or spare parts. If you changed your mind, you can say cancel. What do you want to buy?").listen("What do you want to buy?");
    this.emit(":responseReady");
  },
});

// HANDLE SHOPPING AMOUNT
const shoppingAmountHandlers = Alexa.CreateStateHandler(GAME_STATES.SHOPPING_AMOUNT, {
  'HowMany': function() {
    if (currentlyBuyingWhat === "food") {
      itemPrice = 0.5;
      this.response.speak("Ok, let's buy food. Food costs 50 cents per pound. How many pounds of food do you want to buy?").listen("How many pounds of food do you want to buy?");
      this.emit(":responseReady");
    } else if (currentlyBuyingWhat === "oxen") {
      itemPrice = 50;
      this.response.speak("Ok, let's buy oxen. Each ox costs $50. How many oxen do you want to buy?").listen("How many oxen do you want to buy?");
      this.emit(":responseReady");
    } else if (currentlyBuyingWhat === "parts" || currentlyBuyingWhat === "spare parts") {
      itemPrice = 30;
      this.response.speak("Ok, let's buy spare parts. Each spare part costs $30. How many spare parts do you want to buy?").listen("How many spare parts do you want to buy?");
      this.emit(":responseReady");
    }
  },
  'GetNumber': function() {
    currentlyBuyingHowMany = +this.event.request.intent.slots.number.value;
    if (currentlyBuyingHowMany > 0) {
      this.handler.state = GAME_STATES.SHOPPING_SUCCESS;
      this.emitWithState('Total');
    } else {
      if (currentlyBuyingWhat === "food") {
        this.response.speak("Sorry, you can't buy zero pounds of food. If you want to cancel your purchase, say cancel. How many pounds of food do you want to buy?").listen("How many pounds of food do you want to buy? Please say a number.");
        this.emit(":responseReady");
      } else if (currentlyBuyingWhat === "oxen") {
        this.response.speak("Sorry, you can't buy zero oxen. If you want to cancel your purchase, say cancel. How many oxen do you want to buy?").listen("How many oxen do you want to buy? Please say a number.");
        this.emit(":responseReady");
      } else if (currentlyBuyingWhat === "parts" || currentlyBuyingWhat === "spare parts") {
        this.response.speak("Sorry, you can't buy zero spare parts. If you want to cancel your purchase, say cancel. How many spare parts do you want to buy?").listen("How many spare parts do you want to buy? Please say a number.");
        this.emit(":responseReady");
      }
    }
  },
  'AMAZON.HelpIntent': function() {
    if (currentlyBuyingWhat === "food") {
      this.response.speak("If you want to cancel your purchase, say cancel. If you want to buy food, it costs 50 cents per pound. You currently have $" + money + " and " + food + " pounds of food. How many pounds of food do you want to buy?").listen("How many pounds of food do you want to buy? Please say a number.");
      this.emit(":responseReady");
    } else if (currentlyBuyingWhat === "oxen") {
      if (oxen === 1) {
        this.response.speak("If you want to cancel your purchase, say cancel. If you want to buy oxen, they cost $50 each. You currently have $" + money + " and " + oxen + " ox. How many oxen do you want to buy?").listen("How many oxen do you want to buy? Please say a number.");
        this.emit(":responseReady");
      } else {
        this.response.speak("If you want to cancel your purchase, say cancel. If you want to buy oxen, they cost $50 each. You currently have $" + money + " and " + oxen + " oxen. How many oxen do you want to buy?").listen("How many oxen do you want to buy? Please say a number.");
        this.emit(":responseReady");
      }
    } else if (currentlyBuyingWhat === "parts" || currentlyBuyingWhat === "spare parts") {
      if (parts === 1) {
        this.response.speak("If you want to cancel your purchase, say cancel. If you want to buy spare parts, they cost $30 each. You currently have $" + money + " and " + parts + " spare part. How many oxen do you want to buy?").listen("How many oxen do you want to buy? Please say a number.");
        this.emit(":responseReady");
      } else {
        this.response.speak("If you want to cancel your purchase, say cancel. If you want to buy spare parts, they cost $30 each. You currently have $" + money + " and " + parts + " spare parts. How many oxen do you want to buy?").listen("How many oxen do you want to buy? Please say a number.");
        this.emit(":responseReady");
      }
    }
  },
  'AMAZON.StartOverIntent': function() {
    this.handler.state = GAME_STATES.USER_SETUP;
    this.emitWithState('StartGameAgain');
  },
  'AMAZON.CancelIntent': function() {
    currentlyBuyingWhat = undefined;
    currentlyBuyingHowMany = 0;
    this.handler.state = GAME_STATES.FORT;
    this.emitWithState('Status');
  },
  'AMAZON.StopIntent': function() {
    this.response.speak(EXIT_SKILL_MESSAGE);
    this.emit(":responseReady");
  },
  'Unhandled': function() {
    if (currentlyBuyingWhat === "food") {
      this.response.speak("Sorry, I didnt get that. How many pounds of food do you want to buy?").listen("How many pounds of food do you want to buy? Please say a number.");
      this.emit(":responseReady");
    } else if (currentlyBuyingWhat === "oxen") {
      this.response.speak("Sorry, I didnt get that. How many oxen do you want to buy?").listen("How many oxen do you want to buy? Please say a number.");
      this.emit(":responseReady");
    } else if (currentlyBuyingWhat === "parts" || currentlyBuyingWhat === "spare parts") {
      this.response.speak("Sorry, I didnt get that. How many spare parts do you want to buy?").listen("How many spare parts do you want to buy? Please say a number.");
      this.emit(":responseReady");
    }
  },
});

// HANDLE SHOPPING SUCCESS
const shoppingSuccessHandlers = Alexa.CreateStateHandler(GAME_STATES.SHOPPING_SUCCESS, {
  'Total': function() {
    if (currentlyBuyingWhat === "food") {
      total = currentlyBuyingHowMany * 0.5;
    } else if (currentlyBuyingWhat === "oxen") {
      total = currentlyBuyingHowMany * 50;
    } else if (currentlyBuyingWhat === "parts" || currentlyBuyingWhat === "spare parts") {
      total = currentlyBuyingHowMany * 30;
    }

    if (money < total) {
      this.handler.state = GAME_STATES.FORT;
      this.emitWithState('NotEnoughMoney');
    } else {
      days++;
      trailDays++;
      food -= (peopleHealthy.length + peopleSick.length);
      money -= currentlyBuyingHowMany * itemPrice;
      if (currentlyBuyingWhat === "food") {
        food += currentlyBuyingHowMany;
        this.response.speak(cashSFX + "Great! You bought " + currentlyBuyingHowMany + " pounds of food. You have $" + money + " left over. Do you want to buy anything else?").listen("Do you want to buy anything else?");
        this.emit(":responseReady");
      } else if (currentlyBuyingWhat === "oxen") {
        oxen += currentlyBuyingHowMany;
        this.response.speak(cashSFX + "Great! You bought " + currentlyBuyingHowMany + " oxen. You have $" + money + " left over. Do you want to buy anything else?").listen("Do you want to buy anything else?");
        this.emit(":responseReady");
      } else if (currentlyBuyingWhat === "parts" || currentlyBuyingWhat === "spare parts") {
        parts += currentlyBuyingHowMany;
        this.response.speak(cashSFX + "Great! You bought " + currentlyBuyingHowMany + " spare parts. You have $" + money + " left over. Do you want to buy anything else?").listen("Do you want to buy anything else?");
        this.emit(":responseReady");
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
    this.response.speak("You have $" + money + ". Do you want to buy anything else?").listen("Do you want to buy anything else?");
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
    this.response.speak("Do you want to buy anything else? Please say yes or no.").listen("Do you want to buy anything else? Please say yes or no.");
    this.emit(":responseReady");
  },
});

// HANDLE TRADING
const tradingHandlers = Alexa.CreateStateHandler(GAME_STATES.TRADING, {
  'Offer': function() {
    if (tradeAttempts < tradeChances) {
      tradeAttempts++;
      days++;
      trailDays++;
      food -= (peopleHealthy.length + peopleSick.length);
      tradeDeal = Math.floor(Math.random() * (10 - 1 + 1)) + 1;
      if (tradeDeal === 1) {
        this.response.speak("An old settler will give you a spare part for 50 pounds of food. Do you accept this trade?").listen("Do you accept this trade? Please say yes or no.");
        this.emit(":responseReady");
      } else if (tradeDeal === 2) {
        this.response.speak("A woman at the fort will give you 100 pounds of food for an ox. Do you accept this trade?").listen("Do you accept this trade? Please say yes or no.");
        this.emit(":responseReady");
      } else if (tradeDeal === 3) {
        this.response.speak("The general store owner will give you $15 for a spare part. Do you accept this trade?").listen("Do you accept this trade? Please say yes or no.");
        this.emit(":responseReady");
      } else if (tradeDeal === 4) {
        this.response.speak("A man at the fort will give you an ox for $25. Do you accept this trade?").listen("Do you accept this trade? Please say yes or no.");
        this.emit(":responseReady");
      } else if (tradeDeal === 5) {
        this.response.speak("A man at the fort will give you $30 for a spare part. Do you accept this trade?").listen("Do you accept this trade? Please say yes or no.");
        this.emit(":responseReady");
      } else if (tradeDeal === 6) {
        this.response.speak("A Native American at the fort will give you 200 pounds of food for two oxen. Do you accept this trade?").listen("Do you accept this trade? Please say yes or no.");
        this.emit(":responseReady");
      } else if (tradeDeal === 7) {
        this.response.speak("A woman at the fort will give you a spare part for $50. Do you accept this trade?").listen("Do you accept this trade? Please say yes or no.");
        this.emit(":responseReady");
      } else if (tradeDeal === 8) {
        this.response.speak("A man at the fort will give you $100 for an ox. Do you accept this trade?").listen("Do you accept this trade? Please say yes or no.");
        this.emit(":responseReady");
      } else if (tradeDeal === 9) {
        this.response.speak("An old settler will give you $20 for a spare part. Do you accept this trade?").listen("Do you accept this trade? Please say yes or no.");
        this.emit(":responseReady");
      } else if (tradeDeal === 10) {
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
    this.response.speak("If you want to accept the trade, say yes. If you don't like the trade, say no. Say cancel if you don't want to trade anymore.").listen("Please say yes, no, or cancel.");
    this.emit(":responseReady");
  },
  'AMAZON.StartOverIntent': function() {
    this.handler.state = GAME_STATES.USER_SETUP;
    this.emitWithState('StartGameAgain');
  },
  'AMAZON.CancelIntent': function() {
    this.handler.state = GAME_STATES.EVENT;
    this.emitWithState('PlayGame');
  },
  'AMAZON.StopIntent': function() {
    this.response.speak(EXIT_SKILL_MESSAGE);
    this.emit(":responseReady");
  },
  'Unhandled': function() {
    this.response.speak("Sorry, I didn't get that. Please say yes or no to the offer.").listen("Please say yes or no to the offer.");
    this.emit(":responseReady");
  },
});

// HANDLE SHOPPING-TRADING OR TRADING-SHOPPING TRANSITION
const changePurchaseHandlers = Alexa.CreateStateHandler(GAME_STATES.CHANGE_PURCHASE, {
  'TradeInstead': function() {
    purchaseChoice = "trade";
    if (money === 0) {
      this.response.speak(badNewsSFX + "Sorry, you don't have any money. Do you want to try trading with other pioneers at the fort?").listen("Do you want to try trading?");
      this.emit(":responseReady");
    } else {
      this.response.speak("Do you want to try trading with other pioneers at the fort?").listen("Do you want to try trading?");
      this.emit(":responseReady");
    }
  },
  'BuyInstead': function() {
    purchaseChoice = "buy";
    this.response.speak("You have $" + money + ". Do you want to buy any supplies?").listen("Do you want to buy any supplies?");
    this.emit(":responseReady");
  },
  'NoMoreTrading': function() {
    purchaseChoice = "buy";
    this.response.speak(badNewsSFX + "Sorry, no one else wants to trade with you. Do you want to go to the fort's general store?").listen("Do you want to go to the fort's general store?");
    this.emit(":responseReady");
  },
  'AMAZON.YesIntent': function() {
    if (purchaseChoice === "trade") {
      this.handler.state = GAME_STATES.TRADING;
      this.emitWithState('Offer');
    } else if (purchaseChoice === "buy") {
      this.handler.state = GAME_STATES.SHOPPING;
      this.emitWithState('WelcomeToStore');
    } else {
      this.handler.state = GAME_STATES.CHANGE_PURCHASE;
      this.emitWithState('Unhandled');
    }
  },
  'AMAZON.NoIntent': function() {
    this.handler.state = GAME_STATES.EVENT;
    this.emitWithState('PlayGame');
  },
  'AMAZON.HelpIntent': function() {
    this.response.speak("Say yes if you need more supplies. Say no or cancel if you want to get back on the trail.").listen("Please say yes, no, or cancel.");
    this.emit(":responseReady");
  },
  'AMAZON.StartOverIntent': function() {
    this.handler.state = GAME_STATES.USER_SETUP;
    this.emitWithState('StartGameAgain');
  },
  'AMAZON.CancelIntent': function() {
    this.handler.state = GAME_STATES.EVENT;
    this.emitWithState('PlayGame');
  },
  'AMAZON.StopIntent': function() {
    this.response.speak(EXIT_SKILL_MESSAGE);
    this.emit(":responseReady");
  },
  'Unhandled': function() {
    this.response.speak("Sorry, I didn't get that. Please say yes or no.").listen("Please say yes or no.");
    this.emit(":responseReady");
  },
});

// HANDLE HUNTING
const huntingHandlers = Alexa.CreateStateHandler(GAME_STATES.HUNT, {
  'ChooseToHunt': function() {
    this.response.speak(wildlifeSFX + "You're in an area with a lot of wildlife. You currently have " + food + " pounds of food, which will last about " + Math.floor(food/(peopleHealthy.length + peopleSick.length)) + " days. Do you want to go hunting for more food?").listen("Do you want to go hunting for more food?");
    this.emit(":responseReady");
  },
  'AMAZON.YesIntent': function() {
    this.handler.state = GAME_STATES.HUNT_NUMBER;
    this.emitWithState('ChooseRandomNumber');
  },
  'AMAZON.NoIntent': function() {
    this.handler.state = GAME_STATES.EVENT;
    this.emitWithState('PlayGame');
  },
  'AMAZON.HelpIntent': function() {
    this.response.speak("If you want to go to the hunting game, say yes. If not, say no to continue on the trail.").listen("Do you want to go hunting for more food? Please say yes or no.");
    this.emit(":responseReady");
  },
  'AMAZON.StartOverIntent': function() {
    this.handler.state = GAME_STATES.USER_SETUP;
    this.emitWithState('StartGameAgain');
  },
  'AMAZON.CancelIntent': function() {
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
    days++;
    trailDays++;
    food -= (peopleHealthy.length + peopleSick.length);
    this.response.speak("You will guess a number between 1 and 10. If you guess within 3 numbers of the secret number, you will shoot an animal. The closer you are to the number, the larger your animal. Please choose a number between 1 and 10.").listen("Please choose a number between 1 and 10.");
    this.emit(':responseReady');
  },
  'GetNumber': function() {
    guess = +this.event.request.intent.slots.number.value;
    if (guess >= 1 && guess <= 10) {
      this.handler.state = GAME_STATES.EVENT;
      this.emitWithState('Hunting');
    } else {
      this.response.speak("Sorry, you must guess a number between 1 and 10. Please choose a number between 1 and 10.").listen("Please choose a number between 1 and 10.");
      this.emit(':responseReady');
    }
  },
  'AMAZON.HelpIntent': function() {
    this.response.speak("Say a number between 1 and 10 to shoot an animal. If you'd rather get back to the trail, say cancel.").listen("Please say a number between 1 and 10.");
    this.emit(":responseReady");
  },
  'AMAZON.StartOverIntent': function() {
    this.handler.state = GAME_STATES.USER_SETUP;
    this.emitWithState('StartGameAgain');
  },
  'AMAZON.CancelIntent': function() {
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
    if (peopleHealthy.length > 1) {
      sickness.call(this);
      this.response.speak(badNewsSFX + invalid + " has " + issue + ". Do you want to rest to see if " + invalid + " feels better?").listen("Do you want to rest to see if " + invalid + " feels better?");
      this.response.cardRenderer(invalid + " has " + issue + ".");
      this.emit(":responseReady");
    } else {
      sickness.call(this);
      this.response.speak(badNewsSFX + "You have " + issue + ". Do you want to rest to see if you feel better?").listen("Do you want to rest to see if you feel better?");
      this.response.cardRenderer("You have " + issue + ".");
      this.emit(":responseReady");
    }
  },
  'AMAZON.YesIntent': function() {
    this.handler.state = GAME_STATES.REST;
    this.emitWithState('HowManyDays');
  },
  'AMAZON.NoIntent': function() {
    this.handler.state = GAME_STATES.EVENT;
    this.emitWithState('PlayGame');
  },
  'AMAZON.HelpIntent': function() {
    this.response.speak(badNewsSFX + "Uh oh! Someone's not feeling well. If you take a rest, there's a chance they could feel better. The longer the rest, the better the chance for them to heal. Do you want to rest? Say yes or no.").listen("Say yes to rest, or say no to continue on the trail.");
    this.emit(":responseReady");
  },
  'AMAZON.StartOverIntent': function() {
    this.handler.state = GAME_STATES.USER_SETUP;
    this.emitWithState('StartGameAgain');
  },
  'AMAZON.CancelIntent': function() {
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
    daysOfRest = +this.event.request.intent.slots.number.value;
    rest.call(this);
  },
  'AMAZON.HelpIntent': function() {
    this.response.speak("The more days you rest, the better the chances of recovery. How many days do you want to rest?").listen("How many days do you want to rest?");
    this.emit(":responseReady");
  },
  'AMAZON.StartOverIntent': function() {
    this.handler.state = GAME_STATES.USER_SETUP;
    this.emitWithState('StartGameAgain');
  },
  'AMAZON.CancelIntent': function() {
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
    this.response.speak(riverSFX + "You have arrived at the " + mapLocation + ". The river is " + riverDepth + " feet deep. You can buy a ferry for $" + ferryCost + ", or you can try to float across on your own. Do you want to ferry, or do you want to float?").listen("Do you want to ferry, or do you want to float?");
    this.emit(":responseReady");
  },
  'GetRiverCrossing': function() {
    if (this.event.request.intent.slots.crossing.value === "ferry") {
      if (money >= ferryCost) {
        money -= ferryCost;
        this.handler.state = GAME_STATES.EVENT;
        this.emitWithState('RiverSuccess');
      } else {
        if (fate <= sinkChance && riverDepth > 6) {
          food -= fate * 10;
          if (peopleHealthy.length + peopleSick.length === 1) {
            gameOverMessage = "no ferry money you drowned";
            gameOver.call(this);
          } else if (peopleSick.length >= 1) {
            deathPeopleSick.call(this);
            this.handler.state = GAME_STATES.EVENT;
            this.emitWithState('NoFerryMoneyRiverDeath');
          } else {
            deathPeopleHealthy.call(this);
            this.handler.state = GAME_STATES.EVENT;
            this.emitWithState('NoFerryMoneyRiverDeath');
          }
        } else if (fate <= sinkChance && riverDepth > 4) {
          food -= fate * 3;
          this.handler.state = GAME_STATES.EVENT;
          this.emitWithState('NoFerryMoneyRiverAccident');
        } else {
          this.handler.state = GAME_STATES.EVENT;
          this.emitWithState('NoFerryMoneyRiverSuccess');
        }
      }
    } else if (this.event.request.intent.slots.crossing.value === "float") {
      if (fate <= sinkChance && riverDepth > 6) {
        food -= fate * 10;
        if (peopleHealthy.length + peopleSick.length === 1) {
          gameOverMessage = "you drowned";
          gameOver.call(this);
        } else if (peopleSick.length >= 1) {
          deathPeopleSick.call(this);
          this.handler.state = GAME_STATES.EVENT;
          this.emitWithState('RiverDeath');
        } else {
          deathPeopleHealthy.call(this);
          this.handler.state = GAME_STATES.EVENT;
          this.emitWithState('RiverDeath');
        }
      } else if (fate <= sinkChance && riverDepth > 4) {
        food -= fate * 3;
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
  },
  'AMAZON.HelpIntent': function() {
    this.response.speak("If a river is less than three feet deep, it's usually safe to float. If it's over six feet deep, you definitely want a ferry. This river is " + riverDepth + " feet deep. Do you want to ferry, or do you want to float?").listen("Do you want to ferry, or do you want to float?");
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
    if (this.event.request.intent.slots.crossing.value !== "ferry" && this.event.request.intent.slots.crossing.value !== "float") {
      this.response.speak("I'm sorry, I didn't understand your choice. Do you want to ferry, or do you want to float?").listen("Please say ferry or float.");
      this.emit(":responseReady");
    }
  },
});



// =====================
// GLOBAL GAME VARIABLES
// =====================
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
var guess = 0; // track user's random number guess for hunting
var lostDays; // tracks how many days a user gets stuck
var daysWithoutFood = 0; // tracks how many days in a row there is no food -- could lead to starvation
var daysWithoutGrass = 0; // tracks how many days there is no grass -- could lead to oxen dying or wandering off
var riverDepth = 0; // tracks river's depth
var ferryCost = 0; // tracks cost to ferry across river
var sinkChance = 0; // tracks likelihood of sinking if floating across river
var mapLocation; // tracks player's location on map
var hasChosenFirstDirection = false; // tracks player's choice at split trail
var hasChosenSecondDirection = false; // tracks player's choice at split trail
var currentlyBuyingWhat; // tracks what user is buying
var currentlyBuyingHowMany; // tracks how much a user is buying
var itemPrice = 0; // tracks cost of item user is buying
var total; // tracks user's total purchase
var purchaseChoice; // tracks if user is buying or trading
var tradeChances = 0; // tracks how many times a user is allowed to trade at a fort
var tradeAttempts = 0; // tracks how many times a user tries to trade at a fort
var tradeDeal = 0; // random number between 1 and 10 that tracks the trade offer
var fate; // adds randomness to the game and changes every day
var gameOverMessage; // tracks the reason for game over

// 1836 CALENDAR
function dateFrom1836(day){
  var date = new Date(1836, 0);
  return new Date(date.setDate(day));
}

// STATUS UPDATE FOR CARD RENDERER
var statusCard = dateFrom1836(days).toDateString()
  + "\n-----------------"
  + "\nDays on the trail: " + trailDays
  + "\nMiles: " + miles + "/" + (1845 + extraMiles)
  + "\nMoney: " + money
  + "\nFood: " + food
  + "\nOxen: " + oxen
  + "\nParts: " + parts
  + "\nPeople healthy: " + peopleHealthy
  + "\nPeople sick: " + peopleSick
;

// SOUND EFFECTS
const wagonWheelsSFX = "eh ";
const goodNewsSFX = "hurray! ";
const badNewsSFX = "boo. ";
const fortSFX = "creak. ";
const riverSFX = "woosh! ";
const stormSFX = "rumble! ";
const gunShotSFX = "bang! ";
const hungrySFX = "gurgle. ";
const stampedeSFX = "roar! ";
const cashSFX = "ca-ching! ";
const wildlifeSFX = "tweet, tweet! ";
const winnerSFX = "woo hoo! ";
const loserSFX = "womp womp. ";

var travelingSFX = wagonWheelsSFX;

// RESET ALL STARTING VARIABLES TO OVERRIDE ALEXA'S DEFAULT PERSISTENCE
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
  guess = 0;
  lostDays = undefined;
  daysWithoutFood = 0;
  daysWithoutGrass = 0;
  riverDepth = 0;
  ferryCost = 0;
  sinkChance = 0;
  mapLocation = undefined;
  hasChosenFirstDirection = false;
  hasChosenSecondDirection = false;
  currentlyBuyingWhat = undefined;
  currentlyBuyingHowMany = 0;
  itemPrice = 0;
  total = 0;
  purchaseChoice = undefined;
  tradeChances = 0;
  tradeAttempts = 0;
  fate = 0;
  gameOverMessage = undefined;
  hasChosenProfession = false;
  hasBeenToGeneralStore = false;
  boughtFood = false;
  boughtOxen = false;
  boughtParts = false;
  hasChosenMonth = false;
};



// ==========
// GAME SETUP
// ==========
// MAIN PLAYER
var gameIntro = function() {
  mapLocation = "Independence";
  this.response.speak(WELCOME_MESSAGE + " " + START_GAME_MESSAGE + " Let's begin by setting up your five-person party." + " " + "What is your name?").listen("What is your name?");
  this.response.cardRenderer(WELCOME_MESSAGE);
  this.emit(':responseReady');
};

var gameIntroStartOver = function() {
  mapLocation = "Independence";
  this.response.speak("Ok, let's start over. What is your name?").listen("What is your name?");
  this.response.cardRenderer(WELCOME_MESSAGE);
  this.emit(':responseReady');
};

// PARTY
var setupParty = function() {
  if (peopleHealthy.length === 1) {
    this.response.speak("Hello, " + mainPlayer + "! What is the name of the second person in your party?").listen("Please name the second person in your party.");
    this.emit(':responseReady');
  } else if (peopleHealthy.length === 2) {
    this.response.speak("What is the name of the third person in your party?").listen("Please name the third person in your party.");
    this.emit(':responseReady');
  } else if (peopleHealthy.length === 3) {
    this.response.speak("What is the name of the fourth person in your party?").listen("Please name the fourth person in your party.");
    this.emit(':responseReady');
  } else if (peopleHealthy.length === 4) {
    this.response.speak("What is the name of the fifth person in your party?").listen("Please name the fifth person in your party.");
    this.emit(':responseReady');
  } else {
    this.handler.state = GAME_STATES.PROFESSION_SETUP;
    this.emitWithState('GetProfession');
  }
};

// PROFESSION
var hasChosenProfession = false;
var chooseProfession = function() {
  if (profession === undefined) {
    hasChosenProfession = true;
    this.response.speak("Great! Now let's choose your profession. You can be a banker, a carpenter, or a farmer. What do you want to be?").listen("You must choose to be a banker, a carpenter, or a farmer. What do you want to be?");
    this.response.cardRenderer("Banker (easy mode): Start with a lot of money, but receive zero bonus points.\nCarpenter (intermediate mode): Start with tools, supplies and some money, plus receive a few bonus points.\nFarmer (hard mode): Start with food, a few oxen and a little bit of money, and earn high bonus points.");
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
const GENERAL_STORE_MESSAGE = "Before leaving, you need to stock up on supplies. Let's go to the general store and buy food, oxen, and spare parts.";
const FOOD_REPROMPT = "Food costs 50 cents per pound. How many pounds of food do you want to buy?";
const OXEN_REPROMPT = "Each ox costs $50. How many oxen do you want to buy?";
const PARTS_REPROMPT = "Each spare part costs $30. How many spare parts do you want to buy?";
var TRY_BUYING_AGAIN;

var hasBeenToGeneralStore = false;
var boughtFood = false;
var boughtOxen = false;
var boughtParts = false;

var generalStore = function () {
  hasBeenToGeneralStore = true;
  var buyFood = function() {
    currentlyBuyingWhat = "pounds of food";
    itemPrice = 0.5;
    TRY_BUYING_AGAIN = FOOD_REPROMPT;
    if (profession.toLowerCase() === "banker") {
      money += 1200;
      this.response.speak("You are a banker. You have $" + money + ". " + GENERAL_STORE_MESSAGE + " We'll start with food. Food costs 50 cents per pound. I recommend at least 1,000 pounds. You currently have " + food + " pounds of food. How many pounds of food do you want to buy?").listen(FOOD_REPROMPT);
      this.response.cardRenderer("Your money: $" + money + "\nOne pound of food: 50 cents" + "\n\nYou currently have " + food + "pounds of food. It is recommend to start with at least 1,000 pounds.");
      this.emit(':responseReady');
    } else if (profession.toLowerCase() === "carpenter") {
      money += 800;
      parts += 4;
      this.response.speak("You are a carpenter. You have $" + money + " and " + parts + " spare parts. " + GENERAL_STORE_MESSAGE + " We'll start with food. Food costs 50 cents per pound. I recommend at least 1,000 pounds. You currently have " + food + " pounds of food. How many pounds of food do you want to buy?").listen(FOOD_REPROMPT);
      this.response.cardRenderer("Your money: $" + money + "\nOne pound of food: 50 cents" + "\n\nYou currently have " + food + "pounds of food. It is recommend to start with at least 1,000 pounds.");
      this.emit(':responseReady');
    } else if (profession.toLowerCase() === "farmer") {
      money += 400;
      food += 500;
      oxen += 4;
      this.response.speak("You are a farmer. You have $" + money + ", " + food + " pounds of food, and " + oxen + " oxen. " + GENERAL_STORE_MESSAGE + " We'll start with food. Food costs 50 cents per pound. I recommend at least 1,000 pounds. You currently have " + food + " pounds of food. How many pounds of food do you want to buy?").listen(FOOD_REPROMPT);
      this.response.cardRenderer("Your money: $" + money + "\nOne pound of food: 50 cents" + "\n\nYou currently have " + food + " pounds of food. It is recommend to start with at least 1,000 pounds.");
      this.emit(':responseReady');
    }
  };

  var buyOxen = function() {
    currentlyBuyingWhat = "oxen";
    itemPrice = 50;
    TRY_BUYING_AGAIN = OXEN_REPROMPT;
    this.response.speak(cashSFX + "You bought " + currentlyBuyingHowMany + " pounds of food and have $" + money + " left. Now let's buy oxen. You will need these oxen to pull your wagon. Each ox costs $50. I recommend at least six oxen. You currently have " + oxen + " oxen. How many oxen do you want to buy?").listen(OXEN_REPROMPT);
    this.emit(':responseReady');
  };

  var buyParts = function() {
    currentlyBuyingWhat = "spare parts";
    itemPrice = 30;
    TRY_BUYING_AGAIN = PARTS_REPROMPT;
    this.response.speak(cashSFX + "You bought " + currentlyBuyingHowMany + " oxen and have $" + money + " left. Now let's buy spare parts. You will need these parts in case your wagon breaks down along the trail. Each spare part costs $30. I recommend at least three spare parts. You currently have " + parts + " spare parts. How many spare parts do you want to buy?").listen(PARTS_REPROMPT);
    this.emit(':responseReady');
  };

  if (boughtFood === false) {
    buyFood.call(this);
  } else if (boughtOxen === false) {
    buyOxen.call(this);
  } else if (boughtParts === false) {
    buyParts.call(this);
  } else {
    this.handler.state = GAME_STATES.MONTH_SETUP;
    this.emitWithState('GetStartingMonth');
  }
};

var notEnoughMoney = function() {
  this.response.speak("Sorry, you only have $ " + money + ". " + TRY_BUYING_AGAIN).listen(TRY_BUYING_AGAIN);
  this.emit(':responseReady');
};

var mustBuyOxen = function() {
  this.response.speak("Sorry, you must buy at least one ox to pull your wagon. " + OXEN_REPROMPT).listen(OXEN_REPROMPT);
  this.emit(':responseReady');
};

// WHEN TO LEAVE
var hasChosenMonth = false;
var chooseMonth = function() {
  hasChosenMonth = true;
  this.response.speak(cashSFX + "Great! You have " + food + " pounds of food, " + oxen + " oxen, and " + parts + " spare parts. You also have $" + money + " left in your pocket. " + peopleHealthy[1] + ", " + peopleHealthy[2] + ", " + peopleHealthy[3] + ", and " + peopleHealthy[4] + " are ready to go. When do you want to start your journey? Choose a month between March and August.").listen("You can start your journey in March, April, May, June, July, or August. Which month do you want?");
  this.response.cardRenderer("It's time to start your journey. You can begin anytime between March and August. If you start too soon, there won't be enough grass for your oxen to eat, and you may encounter late-spring snow storms. If you leave too late, you won't make it to Oregon before winter. Choose wisely!");
  this.emit(':responseReady');
};

var chooseMonthAgain = function() {
  this.response.speak("You can start your journey in March, April, May, June, July, or August. Which month do you want?").listen("You can start your journey in March, April, May, June, July, or August. Which month do you want?");
  this.emit(':responseReady');
};

var setDays = function() {
  if (month.toLowerCase() === "march") {
    days = 61;
    this.handler.state = GAME_STATES.EVENT;
    this.emitWithState('PlayGame');
  } else if (month.toLowerCase() === "april") {
    days = 92;
    this.handler.state = GAME_STATES.EVENT;
    this.emitWithState('PlayGame');
  } else if (month.toLowerCase() === "may") {
    days = 122;
    this.handler.state = GAME_STATES.EVENT;
    this.emitWithState('PlayGame');
  } else if (month.toLowerCase() === "june") {
    days = 153;
    this.handler.state = GAME_STATES.EVENT;
    this.emitWithState('PlayGame');
  } else if (month.toLowerCase() === "july") {
    days = 183;
    this.handler.state = GAME_STATES.EVENT;
    this.emitWithState('PlayGame');
  } else if (month.toLowerCase() === "august") {
    days = 214;
    this.handler.state = GAME_STATES.EVENT;
    this.emitWithState('PlayGame');
  }
};



// ======================
// EVENTS ALONG THE TRAIL
// ======================
// RANDOM EVENTS
var randomEvents = function() {
  if (trailDays > 2) {
    // HUNTING
    if (fate < 3 && trailDays % 4 === 0) {
      this.handler.state = GAME_STATES.HUNT;
      this.emitWithState('ChooseToHunt');
    // SICKNESS/INJURY
    } else if (fate % 4 === 0 && trailDays % 4 === 0) {
      this.handler.state = GAME_STATES.SICK;
      this.emitWithState('Alert');
    // DEATH OF SICK/INJURED
    } else if (fate === 10 && trailDays % 2 === 0) {
      this.handler.state = GAME_STATES.EVENT;
      this.emitWithState('Death');
    // WEATHER
    } else if (fate === 3 && trailDays % 2 === 0) {
      if (days < 122 || (days > 306 && days < 487) || days > 671) {
        lostDays = Math.floor(Math.random() * (7 - 4 + 1)) + 1;
        this.handler.state = GAME_STATES.EVENT;
        this.emitWithState('Snow');
      } else if ((days > 122 && days < 214) || (days > 487 && days < 579)) {
        lostDays = Math.floor(Math.random() * (3 - 1 + 1)) + 1;
        this.handler.state = GAME_STATES.EVENT;
        this.emitWithState('Storm');
      } else {
        this.handler.state = GAME_STATES.EVENT;
        this.emitWithState('PlayGame');
      }
    // GREAT AMERICAN DESERT
    } else if (fate === 9) {
      if (mapLocation === "Kansas River" || mapLocation === "Fort Kearny" || mapLocation === "Chimney Rock") {
        if (days < 122 || (days > 365 && days < 487)) {
          this.handler.state = GAME_STATES.EVENT;
          this.emitWithState('NoGrass');
        } else if (days > 183 && days < 214) {
          this.handler.state = GAME_STATES.EVENT;
          this.emitWithState('BuffaloStampede');
        } else {
          this.handler.state = GAME_STATES.EVENT;
          this.emitWithState('PlayGame');
        }
      } else {
        this.handler.state = GAME_STATES.EVENT;
        this.emitWithState('PlayGame');
      }
    // GOOD THINGS
    } else if (fate === 7 && trailDays % 2 === 1) {
      var goodThing = Math.floor(Math.random() * (2 - 1 + 1)) + 1;
      if (goodThing === 1) {
        if ((days > 122 && days < 275) || (days > 487 && days < 640)) {
          this.handler.state = GAME_STATES.EVENT;
          this.emitWithState('FindBerries');
        } else {
          this.handler.state = GAME_STATES.EVENT;
          this.emitWithState('FindItems');
        }
      } else if (goodThing === 2 && peopleSick.length > 0) {
        recovery.call(this);
      } else {
        this.handler.state = GAME_STATES.EVENT;
        this.emitWithState('PlayGame');
      }
    // BAD THINGS
    } else if (fate === 6 && trailDays % 2 === 1) {
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
        this.handler.state = GAME_STATES.EVENT;
        this.emitWithState('PlayGame');
      }
    } else {
      this.handler.state = GAME_STATES.EVENT;
      this.emitWithState('PlayGame');
    }
  } else {
    this.handler.state = GAME_STATES.EVENT;
    this.emitWithState('PlayGame');
  }
};

// TRADING
var evaluateOffer = function() {
  if (tradeDeal === 1) {
    if (food >= 50) {
      parts++;
      food -= 50;
      this.handler.state = GAME_STATES.FORT;
      this.emitWithState('TradeSuccess');
    } else {
      this.handler.state = GAME_STATES.FORT;
      this.emitWithState('TradeFailure');
    }
  } else if (tradeDeal === 2) {
    if (oxen > 1) {
      food += 100;
      oxen--;
      this.handler.state = GAME_STATES.FORT;
      this.emitWithState('TradeSuccess');
    } else {
      this.handler.state = GAME_STATES.FORT;
      this.emitWithState('TradeFailure');
    }
  } else if (tradeDeal === 3) {
    if (parts >= 1) {
      money += 15;
      parts--;
      this.handler.state = GAME_STATES.FORT;
      this.emitWithState('TradeSuccess');
    } else {
      this.handler.state = GAME_STATES.FORT;
      this.emitWithState('TradeFailure');
    }
  } else if (tradeDeal === 4) {
    if (money >= 25) {
      oxen++;
      money -= 25;
      this.handler.state = GAME_STATES.FORT;
      this.emitWithState('TradeSuccess');
    } else {
      this.handler.state = GAME_STATES.FORT;
      this.emitWithState('TradeFailure');
    }
  } else if (tradeDeal === 5) {
    if (parts >= 1) {
      money += 30;
      parts --;
      this.handler.state = GAME_STATES.FORT;
      this.emitWithState('TradeSuccess');
    } else {
      this.handler.state = GAME_STATES.FORT;
      this.emitWithState('TradeFailure');
    }
  } else if (tradeDeal === 6) {
    if (oxen > 2) {
      food += 200;
      oxen -= 2;
      this.handler.state = GAME_STATES.FORT;
      this.emitWithState('TradeSuccess');
    } else {
      this.handler.state = GAME_STATES.FORT;
      this.emitWithState('TradeFailure');
    }
  } else if (tradeDeal === 7) {
    if (money >= 50) {
      parts++;
      money -= 50;
      this.handler.state = GAME_STATES.FORT;
      this.emitWithState('TradeSuccess');
    } else {
      this.handler.state = GAME_STATES.FORT;
      this.emitWithState('TradeFailure');
    }
  } else if (tradeDeal === 8) {
    if (oxen > 1) {
      money += 100;
      oxen--;
      this.handler.state = GAME_STATES.FORT;
      this.emitWithState('TradeSuccess');
    } else {
      this.handler.state = GAME_STATES.FORT;
      this.emitWithState('TradeFailure');
    }
  } else if (tradeDeal === 9) {
    if (parts >= 1) {
      money += 20;
      parts--;
      this.handler.state = GAME_STATES.FORT;
      this.emitWithState('TradeSuccess');
    } else {
      this.handler.state = GAME_STATES.FORT;
      this.emitWithState('TradeFailure');
    }
  } else if (tradeDeal === 10) {
    if (food >= 50) {
      parts++;
      food -= 75;
      this.handler.state = GAME_STATES.FORT;
      this.emitWithState('TradeSuccess');
    } else {
      this.handler.state = GAME_STATES.FORT;
      this.emitWithState('TradeFailure');
    }
  }
};

// RESTING
var daysOfRest = 0;
var howManyToHeal = 0;
var rest = function() {
  var chanceOfRecovery = (Math.floor(Math.random() * (10 - 1 + 1)) + 1);
  if (daysOfRest >= 7 && chanceOfRecovery % 2 === 0) {
    days += daysOfRest;
    trailDays += daysOfRest;
    food -= daysOfRest*(peopleHealthy.length + peopleSick.length);
    howManyToHeal = 3;
    restRecovery.call(this);
  } else if (daysOfRest >= 5 && chanceOfRecovery % 2 === 0) {
    days += daysOfRest;
    trailDays += daysOfRest;
    food -= daysOfRest*(peopleHealthy.length + peopleSick.length);
    howManyToHeal = 2;
    restRecovery.call(this);
  } else if (daysOfRest >= 2 && chanceOfRecovery % 2 === 0) {
    days += daysOfRest;
    trailDays += daysOfRest;
    food -= daysOfRest*(peopleHealthy.length + peopleSick.length);
    howManyToHeal = 1;
    restRecovery.call(this);
  } else {
    days++;
    trailDays++;
    food -= (peopleHealthy.length + peopleSick.length);
    howManyToHeal = 0;
    restRecovery.call(this);
  }
};

// REST RECOVERY
var recoveredMessage;
var restRecovery = function() {
  var peopleCured = 0;
  var recoveredPerson;
  var message = [];

  var healThem = function() {
    var recoveredIndex = Math.floor(Math.random() * peopleSick.length);
    if (peopleCured === 0) {
      if (peopleSick.length === 1 && peopleSick.indexOf(mainPlayer) === 0) {
        peopleSick.shift();
        peopleHealthy.unshift(mainPlayer);
        peopleCured++;
        message.push("You are feeling much better.");
        healThem.call(this);
      } else {
        recoveredPerson = peopleSick.pop();
        peopleHealthy.push(recoveredPerson);
        peopleCured++;
        message.push(invalid + " is feeling much better.");
        healThem.call(this);
      }
    } else if (peopleCured < howManyToHeal && peopleSick.length > 0) {
      if (recoveredIndex === 0 && peopleSick.indexOf(mainPlayer) === 0) {
        peopleSick.shift();
        peopleHealthy.unshift(mainPlayer);
        peopleCured++;
        message.push("You are feeling much better.");
        healThem.call(this);
      } else {
        recoveredPerson = peopleSick[recoveredIndex];
        peopleSick.splice(recoveredIndex, 1);
        peopleHealthy.push(recoveredPerson);
        peopleCured++;
        message.push(recoveredPerson + " is feeling much better.");
        healThem.call(this);
      }
    } else {
      recoveredMessage = message.join(" ");
      this.handler.state = GAME_STATES.EVENT;
      this.emitWithState('RestRecovery');
    }
  };

  healThem.call(this);
};

// RECOVERY
var recovery = function() {
  var recoveredIndex = Math.floor(Math.random() * peopleSick.length);
  if (recoveredIndex === 0 && peopleSick.indexOf(mainPlayer) === 0) {
    peopleSick.shift();
    peopleHealthy.unshift(mainPlayer);
    recoveredMessage = "You are feeling much better.";
    this.handler.state = GAME_STATES.EVENT;
    this.emitWithState('Recovery');
  } else {
    var recoveredPerson = peopleSick[recoveredIndex];
    peopleSick.splice(recoveredIndex, 1);
    peopleHealthy.push(recoveredPerson);
    recoveredMessage = recoveredPerson + " is feeling much better.";
    this.handler.state = GAME_STATES.EVENT;
    this.emitWithState('Recovery');
  }
};

// SICKNESS
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

// DEATH OF SICK PERSON
var deathPeopleSick = function() {
  var victimIndex;
  if (peopleSick.indexOf(mainPlayer) === 0) {
    victimIndex = Math.floor(Math.random() * ((peopleSick.length - 1) - 1 + 1)) + 1;
  } else {
    victimIndex = Math.floor(Math.random() * peopleSick.length);
  }
  victim = peopleSick[victimIndex];
  peopleSick.splice(victimIndex, 1);
};

// DEATH OF HEALTHY PERSON
var deathPeopleHealthy = function() {
  var victimIndex;
  if (peopleHealthy.indexOf(mainPlayer) === 0) {
    victimIndex = Math.floor(Math.random() * ((peopleHealthy.length - 1) - 1 + 1)) + 1;
  } else {
    victimIndex = Math.floor(Math.random() * peopleHealthy.length);
  }
  victim = peopleHealthy[victimIndex];
  peopleHealthy.splice(victimIndex, 1);
};

// GAME OVER
var gameOver = function() {
  if (gameOverMessage === "winner") {
    var bonus;
    if (profession.toLowerCase() === "banker") {
      bonus = 1;
    } else if (profession.toLowerCase() === "carpenter") {
      bonus = 2;
    } else if (profession.toLowerCase() === "farmer") {
      bonus = 3;
    }
    var points = bonus*((peopleHealthy.length * 100) + (peopleSick.length * 50) + (oxen * 20) + (food * 2) + (parts * 2) + money - trailDays);
    this.response.speak(winnerSFX + "Congratulations, you reached Oregon City! You finished the game with a score of " + points + " points.");
    this.response.cardRenderer("Congratulations, you reach Oregon City! FINAL SCORE: " + points);
    this.emit(':responseReady');
  } else if (gameOverMessage === "you died") {
    var diseases = ["a fever", "dysentery", "an infection", "dehydration"];
    var fatality = diseases[Math.floor(Math.random() * diseases.length)];
    this.response.speak(loserSFX + "You have died of " + fatality + ". Game over!");
    this.response.cardRenderer("Game over! You have died of " + fatality);
    this.emit(':responseReady');
  } else if (gameOverMessage === "you drowned") {
    this.response.speak(loserSFX + "Your wagon was overtaken by water, and you drowned. Game over!");
    this.response.cardRenderer("Game over! You drowned trying to cross the " + mapLocation + ".");
    this.emit(':responseReady');
  } else if (gameOverMessage === "no ferry money you drowned") {
    this.response.speak(loserSFX + "Sorry, you don't have enough money to pay the ferry. You wall have to try floating across the river. <break time='2s'/> Your wagon was overtaken by water, and you drowned. Game over!");
    this.response.cardRenderer("Game over! You drowned trying to cross the " + mapLocation + ".");
    this.emit(':responseReady');
  } else if (gameOverMessage === "you starved") {
    this.response.speak(loserSFX + "You have died of starvation. Game over!");
    this.response.cardRenderer("Game over! You have died of starvation.");
    this.emit(':responseReady');
  } else if (gameOverMessage === "froze to death") {
    this.response.speak(loserSFX + "You got stuck in a large snow storm for " + lostDays + " days and froze to death.");
    this.response.cardRenderer("Game over! You froze to death.");
    this.emit(':responseReady');
  } else if (gameOverMessage === "no more oxen -- ox probs") {
    var allOxProblems = ["An ox has wandered off.", "An ox has died."];
    var randomOxProblem = allOxProblems[Math.floor(Math.random() * allOxProblems.length)];
    this.response.speak(loserSFX + randomOxProblem + " That was your last ox. This is as far as you can go. Good luck homesteading!");
    this.response.cardRenderer("Game over! You don't have an ox to pull your wagon.");
    this.emit(':responseReady');
  } else if (gameOverMessage === "no more oxen -- fire") {
    if (oxen === 1) {
      this.response.speak(loserSFX + "A fire broke out and killed your last ox. This is as far as you can go. Good luck homesteading!");
      this.response.cardRenderer("Game over! You don't have an ox to pull your wagon.");
      this.emit(':responseReady');
    } else {
      this.response.speak(loserSFX + "A fire broke out and killed your last oxen. This is as far as you can go. Good luck homesteading!");
      this.response.cardRenderer("Game over! You don't have an ox to pull your wagon.");
      this.emit(':responseReady');
    }
  } else if (gameOverMessage === "no more oxen -- thief") {
    if (oxen === 1) {
      this.response.speak(loserSFX + "A thief stole your last ox. This is as far as you can go. Good luck homesteading!");
      this.response.cardRenderer("Game over! You don't have an ox to pull your wagon.");
      this.emit(':responseReady');
    } else {
      this.response.speak(loserSFX + "A thief stole your last oxen. This is as far as you can go. Good luck homesteading!");
      this.response.cardRenderer("Game over! You don't have an ox to pull your wagon.");
      this.emit(':responseReady');
    }
  } else if (gameOverMessage === "no more oxen -- thunderstorm") {
    this.response.speak(stormSFX + "You got caught in a major thunderstorm and your last ox ran away. " + loserSFX + "This is as far as you can go. Good luck homesteading!");
    this.response.cardRenderer("Game over! You don't have an ox to pull your wagon.");
    this.emit(':responseReady');
  } else if (gameOverMessage === "broken wagon") {
    this.response.speak(loserSFX + "Your wagon broke, and you don't have any spare parts to fix it. This is as far as you can go. Good luck homesteading!");
    this.response.cardRenderer("Game over! Your wagon broke, and you don't have any spare parts to fix it.");
    this.emit(':responseReady');
  } else {
    this.response.speak(loserSFX + "Game over!");
    this.response.cardRenderer("Game over!");
    this.emit(':responseReady');
  }
};



// =============
// THE TRAIL MAP
// =============
var travel = function() {
  if (miles === 105) {
    mapLocation = "Kansas River";
    if (days < 92) {
      riverDepth = 3;
    } else {
      riverDepth = 4;
    }
    ferryCost = 5;
    sinkChance = 2;
    this.handler.state = GAME_STATES.RIVER;
    this.emitWithState('CrossingChoice');
  } else if (miles === 300) {
    mapLocation = "Fort Kearny";
    tradeChances = 1;
    tradeAttempts = 0;
    this.handler.state = GAME_STATES.FORT;
    this.emitWithState('WelcomeToFort');
  } else if (miles === 555) {
    mapLocation = "Chimney Rock";
    this.handler.state = GAME_STATES.EVENT;
    this.emitWithState('ChimneyRock');
  } else if (miles === 645) {
    mapLocation = "Fort Laramie";
    tradeChances = 2;
    tradeAttempts = 0;
    this.handler.state = GAME_STATES.FORT;
    this.emitWithState('WelcomeToFort');
  } else if (miles === 825) {
    mapLocation = "Independence Rock";
    this.handler.state = GAME_STATES.EVENT;
    this.emitWithState('IndependenceRock');
  } else if (miles === 930) {
    mapLocation = "South Pass";
    this.handler.state = GAME_STATES.EVENT;
    this.emitWithState('SouthPass');
  } else if (miles === 1050 && mapLocation !== "Fort Bridger") {
    mapLocation = "Green River";
    riverDepth = 8;
    ferryCost = 12;
    sinkChance = 8;
    this.handler.state = GAME_STATES.RIVER;
    this.emitWithState('CrossingChoice');
  } else if (miles === 1200) {
    if (mapLocation === "Fort Bridger") {
      tradeChances = 3;
      tradeAttempts = 0;
      this.handler.state = GAME_STATES.FORT;
      this.emitWithState('WelcomeToFort');
    } else if (mapLocation === "Soda Springs") {
      this.handler.state = GAME_STATES.EVENT;
      this.emitWithState('SodaSprings');
    }
  } else if (miles === 1260) {
    mapLocation = "Fort Hall";
    tradeChances = 2;
    tradeAttempts = 0;
    this.handler.state = GAME_STATES.FORT;
    this.emitWithState('WelcomeToFort');
  } else if (miles === 1440) {
    mapLocation = "Snake River";
    riverDepth = 5;
    ferryCost = 7;
    sinkChance = 5;
    this.handler.state = GAME_STATES.RIVER;
    this.emitWithState('CrossingChoice');
  } else if (miles === 1560 && mapLocation !== "Fort Walla Walla") {
    mapLocation = "Fort Boise";
    tradeChances = 1;
    tradeAttempts = 0;
    this.handler.state = GAME_STATES.FORT;
    this.emitWithState('WelcomeToFort');
  } else if (miles === 1710) {
    if (mapLocation === "Fort Walla Walla") {
      tradeChances = 1;
      tradeAttempts = 0;
      this.handler.state = GAME_STATES.FORT;
      this.emitWithState('WelcomeToFort');
    } else if (mapLocation === "The Dalles") {
      this.handler.state = GAME_STATES.EVENT;
      this.emitWithState('TheDalles');
    }
  } else if (miles === 1845) {
    mapLocation = "Oregon City";
    gameOverMessage = "winner";
    gameOver.call(this);
  } else {
    randomEvents.call(this);
  }
};



// ================
// THE OREGON TRAIL
// ================
var theOregonTrail = function() {
  // DAILY CHANGES
  travelingSFX = travelingSFX + wagonWheelsSFX;
  miles += 15;
  days++;
  trailDays++;
  fate = Math.floor(Math.random() * (10 - 1 + 1)) + 1;

  if (food <= 0) {
    daysWithoutFood++;
    this.handler.state = GAME_STATES.EVENT;
    this.emitWithState('Starve');
  } else {
    if (food >= (peopleHealthy.length + peopleSick.length)) {
      food -= (peopleHealthy.length + peopleSick.length); // each person eats 1 lb/day
    } else {
      food = 0;
    }
  }

  // TRAVELING
  if (mapLocation === "Green River" && hasChosenFirstDirection === false) {
    this.handler.state = GAME_STATES.FIRST_TRAIL_SPLIT;
    this.emitWithState('ChooseDirection');
  } else if (mapLocation === "Fort Boise" && hasChosenSecondDirection === false) {
    this.handler.state = GAME_STATES.SECOND_TRAIL_SPLIT;
    this.emitWithState('ChooseDirection');
  } else {
    travel.call(this);
  }
};


exports.handler = function(event, context, callback) {
  const alexa = Alexa.handler(event, context);
  alexa.appId = APP_ID;
  alexa.registerHandlers(newSessionHandlers, userSetupHandlers, professionSetupHandlers, suppliesSetupHandlers, monthSetupHandlers, eventHandlers, fortHandlers, firstTrailSplitHandlers, secondTrailSplitHandlers, shoppingHandlers, shoppingAmountHandlers, shoppingSuccessHandlers, tradingHandlers, changePurchaseHandlers, huntingHandlers, huntingNumberHandlers, sicknessHandlers, daysOfRestHandlers, crossRiverHandlers);
  alexa.execute();
};
