'use strict';

const Alexa = require('alexa-sdk');
const APP_ID = "amzn1.ask.skill.9608708c-a9ff-441b-9659-0958592879e5";
const GAME_STATES = {
  USER_SETUP: '_USERSETUPMODE', // entry point, setting up main player's name and party members' names
  PROFESSION_SETUP: '_PROFESSIONSETUPMODE', // setting up user's profession and starting money/food/oxen/parts
  SUPPLIES_SETUP: '_SUPPLIESSETUP', // setting up user's first purchases at general store
  MONTH_SETUP: '_MONTHSETUP', // setting up user's preferred starting month
  EVENT: '_EVENTMODE', // events within the game
  LANDMARK: '_LANDMARKMODE', // landmarks along the trail
  HUNT: '_HUNTMODE', // hunting within the game
  HUNT_NUMBER: '_HUNTNUMBERMODE', // choosing a random number for hunting
  SICK: '_SICKMODE', // when a person gets sick or injured
  REST: '_RESTMODE', // resting for potential recovery
  RIVER: '_RIVERMODE', // crossing rivers
  HELP: '_HELPMODE', // help the user // TODO still need to set this up and register it below
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
    resetVariables.call(this); // ensure all variables have default, empty values to start
    this.handler.state = GAME_STATES.USER_SETUP;
    this.emitWithState('StartGame');
  },
  'AMAZON.StartOverIntent': function() {
    resetVariables.call(this); // reset all variables to default empty values
    this.handler.state = GAME_STATES.USER_SETUP;
    this.emitWithState('StartGame');
  },
  'AMAZON.HelpIntent': function() {
    // TODO setup help state and function
    this.handler.state = GAME_STATES.HELP;
    this.emitWithState('helpTheUser');
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
  'AMAZON.HelpIntent': function() {
    // TODO setup help state and function
    this.handler.state = GAME_STATES.HELP;
    this.emitWithState('helpTheUser');
  },
  'AMAZON.StartOverIntent': function() {
    resetVariables.call(this); // reset all variables
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
    // TODO setup help state and function
    this.handler.state = GAME_STATES.HELP;
    this.emitWithState('helpTheUser');
  },
  'AMAZON.StartOverIntent': function() {
    resetVariables.call(this); // reset all variables
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
    if (this.event.request.intent.name !== "GetProfession") {
      this.response.speak("I'm sorry, but that's not a profession I understand. Please choose to be a banker, a carpenter, or a farmer.").listen("Please choose to be a banker, a carpenter, or a farmer.");
      this.emit(":responseReady");
    } else {
      // TODO setup help state and function
      this.handler.state = GAME_STATES.HELP;
      this.emitWithState('helpTheUser');
    }
  },
});

// HANDLE SUPPLIES
const suppliesSetupHandlers = Alexa.CreateStateHandler(GAME_STATES.SUPPLIES_SETUP, {
  'GetNumber': function() {
    if (hasBeenToGeneralStore === false) {
      generalStore.call(this);
    } else {
      amountToBuy = +this.event.request.intent.slots.number.value;
      if (currentlyBuying !== undefined && (amountToBuy * itemPrice > money)) {
        notEnoughMoney.call(this);
      } else {
        money -= (amountToBuy * itemPrice);
        if (currentlyBuying === "pounds of food") {
          food += amountToBuy;
          boughtFood = true;
          generalStore.call(this);
        } else if (currentlyBuying === "oxen") {
          if (oxen === 0 && amountToBuy > 0) {
            oxen += amountToBuy;
            boughtOxen = true;
            generalStore.call(this);
          } else {
            mustBuyOxen.call(this);
          }
        } else if (currentlyBuying === "spare parts") {
          parts += amountToBuy;
          boughtParts = true;
          generalStore.call(this);
        } else {
          generalStore.call(this);
        }
      }
    }
  },
  'AMAZON.HelpIntent': function() {
    // TODO setup help state and function
    this.handler.state = GAME_STATES.HELP;
    this.emitWithState('helpTheUser');
  },
  'AMAZON.StartOverIntent': function() {
    resetVariables.call(this); // reset all variables
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
    if (this.event.request.intent.name !== "GetNumber") {
      this.response.speak("I'm sorry, I didn't understand how many " + currentlyBuying + " you want to buy. Please say a number.").listen("Please say a number.");
      this.emit(":responseReady");
    } else {
      // TODO setup help state and function
      this.handler.state = GAME_STATES.HELP;
      this.emitWithState('helpTheUser');
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
    // TODO setup help state and function
    this.handler.state = GAME_STATES.HELP;
    this.emitWithState('helpTheUser');
  },
  'AMAZON.StartOverIntent': function() {
    resetVariables.call(this); // reset all variables
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
    if (this.event.request.intent.name !== "GetStartingMonth") {
      this.response.speak("I'm sorry, I didn't understand your month. Please choose a month between March and August.").listen("Please choose a month between March and August.");
      this.emit(":responseReady");
    } else {
      // TODO setup help state and function
      this.handler.state = GAME_STATES.HELP;
      this.emitWithState('helpTheUser');
    }
  },
});

// HANDLE GAME EVENTS
const eventHandlers = Alexa.CreateStateHandler(GAME_STATES.EVENT, {
  'PlayGame': function() {
    this.response.speak("The game is playing.");
    this.emit(":responseReady");
    // theOregonTrail.call(this); // TODO call the game when ready
  },
  'Hunting': function() {
    var randomNumber = Math.floor(Math.random() * (10 - 1 + 1)) + 1;
    if (guess === randomNumber - 3 || guess === randomNumber + 3) {
      food += 2;
      this.response.speak("You guessed " + guess + ". The secret number was " + randomNumber + ". Congratulations! You shot a squirrel and brought back 2 pounds of food. Say OK to continue on the trail.").listen("Say OK to continue on the trail.");
      this.response.cardRenderer(statusCard);
      this.emit(':responseReady');
    } else if (guess === randomNumber - 2 || guess === randomNumber + 2) {
      food += 5;
      this.response.speak("You guessed " + guess + ". The secret number was " + randomNumber + ". Congratulations! You shot a rabbit and brought back 5 pounds of food. Say OK to continue on the trail.").listen("Say OK to continue on the trail.");
      this.response.cardRenderer(statusCard);
      this.emit(':responseReady');
    } else if (guess === randomNumber - 1 || guess === randomNumber + 1) {
      food += 50;
      this.response.speak("You guessed " + guess + ". The secret number was " + randomNumber + ". Congratulations! You shot a deer and brought back 50 pounds of food. Say OK to continue on the trail.").listen("Say OK to continue on the trail.");
      this.response.cardRenderer(statusCard);
      this.emit(':responseReady');
    } else if (guess === randomNumber) {
      food += 100;
      if (mapLocation === "Independence" || mapLocation === "Kansas River" || mapLocation === "Fort Kearney" || mapLocation === "Chimney Rock" || mapLocation === "Fort Laramie") {
        this.response.speak("You guessed " + guess + ". The secret number was " + randomNumber + ". Congratulations! You shot a buffalo and brought back 100 pounds of food. Say OK to continue on the trail.").listen("Say OK to continue on the trail.");
        this.response.cardRenderer(statusCard);
        this.emit(':responseReady');
      } else {
        this.response.speak("You guessed " + guess + ". The secret number was " + randomNumber + ". Congratulations! You shot a bear and brought back 100 pounds of food. Say OK to continue on the trail.").listen("Say OK to continue on the trail.");
        this.response.cardRenderer(statusCard);
        this.emit(':responseReady');
      }
    } else {
      this.response.speak("You guessed " + guess + ". The secret number was " + randomNumber + " Sorry, you didn't get anything on this hunting round. Say OK to continue on the trail.").listen("Say OK to continue on the trail.");
      this.response.cardRenderer(statusCard);
      this.emit(':responseReady');
    }
  },
  'Recovery': function() {
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
      this.response.speak("You rested for " + daysOfRest + " days. " + recoveredMessage + " Say OK to continue on the trail.").listen("Say OK to continue on the trail.");
      this.emit(":responseReady");
    }
  },
  'Starve': function() {
    if (daysWithoutFood === 1) {
      this.response.speak("You have run out of food. Say OK to continue on the trail.").listen("Say OK to continue on the trail.");
      this.emit(":responseReady");
    } else if (daysWithoutFood % 2 === 0 && peopleHealthy.length > 0) {
      if (peopleHealthy.length === 1) {
        if (fate % 2 === 0) {
          sickness();
          this.response.speak("You are starving and are very weak. Say OK to continue on the trail.").listen("Say OK to continue on the trail.");
          this.emit(":responseReady");
        }
      } else {
        if (fate % 2 === 0) {
          sickness();
          this.response.speak(invalid + " is starving and is very weak. Say OK to continue on the trail.").listen("Say OK to continue on the trail.");
          this.emit(":responseReady");
        }
      }
    } else if (daysWithoutFood % 3 === 0 && fate % 2 === 0) {
      if (peopleHealthy.length + peopleSick.length === 1) {
        gameOverMessage = "you starved";
        gameOver.call(this);
      } else if (peopleSick.length > 0){
        deathPeopleSick.call(this);
        this.response.speak(victim + " has died of starvation. Rest in peace " + victim + ". Say OK to continue on the trail.").listen("Say OK to continue on the trail.");
        this.emit(":responseReady");
      } else if (peopleHealthy.length > 0) {
        deathPeopleHealthy.call(this);
        this.response.speak(victim + " has died of starvation. Rest in peace " + victim + ". Say OK to continue on the trail.").listen("Say OK to continue on the trail.");
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
      this.response.speak(victim + " has died of " + fatality + ". Rest in peace " + victim + ". Now, it's time to move on. Say OK to continue on the trail.").listen("Say OK to continue on the trail.");
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
      this.response.speak("You got stuck in some snow. You have lost 1 day. Say OK to continue on the trail.").listen("Say OK to continue on the trail.");
      this.emit(":responseReady");
    } else if (lostDays >= 5 && peopleSick.length + peopleHealthy.length > 1) {
      if (peopleSick.length > 0) {
        deathPeopleSick.call(this);
        this.response.speak("You got stuck in a large snow storm. You lost " + lostDays + " days, and " + victim + " froze to death. Rest in peace " + victim + ". Say OK to continue on the trail.").listen("Say OK to continue on the trail.");
        this.emit(":responseReady");
      } else {
        deathPeopleHealthy.call(this);
        this.response.speak("You got stuck in a large snow storm. You lost " + lostDays + " days, and " + victim + " froze to death. Rest in peace " + victim + ". Say OK to continue on the trail.").listen("Say OK to continue on the trail.");
        this.emit(":responseReady");
      }
    } else if (lostDays >= 5 && peopleSick.length + peopleHealthy.length === 1) {
      gameOverMessage = "froze to death";
      gameOver.call(this);
    } else {
      this.response.speak("You got stuck in some snow. You have lost " + lostDays + " days. Say OK to continue on the trail.").listen("Say OK to continue on the trail.");
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
        this.response.speak("You got caught in a thunderstorm and an ox ran away. You lost " + lostDays + " days. Say OK to continue on the trail.").listen("Say OK to continue on the trail.");
        this.emit(":responseReady");
      }
    } else if (lostDays === 1) {
      this.response.speak("You got caught in a thunderstorm. You lost 1 day. Say OK to continue on the trail.").listen("Say OK to continue on the trail.");
      this.emit(":responseReady");
    } else {
      this.response.speak("You got caught in a thunderstorm. You lost " + lostDays + " days. Say OK to continue on the trail.").listen("Say OK to continue on the trail.");
      this.emit(":responseReady");
    }
  },
  'NoGrass': function() {
    daysWithoutGrass++;
    if (daysWithoutGrass % 3 === 0) {
      this.handler.state = GAME_STATES.EVENT;
      this.emitWithState('OxProblem');
    } else {
      this.response.speak("There's no grass for the oxen. Say OK to continue on the trail.").listen("Say OK to continue on the trail.");
      this.emit(":responseReady");
    }
  },
  'BuffaloStampede': function() {
    var stampedeChance = Math.floor(Math.random() * (10 - 1 + 1)) + 1;
    if (stampedeChance === 9 && peopleSick.length + peopleHealthy.length > 1) {
      if (peopleHealthy.length > 1) {
        deathPeopleHealthy.call(this);
        this.response.speak("Oh no! Buffalo stampede! " + victim + " got trampled. Rest in peace " + victim + ". Say OK to continue on the trail.").listen("Say OK to continue on the trail.");
        this.emit(":responseReady");
      } else if (peopleSick.length > 0) {
        deathPeopleSick.call(this);
        this.response.speak("Oh no! Buffalo stampede! " + victim + " got trampled. Rest in peace " + victim + ". Say OK to continue on the trail.").listen("Say OK to continue on the trail.");
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
      this.response.speak(randomOxProblem + " Say OK to continue on the trail.").listen("Say OK to continue on the trail.");
      this.emit(":responseReady");
    } else if (oxen === 1) {
      gameOverMessage = "no more oxen -- ox probs";
      gameOver.call(this);
    }
  },
  'Fire': function() {
    var destroyedItems = [["food", 20, "pounds of food"],["oxen", 1, "ox"],["money", 25, "dollars"],["parts", 1, "spare part"],["money", 10, "dollars"]];
    var itemIndex = Math.floor(Math.random() * destroyedItems.length);
    if (oxen === 1 && window[destroyedItems[itemIndex][0]] === "oxen") {
      gameOverMessage = "no more oxen -- fire";
      gameOver.call(this);
    } else if (window[destroyedItems[itemIndex][0]] > destroyedItems[itemIndex][1]) {
      window[destroyedItems[itemIndex][0]] -= destroyedItems[itemIndex][1];
      this.response.speak("A fire broke out in your wagon and destroyed " + destroyedItems[itemIndex][1] + " " + destroyedItems[itemIndex][2] + ". Say OK to continue on the trail.").listen("Say OK to continue on the trail.");
      this.emit(":responseReady");
    } else if (window[destroyedItems[itemIndex][0]] > 0) {
      window[destroyedItems[itemIndex][0]] = 0;
      this.response.speak("A fire broke out in your wagon and destroyed your remaining " + destroyedItems[itemIndex][2] + ". Say OK to continue on the trail.").listen("Say OK to continue on the trail.");
      this.emit(":responseReady");
    } else {
      this.handler.state = GAME_STATES.EVENT;
      this.emitWithState('PlayGame');
    }
  },
  'Thief': function() {
    var stolenItems = [["food", 20, "pounds of food"],["oxen", 1, "ox"],["money", 25, "dollars"],["parts", 1, "spare part"],["money", 10, "dollars"]];
    var itemIndex = Math.floor(Math.random() * stolenItems.length);
    if (oxen === 1 && window[stolenItems[itemIndex][0]] === "oxen") {
      gameOverMessage = "no more oxen -- thief";
      gameOver.call(this);
    } else if (window[stolenItems[itemIndex][0]] > stolenItems[itemIndex][1]) {
      window[stolenItems[itemIndex][0]] -= stolenItems[itemIndex][1];
      this.response.speak("A thief broke into your wagon and stole " + stolenItems[itemIndex][1] + " " + stolenItems[itemIndex][2] + ". Say OK to continue on the trail.").listen("Say OK to continue on the trail.");
      this.emit(":responseReady");
    } else if (window[stolenItems[itemIndex][0]] > 0) {
      window[stolenItems[itemIndex][0]] = 0;
      this.response.speak("A thief broke into your wagon and stole your remaining " + stolenItems[itemIndex][2] + ". Say OK to continue on the trail.").listen("Say OK to continue on the trail.");
      this.emit(":responseReady");
    } else {
      this.handler.state = GAME_STATES.EVENT;
      this.emitWithState('PlayGame');
    }
  },
  'FindItems': function() {
    var foundItems = [["food", 50, "pounds of food"],["oxen", 2, "oxen"],["money", 50, "dollars"],["parts", 1, "spare part"],["money", 100, "dollars"]];
    var itemIndex = Math.floor(Math.random() * foundItems.length);
    window[foundItems[itemIndex][0]] += foundItems[itemIndex][1];
    this.response.speak("You found an abandoned wagon on the trail. After looking around, you found " + foundItems[itemIndex][1] + " " + foundItems[itemIndex][2] + ". Say OK to continue on the trail.").listen("Say OK to continue on the trail.");
    this.emit(":responseReady");
  },
  'FindBerries': function() {
    daysWithoutFood = 0;
    food += 3*(Math.floor(Math.random() * (10 - 1 + 1)) + 1);
    this.response.speak("You found wild berries. Say OK to continue on the trail.").listen("Say OK to continue on the trail.");
    this.emit(":responseReady");
  },
  'BrokenWagon': function() {
    if (parts > 0) {
      parts -= 1;
      days++;
      trailDays++;
      food -= (peopleHealthy.length + peopleSick.length);
      this.response.speak("Your wagon broke, but you repaired it. You now have " + parts + " spare parts. Say OK to continue on the trail.").listen("Say OK to continue on the trail.");
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
      this.response.speak("You lost the trail. You wasted 1 day. Say OK to continue on the trail.").listen("Say OK to continue on the trail.");
      this.emit(":responseReady");
    } else {
      this.response.speak("You lost the trail. You wasted " + howLong + " days. Say OK to continue on the trail.").listen("Say OK to continue on the trail.");
      this.emit(":responseReady");
    }
  },
  'RiverSuccess': function() {
    this.response.speak("Congratulations! You safely crossed the river. Say OK to continue on the trail.").listen("Say OK to continue on the trail.");
    this.emit(":responseReady");
  },
  'RiverAccident': function() {
    this.response.speak("You made it across, but water seeped in. You lost " + fate * 3 + " pounds of food. Say OK to continue on the trail.").listen("Say OK to continue on the trail.");
    this.emit(":responseReady");
  },
  'RiverDeath': function() {
    this.response.speak("Your wagon was overtaken by water, and " + victim + " drowned. You also lost " + fate * 10 + " pounds of food. Rest in peace " + victim + ". Say OK to continue on the trail.").listen("Say OK to continue on the trail.");
    this.emit(":responseReady");
  },
  'NoFerryMoneyRiverSuccess': function() {
    this.response.speak("Sorry, you don't have enough money to pay the ferry. You wall have to try floating across the river. <break time='2s'/> Congratulations! You safely crossed the river. Say OK to continue on the trail.").listen("Say OK to continue on the trail.");
    this.emit(":responseReady");
  },
  'NoFerryMoneyRiverAccident': function() {
    this.response.speak("Sorry, you don't have enough money to pay the ferry. You wall have to try floating across the river. <break time='2s'/> You made it across, but water seeped in. You lost " + fate * 3 + " pounds of food. Say OK to continue on the trail.").listen("Say OK to continue on the trail.");
    this.emit(":responseReady");
  },
  'NoFerryMoneyRiverDeath': function() {
    this.response.speak("Sorry, you don't have enough money to pay the ferry. You wall have to try floating across the river. <break time='2s'/> Your wagon was overtaken by water, and " + victim + " drowned. You also lost " + fate * 10 + " pounds of food. Rest in peace " + victim + ". Say OK to continue on the trail.").listen("Say OK to continue on the trail.");
    this.emit(":responseReady");
  },
  'LandmarkChimneyRock': function() {
    this.response.speak("You have arrived at Chimney Rock. Congratulations! Located in western Nebraska, Chimney Rock is a prominent geological formation that rises nearly 300 feet above the surrounding plains. For this reason, it is a well-known landmark along the trail, which means you're going the right way. Say OK to continue on the trail.").listen("Say OK to continue on the trail.");
    this.response.cardRenderer(statusCard);
    this.emit(":responseReady");
  },
  'LandmarkIndependenceRock': function() {
    this.response.speak("You have arrived at Independence Rock. Congratulations! Located in central Wyoming, Independence Rock is a large granite hill where many pioneers carve their names. It is a well-known landmark along the trail. Say OK to continue on the trail.").listen("Say OK to continue on the trail.");
    this.response.cardRenderer(statusCard);
    this.emit(":responseReady");
  },
  'LandmarkSouthPass': function() {
    this.response.speak("You have arrived at South Pass. Congratulations! Located in southwestern Wyoming, South Pass is the lowest point along the continental divide. It's the easiest way to cross the Rocky Mountains. Say OK to continue on the trail.").listen("Say OK to continue on the trail.");
    this.response.cardRenderer(statusCard);
    this.emit(":responseReady");
  },
  'LandmarkSodaSprings': function() {
    this.response.speak("You have arrived at Soda Springs. Congratulations! Located in southeastern Idaho, these springs bubble like soda water, which is how they got their name. It's a popular place to bathe and relax, but don't drink the water! You might get sick. Say OK to continue on the trail.").listen("Say OK to continue on the trail.");
    this.response.cardRenderer(statusCard);
    this.emit(":responseReady");
  },
  'LandmarkTheDalles': function() {
    this.response.speak("You have arrived at The Dalles. Congratulations! Located in northern Oregon, the Dalles is where the trail stops. You are blocked by the cascade mountains, and the only way to finish your journey is by floating down the Colombia River gorge. Say OK to continue on the trail.").listen("Say OK to continue on the trail.");
    this.response.cardRenderer(statusCard);
    this.emit(":responseReady");
  },
  'ContinueGame': function() {
    this.handler.state = GAME_STATES.EVENT;
    this.emitWithState('PlayGame');
  },
  'AMAZON.HelpIntent': function() {
    // TODO setup help state and function
    this.handler.state = GAME_STATES.HELP;
    this.emitWithState('helpTheUser');
  },
  'AMAZON.StartOverIntent': function() {
    resetVariables.call(this); // reset all variables
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
    // TODO setup help state and function
    this.handler.state = GAME_STATES.HELP;
    this.emitWithState('helpTheUser');
  },
});

// HANDLE LANDMARKS ALONG THE TRAIL
const landmarkHandlers = Alexa.CreateStateHandler(GAME_STATES.LANDMARK, {
  'KansasRiver': function() {
    if (days < 92) {
      riverDepth = 3;
    } else {
      riverDepth = 4;
    }
    ferryCost = 5;
    sinkChance = 2;
    this.handler.state = GAME_STATES.RIVER;
    this.emitWithState('CrossingChoice');
  },
  'FortKearny': function() {
    /*
    alert("Fort Kearny");
    alreadyTradedAtThisFort = false;
    var getStuff = prompt("Do you want to buy or trade anything while you're here? Type 'yes' or 'no'.");
    if (getStuff === "yes") {
      if (money <= 0) {
        alert("You don't have any money, but you can try trading.");
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
    */
  },
  'ChimneyRock': function() {
    this.handler.state = GAME_STATES.EVENT;
    this.emitWithState('LandmarkChimneyRock');
  },
  'FortLaramie': function() {
    /*
    alert("Fort Laramie");
    alreadyTradedAtThisFort = false;
    var getStuff = prompt("Do you want to buy or trade anything while you're here? Type 'yes' or 'no'.");
    if (getStuff === "yes") {
      if (money <= 0) {
        alert("You don't have any money, but you can try trading.");
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
    */
  },
  'IndependenceRock': function() {
    this.handler.state = GAME_STATES.EVENT;
    this.emitWithState('LandmarkIndependenceRock');
  },
  'SouthPass': function() {
    this.handler.state = GAME_STATES.EVENT;
    this.emitWithState('LandmarkSouthPass');
  },
  'GreenRiver': function() {
    riverDepth = 8;
    ferryCost = 12;
    sinkChance = 8;
    this.handler.state = GAME_STATES.RIVER;
    this.emitWithState('CrossingChoice');
  },
  'FortBridger': function() {
    /*
    alert("Fort Bridger");
    alreadyTradedAtThisFort = false;
    var getStuff = prompt("Do you want to buy or trade anything while you're here? Type 'yes' or 'no'.");
    if (getStuff === "yes") {
      if (money <= 0) {
        alert("You don't have any money, but you can try trading.");
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
    */
  },
  'SodaSprings': function() {
    this.handler.state = GAME_STATES.EVENT;
    this.emitWithState('LandmarkSodaSprings');
  },
  'FortHall': function() {
    /*
    alert("Fort Hall");
    alreadyTradedAtThisFort = false;
    var getStuff = prompt("Do you want to buy or trade anything while you're here? Type 'yes' or 'no'.");
    if (getStuff === "yes") {
      if (money <= 0) {
        alert("You don't have any money, but you can try trading.");
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
    */
  },
  'SnakeRiver': function() {
    riverDepth = 5;
    ferryCost = 7;
    sinkChance = 5;
    this.handler.state = GAME_STATES.RIVER;
    this.emitWithState('CrossingChoice');
  },
  'FortBoise': function() {
    /*
    alert("Fort Boise");
    alreadyTradedAtThisFort = false;
    var getStuff = prompt("Do you want to buy or trade anything while you're here? Type 'yes' or 'no'.");
    if (getStuff === "yes") {
      if (money <= 0) {
        alert("You don't have any money, but you can try trading.");
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
    */
  },
  'FortWallaWalla': function() {
    /*
    alert("Fort Walla Walla");
    alreadyTradedAtThisFort = false;
    var getStuff = prompt("Do you want to buy or trade anything while you're here? Type 'yes' or 'no'.");
    if (getStuff === "yes") {
      if (money <= 0) {
        alert("You don't have any money, but you can try trading.");
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
    */
  },
  'TheDalles': function() {
    this.handler.state = GAME_STATES.EVENT;
    this.emitWithState('LandmarkTheDalles');
  },
  'OregonCity': function() {
    gameOverMessage = "winner";
    gameOver.call(this);
  },
  'AMAZON.HelpIntent': function() {
    // TODO setup help state and function
    this.handler.state = GAME_STATES.HELP;
    this.emitWithState('helpTheUser');
  },
  'AMAZON.StartOverIntent': function() {
    resetVariables.call(this); // reset all variables
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
    // TODO
  },
});

// HANDLE HUNTING
const huntingHandlers = Alexa.CreateStateHandler(GAME_STATES.HUNT, {
  'ChooseToHunt': function() {
    this.response.speak("You're in an area with a lot of wildlife. You currently have " + food + " pounds of food, which will last about " + Math.floor(food/(peopleHealthy.length + peopleSick.length)) + " days. Do you want to go hunting for more food?").listen("Do you want to go hunting for more food?");
    this.response.cardRenderer(statusCard);
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
    // TODO setup help state and function
    this.handler.state = GAME_STATES.HELP;
    this.emitWithState('helpTheUser');
  },
  'AMAZON.StartOverIntent': function() {
    resetVariables.call(this); // reset all variables
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
    if (this.event.request.intent.name !== "AMAZON.YesIntent" && this.event.request.intent.name !== "AMAZON.NoIntent") {
      this.response.speak("Do you want to go hunting for more food? Please say yes or no.").listen("Do you want to go hunting for more food? Please say yes or no.");
      this.emit(":responseReady");
    } else {
      // TODO setup help state and function
      this.handler.state = GAME_STATES.HELP;
      this.emitWithState('helpTheUser');
    }
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
    // TODO setup help state and function
    this.handler.state = GAME_STATES.HELP;
    this.emitWithState('helpTheUser');
  },
  'AMAZON.StartOverIntent': function() {
    resetVariables.call(this); // reset all variables
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
    if (this.event.request.intent.name !== "GetNumber") {
      this.response.speak("I'm sorry, I didn't understand your number. Please say a number between 1 and 10.").listen("Please say a number between 1 and 10.");
      this.emit(":responseReady");
    } else {
      // TODO setup help state and function
      this.handler.state = GAME_STATES.HELP;
      this.emitWithState('helpTheUser');
    }
  },
});

// HANDLE SICKNESS AND INJURY
const sicknessHandlers = Alexa.CreateStateHandler(GAME_STATES.SICK, {
  'Alert': function() {
    var healthIssues = ["the flu", "cholera", "exhaustion", "typhoid fever", "a snake bite", "a broken arm", "a broken leg"];
    var issue = healthIssues[Math.floor(Math.random() * healthIssues.length)];
    if (peopleHealthy.length > 1) {
      sickness();
      this.response.speak(invalid + " has " + issue + ". Do you want to rest to see if " + invalid + " feels better?").listen("Do you want to rest to see if " + invalid + " feels better?");
      this.response.cardRenderer(invalid + " has " + issue + ".");
      this.emit(":responseReady");
    } else {
      sickness();
      this.response.speak("You have " + issue + ". Do you want to rest to see if " + invalid + " feels better?").listen("Do you want to rest to see if you feel better?");
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
    // TODO setup help state and function
    this.handler.state = GAME_STATES.HELP;
    this.emitWithState('helpTheUser');
  },
  'AMAZON.StartOverIntent': function() {
    resetVariables.call(this); // reset all variables
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
    if (this.event.request.intent.name !== "AMAZON.YesIntent" && this.event.request.intent.name !== "AMAZON.NoIntent") {
      this.response.speak("Do you want to take a rest? Please say yes or no.").listen("Please say yes or no.");
      this.emit(":responseReady");
    } else {
      // TODO setup help state and function
      this.handler.state = GAME_STATES.HELP;
      this.emitWithState('helpTheUser');
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
    daysOfRest = this.event.request.intent.slots.number.value;
    rest.call(this);
  },
  'AMAZON.HelpIntent': function() {
    // TODO setup help state and function
    this.handler.state = GAME_STATES.HELP;
    this.emitWithState('helpTheUser');
  },
  'AMAZON.StartOverIntent': function() {
    resetVariables.call(this); // reset all variables
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
    if (this.event.request.intent.name !== "GetNumber") {
      this.response.speak("I'm sorry, I didn't understand how many days you want to rest. Please say a number.").listen("Please say a number.");
      this.emit(":responseReady");
    } else {
      // TODO setup help state and function
      this.handler.state = GAME_STATES.HELP;
      this.emitWithState('helpTheUser');
    }
  },
});

// HANDLE RIVER CROSSINGS
const crossRiverHandlers = Alexa.CreateStateHandler(GAME_STATES.RIVER, {
  'CrossingChoice': function() {
    this.response.speak("You have arrived at the " + mapLocation + ". The river is " + riverDepth + " feet deep. You can buy a ferry for $" + ferryCost + ", or you can try to float across on your own. Do you want to ferry or float across the river?").listen("Do you want to ferry or float across the river?");
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
    // TODO setup help state and function
    this.handler.state = GAME_STATES.HELP;
    this.emitWithState('helpTheUser');
  },
  'AMAZON.StartOverIntent': function() {
    resetVariables.call(this); // reset all variables
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
    if (this.event.request.intent.slots.crossing.value !== "ferry" && this.event.request.intent.slots.crossing.value !== "float") {
      this.response.speak("I'm sorry, I didn't understand your choice. Do you want to ferry or float across the river?").listen("Please say ferry or float.");
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
var mapLocation; // follows map, remembers choices at split trails
var alreadyTradedAtThisFort = false; // tracks trading at each fort
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
  daysWithoutFood = 0;
  daysWithoutGrass = 0;
  mapLocation = undefined;
  alreadyTradedAtThisFort = false;
  fate = 0;
  hasChosenProfession = false;
  hasBeenToGeneralStore = false;
  currentlyBuying;
  itemPrice = 0;
  boughtFood = false;
  boughtOxen = false;
  boughtParts = false;
  amountToBuy = 0;
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
var currentlyBuying;
var itemPrice = 0;
var boughtFood = false;
var boughtOxen = false;
var boughtParts = false;
var amountToBuy = 0;

var generalStore = function () {
  hasBeenToGeneralStore = true;
  var buyFood = function() {
    currentlyBuying = "pounds of food";
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
    currentlyBuying = "oxen";
    itemPrice = 50;
    TRY_BUYING_AGAIN = OXEN_REPROMPT;
    this.response.speak("You bought " + amountToBuy + " pounds of food and have $" + money + " left. Now let's buy oxen. You will need these oxen to pull your wagon. Each ox costs $50. I recommend at least six oxen. You currently have " + oxen + " oxen. How many oxen do you want to buy?").listen(OXEN_REPROMPT);
    this.response.cardRenderer("Your total money: $" + money + "\nOne ox: $50" + "\n\nYou current have " + oxen + "oxen. It is recommend to have at least 6 oxen.");
    this.emit(':responseReady');
  };

  var buyParts = function() {
    currentlyBuying = "spare parts";
    itemPrice = 30;
    TRY_BUYING_AGAIN = PARTS_REPROMPT;
    this.response.speak("You bought " + amountToBuy + " oxen and have $" + money + " left. Now let's buy spare parts. You will need these parts in case your wagon breaks down along the trail. Each spare part costs $30. I recommend at least three spare parts. You currently have " + parts + " spare parts. How many spare parts do you want to buy?").listen(PARTS_REPROMPT);
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

/*
TODO give user the option to buy more
var buyMore = prompt("Do you want to buy anything else?");
if (buyMore === "yes") {
  goShopping();
}
*/

// WHEN TO LEAVE
var hasChosenMonth = false;
var chooseMonth = function() {
  hasChosenMonth = true;
  this.response.speak("Great! You have " + food + " pounds of food, " + oxen + " oxen, and " + parts + " spare parts. You also have $" + money + " left in your pocket. " + peopleHealthy[1] + ", " + peopleHealthy[2] + ", " + peopleHealthy[3] + ", and " + peopleHealthy[4] + " are ready to go. When do you want to start your journey? Choose a month between March and August.").listen("You can start your journey in March, April, May, June, July, or August. Which month do you want?");
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
        alert("You have $" + money + " left.");
      }
    } else if (toBuy === "oxen") {
      var beasts = +prompt("Ox: $50\nHow many oxen do you want to buy?");
      if (beasts * 50 > money) {
        beasts = +prompt("Sorry, you only have $" + money + ". Each ox costs $50. How many oxen do you want to buy?");
      } else {
        oxen += beasts;
        money -= beasts * 50;
        alert("You have $" + money + " left.");
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
      alert("Sorry, you don't have any money to buy items, and you already tried trading at this fort. It's time to move on.");
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
          alert("It's a deal!");
        } else if (yeahOrNah === "yes" && food < 50) {
          alert("Sorry, you don't have enough food to make the trade.");
        }
      } else if (tradeDeal === 2) {
        yeahOrNah = prompt("A woman at the fort will give you 100 pounds of food for an ox. Do you accept this trade? Type 'yes' or 'no'.");
        if (yeahOrNah === "yes" && oxen > 1) {
          food += 100;
          oxen--;
          alert("It's a deal!");
        } else if (yeahOrNah === "yes" && oxen === 1) {
          alert("Sorry, you only have one ox. You must keep him to continue on the trail.");
        }
      } else if (tradeDeal === 3) {
        yeahOrNah = prompt("The general store owner will give you $15 for a spare part. Do you accept this trade? Type 'yes' or 'no'.");
        if (yeahOrNah === "yes" && parts >= 1) {
          money += 15;
          parts--;
          alert("It's a deal!");
        } else if (yeahOrNah === "yes" && parts < 1) {
          alert("Sorry, you don't have any spare parts to make the trade.");
        }
      } else if (tradeDeal === 4) {
        yeahOrNah = prompt("A man at the fort will give you an ox for $25. Do you accept this trade? Type 'yes' or 'no'.");
        if (yeahOrNah === "yes" && money >= 25) {
          oxen++;
          money -= 25;
          alert("It's a deal!");
        } else if (yeahOrNah === "yes" && money < 25) {
          alert("Sorry, you don't have enough money to make the trade.");
        }
      } else if (tradeDeal === 5) {
        yeahOrNah = prompt("A man at the fort will give you $30 for a spare part. Do you accept this trade? Type 'yes' or 'no'.");
        if (yeahOrNah === "yes" && parts >= 1) {
          money += 30;
          parts --;
          alert("It's a deal!");
        } else if (yeahOrNah === "yes" && parts < 1) {
          alert("Sorry, you don't have any spare parts to make the trade.");
        }
      } else if (tradeDeal === 6) {
        yeahOrNah = prompt("A Native American at the fort will give you 200 pounds of food for two oxen. Do you accept this trade? Type 'yes' or 'no'.");
        if (yeahOrNah === "yes" && oxen > 2) {
          food += 200;
          oxen -= 2;
          alert("It's a deal!");
        } else if (yeahOrNah === "yes" && oxen > 2) {
          alert("Sorry, you only have two oxen. If you trade them both away, you won't be able to continue on the trail.");
        }
      } else if (tradeDeal === 7) {
        yeahOrNah = prompt("A woman at the fort will give you a spare part for $50. Do you accept this trade? Type 'yes' or 'no'.");
        if (yeahOrNah === "yes" && money >= 50) {
          parts++;
          money -= 50;
          alert("It's a deal!");
        } else if (yeahOrNah === "yes" && money < 50) {
          alert("Sorry, you don't have enough money to make the trade.");
        }
      } else if (tradeDeal === 8) {
        yeahOrNah = prompt("A man at the fort will give you $100 for an ox. Do you accept this trade? Type 'yes' or 'no'.");
        if (yeahOrNah === "yes" && oxen > 1) {
          money += 100;
          oxen--;
          alert("It's a deal!");
        } else if (yeahOrNah === "yes" && oxen === 1) {
          alert("Sorry, you only have one ox. You must keep him to continue on the trail.");
        }
      } else if (tradeDeal === 9) {
        yeahOrNah = prompt("An old settler will give you $20 for a spare part. Do you accept this trade? Type 'yes' or 'no'.");
        if (yeahOrNah === "yes" && parts >= 1) {
          money += 20;
          parts--;
          alert("It's a deal!");
        } else if (yeahOrNah === "yes" && parts < 1) {
          alert("Sorry, you don't have any spare parts to make the trade.");
        }
      } else if (tradeDeal === 10) {
        yeahOrNah = prompt("A man at the fort will give you a spare part for 75 pounds of food. Do you accept this trade? Type 'yes' or 'no'.");
        if (yeahOrNah === "yes" && food >= 50) {
          parts++;
          food -= 75;
          alert("It's a deal!");
        } else if (yeahOrNah === "yes" && food < 50) {
          alert("Sorry, you don't have enough food to make the trade.");
        }
      }
      var tradeAgain = prompt("Do you want to try again? Type 'yes' or 'no'.");
      if (tradeAgain === "yes") {
        makeADeal();
      }
    } else {
      alert("No one else at this fort wants to trade with you.");
    }
  };
  makeADeal();
  var goShoppingInstead = prompt("Instead of trading, do you want to buy anything? Type 'yes' or 'no'.");
  if (goShoppingInstead === "yes") {
    goShopping();
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
    recovery.call(this);
  } else if (daysOfRest >= 5 && chanceOfRecovery % 2 === 0) {
    days += daysOfRest;
    trailDays += daysOfRest;
    food -= daysOfRest*(peopleHealthy.length + peopleSick.length);
    howManyToHeal = 2;
    recovery.call(this);
  } else if (daysOfRest >= 2 && chanceOfRecovery % 2 === 0) {
    days += daysOfRest;
    trailDays += daysOfRest;
    food -= daysOfRest*(peopleHealthy.length + peopleSick.length);
    howManyToHeal = 1;
    recovery.call(this);
  } else {
    days++;
    trailDays++;
    food -= (peopleHealthy.length + peopleSick.length);
    howManyToHeal = 0;
    recovery.call(this);
  }
};

// RECOVERY
var recoveredMessage;
var recovery = function() {
  var peopleCured = 0;
  var message = [];

  var healThem = function() {
    peopleCured++;

    var recoveredIndex = Math.floor(Math.random() * peopleSick.length);
    if (recoveredIndex === 0 && peopleSick.indexOf(mainPlayer) === 0) {
      peopleSick.shift();
      peopleHealthy.unshift(mainPlayer);
      message.push("You are feeling much better.");
    } else {
      var recoveredPerson = peopleSick[recoveredIndex];
      peopleSick.splice(recoveredIndex, 1);
      peopleHealthy.push(recoveredPerson);
      message.push(recoveredPerson + " is feeling much better.");
    }

    if (peopleCured < howManyToHeal && peopleSick.length > 0) {
      healThem.call(this);
    } else {
      recoveredMessage = message.join(" ");
      this.handler.state = GAME_STATES.EVENT;
      this.emitWithState('Recovery');
    }
  };

  healThem.call(this);
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
    this.response.speak("Congratulations, you reached Oregon City! You finished the game with a score of " + points + " points.");
    this.response.cardRenderer("Congratulations, you reach Oregon City! FINAL SCORE: " + points);
    this.emit(':responseReady');
  } else if (gameOverMessage === "you died") {
    var diseases = ["a fever", "dysentery", "an infection", "dehydration"];
    var fatality = diseases[Math.floor(Math.random() * diseases.length)];
    this.response.speak("You have died of " + fatality + ". Game over!");
    this.response.cardRenderer("Game over! You have died of " + fatality);
    this.emit(':responseReady');
  } else if (gameOverMessage === "you drowned") {
    this.response.speak("Your wagon was overtaken by water, and you drowned. Game over!");
    this.response.cardRenderer("Game over! You drowned trying to cross the " + mapLocation + ".");
    this.emit(':responseReady');
  } else if (gameOverMessage === "no ferry money you drowned") {
    this.response.speak("Sorry, you don't have enough money to pay the ferry. You wall have to try floating across the river. <break time='2s'/> Your wagon was overtaken by water, and you drowned. Game over!");
    this.response.cardRenderer("Game over! You drowned trying to cross the " + mapLocation + ".");
    this.emit(':responseReady');
  } else if (gameOverMessage === "you starved") {
    this.response.speak("You have died of starvation. Game over!");
    this.response.cardRenderer("Game over! You have died of starvation.");
    this.emit(':responseReady');
  } else if (gameOverMessage === "froze to death") {
    this.response.speak("You got stuck in a large snow storm for " + lostDays + " days and froze to death.");
    this.response.cardRenderer("Game over! You froze to death.");
    this.emit(':responseReady');
  } else if (gameOverMessage === "no more oxen -- ox probs") {
    var allOxProblems = ["An ox has wandered off.", "An ox has died."];
    var randomOxProblem = allOxProblems[Math.floor(Math.random() * allOxProblems.length)];
    this.response.speak(randomOxProblem + " That was your last ox. This is as far as you can go. Good luck homesteading!");
    this.response.cardRenderer("Game over! You don't have an ox to pull your wagon.");
    this.emit(':responseReady');
  } else if (gameOverMessage === "no more oxen -- fire") {
    this.response.speak(randomOxProblem + " That was your last ox. This is as far as you can go. Good luck homesteading!");
    this.response.cardRenderer("Game over! You don't have an ox to pull your wagon.");
    this.emit(':responseReady');
  } else if (gameOverMessage === "no more oxen -- thief") {
    this.response.speak(randomOxProblem + " That was your last ox. This is as far as you can go. Good luck homesteading!");
    this.response.cardRenderer("Game over! You don't have an ox to pull your wagon.");
    this.emit(':responseReady');
  } else if (gameOverMessage === "no more oxen -- thunderstorm") {
    this.response.speak("You got caught in a major thunderstorm and your last ox ran away. This is as far as you can go. Good luck homesteading!");
    this.response.cardRenderer("Game over! You don't have an ox to pull your wagon.");
    this.emit(':responseReady');
  } else if (gameOverMessage === "broken wagon") {
    this.response.speak("Your wagon broke, and you don't have any spare parts to fix it. This is as far as you can go. Good luck homesteading!");
    this.response.cardRenderer("Game over! Your wagon broke, and you don't have any spare parts to fix it.");
    this.emit(':responseReady');
  } else {
    this.response.speak("Game over!");
    this.response.cardRenderer("Game over!");
    this.emit(':responseReady');
  }
};



// =============
// THE TRAIL MAP
// =============
var travel = function(distance) {
  if (distance === 105) {
    mapLocation = "Kansas River";
    this.handler.state = GAME_STATES.LANDMARK;
    this.emitWithState('KansasRiver');
  } else if (distance === 300) {
    mapLocation = "Fort Kearny";
    this.handler.state = GAME_STATES.LANDMARK;
    this.emitWithState('FortKearny');
  } else if (distance === 555) {
    mapLocation = "Chimney Rock";
    this.handler.state = GAME_STATES.LANDMARK;
    this.emitWithState('ChimneyRock');
  } else if (distance === 645) {
    mapLocation = "Fort Laramie";
    this.handler.state = GAME_STATES.LANDMARK;
    this.emitWithState('FortLaramie');
  } else if (distance === 825) {
    mapLocation = "Independence Rock";
    this.handler.state = GAME_STATES.LANDMARK;
    this.emitWithState('IndependenceRock');
  } else if (distance === 930) {
    mapLocation = "South Pass";
    this.handler.state = GAME_STATES.LANDMARK;
    this.emitWithState('SouthPass');
  } else if (distance === 1050 && mapLocation !== "Fort Bridger") {
    mapLocation = "Green River";
    this.handler.state = GAME_STATES.LANDMARK;
    this.emitWithState('GreenRiver');
    // TODO handle user's direction choice
    mapLocation = prompt("Do you want to stay on the trail to Fort Bridger or take the shortcut through Soda Springs?\n\nType 'Fort Bridger' or 'Soda Springs'.").replace(/(\b[a-z])/g, function(x){return x.toUpperCase();});
    if (mapLocation !== "Fort Bridger" && mapLocation !== "Soda Springs") {
      alert("Sorry, you didn't enter your desired location correctly. You'll stay on the trail and go to Fort Bridger.");
      mapLocation = "Fort Bridger";
    }
    if (mapLocation === "Soda Springs") {
      extraMiles -= 105;
    }
  } else if (distance === 1200) {
    if (mapLocation === "Fort Bridger") {
      this.handler.state = GAME_STATES.LANDMARK;
      this.emitWithState('FortBridger');
    } else if (mapLocation === "Soda Springs") {
      this.handler.state = GAME_STATES.LANDMARK;
      this.emitWithState('SodaSprings');
    }
  } else if (distance === 1260) {
    mapLocation = "Fort Hall";
    this.handler.state = GAME_STATES.LANDMARK;
    this.emitWithState('FortHall');
  } else if (distance === 1440) {
    mapLocation = "Snake River";
    this.handler.state = GAME_STATES.LANDMARK;
    this.emitWithState('SnakeRiver');
  } else if (distance === 1560 && mapLocation !== "Fort Walla Walla") {
    mapLocation = "Fort Boise";
    this.handler.state = GAME_STATES.LANDMARK;
    this.emitWithState('FortBoise');
    // TODO handle user's direction choice
    mapLocation = prompt("Do you want to stay on the trail to Fort Walla Walla or take the shortcut through The Dalles?\n\nType 'Fort Walla Walla' or 'The Dalles'.").replace(/(\b[a-z])/g, function(x){return x.toUpperCase();});
    if (mapLocation !== "Fort Walla Walla" && mapLocation !== "The Dalles") {
      alert("Sorry, you didn't enter your desired location correctly. You'll stay on the trail and go to Fort Walla Walla.");
      mapLocation = "Fort Walla Walla";
    }
    if (mapLocation === "The Dalles") {
      extraMiles -= 150;
    }
  } else if (distance === 1710) {
    if (mapLocation === "Fort Walla Walla") {
      this.handler.state = GAME_STATES.LANDMARK;
      this.emitWithState('FortWallaWalla');
    } else if (mapLocation === "The Dalles") {
      this.handler.state = GAME_STATES.LANDMARK;
      this.emitWithState('TheDalles');
    }
  } else if (distance === 1845) {
    mapLocation = "Oregon City";
    this.handler.state = GAME_STATES.LANDMARK;
    this.emitWithState('OregonCity');
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
    // travel(miles);
    // TODO setup handlers for forts, shopping, trading, crossing rivers, choosing directions

    // FOOD STATUS
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

    // RANDOM EVENTS
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
      } else if (fate === 10) {
        this.handler.state = GAME_STATES.EVENT;
        this.emitWithState('Death');
      // WEATHER
      } else if (fate === 3 && trailDays % 2 === 0) {
        if (days < 122 || (days > 306 && days < 487) || days > 671) {
          lostDays = Math.floor(Math.random() * (7 - 4 + 1)) + 1;
          this.handler.state = GAME_STATES.EVENT;
          this.emitWithState('Snow');
        } else if ((days > 122 && days < 153) || (days > 487 && days < 518)) {
          lostDays = Math.floor(Math.random() * (3 - 1 + 1)) + 1;
          this.handler.state = GAME_STATES.EVENT;
          this.emitWithState('Storm');
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
          }
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
          howManyToHeal = 1;
          recovery.call(this);
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
        }
      }
    }
  }
};


exports.handler = function(event, context, callback) {
  const alexa = Alexa.handler(event, context);
  alexa.appId = APP_ID;
  alexa.registerHandlers(newSessionHandlers, userSetupHandlers, professionSetupHandlers, suppliesSetupHandlers, monthSetupHandlers, eventHandlers, landmarkHandlers, huntingHandlers, huntingNumberHandlers, sicknessHandlers, daysOfRestHandlers, crossRiverHandlers);
  alexa.execute();
};
