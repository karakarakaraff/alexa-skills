/* eslint-disable  func-names */
/* eslint-disable  dot-notation */
/* eslint-disable  new-cap */
/* eslint quote-props: ['error', 'consistent']*/

'use strict';

const Alexa = require('alexa-sdk');

var peopleHealthy = [];
var peopleSick = [];
var mainPlayer; // tracks the main player
var profession; // main player's profession -- used for setup and final score bonus
var invalid; // tracks people as they get sick
var victim; // tracks people as they die
var money = 0;
var food = 0;
var oxen = 0;
var parts = 0;
var miles = 0; // used to track distance traveled on map
var days = 0; // used to track calendar
var trailDays = 0; // used to track usage of supplies
var daysWithoutFood = 0; // tracks how many days in a row there is no food -- could lead to starvation
var daysWithoutGrass = 0; // tracks how many days there is no grass -- could lead to oxen dying or wandering off
var mapLocation; // follows map choices at split trails
var fate; // fate adds randomness to the game and changes every day

// 1836 CALENDAR
function dateFrom1836(day){
  var date = new Date(1836, 0);
  return new Date(date.setDate(day));
}



// SET UP THE BEGINNING VARIABLES --------------------------------------------------------
var gameSetup = function() {
  mapLocation = "Independence"
  // PEOPLE
  alert("It's 1836 in Independence, Missouri. You and your family have decided to become pioneers and travel the Oregon Trail. Let's set up your five-person party.");
  mainPlayer = prompt("What is your name?");
  var person2 = prompt("Name the second person in your party.");
  var person3 = prompt("Name the third person in your party.");
  var person4 = prompt("Name the fourth person in your party.");
  var person5 = prompt("Name the fifth person in your party.");
  peopleHealthy.push(mainPlayer, person2, person3, person4, person5);

  // PROFESSION
  alert("You can be a banker, carpenter or farmer. A banker starts with more money, a carpenter starts with more tools and supplies, and a farmer starts with more food and a few oxen.");
  profession = prompt("What do you want to be? Type 'banker', 'carpenter', or 'farmer'.");
  if (profession == "banker") {
    money += 1500;
    alert("You have $" + money + ".");
  } else if (profession == "carpenter") {
    money += 1000;
    parts += 4;
    alert("You have $" + money + " and " + parts + " spare parts.");
  } else if (profession == "farmer") {
    money += 800;
    food += 500;
    oxen += 3;
    alert("You have $" + money + ", " + food + " pounds of food, and " + oxen + " oxen.");
  }

  // GENERAL STORE
  alert("Before leaving, you need to stock up on supplies. Let's go to the general store.");
  alert("Let's start with food. I recommend 200 pounds of food per person, a total of 1000 pounds. You currently have " + food + " pounds of food. Food costs 50 cents a pound.");
  var pounds = +prompt("Pound of food: 50 cents\nHow many pounds of food do you want to buy?");
  if (pounds * 0.5 > money) {
    pounds = +prompt("Sorry, you only have $ " + money + ". Each pound of food costs 50 cents. How many pounds of food do you want to buy?");
  } else {
    food += pounds;
    money -= pounds * 0.5;
    alert("You have $" + money + " left.");
  }

  alert("Now let's buy oxen. You will need these oxen to pull your wagon. I recommend at least six oxen. Each ox costs $50.");
  var beasts = +prompt("Ox: $50\nHow many oxen do you want to buy?");
  if (beasts * 50 > money) {
    beasts = +prompt("Sorry, you only have $" + money + ". Each ox costs $50. How many oxen do you want to buy?");
  } else {
    oxen += beasts;
    money -= beasts * 50;
    alert("You have $" + money + " left.");
  }

  alert("Now let's buy parts. You will need these parts in case your wagon breaks down along the trail. I recommend at least three spare parts. You currently have " + parts + " spare parts. One spare part costs $100.");
  var spares = +prompt("Spare part: $100\nHow many spare parts do you want to buy?");
  if (spares * 100 > money) {
    spares = +prompt("Sorry, you only have $" + money + ". Each spare part costs $100. How many spare parts do you want to buy?");
  } else {
    parts += spares;
    money -= spares * 100;
  }

  var buyMore = prompt("Do you want to buy anything else? Type 'yes' or 'no'.");
  if (buyMore == "yes") {
    goShopping();
  }

  // READY TO GO
  alert("Great! You have " + food + " pounds of food, " + oxen + " oxen, and " + parts + " spare parts with $" + money + " leftover. " + person2 + ", " + person3 + ", " + person4 + ", and " + person5 + " are ready to go.");

  // WHEN TO LEAVE
  alert("It's time to choose when to start your journey. If you start too soon, there won't be enough grass for your oxen to eat, and you may encounter late-spring snow storms. If you leave too late, you won't make it to Oregon before winter. Please choose a month between March and August.");
  var month = prompt("Do you want to leave in March, April, May, June, July or August?").toLowerCase();;
  if (month === "march") {
    days = 61;
  } else if (month == "april") {
    days = 92;
  } else if (month == "may") {
    days = 122;
  } else if (month == "june") {
    days = 153;
  } else if (month == "july") {
    days = 183;
  } else if (month == "august") {
    days = 214;
  }

  alert("Alright, let's hit the trail!");
};



// EVENTS --------------------------------------------------------------------------------
var crossRiver = function(depth, sinkChance, cost) {
  var cross = prompt(
    "You must cross the river. It is " + depth + " feet deep. Do you want to ferry for $" + cost + " or try to float across? Type 'ferry' or 'float'."
  );

  var float = function() {
    if (fate <= sinkChance && depth > 6) {
      food -= fate * 10;
      if (peopleHealthy.length + peopleSick.length === 1) {
        alert("Your wagon was overtaken by water, and you drowned.");
        throw new gameOver();
      } else if (peopleSick.length >= 1) {
        death(peopleSick);
        alert("Your wagon was overtaken by water, and " + victim + " drowned. You also lost " + fate * 10 + " pounds of food.");
      } else {
        death(peopleHealthy);
        alert("Your wagon was overtaken by water, and " + victim + " drowned. You also lost " + fate * 10 + " pounds of food."
        );
      }
    } else if (fate <= sinkChance && depth > 4) {
      food -= fate * 3;
      alert("You made it across, but water seeped in. You lost " + fate * 3 + " pounds of food."
      );
    } else {
      alert("Congratulations! You safely crossed the river.");
    }
  };

  if (cross == "ferry") {
    if (money >= cost) {
      money -= cost;
      alert("Congratulations! You safely crossed the river.");
    } else if (food >= cost * 3) {
      var choice = prompt(
        "You don't have $" + cost + ", but the ferry will accept " + cost * 3 + " pounds of food as your payment. Will you accept? Type 'yes' or 'no'.");
      if (choice == "yes") {
        food -= cost * 3;
        alert("Congratulations! You safely crossed the river.");
      } else {
        alert("You will have to try to float across.");
        float();
      }
    }
  } else {
    float();
  }
};

var goShopping = function() {
  days++;
  trailDays++;
  food -= (peopleHealthy.length + peopleSick.length);
  var toBuy = prompt("What do you want to buy? Type 'food', 'oxen', or 'parts'.");
  if (toBuy == "food") {
    var pounds = +prompt("Pound of food: 50 cents\nHow many pounds of food do you want to buy?");
    if (pounds * 0.5 > money) {
      pounds = +prompt("Sorry, you only have $ " + money + ". Each pound of food costs 50 cents. How many pounds of food do you want to buy?");
    } else {
      food += pounds;
      money -= pounds * 0.5;
      alert("You have $" + money + " left.");
    }
  } else if (toBuy == "oxen") {
    var beasts = +prompt("Ox: $50\nHow many oxen do you want to buy?");
    if (beasts * 50 > money) {
      beasts = +prompt("Sorry, you only have $" + money + ". Each ox costs $50. How many oxen do you want to buy?");
    } else {
      oxen += beasts;
      money -= beasts * 50;
      alert("You have $" + money + " left.");
    }
  } else if (toBuy == "parts") {
    var spares = +prompt("Spare part: $100\nHow many spare parts do you want to buy?");
    if (spares * 100 > money) {
      spares = +prompt("Sorry, you only have $" + money + ". Each spare part costs $100. How many spare parts do you want to buy?");
    } else {
      parts += spares;
      money -= spares * 100;
    }
  }
  var toBuyMore = prompt("Do you want to buy anything else? Type 'yes' or 'no'.");
  if (toBuyMore == "yes") {
    goShopping();
  }
  var tradeInstead = prompt("Instead of buying suplies, do you want to try trading? Type 'yes' or 'no'.");
  if (tradeInstead == "yes") {
    tradeItems(1);
  }
};

var tradeItems = function(tradeChances) {
  var tradeAttempts = 0;
  var makeADeal = function() {
    if (tradeAttempts < tradeChances) {
      days++;
      trailDays++;
      food -= (peopleHealthy.length + peopleSick.length);
      tradeAttempts++
      var tradeDeal = Math.floor(Math.random() * (10 - 1 + 1)) + 1;
      if (tradeDeal === 1) {
        var yeahOrNah = prompt("An old settler will give you a spare part for 50 pounds of food. Do you accept this trade? Type 'yes' or 'no'.");
        if (yeahOrNah == "yes" && food >= 50) {
          parts++;
          food -= 50;
          alert("It's a deal!");
        } else if (yeahOrNah == "yes" && food < 50) {
          alert("Sorry, you don't have enough food to make the trade.");
        }
      } else if (tradeDeal === 2) {
        var yeahOrNah = prompt("A woman at the fort will give you 100 pounds of food for an ox. Do you accept this trade? Type 'yes' or 'no'.");
        if (yeahOrNah == "yes" && oxen > 1) {
          food += 100;
          oxen--;
          alert("It's a deal!");
        } else if (yeahOrNah == "yes" && oxen === 1) {
          alert("Sorry, you only have one ox. You must keep him to continue on the trail.");
        }
      } else if (tradeDeal === 3) {
        var yeahOrNah = prompt("The general store owner will give you $50 for a spare part. Do you accept this trade? Type 'yes' or 'no'.");
        if (yeahOrNah == "yes" && parts >= 1) {
          money += 50;
          parts--;
          alert("It's a deal!");
        } else if (yeahOrNah == "yes" && parts < 1) {
          alert("Sorry, you don't have any spare parts to make the trade.");
        }
      } else if (tradeDeal === 4) {
        var yeahOrNah = prompt("A man at the fort will give you an ox for $25. Do you accept this trade? Type 'yes' or 'no'.");
        if (yeahOrNah == "yes" && money >= 25) {
          oxen++;
          money -= 25;
          alert("It's a deal!");
        } else if (yeahOrNah == "yes" && money < 25) {
          alert("Sorry, you don't have enough money to make the trade.");
        }
      } else if (tradeDeal === 5) {
        var yeahOrNah = prompt("A man at the fort will give you $100 for a spare part. Do you accept this trade? Type 'yes' or 'no'.");
        if (yeahOrNah == "yes" && parts >= 1) {
          money += 100;
          parts --;
          alert("It's a deal!");
        } else if (yeahOrNah == "yes" && parts < 1) {
          alert("Sorry, you don't have any spare parts to make the trade.");
        }
      } else if (tradeDeal === 6) {
        var yeahOrNah = prompt("A Native American at the fort will give you 200 pounds of food for two oxen. Do you accept this trade? Type 'yes' or 'no'.");
        if (yeahOrNah == "yes" && oxen > 2) {
          food += 200;
          oxen -= 2;
          alert("It's a deal!");
        } else if (yeahOrNah == "yes" && oxen > 2) {
          alert("Sorry, you only have two oxen. If you trade them both away, you won't be able to continue on the trail.");
        }
      } else if (tradeDeal === 7) {
        var yeahOrNah = prompt("A woman at the fort will give you a spare part for $50. Do you accept this trade? Type 'yes' or 'no'.");
        if (yeahOrNah == "yes" && money >= 50) {
          parts++;
          money -= 50;
          alert("It's a deal!");
        } else if (yeahOrNah == "yes" && money < 50) {
          alert("Sorry, you don't have enough money to make the trade.");
        }
      } else if (tradeDeal === 8) {
        var yeahOrNah = prompt("A man at the fort will give you $100 for an ox. Do you accept this trade? Type 'yes' or 'no'.");
        if (yeahOrNah == "yes" && oxen > 1) {
          money += 100;
          oxen--;
          alert("It's a deal!");
        } else if (yeahOrNah == "yes" && oxen === 1) {
          alert("Sorry, you only have one ox. You must keep him to continue on the trail.");
        }
      } else if (tradeDeal === 9) {
        var yeahOrNah = prompt("An old settler will give you $65 for a spare part. Do you accept this trade? Type 'yes' or 'no'.");
        if (yeahOrNah == "yes" && parts >= 1) {
          money += 65;
          parts--;
          alert("It's a deal!");
        } else if (yeahOrNah == "yes" && parts < 1) {
          alert("Sorry, you don't have any spare parts to make the trade.");
        }
      } else if (tradeDeal === 10) {
        var yeahOrNah = prompt("A man at the fort will give you a spare part for 50 pounds of food. Do you accept this trade? Type 'yes' or 'no'.");
        if (yeahOrNah == "yes" && food >= 50) {
          parts++;
          food -= 50;
          alert("It's a deal!");
        } else if (yeahOrNah == "yes" && food < 50) {
          alert("Sorry, you don't have enough food to make the trade.");
        }
      }
      var tradeAgain = prompt("Do you want to try again? Type 'yes' or 'no'.");
      if (tradeAgain == "yes") {
        makeADeal();
      }
    } else {
      alert("No one else wants to trade with you.");
    }
  };
  makeADeal();
  var goShoppingInstead = prompt("Instead of trading, do you want to buy anything?");
  if (goShoppingInstead == "yes") {
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
    if (guess == randomNumber - 3 || guess == randomNumber + 3) {
      food += 2;
      shootMessage = "You shot a squirrel and brought back 2 pounds of food.";
    } else if (guess == randomNumber - 2 || guess == randomNumber + 2) {
      food += 5;
      shootMessage = "You shot a rabbit and brought back 5 pounds of food.";
    } else if (guess == randomNumber - 1 || guess == randomNumber + 1) {
      food += 50;
      shootMessage = "You shot a deer and brought back 50 pounds of food.";
    } else if (guess == randomNumber) {
      food += 200;
      if (mapLocation == "Independence" || mapLocation == "Kansas River" || mapLocation == "Fort Kearney" || mapLocation == "Chimney Rock" || mapLocation == "Fort Laramie") {
        shootMessage = "You shot a buffalo and brought back 150 pounds of food.";
      } else {
        shootMessage = "You shot a bear and brought back 150 pounds of food.";
      }
    } else {
      shootMessage = "Sorry, you didn't get anything on this hunting round."
    }
    alert("You guessed " + guess + ". The random number was " + randomNumber + ". " + shootMessage);
  }

  if (guess > 0 && guess <= 10) {
    shootAnimal();
  } else {
    var guessAgain = +prompt("You must guess a number between 1 and 10. Your number:");
    if (guess > 0 && guess <= 10) {
      shootAnimal();
    } else {
      return
    }
  }
};

var rest = function(restDays) {
  if (restDays >= 7) {
    days += restDays;
    trailDays += restDays;
    food -= restDays*(peopleHealthy.length + peopleSick.length);
    recovery(5);
  } else if (restDays >= 5) {
    days += restDays;
    trailDays += restDays;
    food -= restDays*(peopleHealthy.length + peopleSick.length);
    recovery(2);
  } else if (restDays >= 2) {
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
    alert("You got stuck in some late spring snow. You have lost 1 day.");
  } else {
    alert("You got stuck in some late spring snow. You have lost " + lostDays + " days.");
  }
};

var storm = function(lostDays) {
  days += lostDays;
  trailDays += lostDays;
  food -= lostDays*(peopleHealthy.length + peopleSick.length);
  if (lostDays >= 3) {
    oxen -= 1;
    alert("You got caught in a thunderstorm and an ox ran away. You lost " + lostDays + " days.");
  } else if (lostDays === 1) {
    alert("You got caught in a thunderstorm. You lost 1 day.");
  } else {
    alert("You got caught in a thunderstorm. You lost " + lostDays + " days.");
  }
};

var noGrass = function() {
  daysWithoutGrass++;
  alert("There's no grass for the oxen.");
  if (daysWithoutGrass % 3 === 0) {
    oxProblem();
  }
};

var oxProblem = function() {
  var allOxProblems = ["An ox has wandered off.", "An ox has died."];
  var randomOxProblem = allOxProblems[Math.floor(Math.random() * allOxProblems.length)];
  alert(randomOxProblem);
  if (oxen > 0) {
    oxen -= 1;
  } else {
    alert("That was your last ox. This is as far as you can go. Good luck homesteading!");
    throw new gameOver();
  }
};

var fire = function() {
  var destroyedItems = [["food", 20, "pounds of food"],["oxen", 1, "ox"],["money", 25, "dollars"],["parts", 1, "spare part"],["money", 10, "dollars"]]
  var itemIndex = Math.floor(Math.random() * destroyedItems.length);
  if (window[destroyedItems[itemIndex][0]] > destroyedItems[itemIndex][1]) {
    window[destroyedItems[itemIndex][0]] -= destroyedItems[itemIndex][1];
    alert("A fire broke out in your wagon and destroyed " + destroyedItems[itemIndex][1] + " " + destroyedItems[itemIndex][2] + ".");
  } else {
    window[destroyedItems[itemIndex][0]] = 0;
    alert("A fire broke out in your wagon and destroyed your remaining " + destroyedItems[itemIndex][2] + ".");
  }

  if (oxen === 0) {
    alert("That was your last ox. This is as far as you can go. Good luck homesteading!");
    throw new gameOver();
  }
};

var thief = function() {
  var stolenItems = [["food", 20, "pounds of food"],["oxen", 1, "ox"],["money", 25, "dollars"],["parts", 1, "spare part"],["money", 10, "dollars"]]
  var itemIndex = Math.floor(Math.random() * stolenItems.length);
  if (window[stolenItems[itemIndex][0]] > stolenItems[itemIndex][1]) {
    window[stolenItems[itemIndex][0]] -= stolenItems[itemIndex][1];
    alert("A thief broke into your wagon and stole " + stolenItems[itemIndex][1] + " " + stolenItems[itemIndex][2] + ".");
  } else {
    window[stolenItems[itemIndex][0]] = 0;
    alert("A thief broke into your wagon and stole your remaining " + stolenItems[itemIndex][2] + ".");
  }

  if (oxen === 0) {
    alert("That was your last ox. This is as far as you can go. Good luck homesteading!");
    throw new gameOver();
  }
};

var findItems = function() {
  var foundItems = [["food", 50, "pounds of food"],["oxen", 2, "oxen"],["money", 50, "dollars"],["parts", 1, "spare part"],["money", 100, "dollars"]]
  var itemIndex = Math.floor(Math.random() * foundItems.length);
  window[foundItems[itemIndex][0]] += foundItems[itemIndex][1];
  alert("You found an abandoned wagon on the trail. After looking around, you found " + foundItems[itemIndex][1] + " " + foundItems[itemIndex][2] + ".");
};

var findBerries = function() {
  daysWithoutFood = 0;
  food += 3*(Math.floor(Math.random() * (10 - 1 + 1)) + 1);
  alert("You found wild berries.");
};

var brokenWagon = function() {
  if (parts > 0) {
    parts -= 1;
    days++;
    trailDays++;
    food -= (peopleHealthy.length + peopleSick.length);
    alert("Your wagon broke, but you repaired it.");
  } else {
    alert("Your wagon broke, and you don't have any spare parts to fix it. This is as far as you can go. Good luck homesteading!");
    throw new gameOver();
  }
};

var getLost = function() {
  howLong = Math.floor(Math.random() * (5 - 1 + 1)) + 1;
  days += howLong;
  trailDays += howLong;
  food -= howLong*(peopleHealthy.length + peopleSick.length);
  if (howLong === 1) {
    alert("You lost the trail. You wasted 1 day.");
  } else {
    alert("You lost the trail. You wasted " + howLong + " days.");
  }
};

var starve = function() {
  if (daysWithoutFood === 1) {
    alert("You have run out of food.");
  } else if (daysWithoutFood % 2 === 0 && peopleHealthy.length > 0) {
    if (peopleHealthy.length === 1) {
      if (fate % 2 === 0) {
        sickness();
        alert("You are starving and are very weak.");
      }
    } else {
      if (fate % 2 === 0) {
        sickness();
        alert(invalid + " is starving and is very weak.");
      }
    }
  } else if (daysWithoutFood % 3 === 0 && fate % 2 === 0) {
    if (peopleHealthy.length + peopleSick.length === 1) {
      alert("You have died of starvation.");
      throw new gameOver();
    } else {
      death(peopleSick);
      alert(victim + " has died of starvation.");
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
      alert("You are feeling much better.");
    } else {
      recoveredPerson = peopleSick[recoveredIndex];
      peopleSick.splice(recoveredIndex, 1);
      peopleHealthy.push(recoveredPerson);
      alert(recoveredPerson + " is feeling much better.");
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
  if (status == "winner") {
    var bonus;
    if (profession = "farmer") {
      bonus = 400;
    } else if (profession = "carpenter") {
      bonus = 200;
    }
    var points = (peopleHealthy.length * 100) + (peopleSick.length * 50) + (oxen * 20) + (food * 2) + (parts * 2) + money + bonus - trailDays;
    alert("Congratulations, you reached the end of the trail! You finished the game with a score of " + points + ".");
  } else {
    alert("THE END");
  }
};



// LANDMARKS -----------------------------------------------------------------------------
var kansasRiver = function() {
  var depth;
  if (days < 92) {
    depth = 3;
  } else {
    depth = 4;
  }
  alert("Kansas River");
  crossRiver(depth, 2, 5);
};

var fortKearny = function() {
  alert("Fort Kearny");
  var getStuff = prompt("Do you want to buy or trade anything while you're here? Type 'yes' or 'no'.");
  if (getStuff == "yes") {
    if (money <= 0) {
      alert("You don't have any money, but you can try trading.");
      tradeItems(1);
    } else {
      var buyOrTrade = prompt("You have $" + money + " to spend. Do you want to use it to buy something, or do you want to try trading? Type 'buy' or 'trade'.");
      if (buyOrTrade == "buy") {
        goShopping();
      } else if (buyOrTrade == "trade") {
        tradeItems(1);
      }
    }
  }
};

var chimneyRock = function() {
  alert("Chimney Rock");
};

var fortLaramie = function() {
  alert("Fort Laramie");
  var getStuff = prompt("Do you want to buy or trade anything while you're here? Type 'yes' or 'no'.");
  if (getStuff == "yes") {
    if (money <= 0) {
      alert("You don't have any money, but you can try trading.");
      tradeItems(2);
    } else {
      var buyOrTrade = prompt("You have $" + money + " to spend. Do you want to use it to buy something, or do you want to try trading? Type 'buy' or 'trade'.");
      if (buyOrTrade == "buy") {
        goShopping();
      } else if (buyOrTrade == "trade") {
        tradeItems(2);
      }
    }
  }
};

var independenceRock = function() {
  alert("Independence Rock");
};

var southPass = function() {
  alert("South Pass");
};

var greenRiver = function() {
  alert("Green River");
  crossRiver(8, 8, 12);
};

var fortBridger = function() {
  alert("Fort Bridger");

  var getStuff = prompt("Do you want to buy or trade anything while you're here? Type 'yes' or 'no'.");
  if (getStuff == "yes") {
    if (money <= 0) {
      alert("You don't have any money, but you can try trading.");
      tradeItems(3);
    } else {
      var buyOrTrade = prompt("You have $" + money + " to spend. Do you want to use it to buy something, or do you want to try trading? Type 'buy' or 'trade'.");
      if (buyOrTrade == "buy") {
        goShopping();
      } else if (buyOrTrade == "trade") {
        tradeItems(3);
      }
    }
  }
};

var sodaSprings = function() {
  alert("Soda Springs");
};

var fortHall = function() {
  alert("Fort Hall");
  var getStuff = prompt("Do you want to buy or trade anything while you're here? Type 'yes' or 'no'.");
  if (getStuff == "yes") {
    if (money <= 0) {
      alert("You don't have any money, but you can try trading.");
      tradeItems(2);
    } else {
      var buyOrTrade = prompt("You have $" + money + " to spend. Do you want to use it to buy something, or do you want to try trading? Type 'buy' or 'trade'.");
      if (buyOrTrade == "buy") {
        goShopping();
      } else if (buyOrTrade == "trade") {
        tradeItems(2);
      }
    }
  }
};

var snakeRiver = function() {
  alert("Snake River");
  crossRiver(5, 5, 7);
};

var fortBoise = function() {
  alert("Fort Boise");

  var getStuff = prompt("Do you want to buy or trade anything while you're here? Type 'yes' or 'no'.");
  if (getStuff == "yes") {
    if (money <= 0) {
      alert("You don't have any money, but you can try trading.");
      tradeItems(1);
    } else {
      var buyOrTrade = prompt("You have $" + money + " to spend. Do you want to use it to buy something, or do you want to try trading? Type 'buy' or 'trade'.");
      if (buyOrTrade == "buy") {
        goShopping();
      } else if (buyOrTrade == "trade") {
        tradeItems(1);
      }
    }
  }
};

var fortWallaWalla = function() {
  alert("Fort Walla Walla");

  var getStuff = prompt("Do you want to buy or trade anything while you're here? Type 'yes' or 'no'.");
  if (getStuff == "yes") {
    if (money <= 0) {
      alert("You don't have any money, but you can try trading.");
      tradeItems(1);
    } else {
      var buyOrTrade = prompt("You have $" + money + " to spend. Do you want to use it to buy something, or do you want to try trading? Type 'buy' or 'trade'.");
      if (buyOrTrade == "buy") {
        goShopping();
      } else if (buyOrTrade == "trade") {
        tradeItems(1);
      }
    }
  }
};

var theDalles = function() {
  alert("The Dalles");
};

var oregonCity = function() {
  alert("Oregon City");
  throw new gameOver("winner");
};



// MAP -----------------------------------------------------------------------------------
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
      alert("Sorry, you didn't enter your desired location correctly. You'll stay on the trail and go to Fort Bridger.");
      mapLocation === "Fort Bridger";
    }
    if (mapLocation == "Fort Bridger") {
      miles -= 105;
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
      alert("Sorry, you didn't enter your desired location correctly. You'll stay on the trail and go to Fort Walla Walla.");
      mapLocation === "Fort Walla Walla";
    }
    if (mapLocation == "Fort Walla Walla") {
      miles -= 150;
    }
  } else if (distance === 1710) {
    if (mapLocation == "Fort Walla Walla") {
      fortWallaWalla();
    } else if (mapLocation == "The Dalles") {
      theDalles();
    }
  } else if (distance === 1845) {
    mapLocation = "Oregon City";
    oregonCity();
  }
};



// THE OREGON TRAIL ----------------------------------------------------------------------
var theOregonTrail = function() {
  gameSetup();
  for (miles = 0; miles <= 1845; miles += 15) {
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

    // HUNTING
    if (fate < 3 && days % 3 === 0) {
      var hunt = prompt("You're in an area with a lot of wildlife. You currently have " + food + " pounds of food, which will last about " + Math.floor(food/(peopleHealthy.length + peopleSick.length)) + " days. Do you want to go hunting for more food? Type 'yes' or 'no'.");
      if (hunt == "yes") {
        goHunting();
      }
    }

    // SICKNESS/INJURY
    if (fate % 4 === 0 && days % 4 === 0) {
      var healthIssues = ["the flu", "cholera", "exhaustion", "typhoid fever", "a snake bite", "a broken arm", "a broken leg"];
      var issue = healthIssues[Math.floor(Math.random() * healthIssues.length)];
      var daysOfRest;

      if (peopleHealthy.length > 1) {
        sickness();
        alert(invalid + " has " + issue + ".");
        var restOption = prompt("Do you want to rest to see if "+ invalid + " feels better? Type 'yes' or 'no'.");
        if (restOption == "yes" ) {
          daysOfRest = +prompt("How many days would you like to rest? Type a number.");
          rest(daysOfRest);
        }
      } else {
        sickness();
        alert("You have " + issue + ".");
        var restOption = prompt("Do you want to rest to see if you feel better? Type 'yes' or 'no'.");
        if (restOption == "yes" ) {
          daysOfRest = +prompt("How many days would you like to rest? Type a number.");
          rest(daysOfRest);
        }
      }
    }

    // DEATH OF SICK/INJURED
    if (fate === 10) {
      var diseases = ["a fever", "dysentery", "an infection", "dehydration"];
      var fatality = diseases[Math.floor(Math.random() * diseases.length)];

      if (peopleSick.length === 1 && peopleSick.indexOf(mainPlayer) === 0) {
        alert("You have died of " + fatality);
        throw new gameOver();
      } else if (peopleSick.length > 0) {
        victim = peopleSick.pop();
        alert(victim + " has died of " + fatality + ".");
      }
    }

    // WEATHER
    if (fate == 3 && days % 2 === 0) {
      var lostDays;
      if (days < 122 || (days > 306 && days < 487) || days > 671) {
        lostDays = Math.floor(Math.random() * (4 - 2 + 1)) + 1;
        snow(lostDays);
      } else if ((days > 122 && days < 153) || (days > 487 && days < 518)) {
        lostDays = Math.floor(Math.random() * (3 - 1 + 1)) + 1;
        storm(lostDays);
      }
    }

    // GREAT AMERICAN DESERT
    if (fate === 9 && days % 2 === 0 && (days < 122 || (days > 365 && days < 487)) && miles > 300 && miles < 645) {
      noGrass();
    }

    // GOOD THINGS
    if (fate === 7 && days % 2 === 1) {
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
    }

    // BAD THINGS
    if (fate === 6 && days % 2 === 1) {
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

    // DAILY STATUS UPDATE
    alert(dateFrom1836(days).toDateString()
    + "\n-----------------"
    + "\nDays on the trail: " + trailDays
    + "\nMiles: " + miles
    + "\nMoney: " + money
    + "\nFood: " + food
    + "\nOxen: " + oxen
    + "\nParts: " + parts
    + "\nPeople healthy: " + peopleHealthy
    + "\nPeople sick: " + peopleSick
    );
  }
};



// PLAY THE GAME!
theOregonTrail();
